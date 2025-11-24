import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const SESSION_COOKIE = "financialcontroller_session_id";
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export async function middleware(req: NextRequest) {
  
  const sessionId = req.cookies.get(SESSION_COOKIE)?.value;

  if (!sessionId) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  try {
    const response = await fetch(`${API_BASE}/auth/validate`, {
      method: "GET",
      headers: { "X-Session-Id": sessionId },
      cache: "no-store",
    });

    if (!response.ok) {
      const redirectResponse = NextResponse.redirect(new URL("/", req.url));
      redirectResponse.cookies.delete(SESSION_COOKIE);
      return redirectResponse;
    }

    const data = await response.json();
    if (!data?.success) {
      const redirectResponse = NextResponse.redirect(new URL("/", req.url));
      redirectResponse.cookies.delete(SESSION_COOKIE);
      return redirectResponse;
    }

    return NextResponse.next();
  } catch (error) {
    console.error("Erro ao validar sessão no middleware:", error);
    const redirectResponse = NextResponse.redirect(new URL("/", req.url));
    redirectResponse.cookies.delete(SESSION_COOKIE);
    return redirectResponse;
  }
}

export const config = {
  matcher: ["/chat/:path*"],
};
