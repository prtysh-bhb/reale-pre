/* eslint-disable @typescript-eslint/no-explicit-any */
// src/api/valuation.ts
import axios from "@/api/axios"; // adjust path if needed

export interface ValuationPayload {
  property_address: string;
  property_type: string;
  area: number;
  bedrooms: number;
  bathrooms: number;
  email: string;
}

export interface ValuationResult {
  property_address: string;
  estimated_value: number;
  min_value: number;
  max_value: number;
  valuation_date: string;
}

export interface ValuationResponse {
  success: boolean;
  message: string;
  data?: ValuationResult;
}

export const calculateValuation = async (
  payload: ValuationPayload
): Promise<ValuationResult> => {
  try {
    const res = await axios.post<ValuationResponse>("/property-valuation", payload);

    // Backend returned success = false
    if (!res.data.success) {
      throw new Error(res.data.message || "Valuation failed");
    }

    // Missing data (unexpected)
    if (!res.data.data) {
      throw new Error("No valuation data returned from server");
    }

    return res.data.data;
  } catch (err: any) {
    if (err.response && err.response.status === 422) {
      const e = new Error("Validation failed");
      (e as any).validation = err.response.data.errors;
      throw e;
    }

    if (err.response?.data?.message) {
      throw new Error(err.response.data.message);
    }

    throw new Error(err.message || "Failed to calculate valuation");
  }
};
