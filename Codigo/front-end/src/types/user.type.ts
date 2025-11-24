export type UserType = {
  id: string;
  name: string;
  email: string;
};

export type CreateUserType = {
  name: string;
  email: string;
};

export type UpdateUserType = Partial<CreateUserType>;
