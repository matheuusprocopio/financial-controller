import { getLocalIsoDate } from "@/utils/date";
import { RequestError } from "@/utils/requestProvider";

export const isRequestError = (resp: unknown): resp is RequestError => {
  return !!resp && typeof resp === "object" && "error" in (resp as Record<string, unknown>);
};

export const getTodayIsoDate = () => getLocalIsoDate();

export const MIN_MATCH_CONFIDENCE = 0.5;

export const resolveIsoDate = (value?: string | null, fallback?: string | null) => {
  const candidates = [value, fallback];
  let firstTrimmed: string | undefined;

  for (const candidate of candidates) {
    const trimmed = candidate?.trim();

    if (!trimmed) {
      continue;
    }

    if (!firstTrimmed) {
      firstTrimmed = trimmed;
    }

    const timestamp = Date.parse(trimmed);

    if (!Number.isNaN(timestamp)) {
      return new Date(timestamp).toISOString().split("T")[0];
    }
  }

  if (firstTrimmed) {
    return firstTrimmed;
  }

  return getTodayIsoDate();
};
