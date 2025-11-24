
const COOKIE_ENDPOINT = "/api/auth/session";

const fetchOptions: RequestInit = {
  credentials: "include",
  headers: { "Content-Type": "application/json" },
};

export const setCookie = async (_name: string, value: string, days = 365) => {
  await fetch(COOKIE_ENDPOINT, {
    ...fetchOptions,
    method: "POST",
    body: JSON.stringify({ sessionId: value, maxAgeDays: days }),
  });
};

export const getCookie = async (_name: string): Promise<string | null> => {
  const response = await fetch(COOKIE_ENDPOINT, {
    credentials: "include",
    cache: "no-store",
  });

  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as { sessionId?: string | null };
  return data.sessionId ?? null;
};

export const deleteCookie = async (_name: string) => {
  await fetch(COOKIE_ENDPOINT, {
    method: "DELETE",
    credentials: "include",
  });
};
