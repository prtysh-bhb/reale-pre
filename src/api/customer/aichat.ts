/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "@/api/axios";

/* ============================
   Request Payloads
============================ */

export interface AIChatRequest {
  message: string;
  session_id?: string | null;
}

/* ============================
   Core Models
============================ */

export interface AIChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
  created_at?: string;
}

export interface AIChatSession {
  response: any;
  message: any;
  content: string;
  session_id: string;
  messages: AIChatMessage[];
}

/* ============================
   API Response Wrappers
============================ */

export interface ApiSuccessResponse<T> {
  response: any;
  session_id: boolean;
  success: true;
  data: T;
  message?: string;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

/* ============================
   API Calls
============================ */

/**
 * POST /ai/chat
 * Send a message to AI chatbot
 */
export const sendAIChatMessage = async (
  payload: AIChatRequest
): Promise<ApiResponse<AIChatSession>> => {
  const response = await api.post<ApiResponse<AIChatSession>>(
    "customer/ai/chat",
    payload
  );
  return response.data;
};

/**
 * GET /ai/chat/history/{sessionId}
 * Fetch chat history for a session
 */
export const getAIChatHistory = async (
  sessionId: string
): Promise<ApiResponse<AIChatSession>> => {
  const response = await api.get<ApiResponse<AIChatSession>>(
    `customer/ai/chat/history/${sessionId}`
  );
  return response.data;
};
