import axios from "axios";
import type { AxiosInstance, AxiosResponse } from "axios";

const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.DEV ? "/api" : import.meta.env.VITE_API_BASE_URL,
  withCredentials: false,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (import.meta.env.DEV) {
      const logMessage = `[API Request] ${config.method?.toUpperCase()} ${
        config.url
      }`;
      if (config.data) {
        console.log(logMessage, config.data);
      } else {
        console.log(logMessage);
      }
    }

    return config;
  },
  (error) => {
    console.error("[API Request Error]", error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response: AxiosResponse) => {
    if (import.meta.env.DEV) {
      console.log(
        `[API Response] ${response.config.method?.toUpperCase()} ${
          response.config.url
        }`,
        response.data
      );
    }

    return response;
  },
  async (error) => {
    if (import.meta.env.DEV) {
      console.error(
        "[API Response Error]",
        error.response?.data || error.message
      );
    }

    if (error.response?.status === 401) {
      localStorage.removeItem("authToken");
      console.error("Unauthorized");

      const currentPath = window.location.pathname;
      if (
        !currentPath.includes("/login") &&
        !currentPath.includes("/register")
      ) {
        const { NotificationService } = await import("./notificationService");
        NotificationService.error("Session expired. Please login again.");
      }
    }

    if (error.response?.status === 403) {
      console.warn("Access forbidden");
      const { NotificationService } = await import("./notificationService");
      NotificationService.error(
        "Access denied. You don't have permission to perform this action."
      );
    }

    if (error.response?.status >= 500) {
      console.error("Server error occurred");
      const { NotificationService } = await import("./notificationService");
      NotificationService.error(
        "Server error occurred. Please try again later."
      );
    }

    return Promise.reject(error);
  }
);

export default api;
