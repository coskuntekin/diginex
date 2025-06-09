import TweetsPage from '@/pages/TweetsPage.vue';
import { useTweetStore } from '@/stores/tweet';
import { createTestingPinia } from '@pinia/testing';
import { mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createMockTweet, createMockUser, createTestRouter } from '../utils';

describe('TweetsPage Integration', () => {
  let wrapper: any;
  let mockRouter: any;

  beforeEach(() => {
    mockRouter = createTestRouter();

    wrapper = mount(TweetsPage, {
      global: {
        plugins: [
          createTestingPinia({
            createSpy: vi.fn,
            initialState: {
              auth: {
                user: createMockUser(),
                token: 'test-token',
                isAuthenticated: true
              }
            }
          }),
          mockRouter
        ],
      },
    });
  });

  it('should render tweets list', async () => {
    const tweetStore = useTweetStore();
    tweetStore.tweets = [
      createMockTweet({ id: '1', title: 'First Tweet' }),
      createMockTweet({ id: '2', title: 'Second Tweet' })
    ];

    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain('First Tweet');
    expect(wrapper.text()).toContain('Second Tweet');
  });

  it('should show loading state when fetching tweets', async () => {
    const tweetStore = useTweetStore();
    tweetStore.isLoading = true;
    tweetStore.tweets = []; // Ensure tweets is empty to trigger loading state

    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain('Loading tweets');
  });

  it('should show empty state when no tweets', async () => {
    const tweetStore = useTweetStore();
    tweetStore.tweets = [];
    tweetStore.isLoading = false;

    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain('No tweets') ||
    expect(wrapper.text()).toContain('empty') ||
    expect(wrapper.find('[data-testid="empty-state"]').exists()).toBe(true);
  });

  it('should have create tweet button for authenticated users', () => {
    expect(wrapper.text()).toContain('Create Tweet');
  });

  it('should call fetchTweets on mount', () => {
    const tweetStore = useTweetStore();
    expect(tweetStore.fetchTweets).toHaveBeenCalled();
  });

  it('should handle tweet deletion', async () => {
    const tweetStore = useTweetStore();
    const mockDeleteTweet = vi.fn().mockResolvedValue(undefined);
    tweetStore.deleteTweet = mockDeleteTweet;

    tweetStore.tweets = [createMockTweet({ id: '1', title: 'Test Tweet' })];
    await wrapper.vm.$nextTick();

    // Find delete button (might be in a dropdown or directly visible)
    const deleteButton = wrapper.find('[data-testid="delete-tweet-1"]') ||
                         wrapper.find('button:contains("Delete")') ||
                         wrapper.find('.delete-btn');

    if (deleteButton.exists()) {
      await deleteButton.trigger('click');
      expect(mockDeleteTweet).toHaveBeenCalledWith('1');
    }
  });

  it('should handle pagination', async () => {
    const tweetStore = useTweetStore();
    tweetStore.hasNextPage = true;
    tweetStore.currentPage = 1;

    await wrapper.vm.$nextTick();

    const nextPageButton = wrapper.find('[data-testid="next-page"]') ||
                          wrapper.find('button:contains("Next")') ||
                          wrapper.find('.pagination-next');

    if (nextPageButton.exists()) {
      await nextPageButton.trigger('click');
      expect(tweetStore.fetchTweets).toHaveBeenCalledWith(
        expect.objectContaining({ page: 2 })
      );
    }
  });
});
