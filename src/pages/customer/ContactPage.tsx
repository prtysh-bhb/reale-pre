/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Contact Page Component (connected to backend)
 * Professional contact page with form and information
 */

import { motion } from "framer-motion";
import {
  Mail,
  Phone,
  MapPin,
  Send,
  Facebook,
  Linkedin,
  Twitter,
  Instagram,
  Youtube,
  Clock,
  MessageSquare,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { useState } from "react";
import { submitContactForm, ContactFormPayload } from "@/api/customer/contactform";
import { toast } from "sonner";

type FormErrors = Partial<Record<keyof ContactFormPayload, string>>;

const ContactPage = () => {
  const [formData, setFormData] = useState<ContactFormPayload>({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    // clear field error on change
    setErrors((prev) => ({ ...prev, [e.target.name as keyof ContactFormPayload]: undefined }));
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    // basic email regex
    else if (!/^\S+@\S+\.\S+$/.test(formData.email)) newErrors.email = "Enter a valid email";
    if (!formData.subject.trim()) newErrors.subject = "Please select a subject";
    if (!formData.message.trim()) newErrors.message = "Message cannot be empty";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!validate()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    setSubmitting(true);
    try {
      const payload: ContactFormPayload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone?.trim() || undefined,
        subject: formData.subject,
        message: formData.message.trim(),
      };

      const res = await submitContactForm(payload);
      if (res?.success) {
        toast.success(res.message || "Message sent successfully!");
        setFormData({
          name: "",
          email: "",
          phone: "",
          subject: "",
          message: "",
        });
        setErrors({});
      } else {
        toast.error(res?.message || "Failed to send message");
      }
    } catch (err: any) {
      // Handle validation errors from Laravel (422) or other errors
      const serverMessage = err?.message;
      // If you returned validation errors as thrown Error in client, parse them:
      if (err?.response?.status === 422 && err?.response?.data?.errors) {
        const fieldErrors: FormErrors = {};
        const validation = err.response.data.errors;
        Object.keys(validation).forEach((key) => {
          fieldErrors[key as keyof ContactFormPayload] = validation[key][0];
        });
        setErrors(fieldErrors);
        toast.error("Please fix the highlighted errors");
      } else if (serverMessage) {
        toast.error(serverMessage);
      } else {
        toast.error("Something went wrong. Please try again later.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500 rounded-full blur-3xl animate-pulse" />
          <div
            className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-500 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: "1s" }}
          />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-8 py-16 md:py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full mb-6">
              <MessageSquare className="w-4 h-4 text-emerald-400" />
              <span className="text-sm text-white font-semibold">Get In Touch</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
              Contact{" "}
              <span className="bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
                Our Team
              </span>
            </h1>

            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as
              possible.
            </p>
          </motion.div>
        </div>

        {/* Bottom Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg className="w-full h-12" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path
              d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"
              className="fill-gray-50"
            ></path>
          </svg>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Information */}
          <div className="lg:col-span-1 space-y-6">
            {/* Contact Cards */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
                  <Phone className="w-5 h-5 text-white" />
                </div>
                Contact Info
              </h2>

              <div className="space-y-4">
                {/* Phone */}
                <motion.a
                  whileHover={{ x: 4 }}
                  href="tel:918853217658"
                  className="flex items-start gap-4 p-4 rounded-2xl bg-gray-50 hover:bg-blue-50 border-2 border-transparent hover:border-blue-100 transition-all group"
                >
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl group-hover:scale-110 transition-transform">
                    <Phone size={20} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 mb-1 font-medium">Phone Number</p>
                    <p className="text-gray-900 font-bold">+91 88532 17658</p>
                    <p className="text-xs text-gray-600 mt-1">Mon-Fri, 9AM-6PM IST</p>
                  </div>
                </motion.a>

                {/* Email */}
                <motion.a
                  whileHover={{ x: 4 }}
                  href="mailto:contact@brainerhub.com"
                  className="flex items-start gap-4 p-4 rounded-2xl bg-gray-50 hover:bg-emerald-50 border-2 border-transparent hover:border-emerald-100 transition-all group"
                >
                  <div className="p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl group-hover:scale-110 transition-transform">
                    <Mail size={20} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 mb-1 font-medium">Email Address</p>
                    <p className="text-gray-900 font-bold">contact@bhub.com</p>
                    <p className="text-xs text-gray-600 mt-1">24/7 Email Support</p>
                  </div>
                </motion.a>

                {/* Address */}
                <motion.a
                  whileHover={{ x: 4 }}
                  href="https://maps.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-4 p-4 rounded-2xl bg-gray-50 hover:bg-blue-50 border-2 border-transparent hover:border-blue-100 transition-all group"
                >
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl group-hover:scale-110 transition-transform">
                    <MapPin size={20} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 mb-1 font-medium">Office Address</p>
                    <p className="text-gray-900 font-bold leading-relaxed">
                      D101 T-Sq Thaltej Ahmedabad, Gujarat, India
                    </p>
                  </div>
                </motion.a>

                {/* Working Hours */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-emerald-50 border-2 border-blue-100">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-white rounded-xl shadow-md">
                      <Clock size={20} className="text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-600 mb-2 font-medium">Working Hours</p>
                      <div className="space-y-1 text-sm">
                        <p className="flex justify-between text-gray-900 font-semibold">
                          <span>Mon - Fri:</span>
                          <span>9:00 AM - 6:00 PM</span>
                        </p>
                        <p className="flex justify-between text-gray-900 font-semibold">
                          <span>Saturday:</span>
                          <span>10:00 AM - 4:00 PM</span>
                        </p>
                        <p className="flex justify-between text-gray-700">
                          <span>Sunday:</span>
                          <span>Closed</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Social Media */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-600" />
                Follow Us
              </h3>
              <p className="text-gray-600 mb-6 text-sm">Stay connected on social media for updates and news</p>
              <div className="grid grid-cols-5 gap-3">
                {[
                  { Icon: Facebook, color: "from-blue-600 to-blue-700", href: "#" },
                  { Icon: Linkedin, color: "from-blue-500 to-blue-600", href: "#" },
                  { Icon: Twitter, color: "from-sky-500 to-sky-600", href: "#" },
                  { Icon: Instagram, color: "from-pink-500 to-purple-600", href: "#" },
                  { Icon: Youtube, color: "from-red-500 to-red-600", href: "#" },
                ].map(({ Icon, color, href }, i) => (
                  <motion.a
                    key={i}
                    whileHover={{ y: -4, scale: 1.1 }}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`aspect-square flex items-center justify-center bg-gradient-to-br ${color} rounded-2xl shadow-lg hover:shadow-xl transition-all group`}
                  >
                    <Icon size={20} className="text-white" />
                  </motion.a>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8"
            >
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-3 flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
                    <Send className="w-6 h-6 text-white" />
                  </div>
                  Send Us a Message
                </h2>
                <p className="text-gray-600">Fill out the form below and our team will get back to you within 24 hours.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                {/* Name and Email Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-3">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder="John Doe"
                      className={`w-full px-4 py-3.5 bg-gray-50 border-2 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
                        errors.name ? "border-red-400 focus:ring-red-300" : "border-gray-200 focus:ring-blue-500"
                      }`}
                    />
                    {errors.name && <p className="text-xs text-red-600 mt-2">{errors.name}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-3">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="john@example.com"
                      className={`w-full px-4 py-3.5 bg-gray-50 border-2 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
                        errors.email ? "border-red-400 focus:ring-red-300" : "border-gray-200 focus:ring-blue-500"
                      }`}
                    />
                    {errors.email && <p className="text-xs text-red-600 mt-2">{errors.email}</p>}
                  </div>
                </div>

                {/* Phone and Subject Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-3">Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone || ""}
                      onChange={handleChange}
                      placeholder="+1 (555) 000-0000"
                      className="w-full px-4 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                    {errors.phone && <p className="text-xs text-red-600 mt-2">{errors.phone}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-3">
                      Subject <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className={`w-full px-4 py-3.5 bg-gray-50 border-2 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:border-transparent transition-all cursor-pointer font-medium ${
                        errors.subject ? "border-red-400 focus:ring-red-300" : "border-gray-200 focus:ring-blue-500"
                      }`}
                    >
                      <option value="">Select a subject</option>
                      <option value="general">General Inquiry</option>
                      <option value="property">Property Information</option>
                      <option value="support">Customer Support</option>
                      <option value="partnership">Partnership Opportunity</option>
                      <option value="other">Other</option>
                    </select>
                    {errors.subject && <p className="text-xs text-red-600 mt-2">{errors.subject}</p>}
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-3">
                    Your Message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    placeholder="Tell us how we can help you..."
                    className={`w-full px-4 py-3.5 bg-gray-50 border-2 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all resize-none ${
                      errors.message ? "border-red-400 focus:ring-red-300" : "border-gray-200 focus:ring-blue-500"
                    }`}
                  />
                  {errors.message && <p className="text-xs text-red-600 mt-2">{errors.message}</p>}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-4 rounded-2xl font-bold shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 transition-all flex items-center justify-center gap-3 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                      </svg>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Send Message
                    </>
                  )}
                </button>

                {/* Info Message */}
                <div className="flex items-start gap-3 p-4 bg-blue-50 border-2 border-blue-100 rounded-2xl">
                  <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-gray-700">
                    <span className="font-bold text-blue-600">Quick Response:</span> Our team typically responds within 24 hours during business days.
                  </p>
                </div>
              </form>
            </motion.div>
          </div>
        </div>

        {/* Map Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-12 bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden"
        >
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              Find Us On Map
            </h2>
            <p className="text-gray-600 mt-2">Visit our office or schedule an appointment</p>
          </div>
          <div className="relative h-96 bg-gradient-to-br from-gray-100 to-gray-200">
            {/* Placeholder for Map */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 font-semibold text-lg">D101 T-Sq Thaltej Ahmedabad, Gujarat, India</p>
                <p className="text-gray-500 text-sm mt-2">Map integration will be added soon</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ContactPage;
