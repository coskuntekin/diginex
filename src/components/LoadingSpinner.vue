<template>
  <div
    class="flex items-center justify-center"
    :class="containerClass"
    role="status"
    aria-live="polite"
    aria-busy="true"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
      :class="spinnerClass"
      class="animate-spin"
      aria-hidden="true"
    >
      <path
        d="M215.1 26.3c3.6 12.7-3.7 26-16.5 29.7C111.6 80.9 48 161.1 48 256c0 114.9 93.1 208 208 208s208-93.1 208-208c0-94.9-63.6-175.1-150.6-200c-12.7-3.6-20.1-16.9-16.5-29.7s16.9-20.1 29.7-16.5C433.6 40.5 512 139.1 512 256c0 141.4-114.6 256-256 256S0 397.4 0 256C0 139.1 78.4 40.5 185.4 9.9c12.7-3.6 26 3.7 29.7 16.5z"
        :fill="color"
      />
    </svg>
    <span v-if="text" :class="textClass" class="ml-2">{{ text }}</span>
    <span v-else class="sr-only">Loading...</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: string;
  text?: string;
  containerClass?: string;
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  color: 'currentColor',
  text: '',
  containerClass: '',
});

const spinnerClass = computed(() => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12',
  };
  return sizeClasses[props.size];
});

const textClass = computed(() => {
  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg',
  };
  return `text-gray-600 ${textSizeClasses[props.size]}`;
});
</script>
