
const COOKIE_ENDPOINT = "/api/auth/session";

const fetchOptions: RequestInit = {
  credentials: "include",
  headers: { "Content-Type": "application/json" },
};

export const setCookie = async (_name: string, value: string, days = 365) => {
  await fetch(COOKIE_ENDPOINT, {
    ...fetchOptions,
    method: "POST",
    body: JSON.stringify({ userId: value, maxAgeDays: days }),
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

  const data = (await response.json()) as { userId?: string | null };
  return data.userId ?? null;
};

export const deleteCookie = async (_name: string) => {
  await fetch(COOKIE_ENDPOINT, {
    method: "DELETE",
    credentials: "include",
  });
};