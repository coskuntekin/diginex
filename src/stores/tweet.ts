import { tweetService } from "@/services";
import type {
  CreateTweetRequest,
  QueryParams,
  Tweet,
  UpdateTweetRequest,
  apiError,
} from "@/types/api";
import { defineStore } from "pinia";
import { computed, ref } from "vue";

export const useTweetStore = defineStore("tweet", () => {
  const tweets = ref<Tweet[]>([]);
  const selectedTweet = ref<Tweet | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const pagination = ref<{
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
    nextToken?: string;
    prevToken?: string;
  }>({
    total: 0,
    page: 1,
    limit: 10,
    hasMore: false,
    nextToken: undefined,
    prevToken: undefined,
  });

  const totalTweets = computed(() => pagination.value.total);
  const hasTweets = computed(() => tweets.value.length > 0);
  const currentPage = computed(() => pagination.value.page);
  const hasMoreTweets = computed(() => pagination.value.hasMore);
  const nextToken = computed(() => pagination.value.nextToken);
  const prevToken = computed(() => pagination.value.prevToken);

  const fetchTweets = async (params?: QueryParams) => {
    try {
      isLoading.value = true;
      error.value = null;

      const response = await tweetService.getTweets(params);

      let tweetsArray: Tweet[] = [];
      if (Array.isArray(response)) {
        tweetsArray = response;
        pagination.value = {
          total: response.length,
          page: params?.page || 1,
          limit: params?.limit || 10,
          hasMore: false,
          nextToken: undefined,
          prevToken: undefined,
        };
      } else {
        tweetsArray = response.tweets || response.data || response.items || [];
        pagination.value = {
          total: response.total || tweetsArray.length,
          page: response.page || params?.page || 1,
          limit: response.limit || params?.limit || 10,
          hasMore:
            (response.page || 1) * (response.limit || 10) <
            (response.total || 0),
          nextToken: response.next || undefined,
          prevToken: response.prev || undefined,
        };
      }

      if ((params?.page || 1) === 1) {
        tweets.value = tweetsArray;
      } else {
        tweets.value = [...tweets.value, ...tweetsArray];
      }

      return tweets.value;
    } catch (err: unknown) {
      const apiError = err as apiError;
      error.value = apiError.message || "Failed to fetch tweets";
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const fetchTweetById = async (id: string | number) => {
    try {
      isLoading.value = true;
      error.value = null;

      const tweet = await tweetService.getTweetById(id);
      selectedTweet.value = tweet;

      return tweet;
    } catch (err: unknown) {
      const apiError = err as apiError;
      error.value = apiError.message || "Failed to fetch tweet";
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const createTweet = async (tweetData: CreateTweetRequest) => {
    try {
      isLoading.value = true;
      error.value = null;

      const newTweet = await tweetService.createTweet(tweetData);
      tweets.value.unshift(newTweet);
      pagination.value.total += 1;

      return newTweet;
    } catch (err: unknown) {
      const apiError = err as apiError;
      error.value = apiError.message || "Failed to create tweet";
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const updateTweet = async (
    id: string | number,
    tweetData: UpdateTweetRequest
  ) => {
    try {
      isLoading.value = true;
      error.value = null;

      const updatedTweet = await tweetService.updateTweet(id, tweetData);

      const index = tweets.value.findIndex((tweet) => tweet.id === id);
      if (index !== -1) {
        tweets.value[index] = updatedTweet;
      }

      if (selectedTweet.value?.id === id) {
        selectedTweet.value = updatedTweet;
      }

      return updatedTweet;
    } catch (err: unknown) {
      const apiError = err as apiError;
      error.value = apiError.message || "Failed to update tweet";
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const deleteTweet = async (id: string | number) => {
    try {
      isLoading.value = true;
      error.value = null;

      await tweetService.deleteTweet(id);

      const idToDelete = String(id);
      console.log('Deleting tweet with ID:', idToDelete);
      console.log('Current tweets before delete:', tweets.value.length);
      console.log('Tweet IDs before delete:', tweets.value.map(t => t.id));

      tweets.value = tweets.value.filter((tweet) => tweet.id !== idToDelete);

      console.log('Tweets after delete:', tweets.value.length);
      console.log('Tweet IDs after delete:', tweets.value.map(t => t.id));

      pagination.value.total = Math.max(0, pagination.value.total - 1);

      if (selectedTweet.value?.id === idToDelete) {
        selectedTweet.value = null;
      }
    } catch (err: unknown) {
      const apiError = err as apiError;
      error.value = apiError.message || "Failed to delete tweet";
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const fetchMyTweets = async (params?: QueryParams) => {
    try {
      isLoading.value = true;
      error.value = null;

      const response = await tweetService.getMyTweets(params);

      let tweetsArray: Tweet[] = [];
      if (Array.isArray(response)) {
        tweetsArray = response;
      } else {
        tweetsArray = response.tweets || response.data || response.items || [];
      }

      tweets.value = tweetsArray;
      return tweets.value;
    } catch (err: unknown) {
      const apiError = err as apiError;
      error.value = apiError.message || "Failed to fetch my tweets";
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const clearError = () => {
    error.value = null;
  };

  const clearTweets = () => {
    tweets.value = [];
    pagination.value = {
      total: 0,
      page: 1,
      limit: 10,
      hasMore: false,
      nextToken: undefined,
      prevToken: undefined,
    };
  };

  const clearSelectedTweet = () => {
    selectedTweet.value = null;
  };

  const setSelectedTweet = (tweet: Tweet) => {
    selectedTweet.value = tweet;
  };

  const resetState = () => {
    tweets.value = [];
    selectedTweet.value = null;
    error.value = null;
    isLoading.value = false;
    pagination.value = {
      total: 0,
      page: 1,
      limit: 10,
      hasMore: false,
      nextToken: undefined,
      prevToken: undefined,
    };
  };

  const fetchNextPage = async (additionalParams?: Omit<QueryParams, 'token'>) => {
    if (!pagination.value.nextToken) {
      return null;
    }

    const params: QueryParams = {
      ...additionalParams,
      token: pagination.value.nextToken,
      limit: pagination.value.limit,
    };

    return fetchTweets(params);
  };

  const fetchPrevPage = async (additionalParams?: Omit<QueryParams, 'token'>) => {
    if (!pagination.value.prevToken) {
      return null;
    }

    const params: QueryParams = {
      ...additionalParams,
      token: pagination.value.prevToken,
      limit: pagination.value.limit,
    };

    return fetchTweets(params);
  };

  return {
    tweets,
    selectedTweet,
    isLoading,
    error,
    pagination,

    totalTweets,
    hasTweets,
    currentPage,
    hasMoreTweets,
    nextToken,
    prevToken,

    fetchTweets,
    fetchTweetById,
    createTweet,
    updateTweet,
    deleteTweet,
    fetchMyTweets,
    fetchNextPage,
    fetchPrevPage,
    clearError,
    clearTweets,
    clearSelectedTweet,
    setSelectedTweet,
    resetState,
  };
});
