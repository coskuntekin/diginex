import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useAuthStore } from '@/stores/auth';
import { authService } from '@/services';
import { createMockUser } from '../utils';

vi.mock('@/services', () => ({
  authService: {
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    updateProfile: vi.fn(),
    getToken: vi.fn(),
    getCurrentUserFromStorage: vi.fn(),
    getCurrentUser: vi.fn(),
    clearAuth: vi.fn(),
    isTokenExpired: vi.fn(),
  }
}));

describe('Auth Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it('should initialize with default state', () => {
    const store = useAuthStore();

    expect(store.user).toBeNull();
    expect(store.token).toBeNull();
    expect(store.isLoading).toBe(false);
    expect(store.error).toBeNull();
    expect(store.isAuthenticated).toBe(false);
    expect(store.userName).toBe('');
    expect(store.userRole).toBe('');
    expect(store.isAdmin).toBe(false);
  });

  it('should compute isAuthenticated correctly', () => {
    const store = useAuthStore();

    expect(store.isAuthenticated).toBe(false);

    store.user = createMockUser();
    expect(store.isAuthenticated).toBe(false);

    store.user = null;
    store.token = 'test-token';
    expect(store.isAuthenticated).toBe(false);

    store.user = createMockUser();
    store.token = 'test-token';
    expect(store.isAuthenticated).toBe(true);
  });

  it('should compute userName correctly', () => {
    const store = useAuthStore();

    expect(store.userName).toBe('');

    store.user = createMockUser({
      firstName: 'John',
      lastName: 'Doe'
    });

    expect(store.userName).toBe('John Doe');
  });

  it('should compute userRole correctly', () => {
    const store = useAuthStore();

    expect(store.userRole).toBe('');

    store.user = createMockUser({ role: 'ADMIN' });
    expect(store.userRole).toBe('ADMIN');
  });

  it('should compute isAdmin correctly', () => {
    const store = useAuthStore();

    expect(store.isAdmin).toBe(false);

    store.user = createMockUser({ role: 'USER' });
    expect(store.isAdmin).toBe(false);

    store.user = createMockUser({ role: 'ADMIN' });
    expect(store.isAdmin).toBe(true);
  });

  it('should handle successful login', async () => {
    const store = useAuthStore();
    const mockUser = createMockUser();
    const mockLoginResponse = {
      user: mockUser,
      token: 'test-token'
    };

    vi.mocked(authService.login).mockResolvedValue(mockLoginResponse);

    const result = await store.login({
      username: 'testuser',
      password: 'password'
    });

    expect(authService.login).toHaveBeenCalledWith({
      username: 'testuser',
      password: 'password'
    });
    expect(store.user).toEqual(mockUser);
    expect(store.token).toBe('test-token');
    expect(store.error).toBeNull();
    expect(result).toEqual(mockLoginResponse);
  });

  it('should handle login error', async () => {
    const store = useAuthStore();
    const errorMessage = 'Invalid credentials';

    vi.mocked(authService.login).mockRejectedValue(new Error(errorMessage));

    await expect(store.login({
      username: 'testuser',
      password: 'wrongpassword'
    })).rejects.toThrow(errorMessage);

    expect(store.user).toBeNull();
    expect(store.token).toBeNull();
    expect(store.error).toBe(errorMessage);
  });

  it('should handle successful registration', async () => {
    const store = useAuthStore();
    const mockRegisterResponse = {
      id: '1',
      username: 'newuser',
      firstName: 'New',
      lastName: 'User',
      dateOfBirth: '1990-01-01',
      role: 'USER',
      createdAt: 1640995200,
      updatedAt: 1640995200,
    };

    vi.mocked(authService.register).mockResolvedValue(mockRegisterResponse);

    const result = await store.register({
      username: 'newuser',
      password: 'password',
      firstName: 'New',
      lastName: 'User',
      dateOfBirth: '1990-01-01'
    });

    expect(authService.register).toHaveBeenCalled();
    expect(store.error).toBeNull();
    expect(result).toEqual(mockRegisterResponse);
  });

  it('should handle logout', async () => {
    const store = useAuthStore();

    store.user = createMockUser();
    store.token = 'test-token';

    vi.mocked(authService.logout).mockResolvedValue();

    await store.logout();

    expect(authService.logout).toHaveBeenCalled();
    expect(store.user).toBeNull();
    expect(store.token).toBeNull();
    expect(store.error).toBeNull();
  });

  it('should initialize auth from storage', async () => {
    const store = useAuthStore();
    const mockUser = createMockUser();
    const mockToken = 'stored-token';

    vi.mocked(authService.getToken).mockReturnValue(mockToken);
    vi.mocked(authService.getCurrentUserFromStorage).mockReturnValue(mockUser);
    vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUser);
    vi.mocked(authService.isTokenExpired).mockReturnValue(false);

    await store.initializeAuth();

    expect(store.token).toBe(mockToken);
    expect(store.user).toEqual(mockUser);
  });

  it('should handle auth initialization with no stored data', async () => {
    const store = useAuthStore();

    vi.mocked(authService.getToken).mockReturnValue(null);
    vi.mocked(authService.getCurrentUserFromStorage).mockReturnValue(null);

    await store.initializeAuth();

    expect(store.token).toBeNull();
    expect(store.user).toBeNull();
  });

  it('should set loading state during async operations', async () => {
    const store = useAuthStore();

    vi.mocked(authService.login).mockImplementation(() =>
      new Promise(resolve => setTimeout(() => resolve({
        user: createMockUser(),
        token: 'test-token'
      }), 100))
    );

    const loginPromise = store.login({
      username: 'testuser',
      password: 'password'
    });

    expect(store.isLoading).toBe(true);

    await loginPromise;

    expect(store.isLoading).toBe(false);
  });
});
