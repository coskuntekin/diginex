<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { useRoute } from "vue-router";
import LoadingSpinner from "@/components/LoadingSpinner.vue";
import { useAuthStore } from "@/stores/auth";
import { useUser } from "@/utils";
import { notify } from "@/utils";
import { formatTimestamp } from "@/utils/dateUtils";
import type { User } from "@/types/api";

const route = useRoute();
const authStore = useAuthStore();
const { fetchUserById, updateUser } = useUser();

const isEditing = ref(false);
const isUpdating = ref(false);
const isLoading = ref(false);
const profileUser = ref<User | null>(null);

const userId = computed(() => route.params.id as string);
const isOwnProfile = computed(
  () => !userId.value || userId.value === authStore.user?.id
);

const formData = ref({
  firstName: "",
  lastName: "",
  dateOfBirth: "",
});

const loadUserData = async () => {
  try {
    isLoading.value = true;

    if (userId.value && userId.value !== authStore.user?.id) {
      const user = await fetchUserById(userId.value);
      profileUser.value = user;
    } else {
      profileUser.value = authStore.user;
    }

    if (profileUser.value) {
      formData.value = {
        firstName: profileUser.value.firstName,
        lastName: profileUser.value.lastName,
        dateOfBirth: profileUser.value.dateOfBirth,
      };
    }
  } catch (error) {
    console.error("Failed to load user data:", error);
    notify.error("Failed to load profile data");
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  loadUserData();
});

watch(
  () => route.params.id,
  () => {
    loadUserData();
  }
);

const displayUser = computed(() => profileUser.value || authStore.user);

const startEditing = () => {
  isEditing.value = true;
  const currentUser = displayUser.value;
  if (currentUser) {
    formData.value = {
      firstName: currentUser.firstName,
      lastName: currentUser.lastName,
      dateOfBirth: currentUser.dateOfBirth,
    };
  }
};

const cancelEditing = () => {
  isEditing.value = false;
  const currentUser = displayUser.value;
  if (currentUser) {
    formData.value = {
      firstName: currentUser.firstName,
      lastName: currentUser.lastName,
      dateOfBirth: currentUser.dateOfBirth,
    };
  }
};

const updateProfile = async () => {
  try {
    const targetUserId = userId.value || authStore.user?.id;

    if (!targetUserId) {
      notify.error("User ID is required for profile update");
      return;
    }

    if (
      !formData.value.firstName.trim() ||
      !formData.value.lastName.trim() ||
      !formData.value.dateOfBirth
    ) {
      notify.warning("Please fill in all required fields");
      return;
    }

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(formData.value.dateOfBirth)) {
      notify.error("Invalid date format. Please use YYYY-MM-DD format.");
      return;
    }

    const birthDate = new Date(formData.value.dateOfBirth);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      age < 18 ||
      (age === 18 && monthDiff < 0) ||
      (age === 18 && monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      notify.error("You must be at least 18 years old");
      return;
    }

    isUpdating.value = true;

    const updateData = {
      firstName: formData.value.firstName.trim(),
      lastName: formData.value.lastName.trim(),
      dateOfBirth: formData.value.dateOfBirth,
    };

    console.log("Updating profile with data:", updateData);
    console.log("User ID:", targetUserId);

    if (isOwnProfile.value) {
      await authStore.updateProfile(updateData);
      profileUser.value = authStore.user;
    } else {
      await updateUser(targetUserId, updateData);
      await loadUserData();
    }

    notify.success("Profile updated successfully!");
    isEditing.value = false;
  } catch (error) {
    console.error("Failed to update profile:", error);
    notify.error("Failed to update profile. Please try again.");
  } finally {
    isUpdating.value = false;
  }
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const formatAccountDate = (timestamp: number | undefined) => {
  if (!timestamp) return "Unknown";
  return formatTimestamp(timestamp, "MMMM DD, YYYY [at] h:mm A");
};
</script>

