import { mount, VueWrapper } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import { vi } from 'vitest';
import type { Component } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';
import { routes } from '@/router/routes';

export const createTestRouter = () => {
  return createRouter({
    history: createWebHistory(),
    routes,
  });
};

export const createTestingPiniaWithInitialState = (initialState = {}) => {
  return createTestingPinia({
    createSpy: vi.fn,
    initialState,
  });
};

export const mountComponent = (
  component: Component,
  options: {
    props?: Record<string, any>;
    global?: Record<string, any>;
    initialState?: Record<string, any>;
    router?: boolean;
  } = {}
): VueWrapper => {
  const { props = {}, global = {}, initialState = {}, router = false } = options;

  const plugins = [createTestingPiniaWithInitialState(initialState)];
  const globalConfig = { ...global };

  if (router) {
    if (!globalConfig.plugins) {
      globalConfig.plugins = [];
    }
    globalConfig.plugins.push(createTestRouter());
  }

  return mount(component, {
    props,
    global: {
      plugins,
      ...globalConfig,
    },
  });
};

export const mockApiResponse = <T>(data: T, success = true) => ({
  data,
  success,
  message: success ? 'Success' : 'Error',
});

export const createMockUser = (overrides = {}) => ({
  id: '1',
  username: 'testuser',
  firstName: 'Test',
  lastName: 'User',
  dateOfBirth: '1990-01-01',
  role: 'USER',
  createdAt: 1640995200,
  updatedAt: 1640995200,
  token: 'mock-token',
  ...overrides,
});

export const createMockTweet = (overrides = {}) => ({
  id: '1',
  title: 'Test Tweet',
  content: 'This is a test tweet content',
  authorId: '1',
  createdAt: 1640995200,
  updatedAt: 1640995200,
  publishedAt: 1640995200,
  token: 'mock-token',
  author: createMockUser(),
  ...overrides,
});

export const flushPromises = () => new Promise(resolve => setTimeout(resolve, 0));
