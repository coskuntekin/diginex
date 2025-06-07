<template>
  <div class="space-y-6">
    <!-- Welcome Section -->
    <div class="bg-white shadow rounded-lg p-6">
      <h1 class="text-2xl font-bold text-gray-900 mb-2">
        Welcome to your Dashboard
      </h1>
      <p class="text-gray-600">
        You have successfully logged in! This is your personal dashboard.
      </p>
    </div>

    <!-- User Info Card -->
    <div class="bg-white shadow rounded-lg p-6">
      <h2 class="text-lg font-semibold text-gray-900 mb-4">
        Your Profile Information
      </h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-500">Name</label>
          <p class="mt-1 text-sm text-gray-900">{{ authStore.userName || 'N/A' }}</p>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-500">Email</label>
          <p class="mt-1 text-sm text-gray-900">{{ authStore.userEmail || 'N/A' }}</p>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-500">Role</label>
          <p class="mt-1 text-sm text-gray-900">{{ authStore.userRole || 'N/A' }}</p>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-500">Status</label>
          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Active
          </span>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="bg-white shadow rounded-lg p-6">
      <h2 class="text-lg font-semibold text-gray-900 mb-4">
        Quick Actions
      </h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button class="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200">
          <div class="text-center">
            <div class="text-2xl mb-2">📊</div>
            <div class="font-medium text-gray-900">View Reports</div>
            <div class="text-sm text-gray-500">Access your analytics</div>
          </div>
        </button>
        <button class="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200">
          <div class="text-center">
            <div class="text-2xl mb-2">⚙️</div>
            <div class="font-medium text-gray-900">Settings</div>
            <div class="text-sm text-gray-500">Manage your preferences</div>
          </div>
        </button>
        <button class="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200">
          <div class="text-center">
            <div class="text-2xl mb-2">📝</div>
            <div class="font-medium text-gray-900">Tasks</div>
            <div class="text-sm text-gray-500">View your task list</div>
          </div>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'

defineOptions({
  name: 'DashboardPage',
})

const authStore = useAuthStore()
</script>
