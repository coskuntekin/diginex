import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TweetService } from '@/services/tweetService';
import { createMockTweet } from '../utils';
import type { CreateTweetRequest, UpdateTweetRequest } from '@/types/api';

// Mock axios
vi.mock('axios');
const mockAxios = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
  create: vi.fn(() => ({
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  })),
}));

vi.mock('@/services/api', () => ({
  default: mockAxios,
}));

describe('TweetService', () => {
  let tweetService: TweetService;

  beforeEach(() => {
    tweetService = new TweetService();
    vi.clearAllMocks();
  });

  describe('getTweets', () => {
    it('should fetch tweets with default parameters', async () => {
      const mockTweets = [createMockTweet({ id: '1' }), createMockTweet({ id: '2' })];
      const mockResponse = {
        tweets: mockTweets,
        total: 2,
        page: 1,
        limit: 10
      };

      mockAxios.get.mockResolvedValueOnce({
        data: mockResponse,
        status: 200
      });

      const result = await tweetService.getTweets();

      expect(mockAxios.get).toHaveBeenCalledWith('/tweets', { params: undefined });
      expect(result).toEqual(mockResponse);
    });

    it('should fetch tweets with query parameters', async () => {
      const mockResponse = { tweets: [], total: 0, page: 2, limit: 5 };

      mockAxios.get.mockResolvedValueOnce({
        data: mockResponse,
        status: 200
      });

      await tweetService.getTweets({
        page: 2,
        limit: 5,
        search: 'test'
      });

      expect(mockAxios.get).toHaveBeenCalledWith('/tweets', {
        params: {
          page: 2,
          limit: 5,
          search: 'test'
        }
      });
    });

    it('should handle API response with data wrapper', async () => {
      const mockTweets = [createMockTweet()];
      const mockResponse = {
        data: {
          tweets: mockTweets,
          total: 1,
          page: 1,
          limit: 10
        }
      };

      mockAxios.get.mockResolvedValueOnce({
        data: mockResponse,
        status: 200
      });

      const result = await tweetService.getTweets();

      expect(result).toEqual(mockResponse.data);
    });

    it('should handle errors', async () => {
      const errorMessage = 'Network error';
      mockAxios.get.mockRejectedValueOnce(new Error(errorMessage));

      await expect(tweetService.getTweets()).rejects.toThrow();
    });
  });

  describe('getTweet', () => {
    it('should fetch a tweet by id', async () => {
      const mockTweet = createMockTweet({ id: '1' });

      mockAxios.get.mockResolvedValueOnce({
        data: mockTweet,
        status: 200
      });

      const result = await tweetService.getTweet('1');

      expect(mockAxios.get).toHaveBeenCalledWith('/tweets/1', { params: undefined });
      expect(result).toEqual(mockTweet);
    });

    it('should handle numeric id', async () => {
      const mockTweet = createMockTweet({ id: '123' });

      mockAxios.get.mockResolvedValueOnce({
        data: mockTweet,
        status: 200
      });

      await tweetService.getTweet(123);

      expect(mockAxios.get).toHaveBeenCalledWith('/tweets/123', { params: undefined });
    });

    it('should handle API response with data wrapper', async () => {
      const mockTweet = createMockTweet();
      const mockResponse = {
        data: mockTweet
      };

      mockAxios.get.mockResolvedValueOnce({
        data: mockResponse,
        status: 200
      });

      const result = await tweetService.getTweet('1');

      expect(result).toEqual(mockTweet);
    });
  });

  describe('getTweetById', () => {
    it('should fetch a tweet by id (alias method)', async () => {
      const mockTweet = createMockTweet({ id: '1' });

      mockAxios.get.mockResolvedValueOnce({
        data: mockTweet,
        status: 200
      });

      const result = await tweetService.getTweetById('1');

      expect(mockAxios.get).toHaveBeenCalledWith('/tweets/1', { params: undefined });
      expect(result).toEqual(mockTweet);
    });
  });

  describe('createTweet', () => {
    it('should create a new tweet', async () => {
      const createRequest: CreateTweetRequest = {
        title: 'New Tweet',
        content: 'This is a new tweet'
      };
      const mockTweet = createMockTweet(createRequest);

      mockAxios.post.mockResolvedValueOnce({
        data: mockTweet,
        status: 201
      });

      const result = await tweetService.createTweet(createRequest);

      expect(mockAxios.post).toHaveBeenCalledWith('/tweets', createRequest);
      expect(result).toEqual(mockTweet);
    });

    it('should handle API response with data wrapper', async () => {
      const createRequest: CreateTweetRequest = {
        title: 'New Tweet',
        content: 'This is a new tweet'
      };
      const mockTweet = createMockTweet(createRequest);
      const mockResponse = {
        data: mockTweet
      };

      mockAxios.post.mockResolvedValueOnce({
        data: mockResponse,
        status: 201
      });

      const result = await tweetService.createTweet(createRequest);

      expect(result).toEqual(mockTweet);
    });

    it('should handle validation errors', async () => {
      const createRequest: CreateTweetRequest = {
        title: '',
        content: ''
      };

      const errorResponse = {
        response: {
          data: {
            message: 'Validation failed',
            errors: {
              title: ['Title is required'],
              content: ['Content is required']
            }
          },
          status: 400
        }
      };

      mockAxios.post.mockRejectedValueOnce(errorResponse);

      await expect(tweetService.createTweet(createRequest)).rejects.toThrow();
    });
  });

  describe('updateTweet', () => {
    it('should update an existing tweet', async () => {
      const updateRequest: UpdateTweetRequest = {
        title: 'Updated Tweet',
        content: 'This is an updated tweet'
      };
      const mockTweet = createMockTweet({ ...updateRequest, id: '1' });

      mockAxios.put.mockResolvedValueOnce({
        data: mockTweet,
        status: 200
      });

      const result = await tweetService.updateTweet('1', updateRequest);

      expect(mockAxios.put).toHaveBeenCalledWith('/tweets/1', updateRequest);
      expect(result).toEqual(mockTweet);
    });

    it('should handle numeric id', async () => {
      const updateRequest: UpdateTweetRequest = {
        title: 'Updated Tweet'
      };
      const mockTweet = createMockTweet(updateRequest);

      mockAxios.put.mockResolvedValueOnce({
        data: mockTweet,
        status: 200
      });

      await tweetService.updateTweet(123, updateRequest);

      expect(mockAxios.put).toHaveBeenCalledWith('/tweets/123', updateRequest);
    });

    it('should handle API response with data wrapper', async () => {
      const updateRequest: UpdateTweetRequest = {
        content: 'Updated content'
      };
      const mockTweet = createMockTweet(updateRequest);
      const mockResponse = {
        data: mockTweet
      };

      mockAxios.put.mockResolvedValueOnce({
        data: mockResponse,
        status: 200
      });

      const result = await tweetService.updateTweet('1', updateRequest);

      expect(result).toEqual(mockTweet);
    });
  });

  describe('deleteTweet', () => {
    it('should delete a tweet', async () => {
      mockAxios.delete.mockResolvedValueOnce({
        data: '',
        status: 204
      });

      const result = await tweetService.deleteTweet('1');

      expect(mockAxios.delete).toHaveBeenCalledWith('/tweets/1');
      expect(result).toBeUndefined();
    });

    it('should handle numeric id', async () => {
      mockAxios.delete.mockResolvedValueOnce({
        data: null,
        status: 204
      });

      await tweetService.deleteTweet(123);

      expect(mockAxios.delete).toHaveBeenCalledWith('/tweets/123');
    });

    it('should handle delete errors', async () => {
      const errorResponse = {
        response: {
          data: {
            message: 'Tweet not found'
          },
          status: 404
        }
      };

      mockAxios.delete.mockRejectedValueOnce(errorResponse);

      await expect(tweetService.deleteTweet('999')).rejects.toThrow();
    });
  });

  describe('getMyTweets', () => {
    it('should fetch current user tweets', async () => {
      const mockTweets = [createMockTweet({ id: '1', authorId: 'current-user' })];
      const mockResponse = {
        tweets: mockTweets,
        total: 1,
        page: 1,
        limit: 10
      };

      mockAxios.get.mockResolvedValueOnce({
        data: mockResponse,
        status: 200
      });

      const result = await tweetService.getMyTweets();

      expect(mockAxios.get).toHaveBeenCalledWith('/tweets/my', { params: undefined });
      expect(result).toEqual(mockResponse);
    });

    it('should fetch current user tweets with parameters', async () => {
      const mockResponse = { tweets: [], total: 0, page: 2, limit: 5 };

      mockAxios.get.mockResolvedValueOnce({
        data: mockResponse,
        status: 200
      });

      await tweetService.getMyTweets({
        page: 2,
        limit: 5
      });

      expect(mockAxios.get).toHaveBeenCalledWith('/tweets/my', {
        params: {
          page: 2,
          limit: 5
        }
      });
    });

    it('should handle API response with data wrapper', async () => {
      const mockTweets = [createMockTweet()];
      const mockResponse = {
        data: {
          tweets: mockTweets,
          total: 1,
          page: 1,
          limit: 10
        }
      };

      mockAxios.get.mockResolvedValueOnce({
        data: mockResponse,
        status: 200
      });

      const result = await tweetService.getMyTweets();

      expect(result).toEqual(mockResponse.data);
    });
  });
});
