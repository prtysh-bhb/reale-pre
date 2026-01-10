/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import OtpInput from "@/components/otp/OtpInput";
import { verifyTwoFactorLogin } from "@/api/auth";

const TwoFactorPage = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const user_email = state?.email as string | undefined;

  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user_email) {
      setError("Missing user mail. Please login again.");
      return;
    }
    setLoading(true); setError("");
    try {
      const res = await verifyTwoFactorLogin(user_email, code);
      if (res.success) {
        const { user, token } = res.data;
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        navigate(user.role === "admin" || user.role === "agent" ? "/admin/dashboard" : "/");
      } else {
        setError("Invalid code, please try again.");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white w-[420px] rounded-2xl border shadow p-8">
        <h1 className="text-2xl font-semibold text-center text-blue-700">Two-Factor Verification</h1>
        <p className="text-sm text-gray-600 text-center mt-2">
          Enter the 6-digit code from your authenticator app.
        </p>

        {error && <p className="mt-4 text-center text-red-600 bg-red-50 p-2 rounded">{error}</p>}

        <form onSubmit={handleVerify} className="mt-6 space-y-6">
          <OtpInput value={code} onChange={setCode} />
          <Button
            type="submit"
            className="w-full h-11 bg-blue-600 hover:bg-blue-700"
            disabled={loading || code.length !== 6}
          >
            {loading ? "Verifying..." : "Verify & Continue"}
          </Button>

          <p className="text-xs text-center text-gray-500">
            Tip: You can use Google Authenticator, 1Password, Microsoft Authenticator, etc.
          </p>
        </form>
      </div>
    </div>
  );
};
export default TwoFactorPage;
