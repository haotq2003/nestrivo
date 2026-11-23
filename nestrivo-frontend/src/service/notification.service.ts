import { httpClient } from "./api";

export type NotificationType =
  | "ADMIN_WARNING_24H"
  | "ADMIN_HIDE_LISTING"
  | "ADMIN_AUTO_HIDE"
  | "REPORT_RESOLVED"
  | "REPORT_DISMISSED"
  | "INQUIRY_RECEIVED"
  | "INQUIRY_CONFIRMED"
  | "INQUIRY_REJECTED"
  | "SYSTEM_ANNOUNCEMENT";

export interface AppNotification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string | null;
  isRead: boolean;
  readAt?: string | null;
  metadata?: Record<string, any> | null;
  createdAt: string;
}

export interface GetNotificationsResponse {
  success: boolean;
  data: AppNotification[];
  unreadCount: number;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export async function fetchNotificationsApi(
  limit = 20,
  unreadOnly = false
): Promise<GetNotificationsResponse> {
  return httpClient.get<GetNotificationsResponse>("/notifications", {
    limit,
    unreadOnly,
  });
}

export async function markNotificationAsReadApi(
  id: string
): Promise<{ success: boolean; unreadCount: number }> {
  return httpClient.patch<{ success: boolean; unreadCount: number }>(
    `/notifications/${id}/read`
  );
}

export async function markAllNotificationsAsReadApi(): Promise<{
  success: boolean;
  unreadCount: number;
}> {
  return httpClient.patch<{ success: boolean; unreadCount: number }>(
    "/notifications/mark-all-read"
  );
}

export async function deleteNotificationApi(
  id: string
): Promise<{ success: boolean; unreadCount: number }> {
  return httpClient.delete<{ success: boolean; unreadCount: number }>(
    `/notifications/${id}`
  );
}
