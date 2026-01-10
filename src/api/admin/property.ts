/* eslint-disable @typescript-eslint/no-explicit-any */

import api from "@/api/axios";

interface PaginatedProperties {
  properties: any[];
  pagination: {
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
  };
}

export const getAdminProperties = async (
  filters: Record<string, string> = {},
  page = 1
): Promise<PaginatedProperties> => {
  const params = new URLSearchParams({ page: page.toString() });
  Object.entries(filters).forEach(([key, value]) => {
    if (value && value !== "all") params.append(key, value);
  });

  const res = await api.get<{ data: PaginatedProperties }>(
    `/admin/properties?${params.toString()}`
  );
  return res.data.data;
};

// Approve property
export const approveProperty = async (id: number) => {
  const res = await api.post(`/admin/properties/${id}/approve`);
  return res.data;
};

// Reject property
export const rejectProperty = async (propertyId: number, reason?: string) => {
  const response = await api.post(`/admin/properties/${propertyId}/reject`, {
    reason: reason ?? null,
  });
  return response.data;
};

// get property statistics
export const getPropertyStats = async (): Promise<{
  total: number;
  published: number;
  sold: number;
  rented: number;
  draft: number;
  pending_approval: number;
  approved: number;
  rejected: number;
  for_sale: number;
  for_rent: number;
}> => {
  const res = await api.get<{ data: { statistics: any } }>(
    "/admin/properties/statistics"
  );

  return res.data.data.statistics;
};
