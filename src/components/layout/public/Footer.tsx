/**
 * Footer Component
 * Premium professional footer with modern design
 */

import {
  Facebook,
  Linkedin,
  Instagram,
  Twitter,
  Youtube,
  Mail,
  MapPin,
  Phone,
  Send,
  Building2,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { APP_NAME } from "@/constants";
import { useEffect, useState } from "react";
import { getFooterPages } from "@/api/admin/pages";
import { getSiteMeta } from "@/api/public/general";
import { FooterPage } from "@/types/page";
import { SiteMeta, SiteMetaResponse } from "@/types/general";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [footerPages, setFooterPages] = useState<FooterPage[]>([]);
  const [siteMeta, setSiteMeta] = useState<SiteMetaResponse>();

  useEffect(() => {
    loadSiteMeta();
    loadFooterPages();
  }, []);

  const loadFooterPages = async () => {
    try {
      const pages = await getFooterPages();
      setFooterPages(pages);
    } catch (error) {
      console.error("Failed to load footer pages:", error);
    }
  };

  const loadSiteMeta = async () => {
    try {
      const info = await getSiteMeta();
      setSiteMeta(info)
    } catch (error) {
      console.error("Failed to load site meta:", error);
    }
  }

  return (
    <footer className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-gray-300 overflow-hidden">
      {/* Animated Background Decorations */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute top-1/2 right-1/4 w-64 h-64 bg-emerald-500 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        />
        <div
          className="absolute bottom-0 right-0 w-96 h-96 bg-blue-600 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}
        />
      </div>

      {/* Pattern Overlay */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Main Footer Content */}
      <div className="relative z-10 container mx-auto px-6 md:px-8 pt-16 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 mb-12">
          {/* Company Info - Spans 4 columns */}
          <div className="lg:col-span-4">
            <Link to="/" className="inline-block mb-6 group">
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm px-4 py-3 rounded-2xl border border-white/20 hover:border-blue-400/50 transition-all duration-300 group-hover:scale-105">
                <Building2 className="w-8 h-8 text-blue-400" />
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
                  {APP_NAME}
                </span>
              </div>
            </Link>

            <p className="text-gray-400 leading-relaxed mb-8 text-sm">
              {siteMeta?.data.site_description}
            </p>

            {/* Contact Info Cards */}
            <div className="flex flex-col gap-4">
              <motion.a
                whileHover={{ x: 4 }}
                href="https://maps.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-blue-400/50 transition-all group"
              >
                <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg group-hover:scale-110 transition-transform">
                  <MapPin size={16} className="text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500 mb-1">Address</p>
                  <p className="text-sm text-gray-300">
                    {siteMeta?.data.contact_address}
                  </p>
                </div>
              </motion.a>

              <motion.a
                whileHover={{ x: 4 }}
                href="tel:918853217658"
                className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-emerald-400/50 transition-all group"
              >
                <div className="p-2 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg group-hover:scale-110 transition-transform">
                  <Phone size={16} className="text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500 mb-1">Phone</p>
                  <p className="text-sm text-gray-300 font-semibold">{siteMeta?.data.contact_phone}</p>
                </div>
              </motion.a>

              <motion.a
                whileHover={{ x: 4 }}
                href="mailto:contact@brainerhub.com"
                className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-blue-400/50 transition-all group"
              >
                <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg group-hover:scale-110 transition-transform">
                  <Mail size={16} className="text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500 mb-1">Email</p>
                  <p className="text-sm text-gray-300">{siteMeta?.data.contact_email}</p>
                </div>
              </motion.a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-emerald-500 rounded-full" />
              <h3 className="text-white font-bold text-lg">Quick Links</h3>
            </div>
            <ul className="space-y-3">
              {/* Dynamic Footer Pages */}
              {footerPages.map((page) => (
                <li key={page.slug}>
                  <Link
                    to={`/page/${page.slug}`}
                    className="flex items-center gap-2 text-sm text-gray-400 hover:text-blue-400 transition-colors group"
                  >
                    <ArrowRight
                      size={14}
                      className="group-hover:translate-x-1 transition-transform"
                    />
                    {page.title}
                  </Link>
                </li>
              ))}

              {/* Static Links */}
              {[
                { name: "Contact Us", path: "/contact" },
              ].map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="flex items-center gap-2 text-sm text-gray-400 hover:text-blue-400 transition-colors group"
                  >
                    <ArrowRight
                      size={14}
                      className="group-hover:translate-x-1 transition-transform"
                    />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Properties */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-1 h-6 bg-gradient-to-b from-emerald-500 to-blue-500 rounded-full" />
              <h3 className="text-white font-bold text-lg">Properties</h3>
            </div>
            <ul className="space-y-3">
              {[
                { name: "Property For Sale", path: "/properties/sale" },
                { name: "Property For Rent", path: "/properties/rent" },
                { name: "Featured Properties", path: "/properties/sale" },
                { name: "Our Agents", path: "#" },
              ].map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="flex items-center gap-2 text-sm text-gray-400 hover:text-emerald-400 transition-colors group"
                  >
                    <ArrowRight
                      size={14}
                      className="group-hover:translate-x-1 transition-transform"
                    />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div className="lg:col-span-4">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-emerald-500 rounded-full" />
              <h3 className="text-white font-bold text-lg">Stay Updated</h3>
            </div>

            <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm p-6 rounded-2xl border border-white/20 mb-6">
              <p className="text-sm mb-4 text-gray-300 leading-relaxed">
                Subscribe to get the latest property updates, market insights, and exclusive offers
                directly to your inbox.
              </p>

              <div className="relative mb-4">
                <div className="flex items-center bg-white/10 rounded-xl overflow-hidden border border-white/20 focus-within:border-blue-400 focus-within:shadow-lg focus-within:shadow-blue-500/20 transition-all">
                  <div className="pl-4">
                    <Mail size={18} className="text-blue-400" />
                  </div>
                  <input
                    type="email"
                    placeholder="Your email address"
                    className="bg-transparent w-full px-4 py-3.5 text-sm focus:outline-none text-white placeholder-gray-500"
                  />
                  <button className="px-6 py-3.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 transition-all flex items-center gap-2 group">
                    <Send
                      size={18}
                      className="text-white group-hover:translate-x-1 transition-transform"
                    />
                  </button>
                </div>
              </div>

              <div className="flex items-start gap-2 text-xs text-gray-400">
                <CheckCircle2 size={14} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                <span>No spam, unsubscribe anytime</span>
              </div>
            </div>

            {/* Social Icons */}
            <div>
              <p className="text-white font-semibold mb-4 text-sm">Follow Us</p>
              <div className="flex gap-3">
                {[
                  { Icon: Facebook, href: "#", color: "from-blue-600 to-blue-700" },
                  { Icon: Linkedin, href: "#", color: "from-blue-500 to-blue-600" },
                  { Icon: Twitter, href: "#", color: "from-sky-500 to-sky-600" },
                  { Icon: Instagram, href: "#", color: "from-pink-500 to-purple-600" },
                  { Icon: Youtube, href: "#", color: "from-red-500 to-red-600" },
                ].map(({ Icon, href, color }, i) => (
                  <motion.a
                    key={i}
                    whileHover={{ y: -4, scale: 1.1 }}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`bg-white/10 hover:bg-gradient-to-br hover:${color} transition-all p-3 rounded-xl border border-white/20 hover:border-transparent hover:shadow-lg group`}
                  >
                    <Icon
                      size={18}
                      className="text-gray-300 group-hover:text-white transition-colors"
                    />
                  </motion.a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent mb-8" />

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
          <p className="flex items-center gap-2">
            <span>
              © {currentYear} {APP_NAME}. All Rights Reserved.
            </span>
          </p>

          <div className="flex flex-wrap gap-6">
            <Link to="/page/terms-of-service" className="hover:text-blue-400 transition-colors flex items-center gap-1">
              Terms Of Services
            </Link>
            <span className="text-gray-700">•</span>
            <Link to="/page/privacy-policy" className="hover:text-blue-400 transition-colors flex items-center gap-1">
              Privacy Policy
            </Link>
            <span className="text-gray-700">•</span>
            <Link to="/page/cookie-policy" className="hover:text-blue-400 transition-colors flex items-center gap-1">
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom Gradient Line */}
      <div className="h-1 bg-gradient-to-r from-blue-600 via-emerald-500 to-blue-600" />
    </footer>
  );
};

export default Footer;
