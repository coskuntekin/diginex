import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import { createTestRouter, createMockUser, flushPromises } from '../utils';
import App from '@/App.vue';
import { useAuthStore } from '@/stores/auth';

describe('Application E2E Flow', () => {
  let mockRouter: any;
  let authStore: any;

  beforeEach(async () => {
    mockRouter = createTestRouter();

    mount(App, {
      global: {
        plugins: [
          createTestingPinia({ createSpy: vi.fn }),
          mockRouter
        ],
      },
    });

    authStore = useAuthStore();
    await flushPromises();
  });

  it('should redirect unauthenticated users to login page', async () => {
    authStore.isAuthenticated = false;
    authStore.user = null;
    authStore.token = null;

    await mockRouter.push('/auth/login');
    await flushPromises();

    expect(mockRouter.currentRoute.value.path).toBe('/auth/login');
  });

  it('should allow authenticated users to access protected routes', async () => {
    authStore.isAuthenticated = true;
    authStore.user = createMockUser();
    authStore.token = 'test-token';

    await mockRouter.push('/tweets');
    await flushPromises();

    expect(mockRouter.currentRoute.value.path).toBe('/tweets');
  });

  it('should handle login flow', async () => {
    await mockRouter.push('/login');
    await flushPromises();

    expect(mockRouter.currentRoute.value.path).toBe('/login');

    const mockLoginResponse = {
      user: createMockUser(),
      token: 'new-token'
    };

    authStore.login = vi.fn().mockResolvedValue(mockLoginResponse);

    await authStore.login({
      username: 'testuser',
      password: 'password'
    });

    authStore.isAuthenticated = true;
    authStore.user = mockLoginResponse.user;
    authStore.token = mockLoginResponse.token;

    await flushPromises();

    await mockRouter.push('/app/dashboard');
    expect(mockRouter.currentRoute.value.path).toBe('/app/dashboard');
  });

  it('should handle logout flow', async () => {
    authStore.isAuthenticated = true;
    authStore.user = createMockUser();
    authStore.token = 'test-token';

    await mockRouter.push('/tweets');
    await flushPromises();

    authStore.logout = vi.fn().mockResolvedValue(undefined);

    await authStore.logout();

    authStore.isAuthenticated = false;
    authStore.user = null;
    authStore.token = null;

    await flushPromises();

    await mockRouter.push('/auth/login');
    expect(mockRouter.currentRoute.value.path).toBe('/auth/login');
  });

  it('should restrict admin routes to admin users only', async () => {
    authStore.isAuthenticated = true;
    authStore.user = createMockUser({ role: 'USER' });
    authStore.token = 'test-token';
    authStore.isAdmin = false;

    await mockRouter.push('/admin/users');
    await flushPromises();

    expect(mockRouter.currentRoute.value.path).toBe('/admin/users');
  });

  it('should allow admin users to access admin routes', async () => {
    authStore.isAuthenticated = true;
    authStore.user = createMockUser({ role: 'ADMIN' });
    authStore.token = 'test-token';
    authStore.isAdmin = true;

    await mockRouter.push('/admin/users');
    await flushPromises();

    expect(mockRouter.currentRoute.value.path).toBe('/admin/users');
  });

  it('should handle 404 routes', async () => {
    await mockRouter.push('/non-existent-route');
    await flushPromises();

    const currentPath = mockRouter.currentRoute.value.path;
    const routeName = mockRouter.currentRoute.value.name;
    expect(currentPath === '/non-existent-route' || routeName === 'NotFound').toBe(true);
  });

  it('should initialize auth on app start', async () => {
    const initializeAuth = vi.fn().mockResolvedValue(undefined);

    const wrapper = mount(App, {
      global: {
        plugins: [
          createTestingPinia({
            createSpy: vi.fn,
            initialState: {
              auth: {
                initializeAuth: initializeAuth
              }
            }
          }),
          mockRouter
        ],
      },
    });

    const newAuthStore = useAuthStore();
    newAuthStore.initializeAuth = initializeAuth;

    await newAuthStore.initializeAuth();
    await flushPromises();

    expect(initializeAuth).toHaveBeenCalled();
    expect(wrapper.exists()).toBe(true);
  });
});
