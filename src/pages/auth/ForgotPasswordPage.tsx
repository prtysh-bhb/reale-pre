/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { forgotPassword } from "@/api/auth";
import { Link } from "react-router";
import { toast } from "sonner";
import { Mail, ArrowRight, Building2, Sparkles, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { APP_NAME } from "@/constants";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const res = await forgotPassword(email);

      toast.success(res.message || "Password reset link sent to your email.");
      setMessage(res.message || "Password reset link sent to your email.");
    } catch (err: any) {      
      const errorMsg = err.message || "Failed to send reset link.";
      toast.error(errorMsg);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-500 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}
        />
      </div>

      {/* Main Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-6xl bg-white rounded-3xl shadow-2xl overflow-hidden"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2">
          {/* Left Section - Branding */}
          <div className="hidden lg:flex flex-col justify-center items-center bg-gradient-to-br from-blue-600 via-blue-700 to-emerald-600 p-12 text-white relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage:
                    'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
                  backgroundSize: '40px 40px',
                }}
              />
            </div>

            <div className="relative z-10 text-center">
              {/* Logo */}
              <Link to="/" className="inline-block mb-8">
                <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm px-6 py-4 rounded-2xl border border-white/20">
                  <Building2 className="w-10 h-10 text-white" />
                  <span className="text-3xl font-bold">{APP_NAME}</span>
                </div>
              </Link>

              {/* Headline */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-4xl font-bold mb-4"
              >
                Reset Your Password
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-purple-100 text-lg mb-12 max-w-md"
              >
                We'll send you a secure link to reset your password and get you back on track
              </motion.p>

              {/* Security Features */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="space-y-4 text-left max-w-md"
              >
                {[
                  'Secure password reset process',
                  'Instant email delivery',
                  'One-time use reset link',
                  '24/7 account security monitoring',
                ].map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-green-300" />
                    </div>
                    <span className="text-white/90">{feature}</span>
                  </div>
                ))}
              </motion.div>

              {/* Footer */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-purple-200 text-sm mt-16"
              >
                © {new Date().getFullYear()} {APP_NAME}. All rights reserved.
              </motion.p>
            </div>
          </div>

          {/* Right Section - Forgot Password Form */}
          <div className="p-8 sm:p-12 lg:p-16">
            <div className="max-w-md mx-auto">
              {/* Mobile Logo */}
              <div className="lg:hidden text-center mb-8">
                <Link to="/" className="inline-block">
                  <div className="flex items-center gap-3 justify-center">
                    <Building2 className="w-8 h-8 text-blue-600" />
                    <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent">
                      {APP_NAME}
                    </span>
                  </div>
                </Link>
              </div>

              {/* Back Button */}
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-blue-600 font-medium mb-8 group transition-colors"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                Back to Login
              </Link>

              {/* Header */}
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  Forgot Password?
                </h2>
                <p className="text-gray-600">
                  Enter your email address and we'll send you a reset link
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-red-50 border-2 border-red-200 rounded-2xl"
                  >
                    <p className="text-sm text-red-700 font-medium">{error}</p>
                  </motion.div>
                )}

                {message && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-emerald-50 border-2 border-emerald-200 rounded-2xl"
                  >
                    <p className="text-sm text-emerald-700 font-medium">{message}</p>
                    <p className="text-xs text-emerald-600 mt-2">
                      Check your inbox and follow the instructions in the email.
                    </p>
                  </motion.div>
                )}

                {/* Email */}
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-3">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail
                      size={20}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      maxLength={70}
                      className="pl-12 h-14 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={loading || !!message}
                  className="w-full h-14 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold rounded-2xl shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                >
                  {loading ? (
                    "Sending Reset Link..."
                  ) : message ? (
                    "Check Your Email"
                  ) : (
                    <>
                      Send Reset Link
                      <ArrowRight size={20} />
                    </>
                  )}
                </Button>

                {/* Security Notice */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="p-4 bg-blue-50 border-2 border-blue-200 rounded-2xl"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Sparkles className="w-3 h-3 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-blue-900">
                        Security Notice
                      </p>
                      <p className="text-xs text-blue-700 mt-1">
                        For your security, the reset link will expire in 1 hour and can only be used once.
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* Support Link */}
                <div className="text-center pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600">
                    Need help?{" "}
                    <Link
                      to="/contact"
                      className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
                    >
                      Contact Support
                    </Link>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPasswordPage;