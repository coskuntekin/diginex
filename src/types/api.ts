export interface ApiResponse<T = unknown> {
  data: T;
  message?: string;
  success: boolean;
  status?: number;
}

export interface ApiError {
  message: string;
  status: number;
  code?: string;
  data?: unknown;
  errors?: Record<string, string[]>;
}

export interface apiError {
  message: string;
  code: number;
}

export interface BaseEntity {
  id: string;
  createdAt: number;
  updatedAt: number;
  token: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
}

export interface RegisterResponse {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  role: string;
  createdAt: number;
  updatedAt: number;
}

export interface User extends BaseEntity {
  username: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  role: string;
}

export interface CreateUserRequest {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role?: string;
}

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
}
