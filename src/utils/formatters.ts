/**
 * Formatting Utilities
 * Functions for formatting dates, numbers, and other data
 */

/**
 * Format a date to readable format
 */
export const formatReadableDate = (dateInput: string | Date): string => {
  if (!dateInput) return "";
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return "";

  return date.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

/**
 * Format amount with currency formatting
 */
export const formatAmount = (amount: number | string): string => {
  const num = Number(amount);
  if (isNaN(num)) return "0";
  return num.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

/**
 * Format currency with symbol
 */
export const formatCurrency = (amount: number | string, currency = "$"): string => {
  const formatted = formatAmount(amount);
  return `${currency}${formatted}`;
};

/**
 * Format number to compact notation (1000 → 1K)
 */
export const formatCompactNumber = (num: number): string => {
  const formatter = new Intl.NumberFormat("en-US", {
    notation: "compact",
    compactDisplay: "short",
  });
  return formatter.format(num);
};

/**
 * Format phone number
 */
export const formatPhoneNumber = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length === 10) {
    return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, "($1) $2-$3");
  }
  return phone;
};
