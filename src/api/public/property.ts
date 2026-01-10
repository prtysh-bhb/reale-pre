/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "@/api/axios";
import { PropertyResponse } from "../customer/properties";

/**
 * @param id Property ID
 */
export const getSingleProperty = async (id: number | string) => {
  try {
    const response = await api.get<PropertyResponse>(`/properties/${id}`);
    return response.data;
  } catch (error: any) {
    console.error("Error fetching property details:", error);
    throw error;
  }
};
