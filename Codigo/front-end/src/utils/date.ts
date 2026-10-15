export const USER_TIME_ZONE = "America/Sao_Paulo";

/** Today's date (YYYY-MM-DD) in the user's timezone, not UTC. */
export const getLocalIsoDate = (now: Date = new Date()) =>
  new Intl.DateTimeFormat("en-CA", { timeZone: USER_TIME_ZONE }).format(now);

export const getLocalWeekday = (now: Date = new Date()) =>
  new Intl.DateTimeFormat("en-US", { timeZone: USER_TIME_ZONE, weekday: "long" }).format(now);
