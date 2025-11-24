import { NextRequest, NextResponse } from "next/server";

const COOKIE_NAME = "financialcontroller_session_id";
const DEFAULT_MAX_AGE_SECONDS = 365 * 24 * 60 * 60;

export async function GET(request: NextRequest) {
  const value = request.cookies.get(COOKIE_NAME)?.value ?? null;
  return NextResponse.json({ sessionId: value });
}

interface CookiePayload {
  sessionId?: string;
  maxAgeDays?: number;
}

export async function POST(request: Request) {
  const { sessionId, maxAgeDays }: CookiePayload = await request.json();

  if (!sessionId) {
    return NextResponse.json(
      { success: false, message: "sessionId é obrigatório" },
      { status: 400 }
    );
  }

  const response = NextResponse.json({ success: true, sessionId });
  response.cookies.set({
    name: COOKIE_NAME,
    value: sessionId,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: maxAgeDays
      ? Math.round(maxAgeDays * 24 * 60 * 60)
      : DEFAULT_MAX_AGE_SECONDS,
  });

  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.set({
    name: COOKIE_NAME,
    value: "",
    maxAge: 0,
    path: "/",
  });
  return response;
}
