/* eslint-disable @typescript-eslint/no-explicit-any */
// src/api/customer/reviews.ts
import api from "@/api/axios";

/**
 * Types
 */
export interface ReviewUser {
  id: number;
  name: string;
  avatar_url?: string | null;
}

export interface Review {
  id: number;
  property_id: number;
  user_id: number;
  construction: number;
  amenities: number;
  management: number;
  connectivity: number;
  green_area: number;
  locality: number;
  positive_comment?: string | null;
  negative_comment?: string | null;
  created_at: string;
  updated_at?: string | null;
  user?: ReviewUser | null;
  // you can add other fields (helpful_count, recommended, etc.) if backend returns them
}

interface FetchReviewsResponse {
  success: boolean;
  data: Review[];
}


 // Payload for creating a review (matches Laravel validator fields)
export interface CreateReviewPayload {
  construction: number; // 1..5
  amenities: number; // 1..5
  management: number; // 1..5
  connectivity: number; // 1..5
  green_area: number; // 1..5
  locality: number; // 1..5
  positive_comment?: string | null;
  negative_comment?: string | null;
}

// Response returned by store endpoint
interface CreateReviewResponse {
  success: boolean;
  message?: string;
  data?: Review;
}

// Fetch all reviews for a property
// @param propertyId - property id
export const fetchPropertyReviews = async (propertyId: number | string): Promise<{
  success: boolean;
  data: Review[];
}> => {
  try {
    const res = await api.get<FetchReviewsResponse>(`/properties/${propertyId}/reviews`);
    return {
      success: res.data.success,
      data: res.data.data ?? [],
    };
  } catch (err: any) {
    // Optional: you can parse axios error for better message
    console.error("Failed to fetch property reviews:", err?.response?.data ?? err.message ?? err);
    return { success: false, data: [] };
  }
};

// Submit a new review for a property
// Requires authentication (assumes your axios instance attaches token)
export const submitPropertyReview = async (
  propertyId: number | string,
  payload: CreateReviewPayload
): Promise<{
  success: boolean;
  message?: string;
  data?: Review | null;
}> => {
  try {
    const res = await api.post<CreateReviewResponse>(`/customer/properties/${propertyId}/reviews`, payload);
    return {
      success: res.data.success,
      message: res.data.message,
      data: res.data.data ?? null,
    };
  } catch (err: any) {
    // Extract message from server when possible
    const serverMsg =
      err?.response?.data?.message ||
      err?.response?.data?.errors?.[0] ||
      err?.response?.data ||
      err.message;
    console.error("Failed to submit review:", serverMsg);
    return {
      success: false,
      message: serverMsg,
      data: null,
    };
  }
};


// agent review
export interface AgentReview {
  id: number;
  agent_id: number;
  user_id: number;
  rating: number;
  comment?: string;
  created_at: string;
  updated_at: string;
  user: {
    id: number;
    name: string;
    avatar_url?: string;
  };
}

export interface CreateAgentReviewPayload {
  rating: number;
  comment?: string;
}

// Get agent reviews
export const getAgentReviews = async (agentId: number): Promise<{
  success: boolean;
  data: AgentReview[];
}> => {
  const response = await api.get<{ success: boolean; data: AgentReview[] }>(`/agents/${agentId}/reviews`);
  return response.data;
};

// Submit agent review
export const submitAgentReview = async (
  agentId: number,
  payload: CreateAgentReviewPayload
): Promise<{
  success: boolean;
  message: string;
  data: AgentReview;
}> => {
  const response = await api.post<{ success: boolean; message: string; data: AgentReview }>(`customer/agent/${agentId}/reviews`, payload);
  console.log("submitAgentReview response:", response.data);
  return response.data;
};