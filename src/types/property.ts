/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Property Types
 * Property-related type definitions
 */

import type { PropertyStatus, PropertyType, PropertyCategory } from "@/constants";
import type { Agent } from "./user";
import { Customer } from "./appointment";

export interface DocumentFile {
  name: string;
  url: string;
  size: number;
}

// Agent info attached to property

// Access flags based on credits
export interface PropertyAccessFlags {
  is_images_accessible: boolean;
  is_video_accessible: boolean;
  is_documents_accessible: boolean;
  is_agent_contact_accessible: boolean;
  is_virtual_tour_accessible: boolean;
}

// Credit costs for unlocking features
export interface PropertyCreditCosts {
  images: number;
  video: number;
  documents: number;
  agent_contact: number;
  virtual_tour: number;
}

// Main Property interface
export interface Property {
  id: number;
  agent_id: number;
  title: string;
  description: string;
  price: string; // string because backend returns decimal as string
  location: string;
  address: string;
  city: string;
  state: string;
  zipcode: string;
  type: "sale" | "rent";
  property_type: string;
  bedrooms: number;
  bathrooms: number;
  area: string; // decimal string
  amenities: string[];

  ai_metadata: Record<string, any> | null;
  ai_metadata_generated_at: string | null;
  search_text: string | null;

  images: string[] | null;
  primary_image: string | null;
  video: string | null;
  documents: string[] | null;

  status: PropertyStatus;
  approval_status: "pending" | "approved" | "rejected";

  is_featured: boolean;
  featured_until: string | null;
  rejection_reason: string | null;

  approved_at: string | null;
  approved_by: number | null;

  created_at: string;
  updated_at: string;

  is_favorite: boolean;

  primary_image_url: string | null;
  image_urls: string[] | null;
  document_urls: DocumentFile[];
  video_url: string | null;

  property_type_label: string;

  agent: Agent;
  rating_stat: rating_stat;

  access_flags: PropertyAccessFlags;
  credit_costs: PropertyCreditCosts;

  views_count: number;
}

export interface rating_stat{
  overall_rating: number;
  avg_construction: number;
  avg_amenities: number;
  avg_management: number;
  avg_connectivity: number;
  avg_green_area: number;
  avg_locality: number;
  id: number;
  property_id: number;
}

export interface PropertyFormData {
  title: string;
  description: string;
  price: string | number;
  location: string;
  address: string;
  city: string;
  state: string;
  zipcode: string;
  type: PropertyType;
  property_type: PropertyCategory | string;
  bedrooms: string | number;
  bathrooms: string | number;
  area: string | number;
  status: PropertyStatus;
  amenities: string[];
}

export interface FilterState {
  keyword: string;
  location: string;
  state: string;
  city: string;
  property_type: string;
  min_price: string;
  max_price: string;
  bedrooms: string;
  bathrooms: string;
  min_area: string;
  max_area: string;
  type: string;
  amenities: string[];
  sortBy: string;
  sort_by: string;
  sort_order: string;
}

export interface FavoriteProperty {
  id: number;
  user_id: number;
  property_id: number;
  created_at: string;
  updated_at: string;
  property: Property;
}

export interface PropertyAttribute {
  key: string;
  label: string;
}

export interface PropertyAttributesData {
  amenities: PropertyAttribute[];
  property_types: PropertyAttribute[];
}

export interface InquiryFormData {
  name: string;
  email: string;
  phone: string;
  message: string;
}

export interface Inquiry {
  id: number;
  property_id: number;
  user_id?: number;
  name: string;
  email: string;
  phone: string;
  message: string;
  status: "pending" | "contacted" | "closed";
  created_at: string;
  updated_at: string;
  property?: Property;
  customer: Customer;
}

export interface Documents {
  success: boolean;
  message: string;
  data: {
    documents: DocumentFile[];
  };
}
