import { CreateUserType, UpdateUserType, UserType } from "@/types/user.type";
import newRequestProvider from "@/utils/requestProvider";

const BASE_URL: string = process.env.NEXT_PUBLIC_API_URL as string;

const provider = newRequestProvider(`${BASE_URL}`);

const withSession = (sessionId: string | undefined) =>
  sessionId ? { headers: { "X-Session-Id": sessionId } } : {};

export const listUsers = async (sessionId: string) => {
  return await provider.get<UserType[]>("users", { ...withSession(sessionId) });
};

export const getUserById = async (userId: string, sessionId: string) => {
  return await provider.get<UserType>(`users/${userId}`, {
    ...withSession(sessionId),
  });
};

export const createUser = async (payload: CreateUserType, sessionId: string) => {
  return await provider.post<UserType, CreateUserType>("users", {
    body: payload,
    headers: {
      "X-Session-Id": sessionId,
    },
  });
};

export const updateUser = async (
  userId: string,
  payload: UpdateUserType,
  sessionId: string
  ) => {
  return await provider.put<UserType, UpdateUserType>(`users/${userId}`, {
    body: payload,
    headers: {
      "X-Session-Id": sessionId,
    },
  });
};

export const deleteUser = async (userId: string, sessionId: string) => {
  return await provider.delete(`users/${userId}`, {
    headers: {
      "X-Session-Id": sessionId,
    },
  });
};
