import { ElNotification } from "element-plus";
import type { ApiError, apiError } from "../types/api";

export interface NotificationOptions {
  title?: string;
  message: string;
  type?: "success" | "warning" | "info" | "error";
  duration?: number;
  showClose?: boolean;
}

export class NotificationService {
  static success(message: string, options?: Partial<NotificationOptions>) {
    ElNotification({
      title: options?.title || "Success",
      message,
      type: "success",
      duration: options?.duration || 4500,
      showClose: options?.showClose ?? true,
      ...options,
    });
  }

  static error(message: string, options?: Partial<NotificationOptions>) {
    ElNotification({
      title: options?.title || "Error",
      message,
      type: "error",
      duration: options?.duration || 6000,
      showClose: options?.showClose ?? true,
      ...options,
    });
  }

  static warning(message: string, options?: Partial<NotificationOptions>) {
    ElNotification({
      title: options?.title || "Warning",
      message,
      type: "warning",
      duration: options?.duration || 4500,
      showClose: options?.showClose ?? true,
      ...options,
    });
  }

  static info(message: string, options?: Partial<NotificationOptions>) {
    ElNotification({
      title: options?.title || "Info",
      message,
      type: "info",
      duration: options?.duration || 4500,
      showClose: options?.showClose ?? true,
      ...options,
    });
  }

  static handleApiError(error: unknown) {
    let message: string;

    // Check if it's the new apiError format
    if (error && typeof error === 'object' && 'message' in error && 'code' in error) {
      const apiErr = error as apiError;
      message = apiErr.message;
    }
    // Check if it's the legacy ApiError format
    else if (error && typeof error === 'object' && 'message' in error) {
      const apiErr = error as ApiError;
      message = apiErr.message;
    }
    // Check if it's an axios-like error with response structure
    else if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as {
        response?: {
          status?: number;
          data?: {
            code?: string;
            message?: string;
          };
        };
      };
      message = axiosError.response?.data?.message || "An unexpected error occurred. Please try again.";
    }
    // Fallback for other error types
    else if (error instanceof Error) {
      message = error.message;
    }
    else {
      message = "An unexpected error occurred. Please try again.";
    }

    this.error(message);
  }
}

export const notificationService = new NotificationService();
