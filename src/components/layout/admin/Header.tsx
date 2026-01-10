import { useState, useRef, useEffect } from "react";
import { Moon, Sun, Search, Menu, User, Pencil, LogOut, Settings, ArrowLeft, CreditCard } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { logout } from "@/api/auth";
import Notifications from "./Notifications";
import { deleteNotification, getNotifications, getUnreadNotificationsCount, markAllAsReadNotification, markAsReadNotification, NotificationItem } from "@/api/public/notifications";
import echo from "@/lib/echo";
import { useTheme } from "@/context/ThemeContext";

interface HeaderProps {
  onMenuClick?: () => void;
}

const Header = ({ onMenuClick }: HeaderProps) => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();

  const avatarUrl = user?.avatar_url || "/default-avatar.png";
  const role = user?.role || "customer";
  const isDark = theme === 'dark';

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

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
      // clicking outside search overlay should close it too
      if ((event.target as HTMLElement).closest?.(".mobile-search-toggle") === null) {
        // do not auto-close when clicking inside the overlay input itself
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <>
      {/* Header */}
      <header
        // safe area + avoid clipping in rounded parents
        className="w-full overflow-visible sticky top-0 z-40 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 dark:border-gray-800 shadow-sm"
      >
        <div className="max-w-[100%] mx-auto flex items-center justify-between gap-3">
          {/* Left side */}
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            <button
              className="lg:hidden text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/20"
              onClick={onMenuClick}
              aria-label="Open menu"
            >
              <Menu size={20} />
            </button>

            {/* Desktop search (hidden on xs) */}
            <div className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-800 dark:to-slate-800 rounded-lg px-3 py-2 border border-gray-200 dark:border-gray-700 focus-within:border-blue-400 dark:focus-within:border-blue-500 focus-within:shadow-sm transition-all">
              <Search className="text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search..."
                className="w-48 sm:w-64 md:w-80 border-none focus:ring-0 text-sm bg-transparent placeholder-gray-500 text-gray-900 dark:text-white outline-none"
              />
            </div>

            {/* Mobile search toggle button (visible on xs) */}
            <button
              className="sm:hidden mobile-search-toggle p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              onClick={() => setMobileSearchOpen((s) => !s)}
              aria-label="Search"
              title="Search"
            >
              <Search size={18} />
            </button>

            {/* Mobile search overlay (full width below header when open) */}
            {mobileSearchOpen && (
              <div className="absolute left-0 right-0 top-[calc(100%+6px)] px-4 sm:px-6">
                <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-2">
                  <div className="flex items-center gap-2 px-2">
                    <Search className="text-gray-400" size={16} />
                    <input
                      autoFocus
                      type="text"
                      placeholder="Search..."
                      className="w-full border-none focus:ring-0 text-sm bg-transparent placeholder-gray-500 text-gray-900 dark:text-white outline-none px-1 py-2"
                      onBlur={() => setMobileSearchOpen(false)}
                    />
                    <button
                      className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                      onClick={() => setMobileSearchOpen(false)}
                      aria-label="Close search"
                    >
                      <ArrowLeft size={16} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2 relative min-w-0">
            {user?.role == 'agent' && (
              <Link to={'/agent/subscription-plans'}
              className="p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/20 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <CreditCard size={18}/>
            </Link>
            )}

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/20 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              aria-pressed={isDark}
              aria-label="Toggle dark mode"
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* Notifications */}
            <Notifications
                notifications={notifications}
                unreadCount={unreadCount}
                onMarkAsRead={handleMarkAsRead}
                onMarkAllAsRead={handleMarkAllAsRead}
                onDelete={handleDelete}
                customClass={'hover:bg-blue-50'}
            />

            {/* Avatar + Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen((prev) => !prev)}
                className="flex items-center gap-2 p-1 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-colors"
                aria-expanded={dropdownOpen}
                aria-label="Open user menu"
              >
                <img
                  src={avatarUrl}
                  alt="user"
                  className="w-8 h-8 rounded-full border-2 border-blue-200 dark:border-emerald-800 object-cover shadow-sm"
                />
                {/* hide name on very small screens to avoid layout wrap */}
                <div className="hidden sm:block text-left min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user?.name || "User"}</p>
                  <p className="text-xs text-blue-600 dark:text-emerald-400 capitalize">{role}</p>
                </div>
              </button>

              {/* Dropdown menu */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 shadow-xl rounded-xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-emerald-50 dark:from-blue-950/30 dark:to-emerald-950/30">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{user?.name || "User"}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 capitalize">{user?.role}</p>
                  </div>

                  <ul className="py-1 text-sm">
                    <li>
                      <Link
                        to={profilePath}
                        className="flex items-center gap-2.5 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-300"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <User size={16} />
                        <span>View Profile</span>
                      </Link>
                    </li>
                    <li>
                      <Link
                        to={editProfilePath}
                        className="flex items-center gap-2.5 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-300"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <Pencil size={16} />
                        <span>Edit Profile</span>
                      </Link>
                    </li>
                    {user?.role == 'agent' && (
                    <li>
                      <Link
                        to={`/agent/my-subscriptions`}
                        className="flex items-center gap-2.5 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-300"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <CreditCard size={16} />
                        <span>My Subscription</span>
                      </Link>
                    </li>
                    )}
                    <li>
                      <Link
                        to="/admin/settings"
                        className="flex items-center gap-2.5 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-300"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <Settings size={16} />
                        <span>Settings</span>
                      </Link>
                    </li>
                  </ul>

                  <div className="border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={() => {
                        handleLogout();
                        setDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 cursor-pointer transition-colors"
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
      </header>
    </>
  );
};

export default Header;
