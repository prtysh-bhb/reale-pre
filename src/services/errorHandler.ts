/**
 * Error Handling Service
 * Centralized error handling for API calls and application errors
 */

import type { ApiError, ErrorResponse } from "@/types/api";
import { logger } from "./logger";

/**
 * Custom API Error class
 */
export class ApiException extends Error {
  constructor(
    public message: string,
    public code?: number,
    public errors?: Record<string, string[]>
  ) {
    super(message);
    this.name = "ApiException";
  }
}

/**
 * Axios error interface
 */
interface AxiosError<T = unknown> extends Error {
  config?: {
    url?: string;
    method?: string;
  };
  code?: string;
  request?: unknown;
  response?: {
    data: T;
    status: number;
    statusText: string;
    headers: unknown;
  };
  isAxiosError: boolean;
  toJSON: () => object;
}

/**
 * Checks if error is an Axios error
 */
export const isAxiosError = (error: unknown): error is AxiosError => {
  return (error as AxiosError).isAxiosError === true;
};

/**
 * Handles API errors and returns a standardized error response
 */
export const handleApiError = (error: unknown): ErrorResponse => {
  // Handle Axios errors
  if (isAxiosError(error)) {
    const status = error.response?.status;
    const data = error.response?.data as ApiError | undefined;

    // Log the error
    logger.error("API Error", {
      status,
      message: data?.message || error.message,
      url: error.config?.url,
    });

    // Handle specific status codes
    if (status === 401) {
      return {
        success: false,
        message: "Your session has expired. Please login again.",
      };
    }

    if (status === 403) {
      return {
        success: false,
        message: "You don't have permission to perform this action.",
      };
    }

    if (status === 404) {
      return {
        success: false,
        message: "The requested resource was not found.",
      };
    }

    if (status === 422) {
      return {
        success: false,
        message: data?.message || "Validation failed. Please check your input.",
        errors: data?.errors,
      };
    }

    if (status === 500) {
      return {
        success: false,
        message: "An internal server error occurred. Please try again later.",
      };
    }

    // Return the error from the API if available
    if (data?.message) {
      return {
        success: false,
        message: data.message,
        errors: data.errors,
      };
    }

    // Network error
    if (error.message === "Network Error") {
      return {
        success: false,
        message: "Unable to connect to the server. Please check your internet connection.",
      };
    }

    // Generic error
    return {
      success: false,
      message: error.message || "An unexpected error occurred.",
    };
  }

  // Handle custom API exceptions
  if (error instanceof ApiException) {
    logger.error("API Exception", {
      message: error.message,
      code: error.code,
    });

    return {
      success: false,
      message: error.message,
      errors: error.errors,
    };
  }

  // Handle generic errors
  if (error instanceof Error) {
    logger.error("Error", { message: error.message });

    return {
      success: false,
      message: error.message || "An unexpected error occurred.",
    };
  }

  // Unknown error type
  logger.error("Unknown Error", { error });

  return {
    success: false,
    message: "An unexpected error occurred. Please try again.",
  };
};

/**
 * Extracts error message from various error types
 */
export const getErrorMessage = (error: unknown): string => {
  const errorResponse = handleApiError(error);
  return errorResponse.message;
};

/**
 * Checks if the error is a validation error (422)
 */
export const isValidationError = (error: unknown): boolean => {
  if (isAxiosError(error)) {
    return error.response?.status === 422;
  }
  return false;
};

/**
 * Gets validation errors from API error
 */
export const getValidationErrors = (
  error: unknown
): Record<string, string[]> | undefined => {
  if (isAxiosError(error)) {
    const data = error.response?.data as ApiError | undefined;
    return data?.errors;
  }
  return undefined;
};
