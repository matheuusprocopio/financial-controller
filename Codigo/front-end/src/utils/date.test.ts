import { describe, expect, test } from "bun:test";

import { getLocalIsoDate, getLocalWeekday } from "./date";

describe("getLocalIsoDate", () => {
  test("keeps the Brazilian day late at night, when UTC has already turned", () => {
    // 22:30 in São Paulo on Oct 15 is 01:30 UTC on Oct 16.
    const lateNight = new Date("2026-10-16T01:30:00Z");
    expect(lateNight.toISOString().slice(0, 10)).toBe("2026-10-16");
    expect(getLocalIsoDate(lateNight)).toBe("2026-10-15");
  });

  test("matches UTC during the day", () => {
    expect(getLocalIsoDate(new Date("2026-10-15T15:00:00Z"))).toBe("2026-10-15");
  });

  test("handles the year boundary", () => {
    expect(getLocalIsoDate(new Date("2027-01-01T02:00:00Z"))).toBe("2026-12-31");
  });
});

describe("getLocalWeekday", () => {
  test("uses the local day, not the UTC one", () => {
    expect(getLocalWeekday(new Date("2026-10-16T01:30:00Z"))).toBe("Thursday");
  });
});
