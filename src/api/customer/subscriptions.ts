/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "@/api/axios";
import { SubscriptionPlan, SubscriptionPlanListResponse, SubscriptionPlanResponse } from "../admin/subscriptions";

export interface PaymentIntentData {
  payment_intent_id: string;
  client_secret: string;
  status: string;
  amount: number;       // converted from cents
  currency: string;
  plan: SubscriptionPlan; // your existing plan interface
}

export interface Payment {
  id: number;
  subscription_id: number;
  amount: number;
  payment_method: string;
  status: string;
  created_at: string;
}

export interface PaymentIntentInfo {
  id: string;
  status: string;
  amount: number; // converted from cents
}

export interface ConfirmPaymentData {
  payment_intent: PaymentIntentInfo;
  subscription: SubscriptionPlan;
  payment: Payment;
}

export interface PaymentIntentResponse {
  success: boolean;
  message: string;
  data: PaymentIntentData;
}

export interface ConfirmPaymentResponse {
  success: boolean;
  message: string;
  data: ConfirmPaymentData;
}

export interface UserSubscription {
  id: number;
  user_id: number;
  plan_id: number;
  stripe_subscription_id: string | null;
  stripe_customer_id: string | null;
  status: string;
  amount_paid: number;
  starts_at: string | null;
  ends_at: string | null;
  cancelled_at: string | null;
  plan?: SubscriptionPlan;
}

export interface SubscriptionsResponse {
  success: boolean;
  message: string;
  data: {
    subscriptions: UserSubscription[];
  };
}

export interface SubscriptionResponse {
  success: boolean;
  message: string;
  data: {
    subscription: UserSubscription;
  };
}

// Fetch subscriptions (with search)
export const getSubscriptionPlans = async (search = "") => {
  const response = await api.get<SubscriptionPlanListResponse>("/subscription-plans", {
    params: { search },
  });
  return response.data;
};

// Fetch subscription by ID
export const getSubscriptionPlan = async (id: number) => {
  const response = await api.get<SubscriptionPlanResponse>(`/subscription-plans/${id}`);
  return response.data;
};

// Fetch client secret key by subscription plan ID
export const createSubscriptionPlanIntent = async (id: number) => {
  const response = await api.post<PaymentIntentResponse>(`/payments/create-intent`, { plan_id: id });
  return response.data;
};

// Confirm subscription plan activation
export const confirmSubscriptionPlanPayment = async (id: number, payment_intent_id: string) => {
  const response = await api.post<ConfirmPaymentResponse>(`/payments/test/confirm`, { 
    plan_id: id,
    payment_intent_id:payment_intent_id 
  });

  return response.data;
};

// Fetch customer subscriptions
export const mySubscriptions = async () => {
  const response = await api.get<SubscriptionsResponse>("/subscriptions/my");
  return response.data;
};

// Cancel customer subscriptions
export const cancelSubscription = async (id: number) => {
  const response = await api.post<SubscriptionResponse>(`/subscriptions/${id}/cancel`);
  return response.data;
};

// View invoice (open in browser)
export const viewInvoice = async (paymentId: number) => {
  const response = await api.get(`/payments/${paymentId}/invoice/view`);
  return response.data;
};

// Download invoice (returns PDF)
export const fetchInvoicePdf = async (paymentId: number) => {
  const response = await api.get(`/payments/${paymentId}/invoice/download`, {
    responseType: "blob", // IMPORTANT
  });
  return response.data; // Blob
};

// Email invoice to customer
export const emailInvoice = async (paymentId: number) => {
  const response = await api.post(`/payments/${paymentId}/invoice/email`);
  return response.data;
};