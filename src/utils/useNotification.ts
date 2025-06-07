import { NotificationService } from "@/services/notificationService";

// Re-export for easier imports
export const useNotification = () => ({
  success: NotificationService.success,
  error: NotificationService.error,
  warning: NotificationService.warning,
  info: NotificationService.info,
  handleApiError: NotificationService.handleApiError,
});

// Direct exports for even easier access
export const notify = {
  success: NotificationService.success,
  error: NotificationService.error,
  warning: NotificationService.warning,
  info: NotificationService.info,
  handleApiError: NotificationService.handleApiError,
};
