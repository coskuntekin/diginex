<script setup lang="ts">
import { ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuth, notify } from "@/utils";

const router = useRouter();
const route = useRoute();
const { isLoading, login } = useAuth();

const isFormInvalid = ref<boolean>(false);

function invalidateForm() {
  isFormInvalid.value = true;
}

const user = ref({
  username: "",
  password: "",
});

async function submitLogin(event: Event) {
  const target = event.target as HTMLFormElement;
  try {
    if (target.checkValidity()) {
      await login({
        username: user.value.username,
        password: user.value.password,
      });
      const redirectTo = (route.query.redirect as string) || "/app/dashboard";
      router.push(redirectTo);
    } else {
      notify.warning("Please fill out all required fields correctly");
    }
  } catch (error: unknown) {
    console.error("Login error:", error);
  }
}
</script>

<template>
  <div class="mb-6">
    <h2 class="text-2xl font-bold text-gray-800 mb-2">Welcome Back</h2>
    <p class="text-gray-600 text-sm">
      Please enter your credentials to access your account. All fields marked
      with <span class="text-red-500">*</span> are required.
    </p>
  </div>

  <form
    @submit.prevent="submitLogin"
    class="w-full"
    :class="isFormInvalid ? 'form--invalid' : false"
    novalidate
    role="form"
  >
    <div class="flex flex-col mb-6">
      <label for="username" class="mb-2 text-gray-700 font-medium">
        Username <span class="text-red-500">*</span>
      </label>
      <input
        type="text"
        name="username"
        id="username"
        @invalid="invalidateForm"
        v-model="user.username"
        required
        minlength="2"
        maxlength="20"
        placeholder="e.g., johnsmith123"
        class="w-full form__input border-2 p-1.5 outline-none border-gray-400 focus:border-gray-500 rounded"
      />
      <small class="mt-1 text-gray-500 text-xs">
        Enter the username you used when registering
      </small>
    </div>
    <div class="flex flex-col mb-6">
      <label for="password" class="mb-2 text-gray-700 font-medium">
        Password <span class="text-red-500">*</span>
      </label>
      <input
        type="password"
        name="password"
        id="password"
        @invalid="invalidateForm"
        v-model="user.password"
        minlength="4"
        maxlength="20"
        required
        placeholder="Enter your password"
        class="w-full form__input border-2 p-1.5 outline-none border-gray-400 focus:border-gray-500 rounded"
      />
      <small class="mt-1 text-gray-500 text-xs">
        Use the password you created during registration
      </small>
    </div>
    <button
      type="submit"
      :disabled="isLoading"
      class="inline-flex w-full items-center justify-center h-12 gap-2 px-6 text-sm font-medium tracking-wide text-white transition duration-300 rounded focus-visible:outline-none justify-self-center whitespace-nowrap bg-amber-500 hover:bg-amber-600 focus:bg-amber-700 disabled:cursor-not-allowed disabled:border-amber-300 disabled:bg-amber-300 disabled:shadow-none"
    >
      <span> Login </span>
      <span v-if="isLoading" class="relative only:-mx-6">
        <svg
          class="w-5 h-5 text-white animate-spin"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          role="graphics-symbol"
          aria-labelledby="title-05 desc-05"
        >
          <circle
            class="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="4"
          ></circle>
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      </span>
    </button>
  </form>

  <div class="mt-6 text-center">
    <p class="text-sm text-slate-500">
      Don't have an account?
      <router-link
        :to="{ name: 'register' }"
        class="text-amber-500 hover:text-amber-600 transition-colors font-medium"
      >
        Register here
      </router-link>
    </p>
  </div>
</template>
