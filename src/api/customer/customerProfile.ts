import api from "@/api/axios";

export interface CustomerProfile {
  id: number;
  name: string;
  email: string;
  phone?: string;
  city?: string;
  avatar?: string;
  status?: boolean;
  joined?: string;
  bio?: string;
  total_inquiries?: number;
  total_favorites?: number;
  two_factor_enabled?: boolean | null;
}

interface CustomerProfileResponse {
  success: boolean;
  message: string;
  data: {
    customer: CustomerProfile
  };
}

export const fetchCustomerProfile = async (id: string) => {
  const res = await api.get<CustomerProfileResponse>(`/admin/customers/${id}`);

  return {
    success: res.data.success,
    data: res.data.data.customer,
  };
};
