/**
 * Header Component
 * Professional sticky navigation with glassmorphism
 * Enhanced mobile sidebar with beautiful UX
 */

import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, Home as HomeIcon, Building2, ChevronRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import clsx from "clsx";
import { motion, AnimatePresence } from "framer-motion";
import UserDropdown from "@/pages/admin/customer/components/UserDropdown";
import UserMenuItems from "@/pages/admin/customer/components/UserMenuItems";
import { APP_NAME } from "@/constants";

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const location = useLocation();

  const isDashboard = location.pathname.startsWith("/dashboard") || location.pathname === "/";

  useEffect(() => {
    // only add scroll listener on dashboard page
    if (isDashboard) {
      const handleScroll = () => {
        setScrolled(window.scrollY > 30);
      };
      window.addEventListener("scroll", handleScroll);
      return () => window.removeEventListener("scroll", handleScroll);
    } else {
      // reset when leaving dashboard
      setScrolled(true);
    }
  }, [isDashboard]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [menuOpen]);

  const navLinks = [
    { name: "Home", path: "/", icon: HomeIcon },
    { name: "For Rent", path: "/properties/rent" },
    { name: "For Sale", path: "/properties/sale" },
    { name: "AI Features", path: "/ai-hub", icon: Sparkles, isNew: true },
    { name: "Contact", path: "/contact" },
    { name: "Subscription", path: "/package-plan" },
    { name: "Blog", path: "/blog" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      <header
        className={clsx(
          "fixed top-0 left-0 w-full z-50 transition-all duration-500",
          scrolled
            ? "bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl shadow-lg border-b border-gray-200 dark:border-gray-800"
            : "bg-transparent"
        )}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-4 flex justify-between items-center py-4">
          {/* LOGO */}
          <Link to="/" className="inline-block group">
            <div className="flex items-center gap-3 backdrop-blur-sm px-3 py-2 rounded-2xl transition-all duration-300 group-hover:scale-105">
              <Building2 className="w-8 h-8 text-blue-400" />
              <span className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
                {APP_NAME}
              </span>
            </div>
          </Link>

          {/* NAV LINKS (Desktop) */}
          <nav className={clsx("hidden md:flex items-center gap-2 font-semibold transition-all")}>
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={clsx(
                  "relative px-4 py-2 rounded-xl transition-all group flex items-center gap-2",
                  link.isNew && scrolled
                    ? "bg-gradient-to-r from-purple-500/10 to-blue-500/10 hover:from-purple-500/20 hover:to-blue-500/20"
                    : "",
                  scrolled
                    ? isActive(link.path)
                      ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20"
                      : link.isNew
                      ? "text-purple-600 dark:text-purple-400"
                      : "text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                    : isActive(link.path)
                    ? "text-white bg-white/20 backdrop-blur-sm"
                    : "text-white/90 hover:text-white hover:bg-white/10 backdrop-blur-sm"
                )}
              >
                {link.icon && <link.icon size={16} className={link.isNew ? "animate-pulse" : ""} />}
                {link.name}
                {link.isNew && (
                  <span className="px-2 py-0.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs rounded-full font-bold">
                    NEW
                  </span>
                )}
                <span
                  className={clsx(
                    "absolute left-1/2 -translate-x-1/2 bottom-0 h-0.5 transition-all duration-300",
                    link.isNew ? "bg-gradient-to-r from-purple-600 to-blue-600" : "bg-blue-600",
                    isActive(link.path) ? "w-8" : "w-0 group-hover:w-8"
                  )}
                />
              </Link>
            ))}
          </nav>

          {/* LOGIN BUTTON (Desktop) */}
          <div className="hidden md:block">
            {!token ? (
              <Button
                onClick={() => navigate("/login")}
                className={clsx(
                  "font-bold rounded-xl px-6 py-3 transition-all duration-300 transform hover:scale-105",
                  scrolled
                    ? "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40"
                    : "bg-white/95 hover:bg-white text-blue-700 backdrop-blur-sm shadow-lg shadow-white/50 hover:shadow-xl"
                )}
              >
                Login / Register
              </Button>
            ) : (
              <UserDropdown scrolled={scrolled} />
            )}
          </div>

          {/* MOBILE MENU ICON */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className={clsx(
              "md:hidden p-2 rounded-lg transition-all",
              scrolled
                ? "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                : "text-white hover:bg-white/10 backdrop-blur-sm"
            )}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </header>

      {/* MOBILE MENU DRAWER */}
      <AnimatePresence>
        {menuOpen && (
          <>
            {/* Backdrop with Blur */}
            <motion.div
              className="md:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMenuOpen(false)}
            />

            {/* Sliding Drawer */}
            <motion.div
              className="md:hidden fixed top-0 right-0 h-full w-[85%] max-w-sm bg-white dark:bg-slate-900 shadow-2xl z-50 flex flex-col"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
            >
              {/* Header Section */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-blue-50 to-emerald-50 dark:from-slate-800 dark:to-slate-800">
                <div className="flex items-center gap-3">
                  <Building2 className="w-7 h-7 text-blue-600 dark:text-blue-400" />
                  <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-emerald-600 dark:from-blue-400 dark:to-emerald-400 bg-clip-text text-transparent">
                    Menu
                  </h2>
                </div>
                <button
                  onClick={() => setMenuOpen(false)}
                  className="p-2 hover:bg-white/80 dark:hover:bg-slate-700 rounded-lg transition-all active:scale-95"
                  aria-label="Close menu"
                >
                  <X size={22} className="text-gray-600 dark:text-gray-400" />
                </button>
              </div>

              {/* Scrollable Content Area */}
              <div className="flex-1 overflow-y-auto">
                {/* Navigation Links */}
                <nav className="px-4 py-6">
                  <div className="space-y-1">
                    {navLinks.map((link, index) => (
                      <motion.div
                        key={link.name}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Link
                          to={link.path}
                          onClick={() => setMenuOpen(false)}
                          className={clsx(
                            "flex items-center justify-between px-4 py-3.5 rounded-xl font-medium transition-all group",
                            link.isNew
                              ? "bg-gradient-to-r from-purple-500/10 to-blue-500/10 hover:from-purple-500/20 hover:to-blue-500/20 text-purple-600 dark:text-purple-400"
                              : "",
                            isActive(link.path) && !link.isNew
                              ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/30"
                              : !link.isNew
                              ? "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 active:scale-[0.98]"
                              : "active:scale-[0.98]"
                          )}
                        >
                          <span className="flex items-center gap-3">
                            {link.icon && (
                              <link.icon size={20} className={link.isNew ? "animate-pulse" : ""} />
                            )}
                            {link.name}
                            {link.isNew && (
                              <span className="px-2 py-0.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs rounded-full font-bold">
                                NEW
                              </span>
                            )}
                          </span>
                          <ChevronRight
                            size={18}
                            className={clsx(
                              "transition-transform duration-300",
                              isActive(link.path)
                                ? "opacity-100"
                                : "opacity-0 group-hover:opacity-100 group-hover:translate-x-1"
                            )}
                          />
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                </nav>

                {/* Divider */}
                <div className="px-6 py-4">
                  <div className="h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-700 to-transparent" />
                </div>

                {/* Auth Section */}
                <div className="px-6 pb-6">
                  {!token ? (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <Button
                        onClick={() => {
                          setMenuOpen(false);
                          navigate("/login");
                        }}
                        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl py-6 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all active:scale-[0.98]"
                      >
                        Login / Register
                      </Button>
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <UserMenuItems />
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Footer Section (Optional) */}
              <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-slate-800/50">
                <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                  © 2024 {APP_NAME}. All rights reserved.
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;
