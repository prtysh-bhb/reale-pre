/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "@/api/axios";

/* ----------------------------------------
   Interfaces
---------------------------------------- */

// Lead Status
export type AIChatLeadStatus =
  | "new"
  | "contacted"
  | "qualified"
  | "converted"
  | "lost";

// User attached to lead
export interface AIChatLeadUser {
  id: number;
  name: string;
  email: string;
}

// Conversation summary
export interface AIChatConversation {
  id: number;
  session_id: string;
  created_at: string;
}

// Main Lead Interface
export interface AIChatLead {
  id: number;
  user_id: number | null;
  conversation_id: number | null;
  lead_score: number;
  status: AIChatLeadStatus;
  created_at: string;
  updated_at: string;

  user?: AIChatLeadUser;
  conversation?: AIChatConversation;
}

// Pagination wrapper
export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

// Generic API response
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

/* ----------------------------------------
   API Calls
---------------------------------------- */

/**
 * GET /api/admin/ai/chat/leads
 * Fetch chat leads with filters
 */
export const getAIChatLeads = async (params?: {
  page?: number;
  status?: AIChatLeadStatus;
  min_score?: number;
  sort_by?: "created_at" | "lead_score";
  sort_order?: "asc" | "desc";
}): Promise<ApiResponse<PaginatedResponse<AIChatLead>>> => {
  const response = await axios.get<ApiResponse<PaginatedResponse<AIChatLead>>>(
    "/admin/ai/chat/leads",
    {
      params,
    }
  );

  return response.data;
};

/**
 * GET /api/admin/ai/chat/leads/{id}
 * Fetch single lead details
 */
export const getAIChatLeadById = async (
  id: number
): Promise<ApiResponse<AIChatLead>> => {
  const response = await axios.get<ApiResponse<AIChatLead>>(`/admin/ai/chat/leads/${id}`);
  return response.data;
};

/**
 * PUT /api/admin/ai/chat/leads/{id}/status
 * Update lead status
 */
export const updateAIChatLeadStatus = async (
  id: number,
  status: AIChatLeadStatus
): Promise<ApiResponse<AIChatLead>> => {
  const response = await axios.put<ApiResponse<AIChatLead>>(
    `/admin/ai/chat/leads/${id}/status`,
    { status }
  );

  return response.data;
};
