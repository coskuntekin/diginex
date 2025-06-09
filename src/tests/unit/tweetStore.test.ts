import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useTweetStore } from '@/stores/tweet';
import { tweetService } from '@/services';
import { createMockTweet } from '../utils';

// Mock the tweet service
vi.mock('@/services', () => ({
  tweetService: {
    getTweets: vi.fn(),
    getTweet: vi.fn(),
    getTweetById: vi.fn(),
    createTweet: vi.fn(),
    updateTweet: vi.fn(),
    deleteTweet: vi.fn(),
  }
}));

describe('Tweet Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it('should initialize with default state', () => {
    const store = useTweetStore();

    expect(store.tweets).toEqual([]);
    expect(store.currentTweet).toBeNull();
    expect(store.isLoading).toBe(false);
    expect(store.error).toBeNull();
    expect(store.currentPage).toBe(1);
    expect(store.totalPages).toBe(0);
    expect(store.hasNextPage).toBe(false);
    expect(store.hasPrevPage).toBe(false);
  });

  it('should fetch tweets successfully', async () => {
    const store = useTweetStore();
    const mockTweets = [
      createMockTweet({ id: '1' }),
      createMockTweet({ id: '2' })
    ];
    const mockResponse = {
      tweets: mockTweets,
      total: 2,
      page: 1,
      limit: 10
    };

    vi.mocked(tweetService.getTweets).mockResolvedValue(mockResponse);

    await store.fetchTweets();

    expect(tweetService.getTweets).toHaveBeenCalledWith({
      page: 1,
      limit: 10
    });
    expect(store.tweets).toEqual(mockTweets);
    expect(store.currentPage).toBe(1);
    expect(store.error).toBeNull();
  });

  it('should handle fetch tweets error', async () => {
    const store = useTweetStore();
    const errorMessage = 'Failed to fetch tweets';

    vi.mocked(tweetService.getTweets).mockRejectedValue(new Error(errorMessage));

    await expect(store.fetchTweets()).rejects.toThrow(errorMessage);
    expect(store.error).toBe(errorMessage);
    expect(store.tweets).toEqual([]);
  });

  it('should fetch single tweet successfully', async () => {
    const store = useTweetStore();
    const mockTweet = createMockTweet({ id: '1' });

    vi.mocked(tweetService.getTweetById).mockResolvedValue(mockTweet);

    await store.fetchTweet('1');

    expect(tweetService.getTweetById).toHaveBeenCalledWith('1');
    expect(store.currentTweet).toEqual(mockTweet);
    expect(store.error).toBeNull();
  });

  it('should create tweet successfully', async () => {
    const store = useTweetStore();
    const newTweet = createMockTweet({ id: '1', title: 'New Tweet' });

    vi.mocked(tweetService.createTweet).mockResolvedValue(newTweet);

    const result = await store.createTweet({
      title: 'New Tweet',
      content: 'Tweet content'
    });

    expect(tweetService.createTweet).toHaveBeenCalledWith({
      title: 'New Tweet',
      content: 'Tweet content'
    });
    expect(store.tweets.length).toBe(1);
    expect(store.tweets[0]).toEqual(newTweet);
    expect(result).toEqual(newTweet);
  });

  it('should update tweet successfully', async () => {
    const store = useTweetStore();
    const originalTweet = createMockTweet({ id: '1', title: 'Original' });
    const updatedTweet = createMockTweet({ id: '1', title: 'Updated' });

    store.tweets = [originalTweet];
    store.currentTweet = originalTweet;

    vi.mocked(tweetService.updateTweet).mockResolvedValue(updatedTweet);

    const result = await store.updateTweet('1', { title: 'Updated' });

    expect(tweetService.updateTweet).toHaveBeenCalledWith('1', { title: 'Updated' });
    expect(store.tweets[0]).toEqual(updatedTweet);
    expect(store.currentTweet).toEqual(updatedTweet);
    expect(result).toEqual(updatedTweet);
  });

  it('should delete tweet successfully', async () => {
    const store = useTweetStore();
    const tweet = createMockTweet({ id: '1' });

    store.tweets = [tweet];

    vi.mocked(tweetService.deleteTweet).mockResolvedValue(undefined);

    await store.deleteTweet('1');

    expect(tweetService.deleteTweet).toHaveBeenCalledWith('1');
    expect(store.tweets).toEqual([]);
  });

  it('should compute pagination properties correctly', () => {
    const store = useTweetStore();

    store.currentPage = 2;
    store.totalPages = 5;

    expect(store.hasNextPage).toBe(true);
    expect(store.hasPrevPage).toBe(true);

    store.currentPage = 1;
    expect(store.hasPrevPage).toBe(false);

    store.currentPage = 5;
    expect(store.hasNextPage).toBe(false);
  });

  it('should handle loading state correctly', async () => {
    const store = useTweetStore();

    vi.mocked(tweetService.getTweets).mockImplementation(() =>
      new Promise(resolve => setTimeout(() => resolve({
        tweets: [],
        total: 0,
        page: 1,
        limit: 10
      }), 100))
    );

    const fetchPromise = store.fetchTweets();
    expect(store.isLoading).toBe(true);

    await fetchPromise;
    expect(store.isLoading).toBe(false);
  });

  it('should clear current tweet', () => {
    const store = useTweetStore();
    store.currentTweet = createMockTweet();

    store.clearCurrentTweet();

    expect(store.currentTweet).toBeNull();
  });

  it('should clear error', () => {
    const store = useTweetStore();
    store.error = 'Some error';

    store.clearError();

    expect(store.error).toBeNull();
  });
});
