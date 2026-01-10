/**
 * File Utilities
 * Functions for file handling and validation
 */

import { toast } from "sonner";
import { FILE_UPLOAD } from "@/constants";

/**
 * Get file size in MB
 */
export const getFileSizeInMB = (bytes: number, decimals = 2): string => {
  if (!bytes) return "0 MB";
  const mb = bytes / (1024 * 1024);
  return `${mb.toFixed(decimals)} MB`;
};

/**
 * Get file size in KB
 */
export const getFileSizeInKB = (bytes: number, decimals = 2): string => {
  if (!bytes) return "0 KB";
  const kb = bytes / 1024;
  return `${kb.toFixed(decimals)} KB`;
};

/**
 * Get document type from URL
 */
export const getDocumentTypeFromUrl = (
  url: string
): "pdf" | "image" | "word" | "excel" | "other" => {
  const lowerUrl = url.toLowerCase();

  if (lowerUrl.endsWith(".pdf")) return "pdf";
  if (/\.(jpg|jpeg|png|gif|webp|svg)$/.test(lowerUrl)) return "image";
  if (/\.(doc|docx)$/.test(lowerUrl)) return "word";
  if (/\.(xls|xlsx)$/.test(lowerUrl)) return "excel";

  return "other";
};

/**
 * Validate image file with toast notification
 * @deprecated Use validateImage from validation.ts instead
 */
export const validateImageWithToast = (
  e: React.ChangeEvent<HTMLInputElement>,
  size: number
): File[] | null => {
  const files = e.target.files;
  if (!files || files.length === 0) return null;

  const validFiles = Array.from(files).filter((file) => {
    if (file.size > size * 1024 * 1024) {
      toast.error(`"${file.name}" exceeds ${size}MB limit.`);
      return false;
    }
    return true;
  });

  return validFiles.length > 0 ? validFiles : null;
};

/**
 * Convert File to base64 string
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

/**
 * Download file from URL
 */
export const downloadFile = (url: string, filename: string): void => {
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Get file extension from filename
 */
export const getFileExtension = (filename: string): string => {
  const parts = filename.split(".");
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : "";
};

/**
 * Check if file is an image
 */
export const isImageFile = (file: File): boolean => {
  return (FILE_UPLOAD.ALLOWED_IMAGE_TYPES as readonly string[]).includes(file.type);
};
