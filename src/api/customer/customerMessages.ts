/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "@/api/axios";
import { Agent, ApiResponse } from "@/types";
import { UnreadCountResponse } from "../agent/agentMessages";

export interface UnreadCountMap {
  [userId: number]: number; // user_id => unread_count
}

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

export interface CustomerAgentsApiResponse{
  success: boolean;
  message: string;
  agents: Agent[];
}

// Send a message
export const sentMessage = async (data: MessageFormData | undefined) => {
  const response = await api.post<ApiResponse>(`/customer/messages/sent`, data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  return response.data;
};

// Get messages
export const getMessages = async (userId: number) => {
  const response = await api.get<MessageApiResponse>(`/customer/messages/${userId}`);
  return response.data;
};

// Get customer agents
export const getCustomerAgents = async () => {
  const response = await api.get<CustomerAgentsApiResponse>(`/customer/messages/agents`);
  return response.data;
};

// Typing event call
export const isTypingCall = async (receiver_id: number) => {
  const response = await api.post(`/customer/messages/is_typing`, {receiver_id});
  return response.data;
};

// Read all messages
export const readAgentMessages = async (partnerId: number) => {
  const response = await api.post(`/customer/messages/read/${partnerId}`);
  return response.data;
};

// Unread messages count
export const unreadMessagesCountCustomer = async () => {
  const response = await api.get<UnreadCountResponse>(`/customer/messages/unread-counts`);
  return response.data;
};