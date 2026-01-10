export const formatReadableDate = (
  dateInput: string | Date,
  isTimeVisible: boolean = false
): string => {
  if (!dateInput) return "";

  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return "";

  const formattedDate = date.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  if (!isTimeVisible) return formattedDate;

  const formattedTime = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  return `${formattedDate} • ${formattedTime}`;
};

export const formatAmount = (amount: number | string): string => {
  const num = Number(amount);
  if (isNaN(num)) return "0";
  return '$'+num.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

export const getFileSizeInMB = (bytes: number, decimals: number = 2): string => {
  if (!bytes) return "0 MB";
  const mb = bytes / (1024 * 1024);
  return `${mb.toFixed(decimals)} MB`;
};

export const getDocumentTypeFromUrl = (url: string): "pdf" | "image" | "word" | "excel" | "other" => {
  const lowerUrl = url.toLowerCase();

  if (lowerUrl.endsWith(".pdf")) return "pdf";
  if (/\.(jpg|jpeg|png|gif|webp|svg)$/.test(lowerUrl)) return "image";
  if (/\.(doc|docx)$/.test(lowerUrl)) return "word";
  if (/\.(xls|xlsx)$/.test(lowerUrl)) return "excel";

  return "other";
};

export function formatTime(datetime: string): string {
  const date = new Date(datetime);

  let hours = date.getHours();
  const minutes = date.getMinutes();

  const ampm = hours >= 12 ? "PM" : "AM";

  hours = hours % 12;
  hours = hours ? hours : 12; // 0 → 12

  const minutesStr = minutes < 10 ? `0${minutes}` : minutes;

  return `${hours}:${minutesStr} ${ampm}`;
}
export const handleKeyPress = (
  e: React.KeyboardEvent<HTMLInputElement> | React.KeyboardEvent<HTMLTextAreaElement>,
  allowedPattern: RegExp,
  allowLeadingSpace: boolean = false
) => {
  const allowedKeys = ["Enter", "Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab"];
  const value = (e.target as HTMLInputElement).value;

  // Block characters not matching pattern
  if (!allowedPattern.test(e.key) && !allowedKeys.includes(e.key)) {
    e.preventDefault();
    return;
  }

  // Block leading space if not allowed
  if (!allowLeadingSpace && e.key === " " && value.length === 0) {
    e.preventDefault();
  }
};

export const convertUTCToLocalInput = (utcString: string): string => {
  if (!utcString) return "";

  const date = new Date(utcString);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
};