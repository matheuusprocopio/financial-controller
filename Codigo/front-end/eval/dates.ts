// Date helpers anchored on the user's local day (America/Sao_Paulo), so that
// expectations like "ontem" resolve the same way a Brazilian user means them.

export const TIME_ZONE = "America/Sao_Paulo";

const pad = (n: number) => String(n).padStart(2, "0");

const toIso = (d: Date) =>
  `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;

export const localIsoDate = (now: Date = new Date()) =>
  new Intl.DateTimeFormat("en-CA", { timeZone: TIME_ZONE }).format(now);

export const createDateHelpers = (todayIso: string) => {
  const [year, month, day] = todayIso.split("-").map(Number);
  const at = (y: number, m: number, d: number) => toIso(new Date(Date.UTC(y, m - 1, d)));

  return {
    today: todayIso,
    year,
    daysAgo: (n: number) => at(year, month, day - n),
    firstOfMonth: (offset = 0) => at(year, month + offset, 1),
    lastOfMonth: (offset = 0) => at(year, month + offset + 1, 0),
    firstOfYear: () => at(year, 1, 1),
    /** "dd/mm" as a Brazilian user would type it. */
    ddmm: (iso: string) => `${iso.slice(8, 10)}/${iso.slice(5, 7)}`,
  };
};

export type DateHelpers = ReturnType<typeof createDateHelpers>;
