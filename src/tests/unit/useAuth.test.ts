import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useAuth } from '@/utils/useAuth';
import { useAuthStore } from '@/stores/auth';
import { createMockUser } from '../utils';
import { setActivePinia, createPinia } from 'pinia';

// Mock the router
const mockRouter = {
  push: vi.fn(),
  replace: vi.fn(),
};

vi.mock('vue-router', () => ({
  useRouter: () => mockRouter,
}));

describe('useAuth Composable', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it('should provide auth state from store', () => {
    const authStore = useAuthStore();
    // Set the actual state properties instead of computed ones
    authStore.token = 'test-token';
    authStore.user = createMockUser();
    authStore.isLoading = false;

    const { isAuthenticated, user, isLoading } = useAuth();

    expect(isAuthenticated.value).toBe(true);
    expect(user.value).toEqual(createMockUser());
    expect(isLoading.value).toBe(false);
  });

  it('should provide login function that calls store login', async () => {
    const authStore = useAuthStore();
    const mockLogin = vi.fn().mockResolvedValue({
      user: createMockUser(),
      token: 'test-token'
    });
    authStore.login = mockLogin;

    const { login } = useAuth();

    const credentials = { username: 'test', password: 'pass' };
    await login(credentials);

    expect(mockLogin).toHaveBeenCalledWith(credentials);
  });

  it('should provide logout function that calls store logout and redirects', async () => {
    const authStore = useAuthStore();
    const mockLogout = vi.fn().mockResolvedValue(undefined);
    authStore.logout = mockLogout;

    const { logout } = useAuth();

    await logout();

    expect(mockLogout).toHaveBeenCalled();
    expect(mockRouter.push).toHaveBeenCalledWith('/login');
  });

  it('should provide register function that calls store register', async () => {
    const authStore = useAuthStore();
    const mockRegister = vi.fn().mockResolvedValue({
      id: '1',
      username: 'newuser',
      firstName: 'New',
      lastName: 'User'
    });
    authStore.register = mockRegister;

    const { register } = useAuth();

    const userData = {
      username: 'newuser',
      password: 'password',
      firstName: 'New',
      lastName: 'User',
      dateOfBirth: '1990-01-01'
    };

    await register(userData);

    expect(mockRegister).toHaveBeenCalledWith(userData);
  });

  it('should provide requireAuth function that redirects if not authenticated', () => {
    const authStore = useAuthStore();
    // Set token to null to make isAuthenticated false
    authStore.token = null;
    authStore.user = null;

    const { requireAuth } = useAuth();

    requireAuth();

    expect(mockRouter.push).toHaveBeenCalledWith('/login');
  });

  it('should provide requireAuth function that allows access if authenticated', () => {
    const authStore = useAuthStore();
    // Set token and user to make isAuthenticated true
    authStore.token = 'test-token';
    authStore.user = createMockUser();

    const { requireAuth } = useAuth();

    requireAuth();

    expect(mockRouter.push).not.toHaveBeenCalled();
  });

  it('should provide requireAdmin function that redirects if not admin', () => {
    const authStore = useAuthStore();
    authStore.token = 'test-token';
    authStore.user = createMockUser({ role: 'USER' });

    const { requireAdmin } = useAuth();

    requireAdmin();

    expect(mockRouter.push).toHaveBeenCalledWith('/');
  });

  it('should provide requireAdmin function that allows access if admin', () => {
    const authStore = useAuthStore();
    authStore.token = 'test-token';
    authStore.user = createMockUser({ role: 'ADMIN' });

    const { requireAdmin } = useAuth();

    requireAdmin();

    expect(mockRouter.push).not.toHaveBeenCalled();
  });

  it('should handle authentication errors gracefully', async () => {
    const authStore = useAuthStore();
    const mockLogin = vi.fn().mockRejectedValue(new Error('Login failed'));
    authStore.login = mockLogin;

    const { login } = useAuth();

    await expect(login({ username: 'test', password: 'wrong' }))
      .rejects.toThrow('Login failed');
  });
});
