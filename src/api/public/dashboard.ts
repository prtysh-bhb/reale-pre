import api from "@/api/axios";
import { FAQListResponse } from "../admin/cms";

export const getFAQs = async (): Promise<FAQListResponse> => {
  const response = await api.get<FAQListResponse>("/faqs");
  return response.data;
};
