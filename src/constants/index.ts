/**
 * Application Constants
 * Centralized constants for the real estate application
 */

export const APP_NAME = import.meta.env.VITE_APP_NAME;

export const USER_ROLES = {
  ADMIN: "admin",
  AGENT: "agent",
  CUSTOMER: "customer",
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

export const PROPERTY_STATUS = {
  DRAFT: "draft",
  PUBLISHED: "published",
  SOLD: "sold",
  RENTED: "rented",
} as const;

export type PropertyStatus = (typeof PROPERTY_STATUS)[keyof typeof PROPERTY_STATUS];

export const PROPERTY_TYPE = {
  SALE: "sale",
  RENT: "rent",
} as const;

export type PropertyType = (typeof PROPERTY_TYPE)[keyof typeof PROPERTY_TYPE];

export const PROPERTY_CATEGORIES = {
  RESIDENTIAL: "residential",
  COMMERCIAL: "commercial",
  LAND: "land",
  APARTMENT: "apartment",
  VILLA: "villa",
  OFFICE: "office",
  SHOP: "shop",
} as const;

export type PropertyCategory = (typeof PROPERTY_CATEGORIES)[keyof typeof PROPERTY_CATEGORIES];

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    LOGOUT: "/auth/logout",
    FORGOT_PASSWORD: "/auth/forgot-password",
    RESET_PASSWORD: "/auth/reset-password",
    VERIFY_OTP: "/auth/verify-otp",
    RESEND_OTP: "/auth/resend-otp",
  },
  ADMIN: {
    DASHBOARD: "/admin/dashboard",
    AGENTS: "/admin/agents",
    CUSTOMERS: "/admin/customers",
    PROPERTIES: "/admin/properties",
  },
  AGENT: {
    PROFILE: "/agent/profile",
    PROPERTIES: "/agent/properties",
  },
  CUSTOMER: {
    PROFILE: "/customer/profile",
    PROPERTIES: "/customer/properties",
    FAVORITES: "/customer/favorites",
  },
  PUBLIC: {
    PROPERTIES: "/properties",
  },
} as const;

export const VALIDATION_MESSAGES = {
  REQUIRED_FIELD: "This field is required",
  INVALID_EMAIL: "Please enter a valid email address",
  PASSWORD_MIN_LENGTH: "Password must be at least 6 characters",
  PASSWORD_MISMATCH: "Passwords do not match",
  INVALID_PHONE: "Please enter a valid phone number",
  INVALID_NUMBER: "Please enter a valid number",
  FILE_TOO_LARGE: "File size is too large",
  INVALID_FILE_TYPE: "Invalid file type",
} as const;

export const FILE_UPLOAD = {
  MAX_SIZE_MB: 5,
  MAX_SIZE_BYTES: 5 * 1024 * 1024,
  ALLOWED_IMAGE_TYPES: ["image/jpeg", "image/jpg", "image/png", "image/webp"],
  ALLOWED_DOCUMENT_TYPES: ["application/pdf", "application/msword"],
} as const;

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
} as const;

export const LOCAL_STORAGE_KEYS = {
  AUTH_TOKEN: "token",
  USER_DATA: "user",
  THEME: "theme",
} as const;

export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  FORGOT_PASSWORD: "/forgot-password",
  RESET_PASSWORD: "/reset-password",
  ADMIN: {
    DASHBOARD: "/admin/dashboard",
    AGENTS: "/admin/agents",
    CUSTOMERS: "/admin/customers",
    PROPERTIES: "/admin/properties",
  },
  AGENT: {
    DASHBOARD: "/dashboard",
    PROFILE: "/agents/profile",
    PROPERTIES: "/agents/properties",
  },
  CUSTOMER: {
    DASHBOARD: "/customer/dashboard",
    PROFILE: "/customer/profile",
    PROPERTIES: "/customer/properties",
  },
} as const;
