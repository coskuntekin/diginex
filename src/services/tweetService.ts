import { BaseService } from './baseService';
import type {
  Tweet,
  CreateTweetRequest,
  UpdateTweetRequest,
  QueryParams,
  PaginatedResponse
} from '@/types/api';

export class TweetService extends BaseService {
  async getTweets(params?: QueryParams): Promise<PaginatedResponse<Tweet> | Tweet[]> {
    return this.get<PaginatedResponse<Tweet> | Tweet[]>('/tweets', params);
  }

  async getTweet(id: string | number): Promise<Tweet> {
    return this.get<Tweet>(`/tweets/${id}`);
  }

  async getTweetById(id: string | number): Promise<Tweet> {
    return this.get<Tweet>(`/tweets/${id}`);
  }

  async createTweet(tweetData: CreateTweetRequest): Promise<Tweet> {
    return this.post<Tweet>('/tweets', tweetData);
  }

  async updateTweet(id: string | number, tweetData: UpdateTweetRequest): Promise<Tweet> {
    return this.put<Tweet>(`/tweets/${id}`, tweetData);
  }

  async deleteTweet(id: string | number): Promise<void> {
    return this.delete<void>(`/tweets/${id}`);
  }
}

export const tweetService = new TweetService();
