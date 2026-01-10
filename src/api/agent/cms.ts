/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "@/api/axios";


export interface Blog {
  user: any;
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


export const getBlogs = async () => {
  const response = await api.get<BlogListResponse>("/agent/blogs");
  return response.data;
};

export const getBlog = async (id: number) => {
  const response = await api.get<BlogResponse>(`/agent/blogs/${id}`);
  return response.data;
};

export const createBlog = async (form: FormData) => {
  const response = await api.post<BlogResponse>("/agent/blogs", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const updateBlog = async (id: number, form: FormData) => {
  form.append('_method', 'PUT');

  const response = await api.post<BlogResponse>(`/agent/blogs/${id}`, form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const deleteBlog = async (id: number) => {
  const response = await api.delete(`/agent/blogs/${id}`);
  return response.data;
};

export const updateBlogStatus = async (id: number) => {
  const response = await api.post(`/agent/blogs/update-status/${id}`);
  return response.data;
};


export const getBlogCategories = async () => {
  const response = await api.get<BlogCategoryListResponse>("/agent/blogs/categories");
  return response.data;
};

// --------- Comment User ----------
export interface CommentUser {
  id: number;
  name: string;
  avatar_url?: string | null;
}

// --------- Blog Comment ----------
export interface BlogComment {
  id: number;
  blog_id: number;
  user_id: number;
  comment: string;
  is_approved: boolean;
  created_at: string;
  updated_at: string;

  user?: CommentUser;
}

// --------- Core Agent Blog ----------
export interface AgentBlog {
  id: number;
  user_id: number;
  category_id: number | null;
  title: string;
  slug: string;
  excerpt?: string | null;
  content: string;

  image?: string | null;            // stored path
  featured_image?: string | null;   // stored path
  image_url?: string | null;        // accessor URL
  featured_image_url?: string | null;

  status: "draft" | "pending" | "approved" | "rejected";
  rejection_reason?: string | null;
  reviewed_by?: number | null;
  reviewed_at?: string | null;

  views_count?: number;
  approved_comments_count?: number; // from withCount('approvedComments')

  meta_tags?: {
    title?: string;
    description?: string;
    keywords?: string;
  } | null;

  created_at: string;
  updated_at: string;

  category?: BlogCategory;

  // when loaded with 'approvedComments.user'
  approved_comments?: BlogComment[];
}

// --------- Statistics (/agent/blogs/statistics) ----------
export interface AgentBlogStatistics {
  total: number;
  draft: number;
  pending: number;
  approved: number;
  rejected: number;
  total_views: number;
}

// --------- Generic API Wrappers ----------
export interface Paginated<T> {
  current_page: number;
  data: T[];
  last_page: number;
  per_page: number;
  total: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

/**
 * ============================
 *  Payloads
 * ============================
 */

export interface AgentBlogFormPayload {
  title: string;
  category_id?: number | null;
  excerpt?: string | null;
  content: string;
  status: "draft" | "pending";
  meta_tags?: {
    title?: string;
    description?: string;
    keywords?: string;
  };
  image?: File | null;
  featured_image?: File | null;
}

/**
 * ============================
 *  API Calls
 * ============================
 *
 * Base routes (typical):
 *  GET    /agent/blogs
 *  GET    /agent/blogs/{id}
 *  POST   /agent/blogs
 *  PUT    /agent/blogs/{id}
 *  DELETE /agent/blogs/{id}
 *  GET    /agent/blogs/categories
 *  GET    /agent/blogs/statistics
 *  GET    /agent/blogs/{id}/comments
 */

// ---------- List Agent Blogs ----------
export const getAgentBlogs = async (params?: {
  page?: number;
  status?: "draft" | "pending" | "approved" | "rejected";
}) => {
  const res = await api.get<ApiResponse<Paginated<AgentBlog>>>("/agent/blogs", {
    params,
  });

  return res.data.data; // Paginated<AgentBlog>
};

// ---------- Get Single Agent Blog ----------
export const getAgentBlog = async (id: number) => {
  const res = await api.get<ApiResponse<AgentBlog>>(`/agent/blogs/${id}`);
  return res.data.data;
};

// ---------- Create Agent Blog ----------
export const createAgentBlog = async (payload: AgentBlogFormPayload) => {
  const form = new FormData();

  form.append("title", payload.title);
  form.append("content", payload.content);
  form.append("status", payload.status);

  if (payload.category_id) {
    form.append("category_id", String(payload.category_id));
  }

  if (payload.excerpt) {
    form.append("excerpt", payload.excerpt);
  }

  if (payload.meta_tags) {
    if (payload.meta_tags.title) {
      form.append("meta_tags[title]", payload.meta_tags.title);
    }
    if (payload.meta_tags.description) {
      form.append("meta_tags[description]", payload.meta_tags.description);
    }
    if (payload.meta_tags.keywords) {
      form.append("meta_tags[keywords]", payload.meta_tags.keywords);
    }
  }

  if (payload.image) {
    form.append("image", payload.image);
  }

  if (payload.featured_image) {
    form.append("featured_image", payload.featured_image);
  }

  const res = await api.post<ApiResponse<AgentBlog>>("/agent/blogs", form, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return res.data; // { success, message, data: AgentBlog }
};

// ---------- Update Agent Blog ----------
export const updateAgentBlog = async (
  id: number,
  payload: Partial<AgentBlogFormPayload>
) => {
  const form = new FormData();

  if (payload.title !== undefined) {
    form.append("title", payload.title);
  }

  if (payload.content !== undefined) {
    form.append("content", payload.content);
  }

  if (payload.status !== undefined) {
    form.append("status", payload.status);
  }

  if (payload.category_id !== undefined) {
    if (payload.category_id === null) {
      form.append("category_id", "");
    } else {
      form.append("category_id", String(payload.category_id));
    }
  }

  if (payload.excerpt !== undefined) {
    form.append("excerpt", payload.excerpt ?? "");
  }

  if (payload.meta_tags) {
    if (payload.meta_tags.title !== undefined) {
      form.append("meta_tags[title]", payload.meta_tags.title ?? "");
    }
    if (payload.meta_tags.description !== undefined) {
      form.append("meta_tags[description]", payload.meta_tags.description ?? "");
    }
    if (payload.meta_tags.keywords !== undefined) {
      form.append("meta_tags[keywords]", payload.meta_tags.keywords ?? "");
    }
  }

  if (payload.image instanceof File) {
    form.append("image", payload.image);
  }

  if (payload.featured_image instanceof File) {
    form.append("featured_image", payload.featured_image);
  }

  // Using POST with _method=PUT for Laravel
  const res = await api.post<ApiResponse<AgentBlog>>(
    `/agent/blogs/${id}?_method=PUT`,
    form,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return res.data;
};

// ---------- Delete Agent Blog ----------
export const deleteAgentBlog = async (id: number) => {
  const res = await api.delete<ApiResponse<null>>(`/agent/blogs/${id}`);
  return res.data;
};

// ---------- Get Categories ----------
export const getAgentBlogCategories = async () => {
  const res = await api.get<ApiResponse<BlogCategory[]>>(
    "/agent/blogs/categories"
  );
  return res.data.data;
};

// ---------- Get Statistics ----------
export const getAgentBlogStatistics = async () => {
  const res = await api.get<ApiResponse<AgentBlogStatistics>>(
    "/agent/blogs/statistics"
  );
  return res.data.data;
};

// ---------- Get Comments for Agent Blog ----------
export const getAgentBlogComments = async (blogId: number, page = 1) => {
  const res = await api.get<ApiResponse<Paginated<BlogComment>>>(
    `/agent/blogs/${blogId}/comments`,
    { params: { page } }
  );

  return res.data.data; // Paginated<BlogComment>
};