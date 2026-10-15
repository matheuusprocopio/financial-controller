import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const SESSION_COOKIE = "financialcontroller_session_id";
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

type RedirectReason = "expired" | "unavailable";

// Volta para a home com o login aberto; `reason` explica ao usuário por que ele precisa entrar de novo
const redirectToLogin = (req: NextRequest, reason?: RedirectReason) => {
  const url = new URL("/", req.url);
  url.searchParams.set("login", "true");
  if (reason) url.searchParams.set("session", reason);

  const redirectResponse = NextResponse.redirect(url);
  redirectResponse.cookies.delete(SESSION_COOKIE);
  return redirectResponse;
};

const isSessionValid = async (sessionId: string) => {
  const response = await fetch(`${API_BASE}/auth/validate`, {
    method: "GET",
    headers: { "X-Session-Id": sessionId },
    cache: "no-store",
  });

  if (!response.ok) return false;

  const data = await response.json();

  return Boolean(data?.success);
};

const isChatValidForUser = async (chatId: string, sessionId: string) => {
  try {
    const response = await fetch(`${API_BASE}/chats/${chatId}`, {
      method: "GET",
      headers: { "X-Session-Id": sessionId },
      cache: "no-store",
    });

    return response.ok;
  } catch (error) {
    console.error("Erro ao validar chat no middleware:", error);
    return false;
  }
};

const fetchMostRecentChatId = async (sessionId: string) => {
  try {
    const response = await fetch(`${API_BASE}/chats?page=1&size=1`, {
      method: "GET",
      headers: { "X-Session-Id": sessionId },
      cache: "no-store",
    });

    if (!response.ok) return null;

    const data = await response.json();
    const latestChatId = data?.data?.[0]?.id;

    return typeof latestChatId === "string" ? latestChatId : null;
  } catch (error) {
    console.error("Erro ao buscar chat mais recente no middleware:", error);
    return null;
  }
};

export async function middleware(req: NextRequest) {
  const sessionId = req.cookies.get(SESSION_COOKIE)?.value;

  if (!sessionId) {
    return redirectToLogin(req);
  }

  try {
    const sessionValid = await isSessionValid(sessionId);
    if (!sessionValid) return redirectToLogin(req, "expired");

    const chatId = req.nextUrl.searchParams.get("chat_id");

    if (chatId) {
      const chatIsValid = await isChatValidForUser(chatId, sessionId);

      if (!chatIsValid) {
        const mostRecentChatId = await fetchMostRecentChatId(sessionId);

        if (mostRecentChatId && mostRecentChatId !== chatId) {
          const redirectUrl = req.nextUrl.clone();
          redirectUrl.searchParams.set("chat_id", mostRecentChatId);
          return NextResponse.redirect(redirectUrl);
        }
      }
    }

    return NextResponse.next();
  } catch (error) {
    console.error("Erro ao validar sessão no middleware:", error);
    return redirectToLogin(req, "unavailable");
  }
}

export const config = {
  matcher: ["/chat/:path*"],
};
