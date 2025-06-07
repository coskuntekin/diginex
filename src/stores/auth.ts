import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { authService } from "@/services";
import type {
  User,
  LoginRequest,
  RegisterRequest,
  RegisterResponse,
  apiError,
} from "@/types/api";

export const useAuthStore = defineStore("auth", () => {
  const user = ref<User | null>(null);
  const token = ref<string | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  const isAuthenticated = computed(() => !!token.value && !!user.value);
  const userName = computed(() =>
    user.value ? `${user.value.firstName} ${user.value.lastName}` : ""
  );
  const userRole = computed(() => user.value?.role || "");
  const isAdmin = computed(() => user.value?.role === "ADMIN");

  const initializeAuth = async () => {
    try {
      const storedToken = authService.getToken();
      const storedUser = authService.getCurrentUserFromStorage();

      if (storedToken && storedUser) {
        token.value = storedToken;
        user.value = storedUser;

        if (authService.isTokenExpired()) {
          await logout();
        }
      }
    } catch (err) {
      console.error("Failed to initialize auth:", err);
      await logout();
    }
  };

  const login = async (credentials: LoginRequest) => {
    try {
      isLoading.value = true;
      error.value = null;

      const response = await authService.login(credentials);

      token.value = response.token;
      user.value = response.user;

      return response;
    } catch (err: unknown) {
      console.error("Login failed:", err);
      const apiError = err as apiError;
      const { NotificationService } = await import(
        "@/services/notificationService"
      );
      NotificationService.error(
        apiError.message || "Wrong username or password."
      );

      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const register = async (
    userData: RegisterRequest
  ): Promise<RegisterResponse> => {
    try {
      isLoading.value = true;
      error.value = null;

      const response = await authService.register(userData);

      return response;
    } catch (err) {
      console.error("Registration failed:", err);
      const apiError = err as apiError;
      const { NotificationService } = await import(
        "@/services/notificationService"
      );
      NotificationService.error(
        apiError.message || "Registration failed. Please try again."
      );

      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const logout = async () => {
    isLoading.value = true;

    await authService.logout();

    token.value = null;
    user.value = null;
    error.value = null;
    isLoading.value = false;
  };

  const updateProfile = async (userData: Partial<User>) => {
    try {
      isLoading.value = true;
      error.value = null;

      if (!user.value?.id) {
        throw new Error("User ID is required for profile update");
      }

      const updatedUser = await authService.updateProfile(
        user.value.id,
        userData
      );
      user.value = updatedUser;

      return updatedUser;
    } catch (err: unknown) {
      console.error("Profile update failed:", err);
      const apiError = err as apiError;
      const { NotificationService } = await import(
        "@/services/notificationService"
      );
      NotificationService.error(
        apiError.message || "Failed to update profile. Please try again."
      );

      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const clearError = () => {
    error.value = null;
  };

  return {
    user,
    token,
    isLoading,
    error,

    isAuthenticated,
    userName,
    userRole,
    isAdmin,

    initializeAuth,
    login,
    register,
    logout,
    updateProfile,
    clearError,
  };
});
