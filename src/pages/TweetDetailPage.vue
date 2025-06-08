<script setup lang="ts">
import { onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessageBox } from "element-plus";
import LoadingSpinner from "@/components/LoadingSpinner.vue";
import {
  useTweet,
  useAuth,
  notify,
  formatTimestampDetailed,
  formatTimestampRelative,
} from "@/utils";

defineOptions({
  name: "TweetDetailPage",
});

const route = useRoute();
const router = useRouter();
const {
  selectedTweet,
  isLoading,
  error,
  fetchTweetById,
  deleteTweet,
  clearError,
  clearSelectedTweet,
} = useTweet();
const { user, isAdmin } = useAuth();

const tweetId = computed(() => route.params.id as string);

const canEditTweet = computed(() => {
  if (!selectedTweet.value) return false;
  return (
    isAdmin.value ||
    selectedTweet.value.owner?.userId === user.value?.id ||
    selectedTweet.value.authorId === user.value?.id
  );
});

const loadTweet = async () => {
  if (selectedTweet.value && selectedTweet.value.id === tweetId.value) {
    return;
  }

  try {
    await fetchTweetById(tweetId.value);
  } catch (err) {
    console.error("Failed to load tweet:", err);
    notify.error("Failed to load tweet");
  }
};

const editTweet = () => {
  router.push({ name: "tweet-edit", params: { id: tweetId.value } });
};

const handleDeleteTweet = async () => {
  if (!selectedTweet.value) return;

  try {
    await ElMessageBox.confirm(
      `This action will permanently delete the tweet "${selectedTweet.value.title}". This action cannot be undone.`,
      "Delete Tweet",
      {
        confirmButtonText: "Delete",
        cancelButtonText: "Cancel",
        type: "warning",
        confirmButtonClass: "el-button--danger",
      }
    );

    await deleteTweet(tweetId.value);
    notify.success("Tweet deleted successfully");
    router.push({ name: "tweets" });
  } catch (error) {
    if (error === "cancel") {
      return;
    }
    console.error("Failed to delete tweet:", error);
    notify.error("Failed to delete tweet");
  }
};

const formatDate = (timestamp: number | undefined) => {
  if (!timestamp) return "Unknown date";
  return formatTimestampRelative(timestamp);
};

onMounted(() => {
  clearError();
  if (!selectedTweet.value || selectedTweet.value.id !== tweetId.value) {
    clearSelectedTweet();
  }
  loadTweet();
});
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <router-link
        :to="{ name: 'tweets' }"
        class="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
      >
        <svg
          class="w-5 h-5 mr-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M15 19l-7-7 7-7"
          />
        </svg>
        Back to Tweets
      </router-link>
    </div>

    <div v-if="error" class="bg-red-50 border border-red-200 rounded-md p-4">
      <div class="flex">
        <svg
          class="w-5 h-5 text-red-400"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fill-rule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
            clip-rule="evenodd"
          />
        </svg>
        <div class="ml-3">
          <p class="text-sm text-red-800">{{ error }}</p>
        </div>
      </div>
    </div>

    <div v-if="isLoading" class="bg-white shadow rounded-lg p-8">
      <LoadingSpinner size="lg" color="#2563eb" text="Loading tweet..." />
    </div>

    <!-- Tweet Not Found -->
    <div
      v-else-if="!isLoading && !selectedTweet"
      class="bg-white shadow rounded-lg p-8 text-center"
    >
      <svg
        class="mx-auto h-12 w-12 text-gray-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      <h3 class="mt-2 text-sm font-medium text-gray-900">Tweet not found</h3>
      <p class="mt-1 text-sm text-gray-500">
        The tweet you're looking for doesn't exist or has been removed.
      </p>
    </div>

    <!-- Tweet Content -->
    <div
      v-else-if="selectedTweet"
      class="bg-white shadow rounded-lg overflow-hidden"
    >
      <!-- Tweet Header -->
      <div class="px-6 py-4 border-b border-gray-200">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <div class="flex-shrink-0">
              <div
                class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center"
              >
                <span class="text-blue-600 font-medium">
                  {{
                    (selectedTweet.author?.firstName?.[0] ||
                      selectedTweet.owner?.firstName?.[0] ||
                      selectedTweet.owner?.username?.[0] ||
                      "U") +
                    (selectedTweet.author?.lastName?.[0] ||
                      selectedTweet.owner?.lastName?.[0] ||
                      "")
                  }}
                </span>
              </div>
            </div>
            <div>
              <h3 class="text-lg font-medium text-gray-900">
                {{
                  selectedTweet.author?.firstName &&
                  selectedTweet.author?.lastName
                    ? `${selectedTweet.author.firstName} ${selectedTweet.author.lastName}`
                    : selectedTweet.owner?.firstName &&
                      selectedTweet.owner?.lastName
                    ? `${selectedTweet.owner.firstName} ${selectedTweet.owner.lastName}`
                    : selectedTweet.owner?.username || "Unknown User"
                }}
              </h3>
              <p class="text-sm text-gray-500">
                <span
                  :title="
                    formatTimestampDetailed(
                      selectedTweet.publishedAt || selectedTweet.createdAt || 0
                    )
                  "
                >
                  {{
                    formatDate(
                      selectedTweet.publishedAt || selectedTweet.createdAt
                    )
                  }}
                </span>
                <span
                  v-if="
                    selectedTweet.updatedAt !==
                    (selectedTweet.publishedAt || selectedTweet.createdAt)
                  "
                  class="ml-2"
                  :title="formatTimestampDetailed(selectedTweet.updatedAt || 0)"
                >
                  (edited
                  {{ formatTimestampRelative(selectedTweet.updatedAt || 0) }})
                </span>
              </p>
            </div>
          </div>

          <!-- Actions -->
          <div v-if="canEditTweet" class="flex items-center space-x-2">
            <button
              @click="editTweet"
              class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg
                class="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              Edit
            </button>
            <button
              @click="handleDeleteTweet"
              class="inline-flex items-center px-3 py-2 border border-red-300 shadow-sm text-sm leading-4 font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <svg
                class="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
              Delete
            </button>
          </div>
        </div>
      </div>

      <!-- Tweet Body -->
      <div class="px-6 py-6">
        <h1 class="text-3xl font-bold text-gray-900 mb-4">
          {{ selectedTweet.title }}
        </h1>
        <div class="prose max-w-none">
          <p class="text-gray-700 whitespace-pre-wrap leading-relaxed">
            {{ selectedTweet.content }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
