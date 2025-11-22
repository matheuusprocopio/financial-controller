export const isBrowser = typeof window !== "undefined";

export const setCookie = (name: string, value: string, days = 365) => {
  if (!isBrowser) return;
  const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString();
  document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; expires=${expires}; path=/`;
};

export const getCookie = (name: string): string | null => {
  if (!isBrowser) return null;
  const cookies = document.cookie ? document.cookie.split("; ") : [];
  for (const cookie of cookies) {
    const [cookieName, ...rest] = cookie.split("=");
    if (decodeURIComponent(cookieName) === name) {
      return decodeURIComponent(rest.join("="));
    }
  }
  return null;
};

export const deleteCookie = (name: string) => {
  if (!isBrowser) return;
  document.cookie = `${encodeURIComponent(name)}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
};
