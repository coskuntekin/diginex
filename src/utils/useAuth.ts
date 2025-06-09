import { useAuthStore } from "@/stores";
import type { LoginRequest, RegisterRequest, RegisterResponse } from "@/types/api";
import { computed, onMounted } from "vue";
import { useRouter } from "vue-router";

export function useAuth() {
  const authStore = useAuthStore();
  const router = useRouter();

  onMounted(() => {
    authStore.initializeAuth();
  });

  const login = async (credentials: LoginRequest) => {
    return await authStore.login(credentials);
  };

  const logout = async () => {
    await authStore.logout();
    router.push('/login');
  };

  const register = async (userData: RegisterRequest): Promise<RegisterResponse> => {
    return await authStore.register(userData);
  };

  const requireAuth = () => {
    if (!authStore.isAuthenticated) {
      router.push('/login');
      return false;
    }
    return true;
  };

  const requireAdmin = () => {
    if (!authStore.isAuthenticated) {
      router.push('/login');
      return false;
    }
    if (!authStore.isAdmin) {
      router.push('/');
      return false;
    }
    return true;
  };

  return {
    user: computed(() => authStore.user),
    isAuthenticated: computed(() => authStore.isAuthenticated),
    isLoading: computed(() => authStore.isLoading),
    error: computed(() => authStore.error),
    userName: computed(() => authStore.userName),
    userRole: computed(() => authStore.userRole),
    isAdmin: computed(() => authStore.isAdmin),

    login,
    logout,
    register,
    requireAuth,
    requireAdmin,
  };
}
