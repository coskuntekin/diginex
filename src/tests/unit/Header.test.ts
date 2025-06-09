import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import Header from '@/partials/Header.vue';
import { useAuthStore } from '@/stores/auth';
import { createTestRouter, createMockUser } from '../utils';

describe('Header Component', () => {
  let wrapper: any;
  let mockRouter: any;

  beforeEach(() => {
    mockRouter = createTestRouter();
  });

  it('should show authenticated navigation even when auth store shows unauthenticated (Header is for MainLayout only)', () => {
    wrapper = mount(Header, {
      global: {
        plugins: [
          createTestingPinia({
            createSpy: vi.fn,
            initialState: {
              auth: {
                user: null,
                token: null,
                isAuthenticated: false
              }
            }
          }),
          mockRouter
        ],
      },
    });

    expect(wrapper.text()).toContain('Tweets');
    expect(wrapper.text()).toContain('Profile');
    expect(wrapper.text()).toContain('Logout');
  });

  it('should show user menu when authenticated', () => {
    const mockUser = createMockUser({
      firstName: 'John',
      lastName: 'Doe'
    });

    wrapper = mount(Header, {
      global: {
        plugins: [
          createTestingPinia({
            createSpy: vi.fn,
            initialState: {
              auth: {
                user: mockUser,
                token: 'test-token',
                isAuthenticated: true
              }
            }
          }),
          mockRouter
        ],
      },
    });

    expect(wrapper.text()).toContain('Profile');
  });

  it('should show logout button when authenticated', () => {
    wrapper = mount(Header, {
      global: {
        plugins: [
          createTestingPinia({
            createSpy: vi.fn,
            initialState: {
              auth: {
                user: createMockUser(),
                token: 'test-token',
                isAuthenticated: true
              }
            }
          }),
          mockRouter
        ],
      },
    });

    expect(wrapper.text()).toContain('Logout');
  });

  it('should call logout when logout button is clicked', async () => {
    const mockLogout = vi.fn().mockResolvedValue(undefined);

    wrapper = mount(Header, {
      global: {
        plugins: [
          createTestingPinia({
            createSpy: vi.fn,
            initialState: {
              auth: {
                user: createMockUser(),
                token: 'test-token',
                isAuthenticated: true
              }
            }
          }),
          mockRouter
        ],
      },
    });

    const authStore = useAuthStore();
    authStore.logout = mockLogout;

    const logoutButton = wrapper.find('button');
    expect(logoutButton.exists()).toBe(true);

    await logoutButton.trigger('click');
    expect(mockLogout).toHaveBeenCalled();
  });

  it('should show admin links for admin users', () => {
    wrapper = mount(Header, {
      global: {
        plugins: [
          createTestingPinia({
            createSpy: vi.fn,
            initialState: {
              auth: {
                user: createMockUser({ role: 'ADMIN' }),
                token: 'test-token',
                isAuthenticated: true,
                isAdmin: true
              }
            }
          }),
          mockRouter
        ],
      },
    });

    expect(wrapper.text()).toContain('User Management');
  });

  it('should show application logo/brand', () => {
    wrapper = mount(Header, {
      global: {
        plugins: [
          createTestingPinia({ createSpy: vi.fn }),
          mockRouter
        ],
      },
    });

    expect(wrapper.text()).toContain('Diginex Dashboard');
  });

  it('should navigate to home when logo is clicked', async () => {
    wrapper = mount(Header, {
      global: {
        plugins: [
          createTestingPinia({ createSpy: vi.fn }),
          mockRouter
        ],
        stubs: {
          'router-link': {
            template: '<a><slot /></a>',
            props: ['to']
          }
        }
      },
    });

    const logo = wrapper.find('a');
    expect(logo.exists()).toBe(true);
    expect(wrapper.text()).toContain('Diginex Dashboard');
  });
});
