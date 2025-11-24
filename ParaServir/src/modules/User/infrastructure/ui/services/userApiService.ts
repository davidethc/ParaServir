import { apiClient } from "@/shared/lib/api-client";

export interface CreateUserRequest {
  id: string;
  name: string;
  email: string;
  password: string;
  role: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    isVerified: boolean;
  };
}

export interface UserResponse {
  id: string;
  name: string;
  email: string;
  role: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export class UserApiService {
  async createUser(data: CreateUserRequest): Promise<{ message: string }> {
    return apiClient.post("/api/users", data);
  }

  async login(data: LoginRequest): Promise<LoginResponse> {
    return apiClient.post<LoginResponse>("/api/users/login", data);
  }

  async getAllUsers(): Promise<UserResponse[]> {
    return apiClient.get<UserResponse[]>("/api/users");
  }

  async getUserById(id: string): Promise<UserResponse> {
    return apiClient.get<UserResponse>(`/api/users/${id}`);
  }

  async updateUser(id: string, data: Partial<CreateUserRequest>): Promise<{ message: string }> {
    return apiClient.put(`/api/users/${id}`, data);
  }

  async deleteUser(id: string): Promise<{ message: string }> {
    return apiClient.delete(`/api/users/${id}`);
  }

  // Recuperación de contraseña
  async forgotPassword(email: string): Promise<{ message: string }> {
    return apiClient.post("/api/users/forgot-password", { email });
  }

  async verifyCode(email: string, code: string): Promise<{ message: string; token: string }> {
    return apiClient.post<{ message: string; token: string }>("/api/users/verify-code", { email, code });
  }

  async setPassword(token: string, password: string): Promise<{ message: string }> {
    return apiClient.post("/api/users/set-password", { token, password });
  }
}

export const userApiService = new UserApiService();
