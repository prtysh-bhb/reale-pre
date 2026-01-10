/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import OtpInput from "@/components/otp/OtpInput";
import { requestTwoFactorNewCode, enableTwoFactor } from "@/api/auth";
import { QRCodeSVG } from "qrcode.react";
import { useNavigate } from "react-router-dom";

interface SetupPayload {
  success?: boolean;
  message?: string;
  data?: {
    secret?: string;
    qr_code_url?: string;
  };
}

const TwoFactorSetupPage = () => {
  const nav = useNavigate();
  const [loading, setLoading] = useState(false);
  const [qr, setQr] = useState<SetupPayload | null>(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");

  const loadNewQr = async () => {
    setLoading(true);
    setError("");
    setMsg("");
    try {
      const res = await requestTwoFactorNewCode();
      setQr(res);
      if (res.success) {
        setMsg("Scan the QR in your authenticator app, then enter the 6-digit code.");
      } else {
        setError(res.message || "Failed to generate QR code.");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to get a new code");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNewQr();
  }, []);

  const handleEnable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) return;

    setLoading(true);
    setError("");
    setMsg("");

    try {
      const res = await enableTwoFactor(code);
      if (res.success) {
        setMsg("✅ Two-factor authentication enabled successfully!");
        setTimeout(() => nav("/admin/dashboard"), 1000);
      } else {
        setError(res.message || "Invalid code, please try again.");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to enable 2FA");
    } finally {
      setLoading(false);
    }
  };

  const renderQr = () => {
    const qrUrl = qr?.data?.qr_code_url;
    if (!qrUrl) return <p className="text-sm text-gray-500">Loading QR...</p>;

    return (
      <QRCodeSVG
        value={qrUrl}
        size={190}
        includeMargin
        className="rounded bg-white p-2 shadow"
      />
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white w-[520px] rounded-2xl border shadow p-8">
        <h1 className="text-2xl font-semibold text-center text-blue-700">
          Set up Two-Factor Authentication
        </h1>
        <p className="text-sm text-gray-600 text-center mt-2">
          Scan the QR code with Google/Microsoft Authenticator, then confirm with a 6-digit code.
        </p>

        {error && <p className="mt-4 text-center text-red-600 bg-red-50 p-2 rounded">{error}</p>}
        {msg && <p className="mt-4 text-center text-green-700 bg-green-50 p-2 rounded">{msg}</p>}

        <div className="mt-6 flex flex-col items-center gap-4">
          {renderQr()}
          <Button variant="outline" onClick={loadNewQr} className="mt-2" disabled={loading}>
            {loading ? "Generating..." : "Generate New QR"}
          </Button>
        </div>

        <form onSubmit={handleEnable} className="mt-6 space-y-6">
          <OtpInput value={code} onChange={setCode} />
          <Button
            type="submit"
            className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white"
            disabled={loading || code.length !== 6}
          >
            {loading ? "Enabling..." : "Enable 2FA"}
          </Button>

          <p className="text-xs text-center text-gray-500">
            Lost access? Store your recovery codes safely (if your backend provides them).
          </p>
        </form>
      </div>
    </div>
  );
};

export default TwoFactorSetupPage;
