<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { ElMessageBox, ElDialog } from "element-plus";
import LoadingSpinner from "@/components/LoadingSpinner.vue";
import { useUser, notify } from "@/utils";
import type { User, CreateUserRequest, UpdateUserRequest } from "@/types/api";

defineOptions({
  name: "AdminUsersPage",
});

const { fetchUsers, createUser, updateUser, deleteUser } = useUser();

const users = ref<User[]>([]);
const isLoading = ref(false);
const currentPage = ref(1);
const pageSize = ref(10);
const searchQuery = ref("");

const showUserModal = ref(false);
const isEditMode = ref(false);
const selectedUser = ref<User | null>(null);
const isFormInvalid = ref<boolean>(false);

const userFormRef = ref<HTMLFormElement | null>(null);

function invalidateForm() {
  isFormInvalid.value = true;
}

const userForm = ref<CreateUserRequest>({
  username: "",
  password: "",
  firstName: "",
  lastName: "",
  dateOfBirth: "",
  role: "USER",
});

const passwordValidation = computed(() => {
  const password = userForm.value.password;
  return {
    length: password.length >= 8 && password.length <= 60,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    number: /\d/.test(password),
    special: /[!@#$%^&*.?]/.test(password),
  };
});

const filteredUsers = computed(() => {
  if (!searchQuery.value) return users.value;

  return users.value.filter(
    (user) =>
      user.firstName.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      user.username.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      user.role.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

const paginatedUsers = computed(() => {
  if (!Array.isArray(filteredUsers.value)) {
    return [];
  }
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filteredUsers.value.slice(start, end);
});

const totalPages = computed(() => {
  if (!Array.isArray(filteredUsers.value)) {
    return 0;
  }
  return Math.ceil(filteredUsers.value.length / pageSize.value);
});

const loadUsers = async () => {
  try {
    isLoading.value = true;
    const response = await fetchUsers();
    users.value = Array.isArray(response) ? response : [];
  } catch (error) {
    console.error("Failed to load users:", error);
    notify.error("Failed to load users");
    users.value = [];
  } finally {
    isLoading.value = false;
  }
};

const resetForm = () => {
  userForm.value = {
    username: "",
    password: "",
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    role: "USER",
  };
  isFormInvalid.value = false;

  setTimeout(() => {
    if (userFormRef.value) {
      userFormRef.value.noValidate = false;
      userFormRef.value.noValidate = true;
    }
  }, 0);
};

const openCreateModal = () => {
  isEditMode.value = false;
  selectedUser.value = null;
  resetForm();
  showUserModal.value = true;
};

const openEditModal = (user: User) => {
  isEditMode.value = true;
  selectedUser.value = user;
  userForm.value = {
    username: user.username,
    password: "",
    firstName: user.firstName,
    lastName: user.lastName,
    dateOfBirth: user.dateOfBirth,
    role: user.role,
  };
  isFormInvalid.value = false;
  showUserModal.value = true;
};

const openDeleteModal = async (user: User) => {
  try {
    await ElMessageBox.confirm(
      `Are you sure you want to delete ${user.firstName} ${user.lastName}? This action cannot be undone.`,
      "Delete User",
      {
        confirmButtonText: "Delete",
        cancelButtonText: "Cancel",
        type: "warning",
        confirmButtonClass: "el-button--danger",
      }
    );

    await deleteUser(user.id);
    notify.success("User deleted successfully!");
    await loadUsers();
  } catch (error) {
    if (error === "cancel") {
      return;
    }
    console.error("Failed to delete user:", error);
    notify.error("Failed to delete user");
  }
};

const closeModals = () => {
  showUserModal.value = false;
  selectedUser.value = null;
  isFormInvalid.value = false;

  setTimeout(() => {
    if (userFormRef.value) {
      userFormRef.value.noValidate = false;
      userFormRef.value.noValidate = true;
    }
  }, 0);
};

const handleCreateUser = async () => {
  try {
    if (!userFormRef.value || !userFormRef.value.checkValidity()) {
      notify.warning("Please fill out all required fields correctly");
      return;
    }

    const birthDate = new Date(userForm.value.dateOfBirth);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      age < 18 ||
      (age === 18 && monthDiff < 0) ||
      (age === 18 && monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      notify.warning("User must be at least 18 years old");
      return;
    }

    await createUser(userForm.value);
    notify.success("User created successfully!");
    closeModals();
    await loadUsers();
  } catch (error) {
    console.error("Failed to create user:", error);
    notify.error("Failed to create user");
  }
};

const handleUpdateUser = async () => {
  try {
    if (!selectedUser.value) return;

    if (!userFormRef.value || !userFormRef.value.checkValidity()) {
      notify.warning("Please fill out all required fields correctly");
      return;
    }

    const birthDate = new Date(userForm.value.dateOfBirth);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      age < 18 ||
      (age === 18 && monthDiff < 0) ||
      (age === 18 && monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      notify.warning("User must be at least 18 years old");
      return;
    }

    const updatePayload: UpdateUserRequest = {
      username: userForm.value.username,
      password: userForm.value.password,
      firstName: userForm.value.firstName,
      lastName: userForm.value.lastName,
      dateOfBirth: userForm.value.dateOfBirth,
      role: userForm.value.role,
    };

    await updateUser(selectedUser.value.id, updatePayload);
    notify.success("User updated successfully!");
    closeModals();
    await loadUsers();
  } catch (error) {
    console.error("Failed to update user:", error);
    notify.error("Failed to update user");
  }
};

const handleSubmit = () => {
  if (isEditMode.value) {
    handleUpdateUser();
  } else {
    handleCreateUser();
  }
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString();
};

const getRoleBadgeClass = (role: string) => {
  return role === "ADMIN"
    ? "bg-purple-100 text-purple-800"
    : "bg-green-100 text-green-800";
};

onMounted(() => {
  loadUsers();
});
</script>

<template>
  <div class="space-y-6">
    <div class="bg-white shadow rounded-lg p-6">
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">User Management</h1>
          <p class="text-gray-600 mt-1">Manage system users and their roles</p>
        </div>
        <button
          @click="openCreateModal"
          class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
        >
          Create New User
        </button>
      </div>
    </div>

    <div class="bg-white shadow rounded-lg p-6">
      <div class="flex flex-col sm:flex-row gap-4">
        <div class="flex-1">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search users by name, username, or role..."
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>
    </div>

    <div class="bg-white shadow rounded-lg overflow-hidden">
      <div v-if="isLoading" class="p-8 text-center">
        <LoadingSpinner size="lg" color="#2563eb" text="Loading users..." />
      </div>

      <div v-else-if="filteredUsers.length === 0" class="p-8 text-center">
        <div class="text-gray-400 text-6xl mb-4">👥</div>
        <p class="text-gray-600">No users found</p>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                User
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Role
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Date of Birth
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr
              v-for="user in paginatedUsers"
              :key="user.id"
              class="hover:bg-gray-50"
            >
              <td class="px-6 py-4 whitespace-nowrap">
                <div>
                  <div class="text-sm font-medium text-gray-900">
                    {{ user.firstName }} {{ user.lastName }}
                  </div>
                  <div class="text-sm text-gray-500">@{{ user.username }}</div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize"
                  :class="getRoleBadgeClass(user.role)"
                >
                  {{ user.role }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ formatDate(user.dateOfBirth) }}
              </td>
              <td
                class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2"
              >
                <button
                  type="button"
                  @click="openEditModal(user)"
                  class="text-blue-600 hover:text-blue-900 transition-colors duration-200"
                >
                  Edit
                </button>
                <button
                  type="button"
                  @click="openDeleteModal(user)"
                  class="text-red-600 hover:text-red-900 transition-colors duration-200 inline-flex items-center gap-1"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="1.5"
                    stroke="currentColor"
                    class="size-4"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                    />
                  </svg>
                  Delete
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div
        v-if="totalPages > 1"
        class="bg-white px-4 py-3 border-t border-gray-200 sm:px-6 flex justify-center"
      >
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[5, 10, 25, 50]"
          :total="filteredUsers.length"
          layout="total, sizes, prev, pager, next, jumper"
          background
        />
      </div>
    </div>

    <el-dialog
      v-model="showUserModal"
      :title="isEditMode ? 'Edit User' : 'Create New User'"
      width="500px"
      :before-close="closeModals"
    >
      <form
        ref="userFormRef"
        @submit.prevent="handleSubmit"
        novalidate
        :class="isFormInvalid ? 'form--invalid' : ''"
      >
        <div class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1"
                >First Name <span class="text-red-500">*</span></label
              >
              <input
                v-model="userForm.firstName"
                type="text"
                required
                minlength="2"
                maxlength="50"
                placeholder="e.g., John"
                @invalid="invalidateForm"
                class="w-full form__input border-2 p-1.5 outline-none border-gray-400 focus:border-gray-500 rounded"
              />
              <small class="mt-1 text-gray-500 text-xs">
                Enter legal first name (2-50 characters)
              </small>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1"
                >Last Name <span class="text-red-500">*</span></label
              >
              <input
                v-model="userForm.lastName"
                type="text"
                required
                minlength="2"
                maxlength="50"
                placeholder="e.g., Smith"
                @invalid="invalidateForm"
                class="w-full form__input border-2 p-1.5 outline-none border-gray-400 focus:border-gray-500 rounded"
              />
              <small class="mt-1 text-gray-500 text-xs">
                Enter legal last name (2-50 characters)
              </small>
            </div>
          </div>


          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1"
              >Username <span class="text-red-500">*</span></label
            >
            <input
              v-model="userForm.username"
              type="text"
              required
              minlength="2"
              maxlength="20"
              placeholder="e.g., johnsmith123"
              @invalid="invalidateForm"
              class="w-full form__input border-2 p-1.5 outline-none border-gray-400 focus:border-gray-500 rounded"
            />
            <small class="mt-1 text-gray-500 text-xs">
              Choose a unique username (2-20 characters, letters and numbers only)
            </small>
          </div>


          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1"
              >Password <span class="text-red-500">*</span></label
            >
            <input
              v-model="userForm.password"
              type="password"
              required
              minlength="8"
              maxlength="60"
              pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*.?]).{8,60}$"
              placeholder="Enter a secure password"
              @invalid="invalidateForm"
              class="w-full form__input border-2 p-1.5 outline-none border-gray-400 focus:border-gray-500 rounded"
            />


            <div v-if="userForm.password" class="mt-2 space-y-1">
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

            <small v-if="!userForm.password" class="mt-1 text-gray-500 text-xs">
              Password must be 8-60 characters, contain at least 1 number, 1 uppercase
              letter, 1 lowercase letter, and 1 special character (!@#$%^&*.?)
            </small>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1"
              >Date of Birth <span class="text-red-500">*</span></label
            >
            <input
              v-model="userForm.dateOfBirth"
              type="date"
              required
              max="2007-06-07"
              @invalid="invalidateForm"
              class="w-full form__input border-2 p-1.5 outline-none border-gray-400 focus:border-gray-500 rounded"
            />
            <small class="mt-1 text-gray-500 text-xs">
              User must be at least 18 years old
            </small>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1"
              >Role <span class="text-red-500">*</span></label
            >
            <select
              v-model="userForm.role"
              required
              @invalid="invalidateForm"
              class="w-full form__input border-2 p-1.5 outline-none border-gray-400 focus:border-gray-500 rounded"
            >
              <option value="USER">User</option>
              <option value="ADMIN">Admin</option>
            </select>
            <small class="mt-1 text-gray-500 text-xs">
              Select the appropriate role for this user
            </small>
          </div>
        </div>
      </form>

      <template #footer>
        <div class="flex justify-end space-x-2">
          <button
            type="button"
            @click="closeModals"
            class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            @click="handleSubmit"
            class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {{ isEditMode ? 'Update User' : 'Create User' }}
          </button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>
