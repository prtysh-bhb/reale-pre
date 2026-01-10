import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
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
  ChevronRight,
  Menu,
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
  MessageCircleQuestionMark,
  ScrollText,
  Layers,
  Cookie,
  Shield,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

interface AdminSidebarProps {
  collapsed?: boolean;
  mobileOpen?: boolean;
  onCollapseChange?: (val: boolean) => void;
  onMobileToggle?: (val: boolean) => void;
}

const AdminSidebar = ({
  collapsed = false,
  mobileOpen = false,
  onCollapseChange,
  onMobileToggle,
}: AdminSidebarProps) => {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const toggleDropdown = (menu: string) => {
    setOpenDropdown(openDropdown === menu ? null : menu);
  };

  // 🧠 Get logged-in user and role
  const {user} = useAuth();
  const role = user?.role || "admin";
  const userId = user?.id || ""; // use this to build dynamic routes for agents/customers

  // ===============================
  // ROLE-BASED MENU ITEMS
  // ===============================
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
            {
              name: "All Properties",
              icon: List,
              path: "/admin/properties",
              exact: true,
            },
            {
              name: "Property Stats",
              icon: Building2,
              path: "/admin/properties/stats",
              exact: true,
            },
          ],
        },
        {
          name: "Agents",
          icon: Users,
          children: [
            {
              name: "Agents List",
              icon: List,
              path: "/admin/agents",
              exact: true,
            },
            {
              name: "Add Agent",
              icon: PlusCircle,
              path: "/admin/agents/new",
              exact: true,
            },
          ],
        },
        {
          name: "Customers",
          icon: Contact,
          children: [
            {
              name: "Customers List",
              icon: List,
              path: "/admin/customers",
              exact: true,
            },
            {
              name: "Add Customer",
              icon: PlusCircle,
              path: "/admin/customers/new",
              exact: true,
            },
          ],
        },
        {
          name: "Subscriptions",
          icon: CreditCard,
          children: [
            {
              name: "Subscription List",
              icon: List,
              path: "/admin/subscriptions",
              exact: true,
            },
            {
              name: "Add Subscription",
              icon: PlusCircle,
              path: "/admin/subscriptions/new",
              exact: true,
            },
          ],
        },
        {
          name: "Credit",
          icon: Coins,
          children: [
            {
              name: "Credit Packages",
              icon: List,
              path: "/admin/credit",
              exact: true,
            },
             {
              name: "Wallet",
              icon: Wallet,
              path: "/admin/wallet",
              exact: true,
            },
          ],
        },
        {
          name: "CMS",
          icon: MonitorCog,
          children: [
            {
              name: "FAQs",
              icon: MessageCircleQuestionMark,
              path: "/admin/cms/faqs",
              exact: true,
            },
            {
              name: "Blog Categories",
              icon: Blocks,
              path: "/admin/cms/blog-categories",
              exact: true,
            },
            {
              name: "Blogs",
              icon: GalleryVerticalEnd,
              path: "/admin/cms/blogs",
              exact: true,
            },
            {
              name: "News",
              icon: Newspaper,
              path: "/admin/cms/news",
              exact: true,
            },
          ],
        },
        
        {
          name: "Pages",
          icon: ScrollText,
          path: "/admin/pages",
          exact: true,
        },
        {
          name: "Transactions",
          icon: ArrowLeftRight,
          children: [
            {
              name: "Agents",
              icon: Users,
              path: "/admin/transactions/agents",
              exact: true,
            },
            {
              name: "Customers",
              icon: Contact,
              path: "/admin/transactions/customers",
              exact: true,
            },
          ],
        },
        { name: "Ai Chat Leads", icon: Brain, path: "/admin/aichatleads", exact: true },
        { name: "Orders", icon: HousePlus, path: "/admin/orders", exact: true },
        { name: "Inbox", icon: MailOpen, path: "/admin/inbox", exact: true },
        // { name: "Chat*", icon: MessageCircle, path: "/admin/chat", exact: true },
        {
          name: "Reviews",
          icon: MessageSquare,
          path: "/admin/reviews",
          exact: true,
        },
        {
          name: "Settings",
          icon: Settings,
          path: "/admin/settings",
          exact: true,
        },
      ]
    : role === "agent"
    ? [
        {
          name: "Dashboard",
          icon: LayoutDashboard,
          path: "/agent/dashboard",
          exact: true,
        },
        {
          name: "My Properties",
          icon: Home,
          children: [
            {
              name: "Property List",
              icon: List,
              path: `/agent/properties`,
              exact: true,
            },
            {
              name: "Add Property",
              icon: PlusCircle,
              path: `/agent/properties/new`,
              exact: true,
            },
          ],
        },
        // {
        //   name: "Customers*",
        //   icon: Contact,
        //   children: [
        //     {
        //       name: "Customer List*",
        //       icon: List,
        //       path: "/agent/customers",
        //       exact: true,
        //     },
        //     {
        //       name: "Add Customer*",
        //       icon: PlusCircle,
        //       path: "/agent/customers/new",
        //       exact: true,
        //     },
        //   ],
        // },
        {
          name: "Leads",
          icon: ClipboardList,
          path: "/agent/leads",
          exact: false,
        },
        {
          name: "Ai Price Estimate",
          icon: Brain,
          path: "/agent/ai-price-estimate",
          exact: false,
        },
        {
          name: "CMS",
          icon: MonitorCog,
          children: [
            {
              name: "Blogs",
              icon: List,
              path: "/agent/blogs",
              exact: true,
            },
            {
              name: "Comments",
              icon: MessageCircle,
              path: "/agent/comments",
              exact: true,
            },
          ],
        },
        { name: "Appointment", icon: HousePlus, path: "/agent/appointments", exact: true },
        { name: "Reminders", icon: Bell, path: "/agent/reminders", exact: true },
        { name: "Inbox", icon: MailOpen, path: "/admin/inbox", exact: true },
        { name: "Chat", icon: MessageCircle, path: "/agent/chat", exact: true },
        {
          name: "Settings",
          icon: Settings,
          path: "/admin/settings",
          exact: true,
        },
      ]
    : [
        {
          name: "Dashboard",
          icon: LayoutDashboard,
          path: "/admin/dashboard",
          exact: true,
        },
        {
          name: "My Properties",
          icon: Home,
          children: [
            {
              name: "Property List",
              icon: Building2,
              path: `/admin/customers/${userId}/properties`,
              exact: false,
            },
          ],
        },
        { name: "Inbox", icon: MailOpen, path: "/admin/inbox", exact: true },
        { name: "Chat", icon: MessageCircle, path: "/admin/chat", exact: true },
        {
          name: "Settings",
          icon: Settings,
          path: "/admin/settings",
          exact: true,
        },
      ];


  // ===============================
  // Keep dropdown open for active route
  // ===============================
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
    setOpenDropdown(null);
  }, [location.pathname]);

  // ===============================
  // Render Sidebar
  // ===============================
  return (
    <>
      <aside
        className={`fixed top-0 left-0 h-screen flex flex-col bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 shadow-2xl border-r border-blue-500/20 z-50 transition-all duration-200
        ${collapsed ? "w-20" : "w-64"}
        ${mobileOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
      >
        {/* Header Section with Logo */}
        <div className="relative px-4 py-6 border-b border-blue-500/20">
          {/* Decorative gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-emerald-500/10 to-blue-500/10 pointer-events-none"></div>

          <div className="relative flex items-center justify-between">
            {!collapsed && (
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent drop-shadow-lg">
                  {role === "admin"
                    ? "Admin"
                    : role === "agent"
                    ? "Agent"
                    : "Customer"}
                </h1>
                <p className="text-xs text-gray-400 capitalize mt-1 font-medium">
                  {role} Dashboard
                </p>
              </div>
            )}
            <div className="grid gap-1">
              <button
                onClick={() => onCollapseChange?.(!collapsed)}
                className="text-gray-400 hover:text-emerald-400 transition-all cursor-pointer p-2 rounded-lg hover:bg-white/10 backdrop-blur-sm"
              >
                <Menu size={18} />
              </button>
              <button
                onClick={() => onMobileToggle?.(false)}
                className="lg:hidden text-gray-400 hover:text-emerald-400 transition-all p-2 rounded-lg hover:bg-white/10 backdrop-blur-sm"
              >
                <X size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1 scrollbar-thin scrollbar-thumb-blue-500/30 scrollbar-track-transparent">
          {menuItems.map((item) => (
            <div key={item.name}>
              {item.children ? (
                <>
                  <button
                    onClick={() => toggleDropdown(item.name)}
                    className={`group flex items-center justify-between w-full px-4 py-3 rounded-xl hover:bg-white/10 backdrop-blur-sm transition-all text-gray-300 cursor-pointer text-sm ${
                      collapsed ? "justify-center" : ""
                    } ${openDropdown === item.name ? "bg-white/10 text-white border border-blue-500/30" : ""}`}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon size={18} className={openDropdown === item.name ? "text-emerald-400" : "text-gray-400"} />
                      {!collapsed && <span className="font-medium">{item.name}</span>}
                    </div>
                    {!collapsed &&
                      (openDropdown === item.name ? (
                        <ChevronDown size={16} className="text-emerald-400" />
                      ) : (
                        <ChevronRight size={16} className="text-gray-500" />
                      ))}
                  </button>

                  {!collapsed && openDropdown === item.name && (
                    <div className="ml-6 mt-2 space-y-1 p-2 bg-black/20 rounded-lg backdrop-blur-sm border border-white/5">
                      {item.children.map((child) => (
                        <NavLink
                          key={child.name}
                          to={child.path}
                          end={!!child.exact}
                          className={({ isActive }) =>
                            `flex items-center gap-2 px-3 py-2.5 text-sm rounded-lg transition-all hover:bg-white/10 text-gray-400 hover:text-gray-200 ${
                              isActive ? "bg-gradient-to-r from-blue-600 to-emerald-600 text-white shadow-lg font-medium" : ""
                            }`
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
                  className={({ isActive }) =>
                    `group flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 backdrop-blur-sm text-gray-300 transition-all text-sm ${
                      collapsed ? "justify-center" : ""
                    } ${isActive ? "bg-gradient-to-r from-blue-600 to-emerald-600 text-white shadow-lg font-medium border border-blue-500/30" : ""}`
                  }
                >
                  <item.icon size={18} className={`${!collapsed ? '' : ''}`} />
                  {!collapsed && <span className="font-medium">{item.name}</span>}
                </NavLink>
              )}
            </div>
          ))}
        </nav>

        {/* User Info & Logout */}
        <div className="relative p-4 border-t border-blue-500/20">
          {/* Decorative gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-emerald-500/10 to-blue-500/10 pointer-events-none"></div>

          {!collapsed && user && (
            <div className="relative flex items-center gap-3 px-3 py-3 mb-3 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center text-white text-sm font-bold shadow-lg">
                {user.name?.charAt(0).toUpperCase() || "U"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">
                  {user.name || "User"}
                </p>
                <p className="text-xs text-emerald-400 capitalize truncate font-medium">
                  {role}
                </p>
              </div>
            </div>
          )}

          <Button
            variant="ghost"
            className="relative w-full flex items-center justify-center gap-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all cursor-pointer text-sm rounded-xl backdrop-blur-sm border border-transparent hover:border-red-500/30"
            onClick={() => {
              localStorage.clear();
              window.location.href = "/";
            }}
          >
            <LogOut size={16} />
            {!collapsed && <span className="font-medium">Logout</span>}
          </Button>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-gradient-to-br from-slate-900/60 via-blue-900/50 to-slate-900/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => onMobileToggle?.(false)}
        />
      )}
    </>
  );
};

export default AdminSidebar;