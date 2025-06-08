<script setup lang="ts">
import Header from "@/partials/Header.vue";

defineOptions({
  name: "MainLayout",
});
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <Header />
    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <router-view />
    </main>
  </div>
</template>
