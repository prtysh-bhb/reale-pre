/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "@/api/axios";
import { ApiResponse } from "@/types";
import { Customer } from "@/types/appointment";

export interface ChatMessage {
  id: number;
  sender_id: number;
  receiver_id: number;
  type: "text" | "image" | "file" | "property" | "video";
  message: string | null;
  image_url?: string | null;
  file_url?: string | null;
  file_name?: string | null;
  property_id?: number | null;
  meta?: Record<string, any> | null;
  is_read: boolean;
  read_at?: string | null;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;

  // frontend convenience fields
  sender: "me" | "them" | "system";
  time?: string;
}

export interface MessageFormData {
  receiver_id: number | null;
  type: "text" | "image" | "file" | "property" | "video";
  message?: string;
  file?: File | null;
  property_id?: number | null;
  meta?: Record<string, any> | null;
}

export interface MessageApiResponse{
  success: boolean;
  message: string;
  data: ChatMessage[];
}

export interface AgentCustomersApiResponse{
  success: boolean;
  message: string;
  customers: Customer[];
}

export interface UnreadCountMap {
  [userId: number]: number; // user_id => unread_count
}

export interface UnreadCountResponse{
  success: boolean;
  data: UnreadCountMap;
}

// Send a message
export const sentMessage = async (data: MessageFormData | undefined) => {
  const response = await api.post<ApiResponse>(`/agent/messages/sent`, data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  return response.data;
};

// Get messages
export const getMessages = async (userId: number) => {
  const response = await api.get<MessageApiResponse>(`/agent/messages/${userId}`);
  return response.data;
};

// Get agent customers
export const getAgentCustomers = async () => {
  const response = await api.get<AgentCustomersApiResponse>(`/agent/messages/customers`);
  return response.data;
};

// Typing event call
export const isTypingCall = async (receiver_id: number) => {
  const response = await api.post(`/agent/messages/is_typing`, {receiver_id});
  return response.data;
};

// Read all messages
export const readCustomerMessages = async (partnerId: number) => {
  const response = await api.post(`/agent/messages/read/${partnerId}`);
  return response.data;
};

// Unread messages count
export const unreadMessagesCountAgent = async () => {
  const response = await api.get<UnreadCountResponse>(`/agent/messages/unread-counts`);
  return response.data;
};