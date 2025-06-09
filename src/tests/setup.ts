import { vi } from 'vitest';
import { config } from '@vue/test-utils';

// Mock localStorage
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  },
  writable: true,
});

// Mock axios globally
vi.mock('axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    patch: vi.fn(),
    create: vi.fn((config) => ({
      get: vi.fn().mockResolvedValue({ data: {}, status: 200 }),
      post: vi.fn().mockResolvedValue({ data: {}, status: 200 }),
      put: vi.fn().mockResolvedValue({ data: {}, status: 200 }),
      delete: vi.fn().mockResolvedValue({ data: {}, status: 200 }),
      patch: vi.fn().mockResolvedValue({ data: {}, status: 200 }),
      interceptors: {
        request: { use: vi.fn() },
        response: { use: vi.fn() }
      },
      defaults: config
    })),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() }
    }
  }
}));

// Mock the api instance specifically
vi.mock('@/services/api', () => ({
  default: {
    get: vi.fn().mockResolvedValue({ data: {}, status: 200 }),
    post: vi.fn().mockResolvedValue({ data: {}, status: 200 }),
    put: vi.fn().mockResolvedValue({ data: {}, status: 200 }),
    delete: vi.fn().mockResolvedValue({ data: {}, status: 200 }),
    patch: vi.fn().mockResolvedValue({ data: {}, status: 200 }),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() }
    }
  }
}));

// Note: Service mocks are defined in individual test files as needed
// Unit tests mock dependencies (axios, localStorage) to test actual service logic
// Integration tests can use vi.mock in the test files to mock entire services

// Mock console.warn for cleaner test output
vi.spyOn(console, 'warn').mockImplementation(() => {});

// Global test configuration for Vue Test Utils
config.global.mocks = {
  $t: (key: string) => key, // Mock i18n if used
};

// Mock IntersectionObserver for components that might use it
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));
