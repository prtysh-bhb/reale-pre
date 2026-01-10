import api from "@/api/axios";

// Upload single image
export const uploadSingleImage = async (propertyId: number, file: File, isPrimary = false) => {
  const formData = new FormData();
  formData.append("image", file);
  formData.append("is_primary", String(isPrimary));

  const response = await api.post(`/properties/${propertyId}/images/single`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

// Upload multiple images
export const uploadMultipleImages = async (propertyId: number, files: File[]) => {
  const formData = new FormData();
  files.forEach((file) => formData.append("images[]", file));

  const response = await api.post(`/properties/${propertyId}/images/multiple`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

// Fetch all property images
export const getPropertyImages = async (propertyId: number) => {
  const response = await api.get(`/properties/${propertyId}/images`);
  return response.data;
};

// Delete image
export const deletePropertyImage = async (propertyId: number, imageId: number) => {
  const response = await api.delete(`/properties/${propertyId}/images/${imageId}`);
  return response.data;
};

// Set primary image
export const setPrimaryImage = async (propertyId: number, imageId: number) => {
  const response = await api.put(`/properties/${propertyId}/images/${imageId}/primary`);
  return response.data;
};

// Reorder images
export const reorderPropertyImages = async (propertyId: number, imageIds: number[]) => {
  const response = await api.post(`/properties/${propertyId}/images/reorder`, {
    image_ids: imageIds,
  });
  return response.data;
};
