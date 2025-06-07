<script setup lang="ts">
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";

defineOptions({
  name: "MainLayout",
});

const router = useRouter();
const authStore = useAuthStore();

const handleLogout = async () => {
  try {
    await authStore.logout();
    router.push({ name: "login" });
  } catch (error) {
    console.error("Logout failed:", error);
  }
};
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <nav class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <img src="@/assets/images/logo.png" alt="Logo" class="h-8 w-8" />
            <span class="ml-2 text-xl font-semibold text-gray-900">
              Take Home Challenge
            </span>
          </div>

          <div class="flex items-center space-x-4">
            <span class="text-gray-700">
              Welcome, {{ authStore.userName }}
            </span>
            <button
              @click="handleLogout"
              class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
              :disabled="authStore.isLoading"
            >
              {{ authStore.isLoading ? "Logging out..." : "Logout" }}
            </button>
          </div>
        </div>
      </div>
    </nav>

    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <router-view />
    </main>
  </div>
</template>
