/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "@/api/axios";

export interface Customer {
  id: number;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipcode?: string;
  company_name?: string;
  license_number?: string;
  is_active: boolean;
  role: string;
  two_factor_enabled?: boolean | null;
  created_at?: string;
}

export interface CustomerResponse {
  success: boolean;
  message: string;
  data: {
    customers: Customer[];
    pagination: {
      total: number;
      per_page: number;
      current_page: number;
      last_page: number;
    };
  };
}

// Fetch customers (with pagination + search)
export const getCustomers = async (page = 1, search = "") => {
  const response = await api.get<CustomerResponse>("/admin/customers", {
    params: { page, search },
  });
  return response.data;
};

// Update user (Agent/Customer) profile by Admin
export const updateUserProfile = async (userId: number, formData: Record<string, any>) => {
  try {
    const response = await api.put(`/admin/users/${userId}`, formData);
    return response.data;
  } catch (error: any) {
    throw error.response?.data || { success: false, message: "Failed to update user" };
  }
};
