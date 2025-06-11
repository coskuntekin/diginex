import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { userService } from '../services';
import type { User, CreateUserRequest, UpdateUserRequest, QueryParams, apiError, PaginatedResponse } from '../types/api';

export const useUserStore = defineStore('user', () => {
  const users = ref<User[]>([]);
  const selectedUser = ref<User | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  const totalUsers = computed(() => users.value.length);
  const hasUsers = computed(() => users.value.length > 0);
  const activeUsers = computed(() => users.value.filter(user => user.role !== 'inactive'));
  const inactiveUsers = computed(() => users.value.filter(user => user.role === 'inactive'));

  const fetchUsers = async (params?: QueryParams) => {
    try {
      isLoading.value = true;
      error.value = null;

      const response = await userService.getUsers(params);

      let usersArray: User[];
      if (Array.isArray(response)) {
        usersArray = response;
      } else {
        usersArray = (response as PaginatedResponse<User>)?.users || [];
      }

      users.value = usersArray;
      return users.value;
    } catch (err: unknown) {
      const apiError = err as apiError;
      error.value = apiError.message || 'Failed to fetch users';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const fetchUserById = async (id: string | number) => {
    try {
      isLoading.value = true;
      error.value = null;

      const user = await userService.getUserById(id);
      selectedUser.value = user;

      return user;
    } catch (err: unknown) {
      const apiError = err as apiError;
      error.value = apiError.message || 'Failed to fetch user';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const createUser = async (userData: CreateUserRequest) => {
    try {
      isLoading.value = true;
      error.value = null;

      const newUser = await userService.createUser(userData);

      users.value.unshift(newUser);

      return newUser;
    } catch (err: unknown) {
      const apiError = err as apiError;
      error.value = apiError.message || 'Failed to create user';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const updateUser = async (id: string | number, userData: UpdateUserRequest) => {
    try {
      isLoading.value = true;
      error.value = null;

      const updatedUser = await userService.updateUser(id, userData);

      const index = users.value.findIndex(user => user.id === id);
      if (index !== -1) {
        users.value[index] = updatedUser;
      }

      if (selectedUser.value?.id === id) {
        selectedUser.value = updatedUser;
      }

      return updatedUser;
    } catch (err: unknown) {
      const apiError = err as apiError;
      error.value = apiError.message || 'Failed to update user';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const patchUser = async (id: string | number, userData: Partial<UpdateUserRequest>) => {
    try {
      isLoading.value = true;
      error.value = null;

      const updatedUser = await userService.patchUser(id, userData);

      const index = users.value.findIndex(user => user.id === id);
      if (index !== -1) {
        users.value[index] = updatedUser;
      }

      if (selectedUser.value?.id === id) {
        selectedUser.value = updatedUser;
      }

      return updatedUser;
    } catch (err: unknown) {
      const apiError = err as apiError;
      error.value = apiError.message || 'Failed to update user';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const deleteUser = async (id: string | number) => {
    try {
      isLoading.value = true;
      error.value = null;

      await userService.deleteUser(id);

      users.value = users.value.filter(user => user.id !== id);

      if (selectedUser.value?.id === id) {
        selectedUser.value = null;
      }

    } catch (err: unknown) {
      const apiError = err as apiError;
      error.value = apiError.message || 'Failed to delete user';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const toggleUserStatus = async (id: string | number) => {
    try {
      isLoading.value = true;
      error.value = null;

      const user = users.value.find(u => u.id === id);
      if (!user) {
        throw new Error('User not found');
      }

      const newRole = user.role === 'inactive' ? 'user' : 'inactive';
      const updatedUser = await userService.patchUser(id, { role: newRole });

      const index = users.value.findIndex(u => u.id === id);
      if (index !== -1) {
        users.value[index] = updatedUser;
      }

      return updatedUser;
    } catch (err: unknown) {
      const apiError = err as apiError;
      error.value = apiError.message || 'Failed to toggle user status';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const clearError = () => {
    error.value = null;
  };

  const clearSelectedUser = () => {
    selectedUser.value = null;
  };

  const resetState = () => {
    users.value = [];
    selectedUser.value = null;
    error.value = null;
    isLoading.value = false;
  };

  return {
    users,
    selectedUser,
    isLoading,
    error,

    totalUsers,
    hasUsers,
    activeUsers,
    inactiveUsers,

    fetchUsers,
    fetchUserById,
    createUser,
    updateUser,
    patchUser,
    deleteUser,
    toggleUserStatus,
    clearError,
    clearSelectedUser,
    resetState,
  };
});
