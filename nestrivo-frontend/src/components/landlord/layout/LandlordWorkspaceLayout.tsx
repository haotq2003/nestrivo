"use client";

import React, { useState, useEffect, createContext, useContext } from "react";
import { useRouter } from "next/navigation";
import { ShieldAlert } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { LandlordSidebar } from "./LandlordSidebar";

interface LandlordLayoutContextType {
  isMobileMenuOpen: boolean;
  toggleMobileMenu: () => void;
  closeMobileMenu: () => void;
}

const LandlordLayoutContext = createContext<LandlordLayoutContextType>({
  isMobileMenuOpen: false,
  toggleMobileMenu: () => {},
  closeMobileMenu: () => {},
});

export const useLandlordLayout = () => useContext(LandlordLayoutContext);

export function LandlordWorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isLoading, isAuthenticated, isLandlord } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // RBAC Route Guard: Chỉ cho phép tài khoản có quyền LANDLORD truy cập /landlord/*
  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.replace("/login");
    } else if (!isLandlord) {
      router.replace("/");
    }
  }, [isLoading, isAuthenticated, isLandlord, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FFFAEF] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-9 h-9 rounded-full border-4 border-[#F4CD65] border-t-transparent animate-spin" />
          <p className="text-sm text-[#78716C] font-medium">Đang xác thực quyền Chủ nhà...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !isLandlord) {
    return (
      <div className="min-h-screen bg-[#FFFAEF] flex items-center justify-center p-4">
        <div className="bg-white border border-[#EDE5D5] rounded-3xl p-8 max-w-md text-center space-y-3 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-[#292524]">Không có quyền truy cập</h2>
          <p className="text-xs text-[#78716C]">
            Khu vực này chỉ dành cho tài khoản Chủ nhà. Đang chuyển hướng...
          </p>
        </div>
      </div>
    );
  }

  return (
    <LandlordLayoutContext.Provider
      value={{
        isMobileMenuOpen,
        toggleMobileMenu: () => setIsMobileMenuOpen((prev) => !prev),
        closeMobileMenu: () => setIsMobileMenuOpen(false),
      }}
    >
      <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col lg:flex-row antialiased">
        {/* Persistent Landlord Sidebar across all /landlord/* routes */}
        <LandlordSidebar
          isOpenOnMobile={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
        />

        {/* Main Work Area (Pushed right by 260px on lg screens) */}
        <div className="flex-1 lg:pl-[260px] flex flex-col min-w-0 min-h-screen">
          {children}
        </div>
      </div>
    </LandlordLayoutContext.Provider>
  );
}
