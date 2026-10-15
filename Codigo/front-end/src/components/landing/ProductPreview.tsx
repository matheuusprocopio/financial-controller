import { ArrowUp, Mic, Plus, Wallet } from "lucide-react";

const CONVERSATIONS = [
  { group: "Hoje", items: ["Gastos de outubro", "Planejamento da viagem"] },
  { group: "Ontem", items: ["Reserva de emergência"] },
  { group: "Últimos 7 dias", items: ["Fatura do cartão", "Revisão de assinaturas"] },
];

const SPENDING = [
  { label: "Moradia", value: 1900 },
  { label: "Alimentação", value: 1284 },
  { label: "Transporte", value: 420 },
  { label: "Lazer", value: 310 },
];

const maxSpending = Math.max(...SPENDING.map((item) => item.value));
const formatBRL = (value: number) =>
  value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

// Réplica estática da tela do app, usada como ilustração na landing
const ProductPreview = () => (
  <div
    className="overflow-hidden rounded-xl border border-white/10 bg-neutral-950 shadow-2xl shadow-black/50"
    aria-hidden="true"
  >
    <div className="flex h-9 items-center gap-1.5 border-b border-white/10 px-4">
      <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
      <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
      <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
    </div>

    <div className="flex h-[440px] sm:h-[520px]">
      <div className="hidden w-56 shrink-0 flex-col border-r border-white/10 md:flex">
        <div className="flex h-12 items-center gap-2 px-4">
          <div className="flex h-6 w-6 items-center justify-center rounded border border-white/15 bg-white/5">
            <Wallet className="h-3.5 w-3.5 text-neutral-300" />
          </div>
          <span className="text-sm font-medium text-neutral-200">FinancialController</span>
        </div>
        <div className="px-3">
          <div className="flex items-center gap-2 rounded-md border border-white/10 px-2.5 py-1.5 text-xs text-neutral-300">
            <Plus className="h-3.5 w-3.5 text-neutral-500" />
            Nova conversa
          </div>
        </div>
        <div className="mt-4 space-y-4 px-3">
          {CONVERSATIONS.map((group, groupIndex) => (
            <div key={group.group}>
              <p className="px-2.5 pb-1 text-[11px] text-neutral-600">{group.group}</p>
              {group.items.map((item, index) => (
                <p
                  key={item}
                  className={`truncate rounded-md px-2.5 py-1.5 text-xs ${
                    groupIndex === 0 && index === 0
                      ? "bg-white/10 text-neutral-100"
                      : "text-neutral-500"
                  }`}
                >
                  {item}
                </p>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex h-12 shrink-0 items-center border-b border-white/10 px-5 text-sm text-neutral-300">
          Gastos de outubro
        </div>

        <div className="flex-1 space-y-6 overflow-hidden px-5 py-6 sm:px-10">
          <div className="hidden justify-end sm:flex">
            <p className="rounded-2xl bg-neutral-800 px-3.5 py-2 text-sm text-neutral-100">
              Gastei R$ 42,90 no mercado hoje
            </p>
          </div>

          <div className="hidden gap-3 sm:flex">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded border border-white/10 bg-white/5">
              <Wallet className="h-3 w-3 text-neutral-400" />
            </div>
            <p className="text-sm leading-6 text-neutral-300">
              Registrei <span className="text-neutral-100">R$ 42,90</span> em{" "}
              <span className="text-neutral-100">Alimentação</span>, com a data de hoje.
            </p>
          </div>

          <div className="flex justify-end">
            <p className="rounded-2xl bg-neutral-800 px-3.5 py-2 text-sm text-neutral-100">
              Onde mais gastei este mês?
            </p>
          </div>

          <div className="flex gap-3">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded border border-white/10 bg-white/5">
              <Wallet className="h-3 w-3 text-neutral-400" />
            </div>
            <div className="min-w-0 flex-1 rounded-lg border border-white/10 p-4">
              <p className="text-sm font-medium text-neutral-100">Gastos por categoria</p>
              <p className="text-xs text-neutral-500">Outubro</p>
              <div className="mt-4 space-y-2.5">
                {SPENDING.map((item) => (
                  <div key={item.label} className="grid grid-cols-[88px_1fr_auto] items-center gap-3 text-xs">
                    <span className="text-neutral-400">{item.label}</span>
                    <div className="h-2 rounded-sm bg-white/5">
                      <div
                        className="h-2 rounded-sm bg-[#3987e5]"
                        style={{ width: `${(item.value / maxSpending) * 100}%` }}
                      />
                    </div>
                    <span className="tabular-nums text-neutral-300">{formatBRL(item.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="shrink-0 px-5 pb-5 sm:px-10">
          <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-neutral-900 px-4 py-3">
            <span className="flex-1 truncate text-sm text-neutral-500">
              Pergunte ou registre algo…
            </span>
            <Mic className="h-4 w-4 text-neutral-500" />
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-neutral-100">
              <ArrowUp className="h-3.5 w-3.5 text-neutral-950" />
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default ProductPreview;
