/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "@/api/axios";

export interface Agent {
  company_name: string;
  id: number;
  name: string;
  email: string;
  status: boolean;
  two_factor_enabled: boolean | null;
  joined: string;
  avatar?: string | null;
}

interface AgentResponse {
  success: boolean;
  message: string;
  data: {
    agents: Agent[];
    pagination: {
      total: number;
      per_page: number;
      current_page: number;
      last_page: number;
    };
  };
}

export const getAgents = async (page = 1, search = "") => {
  const params: any = { page, per_page: 12 };
  if (search && search.trim() !== "") {
    // use 'search' param — change to 'q' or 'term' if your backend uses that
    params.search = search.trim();
  }
  const response = await api.get<AgentResponse>(`/admin/agents`, {
    params: { page, search },
  });
  return response.data;
};
