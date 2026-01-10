import Footer from "@/components/layout/public/Footer";
import Header from "@/components/layout/public/Header";
import React from "react";
import { Outlet } from "react-router-dom";

const CustomerLayout: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <Header />

      {/* Main content */}
      <main className="flex-grow mt-[80px]">
        <Outlet />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default CustomerLayout;
