/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "@/api/axios";
import { ApiResponse } from "@/types";

export interface NotificationData {
  [key: string]: any;
}

export interface PaginationInfo {
  total: number;
  per_page: number;
  current_page: number;
  last_page: number;
}

export interface NotificationsApiResponse {
  success: boolean;
  data: {
    notifications: NotificationItem[];
    pagination: PaginationInfo;
  };
}

export interface NotificationsCountApiResponse {
  success: boolean;
  data: {
    count: number;
  };
}

export interface NotificationItem {
  id: string;
  type: string;
  notifiable_type: string;
  notifiable_id: number;
  data: NotificationData;
  read_at: string | null;
  created_at: string;
  updated_at: string;
}

export const getNotifications = async () => {
  const response = await api.get<NotificationsApiResponse>(`/notifications`);
  
  return response.data.data;
};

export const getUnreadNotificationsCount = async () => {
  const response = await api.get<NotificationsCountApiResponse>(`/notifications/count`);
  
  return response.data.data;
};

export const markAsReadNotification = async (id: number) => {
  const response = await api.post<ApiResponse>(`/notifications/${id}/read`);
  
  return response.data;
};

export const markAllAsReadNotification = async () => {
  const response = await api.post<ApiResponse>(`/notifications/mark-all-read`);
  
  return response.data;
};

export const deleteNotification = async (id: number) => {
  const response = await api.delete<ApiResponse>(`/notifications/${id}`);
  
  return response.data;
};