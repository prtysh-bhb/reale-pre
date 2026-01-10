/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "@/api/axios";

/**
 * Export users as Excel file
 * @param role - optional user role filter
 * @param isActive - optional status filter (1 = active, 0 = inactive)
 */
export const exportUsers = async (role?: string, isActive?: number) => {
  try {
    const params: Record<string, any> = {};
    if (role) params.role = role;
    if (isActive !== undefined) params.is_active = isActive;

    const response = await api.get("/admin/export-users", {
      params,
      responseType: "blob", 
    });

    // Create a URL and trigger download
    const blob = response.data as Blob;
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `users_export_${new Date().toISOString().slice(0, 19)}.xlsx`
    );
    document.body.appendChild(link);
    link.click();
    link.remove();

    return true;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
