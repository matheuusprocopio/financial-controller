import { NextRequest, NextResponse } from "next/server";

const COOKIE_NAME = "financialcontroller_user_id";
const DEFAULT_MAX_AGE_SECONDS = 365 * 24 * 60 * 60;

export async function GET(request: NextRequest) {
  const value = request.cookies.get(COOKIE_NAME)?.value ?? null;
  return NextResponse.json({ userId: value });
}

interface CookiePayload {
  userId?: string;
  maxAgeDays?: number;
}

export async function POST(request: Request) {
  const { userId, maxAgeDays }: CookiePayload = await request.json();

  if (!userId) {
    return NextResponse.json(
      { success: false, message: "userId é obrigatório" },
      { status: 400 }
    );
  }

  const response = NextResponse.json({ success: true, userId });
  response.cookies.set({
    name: COOKIE_NAME,
    value: userId,
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
