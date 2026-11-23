"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { PlusCircle, Search, Menu, Home, ShieldCheck, LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { NotificationBell } from "@/components/layout/NotificationBell";

interface LandlordHeaderProps {
  searchQuery: string;
  onSearchChange: (val: string) => void;
  onToggleMobileMenu: () => void;
}

export function LandlordHeader({
  searchQuery,
  onSearchChange,
  onToggleMobileMenu,
}: LandlordHeaderProps) {
  const router = useRouter();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };
  return (
    <header className="h-18 bg-white border-b border-[#EDE5D5] px-4 sm:px-6 lg:px-8 xl:px-10 flex items-center justify-between gap-4 sticky top-0 z-30 shadow-xs">
      {/* Left: Mobile menu button + Title/Breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleMobileMenu}
          className="p-2.5 rounded-2xl text-[#77715F] hover:text-[#373523] hover:bg-[#FFF7E5] lg:hidden focus:outline-none min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label="Mở menu điều hướng"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-base sm:text-lg font-semibold text-[#292524] leading-tight">
            Quản lý phòng cho thuê
          </h1>
          <p className="text-xs text-[#57534E] hidden sm:block font-normal">
            Theo dõi trạng thái duyệt, kiểm soát phòng trống và tương tác khách thuê
          </p>
        </div>
      </div>

      {/* Right: Search box + "+ Đăng tin mới" CTA */}
      <div className="flex items-center gap-3">
        {/* Search Input */}
        <div className="relative hidden md:block w-64 lg:w-72">
          <Search className="w-4 h-4 text-[#A8A29E] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Tìm theo tên phòng, địa chỉ..."
            className="w-full pl-9 pr-3.5 py-2 text-xs sm:text-sm bg-[#FFFAEF] border border-[#EDE5D5] rounded-xl text-[#292524] placeholder:text-[#A8A29E] focus:outline-none focus:border-[#DCA936] focus:bg-white transition-all min-h-[40px]"
          />
        </div>

        {/* Notification Bell */}
        <NotificationBell />

        {/* Create Listing Button */}
        <Link
          href="/landlord/listings/new"
          className="inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-2xl bg-[#F4CD65] hover:bg-[#ebbf4d] active:bg-[#e0b03b] text-[#292524] font-medium text-xs sm:text-sm shadow-xs transition-all min-h-[44px] shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Đăng tin mới</span>
        </Link>

        {/* Quick Logout Button */}
        <button
          type="button"
          onClick={handleLogout}
          className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-2xl text-xs sm:text-sm font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200/80 transition-all min-h-[44px] cursor-pointer shrink-0 shadow-2xs"
          title="Đăng xuất khỏi tài khoản"
        >
          <LogOut className="w-4 h-4 text-rose-600" />
          <span className="hidden md:inline">Đăng xuất</span>
        </button>
      </div>
    </header>
  );
}
