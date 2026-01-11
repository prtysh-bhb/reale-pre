import { ReactNode, useState, useEffect } from "react";
import AdminSidebar from "./AdminSidebar";
import Header from "./Header";
import { ThemeCustomizer } from "@/components/admin/ThemeCustomizer";
import { useTheme } from "@/context/ThemeContext";
import { cn } from "@/lib/utils";

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const { settings } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [customizerOpen, setCustomizerOpen] = useState(false);

  // Derive collapsed state from theme settings
  const collapsed = settings.menuState === "collapsed";

  // Determine navbar visibility
  const isNavbarHidden = settings.navbarType === "hidden";
  const isNavbarSticky = settings.navbarType === "sticky";

  // Determine content width
  const isCompactContent = settings.contentWidth === "compact";

  return (
    <div
      className={cn(
        "flex min-h-screen bg-gray-50 dark:bg-gray-950",
        settings.skin === "bordered" && "bg-white dark:bg-gray-900"
      )}
    >
      {/* Sidebar */}
      <AdminSidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onMobileToggle={setMobileOpen}
      />

      {/* Main Content Area */}
      <div
        className={cn(
          "flex flex-col flex-1 min-h-screen transition-all duration-300 ease-in-out",
          collapsed ? "lg:pl-[72px]" : "lg:pl-64"
        )}
      >
        {/* Header */}
        {!isNavbarHidden && (
          <Header
            onMenuClick={() => setMobileOpen(true)}
            onCustomizerOpen={() => setCustomizerOpen(true)}
          />
        )}

        {/* Scrollable Page Content */}
        <main
          className={cn(
            "flex-1 p-4 lg:p-6 overflow-auto",
            settings.skin === "bordered" && "bg-gray-50 dark:bg-gray-950"
          )}
        >
          <div
            className={cn(
              "mx-auto",
              isCompactContent ? "max-w-5xl" : "max-w-[1600px]"
            )}
          >
            {children}
          </div>
        </main>
      </div>

      {/* Theme Customizer Panel */}
      <ThemeCustomizer
        open={customizerOpen}
        onClose={() => setCustomizerOpen(false)}
      />
    </div>
  );
};

export default AdminLayout;
