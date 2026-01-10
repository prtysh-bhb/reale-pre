/**
 * SignupPage Component
 * Professional registration page with premium UI/UX
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { getRestrictedMailDomains, register } from "@/api/auth";
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Building2, CheckCircle2 } from "lucide-react";
import { Link } from "react-router";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { APP_NAME } from "@/constants";
import { handleKeyPress } from "@/helpers/customer_helper";

const SignupPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("customer");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [restrictedDomains, setRestrictedDomains] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const navigate = useNavigate();

  const getRestrictedDomains = async () => {
    const res = await getRestrictedMailDomains();
    setRestrictedDomains(res.domains);
  };

  useEffect(() => {
    getRestrictedDomains();
  }, []);

  const isRestrictedEmail = (email: string): boolean => {
    const domain = email.split("@")[1]?.toLowerCase();
    return restrictedDomains.map((d) => d.toLowerCase()).includes(domain);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Reset field error state
    setFieldErrors({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    });

    let hasError = false;
    const newErrors: any = {};

    if (!name.trim()) {
      newErrors.name = "Full name is required.";
      hasError = true;
    }

    if (name.length > 50) {
      newErrors.name = "Full name can't exceed 50 characters.";
      hasError = true;
    }

    if (!email.trim()) {
      newErrors.email = "Email is required.";
      hasError = true;
    }

    if (email.length > 70) {
      newErrors.email = "Email can't exceed 70 characters.";
      hasError = true;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      newErrors.email = "Enter a valid email address.";
      hasError = true;
    }

    const [localPart] = email.split("@");

    // Username rule: If 8+ characters AND contains no alphabet
    if (!/[a-zA-Z]/.test(localPart)) {
      newErrors.email =
        "Email username must contain at least one alphabetical character (a–z).";
      hasError = true;
    }

    if (isRestrictedEmail(email)) {
      newErrors.email = "This email domain is not allowed!";
      hasError = true;
    }

    if (!password.trim()) {
      newErrors.password = "Password is required.";
      hasError = true;
    }

    if (password.length > 50) {
      newErrors.password = "Password can't exceed 50 characters.";
      hasError = true;
    }

    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = "Confirm your password.";
      hasError = true;
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
      toast.error("Passwords do not match");
      hasError = true;
    }

    if (hasError) {
      setFieldErrors(newErrors);
      setLoading(false);
      return;
    }

    try {
      const data = await register(name, email, password, role);

      if (data.success) {
        const userObj = data.data?.user ?? null;
        const token = data.data?.token ?? null;
        if (token) localStorage.setItem("token", token);
        if (userObj) localStorage.setItem("user", JSON.stringify(userObj));

        toast.success("Account created successfully! 🎉");

        // prefer server-provided role, fallback to form role
        const assignedRole = (userObj?.role ?? role ?? "").toString().toLowerCase();

        if (assignedRole === "admin") {
          navigate("/admin/dashboard");
        } else if (assignedRole === "agent") {
          navigate("/agent/dashboard");
        } else {
          // default -> customer profile
          navigate("/profile");
        }
      } else {
        toast.error("Registration failed");
        setError("Registration failed");
      }
    } catch (err: any) {
      const msg = err?.message || "Error during registration";
      toast.error(msg);
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        />
        <div
          className="absolute top-1/2 right-1/3 w-96 h-96 bg-purple-500 rounded-full blur-3xl animate-pulse"
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
          <div className="hidden lg:flex flex-col justify-center items-center bg-gradient-to-br from-emerald-600 via-emerald-700 to-blue-600 p-12 text-white relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
                  backgroundSize: "40px 40px",
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
                Join {APP_NAME} Today!
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-emerald-100 text-lg mb-12 max-w-md"
              >
                Create your account and start your journey to finding the perfect property
              </motion.p>

              {/* Benefits */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="space-y-4 text-left max-w-md"
              >
                {[
                  "Free account with no hidden fees",
                  "Access to exclusive property listings",
                  "Personalized property recommendations",
                  "Direct communication with agents",
                  "Save and compare favorite properties",
                ].map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                    </div>
                    <span className="text-white/90">{benefit}</span>
                  </div>
                ))}
              </motion.div>

              {/* Footer */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-emerald-200 text-sm mt-16"
              >
                © 2025 {APP_NAME}. All rights reserved.
              </motion.p>
            </div>
          </div>

          {/* Right Section - Signup Form */}
          <div className="p-8 sm:p-12 lg:p-16">
            <div className="max-w-md mx-auto">
              {/* Mobile Logo */}
              <div className="lg:hidden text-center mb-8">
                <Link to="/" className="inline-block">
                  <div className="flex items-center gap-3 justify-center">
                    <Building2 className="w-8 h-8 text-emerald-600" />
                    <span className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
                      {APP_NAME}
                    </span>
                  </div>
                </Link>
              </div>

              {/* Header */}
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h2>
                <p className="text-gray-600">Fill in your details to get started</p>
              </div>

              {/* Form */}
              <form onSubmit={handleSignup} className="space-y-5" noValidate>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-red-50 border-2 border-red-200 rounded-2xl"
                  >
                    <p className="text-sm text-red-700 font-medium">{error}</p>
                  </motion.div>
                )}

                {/* Full Name */}
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-3">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User
                      size={20}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <Input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your name"
                      maxLength={50}
                      onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) =>
                        handleKeyPress(e, /[a-zA-Z ]/, false)
                      }
                      required
                      className={`pl-12 h-14 bg-gray-50 border-2 ${
                        fieldErrors.name ? "border-red-300" : "border-gray-200"
                      } rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all`}
                    />
                  </div>
                  {fieldErrors.name && (
                    <p className="text-xs text-red-600 mt-2 font-medium">{fieldErrors.name}</p>
                  )}
                </div>

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
                      value={email}
                      onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) =>
                        handleKeyPress(e, /[a-z0-9@._-]/, false)
                      }
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      maxLength={70}
                      required
                      className={`pl-12 h-14 bg-gray-50 border-2 ${
                        fieldErrors.email ? "border-red-300" : "border-gray-200"
                      } rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all`}
                    />
                  </div>
                  {fieldErrors.email && (
                    <p className="text-xs text-red-600 mt-2 font-medium">{fieldErrors.email}</p>
                  )}
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
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      maxLength={50}
                      className={`pl-12 pr-12 h-14 bg-gray-50 border-2 ${
                        fieldErrors.password ? "border-red-300" : "border-gray-200"
                      } rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                    </button>
                  </div>
                  {fieldErrors.password && (
                    <p className="text-xs text-red-600 mt-2 font-medium">{fieldErrors.password}</p>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-3">
                    Confirm Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock
                      size={20}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={confirmPassword}
                      maxLength={50}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className={`pl-12 pr-12 h-14 bg-gray-50 border-2 ${
                        fieldErrors.confirmPassword ? "border-red-300" : "border-gray-200"
                      } rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      {showConfirmPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                    </button>
                  </div>
                  {fieldErrors.confirmPassword && (
                    <p className="text-xs text-red-600 mt-2 font-medium">
                      {fieldErrors.confirmPassword}
                    </p>
                  )}
                </div>

                {/* Role Selection */}
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-3">
                    I am a <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { value: "customer", label: "Customer", desc: "Looking for properties" },
                      { value: "agent", label: "Agent", desc: "Selling properties" },
                    ].map((option) => (
                      <label
                        key={option.value}
                        className={`relative flex items-start p-4 border-2 rounded-2xl cursor-pointer transition-all ${
                          role === option.value
                            ? "border-emerald-600 bg-emerald-50"
                            : "border-gray-200 hover:border-emerald-300 hover:bg-gray-50"
                        }`}
                      >
                        <input
                          type="radio"
                          name="role"
                          value={option.value}
                          checked={role === option.value}
                          onChange={(e) => setRole(e.target.value)}
                          className="sr-only"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <div
                              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                role === option.value
                                  ? "border-emerald-600 bg-emerald-600"
                                  : "border-gray-300"
                              }`}
                            >
                              {role === option.value && (
                                <div className="w-2 h-2 bg-white rounded-full" />
                              )}
                            </div>
                            <span className="font-bold text-gray-900">{option.label}</span>
                          </div>
                          <p className="text-xs text-gray-600 ml-7">{option.desc}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Sign Up Button */}
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-14 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-bold rounded-2xl shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2 cursor-pointer"
                >
                  {loading ? (
                    "Creating Account..."
                  ) : (
                    <>
                      Create Account
                      <ArrowRight size={20} />
                    </>
                  )}
                </Button>

                {/* Terms */}
                <p className="text-xs text-center text-gray-600 mt-4">
                  By signing up, you agree to our{" "}
                  <Link to="#" className="text-emerald-600 hover:text-emerald-700 font-medium">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link to="#" className="text-emerald-600 hover:text-emerald-700 font-medium">
                    Privacy Policy
                  </Link>
                </p>

                {/* Login Link */}
                <p className="text-center text-gray-600 mt-6">
                  Already have an account?{" "}
                  <Link
                    to="/login"
                    className="text-emerald-600 hover:text-emerald-700 font-bold transition-colors cursor-pointer"
                  >
                    Sign In
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

export default SignupPage;
