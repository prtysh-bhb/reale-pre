import { toast } from "sonner";

export const validateImage = (
  e: React.ChangeEvent<HTMLInputElement>,
  size: number
): File[] | null => {
  const files = e.target.files;
  if (!files || files.length === 0) return null; // ✅ Handle null safely

  const validFiles = Array.from(files).filter((file) => {
    if (file.size > size * 1024 * 1024) {
      toast.error(`"${file.name}" exceeds ${size}MB limit.`);
      return false;
    }
    return true;
  });

  return validFiles.length > 0 ? validFiles : null;
};