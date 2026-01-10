/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "@/api/axios";

/**
 * ================================
 *  CORE MODELS
 * ================================
 */

// Credit package (same model used by admin CreditController)
export interface CreditPackage {
  id: number;
  name: string;
  price: number;
  coins: number;
  description?: string | null;
  status: "active" | "inactive";
  created_at: string;
  updated_at: string;
}

// Wallet model (from UserWallet)
export interface Wallet {
  id: number;
  user_id: number;
  current_credits: number;
  total_credits_purchased: number;
  total_credits_spent: number;
  created_at: string;
  updated_at: string;
}

// Simple wallet summary used in /customer/wallet
export interface WalletSummary {
  current_credits: number;
  total_credits_purchased: number;
  total_credits_spent: number;
}

// Property attached to a transaction (if any)
export interface WalletProperty {
  id: number;
  title: string;
}

// Wallet transaction (CreditTransaction)
export interface WalletTransaction {
  id: number;
  user_id: number;
  type: string; // e.g. "purchase", "spend", "admin_add", "admin_deduct"
  credits: number; // positive / negative
  description?: string | null;
  property_id?: number | null;
  property?: WalletProperty | null;
  metadata?: any;
  created_at: string;
  updated_at: string;
}

/**
 * ================================
 *  API RESPONSE WRAPPERS
 * ================================
 */

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface ApiListResponse<T> {
  success: boolean;
  data: T[];
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
    data: T[];
  };
}

// For /customer/wallet/balance
export interface WalletBalanceResponse {
  [x: string]: any;
  success: boolean;
  balance: number;
}

/**
 * ================================
 *  PAYLOAD INTERFACES
 * ================================
 */

// POST /customer/wallet/buy
export interface WalletBuyPayload {
  package_id: number;
  payment_method_id: string; // Stripe payment method id
}

// Response data from buy()
export interface WalletBuyData {
  transaction: WalletTransaction;
  wallet: Wallet;
  payment_intent_id: string;
}

// POST /customer/wallet/spend
export type WalletActionType =
  | "property_photo"
  | "property_video"
  | "agent_number"
  | "book_appointment"
  | "exact_location"
  | "unlock_documents"
  | "send_inquiry"
  | "unlock_vr_tour"
  | "view_analytics";

export interface WalletSpendPayload {
  action_type: WalletActionType;
  property_id?: number | null;
}

// Response data from spend()
export interface WalletSpendData {
  transaction: WalletTransaction;
  wallet: Wallet;
}

/**
 * ================================
 *  API CALLS
 * ================================
 */

/**
 * GET /customer/wallet
 * Returns wallet summary (current, purchased, spent)
 */
export const getWalletSummary = async () => {
  const res = await api.get<ApiResponse<WalletSummary>>("/customer/wallet");
  return res.data;
};

/**
 * GET /customer/wallet/packages
 * Returns list of active credit packages
 */
export const getWalletPackages = async () => {
  const res = await api.get<ApiListResponse<CreditPackage>>(
    "/credit-packages"
  );
  return res.data;
};

/**
 * POST /customer/wallet/buy
 * Buy credits via Stripe (requires payment_method_id)
 */
export const buyWalletPackage = async (payload: WalletBuyPayload) => {
  const res = await api.post<ApiResponse<WalletBuyData>>(
    "/customer/wallet/buy",
    payload
  );
  return res.data;
};

/**
 * POST /customer/wallet/spend
 * Spend credits for an action (property_photo, book_appointment, etc.)
 */
export const spendWalletCredits = async (payload: WalletSpendPayload) => {
  const res = await api.post<ApiResponse<WalletSpendData>>(
    "/customer/wallet/spend",
    payload
  );
  return res.data;
};

/**
 * GET /customer/wallet/transactions?type=purchase|spend|...
 * Paginated list of user's credit transactions
 */
export const getWalletTransactions = async (params?: {
  type?: string;
  page?: number;
}) => {
  const res = await api.get<PaginatedResponse<WalletTransaction>>(
    "/customer/wallet/transactions",
    { params }
  );
  return res.data;
};

/**
 * GET /customer/wallet/balance
 * Returns only current_credits as `balance`
 */
export const getWalletBalance = async () => {
  const res = await api.get<WalletBalanceResponse>("/customer/wallet/balance");
  return res.data;
};
