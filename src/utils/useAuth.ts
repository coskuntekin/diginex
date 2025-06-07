import { useAuthStore } from "@/stores";
import type { LoginRequest, RegisterRequest, RegisterResponse } from "@/types/api";
import { computed, onMounted } from "vue";

export function useAuth() {
  const authStore = useAuthStore();

  onMounted(() => {
    authStore.initializeAuth();
  });

  const login = async (credentials: LoginRequest) => {
    return await authStore.login(credentials);
  };

  const logout = async () => {
    await authStore.logout();
  };

  const register = async (userData: RegisterRequest): Promise<RegisterResponse> => {
    return await authStore.register(userData);
  };

  return {
    user: computed(() => authStore.user),
    isAuthenticated: computed(() => authStore.isAuthenticated),
    isLoading: computed(() => authStore.isLoading),
    error: computed(() => authStore.error),
    userName: computed(() => authStore.userName),
    userEmail: computed(() => authStore.userEmail),
    userRole: computed(() => authStore.userRole),

    login,
    logout,
    register,
  };
}
