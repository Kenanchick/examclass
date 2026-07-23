import { apiClient } from "./http-client";

export type RegisterRequest = {
  name: string;
  email: string;
  password: string;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type UserRole = "STUDENT" | "TEACHER" | "ADMIN";

export type User = {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
};

export type AuthResponse = {
  accessToken: string;
  user: User;
};

export type ApiErrorResponse = {
  message?: string | string[];
};

export async function register(data: RegisterRequest) {
  const response = await apiClient.post<AuthResponse>("/auth/register", data);

  return response.data;
}

export async function login(data: LoginRequest) {
  const response = await apiClient.post<AuthResponse>("/auth/login", data);

  return response.data;
}

export async function getCurrentUser() {
  const response = await apiClient.get<User>("/auth/me");

  return response.data;
}
