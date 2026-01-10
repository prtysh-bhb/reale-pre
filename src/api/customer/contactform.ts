/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "@/api/axios"; 

export interface ContactFormPayload {
  name: string;
  email: string;
  phone?: string | null;
  subject: string;
  message: string;
}

export interface ContactFormResponse {
  success: boolean;
  message: string;
}

/**
 * Submit contact form
 */
export const submitContactForm = async (
  payload: ContactFormPayload
): Promise<ContactFormResponse> => {
  try {
    const response = await axios.post<ContactFormResponse>(
      "/contact-form",
      payload
    );

    return response.data;
  } catch (error: any) {
    if (error.response?.status === 422) {
      const validationErrors = error.response.data.errors;
      const firstError =
        validationErrors[Object.keys(validationErrors)[0]][0];
      throw new Error(firstError || "Validation error");
    }

    throw new Error(
      error.response?.data?.message || "Failed to submit contact form"
    );
  }
};
