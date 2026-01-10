import api from "@/api/axios"; 
import { InquiriesResponse, InquiryResponse } from "../customer/properties";

export interface InquiryHistoryResponse {
  success: boolean;
  message: string;
  data: {
    history: [];
  };
}

// Get all agent inquiries (with filters)
export const getAgentInquiries = async (params = {}) => {
  const res = await api.get<InquiriesResponse>("/agent/inquiries", { params });
  return res.data.data;
};

// Get inquiry details
export const getInquiryById = async (id: number) => {
  const res = await api.get<InquiryResponse>(`/agent/inquiries/${id}`);
  return res.data.data.inquiry;
};

// Update stage
export const updateInquiryStage = async (id: number, stage: string, note?: string) => {
  const res = await api.put<InquiryResponse>(`/agent/inquiries/${id}/stage`, { stage, note });
  return res.data.data.inquiry;
};

// Add note
export const addInquiryNote = async (id: number, note: string) => {
  const res = await api.post<InquiryResponse>(`/agent/inquiries/${id}/notes`, { note });
  return res.data.data.inquiry;
};

// Get history
export const getInquiryHistory = async (id: number) => {
  const res = await api.get<InquiryHistoryResponse>(`/agent/inquiries/${id}/history`);
  return res.data.data.history;
};
