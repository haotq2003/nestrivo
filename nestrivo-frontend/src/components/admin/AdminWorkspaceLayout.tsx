"use client";

import React, { useState, useEffect, createContext, useContext } from "react";
import { useRouter } from "next/navigation";
import { ShieldAlert } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
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
  pendingCount: 0,
  setPendingCount: () => {},
});

export const useAdminLayout = () => useContext(AdminLayoutContext);

export function AdminWorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isLoading, isAuthenticated, isAdmin } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState<number>(0);

  // RBAC Route Guard: Chỉ cho phép tài khoản có quyền ADMIN truy cập /admin/*
  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.replace("/login");
    } else if (!isAdmin) {
      router.replace("/");
    }
  }, [isLoading, isAuthenticated, isAdmin, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FFFAEF] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-9 h-9 rounded-full border-4 border-[#F4CD65] border-t-transparent animate-spin" />
          <p className="text-sm text-[#78716C] font-medium">Đang xác thực quyền quản trị...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="min-h-screen bg-[#FFFAEF] flex items-center justify-center p-4">
        <div className="bg-white border border-[#EDE5D5] rounded-3xl p-8 max-w-md text-center space-y-3 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-[#292524]">Không có quyền truy cập</h2>
          <p className="text-xs text-[#78716C]">
            Khu vực này chỉ dành cho Quản trị viên (Admin). Đang chuyển hướng...
          </p>
        </div>
      </div>
    );
  }

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
