/**
 * LoginPage Component
 * Professional login page with premium UI/UX
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, Mail, Lock, ArrowRight, Building2, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router";
import { login } from "@/api/auth";
import { toast } from "sonner";
import google from "/assets/Google.svg";
import apple from "/assets/apple.svg";
import facebook from "/assets/Facebook.svg";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";
import { APP_NAME } from "@/constants";
import { handleKeyPress } from "@/helpers/customer_helper";

const LoginPage = () => {
  const { fetchUserProfile } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const data = await login(email, password);

      if (data.success && data.requires_2fa) {
        toast.info("Two-factor authentication required");
        navigate("/two-factor", { state: { email: data.email } });
        return;
      }

      if (data.success && data.data?.token) {
        const user = data.data.user;
        const token = data.data.token;

        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        fetchUserProfile();

        const role = user.role || "agent";
        localStorage.setItem("role", role);

        toast.success("Login successful!");

        if (role === "admin" || role === "agent" || role === "customer") {
          navigate("/admin/dashboard");
        } else {
          navigate("/");
        }
      } else {
        toast.error(data.message || "Invalid credentials");
        setError(data.message || "Invalid credentials");
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || "Invalid credentials";
      toast.error(msg);
      setError(msg);
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
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500 rounded-full blur-3xl animate-pulse"
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
                Welcome Back!
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-blue-100 text-lg mb-12 max-w-md"
              >
                Sign in to access your account and discover amazing properties
              </motion.p>

              {/* Features */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="space-y-4 text-left max-w-md"
              >
                {[
                  'Browse thousands of verified properties',
                  'Save your favorite listings',
                  'Connect with trusted agents',
                  'Track your property inquiries',
                ].map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-emerald-300" />
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
                className="text-blue-200 text-sm mt-16"
              >
                © 2025 {APP_NAME}. All rights reserved.
              </motion.p>
            </div>
          </div>

          {/* Right Section - Login Form */}
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

              {/* Header */}
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  Sign In
                </h2>
                <p className="text-gray-600">
                  Enter your credentials to access your account
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleLogin} className="space-y-6">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-red-50 border-2 border-red-200 rounded-2xl"
                  >
                    <p className="text-sm text-red-700 font-medium">{error}</p>
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
                      onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => handleKeyPress(e, /[a-zA-Z0-9@._-]/, false)}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      maxLength={70}
                      className="pl-12 h-14 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-3">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock
                      size={20}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      maxLength={50}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="pl-12 pr-12 h-14 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                    </button>
                  </div>
                </div>

                {/* Remember me & Forgot password */}
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      id="remember"
                      className="w-5 h-5 rounded-lg border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                    <span className="text-sm text-gray-700 font-medium">
                      Remember me
                    </span>
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>

                {/* Sign In Button */}
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-14 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold rounded-2xl shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2 cursor-pointer"
                >
                  {loading ? (
                    "Signing in..."
                  ) : (
                    <>
                      Sign In
                      <ArrowRight size={20} />
                    </>
                  )}
                </Button>

                {/* Divider */}
                <div className="relative my-8">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-gray-500 font-medium">
                      Or continue with
                    </span>
                  </div>
                </div>

                {/* Social Buttons */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { icon: google, name: 'Google', provider: 'google' },
                    { icon: facebook, name: 'Facebook', provider: 'facebook' },
                    { icon: apple, name: 'Apple', provider: 'apple' },
                  ].map((social) => (
                    <button
                      key={social.provider}
                      type="button"
                      onClick={() =>
                        (window.location.href = `${
                          import.meta.env.VITE_API_URL
                        }/auth/${social.provider}`)
                      }
                      className="flex cursor-pointer items-center justify-center p-4 border-2 border-gray-200 rounded-2xl hover:bg-gray-50 hover:border-gray-300 transition-all transform hover:scale-105"
                    >
                      <img src={social.icon} alt={social.name} className="w-6 h-6" />
                    </button>
                  ))}
                </div>

                {/* Signup Link */}
                <p className="text-center text-gray-600 mt-8">
                  Don't have an account?{" "}
                  <Link
                    to="/register"
                    className="text-blue-600 hover:text-blue-700 font-bold transition-colors"
                  >
                    Sign Up
                  </Link>
                </p>
              </form>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
