import api from "@/api/axios";

/* ======================================================
   Types & Interfaces
====================================================== */

// Allowed datatypes from backend
export type AppSettingDatatype = "string" | "number" | "boolean" | "json";

// Credit costs per feature
export interface CreditCosts {
  images_access: number;
  video_access: number;
  documents_access: number;
  agent_contact_access: number;
  virtual_tour_access: number;
  exact_location: number;
  send_inquiry: number;
  book_appointment: number;
  premium_property_view: number;
  view_analytics: number;
}

// API response data wrapper
export interface CreditCostsData {
  credit_costs: CreditCosts;
  description: string;
}

// Full API response
export interface CreditCostsResponse {
  success: boolean;
  message: string;
  data: CreditCostsData;
}


// Single App Setting
export interface AppSetting {
  id: number;
  group: string;
  label: string;
  name: string;
  value: string;
  datatype: AppSettingDatatype;
  description?: string | null;
  created_at?: string;
  updated_at?: string;
}

// Grouped settings response
export interface GroupedAppSettings {
  [group: string]: AppSetting[];
}

// Generic API response
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

/* ======================================================
   Request Payloads
====================================================== */

// Create setting
export interface CreateAppSettingPayload {
  group: string;
  label: string;
  name: string;
  value: string;
  datatype: AppSettingDatatype;
  description?: string;
}

// Update single setting
export interface UpdateAppSettingPayload {
  value: string;
}

// Bulk update
export interface BulkUpdateSettingItem {
  id: number;
  value: string;
}

export interface BulkUpdateSettingsPayload {
  settings: BulkUpdateSettingItem[];
}

/* ======================================================
   API Calls (Admin)
====================================================== */

/**
 * GET /admin/settings
 * Optional filter by group
 */
export const getAppSettings = async (group?: string) => {
  const response = await api.get<
    ApiResponse<GroupedAppSettings | AppSetting[]>
  >("/admin/settings", {
    params: group ? { group } : {},
  });

  return response.data;
};

export const getCreditCostsCustomer = async (group?: string) => {
  const response = await api.get<CreditCostsResponse>("/settings/credit-costs", {
    params: group ? { group } : {},
  });

  return response.data;
};

/**
 * GET /admin/settings/{id}
 */
export const getAppSettingById = async (id: number) => {
  const response = await api.get<ApiResponse<AppSetting>>(
    `/admin/settings/${id}`
  );

  return response.data;
};

/**
 * POST /admin/settings
 */
export const createAppSetting = async (
  payload: CreateAppSettingPayload
) => {
  const response = await api.post<ApiResponse<AppSetting>>(
    "/admin/settings",
    payload
  );

  return response.data;
};

/**
 * PUT /admin/settings/{id}
 */
export const updateAppSetting = async (
  id: number,
  payload: UpdateAppSettingPayload
) => {
  const response = await api.put<ApiResponse<AppSetting>>(
    `/admin/settings/${id}`,
    payload
  );

  return response.data;
};

/**
 * POST /admin/settings/bulk-update
 */
export const bulkUpdateAppSettings = async (
  payload: BulkUpdateSettingsPayload
) => {
  const response = await api.post<ApiResponse<null>>(
    "/admin/settings/bulk-update",
    payload
  );

  return response.data;
};

/**
 * DELETE /admin/settings/{id}
 */
export const deleteAppSetting = async (id: number) => {
  const response = await api.delete<ApiResponse<null>>(
    `/admin/settings/${id}`
  );

  return response.data;
};
