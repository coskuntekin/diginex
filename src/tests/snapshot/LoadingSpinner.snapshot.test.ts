import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import LoadingSpinner from '@/components/LoadingSpinner.vue';

describe('Snapshot Tests', () => {
  it('should match LoadingSpinner snapshot with default props', () => {
    const wrapper = mount(LoadingSpinner);
    expect(wrapper.html()).toMatchSnapshot();
  });

  it('should match LoadingSpinner snapshot with all props', () => {
    const wrapper = mount(LoadingSpinner, {
      props: {
        size: 'lg',
        color: '#ff0000',
        text: 'Loading data...',
        containerClass: 'custom-container'
      }
    });
    expect(wrapper.html()).toMatchSnapshot();
  });

  it('should match LoadingSpinner snapshot with small size', () => {
    const wrapper = mount(LoadingSpinner, {
      props: {
        size: 'sm',
        text: 'Please wait...'
      }
    });
    expect(wrapper.html()).toMatchSnapshot();
  });

  it('should match LoadingSpinner snapshot with extra large size', () => {
    const wrapper = mount(LoadingSpinner, {
      props: {
        size: 'xl',
        color: '#22c55e'
      }
    });
    expect(wrapper.html()).toMatchSnapshot();
  });
});
