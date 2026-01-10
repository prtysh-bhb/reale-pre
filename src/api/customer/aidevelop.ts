/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "@/api/axios";

/* ============================
   Request Payloads
============================ */

export interface AIRecommendationRequest {
  bathrooms_min: number;
  bathrooms_max: number;
  bedrooms_min: number;
  bedrooms_max: number;
  bedrooms?: number;
  bathrooms?: number;
  area_min?: number;
  area_max?: number;
  location?: string;
  budget_min?: number;
  budget_max?: number;
  property_type?: string;
}

/* ============================
   Core Models
============================ */

export interface AIConversation {
  id: number;
  prompt?: string;
  response?: string;
  created_at: string;
}

export interface AIRecommendation {
  id: number;
  user_id: number;
  input: Record<string, any>;
  result: Record<string, any>;
  created_at: string;
  conversation?: AIConversation;
}

/* ============================
   API Response Wrappers
============================ */

export interface ApiSuccessResponse<T> {
  id: null;
  recommendation_id: null;
  recommanations: boolean;
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
   Paginated Response
============================ */

export interface PaginatedResponse<T> {
  success: true;
  data: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    data: T[];
  };
}

/* ============================
   API Calls
============================ */

/**
 * POST /ai/recommend
 * Generate AI property recommendations
 */
export const recommendProperty = async (
  payload: AIRecommendationRequest
): Promise<ApiResponse<any>> => {
  const response = await api.post<ApiResponse<any>>("/customer/ai/recommend", payload);
  return response.data;
};

/**
 * GET /ai/recommendations
 * Get recommendation history
 */
export const getRecommendationHistory = async (
  page = 1
): Promise<PaginatedResponse<AIRecommendation>> => {
  const response = await api.get<PaginatedResponse<AIRecommendation>>(
    "/customer/ai/recommendations",
    {
      params: { page },
    }
  );
  return response.data;
};

/**
 * GET /ai/recommendations/{id}
 * Get single recommendation detail
 */
export const getRecommendationById = async (
  id: number
): Promise<ApiResponse<AIRecommendation>> => {
  const response = await api.get<ApiResponse<AIRecommendation>>(
    `/customer/ai/recommendations/${id}`
  );
  return response.data;
};
