<script setup lang="ts">
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useAuth, notify } from "@/utils";

const router = useRouter();
const { isLoading, register } = useAuth();

const isFormInvalid = ref<boolean>(false);

function invalidateForm() {
  isFormInvalid.value = true;
}

const user = ref({
  username: "",
  password: "",
  firstName: "",
  lastName: "",
  dateOfBirth: "",
});

const passwordValidation = computed(() => {
  const password = user.value.password;
  return {
    length: password.length >= 8 && password.length <= 60,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    number: /\d/.test(password),
    special: /[!@#$%^&*.?]/.test(password),
  };
});

async function submitRegister(event: Event) {
  const target = event.target as HTMLFormElement;
  try {
    if (target.checkValidity()) {
      await register({
        username: user.value.username,
        password: user.value.password,
        firstName: user.value.firstName,
        lastName: user.value.lastName,
        dateOfBirth: user.value.dateOfBirth,
      });

      notify.success(
        "Account created successfully! Please log in with your credentials."
      );

      router.push({ name: "login" });
    } else {
      notify.warning("Please fill out all required fields");
    }
  } catch (error: unknown) {
    console.error("Registration error:", error);
  }
}
</script>

<template>
  <div class="mb-6">
    <h2 class="text-2xl font-bold text-gray-800 mb-2">Create Your Account</h2>
    <p class="text-gray-600 text-sm">
      Please fill out all required fields marked with
      <span class="text-red-500">*</span> to complete your registration.
    </p>
  </div>

  <form
    @submit.prevent="submitRegister"
    class="w-full"
    :class="isFormInvalid ? 'form--invalid' : false"
    novalidate
    role="form"
  >
    <div class="flex flex-col mb-6">
      <label for="firstName" class="mb-2 text-gray-700 font-medium">
        First Name <span class="text-red-500">*</span>
      </label>
      <input
        type="text"
        name="firstName"
        id="firstName"
        @invalid="invalidateForm"
        v-model="user.firstName"
        required
        minlength="2"
        maxlength="50"
        placeholder="e.g., John"
        class="w-full form__input border-2 p-1.5 outline-none border-gray-400 focus:border-gray-500 rounded"
      />
      <small class="mt-1 text-gray-500 text-xs">
        Enter your legal first name (2-50 characters)
      </small>
    </div>
    <div class="flex flex-col mb-6">
      <label for="lastName" class="mb-2 text-gray-700 font-medium">
        Last Name <span class="text-red-500">*</span>
      </label>
      <input
        type="text"
        name="lastName"
        id="lastName"
        @invalid="invalidateForm"
        v-model="user.lastName"
        required
        minlength="2"
        maxlength="50"
        placeholder="e.g., Smith"
        class="w-full form__input border-2 p-1.5 outline-none border-gray-400 focus:border-gray-500 rounded"
      />
      <small class="mt-1 text-gray-500 text-xs">
        Enter your legal last name (2-50 characters)
      </small>
    </div>
    <div class="flex flex-col mb-6">
      <label for="dateOfBirth" class="mb-2 text-gray-700 font-medium">
        Date of Birth <span class="text-red-500">*</span>
      </label>
      <input
        type="date"
        name="dateOfBirth"
        id="dateOfBirth"
        @invalid="invalidateForm"
        v-model="user.dateOfBirth"
        required
        max="2007-06-07"
        class="w-full form__input border-2 p-1.5 outline-none border-gray-400 focus:border-gray-500 rounded"
      />
      <small class="mt-1 text-gray-500 text-xs">
        You must be at least 18 years old to register
      </small>
    </div>

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
        Choose a unique username (2-20 characters, letters and numbers only)
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
        minlength="8"
        maxlength="60"
        pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*.?]).{8,60}$"
        required
        placeholder="Enter a secure password"
        class="w-full form__input border-2 p-1.5 outline-none border-gray-400 focus:border-gray-500 rounded"
      />

      <!-- Password Requirements Checklist -->
      <div v-if="user.password" class="mt-2 space-y-1">
        <div class="flex items-center text-xs">
          <span
            :class="
              passwordValidation.length ? 'text-green-600' : 'text-gray-400'
            "
            class="mr-2"
          >
            {{ passwordValidation.length ? "✓" : "○" }}
          </span>
          <span
            :class="
              passwordValidation.length ? 'text-green-600' : 'text-gray-600'
            "
          >
            8-60 characters
          </span>
        </div>
        <div class="flex items-center text-xs">
          <span
            :class="
              passwordValidation.lowercase ? 'text-green-600' : 'text-gray-400'
            "
            class="mr-2"
          >
            {{ passwordValidation.lowercase ? "✓" : "○" }}
          </span>
          <span
            :class="
              passwordValidation.lowercase ? 'text-green-600' : 'text-gray-600'
            "
          >
            At least 1 lowercase letter
          </span>
        </div>
        <div class="flex items-center text-xs">
          <span
            :class="
              passwordValidation.uppercase ? 'text-green-600' : 'text-gray-400'
            "
            class="mr-2"
          >
            {{ passwordValidation.uppercase ? "✓" : "○" }}
          </span>
          <span
            :class="
              passwordValidation.uppercase ? 'text-green-600' : 'text-gray-600'
            "
          >
            At least 1 uppercase letter
          </span>
        </div>
        <div class="flex items-center text-xs">
          <span
            :class="
              passwordValidation.number ? 'text-green-600' : 'text-gray-400'
            "
            class="mr-2"
          >
            {{ passwordValidation.number ? "✓" : "○" }}
          </span>
          <span
            :class="
              passwordValidation.number ? 'text-green-600' : 'text-gray-600'
            "
          >
            At least 1 number
          </span>
        </div>
        <div class="flex items-center text-xs">
          <span
            :class="
              passwordValidation.special ? 'text-green-600' : 'text-gray-400'
            "
            class="mr-2"
          >
            {{ passwordValidation.special ? "✓" : "○" }}
          </span>
          <span
            :class="
              passwordValidation.special ? 'text-green-600' : 'text-gray-600'
            "
          >
            At least 1 special character (!@#$%^&*.?)
          </span>
        </div>
      </div>

      <small v-if="!user.password" class="mt-1 text-gray-500 text-xs">
        Password must be 8-60 characters, contain at least 1 number, 1 uppercase
        letter, 1 lowercase letter, and 1 special character (!@#$%^&*.?)
      </small>
    </div>
    <button
      type="submit"
      :disabled="isLoading"
      class="inline-flex w-full items-center justify-center h-12 gap-2 px-6 text-sm font-medium tracking-wide text-white transition duration-300 rounded focus-visible:outline-none justify-self-center whitespace-nowrap bg-amber-500 hover:bg-amber-600 focus:bg-amber-700 disabled:cursor-not-allowed disabled:border-amber-300 disabled:bg-amber-300 disabled:shadow-none"
    >
      <span>Register</span>
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
      Already have an account?
      <router-link
        :to="{ name: 'login' }"
        class="text-amber-500 hover:text-amber-600 transition-colors font-medium"
      >
        Login here
      </router-link>
    </p>
  </div>
</template>
