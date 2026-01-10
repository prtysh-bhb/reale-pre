/**
 * User Types
 * User-related type definitions
 */

import { USER_ROLES, type UserRole } from "@/constants";

export interface User {
  id: number;
  name: string;
  email: string;
  address?: string;
  city?: string;
  state?: string;
  zipcode?: string;
  bio?: string;
  role: UserRole;
  phone?: string;
  avatar_url?: string | null;
  is_active?: boolean;
  two_factor_enabled?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Agent extends User {
  role: typeof USER_ROLES.AGENT;
  license_number?: string;
  bio?: string;
  properties_count?: number;
}

export interface Customer extends User {
  role: typeof USER_ROLES.CUSTOMER;
  preferences?: string[];
}

export interface Admin extends User {
  role: typeof USER_ROLES.ADMIN;
  permissions?: string[];
}

export interface UserProfile extends User {
  total_properties?: number;
  total_inquiries?: number;
  total_favorites?: number;
}

export interface UpdateProfileData {
  name?: string;
  email?: string;
  phone?: string;
  avatar?: File | null;
  bio?: string;
  license_number?: string;
}
