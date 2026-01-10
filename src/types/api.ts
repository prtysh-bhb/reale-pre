/**
 * Common API Types
 * Shared types for API requests and responses
 */

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data: T;
}

export interface ApiError {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}

export interface PaginationMeta {
  total: number;
  per_page: number;
  current_page: number;
  last_page: number;
  from?: number;
  to?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}

export interface PaginatedApiResponse<T> extends ApiResponse<PaginatedResponse<T>> {
  success: boolean;
  message?: string;
  data: PaginatedResponse<T>;
}

export interface ErrorResponse {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}

export type ApiResult<T> = ApiResponse<T> | ErrorResponse;
