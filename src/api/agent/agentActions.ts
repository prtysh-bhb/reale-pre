/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "@/api/axios";

// Update agent profile by Admin
export const updateAgent = async (id: number, data: Record<string, any>) => {
  const response = await api.put(`/admin/users/${id}`, data);
  return response.data;
};

// Delete agent by Admin
export const deleteAgent = async (id: number) => {
  const response = await api.delete(`/admin/agents/${id}`);
  return response.data;
};
