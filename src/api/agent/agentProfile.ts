import api from "@/api/axios";
import { ReactNode } from "react";

export interface AgentProfile {
  bio: ReactNode;
  total_properties: ReactNode;
  id: number;
  name: string;
  email: string;
  status: boolean;
  two_factor_enabled: boolean | null;
  company_name: string;
  licence_number: string;
  joined: string;
  updated_at: string;
  avatar?: string | null;
  phone?: string | null;
  city?: string | null;
}

interface AgentProfileResponse {
  success: boolean;
  message: string;
  data: {
    agent: AgentProfile
  }
}

export const fetchAgentProfile = async (id: string) => {
  const response = await api.get<AgentProfileResponse>(`/admin/agents/${id}`);
  
  return response.data;  
};
