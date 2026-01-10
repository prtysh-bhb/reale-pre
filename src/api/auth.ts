/**
 * Authentication API
 * API functions for user authentication and profile management
 */

import api from "./axios";
import type { User } from "@/types/user";
import type { ApiResponse } from "@/types/api";
import { handleApiError, getErrorMessage } from "@/services/errorHandler";

export interface RestrictedMailDomainsResponse {
  success: boolean;
  domains: string[];
};

export interface ProfileFormData {
  name: string;
  email: string;
  phone: string;
  bio: string;
  address: string;
  city: string;
  state: string;
  zipcode: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  requires_2fa?: boolean;
  email?: string;
  data?: {
    user: User;
    token: string;
  };
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
  };
}

export interface Verify2FAResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
  };
}

export interface TwoFactorSetupResponse {
  success: boolean;
  message?: string;
  data?: {
    secret?: string;
    qr_code_url?: string;
  };
}

export interface TwoFactorResponse {
  success: boolean;
  message?: string;
}

export interface ForgotPasswordResponse {
  success: boolean;
  message: string;
}

export interface ProfileResponse {
  success: boolean;
  message?: string;
  data: {
    user: User;
  };
}

/**
 * Login user
 */
export const login = async (email: string, password: string): Promise<LoginResponse> => {
  try {
    const response = await api.post<LoginResponse>("/login", { email, password });
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Verify two-factor authentication code during login
 */
export const verifyTwoFactorLogin = async (
  email: string,
  code: string
): Promise<Verify2FAResponse> => {
  try {
    const response = await api.post<Verify2FAResponse>("/verify-login", { email, code });
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Register new user
 */
export const register = async (
  name: string,
  email: string,
  password: string,
  role: string
): Promise<RegisterResponse> => {
  try {
    const response = await api.post<RegisterResponse>("/register", {
      name,
      email,
      password,
      password_confirmation: password,
      role,
    });
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Request password reset
 */
export const forgotPassword = async (email: string): Promise<ForgotPasswordResponse> => {
  try {
    const response = await api.post<ForgotPasswordResponse>("/password/email", { email });
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Get current authenticated user
 */
export const getCurrentUser = async (): Promise<ApiResponse<User>> => {
  try {
    const response = await api.get<ApiResponse<User>>("/user");
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Get user profile
 */
export const getProfile = async (): Promise<ProfileResponse> => {
  try {
    const response = await api.get<ProfileResponse>("/profile");
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Update user profile
 */
export const updateProfile = async (formData: ProfileFormData): Promise<ProfileResponse> => {
  try {
    const response = await api.put<ProfileResponse>("/profile", formData);
    return response.data;
  } catch (error) {
    const errorMessage = getErrorMessage(error);
    return {
      success: false,
      message: errorMessage || "Failed to update profile. Please try again.",
      data: {
        user: {} as User
      },
    };
  }
};

/**
 * Update user avatar
 */
export const updateAvatar = async (avatar: File): Promise<ProfileResponse> => {
  try {
    const formData = new FormData();
    formData.append("avatar", avatar);

    const response = await api.post<ProfileResponse>("/profile/avatar", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    const errorMessage = getErrorMessage(error);
    return {
      success: false,
      message: errorMessage || "Failed to update avatar. Please try again.",
      data: {
        user: {} as User
      },
    };
  }
};

/**
 * Logout user
 */
export const logout = async (): Promise<ApiResponse<null>> => {
  try {
    const response = await api.post<ApiResponse<null>>("/logout");
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/* ---------------------- 2FA SETUP ---------------------- */

// Request new QR code for 2FA setup
export const requestTwoFactorNewCode = async (): Promise<TwoFactorSetupResponse> => {
  try {
    const response = await api.post<TwoFactorSetupResponse>("/2fa/setup");
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

// Enable two-factor authentication
export const enableTwoFactor = async (code: string): Promise<TwoFactorResponse> => {
  try {
    const response = await api.post<TwoFactorResponse>("/2fa/enable", { code });
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

// Disable two-factor authentication
export const disableTwoFactor = async (code: string): Promise<TwoFactorResponse> => {
  try {
    const response = await api.post<TwoFactorResponse>("/2fa/disable", { code });
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

// Verify 2FA code during login
export const verifyTwoFactor = async (code: string): Promise<TwoFactorResponse> => {
  try {
    const response = await api.post<TwoFactorResponse>("/2fa/verify", { code });
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

// Get restricted mail domains
export const getRestrictedMailDomains = async () => {
  const res = await api.get<RestrictedMailDomainsResponse>("/restricted-mail-domains");
  return res.data;
};



