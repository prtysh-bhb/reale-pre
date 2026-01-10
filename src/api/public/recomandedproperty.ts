import api from "@/api/axios";
import type { Property } from "@/types/property";
import type { ApiResponse } from "@/types/api";

interface PropertiesResponseData {
  message: string | undefined;
  properties: Property[];
}

export const getProperties = async (): Promise<ApiResponse<PropertiesResponseData>> => {
  const response = await api.get<ApiResponse<PropertiesResponseData>>("/properties");
  return response.data; // Laravel returns { success, message, data }
};
