<script setup lang="ts">
import { ref, onMounted, computed, watch } from "vue";
import { useRouter } from "vue-router";
import { ElMessageBox, ElPagination } from "element-plus";
import LoadingSpinner from "@/components/LoadingSpinner.vue";
import {
  useTweet,
  useAuth,
  notify,
  formatTimestampSafe,
  formatTimestampRelative,
} from "@/utils";
import type { Tweet } from "@/types/api";

defineOptions({
  name: "TweetsPage",
});

const router = useRouter();
const {
  tweets,
  isLoading,
  error,
  fetchTweets,
  deleteTweet,
  clearError,
  clearTweets,
  totalTweets,
} = useTweet();
const { user, isAdmin } = useAuth();

const searchQuery = ref("");
const currentPage = ref(1);
const pageSize = ref(10);
const sortOrder = ref<"newest" | "oldest">("newest");

const getSortParams = () => {
  switch (sortOrder.value) {
    case "newest":
      return { order: "desc" };
    case "oldest":
      return { order: "asc" };
    default:
      return { order: "desc" };
  }
};

const filteredTweets = computed(() => {
  if (!tweets.value || !Array.isArray(tweets.value)) {
    return [];
  }

  if (!searchQuery.value.trim()) {
    return tweets.value;
  }

  const query = searchQuery.value.toLowerCase();
  return tweets.value.filter(
    (tweet: Tweet) =>
      (tweet.title || "").toLowerCase().includes(query) ||
      (tweet.content || "").toLowerCase().includes(query) ||
      (tweet.author?.firstName || "").toLowerCase().includes(query) ||
      (tweet.author?.lastName || "").toLowerCase().includes(query) ||
      (tweet.owner?.firstName || "").toLowerCase().includes(query) ||
      (tweet.owner?.lastName || "").toLowerCase().includes(query) ||
      (tweet.owner?.username || "").toLowerCase().includes(query)
  );
});

const canEditTweet = (tweet: Tweet) => {
  return (
    isAdmin.value ||
    tweet.owner?.userId === user.value?.id ||
    tweet.authorId === user.value?.id
  );
};

const loadTweets = async (page = 1) => {
  try {
    const sortParams = getSortParams();
    await fetchTweets({
      page,
      limit: pageSize.value,
      ...sortParams,
    });
    currentPage.value = page;
  } catch (err) {
    console.error("Failed to load tweets:", err);
    notify.error("Failed to load tweets");
  }
};

const handlePageChange = (page: number) => {
  currentPage.value = page;
  loadTweets(page);
};

const handlePageSizeChange = (newPageSize: number) => {
  pageSize.value = newPageSize;
  currentPage.value = 1;
  loadTweets(1);
};

const handleSortChange = async () => {
  currentPage.value = 1;
  clearTweets();
  await loadTweets(1);
};

const editTweet = (tweetId: string) => {
  router.push({ name: "tweet-edit", params: { id: tweetId } });
};

