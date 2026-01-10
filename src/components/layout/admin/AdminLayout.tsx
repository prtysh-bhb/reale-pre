import { ReactNode, useState } from "react";
import AdminSidebar from "./AdminSidebar";
import Header from "./Header";

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Sidebar */}
      <AdminSidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onCollapseChange={setCollapsed}
        onMobileToggle={setMobileOpen}
      />

      {/* Main Content Area */}
      <div
        className={`flex flex-col flex-1 min-h-screen transition-all duration-300 ease-in-out ${
          collapsed ? "lg:pl-[72px]" : "lg:pl-64"
        }`}
      >
        {/* Header */}
        <Header onMenuClick={() => setMobileOpen(true)} />

        {/* Scrollable Page Content */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          <div className="max-w-[1600px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
