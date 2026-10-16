import { describe, expect, test } from "bun:test";

import { getLocalIsoDate } from "@/utils/date";
import { resolveIsoDate } from "./shared";

describe("resolveIsoDate", () => {
  test("keeps a valid ISO date as is", () => {
    expect(resolveIsoDate("2026-10-14")).toBe("2026-10-14");
  });

  test("drops the time part of a full timestamp", () => {
    expect(resolveIsoDate("2026-10-14T15:00:00Z")).toBe("2026-10-14");
  });

  test("falls back to the second candidate when the first is empty", () => {
    expect(resolveIsoDate("  ", "2026-01-31")).toBe("2026-01-31");
  });

  test("uses the user's local today when nothing is given", () => {
    expect(resolveIsoDate(undefined)).toBe(getLocalIsoDate());
  });

  test("returns unparseable input untouched so the form can show it", () => {
    expect(resolveIsoDate("ontem")).toBe("ontem");
  });
});
