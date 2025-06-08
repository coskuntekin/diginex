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
        path: "profile/:id?",
        name: "profile",
        component: () => import("@/pages/ProfilePage.vue"),
        meta: {
          title: "Profile",
          requiresAuth: true,
        },
      },
      {
        path: "tweets",
        name: "tweets",
        component: () => import("@/pages/TweetsPage.vue"),
        meta: {
          title: "Tweets",
          requiresAuth: true,
        },
      },
      {
        path: "tweets/create",
        name: "tweet-create",
        component: () => import("@/pages/TweetFormPage.vue"),
        meta: {
          title: "Create Tweet",
          requiresAuth: true,
        },
      },
      {
        path: "tweets/:id",
        name: "tweet-detail",
        component: () => import("@/pages/TweetDetailPage.vue"),
        meta: {
          title: "Tweet Detail",
          requiresAuth: true,
        },
      },
      {
        path: "tweets/:id/edit",
        name: "tweet-edit",
        component: () => import("@/pages/TweetFormPage.vue"),
        meta: {
          title: "Edit Tweet",
          requiresAuth: true,
        },
      },
      {
        path: "admin/users",
        name: "admin-users",
        component: () => import("@/pages/AdminUsersPage.vue"),
        meta: {
          title: "User Management",
          requiresAuth: true,
          requiresAdmin: true,
        },
      },
    ],
  },

  {
    path: "/:pathMatch(.*)*",
    name: "NotFound",
    component: () => import("@/pages/NotFoundPage.vue"),
    meta: {
      title: "Page Not Found",
    },
  },
];
