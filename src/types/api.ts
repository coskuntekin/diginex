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
  createdAt?: number;
  updatedAt: number;
  publishedAt?: number;
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
  password: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  role?: string;
}

export interface UpdateUserRequest {
  username?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  role?: string;
}

export interface QueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  order?: string;
  token?: string;
}

export interface PaginatedResponse<T> {
  users?: T[];
  data?: T[];
  items?: T[];
  tweets?: T[];
  next?: string | null;
  prev?: string | null;
  total?: number;
  page?: number;
  limit?: number;
}

export interface TweetOwner {
  userId: string;
  username: string;
  firstName?: string;
  lastName?: string;
}

export interface Tweet extends BaseEntity {
  title: string;
  content: string;
  authorId?: string;
  author?: User;
  owner?: TweetOwner;
}

export interface CreateTweetRequest {
  title: string;
  content: string;
}

export interface UpdateTweetRequest {
  title?: string;
  content?: string;
}
