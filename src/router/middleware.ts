import type { NavigationGuardNext, RouteLocationNormalized } from "vue-router";
import { useAuthStore } from "@/stores/auth";

export const setPageTitleMiddleware = (
  to: RouteLocationNormalized,
  _from: RouteLocationNormalized,
  next: NavigationGuardNext
) => {
  if (to.meta.title) {
    document.title = `${to.meta.title} - Take Home Challenge`;
  }
  next();
};

export const checkAccessMiddleware = async (
  to: RouteLocationNormalized,
  _from: RouteLocationNormalized,
  next: NavigationGuardNext
) => {
  const authStore = useAuthStore();

  if (!authStore.user && !authStore.isLoading) {
    try {
      await authStore.initializeAuth();
    } catch (error) {
      console.error("Failed to initialize auth:", error);
    }
  }

  if (to.path === "/" || to.name === "dashboard") {
    if (authStore.isAuthenticated) {
      if (to.path === "/") {
        next({ name: "dashboard" });
        return;
      }
    } else {
      next({ name: "login" });
      return;
    }
  }

  if (to.meta.requiresAuth) {
    if (!authStore.isAuthenticated) {
      next({ name: "login", query: { redirect: to.fullPath } });
      return;
    }

    if (to.meta.requiresAdmin && !authStore.isAdmin) {
      next({ name: "dashboard" });
      return;
    }
  }

  next();
};

export const checkAccountStatus = (
  to: RouteLocationNormalized,
  _from: RouteLocationNormalized,
  next: NavigationGuardNext
) => {
  const authStore = useAuthStore();

  if (authStore.isAuthenticated && (to.path.startsWith("/auth") || to.name === "login" || to.name === "register")) {
    next({ name: "dashboard" });
    return;
  }

  next();
};