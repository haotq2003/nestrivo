"use client";

import React, { useState, createContext, useContext } from "react";
import { AdminSidebar } from "./AdminSidebar";

interface AdminLayoutContextType {
  isMobileMenuOpen: boolean;
  toggleMobileMenu: () => void;
  closeMobileMenu: () => void;
  pendingCount: number;
  setPendingCount: (count: number) => void;
}

const AdminLayoutContext = createContext<AdminLayoutContextType>({
  isMobileMenuOpen: false,
  toggleMobileMenu: () => {},
  closeMobileMenu: () => {},
  pendingCount: 3,
  setPendingCount: () => {},
});

export const useAdminLayout = () => useContext(AdminLayoutContext);

export function AdminWorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState<number>(3);

  return (
    <AdminLayoutContext.Provider
      value={{
        isMobileMenuOpen,
        toggleMobileMenu: () => setIsMobileMenuOpen((prev) => !prev),
        closeMobileMenu: () => setIsMobileMenuOpen(false),
        pendingCount,
        setPendingCount,
      }}
    >
      <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col lg:flex-row antialiased">
        {/* Persistent Admin Sidebar across all /admin/* routes */}
        <AdminSidebar
          pendingCount={pendingCount}
          isOpenOnMobile={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
        />

        {/* Main Work Area (Pushed right by 260px on lg screens) */}
        <div className="flex-1 lg:pl-[260px] flex flex-col min-w-0 min-h-screen">
          {children}
        </div>
      </div>
    </AdminLayoutContext.Provider>
  );
}

