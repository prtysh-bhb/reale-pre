import { toast } from "sonner";
import api from "./axios";
import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

export const ApiInterceptor = () => {
  const navigate = useNavigate();
  const hasShownToast = useRef(false); // prevents duplicate toasts

  useEffect(() => {
    const interceptor = api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.config?.url === "/login" && error.config?.method === "post") {
          return Promise.reject(error);
        }
        
        if (error.response?.status === 401) {
          if (!hasShownToast.current) {
            hasShownToast.current = true;
            toast.error("Session expired. Please log in again.");

            setTimeout(() => {
              localStorage.clear();
              navigate("/");
              setTimeout(() => {
                hasShownToast.current = false;
              }, 2000);
            }, 1000);
          }
        }

        return Promise.reject(error);
      }
    );

    return () => api.interceptors.response.eject(interceptor);
  }, [navigate]);

  return null;
};