import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Home,
  Users,
  Contact,
  ArrowLeftRight,
  Settings,
  MessageCircle,
  MessageSquare,
  MailOpen,
  LogOut,
  HousePlus,
  PlusCircle,
  List,
  Building2,
  ChevronDown,
  PanelLeftClose,
  PanelLeft,
  X,
  ClipboardList,
  CreditCard,
  Bell,
  GalleryVerticalEnd,
  Newspaper,
  MonitorCog,
  Blocks,
  Coins,
  Wallet,
  Brain,
  MessageCircleQuestion,
  ScrollText,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { cn } from "@/lib/utils";

interface AdminSidebarProps {
  collapsed?: boolean;
  mobileOpen?: boolean;
  onMobileToggle?: (val: boolean) => void;
}

const AdminSidebar = ({
  collapsed = false,
  mobileOpen = false,
  onMobileToggle,
}: AdminSidebarProps) => {
  const { updateSettings } = useTheme();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const location = useLocation();

  const toggleDropdown = (menu: string) => {
    setOpenDropdown(openDropdown === menu ? null : menu);
  };

  const { user } = useAuth();
  const role = user?.role || "admin";
  const userId = user?.id || "";

  // Role-based menu configuration
  const menuItems =
    role === "admin"
      ? [
          {
            name: "Dashboard",
            icon: LayoutDashboard,
            path: "/admin/dashboard",
            exact: true,
          },
          {
            name: "Analytics",
            icon: GalleryVerticalEnd,
            path: "/admin/analytics",
            exact: true,
          },
          {
            name: "Properties",
            icon: Home,
            children: [
              { name: "All Properties", icon: List, path: "/admin/properties", exact: true },
              { name: "Property Stats", icon: Building2, path: "/admin/properties/stats", exact: true },
            ],
          },
          {
            name: "Agents",
            icon: Users,
            children: [
              { name: "Agents List", icon: List, path: "/admin/agents", exact: true },
              { name: "Add Agent", icon: PlusCircle, path: "/admin/agents/new", exact: true },
            ],
          },
          {
            name: "Customers",
            icon: Contact,
            children: [
              { name: "Customers List", icon: List, path: "/admin/customers", exact: true },
              { name: "Add Customer", icon: PlusCircle, path: "/admin/customers/new", exact: true },
            ],
          },
          {
            name: "Subscriptions",
            icon: CreditCard,
            children: [
              { name: "Subscription List", icon: List, path: "/admin/subscriptions", exact: true },
              { name: "Add Subscription", icon: PlusCircle, path: "/admin/subscriptions/new", exact: true },
            ],
          },
          {
            name: "Credit",
            icon: Coins,
            children: [
              { name: "Credit Packages", icon: List, path: "/admin/credit", exact: true },
              { name: "Wallet", icon: Wallet, path: "/admin/wallet", exact: true },
            ],
          },
          {
            name: "CMS",
            icon: MonitorCog,
            children: [
              { name: "FAQs", icon: MessageCircleQuestion, path: "/admin/cms/faqs", exact: true },
              { name: "Blog Categories", icon: Blocks, path: "/admin/cms/blog-categories", exact: true },
              { name: "Blogs", icon: GalleryVerticalEnd, path: "/admin/cms/blogs", exact: true },
              { name: "News", icon: Newspaper, path: "/admin/cms/news", exact: true },
            ],
          },
          { name: "Pages", icon: ScrollText, path: "/admin/pages", exact: true },
          {
            name: "Transactions",
            icon: ArrowLeftRight,
            children: [
              { name: "Agents", icon: Users, path: "/admin/transactions/agents", exact: true },
              { name: "Customers", icon: Contact, path: "/admin/transactions/customers", exact: true },
            ],
          },
          { name: "AI Chat Leads", icon: Brain, path: "/admin/aichatleads", exact: true },
          { name: "Orders", icon: HousePlus, path: "/admin/orders", exact: true },
          { name: "Inbox", icon: MailOpen, path: "/admin/inbox", exact: true },
          { name: "Reviews", icon: MessageSquare, path: "/admin/reviews", exact: true },
          { name: "Settings", icon: Settings, path: "/admin/settings", exact: true },
        ]
      : role === "agent"
      ? [
          { name: "Dashboard", icon: LayoutDashboard, path: "/agent/dashboard", exact: true },
          {
            name: "My Properties",
            icon: Home,
            children: [
              { name: "Property List", icon: List, path: `/agent/properties`, exact: true },
              { name: "Add Property", icon: PlusCircle, path: `/agent/properties/new`, exact: true },
            ],
          },
          { name: "Leads", icon: ClipboardList, path: "/agent/leads", exact: false },
          { name: "AI Price Estimate", icon: Brain, path: "/agent/ai-price-estimate", exact: false },
          {
            name: "CMS",
            icon: MonitorCog,
            children: [
              { name: "Blogs", icon: List, path: "/agent/blogs", exact: true },
              { name: "Comments", icon: MessageCircle, path: "/agent/comments", exact: true },
            ],
          },
          { name: "Appointments", icon: HousePlus, path: "/agent/appointments", exact: true },
          { name: "Reminders", icon: Bell, path: "/agent/reminders", exact: true },
          { name: "Inbox", icon: MailOpen, path: "/admin/inbox", exact: true },
          { name: "Chat", icon: MessageCircle, path: "/agent/chat", exact: true },
          { name: "Settings", icon: Settings, path: "/admin/settings", exact: true },
        ]
      : [
          { name: "Dashboard", icon: LayoutDashboard, path: "/admin/dashboard", exact: true },
          {
            name: "My Properties",
            icon: Home,
            children: [
              { name: "Property List", icon: Building2, path: `/admin/customers/${userId}/properties`, exact: false },
            ],
          },
          { name: "Inbox", icon: MailOpen, path: "/admin/inbox", exact: true },
          { name: "Chat", icon: MessageCircle, path: "/admin/chat", exact: true },
          { name: "Settings", icon: Settings, path: "/admin/settings", exact: true },
        ];

  // Keep dropdown open for active route
  useEffect(() => {
    for (const item of menuItems) {
      if (item.children) {
        const match = item.children.some((child) =>
          location.pathname.startsWith(child.path)
        );
        if (match) {
          setOpenDropdown(item.name);
          return;
        }
      }
    }
  }, [location.pathname]);

  return (
    <>
      <aside
        className={cn(
          "fixed top-0 left-0 h-screen flex flex-col bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 z-50 transition-all duration-300 ease-in-out",
          collapsed ? "w-[72px]" : "w-64",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
          "lg:translate-x-0"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-800">
          {!collapsed && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-sm font-bold text-gray-900 dark:text-white">
                  {role === "admin" ? "Admin Panel" : role === "agent" ? "Agent Panel" : "Dashboard"}
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{role}</p>
              </div>
            </div>
          )}

          <div className="flex items-center gap-1">
            <button
              onClick={() => updateSettings({ menuState: collapsed ? "expanded" : "collapsed" })}
              className="hidden lg:flex p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? <PanelLeft size={18} /> : <PanelLeftClose size={18} />}
            </button>
            <button
              onClick={() => onMobileToggle?.(false)}
              className="lg:hidden p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {menuItems.map((item) => (
            <div key={item.name}>
              {item.children ? (
                <>
                  <button
                    onClick={() => toggleDropdown(item.name)}
                    className={cn(
                      "group flex items-center justify-between w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                      collapsed ? "justify-center" : "",
                      openDropdown === item.name
                        ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white"
                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon size={18} className={openDropdown === item.name ? "text-primary-500" : ""} />
                      {!collapsed && <span>{item.name}</span>}
                    </div>
                    {!collapsed && (
                      <ChevronDown
                        size={16}
                        className={cn(
                          "transition-transform duration-200",
                          openDropdown === item.name ? "rotate-180" : ""
                        )}
                      />
                    )}
                  </button>

                  {!collapsed && openDropdown === item.name && (
                    <div className="mt-1 ml-4 pl-4 border-l-2 border-gray-200 dark:border-gray-700 space-y-1">
                      {item.children.map((child) => (
                        <NavLink
                          key={child.name}
                          to={child.path}
                          end={!!child.exact}
                          onClick={() => onMobileToggle?.(false)}
                          className={({ isActive }) =>
                            cn(
                              "flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors",
                              isActive
                                ? "bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 font-medium"
                                : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
                            )
                          }
                        >
                          <child.icon size={16} />
                          <span>{child.name}</span>
                        </NavLink>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <NavLink
                  to={item.path}
                  end={!!item.exact}
                  onClick={() => onMobileToggle?.(false)}
                  className={({ isActive }) =>
                    cn(
                      "group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                      collapsed ? "justify-center" : "",
                      isActive
                        ? "bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400"
                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
                    )
                  }
                >
                  <item.icon size={18} />
                  {!collapsed && <span>{item.name}</span>}
                </NavLink>
              )}
            </div>
          ))}
        </nav>

        {/* User Info & Logout */}
        <div className="p-3 border-t border-gray-200 dark:border-gray-800">
          {!collapsed && user && (
            <div className="flex items-center gap-3 px-3 py-2 mb-2 rounded-lg bg-gray-50 dark:bg-gray-800/50">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                {user.name?.charAt(0).toUpperCase() || "U"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {user.name || "User"}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 capitalize truncate">
                  {role}
                </p>
              </div>
            </div>
          )}

          <button
            onClick={() => {
              localStorage.clear();
              window.location.href = "/";
            }}
            className={cn(
              "flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-colors",
              collapsed ? "justify-center" : ""
            )}
          >
            <LogOut size={18} />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => onMobileToggle?.(false)}
        />
      )}
    </>
  );
};

export default AdminSidebar;
