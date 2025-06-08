import { NotificationService } from "@/services/notificationService";

export const useNotification = () => ({
  success: NotificationService.success,
  error: NotificationService.error,
  warning: NotificationService.warning,
  info: NotificationService.info,
  handleApiError: NotificationService.handleApiError,
});

export const notify = {
  success: NotificationService.success,
  error: NotificationService.error,
  warning: NotificationService.warning,
  info: NotificationService.info,
  handleApiError: NotificationService.handleApiError,
};
