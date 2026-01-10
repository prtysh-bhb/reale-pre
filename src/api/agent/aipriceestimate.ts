/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "@/api/axios";

/* ============================
   Request Payloads
============================ */

export interface AIPriceEstimateRequest {
  location: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  property_type: string;
  condition?: string;
  amenities?: string;
  property_id?: number | null;
}

/* ============================
   Core Models
============================ */

export interface AIPriceEstimate {
  property_details: any;
  breakdown: any;
  price_range_min: any;
  price_range_max: any;
  ai_reasoning: any;
  suggested_listing_price: any;
  id: number;
  agent_id: number;
  property_id?: number | null;
  location: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  property_type: string;
  condition?: string;
  amenities?: string;
  estimated_price: number;
  price_range?: string;
  confidence_score?: number;
  created_at: string;
}

/* ============================
   Pagination
============================ */

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

/* ============================
   API Response Wrappers
============================ */

export interface ApiSuccessResponse<T> {
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


export const estimatePropertyPrice = async (
  payload: AIPriceEstimateRequest
): Promise<ApiResponse<AIPriceEstimate>> => {
  const response = await api.post<ApiResponse<AIPriceEstimate>>(
    "agent/ai/estimate-price",
    payload
  );
  return response.data;
};


export const getPriceEstimateHistory = async (
  page = 1
): Promise<ApiResponse<PaginatedResponse<AIPriceEstimate>>> => {
  const response = await api.get<ApiResponse<PaginatedResponse<AIPriceEstimate>>>(
    "agent/ai/price-estimates",
    { params: { page } }
  );
  return response.data;
};

/**
 * GET /api/agent/ai/price-estimates/{id}
 * Get single price estimate
 */
export const getPriceEstimateById = async (
  id: number
): Promise<ApiResponse<AIPriceEstimate>> => {
  const response = await api.get<ApiResponse<AIPriceEstimate>>(
    `agent/ai/price-estimates/${id}`
  );
  return response.data;
};
