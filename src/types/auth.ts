/**
 * Authentication Types
 * Auth-related type definitions
 */

import type { User } from "./user";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  role: "agent" | "customer";
  phone?: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  data: {
    user: User;
    token: string;
  };
}

export interface VerifyLogin2FAResponse {
  success: boolean;
  message?: string;
  data: {
    user: User;
    token: string;
  };
}

export interface Generate2FAResponse {
  success: boolean;
  qr_image_base64?: string;
  otpauth_url?: string;
  message?: string;
}

export interface Enable2FAResponse {
  success: boolean;
  message?: string;
  backup_codes?: string[];
}

export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  token: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export interface VerifyOTPData {
  email: string;
  otp: string;
}

export interface OTPResponse {
  success: boolean;
  message?: string;
  data?: {
    verified: boolean;
  };
}

