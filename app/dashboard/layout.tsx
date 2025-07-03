import React, { ReactNode } from "react";
import Header from "./_components/Header";
import { Toaster } from "@/components/ui/sonner";

interface dashboardLayoutProps {
  children: ReactNode;
}
function DashboardLayout({ children }: dashboardLayoutProps) {
  return (
    <div className="mx-3 sm:mx-5 md:mx-20 lg:mx-36">
      <Header />
      <Toaster position="bottom-center" richColors />

      {children}
    </div>
  );
}

export default DashboardLayout;
