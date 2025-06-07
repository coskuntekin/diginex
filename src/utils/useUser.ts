import { computed } from 'vue';
import { useUserStore } from '../stores';
import type { CreateUserRequest, UpdateUserRequest, QueryParams } from '../types/api';

export function useUser() {
  const userStore = useUserStore();

  const fetchUsers = async (params?: QueryParams) => {
    return await userStore.fetchUsers(params);
  };

  const fetchUserById = async (id: string | number) => {
    return await userStore.fetchUserById(id);
  };

  const createUser = async (userData: CreateUserRequest) => {
    return await userStore.createUser(userData);
  };

  const updateUser = async (id: string | number, userData: UpdateUserRequest) => {
    return await userStore.updateUser(id, userData);
  };

  const patchUser = async (id: string | number, userData: Partial<UpdateUserRequest>) => {
    return await userStore.patchUser(id, userData);
  };

  const deleteUser = async (id: string | number) => {
    await userStore.deleteUser(id);
  };

  const toggleUserStatus = async (id: string | number) => {
    return await userStore.toggleUserStatus(id);
  };

  const clearError = () => {
    userStore.clearError();
  };

  const clearSelectedUser = () => {
    userStore.clearSelectedUser();
  };

  const resetState = () => {
    userStore.resetState();
  };

  return {
    users: computed(() => userStore.users),
    selectedUser: computed(() => userStore.selectedUser),
    isLoading: computed(() => userStore.isLoading),
    error: computed(() => userStore.error),

    totalUsers: computed(() => userStore.totalUsers),
    hasUsers: computed(() => userStore.hasUsers),
    activeUsers: computed(() => userStore.activeUsers),
    inactiveUsers: computed(() => userStore.inactiveUsers),

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
}
