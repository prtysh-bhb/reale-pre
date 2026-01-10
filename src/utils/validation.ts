/**
 * Validation Utilities
 * Centralized validation functions for forms and data
 */

import { VALIDATION_MESSAGES, FILE_UPLOAD, PROPERTY_TYPE } from "@/constants";
import type { PropertyFormData } from "@/types/property";
import type { LoginCredentials, RegisterData } from "@/types/auth";

export interface ValidationErrors {
  [key: string]: string;
}

/**
 * Validates property form data
 */
export const validatePropertyForm = (
  formData: PropertyFormData,
  images?: FileList | null
): ValidationErrors => {
  const errors: ValidationErrors = {};

  // Title validation
  if (!formData.title?.trim()) {
    errors.title = "Title is required";
  } else if (formData.title.length > 100) {
    errors.title = "Title should not exceed 100 characters";
  }

  // Description validation
  if (!formData.description?.trim()) {
    errors.description = "Description is required";
  } else if (formData.description.length < 20) {
    errors.description = "Description must be at least 20 characters";
  }

  // Price validation
  const priceNum = Number(formData.price);
  if (!formData.price || isNaN(priceNum) || priceNum < 0) {
    errors.price = "Valid price is required";
  } else if (priceNum > 999999999) {
    errors.price = "Price cannot exceed 999,999,999";
  }

  // Location validation
  if (!formData.location?.trim()) {
    errors.location = "Location is required";
  }

  if (!formData.address?.trim()) {
    errors.address = "Address is required";
  }

  if (!formData.city?.trim()) {
    errors.city = "City is required";
  }

  if (!formData.state?.trim()) {
    errors.state = "State is required";
  }

  if (!formData.zipcode?.trim()) {
    errors.zipcode = "Zipcode is required";
  }

  // Type validation
  if (!Object.values(PROPERTY_TYPE).includes(formData.type)) {
    errors.type = "Type must be either Sale or Rent";
  }

  if (!formData.property_type?.trim()) {
    errors.property_type = "Property type is required";
  }

  // Bedrooms validation
  const bedroomsNum = Number(formData.bedrooms);
  if (formData.bedrooms === "" || isNaN(bedroomsNum) || bedroomsNum < 0) {
    errors.bedrooms = "Valid number of bedrooms is required";
  }

  // Bathrooms validation
  const bathroomsNum = Number(formData.bathrooms);
  if (formData.bathrooms === "" || isNaN(bathroomsNum) || bathroomsNum < 0) {
    errors.bathrooms = "Valid number of bathrooms is required";
  }

  // Area validation
  const areaNum = Number(formData.area);
  if (formData.area === "" || isNaN(areaNum) || areaNum < 0) {
    errors.area = "Valid property area is required";
  }

  // Image validation
  if (images && images.length > 0) {
    for (const file of Array.from(images)) {
      if (file.size > FILE_UPLOAD.MAX_SIZE_BYTES) {
        errors.images = `"${file.name}" exceeds the 5MB size limit`;
        break;
      }
      if (!(FILE_UPLOAD.ALLOWED_IMAGE_TYPES as readonly string[]).includes(file.type)) {
        errors.images = `"${file.name}" is not a valid image type`;
        break;
      }
    }
  }

  return errors;
};

/**
 * Validates login credentials
 */
export const validateLoginForm = (data: LoginCredentials): ValidationErrors => {
  const errors: ValidationErrors = {};

  if (!data.email?.trim()) {
    errors.email = VALIDATION_MESSAGES.REQUIRED_FIELD;
  } else if (!isValidEmail(data.email)) {
    errors.email = VALIDATION_MESSAGES.INVALID_EMAIL;
  }

  if (!data.password) {
    errors.password = VALIDATION_MESSAGES.REQUIRED_FIELD;
  } else if (data.password.length < 6) {
    errors.password = VALIDATION_MESSAGES.PASSWORD_MIN_LENGTH;
  }

  return errors;
};

/**
 * Validates registration data
 */
export const validateRegisterForm = (data: RegisterData): ValidationErrors => {
  const errors: ValidationErrors = {};

  if (!data.name?.trim()) {
    errors.name = VALIDATION_MESSAGES.REQUIRED_FIELD;
  } else if (data.name.length < 2) {
    errors.name = "Name must be at least 2 characters";
  }

  if (!data.email?.trim()) {
    errors.email = VALIDATION_MESSAGES.REQUIRED_FIELD;
  } else if (!isValidEmail(data.email)) {
    errors.email = VALIDATION_MESSAGES.INVALID_EMAIL;
  }

  if (!data.password) {
    errors.password = VALIDATION_MESSAGES.REQUIRED_FIELD;
  } else if (data.password.length < 6) {
    errors.password = VALIDATION_MESSAGES.PASSWORD_MIN_LENGTH;
  }

  if (data.password !== data.password_confirmation) {
    errors.password_confirmation = VALIDATION_MESSAGES.PASSWORD_MISMATCH;
  }

  if (data.phone && !isValidPhone(data.phone)) {
    errors.phone = VALIDATION_MESSAGES.INVALID_PHONE;
  }

  return errors;
};

/**
 * Validates email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validates phone number format
 */
export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^[\d\s()+-]+$/;
  return phoneRegex.test(phone) && phone.replace(/\D/g, "").length >= 10;
};

/**
 * Validates image file
 */
export const validateImage = (
  file: File,
  maxSizeMB: number = FILE_UPLOAD.MAX_SIZE_MB
): { valid: boolean; error?: string } => {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  if (file.size > maxSizeBytes) {
    return {
      valid: false,
      error: `File size exceeds ${maxSizeMB}MB limit`,
    };
  }

  if (!(FILE_UPLOAD.ALLOWED_IMAGE_TYPES as readonly string[]).includes(file.type)) {
    return {
      valid: false,
      error: VALIDATION_MESSAGES.INVALID_FILE_TYPE,
    };
  }

  return { valid: true };
};

/**
 * Validates multiple images
 */
export const validateImages = (
  files: FileList,
  maxSizeMB: number = FILE_UPLOAD.MAX_SIZE_MB
): { valid: boolean; error?: string } => {
  for (const file of Array.from(files)) {
    const result = validateImage(file, maxSizeMB);
    if (!result.valid) {
      return result;
    }
  }
  return { valid: true };
};

/**
 * Checks if an object has validation errors
 */
export const hasErrors = (errors: ValidationErrors): boolean => {
  return Object.keys(errors).length > 0;
};

/**
 * Clears specific error from errors object
 */
export const clearError = (errors: ValidationErrors, field: string): ValidationErrors => {
  const newErrors = { ...errors };
  delete newErrors[field];
  return newErrors;
};
