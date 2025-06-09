import { describe, it, expect } from 'vitest';
import { mountComponent } from '../utils';
import LoadingSpinner from '@/components/LoadingSpinner.vue';

describe('LoadingSpinner', () => {
  it('should render with default props', () => {
    const wrapper = mountComponent(LoadingSpinner);

    expect(wrapper.find('svg').exists()).toBe(true);
    expect(wrapper.find('svg').classes()).toContain('animate-spin');
    // Check for sr-only span which is always present for accessibility
    expect(wrapper.find('span.sr-only').exists()).toBe(true);
  });

  it('should render with text when provided', () => {
    const wrapper = mountComponent(LoadingSpinner, {
      props: { text: 'Loading...' }
    });

    const span = wrapper.find('span');
    expect(span.exists()).toBe(true);
    expect(span.text()).toBe('Loading...');
    expect(span.classes()).toContain('ml-2');
  });

  it('should apply correct size classes', () => {
    const wrapperSm = mountComponent(LoadingSpinner, {
      props: { size: 'sm' }
    });
    expect(wrapperSm.find('svg').classes()).toContain('w-4');
    expect(wrapperSm.find('svg').classes()).toContain('h-4');

    const wrapperLg = mountComponent(LoadingSpinner, {
      props: { size: 'lg' }
    });
    expect(wrapperLg.find('svg').classes()).toContain('w-8');
    expect(wrapperLg.find('svg').classes()).toContain('h-8');
  });

  it('should apply custom color', () => {
    const wrapper = mountComponent(LoadingSpinner, {
      props: { color: '#ff0000' }
    });

    const path = wrapper.find('path');
    expect(path.attributes('fill')).toBe('#ff0000');
  });

  it('should apply custom container class', () => {
    const wrapper = mountComponent(LoadingSpinner, {
      props: { containerClass: 'custom-container' }
    });

    expect(wrapper.classes()).toContain('custom-container');
  });

  it('should render text with correct size class', () => {
    const wrapper = mountComponent(LoadingSpinner, {
      props: {
        text: 'Loading...',
        size: 'lg'
      }
    });

    const span = wrapper.find('span');
    expect(span.classes()).toContain('text-base');
  });

  it('should have correct default values', () => {
    const wrapper = mountComponent(LoadingSpinner);

    // Check default size is applied
    expect(wrapper.find('svg').classes()).toContain('w-6');
    expect(wrapper.find('svg').classes()).toContain('h-6');

    // Check default color
    const path = wrapper.find('path');
    expect(path.attributes('fill')).toBe('currentColor');
  });
});
