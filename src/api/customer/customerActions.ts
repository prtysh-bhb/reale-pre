/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "@/api/axios";

// 🔹 Deactivate customer
export const deactivateCustomer = async (id: number, reason: string) => {
  const res = await api.post(`/admin/users/${id}/deactivate`, { reason });
  return res.data;
};

// 🔹 Activate customer
export const activateCustomer = async (id: number) => {
  const res = await api.post(`/admin/users/${id}/activate`);
  return res.data;
};

// 🔹 Delete customer
export const deleteCustomer = async (id: number) => {
  const res = await api.delete(`/admin/users/${id}`);
  return res.data;
};


export const updateCustomer = async (id: number, data: Record<string, any>) => {
  const response = await api.put(`/admin/users/${id}`, data);
  return response.data;
};