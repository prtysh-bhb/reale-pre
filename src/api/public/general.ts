import api from "@/api/axios";
import { SiteMeta, SiteMetaResponse } from "@/types/general";

export const getSiteMeta = async (): Promise<SiteMetaResponse> => {
  const response = await api.get<SiteMetaResponse>("/site-meta");
  return response.data;
};
