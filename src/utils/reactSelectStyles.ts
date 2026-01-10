/* eslint-disable @typescript-eslint/no-explicit-any */
export const customStyles = {
  control: (base: any, state: any) => {
    const isDark = document.documentElement.classList.contains("dark");

    return {
      ...base,
      backgroundColor: isDark ? "#1f2937" : "#f9fafb",
      border: "2px solid",
      borderColor: state.isFocused
        ? isDark
          ? "#3b82f6"
          : "#3b82f6"
        : isDark
        ? "#4b5563"
        : "#e5e7eb",
      borderRadius: "12px",
      padding: "8px 4px",
      boxShadow: state.isFocused
        ? "0 0 0 2px rgba(59, 130, 246, 0.2)"
        : "none",
      "&:hover": {
        borderColor: state.isFocused
          ? "#3b82f6"
          : isDark
          ? "#6b7280"
          : "#d1d5db",
      },
      transition: "all 0.2s",
      color: isDark ? "#f3f4f6" : "#111827",
    };
  },

  menu: (base: any) => {
    const isDark = document.documentElement.classList.contains("dark");

    return {
      ...base,
      backgroundColor: isDark ? "#1f2937" : "white",
      borderRadius: "12px",
      border: isDark ? "2px solid #4b5563" : "2px solid #e5e7eb",
      boxShadow: isDark
        ? "0 10px 25px rgba(255, 255, 255, 0.05)"
        : "0 10px 25px rgba(0, 0, 0, 0.1)",
      zIndex: 9999,
    };
  },

  menuList: (base: any) => ({
    ...base,
    borderRadius: "10px",
    padding: "8px",
  }),

  option: (base: any, state: any) => {
    const isDark = document.documentElement.classList.contains("dark");

    return {
      ...base,
      backgroundColor: state.isSelected
        ? "#3b82f6"
        : state.isFocused
        ? isDark
          ? "#374151"
          : "#eff6ff"
        : isDark
        ? "#1f2937"
        : "white",
      color: state.isSelected
        ? "white"
        : isDark
        ? "#e5e7eb"
        : "#374151",
      borderRadius: "8px",
      padding: "12px 16px",
      margin: "4px 0",
      fontSize: "14px",
      fontWeight: state.isSelected ? "600" : "400",
      "&:active": {
        backgroundColor: "#3b82f6",
        color: "white",
      },
    };
  },

  singleValue: (base: any) => {
    const isDark = document.documentElement.classList.contains("dark");

    return {
      ...base,
      color: isDark ? "#f3f4f6" : "#111827",
      fontSize: "14px",
      fontWeight: "500",
    };
  },

  placeholder: (base: any) => {
    const isDark = document.documentElement.classList.contains("dark");

    return {
      ...base,
      color: isDark ? "#9ca3af" : "#9ca3af",
      fontSize: "14px",
    };
  },

  input: (base: any) => {
    const isDark = document.documentElement.classList.contains("dark");

    return {
      ...base,
      color: isDark ? "#f3f4f6" : "#111827",
      fontSize: "14px",
    };
  },

  dropdownIndicator: (base: any, state: any) => {
    const isDark = document.documentElement.classList.contains("dark");

    return {
      ...base,
      color: state.isFocused
        ? "#3b82f6"
        : isDark
        ? "#9ca3af"
        : "#9ca3af",
      "&:hover": {
        color: "#3b82f6",
      },
      transition: "color 0.2s",
    };
  },

  clearIndicator: (base: any) => {
    const isDark = document.documentElement.classList.contains("dark");

    return {
      ...base,
      color: isDark ? "#9ca3af" : "#9ca3af",
      "&:hover": {
        color: isDark ? "#f87171" : "#ef4444",
      },
    };
  },

  indicatorSeparator: (base: any) => {
    const isDark = document.documentElement.classList.contains("dark");

    return {
      ...base,
      backgroundColor: isDark ? "#4b5563" : "#e5e7eb",
    };
  },
};
