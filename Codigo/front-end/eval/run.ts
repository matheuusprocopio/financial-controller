/**
 * Offline evaluation of the financial agent.
 *
 * Sends each dataset message to the same model, system prompt and tool schemas used
 * in production, but with the tools' `execute` stripped: the model only *chooses* a
 * tool and its arguments, nothing touches the database. We then score that choice.
 *
 *   bun run eval -- --label baseline [--runs 3] [--tag create_item] [--budget 1.5] [--rpm 3] [--dataset holdout]
 *
 * --budget (USD) stops launching new calls once the estimated spend reaches it.
 * --rpm spaces out calls to stay under the account's requests-per-minute limit.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { openai } from "@ai-sdk/openai";
import { generateText, type Tool } from "ai";

import { AGENT_MODEL } from "@/lib/agent/model";
import { buildSystemPrompt } from "@/lib/agent/systemPrompt";
import { tools } from "@/lib/tools";
import { buildDataset, buildHoldoutDataset, type Check, type EvalCase } from "./dataset";
import { createDateHelpers, localIsoDate } from "./dates";

const CONCURRENCY = 4;

// USD per 1M tokens (standard list price). Estimates only — the OpenAI
// dashboard is the source of truth for what was actually billed.
const PRICE = { input: 5, cachedInput: 0.5, output: 30 };

type ArgResult = { name: string; ok: boolean; got: unknown };
type RunResult = {
  ok: boolean;
  toolOk: boolean;
  toolName: string | null;
  /** Every tool the model called, in order — shows e.g. one call per transaction. */
  toolCalls?: string[];
  args: ArgResult[];
  text: string;
  costUsd: number;
  tokens?: { input: number; cached: number; output: number };
  error?: string;
  skipped?: boolean;
};

const parseFlags = () => {
  const argv = process.argv.slice(2);
  const flag = (name: string) => {
    const i = argv.indexOf(`--${name}`);
    return i >= 0 ? argv[i + 1] : undefined;
  };
  return {
    label: flag("label") ?? "run",
    runs: Number(flag("runs") ?? 1),
    tag: flag("tag"),
    budget: Number(flag("budget") ?? Infinity),
    rpm: flag("rpm") ? Number(flag("rpm")) : undefined,
    datasetName: flag("dataset") ?? "main",
  };
};

const normalize = (value: unknown) =>
  String(value ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");

const checkArg = (check: Check, value: unknown): boolean => {
  if ("eq" in check) return value === check.eq;
  if ("approx" in check) return typeof value === "number" && Math.abs(value - check.approx) < 0.01;
  if ("has" in check) return check.has.some((kw) => normalize(value).includes(normalize(kw)));
  if ("date" in check) {
    const v = typeof value === "string" && value.trim() ? value.trim().slice(0, 10) : undefined;
    return check.date.includes(v);
  }
  if ("includes" in check) return Array.isArray(value) && value.includes(check.includes);
  if ("items" in check) {
    if (!Array.isArray(value) || value.length !== check.items.length) return false;
    // Greedy pairing: fine because the expected entries of a case have distinct amounts.
    const unmatched = [...value] as Record<string, unknown>[];
    return check.items.every((expected) => {
      const i = unmatched.findIndex(
        (got) => !!got && Object.entries(expected).every(([name, c]) => checkArg(c, got[name])),
      );
      if (i < 0) return false;
      unmatched.splice(i, 1);
      return true;
    });
  }
  return typeof value === "string" && value.startsWith(check.startsWith);
};

// Same schemas the model sees in production, minus the side effects.
const schemaOnlyTools = Object.fromEntries(
  Object.entries(tools).map(([name, t]) => [name, { ...(t as Tool), execute: undefined }]),
) as Record<string, Tool>;

type Usage = { inputTokens?: number; cachedInputTokens?: number; outputTokens?: number };

const estimateCost = ({ inputTokens = 0, cachedInputTokens = 0, outputTokens = 0 }: Usage) =>
  ((inputTokens - cachedInputTokens) * PRICE.input +
    cachedInputTokens * PRICE.cachedInput +
    outputTokens * PRICE.output) /
  1_000_000;

const runCase = async (c: EvalCase): Promise<RunResult> => {
  let costUsd = 0;
  try {
    const result = await generateText({
      model: openai(AGENT_MODEL),
      system: buildSystemPrompt(),
      tools: schemaOnlyTools,
      prompt: c.input,
      maxRetries: 5,
    });
    costUsd = estimateCost(result.totalUsage);
    const tokens = {
      input: result.totalUsage.inputTokens ?? 0,
      cached: result.totalUsage.cachedInputTokens ?? 0,
      output: result.totalUsage.outputTokens ?? 0,
    };

    const toolCalls = result.toolCalls.map((tc) => tc.toolName);
    const call = result.toolCalls[0];
    const toolName = call?.toolName ?? null;
    const input = (call?.input ?? {}) as Record<string, unknown>;

    if ("noTool" in c.expect) {
      const ok = toolName === null;
      return { ok, toolOk: ok, toolName, toolCalls, args: [], text: result.text, costUsd, tokens };
    }

    const toolOk = toolName !== null && c.expect.tool.includes(toolName);
    const args = toolOk
      ? Object.entries(c.expect.args ?? {}).map(([name, check]) => ({
          name,
          ok: checkArg(check, input[name]),
          got: input[name],
        }))
      : [];

    return { ok: toolOk && args.every((a) => a.ok), toolOk, toolName, toolCalls, args, text: result.text, costUsd, tokens };
  } catch (error) {
    return { ok: false, toolOk: false, toolName: null, args: [], text: "", costUsd, error: String(error) };
  }
};

const mapWithConcurrency = async <T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>) => {
  const results: R[] = new Array(items.length);
  let next = 0;
  const worker = async () => {
    while (next < items.length) {
      const i = next++;
      results[i] = await fn(items[i]);
    }
  };
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
};

