/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "@/api/axios";

/**
 * ================================
 *  INTERFACES
 * ================================
 */

// Credit Package Model
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

// API Response (single)
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

// For index() → returns array
export interface ApiListResponse<T> {
  success: boolean;
  data: T[];
}

/**
 * Payload for create/update
 */
export interface CreditPackagePayload {
  name: string;
  price: number;
  coins: number;
  description?: string | null;
  status: "active" | "inactive";
}

/**
 * ================================
 *  API CALLS
 * ================================
 */

//  Get all credit packages
export const getCreditPackages = async () => {
  const res = await api.get<ApiListResponse<CreditPackage>>("/admin/credits");
  return res.data.data;
};

// Get single credit package by ID
export const getCreditPackage = async (id: number) => {
  const res = await api.get<ApiResponse<CreditPackage>>(`/admin/credits/${id}`);
  return res.data.data;
};

// Create new credit package
export const createCreditPackage = async (payload: CreditPackagePayload) => {
  const res = await api.post<ApiResponse<CreditPackage>>("/admin/credits", payload);
  return res.data;
};

// Update credit package
export const updateCreditPackage = async (
  id: number,
  payload: Partial<CreditPackagePayload>
) => {
  const res = await api.put<ApiResponse<CreditPackage>>(`/admin/credits/${id}`, payload);
  return res.data;
};

// Delete credit package
export const deleteCreditPackage = async (id: number) => {
  const res = await api.delete<ApiResponse<null>>(`/admin/credits/${id}`);
  return res.data;
};


// admin Wallet management
export interface AdminUserSummary {
  id: number;
  name: string;
  email: string;
  avatar_url?: string;
}

export interface AdminWallet {
  id: number;
  user_id: number;
  current_credits: number;
  total_credits_purchased: number;
  total_credits_spent: number;
  created_at: string;
  updated_at: string;

  // when loaded with('user')
  user?: AdminUserSummary;
}

export interface AdminPropertySummary {
  id: number;
  title: string;
}

export interface AdminCreditTransaction {
  id: number;
  user_id: number;
  property_id?: number | null;
  type: string; // 'purchase', 'spend', 'admin_add', 'admin_deduct', etc.
  credits: number;
  description?: string | null;
  metadata?: any;
  created_at: string;
  updated_at: string;

  user?: AdminUserSummary;
  property?: AdminPropertySummary | null;
}

/**
 * =======================================
 *  RESPONSE WRAPPERS
 * =======================================
 */

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
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

/**
 * =======================================
 *  CREDIT USAGE REPORT
 * =======================================
 */

export interface CreditUsageOverview {
  total_credits_purchased: number;
  total_credits_spent: number;
  total_current_credits: number;
  total_users_with_wallet: number;
  total_transactions: number;
}

export interface CreditTransactionsByType {
  type: string;
  count: number;
  total_credits: number;
}

export interface CreditUsageReportData {
  overview: CreditUsageOverview;
  transactions_by_type: CreditTransactionsByType[];
  recent_purchases: AdminCreditTransaction[];
}

/**
 * =======================================
 *  PAYLOADS
 * =======================================
 */

export interface AdminAdjustCreditsPayload {
  credits: number;
  reason: string;
}

export interface AdminAdjustCreditsData {
  transaction: AdminCreditTransaction;
  wallet: AdminWallet;
}

/**
 * =======================================
 *  API CALLS
 * =======================================
 */

/**
 * GET /admin/wallets
 * List all user wallets with optional search
 * ?search=keyword
 */
export const adminGetWallets = async (params?: { search?: string; page?: number }) => {
  const res = await api.get<PaginatedResponse<AdminWallet>>("/admin/wallets", {
    params,
  });
  return res.data;
};

/**
 * GET /admin/wallets/{userId}
 * Get specific user's wallet details + recent transactions
 */
export interface AdminWalletShowData {
  user: AdminUserSummary;
  wallet: AdminWallet | null;
  recent_transactions: AdminCreditTransaction[];
}

export const adminGetWalletByUser = async (userId: number | string) => {
  const res = await api.get<ApiResponse<AdminWalletShowData>>(
    `/admin/wallets/${userId}`
  );
  return res.data;
};

/**
 * POST /admin/wallets/{userId}/add-credits
 * Manually add credits to user wallet
 */
export const adminAddCredits = async (
  userId: number | string,
  payload: AdminAdjustCreditsPayload
) => {
  const res = await api.post<ApiResponse<AdminAdjustCreditsData>>(
    `/admin/wallets/${userId}/add-credits`,
    payload
  );
  return res.data;
};

/**
 * POST /admin/wallets/{userId}/deduct-credits
 * Manually deduct credits from user wallet
 */
export const adminDeductCredits = async (
  userId: number | string,
  payload: AdminAdjustCreditsPayload
) => {
  const res = await api.post<ApiResponse<AdminAdjustCreditsData>>(
    `/admin/wallets/${userId}/deduct-credits`,
    payload
  );
  return res.data;
};

/**
 * GET /admin/wallets/report
 * Get credit usage statistics + breakdown + recent purchases
 */
export const adminGetCreditUsageReport = async () => {
  const res = await api.get<ApiResponse<CreditUsageReportData>>(
    "/admin/reports/credit-usage"
  );
  return res.data;
};

/**
 * GET /admin/wallets/transactions
 * Get all credit transactions (paginated) with filters
 * ?type=&user_id=&from_date=&to_date=&page=
 */
export const adminGetCreditTransactions = async (params?: {
  type?: string;
  user_id?: number | string;
  from_date?: string; // 'YYYY-MM-DD'
  to_date?: string; // 'YYYY-MM-DD'
  page?: number;
}) => {
  const res = await api.get<PaginatedResponse<AdminCreditTransaction>>(
    "/admin/transactions",
    { params }
  );
  return res.data;
};

