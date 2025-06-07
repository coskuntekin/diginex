import { BaseService } from './baseService';
import type {
  User,
  CreateUserRequest,
  UpdateUserRequest,
  QueryParams
} from '@/types/api';

export class UserService extends BaseService {
  async getUsers(params?: QueryParams): Promise<User[]> {
    return this.get<User[]>('/users', params);
  }

  async getUserById(id: string | number): Promise<User> {
    return this.get<User>(`/users/${id}`);
  }

  async createUser(userData: CreateUserRequest): Promise<User> {
    return this.post<User>('/users', userData);
  }

  async updateUser(id: string | number, userData: UpdateUserRequest): Promise<User> {
    return this.put<User>(`/users/${id}`, userData);
  }

  async patchUser(id: string | number, userData: Partial<UpdateUserRequest>): Promise<User> {
    return this.put<User>(`/users/${id}`, userData);
  }

  async deleteUser(id: string | number): Promise<void> {
    return this.delete<void>(`/users/${id}`);
  }

  async toggleUserStatus(id: string | number): Promise<User> {
    return this.put<User>(`/users/${id}/toggle-status`);
  }
}

export const userService = new UserService();
