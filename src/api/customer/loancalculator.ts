/* eslint-disable @typescript-eslint/no-explicit-any */
// src/api/loan.ts
import axios from "@/api/axios"; // adjust if needed

export interface LoanCalculatorPayload {
  applicant_name: string;
  email: string;
  monthly_income: number;
  existing_emi?: number | null;
  loan_amount: number;
  interest_rate: number;
  tenure_years: number;
}

export interface LoanResult {
  applicant_name: string;
  loan_amount: number;
  monthly_emi: number;
  total_payable: number;
  total_interest: number;
  eligible: boolean;
  max_eligible_emi: number;
}

export interface LoanCalculatorResponse {
  success: boolean;
  message: string;
  data?: LoanResult;
}

export const calculateLoan = async (
  payload: LoanCalculatorPayload
): Promise<LoanResult> => {
  try {
    const res = await axios.post<LoanCalculatorResponse>("/loan-eligibility", payload);

    // Backend returned success = false
    if (!res.data.success) {
      throw new Error(res.data.message || "Loan calculation failed");
    }

    // Missing data (should not happen)
    if (!res.data.data) {
      throw new Error("Server returned no loan result");
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

    throw new Error(err.message || "Failed to calculate loan");
  }
};
