import { useState, useRef, useEffect } from "react";
import { Moon, Sun, Search, Menu, User, Pencil, LogOut, Settings, X, CreditCard, ChevronDown, Palette } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { logout } from "@/api/auth";
import Notifications from "./Notifications";
import { deleteNotification, getNotifications, getUnreadNotificationsCount, markAllAsReadNotification, markAsReadNotification, NotificationItem } from "@/api/public/notifications";
import echo from "@/lib/echo";
import { useTheme } from "@/context/ThemeContext";
import { cn } from "@/lib/utils";

interface HeaderProps {
  onMenuClick?: () => void;
  onCustomizerOpen?: () => void;
}

const Header = ({ onMenuClick, onCustomizerOpen }: HeaderProps) => {
  const { user } = useAuth();
  const { resolvedTheme, toggleTheme } = useTheme();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();

  const avatarUrl = user?.avatar_url || "/default-avatar.png";
  const role = user?.role || "customer";
  const isDark = resolvedTheme === 'dark';

  const profilePathMap: Record<string, string> = {
    admin: "/admin/profile",
    agent: "/agent/profile",
    customer: "/customer/profile",
  };

  const editProfilePathMap: Record<string, string> = {
    admin: "/admin/profile/edit",
    agent: "/agent/profile/edit",
    customer: "/customer/profile/edit",
  };

  const profilePath = profilePathMap[role];
  const editProfilePath = editProfilePathMap[role];

  const handleLogout = async () => {
    await logout();
    localStorage.clear();
    navigate("/");
  };

  useEffect(() => {
    if(!user?.id) return;

    echo.private(`notified.${user?.id}`)
    .listen(".notified", () => {
      fetchNotifications();
    });
  }, [user?.id]);

  const fetchNotifications = async() => {
    try {
      const notification_response = await getNotifications();
      const unread_response = await getUnreadNotificationsCount();
      setNotifications(notification_response.notifications);
      setUnreadCount(unread_response.count);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  }

  const handleMarkAsRead = async (id: number) => {
    try {
      await markAsReadNotification(id);
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error in set to read notifications:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsReadNotification();
      setNotifications(prev => prev.map(n => ({ ...n, read_at: new Date().toISOString() })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteNotification(id);
      fetchNotifications();
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
      <div className="h-full px-4 lg:px-6 flex items-center justify-between gap-4">
        {/* Left side */}
        <div className="flex items-center gap-3 flex-1">
          {/* Mobile menu button */}
          <button
            className="lg:hidden p-2 -ml-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            onClick={onMenuClick}
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>

          {/* Search - Desktop */}
          <div className="hidden md:flex items-center flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                className="w-full h-10 pl-10 pr-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
              />
            </div>
          </div>

          {/* Search - Mobile toggle */}
          <button
            className="md:hidden p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            onClick={() => setMobileSearchOpen(true)}
            aria-label="Search"
          >
            <Search size={18} />
          </button>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-1">
          {/* Agent subscription link */}
          {user?.role === 'agent' && (
            <Link
              to="/agent/subscription-plans"
              className="p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title="Subscription Plans"
            >
              <CreditCard size={18} />
            </Link>
          )}

          {/* Dark mode toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-gray-500 hover:text-primary dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 hover-glow-primary-subtle"
            aria-pressed={isDark}
            aria-label="Toggle dark mode"
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* Theme Customizer toggle */}
          <button
            onClick={onCustomizerOpen}
            className="p-2 rounded-lg text-gray-500 hover:text-primary dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 hover-glow-primary-subtle"
            aria-label="Open theme customizer"
            title="Theme Customizer"
          >
            <Palette size={18} className="icon-primary" />
          </button>

          {/* Notifications */}
          <Notifications
            notifications={notifications}
            unreadCount={unreadCount}
            onMarkAsRead={handleMarkAsRead}
            onMarkAllAsRead={handleMarkAllAsRead}
            onDelete={handleDelete}
            customClass="hover:bg-gray-100 dark:hover:bg-gray-800"
          />

          {/* Divider */}
          <div className="hidden sm:block w-px h-6 bg-gray-200 dark:bg-gray-700 mx-2" />

          {/* User dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(prev => !prev)}
              className={cn(
                "flex items-center gap-2 p-1.5 rounded-lg transition-colors",
                dropdownOpen
                  ? "bg-gray-100 dark:bg-gray-800"
                  : "hover:bg-gray-100 dark:hover:bg-gray-800"
              )}
              aria-expanded={dropdownOpen}
              aria-label="Open user menu"
            >
              <img
                src={avatarUrl}
                alt="user"
                className="w-8 h-8 rounded-full object-cover ring-2 ring-gray-100 dark:ring-gray-700"
              />
              <div className="hidden sm:block text-left">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[120px]">
                  {user?.name || "User"}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{role}</p>
              </div>
              <ChevronDown
                size={16}
                className={cn(
                  "hidden sm:block text-gray-400 transition-transform",
                  dropdownOpen && "rotate-180"
                )}
              />
            </button>

            {/* Dropdown menu */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-lg overflow-hidden animate-in fade-in-0 zoom-in-95">
                {/* User info header */}
                <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                    {user?.name || "User"}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {user?.email}
                  </p>
                </div>

                {/* Menu items */}
                <div className="py-1">
                  <Link
                    to={profilePath}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <User size={16} />
                    <span>View Profile</span>
                  </Link>
                  <Link
                    to={editProfilePath}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <Pencil size={16} />
                    <span>Edit Profile</span>
                  </Link>
                  {user?.role === 'agent' && (
                    <Link
                      to="/agent/my-subscriptions"
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <CreditCard size={16} />
                      <span>My Subscription</span>
                    </Link>
                  )}
                  <Link
                    to="/admin/settings"
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <Settings size={16} />
                    <span>Settings</span>
                  </Link>
                </div>

                {/* Logout */}
                <div className="border-t border-gray-200 dark:border-gray-800 py-1">
                  <button
                    onClick={() => {
                      handleLogout();
                      setDropdownOpen(false);
                    }}
                    className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <LogOut size={16} />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile search overlay */}
      {mobileSearchOpen && (
        <div className="fixed inset-0 z-50 bg-white dark:bg-gray-900 p-4 md:hidden">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSearchOpen(false)}
              className="p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <X size={20} />
            </button>
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                autoFocus
                type="text"
                placeholder="Search..."
                className="w-full h-10 pl-10 pr-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
              />
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
