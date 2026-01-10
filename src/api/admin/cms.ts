/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "@/api/axios";

// =============================
// FAQ Interfaces
// =============================
export interface FAQ {
  id: number;
  question: string;
  answer: string;
  status: number;
  created_at: string;
  updated_at: string;
}

export interface FAQResponse {
  success: boolean;
  message?: string;
  data: FAQ;
}

export interface FAQListResponse {
  success: boolean;
  data: FAQ[];
}

// =============================
// Blog Interfaces
// =============================
export interface Blog {
  views_count: number;
  featured_image_url?: string | null;
  meta_title: string;
  meta_description: string;
  meta_keywords: string;
  id: number;
  title: string;
  content: string;
  image: string | null;
  category_id: number | null;
  image_url?: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface BlogFormData{
  title: string;
  content: string;
  category_id: number | null;
  featured_image?: string | null;
  meta_title?: string | null;
  meta_description?: string | null;
  meta_keywords?: string | null;
  image?: string | null;
  status: string;
}

export interface NewsFormData{
  title: string;
  content: string;
  image?: string | null;
  status: number;
}

export interface BlogResponse {
  success: boolean;
  message?: string;
  data: Blog;
}

export interface BlogListResponse {
  success: boolean;
  data: Blog[];
}

// =============================
// Blog Categories Interfaces
// =============================
export interface BlogCategory {
  id: number;
  name: string;
  content: string;
  is_active: boolean;
  blogs_count: number;
  slug: string;
  created_at: string;
  updated_at: string;
}

export interface BlogCategoryFormData{
  name: string;
  content: string;
  is_active: boolean;
}

export interface BlogCategoryResponse {
  success: boolean;
  message?: string;
  data: BlogCategory;
}

export interface BlogCategoryListResponse {
  success: boolean;
  data: BlogCategory[];
}

// =============================
// News Interfaces
// =============================
export interface News {
  id: number;
  title: string;
  content: string;
  image: string | null;
  image_url?: string | null;
  status: number;
  created_at: string;
  updated_at: string;
}

export interface NewsResponse {
  success: boolean;
  message?: string;
  data: News;
}

export interface NewsListResponse {
  success: boolean;
  data: News[];
}

// =============================
// FAQ API
// =============================
export const getFaqs = async () => {
  const response = await api.get<FAQListResponse>("/admin/faqs");
  return response.data;
};

export const createFaq = async (payload: Partial<FAQ>) => {
  const response = await api.post<FAQResponse>("/admin/faqs", payload);
  return response.data;
};

export const updateFaq = async (id: number, payload: Partial<FAQ>) => {
  const response = await api.put<FAQResponse>(`/admin/faqs/${id}`, payload);
  return response.data;
};

export const deleteFaq = async (id: number) => {
  const response = await api.delete(`/admin/faqs/${id}`);
  return response.data;
};

export const updateFaqStatus = async (id: number) => {
  const response = await api.post(`/admin/faqs/update-status/${id}`);
  return response.data;
};

// =============================
// Blog API
// =============================
export const getBlogs = async () => {
  const response = await api.get<BlogListResponse>("/admin/blogs");
  return response.data;
};

export const getBlog = async (id: number) => {
  const response = await api.get<BlogResponse>(`/admin/blogs/${id}`);
  return response.data;
};

export const createBlog = async (form: FormData) => {
  const response = await api.post<BlogResponse>("/admin/blogs", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const updateBlog = async (id: number, form: FormData) => {
  form.append('_method', 'PUT');

  const response = await api.post<BlogResponse>(`/admin/blogs/${id}`, form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const deleteBlog = async (id: number) => {
  const response = await api.delete(`/admin/blogs/${id}`);
  return response.data;
};

export const updateBlogStatus = async (id: number) => {
  const response = await api.post(`/admin/blogs/update-status/${id}`);
  return response.data;
};

// =============================
// Blog Categories API
// =============================
export const getBlogCategories = async () => {
  const response = await api.get<BlogCategoryListResponse>("/admin/blog-categories");
  return response.data;
};

export const getBlogCategory = async (id: number) => {
  const response = await api.get<BlogCategoryResponse>(`/admin/blog-categories/${id}`);
  return response.data;
};

export const createBlogCategory = async (form: BlogCategoryFormData) => {
  const response = await api.post<BlogCategoryResponse>("/admin/blog-categories", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const updateBlogCategory = async (id: number, form: BlogCategoryFormData) => {  
  const response = await api.put<BlogCategoryResponse>(`/admin/blog-categories/${id}`, form);
  return response.data;
};

export const deleteBlogCategory = async (id: number) => {
  const response = await api.delete(`/admin/blog-categories/${id}`);
  return response.data;
};

export const updateBlogCategoryStatus = async (id: number) => {
  const response = await api.post(`/admin/blog-categories/update-status/${id}`);
  return response.data;
};

// =============================
// News API
// =============================
export const getNews = async () => {
  const response = await api.get<NewsListResponse>("/admin/news");
  return response.data;
};

export const getSingleNews = async (id: number) => {
  const response = await api.get<NewsResponse>(`/admin/news/${id}`);
  return response.data;
};

export const createNews = async (form: FormData) => {
  const response = await api.post<NewsResponse>("/admin/news", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const updateNews = async (id: number, form: FormData) => {
  form.append('_method', 'PUT');
  const response = await api.post<NewsResponse>(`/admin/news/${id}`, form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const deleteNews = async (id: number) => {
  const response = await api.delete(`/admin/news/${id}`);
  return response.data;
};

export const updateNewsStatus = async (id: number) => {
  const response = await api.post(`/admin/news/update-status/${id}`);
  return response.data;
};