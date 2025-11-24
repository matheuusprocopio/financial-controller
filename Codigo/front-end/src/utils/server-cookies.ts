"use server";

import { cookies } from "next/headers";

const COOKIE_NAME = "financialcontroller_session_id";

//only works on server side
export const getSessionId = async (): Promise<string | undefined> => {
  const requestCookies = await cookies();

  const sessionId = requestCookies.get(COOKIE_NAME)?.value;

  return sessionId;
};
