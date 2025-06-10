import { useTweetStore } from "@/stores";
import { storeToRefs } from "pinia";
import type {
  CreateTweetRequest,
  QueryParams,
  UpdateTweetRequest,
  Tweet,
} from "@/types/api";

export function useTweet() {
  const tweetStore = useTweetStore();
  const {
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
  } = storeToRefs(tweetStore);

  const fetchTweets = async (params?: QueryParams) => {
    return await tweetStore.fetchTweets(params);
  };

  const fetchTweetById = async (id: string | number) => {
    return await tweetStore.fetchTweetById(id);
  };

  const createTweet = async (tweetData: CreateTweetRequest) => {
    return await tweetStore.createTweet(tweetData);
  };

  const updateTweet = async (
    id: string | number,
    tweetData: UpdateTweetRequest
  ) => {
    return await tweetStore.updateTweet(id, tweetData);
  };

  const deleteTweet = async (id: string | number) => {
    await tweetStore.deleteTweet(id);
  };

  const fetchNextPage = async (additionalParams?: Omit<QueryParams, 'token'>) => {
    return await tweetStore.fetchNextPage(additionalParams);
  };

  const fetchPrevPage = async (additionalParams?: Omit<QueryParams, 'token'>) => {
    return await tweetStore.fetchPrevPage(additionalParams);
  };

  const clearError = () => {
    tweetStore.clearError();
  };

  const clearTweets = () => {
    tweetStore.clearTweets();
  };

  const clearSelectedTweet = () => {
    tweetStore.clearSelectedTweet();
  };

  const setSelectedTweet = (tweet: Tweet) => {
    tweetStore.setSelectedTweet(tweet);
  };

  const resetState = () => {
    tweetStore.resetState();
  };

  const fetchTweetsWithOrder = async (order: string, additionalParams?: Omit<QueryParams, 'order'>) => {
    return await fetchTweets({ ...additionalParams, order });
  };

  const fetchTweetsWithPagination = async (page: number, limit: number = 10, additionalParams?: Omit<QueryParams, 'page' | 'limit'>) => {
    return await fetchTweets({ ...additionalParams, page, limit });
  };

  const fetchTweetsWithToken = async (token: string, additionalParams?: Omit<QueryParams, 'token'>) => {
    return await fetchTweets({ ...additionalParams, token });
  };

  const searchTweets = async (search: string, additionalParams?: Omit<QueryParams, 'search'>) => {
    return await fetchTweets({ ...additionalParams, search });
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
    fetchNextPage,
    fetchPrevPage,
    clearError,
    clearTweets,
    clearSelectedTweet,
    setSelectedTweet,
    resetState,

    fetchTweetsWithOrder,
    fetchTweetsWithPagination,
    fetchTweetsWithToken,
    searchTweets,
  };
}
