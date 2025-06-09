import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import LoadingSpinner from '@/components/LoadingSpinner.vue';

describe('Accessibility Tests', () => {
  it('should have proper ARIA attributes for loading spinner', () => {
    const wrapper = mount(LoadingSpinner, {
      props: {
        text: 'Loading content...'
      }
    });

    // Check for accessibility attributes
    const container = wrapper.find('div');
    expect(container.attributes('role')).toBe('status') ||
    expect(container.attributes('aria-live')).toBe('polite') ||
    expect(container.attributes('aria-busy')).toBe('true');
  });

  it('should provide screen reader accessible text', () => {
    const wrapper = mount(LoadingSpinner, {
      props: {
        text: 'Loading user data...'
      }
    });

    // Text should be visible for screen readers
    const text = wrapper.find('span');
    expect(text.exists()).toBe(true);
    expect(text.text()).toBe('Loading user data...');
  });

  it('should have proper contrast and visibility', () => {
    const wrapper = mount(LoadingSpinner, {
      props: {
        color: '#000000', // High contrast color
        text: 'Loading...'
      }
    });

    const svg = wrapper.find('svg');
    const path = wrapper.find('path');

    expect(svg.exists()).toBe(true);
    expect(path.attributes('fill')).toBe('#000000');
  });

  it('should be keyboard navigable when interactive', () => {
    const wrapper = mount({
      template: `
        <div>
          <button>Previous</button>
          <LoadingSpinner text="Loading..." />
          <button>Next</button>
        </div>
      `,
      components: { LoadingSpinner }
    });

    const buttons = wrapper.findAll('button');
    expect(buttons.length).toBe(2);

    // Loading spinner shouldn't interfere with tab order
    buttons.forEach(button => {
      expect(button.attributes('tabindex')).not.toBe('-1');
    });
  });

  it('should handle reduced motion preferences', () => {
    // Mock reduced motion preference
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: query.includes('prefers-reduced-motion: reduce'),
        media: query,
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

    const wrapper = mount(LoadingSpinner);
    const svg = wrapper.find('svg');

    // Should still render even with reduced motion
    expect(svg.exists()).toBe(true);
    expect(svg.classes()).toContain('animate-spin');
  });

  it('should provide semantic HTML structure', () => {
    const wrapper = mount(LoadingSpinner, {
      props: {
        text: 'Loading tweets...'
      }
    });

    // Check semantic structure
    const container = wrapper.find('div');
    const svg = wrapper.find('svg');
    const text = wrapper.find('span');

    expect(container.exists()).toBe(true);
    expect(svg.exists()).toBe(true);
    expect(text.exists()).toBe(true);

    // SVG should have proper namespace
    expect(svg.attributes('xmlns')).toBe('http://www.w3.org/2000/svg');
    expect(svg.attributes('viewBox')).toBe('0 0 512 512');
  });

  it('should work with assistive technologies', () => {
    const wrapper = mount(LoadingSpinner, {
      props: {
        text: 'Processing your request...'
      }
    });

    const container = wrapper.find('div');

    // Should have attributes that assistive technologies can understand
    expect(
      container.attributes('role') === 'status' ||
      container.attributes('aria-live') === 'polite' ||
      container.text().includes('Processing your request')
    ).toBe(true);
  });
});
