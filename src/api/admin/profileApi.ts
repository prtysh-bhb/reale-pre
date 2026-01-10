/* eslint-disable @typescript-eslint/no-explicit-any */
// src/api/profileApi.ts
import api  from "@/api/axios";

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  avatar: string | null;
  avatar_url: string | null;
  bio: string | null;
  company_name: string | null;
  license_number: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zipcode: string | null;
  email_verified_at: string | null;
  last_login_at: string | null;
  created_at: string;
  two_factor_enabled?: boolean | null;
}

interface ProfileResponse{
  success: boolean;
  data: {
    user: User;
  };
}

/** Get current user profile */
export const getProfile = () => api.get<ProfileResponse>("/profile");

/** Update user profile */
export const updateProfile = (data: any) => api.put("/profile", data);

/** Change password (requires confirmed field in form) */
export const changePassword = (data: {
  current_password: string;
  new_password: string;
  new_password_confirmation: string;
}) => api.put("/profile/password", data);

/** Upload avatar */
export const uploadAvatar = (formData: FormData) =>
  api.post("/profile/avatar", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

/** Delete avatar */
export const deleteAvatar = () => api.delete("/profile/avatar");

/** Delete account */
export const deleteAccount = (data: { password: string; confirmation: string }) =>
  api.request({ method: "delete", url: "/profile/account", data });

export const generateTwoFactorSetup = () =>
  api.post<{ success: boolean; data?: { secret?: string; qr_code_url?: string } }>(
    "/2fa/generate"
  );

/** Enable two-factor by validating a one-time code */
export const enableTwoFactor = (code: string) =>
  api.post<{ success: boolean; data?: { user?: User }; message?: string }>(
    "/2fa/enable",
    { code }
  );

/** Disable two-factor for user */
export const disableTwoFactor = () =>
  api.post<{ success: boolean; data?: { user?: User }; message?: string }>(
    "/2fa/disable"
  );