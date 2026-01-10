/* eslint-disable @typescript-eslint/no-explicit-any */
// src/api/public/blogs.ts  (example path)

import api from "@/api/axios";

/* =========================
   Types
   ========================= */

// ---------- Blog Category ----------
export interface BlogCategory {
  id: number;
  name: string;
  slug: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

// ---------- Blog Author ----------
export interface BlogUser {
  id: number;
  name: string;
  avatar_url?: string;
  email?: string;
}

// ---------- Blog Core Model ----------
export interface Blog {
  id: number;
  user_id: number;
  user?: BlogUser;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;

  category?: BlogCategory;
  category_id?: number;

  image_url?: string;
  image?: string;
  featured_image_url?: string;

  meta_tags?: {
    title?: string;
    description?: string;
    keywords?: string;
  };

  views_count?: number;
  likes_count?: number;

  is_featured?: boolean;
  status?: "draft" | "pending" | "approved" | "rejected";

  created_at: string;
  updated_at: string;
}

// ---------- Blog Statistics (/blogs/statistics) ----------
export interface BlogStatistics {
  total_blogs: number;
  total_featured: number;
  latest: number;
  total_views: number;
  total_categories: number;
  total_popular: number;
  categories_count: {
    [key: number]: number; // category_id → total blogs
  };
}

// ---------- Generic API Wrappers ----------
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface PaginatedResponse<T> {
  success: boolean;
  message?: string;
  data: {
    filter: any;
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
    data: T[];
  };
}


// Convenience aliases
export type BlogListResponse = PaginatedResponse<Blog>;
export type BlogArrayResponse = ApiResponse<Blog[]>;
export type BlogDetailResponse = ApiResponse<Blog>;
export type BlogCategoryListResponse = ApiResponse<BlogCategory[]>;
export type BlogStatisticsResponse = ApiResponse<BlogStatistics>;

/* =========================
   Services for /blogs routes
   ========================= */

// GET /blogs
export const getBlogs = async (page = 1): Promise<BlogListResponse> => {
  const response = await api.get<BlogListResponse>("/blogs", {
    params: { page },
  });
  return response.data;
};

// GET /blogs/featured
export const getFeaturedBlogs = async (): Promise<BlogArrayResponse> => {
  const response = await api.get<BlogArrayResponse>("/blogs/featured");
  return response.data;
};

// GET /blogs/latest
export const getLatestBlogs = async (): Promise<BlogArrayResponse> => {
  const response = await api.get<BlogArrayResponse>("/blogs/latest");
  return response.data;
};

// GET /blogs/popular
export const getPopularBlogs = async (): Promise<BlogArrayResponse> => {
  const response = await api.get<BlogArrayResponse>("/blogs/popular");
  return response.data;
};

// GET /blogs/search?query=...&page=...
export const searchBlogs = async (
  query: string,
  page = 1
): Promise<BlogListResponse> => {
  const response = await api.get<BlogListResponse>("/blogs/search", {
    params: { query, page },
  });
  return response.data;
};

// GET /blogs/statistics
export const getBlogStatistics = async () => {
  const res = await api.get<ApiResponse<BlogStatistics>>("/blogs/statistics");
  return res.data.data; // return only stats object
};

// GET /blogs/categories
export const getBlogCategories = async (): Promise<BlogCategoryListResponse> => {
  const response = await api.get<BlogCategoryListResponse>("/blogs/categories");
  return response.data;
};

// GET /blogs/category/{categorySlug}?page=...
export const getBlogsByCategory = async (
  categorySlug: string,
  page = 1
): Promise<BlogListResponse> => {
  const response = await api.get<BlogListResponse>(
    `/blogs/category/${encodeURIComponent(categorySlug)}`,
    {
      params: { page },
    }
  );
  return response.data;
};

// GET /blogs/author/{userId}?page=...
export const getBlogsByAuthor = async (
  userId: number | string,
  page = 1
): Promise<BlogListResponse> => {
  const response = await api.get<BlogListResponse>(`/blogs/author/${userId}`, {
    params: { page },
  });
  return response.data;
};

// GET /blogs/{slug}
export const getBlogBySlug = async (slug: string): Promise<BlogDetailResponse> => {
  const response = await api.get<BlogDetailResponse>(`/blogs/${slug}`);
  return response.data;
};

// GET /blogs/{slug}/related
export const getRelatedBlogs = async (
  slug: string
): Promise<BlogArrayResponse> => {
  const response = await api.get<BlogArrayResponse>(`/blogs/${slug}/related`);
  return response.data;
};

// Comments

export interface CommentUser {
  id: number;
  name: string;
  avatar_url?: string | null;
}

export interface CommentBlog {
  id: number;
  title: string;
  slug: string;
}

export interface BlogComment {
  id: number;
  blog_id: number;
  user_id: number;
  comment: string;
  is_approved: boolean;
  created_at: string;
  updated_at: string;

  // when loaded with relations
  user?: CommentUser;
  blog?: CommentBlog;
}

export const getBlogCommentsBySlug = async (
  slug: string,
  params?: { page?: number }
) => {
  const res = await api.get<{
    success: boolean;
    data: PaginatedResponse<BlogComment>;
  }>(`/blogs/${slug}/comments`, { params });

  // return just the paginated data block
  return res.data.data;
};
/* ========= API calls (match BlogCommentController) ========= */

/**
 * POST /customer/blogs/{blogId}/comments
 * Add a new comment to a blog (auto-approved)
 */
export const addBlogComment = async (blogId: number, payload: { comment: string }) => {
  const res = await api.post<{
    success: boolean;
    message: string;
    data: BlogComment;
  }>(`/customer/blogs/${blogId}/comments`, payload);

  return res.data;
};

/**
 * GET /customer/my-comments
 * Get current customer's own comments (paginated)
 */
export const getMyComments = async (params?: { page?: number }) => {
  const res = await api.get<{
    success: boolean;
    data: PaginatedResponse<BlogComment>;
  }>("/customer/my-comments", { params });

  return res.data.data; // returns PaginatedResponse<BlogComment>
};

/**
 * PUT /customer/comments/{id}
 * Update own comment
 */
export const updateMyComment = async (id: number, payload: { comment: string }) => {
  const res = await api.put<{
    success: boolean;
    message: string;
    data: BlogComment;
  }>(`/customer/comments/${id}`, payload);

  return res.data;
};

/**
 * DELETE /customer/comments/{id}
 * Delete own comment
 */
export const deleteMyComment = async (id: number) => {
  const res = await api.delete<{
    success: boolean;
    message: string;
  }>(`/customer/comments/${id}`);

  return res.data;
};