const pct = (num: number, den: number) => (den === 0 ? "-" : `${((100 * num) / den).toFixed(1)}%`);

const main = async () => {
  const { label, runs, tag, budget, rpm, datasetName } = parseFlags();
  if (!process.env.OPENAI_API_KEY) {
    // Bun only loads .env.local from the current directory.
    console.error("OPENAI_API_KEY is not set. Run the eval from Codigo/front-end.");
    process.exit(1);
  }
  const today = localIsoDate();
  const build = datasetName === "holdout" ? buildHoldoutDataset : buildDataset;
  const dataset = build(createDateHelpers(today)).filter((c) => !tag || c.tag === tag);

  console.log(`Model ${AGENT_MODEL} · ${datasetName} · ${dataset.length} cases × ${runs} run(s) · today ${today}\n`);

  // Run-major order: every case once, then again. If the budget runs out, whole
  // repetitions are dropped instead of the cases at the end of the dataset.
  const jobs = Array.from({ length: runs }, () => dataset).flat();
  let spent = 0;
  // With an RPM cap, calls run one at a time with a fixed gap between starts.
  const gapMs = rpm ? Math.ceil(60_000 / rpm) + 500 : 0;
  let nextStart = 0;
  let done = 0;
  const flat = await mapWithConcurrency(jobs, rpm ? 1 : CONCURRENCY, async (c): Promise<RunResult> => {
    if (gapMs) {
      const wait = nextStart - Date.now();
      if (wait > 0) await new Promise((resolve) => setTimeout(resolve, wait));
      nextStart = Date.now() + gapMs;
    }
    if (spent >= budget) {
      return { ok: false, toolOk: false, toolName: null, args: [], text: "", costUsd: 0, skipped: true };
    }
    const r = await runCase(c);
    spent += r.costUsd;
    done++;
    const t = r.tokens ? ` in=${r.tokens.input} cached=${r.tokens.cached} out=${r.tokens.output}` : "";
    console.log(`[${done}/${jobs.length}] ${r.ok ? "✓" : "✗"} ${c.id} → ${r.error ? "error" : (r.toolName ?? "no tool")}${t} · $${spent.toFixed(3)}`);
    return r;
  });
  const perCase = dataset.map((c, i) => ({
    case: c,
    runs: flat.filter((r, j) => j % dataset.length === i && !r.skipped),
  }));

  // Cases skipped by the budget guard are left out of every score.
  const all = perCase.flatMap((p) => p.runs);
  const skipped = flat.filter((r) => r.skipped).length;
  const errors = all.filter((r) => r.error).length;

  const byTag = new Map<string, RunResult[]>();
  for (const p of perCase) byTag.set(p.case.tag, [...(byTag.get(p.case.tag) ?? []), ...p.runs]);

  const byField = new Map<string, boolean[]>();
  for (const r of all) for (const a of r.args) byField.set(a.name, [...(byField.get(a.name) ?? []), a.ok]);

  const summary = {
    cases: pct(all.filter((r) => r.ok).length, all.length),
    toolSelection: pct(all.filter((r) => r.toolOk).length, all.length),
    byTag: Object.fromEntries(
      [...byTag].map(([t, rs]) => [t, pct(rs.filter((r) => r.ok).length, rs.length)]),
    ),
    byField: Object.fromEntries(
      [...byField].map(([f, oks]) => [f, `${pct(oks.filter(Boolean).length, oks.length)} (n=${oks.length})`]),
    ),
    errors,
    skipped,
    estimatedCostUsd: Number(spent.toFixed(4)),
    costPerCallUsd: all.length ? Number((spent / all.length).toFixed(4)) : 0,
  };

  console.log(`Overall pass rate:  ${summary.cases}`);
  console.log(`Tool selection:     ${summary.toolSelection}`);
  console.log(`API errors:         ${errors}`);
  console.log(`Skipped (budget):   ${skipped}`);
  console.log(`Estimated cost:     $${summary.estimatedCostUsd} ($${summary.costPerCallUsd}/call)\n`);
  console.table(summary.byTag);
  console.table(summary.byField);

  const failures = perCase.filter((p) => p.runs.some((r) => !r.ok));
  if (failures.length) {
    console.log("\nFailures:");
    for (const { case: c, runs: rs } of failures) {
      const r = rs.find((x) => !x.ok)!;
      const why = r.error
        ? `error: ${r.error.slice(0, 120)}`
        : !r.toolOk
          ? `tool=${r.toolCalls?.length ? r.toolCalls.join("+") : "none"}${r.text ? ` text="${r.text.slice(0, 80).replace(/\s+/g, " ")}"` : ""}`
          : r.args
              .filter((a) => !a.ok)
              .map((a) => `${a.name}=${JSON.stringify(a.got)}`)
              .join(", ");
      console.log(`  ✗ [${c.tag}] ${c.id} (${rs.filter((x) => x.ok).length}/${rs.length}) — ${why}`);
    }
  }

  const outDir = join(dirname(fileURLToPath(import.meta.url)), "results");
  mkdirSync(outDir, { recursive: true });
  const outFile = join(outDir, `${label}.json`);
  writeFileSync(
    outFile,
    JSON.stringify({ label, dataset: datasetName, model: AGENT_MODEL, today, runs, summary, cases: perCase }, null, 2),
  );
  console.log(`\nSaved ${outFile}`);

  // API failures make the scores meaningless; surface them in the exit code.
  if (errors > 0) process.exitCode = 1;
};

main();