const handleDeleteTweet = async (tweet: Tweet) => {
  try {
    await ElMessageBox.confirm(
      `This action will permanently delete the tweet "${tweet.title}". This action cannot be undone.`,
      "Delete Tweet",
      {
        confirmButtonText: "Delete",
        cancelButtonText: "Cancel",
        type: "warning",
        confirmButtonClass: "el-button--danger",
      }
    );

    await deleteTweet(tweet.id);
    notify.success("Tweet deleted successfully");

    await loadTweets(currentPage.value);
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

const truncateContent = (content: string | undefined, maxLength = 150) => {
  if (!content) return "";
  if (content.length <= maxLength) return content;
  return content.substring(0, maxLength) + "...";
};

onMounted(() => {
  clearError();
  loadTweets();
});

watch(searchQuery, () => {
  if (searchQuery.value.trim()) {
    currentPage.value = 1;
  }
});
</script>

<template>
  <div class="space-y-6">
    <div class="bg-white shadow rounded-lg p-6">
      <div
        class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 class="text-2xl font-bold text-gray-900">All Tweets</h1>
          <p class="text-gray-600">Discover what everyone is talking about</p>
        </div>
        <router-link
          :to="{ name: 'tweet-create' }"
          class="inline-flex gap-x-1 items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="size-5"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M12 4.5v15m7.5-7.5h-15"
            />
          </svg>
          Create Tweet
        </router-link>
      </div>
    </div>

    <div class="bg-white shadow rounded-lg p-6">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label
            for="search"
            class="block text-sm font-medium text-gray-700 mb-2"
          >
            Search Tweets
          </label>
          <input
            id="search"
            v-model="searchQuery"
            type="text"
            placeholder="Search by title, content, or author..."
            class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label
            for="sort"
            class="block text-sm font-medium text-gray-700 mb-2"
          >
            Sort By
          </label>
          <select
            id="sort"
            v-model="sortOrder"
            @change="handleSortChange"
            class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>
      </div>
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

    <div
      v-if="isLoading && filteredTweets.length === 0"
      class="bg-white shadow rounded-lg p-8"
    >
      <LoadingSpinner size="lg" color="#2563eb" text="Loading tweets..." />
    </div>

    <div
      v-else-if="!isLoading && filteredTweets.length === 0"
      class="bg-white shadow rounded-lg p-8 text-center"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
        class="mx-auto h-12 w-12 text-gray-400"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M8.625 9.75a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 0 1 .778-.332 48.294 48.294 0 0 0 5.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z"
        />
      </svg>

      <h3 class="mt-2 text-sm font-medium text-gray-900">No tweets found</h3>
      <p class="mt-1 text-sm text-gray-500">
        {{
          searchQuery
            ? "Try adjusting your search terms."
            : "Be the first to share your thoughts!"
        }}
      </p>
      <div v-if="!searchQuery" class="mt-6">
        <router-link
          :to="{ name: 'tweet-create' }"
          class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Create your first tweet
        </router-link>
      </div>
    </div>

    <div v-else class="space-y-4">
      <div
        v-for="tweet in filteredTweets"
        :key="tweet.id"
        class="bg-white shadow rounded-lg hover:shadow-md transition-shadow"
      >
        <div class="p-6">
          <div class="flex items-start justify-between">
            <div class="flex items-center space-x-3">
              <div class="flex-shrink-0">
                <div
                  class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center"
                >
                  <span class="text-blue-600 font-medium text-sm">
                    {{
                      (tweet.author?.firstName?.[0] ||
                        tweet.owner?.firstName?.[0] ||
                        tweet.owner?.username?.[0] ||
                        "U") +
                      (tweet.author?.lastName?.[0] ||
                        tweet.owner?.lastName?.[0] ||
                        "")
                    }}
                  </span>
                </div>
              </div>
              <div>
                <p class="text-sm font-medium text-gray-900">
                  {{
                    tweet.author?.firstName && tweet.author?.lastName
                      ? `${tweet.author.firstName} ${tweet.author.lastName}`
                      : tweet.owner?.firstName && tweet.owner?.lastName
                      ? `${tweet.owner.firstName} ${tweet.owner.lastName}`
                      : tweet.owner?.username || "Unknown User"
                  }}
                </p>
                <p
                  class="text-sm text-gray-500"
                  :title="
                    formatTimestampSafe(tweet.publishedAt, tweet.createdAt)
                  "
                >
                  {{ formatDate(tweet.publishedAt || tweet.createdAt) }}
                </p>
              </div>
            </div>
            <div v-if="canEditTweet(tweet)" class="flex items-center space-x-2">
              <button
                type="button"
                @click="editTweet(tweet.id)"
                class="text-gray-400 hover:text-blue-600 transition-colors"
                title="Edit tweet"
              >
                <svg
                  class="w-5 h-5"
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
              </button>
              <button
                type="button"
                @click="handleDeleteTweet(tweet)"
                class="text-gray-400 hover:text-red-600 transition-colors"
                title="Delete tweet"
              >
                <svg
                  class="w-5 h-5"
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
              </button>
            </div>
          </div>

          <div class="mt-4">
            <h3 class="text-lg font-semibold text-gray-900 mb-2">
              {{ tweet.title || "Untitled" }}
            </h3>
            <p class="text-gray-700 whitespace-pre-wrap">
              {{ truncateContent(tweet.content) }}
            </p>
          </div>

          <div class="mt-4 flex items-center justify-between">
            <router-link
              :to="{ name: 'tweet-detail', params: { id: tweet.id } }"
              class="text-blue-600 flex items-center gap-x-1 hover:text-blue-700 text-sm font-medium"
            >
              Read more
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                class="size-5"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="m8.25 4.5 7.5 7.5-7.5 7.5"
                />
              </svg>
            </router-link>
          </div>
        </div>
      </div>

      <div
        v-if="!searchQuery && totalTweets > 0"
        class="flex justify-center pt-6"
      >
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[5, 10, 15, 20, 50]"
          :small="false"
          :disabled="isLoading"
          :background="true"
          layout="total, sizes, prev, pager, next, jumper"
          :total="totalTweets"
          @size-change="handlePageSizeChange"
          @current-change="handlePageChange"
          class="justify-center"
        />
      </div>
    </div>
  </div>
</template>
