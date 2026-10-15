import { describe, expect, test } from "bun:test";

import { createDateHelpers } from "./dates";

describe("createDateHelpers", () => {
  test("relative days cross month boundaries", () => {
    const d = createDateHelpers("2026-03-01");
    expect(d.daysAgo(1)).toBe("2026-02-28");
    expect(d.daysAgo(2)).toBe("2026-02-27");
  });

  test("last month wraps around the year", () => {
    const d = createDateHelpers("2026-01-15");
    expect(d.firstOfMonth(-1)).toBe("2025-12-01");
    expect(d.lastOfMonth(-1)).toBe("2025-12-31");
  });

  test("formats dd/mm like a Brazilian user types it", () => {
    expect(createDateHelpers("2026-10-15").ddmm("2026-04-07")).toBe("07/04");
  });
});
