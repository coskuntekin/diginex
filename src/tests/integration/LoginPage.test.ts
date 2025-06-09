import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import LoginPage from '@/pages/LoginPage.vue';
import { useAuthStore } from '@/stores/auth';
import { createTestRouter } from '../utils';

describe('LoginPage Integration', () => {
  let wrapper: any;
  let mockRouter: any;

  beforeEach(() => {
    mockRouter = createTestRouter();

    wrapper = mount(LoginPage, {
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
  });

  it('should render login form', () => {
    expect(wrapper.find('form').exists()).toBe(true);
    expect(wrapper.find('input[type="text"]').exists()).toBe(true);
    expect(wrapper.find('input[type="password"]').exists()).toBe(true);
    expect(wrapper.find('button[type="submit"]').exists()).toBe(true);
  });

  it('should validate required fields', async () => {
    const form = wrapper.find('form');
    await form.trigger('submit');

    const usernameInput = wrapper.find('input[name="username"]');
    const passwordInput = wrapper.find('input[name="password"]');

    expect(usernameInput.attributes('required')).toBeDefined();
    expect(passwordInput.attributes('required')).toBeDefined();
  });

  it('should call login action when form is submitted with valid data', async () => {
    const authStore = useAuthStore();
    const mockLogin = vi.fn().mockResolvedValue({
      user: { id: '1', username: 'test' },
      token: 'token'
    });
    authStore.login = mockLogin;

    const usernameInput = wrapper.find('input[type="text"]');
    const passwordInput = wrapper.find('input[type="password"]');

    await usernameInput.setValue('testuser');
    await passwordInput.setValue('password123');

    const form = wrapper.find('form');
    await form.trigger('submit');

    expect(mockLogin).toHaveBeenCalledWith({
      username: 'testuser',
      password: 'password123'
    });
  });

  it('should display error message on login failure', async () => {
    const authStore = useAuthStore();
    const mockLogin = vi.fn().mockRejectedValue(new Error('Invalid credentials'));
    authStore.login = mockLogin;

    const usernameInput = wrapper.find('input[type="text"]');
    const passwordInput = wrapper.find('input[type="password"]');

    await usernameInput.setValue('testuser');
    await passwordInput.setValue('wrongpassword');

    const form = wrapper.find('form');
    await form.trigger('submit');
    await wrapper.vm.$nextTick();

    expect(mockLogin).toHaveBeenCalledWith({
      username: 'testuser',
      password: 'wrongpassword'
    });
  });

  it('should show loading state during login', async () => {
    wrapper = mount(LoginPage, {
      global: {
        plugins: [
          createTestingPinia({
            createSpy: vi.fn,
            initialState: {
              auth: {
                isLoading: true
              }
            }
          }),
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

    await wrapper.vm.$nextTick();

    const button = wrapper.find('button[type="submit"]');
    expect(button.text()).toContain('Login');
    expect(button.attributes('disabled')).toBeDefined();
  });

  it('should have link to register page', () => {
    const registerLink = wrapper.find('a');
    expect(registerLink.exists()).toBe(true);
    expect(wrapper.text()).toContain('Register here');
  });
});
