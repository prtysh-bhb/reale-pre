/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "@/api/axios";
import { ApiResponse } from "@/types";

export interface SubscriptionPlan {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  duration_days: number;
  features: string[];
  property_limit: number;
  featured_limit: number;
  image_limit: number;
  video_allowed: boolean;
  priority_support: boolean;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionPlanListResponse {
  success: boolean;
  message: string;
  data: {
    plans: SubscriptionPlan[];
  };
}

export interface SubscriptionPlanResponse {
  success: boolean;
  message: string;
  data: {
    plan: SubscriptionPlan;
  };
}

// Fetch subscriptions (with search)
export const getSubscriptionPlans = async (search = "") => {
  const response = await api.get<SubscriptionPlanListResponse>("/admin/subscription-plans", {
    params: { search },
  });
  return response.data;
};

// Fetch subscription by ID
export const getSubscriptionPlan = async (id: number) => {
  const response = await api.get<SubscriptionPlanResponse>(`/admin/subscription-plans/${id}`);
  return response.data;
};

// Create subscription by Admin
export const addSubscriptionPlan = async (formData: Record<string, any>) => {
  try {
    const response = await api.post<ApiResponse>(`/admin/subscription-plans`, formData);
    return response.data;
  } catch (error: any) {
    throw error.response?.data || { success: false, message: "Failed to add subscription" };
  }
};

// Update subscription by Admin
export const updateSubscriptionPlan = async (subscriptionId: number, formData: Record<string, any>) => {
  try {
    const response = await api.put<ApiResponse>(`/admin/subscription-plans/${subscriptionId}`, formData);
    return response.data;
  } catch (error: any) {
    throw error.response?.data || { success: false, message: "Failed to update subscription" };
  }
};

// Delete subscription by Admin
export const deleteSubscriptionPlan = async (subscriptionId: number) => {
  try {
    const response = await api.delete<ApiResponse>(`/admin/subscription-plans/${subscriptionId}`);
    return response.data;
  } catch (error: any) {
    throw error.response?.data || { success: false, message: "Failed to delete subscription" };
  }
};

// Toggle Status subscription by Admin
export const toggleStatusSubscriptionPlan = async (subscriptionId: number) => {
  try {
    const response = await api.post<ApiResponse>(`/admin/subscription-plans/${subscriptionId}/toggle-status`);
    return response.data;
  } catch (error: any) {
    throw error.response?.data || { success: false, message: "Failed to update status of subscription" };
  }
};