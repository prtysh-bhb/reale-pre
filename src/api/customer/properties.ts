/**
 * Customer Property API
 * API functions for customer property browsing and favorites
 */

import api from "@/api/axios";
import type {
  FilterState,
  Property,
  FavoriteProperty,
  InquiryFormData,
  PropertyAttributesData,
  PropertyAttribute,
  Inquiry,
} from "@/types/property";
import type { ApiResponse, } from "@/types/api";
import { handleApiError, getErrorMessage } from "@/services/errorHandler";

// Re-export types for backward compatibility
export type { PropertyFormData, InquiryFormData, PropertyAttribute } from "@/types/property";
export type Attributes = PropertyAttribute;

interface FavoritesResponseData {
  favorites: FavoriteProperty[];
  pagination: {
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
  };
}

interface PropertyListResponseData {
  data: Property[];
  property: Property;
  total: number;
  per_page: number;
  current_page: number;
  last_page: number;
}

interface InquiryResponseData {
  inquiry: Record<string, unknown>;
}

// Response types for API calls
export interface InquiriesResponse {
  success: boolean;
  message: string;
  data: {
    inquiries: Inquiry[];
    total?: number;
    per_page?: number;
    current_page?: number;
    last_page?: number;
  };
}

export interface InquiryResponse {
  success: boolean;
  message: string;
  data: {
    inquiry: Inquiry;
  };
}

export interface PropertyResponse {
  success: boolean;
  message: string;
  data: {
    property: Property;
  };
}

// Fetch favorite properties (with pagination)
export const getFavProperties = async (
  page = 1
): Promise<ApiResponse<FavoritesResponseData>> => {
  try {
    const response = await api.get<ApiResponse<FavoritesResponseData>>(
      "/customer/favorites",
      { params: { page } }
    );
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

// Add property to favorites
export const setFavProperties = async (
  id: number
): Promise<ApiResponse<FavoritesResponseData>> => {
  try {
    const response = await api.post<ApiResponse<FavoritesResponseData>>(
      `/customer/favorites/${id}`
    );
    return response.data;
  } catch (error) {
    const errorMessage = getErrorMessage(error);
    return {
      success: false,
      message: errorMessage || "Failed to update favorites. Please try again.",
      data: { favorites: [], pagination: { total: 0, per_page: 10, current_page: 1, last_page: 1 } },
    };
  }
};

// Remove property from favorites
export const removeFavProperties = async (
  id: number
): Promise<ApiResponse<FavoritesResponseData>> => {
  try {
    const response = await api.delete<ApiResponse<FavoritesResponseData>>(
      `/customer/favorites/${id}`
    );
    return response.data;
  } catch (error) {
    const errorMessage = getErrorMessage(error);
    return {
      success: false,
      message: errorMessage || "Failed to delete favorites. Please try again.",
      data: { favorites: [], pagination: { total: 0, per_page: 10, current_page: 1, last_page: 1 } },
    };
  }
};

// Get properties by filter (with pagination and search)
export const getPropertiesByFilter = async (
  page = 1,
  filters: FilterState
): Promise<ApiResponse<PropertyListResponseData>> => {
  try {
    const response = await api.get<ApiResponse<PropertyListResponseData>>(
      "/properties/search",
      { params: { page, ...filters } }
    );
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

// Get single property by ID
export const getProperty = async (id: number): Promise<ApiResponse<PropertyListResponseData>> => {
  try {
    const response = await api.get<ApiResponse<PropertyListResponseData>>(`/properties/${id}`);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

// Submit property inquiry
export const propertyInquiry = async (
  id: number,
  formData: InquiryFormData
): Promise<ApiResponse<InquiryResponseData>> => {
  try {
    const response = await api.post<ApiResponse<InquiryResponseData>>(
      `/customer/inquiries/${id}`,
      formData
    );
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

// Get property attributes (amenities, property types)
export const propertyAttributes = async (): Promise<
  ApiResponse<PropertyAttributesData>
> => {
  try {
    const response = await api.get<ApiResponse<PropertyAttributesData>>(
      "/properties/attributes"
    );
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};