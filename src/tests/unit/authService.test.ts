import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AuthService } from '@/services/authService';
import { createMockUser } from '../utils';

// Mock axios
vi.mock('axios');
const mockAxios = vi.hoisted(() => ({
  post: vi.fn(),
  put: vi.fn(),
  get: vi.fn(),
  delete: vi.fn(),
}));

vi.mock('@/services/api', () => ({
  default: mockAxios,
}));

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(() => {
    authService = new AuthService();
    vi.clearAllMocks();
    mockLocalStorage.getItem.mockClear();
    mockLocalStorage.setItem.mockClear();
    mockLocalStorage.removeItem.mockClear();
  });

  describe('login', () => {
    it('should make login request and store auth data', async () => {
      const mockUser = createMockUser();
      const mockResponse = {
        user: mockUser,
        token: 'test-token'
      };

      mockAxios.post.mockResolvedValueOnce({
        status: 200,
        data: mockResponse,
      });

      const result = await authService.login({
        username: 'testuser',
        password: 'password'
      });

      expect(mockAxios.post).toHaveBeenCalledWith('/login', {
        username: 'testuser',
        password: 'password'
      });
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('authToken', 'test-token');
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('currentUser', JSON.stringify(mockUser));
      expect(result).toEqual(mockResponse);
    });

    it('should handle login error', async () => {
      const errorResponse = {
        response: {
          data: {
            message: 'Invalid credentials'
          },
          status: 401
        }
      };

      mockAxios.post.mockRejectedValueOnce(errorResponse);

      await expect(authService.login({
        username: 'wronguser',
        password: 'wrongpass'
      })).rejects.toEqual({
        message: 'Invalid credentials',
        code: 401
      });

      expect(mockAxios.post).toHaveBeenCalledWith('/login', {
        username: 'wronguser',
        password: 'wrongpass'
      });
      expect(mockLocalStorage.setItem).not.toHaveBeenCalled();
    });
  });

  describe('register', () => {
    it('should make register request', async () => {
      const mockResponse = {
        id: '1',
        username: 'newuser',
        firstName: 'New',
        lastName: 'User',
        dateOfBirth: '1990-01-01',
        role: 'USER',
        createdAt: 1640995200,
        updatedAt: 1640995200,
      };

      mockAxios.post.mockResolvedValueOnce({
        status: 201,
        data: mockResponse,
      });

      const result = await authService.register({
        username: 'newuser',
        password: 'password',
        firstName: 'New',
        lastName: 'User',
        dateOfBirth: '1990-01-01'
      });

      expect(mockAxios.post).toHaveBeenCalledWith('/register', {
        username: 'newuser',
        password: 'password',
        firstName: 'New',
        lastName: 'User',
        dateOfBirth: '1990-01-01'
      });

      expect(result).toEqual(mockResponse);
    });
  });

  describe('logout', () => {
    it('should clear authentication data', async () => {
      await authService.logout();

      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('authToken');
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('currentUser');
    });
  });

  describe('token management', () => {
    it('should set and get token', () => {
      authService.setToken('test-token');
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('authToken', 'test-token');

      mockLocalStorage.getItem.mockReturnValue('stored-token');
      const token = authService.getToken();
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('authToken');
      expect(token).toBe('stored-token');
    });

    it('should return null when no token exists', () => {
      mockLocalStorage.getItem.mockReturnValue(null);
      const token = authService.getToken();
      expect(token).toBeNull();
    });
  });

  describe('user management', () => {
    it('should set and get current user', () => {
      const mockUser = createMockUser();

      authService.setCurrentUser(mockUser);
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('currentUser', JSON.stringify(mockUser));

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockUser));
      const user = authService.getCurrentUserFromStorage();
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('currentUser');
      expect(user).toEqual(mockUser);
    });

    it('should return null when no user exists in storage', () => {
      mockLocalStorage.getItem.mockReturnValue(null);
      const user = authService.getCurrentUserFromStorage();
      expect(user).toBeNull();
    });

    it('should handle invalid JSON in storage', () => {
      mockLocalStorage.getItem.mockReturnValue('invalid-json');
      const user = authService.getCurrentUserFromStorage();
      expect(user).toBeNull();
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('currentUser');
    });
  });

  describe('updateProfile', () => {
    it('should update user profile and store updated user', async () => {
      const updatedUser = createMockUser({ firstName: 'Updated' });

      mockAxios.put.mockResolvedValueOnce({
        data: updatedUser,
        status: 200
      });

      const result = await authService.updateProfile('1', { firstName: 'Updated' });

      expect(mockAxios.put).toHaveBeenCalledWith('/users/1', { firstName: 'Updated' });
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('currentUser', JSON.stringify(updatedUser));
      expect(result).toEqual(updatedUser);
    });
  });

  describe('clearAuth', () => {
    it('should remove both token and user from storage', () => {
      authService.clearAuth();

      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('authToken');
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('currentUser');
    });
  });
});
