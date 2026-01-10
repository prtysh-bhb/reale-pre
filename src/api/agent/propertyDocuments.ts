import api from "@/api/axios";
import { Documents } from "@/types/property";

export const getPropertyDocuments = (propertyId: number) =>
  api.get<Documents>(`/agent/properties/${propertyId}/documents`);

export const uploadPropertyDocuments = (propertyId: number, files: File[]) => {
  const formData = new FormData();
  files.forEach((file) => formData.append("documents[]", file));
  return api.post(`/agent/properties/${propertyId}/documents`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const deletePropertyDocument = (propertyId: number, index: number) =>
  api.request({
    method: 'DELETE',
    url: `/agent/properties/${propertyId}/documents`,
    data: { index }
  });
