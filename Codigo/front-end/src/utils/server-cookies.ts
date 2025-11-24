"user-server";

import { cookies } from "next/headers";

const COOKIE_NAME = "financialcontroller_user_id";


//only works on server side
export const getFirebaseId = async (): Promise<string | undefined> => {
  const requestCookies = await cookies();

  const firebaseId = requestCookies.get(COOKIE_NAME)?.value;

  return firebaseId;
};
