<script setup lang="ts">
import { useAuthStore } from "@/stores/auth";

defineOptions({
  name: "DashboardPage",
});

const authStore = useAuthStore();
</script>

<template>
  <div class="space-y-6">
    <div class="bg-white shadow rounded-lg p-6">
      <h1 class="text-2xl font-bold text-gray-900 mb-2">
        Welcome to your Dashboard
      </h1>
      <p class="text-gray-600">
        You have successfully logged in! This is your personal dashboard.
      </p>
    </div>

    <div class="bg-white shadow rounded-lg p-6">
      <h2 class="text-lg font-semibold text-gray-900 mb-4">
        Your Profile Information
      </h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-500">Name</label>
          <p class="mt-1 text-sm text-gray-900">
            {{ authStore.userName || "N/A" }}
          </p>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-500">Role</label>
          <p class="mt-1 text-sm text-gray-900">
            {{ authStore.userRole || "N/A" }}
          </p>
        </div>
      </div>
    </div>

    <div class="bg-white shadow rounded-lg p-6">
      <h2 class="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <router-link
          :to="{ name: 'tweets' }"
          class="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 block"
        >
          <div class="text-center">
            <div class="flex justify-center items-center mb-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                class="size-10"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z"
                />
              </svg>
            </div>
            <div class="font-medium text-gray-900">View Tweets</div>
            <div class="text-sm text-gray-500">See what's happening</div>
          </div>
        </router-link>
        <router-link
          :to="{ name: 'tweet-create' }"
          class="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 block"
        >
          <div class="text-center">
            <div class="flex justify-center items-center mb-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                class="size-10"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                />
              </svg>
            </div>
            <div class="font-medium text-gray-900">Create Tweet</div>
            <div class="text-sm text-gray-500">Share your thoughts</div>
          </div>
        </router-link>
        <router-link
          :to="{ name: 'profile', params: { id: authStore.user?.id } }"
          class="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 block"
        >
          <div class="text-center">
            <div class="flex justify-center items-center mb-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                class="size-10"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                />
              </svg>
            </div>
            <div class="font-medium text-gray-900">My Profile</div>
            <div class="text-sm text-gray-500">Manage your profile</div>
          </div>
        </router-link>
      </div>
    </div>
  </div>
</template>
