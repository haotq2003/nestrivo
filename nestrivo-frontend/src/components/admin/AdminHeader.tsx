"use client";

import { useRouter } from "next/navigation";
import { Menu, Search, RefreshCw, ShieldCheck, LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { NotificationBell } from "@/components/layout/NotificationBell";

interface AdminHeaderProps {
  searchQuery?: string;
  onSearchChange?: (val: string) => void;
  onToggleMobileMenu: () => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  pendingCount?: number;
  title?: string;
  subtitle?: string;
  placeholder?: string;
  badgeText?: string;
  badgeCount?: number;
}

export function AdminHeader({
  searchQuery = "",
  onSearchChange,
  onToggleMobileMenu,
  onRefresh,
  isRefreshing = false,
  pendingCount = 0,
  title = "Kiểm duyệt tin đăng",
  subtitle = "Kiểm tra thông tin phòng, hình ảnh thực tế và điều kiện hợp đồng trước khi xuất bản",
  placeholder = "Tìm theo tên phòng, chủ nhà, SĐT...",
  badgeText,
  badgeCount,
}: AdminHeaderProps) {
  const router = useRouter();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const displayCount = badgeCount !== undefined ? badgeCount : pendingCount;
  const displayBadgeText = badgeText || (displayCount > 0 ? `${displayCount} tin chờ duyệt` : undefined);

  return (
    <header className="h-18 bg-white border-b border-[#EDE5D5] px-4 sm:px-6 lg:px-8 xl:px-10 flex items-center justify-between gap-4 sticky top-0 z-30 shadow-xs">
      {/* Left: Mobile hamburger + Title/Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleMobileMenu}
          className="p-2.5 rounded-2xl text-[#77715F] hover:text-[#373523] hover:bg-[#FFF7E5] lg:hidden focus:outline-none min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label="Mở menu quản trị"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base sm:text-lg font-semibold text-[#292524] leading-tight">
              {title}
            </h1>
            {displayBadgeText && (
              <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#FFF1CC] text-[#805B10] border border-[#F4CD65]/40">
                <span className="w-1.5 h-1.5 rounded-full bg-[#F4CD65] animate-pulse" />
                {displayBadgeText}
              </span>
            )}
          </div>
          <p className="text-xs text-[#57534E] hidden sm:block font-normal">
            {subtitle}
          </p>
        </div>
      </div>

      {/* Right: Search box + Refresh Action */}
      <div className="flex items-center gap-3">
        {/* Search input */}
        {onSearchChange && (
          <div className="relative hidden md:block w-64 lg:w-80">
            <Search className="w-4 h-4 text-[#A8A190] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={placeholder}
              className="w-full pl-9 pr-3.5 py-2 text-xs sm:text-sm bg-[#FFFAEF] border border-[#EDE5D5] rounded-xl text-[#373523] placeholder:text-[#A8A190] focus:outline-none focus:border-[#DCA936] focus:bg-white transition-all min-h-[40px]"
            />
          </div>
        )}

        {/* Quick Refresh button */}
        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-2xl text-xs sm:text-sm font-bold text-[#373523] bg-[#FFF7E5] border border-[#EDE5D5] hover:bg-[#FFF1CC] active:bg-[#FFE599] transition-all min-h-[40px]"
            title="Làm mới danh sách"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-[#DCA936]" : "text-[#77715F]"}`} />
            <span className="hidden sm:inline">Làm mới</span>
          </button>
        )}

        {/* Notification Bell */}
        <NotificationBell />

        {/* Verified Shield Pill */}
        <div className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-[#FFF1CC] border border-[#F4CD65]/40 text-[#805B10] text-xs font-bold">
          <ShieldCheck className="w-4 h-4 text-[#DCA936]" />
          <span>SLA &lt; 2h</span>
        </div>

        {/* Quick Logout Button */}
        <button
          type="button"
          onClick={handleLogout}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-2xl text-xs sm:text-sm font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200/80 transition-all min-h-[40px] cursor-pointer shrink-0 shadow-2xs"
          title="Đăng xuất khỏi hệ thống quản trị"
        >
          <LogOut className="w-4 h-4 text-rose-600" />
          <span className="hidden sm:inline">Đăng xuất</span>
        </button>
      </div>
    </header>
  );
}

