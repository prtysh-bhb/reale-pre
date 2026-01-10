/* eslint-disable @typescript-eslint/no-explicit-any */
// SocialCallback.tsx
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext"; // optional
import { CheckCircle, XCircle, Loader2, Shield, UserCheck } from "lucide-react";

const SocialCallback: React.FC = () => {
  const navigate = useNavigate();
  const { fetchUserProfile } = useAuth?.() ?? {};
  const processedRef = useRef(false);
  const [status, setStatus] = useState<"processing" | "success" | "error">("processing");
  const [message, setMessage] = useState("Authenticating with social provider...");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Prevent double-processing in StrictMode/dev or multiple mounts
    if (processedRef.current) return;
    // Also check sessionStorage to persist across fast reloads
    if (sessionStorage.getItem("social_processed") === "1") {
      processedRef.current = true;
      return;
    }
    processedRef.current = true;
    sessionStorage.setItem("social_processed", "1");

    const simulateProgress = () => {
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(interval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);
      return interval;
    };

    const progressInterval = simulateProgress();

    (async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const token = params.get("token");
        const userB64 = params.get("user");
        const error = params.get("error");

        if (error) {
          setStatus("error");
          setMessage(`Login failed: ${error}`);
          setProgress(100);
          clearInterval(progressInterval);
          
          toast.error("Social login failed", {
            description: error,
          });
          
          setTimeout(() => {
            sessionStorage.removeItem("social_processed");
            navigate("/login", { replace: true });
          }, 2000);
          return;
        }

        if (!token) {
          setStatus("error");
          setMessage("No authentication token received");
          setProgress(100);
          clearInterval(progressInterval);
          
          toast.error("Authentication Error", {
            description: "Unable to retrieve authentication token. Please try again.",
          });
          
          setTimeout(() => {
            sessionStorage.removeItem("social_processed");
            navigate("/login", { replace: true });
          }, 2000);
          return;
        }

        // Parse user
        let user = null;
        try {
          if (userB64) {
            const jsonStr = atob(userB64);
            user = JSON.parse(jsonStr);
          }
        } catch (e) {
          console.warn("Failed parsing user param", e);
        }

        setMessage("Saving session data...");
        setProgress(40);

        // Save token + user
        localStorage.setItem("token", token);
        if (user) localStorage.setItem("user", JSON.stringify(user));
        const role = user?.role ?? "customer";
        localStorage.setItem("role", role);

        setMessage("Fetching user profile...");
        setProgress(70);

        if (typeof fetchUserProfile === "function") {
          try {
            await fetchUserProfile();
          } catch (e) {
            console.warn("fetchUserProfile failed", e);
          }
        }

        setStatus("success");
        setMessage("Login successful! Redirecting...");
        setProgress(100);
        clearInterval(progressInterval);
        
        toast.success("Welcome back!", {
          description: `Logged in as ${user?.name || user?.email || "User"}`,
          icon: <UserCheck className="h-5 w-5" />,
        });

        // Navigate after a short delay
        setTimeout(() => {
          sessionStorage.removeItem("social_processed");
          let redirectPath = "/";
          
          if (role === "admin" || role === "agent") {
            redirectPath = "/admin/dashboard";
          } else if (role === "customer") {
            redirectPath = "/dashboard";
          }
          
          navigate(redirectPath, { replace: true });
        }, 1500);

      } catch (err: any) {
        setStatus("error");
        setMessage("Unexpected error occurred");
        setProgress(100);
        clearInterval(progressInterval);
        
        console.error("Social callback error", err);
        toast.error("Authentication Failed", {
          description: "Something went wrong. Please try again.",
        });
        
        setTimeout(() => {
          sessionStorage.removeItem("social_processed");
          navigate("/login", { replace: true });
        }, 2000);
      }
    })();

    return () => {
      clearInterval(progressInterval);
    };
  }, [navigate, fetchUserProfile]);

  const StatusIcon = () => {
    switch (status) {
      case "processing":
        return <Loader2 className="h-12 w-12 text-blue-500 animate-spin" />;
      case "success":
        return <CheckCircle className="h-12 w-12 text-green-500" />;
      case "error":
        return <XCircle className="h-12 w-12 text-red-500" />;
      default:
        return <Shield className="h-12 w-12 text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6">
          <div className="flex items-center justify-center space-x-3">
            <Shield className="h-8 w-8 text-white" />
            <h1 className="text-2xl font-bold text-white">Authentication</h1>
          </div>
          <p className="text-blue-100 text-center mt-2 text-sm">
            Securely connecting your account
          </p>
        </div>

        {/* Content */}
        <div className="p-8">
          <div className="flex flex-col items-center text-center space-y-6">
            {/* Status Icon */}
            <div className="p-4 rounded-full bg-gray-50 border-4 border-gray-100">
              <StatusIcon />
            </div>

            {/* Status Text */}
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-gray-800">
                {status === "processing" && "Authenticating..."}
                {status === "success" && "Success!"}
                {status === "error" && "Error"}
              </h2>
              <p className="text-gray-600">{message}</p>
            </div>

            {/* Progress Bar */}
            <div className="w-full space-y-2">
              <div className="flex justify-between text-sm text-gray-500">
                <span>Progress</span>
                <span>{progress}%</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-300 ease-out ${
                    status === "error" ? "bg-red-500" : 
                    status === "success" ? "bg-green-500" : 
                    "bg-blue-500"
                  }`}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Status Details */}
            <div className="w-full space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Status</span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  status === "processing" ? "bg-blue-100 text-blue-800" :
                  status === "success" ? "bg-green-100 text-green-800" :
                  "bg-red-100 text-red-800"
                }`}>
                  {status.toUpperCase()}
                </span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Provider</span>
                <span className="text-sm font-medium text-gray-800">
                  {(() => {
                    const url = window.location.search;
                    if (url.includes('google')) return 'Google';
                    if (url.includes('facebook')) return 'Facebook';
                    if (url.includes('github')) return 'GitHub';
                    return 'Social';
                  })()}
                </span>
              </div>
            </div>

            {/* Loading Indicator */}
            {status === "processing" && (
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>This may take a few seconds...</span>
              </div>
            )}

            {/* Action Button for Errors */}
            {status === "error" && (
              <button
                onClick={() => {
                  sessionStorage.removeItem("social_processed");
                  navigate("/login", { replace: true });
                }}
                className="mt-4 px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-colors duration-200"
              >
                Return to Login
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 p-4 border-t border-gray-200">
          <p className="text-center text-xs text-gray-500">
            <span className="inline-flex items-center">
              <Shield className="h-3 w-3 mr-1" />
              Secured by encrypted connection
            </span>
          </p>
        </div>
      </div>

      {/* Background decoration */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-100 rounded-full blur-3xl opacity-30"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-100 rounded-full blur-3xl opacity-30"></div>
      </div>
    </div>
  );
};

export default SocialCallback;