<template>
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
    <div v-if="isLoading" class="flex justify-center items-center py-12">
      <LoadingSpinner size="xl" color="#d97706" />
    </div>

    <template v-else>
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">
          {{ isOwnProfile ? "My Profile" : "User Profile" }}
        </h1>
        <p class="text-gray-600">
          {{
            isOwnProfile
              ? "Manage your personal information and account details."
              : "View user profile information."
          }}
        </p>
      </div>

      <div class="bg-white rounded-lg shadow-md overflow-hidden">
        <div class="bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-4">
          <div class="flex items-center justify-between">
            <div>
              <h2
                class="text-2xl font-bold text-white truncate max-w-lg"
                :title="displayUser?.firstName + ' ' + displayUser?.lastName"
              >
                {{ displayUser?.firstName }} {{ displayUser?.lastName }}
              </h2>
              <p class="text-amber-100">@{{ displayUser?.username }}</p>
            </div>
            <button
              type="button"
              v-if="!isEditing && isOwnProfile"
              @click="startEditing"
              class="bg-white text-amber-600 hover:bg-amber-50 px-4 py-2 rounded-md text-sm font-semibold transition-all duration-200 shadow-sm border border-white"
            >
              Edit Profile
            </button>
          </div>
        </div>

        <div class="px-6 py-6">
          <div v-if="!isEditing" class="space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1"
                  >Username</label
                >
                <p class="text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
                  {{ displayUser?.username }}
                </p>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1"
                  >First Name</label
                >
                <p class="text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
                  {{ displayUser?.firstName }}
                </p>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1"
                  >Last Name</label
                >
                <p class="text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
                  {{ displayUser?.lastName }}
                </p>
              </div>

              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-1"
                  >Date of Birth</label
                >
                <p class="text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
                  {{
                    displayUser?.dateOfBirth
                      ? formatDate(displayUser.dateOfBirth)
                      : "Not provided"
                  }}
                </p>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1"
                  >Role</label
                >
                <span
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize"
                  :class="
                    displayUser?.role === 'ADMIN'
                      ? 'bg-purple-100 text-purple-800'
                      : 'bg-green-100 text-green-800'
                  "
                >
                  {{ displayUser?.role }}
                </span>
              </div>
            </div>
          </div>

          <div v-else-if="isOwnProfile" class="space-y-6">
            <form @submit.prevent="updateProfile" class="space-y-6">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    for="firstName"
                    class="block text-sm font-medium text-gray-700 mb-2"
                  >
                    First Name <span class="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    v-model="formData.firstName"
                    required
                    minlength="2"
                    maxlength="50"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                    placeholder="Enter your first name"
                  />
                </div>

                <div>
                  <label
                    for="lastName"
                    class="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Last Name <span class="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    v-model="formData.lastName"
                    required
                    minlength="2"
                    maxlength="50"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                    placeholder="Enter your last name"
                  />
                </div>

                <div class="md:col-span-2">
                  <label
                    for="dateOfBirth"
                    class="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Date of Birth <span class="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    id="dateOfBirth"
                    v-model="formData.dateOfBirth"
                    required
                    max="2007-06-07"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                  />
                  <small class="text-gray-500 text-xs mt-1"
                    >You must be at least 18 years old</small
                  >
                </div>
              </div>

              <div
                class="flex justify-end space-x-3 pt-6 border-t border-gray-200"
              >
                <button
                  type="button"
                  @click="cancelEditing"
                  :disabled="isUpdating"
                  class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  :disabled="isUpdating"
                  class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <LoadingSpinner
                    v-if="isUpdating"
                    size="sm"
                    color="white"
                    container-class="mr-2"
                  />
                  {{ isUpdating ? "Updating..." : "Update Profile" }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div class="mt-6 bg-white rounded-lg shadow-md overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-lg font-medium text-gray-900">Account Information</h3>
        </div>
        <div class="px-6 py-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1"
                >Account Created</label
              >
              <p
                class="text-gray-900"
                :title="
                  displayUser?.createdAt
                    ? formatTimestamp(
                        displayUser.createdAt,
                        'dddd, MMMM DD, YYYY [at] h:mm:ss A'
                      )
                    : 'Unknown'
                "
              >
                {{ formatAccountDate(displayUser?.createdAt) }}
              </p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1"
                >Last Updated</label
              >
              <p
                class="text-gray-900"
                :title="
                  displayUser?.updatedAt
                    ? formatTimestamp(
                        displayUser.updatedAt,
                        'dddd, MMMM DD, YYYY [at] h:mm:ss A'
                      )
                    : 'Unknown'
                "
              >
                {{ formatAccountDate(displayUser?.updatedAt) }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
