<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import LoadingSpinner from '@/components/LoadingSpinner.vue';
import { useTweet, notify } from '@/utils';
import type { CreateTweetRequest, UpdateTweetRequest } from '@/types/api';

defineOptions({
  name: 'TweetFormPage',
});

const route = useRoute();
const router = useRouter();
const {
  selectedTweet,
  isLoading,
  error,
  fetchTweetById,
  createTweet,
  updateTweet,
  clearError,
  clearSelectedTweet,
  setSelectedTweet
} = useTweet();

const tweetId = computed(() => route.params.id as string);
const isEditMode = computed(() => route.name === 'tweet-edit' && !!tweetId.value);
const pageTitle = computed(() => isEditMode.value ? 'Edit Tweet' : 'Create Tweet');

const form = ref({
  title: '',
  content: '',
});

const errors = ref<Record<string, string>>({});
const isSubmitting = ref(false);

const validateForm = () => {
  errors.value = {};

  if (!form.value.title.trim()) {
    errors.value.title = 'Title is required';
  } else if (form.value.title.trim().length < 3) {
    errors.value.title = 'Title must be at least 3 characters long';
  } else if (form.value.title.trim().length > 100) {
    errors.value.title = 'Title must be less than 100 characters';
  }

  if (!form.value.content.trim()) {
    errors.value.content = 'Content is required';
  } else if (form.value.content.trim().length < 10) {
    errors.value.content = 'Content must be at least 10 characters long';
  } else if (form.value.content.trim().length > 1000) {
    errors.value.content = 'Content must be less than 1000 characters';
  }

  return Object.keys(errors.value).length === 0;
};

const loadTweet = async () => {
  if (!isEditMode.value) return;

  try {
    await fetchTweetById(tweetId.value);
    if (selectedTweet.value) {
      form.value.title = selectedTweet.value.title;
      form.value.content = selectedTweet.value.content;
    }
  } catch (err) {
    console.error('Failed to load tweet:', err);
    notify.error('Failed to load tweet');
    router.push({ name: 'tweets' });
  }
};

const handleSubmit = async () => {
  if (!validateForm()) return;

  isSubmitting.value = true;

  try {
    const tweetData = {
      title: form.value.title.trim(),
      content: form.value.content.trim(),
    };

    if (isEditMode.value) {
      await updateTweet(tweetId.value, tweetData as UpdateTweetRequest);
      notify.success('Tweet updated successfully');
      router.push({ name: 'tweet-detail', params: { id: tweetId.value } });
    } else {
      const newTweet = await createTweet(tweetData as CreateTweetRequest);
      notify.success('Tweet created successfully');
      setSelectedTweet(newTweet);
      router.push({ name: 'tweet-detail', params: { id: newTweet.id } });
    }
  } catch (err) {
    console.error('Failed to save tweet:', err);
    notify.error(isEditMode.value ? 'Failed to update tweet' : 'Failed to create tweet');
  } finally {
    isSubmitting.value = false;
  }
};

const goBack = () => {
  if (isEditMode.value && tweetId.value) {
    router.push({ name: 'tweet-detail', params: { id: tweetId.value } });
  } else {
    router.push({ name: 'tweets' });
  }
};

const resetForm = () => {
  form.value = {
    title: '',
    content: '',
  };
  errors.value = {};
};

onMounted(() => {
  clearError();
  if (isEditMode.value) {
    clearSelectedTweet();
    loadTweet();
  } else {
    resetForm();
  }
});
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <button
        @click="goBack"
        class="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
      >
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
        {{ isEditMode ? 'Back to Tweet' : 'Back to Tweets' }}
      </button>
    </div>

    <div class="bg-white shadow rounded-lg p-6">
      <h1 class="text-2xl font-bold text-gray-900">{{ pageTitle }}</h1>
      <p class="text-gray-600 mt-1">
        {{ isEditMode ? 'Make changes to your tweet below.' : 'Share your thoughts with the world.' }}
      </p>
    </div>

    <div v-if="error" class="bg-red-50 border border-red-200 rounded-md p-4">
      <div class="flex">
        <svg class="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
        </svg>
        <div class="ml-3">
          <p class="text-sm text-red-800">{{ error }}</p>
        </div>
      </div>
    </div>

    <div v-if="isLoading && isEditMode" class="bg-white shadow rounded-lg p-8">
      <LoadingSpinner size="lg" color="#2563eb" text="Loading tweet..." />
    </div>

    <div v-else class="bg-white shadow rounded-lg">
      <form @submit.prevent="handleSubmit" class="p-6 space-y-6">
        <div>
          <label for="title" class="block text-sm font-medium text-gray-700 mb-2">
            Title <span class="text-red-500">*</span>
          </label>
          <input
            id="title"
            v-model="form.title"
            type="text"
            placeholder="Enter a catchy title for your tweet..."
            maxlength="100"
            class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            :class="{
              'border-red-300 focus:ring-red-500 focus:border-red-500': errors.title
            }"
          />
          <div class="mt-1 flex justify-between">
            <p v-if="errors.title" class="text-sm text-red-600">{{ errors.title }}</p>
            <p class="text-sm text-gray-500">{{ form.title.length }}/100</p>
          </div>
        </div>

        <div>
          <label for="content" class="block text-sm font-medium text-gray-700 mb-2">
            Content <span class="text-red-500">*</span>
          </label>
          <textarea
            id="content"
            v-model="form.content"
            rows="8"
            placeholder="What's on your mind? Share your thoughts, ideas, or experiences..."
            maxlength="1000"
            class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 resize-y"
            :class="{
              'border-red-300 focus:ring-red-500 focus:border-red-500': errors.content
            }"
          />
          <div class="mt-1 flex justify-between">
            <p v-if="errors.content" class="text-sm text-red-600">{{ errors.content }}</p>
            <p class="text-sm text-gray-500">{{ form.content.length }}/1000</p>
          </div>
        </div>

        <div class="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            @click="goBack"
            class="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            :disabled="isSubmitting"
            class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <LoadingSpinner
              v-if="isSubmitting"
              size="sm"
              color="white"
              container-class="-ml-1 mr-2"
            />
            {{ isSubmitting ? 'Saving...' : (isEditMode ? 'Update Tweet' : 'Create Tweet') }}
          </button>
        </div>
      </form>
    </div>

    <div class="bg-blue-50 border border-blue-200 rounded-md p-4">
      <div class="flex">
        <svg class="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
        </svg>
        <div class="ml-3">
          <h3 class="text-sm font-medium text-blue-800">Tips for a great tweet</h3>
          <div class="mt-2 text-sm text-blue-700">
            <ul class="list-disc pl-5 space-y-1">
              <li>Choose a clear, engaging title that summarizes your main point</li>
              <li>Write content that's informative, entertaining, or thought-provoking</li>
              <li>Keep your message focused and easy to read</li>
              <li>Use line breaks to separate different ideas or points</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
