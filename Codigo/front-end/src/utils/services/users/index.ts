import { CreateUserType, UpdateUserType, UserType } from "@/types/user.type";
import newRequestProvider from "@/utils/requestProvider";

const BASE_URL: string = process.env.NEXT_PUBLIC_SERVICE_API_BASE_URL as string;

const provider = newRequestProvider(`${BASE_URL}`);

export const listUsers = async () => {
  return await provider.get<UserType[]>("users");
};

export const getUserById = async (userId: string) => {
  return await provider.get<UserType>(`users/${userId}`);
};

export const createUser = async (payload: CreateUserType) => {
  return await provider.post<UserType, CreateUserType>("users", {
    body: payload,
  });
};

export const updateUser = async (userId: string, payload: UpdateUserType) => {
  return await provider.put<UserType, UpdateUserType>(`users/${userId}`, {
    body: payload,
  });
};

export const deleteUser = async (userId: string) => {
  return await provider.delete(`users/${userId}`);
};
