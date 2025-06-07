import { BaseService } from "./baseService";
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  User,
} from "@/types/api";

export class AuthService extends BaseService {
  private readonly TOKEN_KEY = "authToken";
  private readonly USER_KEY = "currentUser";

  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await this.post<LoginResponse>("/login", credentials);

    this.setToken(response.token);
    this.setCurrentUser(response.user);

    return response;
  }

  async register(userData: RegisterRequest): Promise<RegisterResponse> {
    const response = await this.post<RegisterResponse>("/register", userData);

    return response;
  }

  async logout(): Promise<void> {
    this.clearAuth();
  }

  async updateProfile(userId: string, userData: Partial<User>): Promise<User> {
    const user = await this.put<User>(`/users/${userId}`, userData);
    this.setCurrentUser(user);
    return user;
  }

  setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  setCurrentUser(user: User): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  getCurrentUserFromStorage(): User | null {
    const userData = localStorage.getItem(this.USER_KEY);
    return userData ? JSON.parse(userData) : null;
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  clearAuth(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }

  // Check if token is expired (basic check)
  isTokenExpired(): boolean {
    const token = this.getToken();
    if (!token) return true;

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  }
}

export const authService = new AuthService();
