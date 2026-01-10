import axios from "@/api/axios";
import { Page, PageFormData, FooterPage } from "@/types/page";

// Admin APIs

export const getPages = async (): Promise<Page[]> => {
  const response = await axios.get<Page[]>("/admin/pages");
  return response.data;
};

export const getPage = async (id: number): Promise<Page> => {
  const response = await axios.get<Page>(`/admin/pages/${id}`);
  return response.data;
};

export const createPage = async (data: PageFormData): Promise<Page> => {
  const response = await axios.post<Page>("/admin/pages", data);
  return response.data;
};

export const updatePage = async (
  id: number,
  data: PageFormData
): Promise<Page> => {
  const response = await axios.put<Page>(`/admin/pages/${id}`, data);
  return response.data;
};

export const deletePage = async (id: number): Promise<void> => {
  await axios.delete(`/admin/pages/${id}`);
};

// Public APIs

export const getFooterPages = async (): Promise<FooterPage[]> => {
  const response = await axios.get<FooterPage[]>("/pages/footer");
  return response.data;
};

export const getPublicPage = async (slug: string): Promise<Page> => {
  const response = await axios.get<Page>(`/pages/${slug}`);
  return response.data;
};
