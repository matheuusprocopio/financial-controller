const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export interface UserData {
  id: string;
  name: string;
  email: string;
}

export const getUserByIdService = async (userId: string): Promise<UserData | null> => {
  const response = await fetch(`${API_BASE}/users/${userId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    if (response.status === 404) {
      return null;
    }
    const error = await response.json();
    throw new Error(error.message || "Erro ao buscar usuário");
  }

  return response.json();
};

export const updateUserService = async (userId: string, userData: { name: string; email: string }): Promise<UserData> => {
  const response = await fetch(`${API_BASE}/users/${userId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    const errorText = await response.text();
    try {
      const error = JSON.parse(errorText);
      throw new Error(error.message || "Erro ao atualizar usuário");
    } catch {
      throw new Error(errorText || "Erro ao atualizar usuário");
    }
  }

  const result = await response.json();
  return result;
};

export const deleteUserService = async (userId: string): Promise<void> => {
  const response = await fetch(`${API_BASE}/users/${userId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Erro ao deletar usuário");
  }
};

export const createUserService = async (user: Omit<UserData, 'id'>): Promise<UserData> => {
  const response = await fetch(`${API_BASE}/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(user),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Erro ao criar usuário");
  }

  return response.json();
};

export const getAllUsersService = async (): Promise<UserData[]> => {
  const response = await fetch(`${API_BASE}/users`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Erro ao buscar usuários");
  }

  return response.json();
};
