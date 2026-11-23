"use client";

import React, { useState, createContext, useContext } from "react";
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

