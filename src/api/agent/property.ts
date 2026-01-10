/**
 * Agent Property API
 * API functions for agent property management
 */

import api from "@/api/axios";
import type { Property, PropertyFormData } from "@/types/property";
import type { ApiResponse, PaginatedResponse } from "@/types/api";
import { handleApiError } from "@/services/errorHandler";

interface PropertyDetailResponse {
  property: Property;
}

interface PropertyListResponse {
  properties: Property[];
  total: number;
  per_page: number;
  current_page: number;
  last_page: number;
}

interface CreatePropertyResponse {
  property: Property;
}

/**
 * Get all properties for the logged-in agent (paginated)
 */
export const getAgentProperties = async (
  page = 1
): Promise<PaginatedResponse<Property>> => {
  try {
    const response = await api.get<ApiResponse<PropertyListResponse>>(
      `/agent/properties`,
      { params: { page } }
    );
    
    return {
      data: response.data.data.properties,
      pagination: {
        total: response.data.data.total,
        per_page: response.data.data.per_page,
        current_page: response.data.data.current_page,
        last_page: response.data.data.last_page,
      },
    };
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Get specific property details by ID
 */
export const getPropertyById = async (id: number): Promise<Property> => {
  try {
    const response = await api.get<ApiResponse<PropertyDetailResponse>>(
      `/agent/properties/${id}`
    );
    return response.data.data.property;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Create new property (supports images & amenities)
 */
export const createProperty = async (
  data: FormData | PropertyFormData
): Promise<ApiResponse<CreatePropertyResponse>> => {
    let payload: FormData;

    if (data instanceof FormData) {
      payload = data;
    } else {
      payload = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach((item) => payload.append(`${key}[]`, item));
          } else {
            payload.append(key, String(value));
          }
        }
      });
    }

    const response = await api.post<ApiResponse<CreatePropertyResponse>>(
      `/agent/properties`,
      payload,
      { headers: { "Content-Type": "multipart/form-data" } }
    );

    return response.data;
};

/**
 * Update property by ID (also supports image re-upload)
 */
export const updateProperty = async (
  id: number,
  data: FormData | Partial<PropertyFormData>
): Promise<ApiResponse<CreatePropertyResponse>> => {
  try {
    let payload: FormData;

    if (data instanceof FormData) {
      payload = data;
    } else {
      payload = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach((item) => payload.append(`${key}[]`, item));
          } else {
            payload.append(key, String(value));
          }
        }
      });
    }

    const response = await api.post<ApiResponse<CreatePropertyResponse>>(
      `/agent/properties/${id}?_method=PUT`,
      payload,
      { headers: { "Content-Type": "multipart/form-data" } }
    );

    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Delete property
 */
export const deleteProperty = async (id: number): Promise<ApiResponse<null>> => {
  try {
    const response = await api.delete<ApiResponse<null>>(`/agent/properties/${id}`);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Delete property video
 */
export const deletePropertyVideo = async (id: number): Promise<ApiResponse<null>> => {
  try {
    const response = await api.delete<ApiResponse<null>>(`/agent/properties/${id}/video`);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const markAsFeatured = async (id: number) => {
  try {
    const response = await api.post(`/agent/properties/${id}/mark-featured`);
    return response.data; // expecting { success, message, data: { property, featured_remaining } }
  } catch (error) {
    throw handleApiError(error);
  }
};

// Remove featured status
export const removeFeatured = async (id: number) => {
  try {
    const response = await api.post(`/agent/properties/${id}/remove-featured`);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};
