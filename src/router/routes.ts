import type { RouteRecordRaw } from "vue-router";
import AuthLayout from "@/layouts/Auth.vue";
import MainLayout from "@/layouts/Main.vue";
import LoginPage from "@/pages/LoginPage.vue";

export const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    redirect: () => {
      return { name: "dashboard" };
    },
  },

  {
    path: "/auth",
    component: AuthLayout,
    meta: {
      isAuth: true,
    },
    children: [
      {
        path: "login",
        name: "login",
        component: LoginPage,
        meta: {
          title: "Login",
        },
      },
      {
        path: "register",
        name: "register",
        component: () => import("@/pages/RegisterPage.vue"),
        meta: {
          title: "Register",
        },
      },
    ],
  },

  {
    path: "/app",
    component: MainLayout,
    meta: {
      requiresAuth: true,
    },
    children: [
      {
        path: "dashboard",
        name: "dashboard",
        component: () => import("@/pages/DashboardPage.vue"),
        meta: {
          title: "Dashboard",
          requiresAuth: true,
        },
      },
      {
        path: "admin",
        name: "admin-dashboard",
        component: () => import("@/pages/admin/DashboardPage.vue"),
        meta: {
          title: "Admin Dashboard",
          requiresAuth: true,
          requiresAdmin: true,
        },
      },
    ],
  },

  // Legacy routes (for backward compatibility)
  {
    path: "/login",
    redirect: { name: "login" },
  },
  {
    path: "/register",
    redirect: { name: "register" },
  },

  // 404 page
  {
    path: "/:pathMatch(.*)*",
    name: "NotFound",
    component: () => import("../pages/NotFoundPage.vue"),
    meta: {
      title: "Page Not Found",
    },
  },
];
