"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { 
  ShieldCheck, 
  CheckSquare, 
  Layers, 
  History, 
  ExternalLink,
  ChevronRight,
  Building2,
  Home,
  UserCheck,
  LayoutDashboard,
  Users,
  AlertTriangle,
  LogOut,
  Sparkles,
  CreditCard
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface AdminSidebarProps {
  pendingCount?: number;
  isOpenOnMobile?: boolean;
  onCloseMobile?: () => void;
}

export function AdminSidebar({
  pendingCount = 3,
  isOpenOnMobile = false,
  onCloseMobile,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    if (onCloseMobile) onCloseMobile();
    router.push("/login");
  };

  const adminName = user?.fullName || "Admin Quản Trị";
  const adminEmail = user?.email || "admin@nestrivo.vn";
  const adminInitial = (adminName || "AD").substring(0, 2).toUpperCase();

  const isDashboardActive =
    pathname === "/admin" ||
    pathname === "/admin/dashboard" ||
    pathname.startsWith("/admin/dashboard");

  const isModerationActive =
    pathname.startsWith("/admin/moderation");

  const isPromotionsActive =
    pathname === "/admin/promotions" || pathname.startsWith("/admin/promotions");

  const isPromotionPlansActive =
    pathname.startsWith("/admin/promotion-plans");

  const isUsersActive =
    pathname.startsWith("/admin/users");

  const isReportsActive =
    pathname.startsWith("/admin/reports");

  return (
    <>
      {/* Mobile backdrop */}
      {isOpenOnMobile && (
        <div 
          className="fixed inset-0 bg-slate-900/40 z-40 lg:hidden backdrop-blur-xs transition-opacity"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-[260px] bg-white border-r border-[#EDE5D5] flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpenOnMobile ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col flex-1 overflow-y-auto">
          {/* Brand Header */}
          <div className="h-18 px-5 border-b border-[#EDE5D5] flex items-center justify-between">
            <Link href="/admin/dashboard" className="flex items-center gap-2.5 group">
              <div className="relative w-9 h-9 rounded-xl overflow-hidden shadow-xs shadow-[#F4CD65]/30 group-hover:scale-105 transition-transform shrink-0">
                <Image
                  src="/logo.png"
                  alt="Nestrivo Logo"
                  width={36}
                  height={36}
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-base font-bold tracking-tight text-[#292524]">
                  Nestrivo
                </span>
                <span className="text-[10px] font-medium text-[#805B10] uppercase tracking-wider -mt-0.5 flex items-center gap-1">
                  <span>Hệ Thống Quản Trị</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#F4CD65] animate-pulse" />
                </span>
              </div>
            </Link>
          </div>

          {/* Navigation Section */}
          <div className="p-4 space-y-6">
            <div>
              <p className="px-3 text-[11px] font-medium uppercase tracking-wider text-[#78716C] mb-2">
                Kiểm duyệt & Quản trị
              </p>
              <nav className="space-y-1">
                {/* 1. Dashboard tổng quan */}
                <Link
                  href="/admin/dashboard"
                  onClick={onCloseMobile}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-2xl text-sm font-semibold transition-all group ${
                    isDashboardActive
                      ? "bg-[#FFF1CC] text-[#373523] border border-[#F4CD65]/50 shadow-xs font-bold"
                      : "text-[#77715F] hover:text-[#373523] hover:bg-[#FFF7E5]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <LayoutDashboard
                      className={`w-4 h-4 transition-colors ${
                        isDashboardActive
                          ? "text-[#DCA936]"
                          : "text-[#77715F] group-hover:text-[#373523]"
                      }`}
                    />
                    <span className="truncate">Dashboard tổng quan</span>
                  </div>
                  <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isDashboardActive ? "text-[#373523]" : "text-[#A8A190] group-hover:translate-x-0.5"}`} />
                </Link>

                {/* 2. Hàng đợi kiểm duyệt */}
                <Link
                  href="/admin/moderation"
                  onClick={onCloseMobile}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-2xl text-sm font-semibold transition-all group ${
                    isModerationActive
                      ? "bg-[#FFF1CC] text-[#373523] border border-[#F4CD65]/50 shadow-xs font-bold"
                      : "text-[#77715F] hover:text-[#373523] hover:bg-[#FFF7E5]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <CheckSquare
                      className={`w-4 h-4 transition-colors ${
                        isModerationActive
                          ? "text-[#DCA936]"
                          : "text-[#77715F] group-hover:text-[#373523]"
                      }`}
                    />
                    <span className="truncate">Kiểm duyệt tin đăng</span>
                  </div>
                  {pendingCount > 0 ? (
                    <span className="px-2 py-0.5 text-[11px] font-semibold rounded-full bg-[#F4CD65] text-[#292524] shadow-xs animate-pulse">
                      {pendingCount}
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 text-[11px] font-medium rounded-full bg-[#FFF7E5] text-[#77715F]">
                      0
                    </span>
                  )}
                </Link>

                {/* 3. Doanh thu & Đơn hàng MoMo */}
                <Link
                  href="/admin/promotions"
                  onClick={onCloseMobile}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-2xl text-sm font-semibold transition-all group ${
                    isPromotionsActive
                      ? "bg-[#FFF1CC] text-[#373523] border border-[#F4CD65]/50 shadow-xs font-bold"
                      : "text-[#77715F] hover:text-[#373523] hover:bg-[#FFF7E5]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <CreditCard
                      className={`w-4 h-4 transition-colors ${
                        isPromotionsActive
                          ? "text-[#DCA936]"
                          : "text-[#77715F] group-hover:text-[#373523]"
                      }`}
                    />
                    <span className="truncate">Doanh thu & Đơn hàng</span>
                  </div>
                  <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isPromotionsActive ? "text-[#373523]" : "text-[#A8A190] group-hover:translate-x-0.5"}`} />
                </Link>

                {/* 4. Cấu hình Gói tin nổi bật */}
                <Link
                  href="/admin/promotion-plans"
                  onClick={onCloseMobile}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-2xl text-sm font-semibold transition-all group ${
                    isPromotionPlansActive
                      ? "bg-[#FFF1CC] text-[#373523] border border-[#F4CD65]/50 shadow-xs font-bold"
                      : "text-[#77715F] hover:text-[#373523] hover:bg-[#FFF7E5]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Sparkles
                      className={`w-4 h-4 transition-colors ${
                        isPromotionPlansActive
                          ? "text-[#DCA936]"
                          : "text-[#77715F] group-hover:text-[#373523]"
                      }`}
                    />
                    <span className="truncate">Gói tin nổi bật</span>
                  </div>
                  <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isPromotionPlansActive ? "text-[#373523]" : "text-[#A8A190] group-hover:translate-x-0.5"}`} />
                </Link>

                {/* 4. Quản lý người dùng */}
                <Link
                  href="/admin/users"
                  onClick={onCloseMobile}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-2xl text-sm font-semibold transition-all group ${
                    isUsersActive
                      ? "bg-[#FFF1CC] text-[#373523] border border-[#F4CD65]/50 shadow-xs font-bold"
                      : "text-[#77715F] hover:text-[#373523] hover:bg-[#FFF7E5]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Users
                      className={`w-4 h-4 transition-colors ${
                        isUsersActive
                          ? "text-[#DCA936]"
                          : "text-[#77715F] group-hover:text-[#373523]"
                      }`}
                    />
                    <span className="truncate">Quản lý người dùng</span>
                  </div>
                  <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isUsersActive ? "text-[#373523]" : "text-[#A8A190] group-hover:translate-x-0.5"}`} />
                </Link>

                {/* 4. Quản lý báo cáo vi phạm */}
                <Link
                  href="/admin/reports"
                  onClick={onCloseMobile}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-2xl text-sm font-semibold transition-all group ${
                    isReportsActive
                      ? "bg-[#FFF1CC] text-[#373523] border border-[#F4CD65]/50 shadow-xs font-bold"
                      : "text-[#77715F] hover:text-[#373523] hover:bg-[#FFF7E5]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <AlertTriangle
                      className={`w-4 h-4 transition-colors ${
                        isReportsActive
                          ? "text-[#DCA936]"
                          : "text-[#77715F] group-hover:text-[#373523]"
                      }`}
                    />
                    <span className="truncate">Quản lý báo cáo</span>
                  </div>
                  <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-rose-100 text-rose-800">
                    2
                  </span>
                </Link>
              </nav>
            </div>

            {/* Quick Switch to Other Workspaces */}
            <div className="pt-2 border-t border-[#EDE5D5]">
              <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-[#77715F] mb-2">
                Lối tắt không gian làm việc
              </p>
              <nav className="space-y-1">
                <Link
                  href="/landlord/dashboard"
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-2xl text-sm font-medium text-[#77715F] hover:text-[#373523] hover:bg-[#FFF7E5] transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <Building2 className="w-4 h-4 text-[#77715F] group-hover:text-[#DCA936]" />
                    <span className="truncate">Kênh Chủ Nhà</span>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-[#A8A190] group-hover:text-[#DCA936]" />
                </Link>

                <Link
                  href="/"
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-2xl text-sm font-medium text-[#77715F] hover:text-[#373523] hover:bg-[#FFF7E5] transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <Home className="w-4 h-4 text-[#77715F] group-hover:text-[#373523]" />
                    <span className="truncate">Sàn Công Khai</span>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-[#A8A190] group-hover:text-[#373523]" />
                </Link>
              </nav>
            </div>
          </div>
        </div>

        {/* Admin Profile Footer */}
        <div className="p-3.5 border-t border-[#EDE5D5] bg-[#FFF7E5]/70 space-y-2.5">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-2xl bg-[#F4CD65] text-[#292524] flex items-center justify-center font-semibold text-xs shadow-xs border-2 border-white">
                {adminInitial}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="text-xs font-semibold text-[#292524] truncate">
                  {adminName}
                </p>
                <UserCheck className="w-3.5 h-3.5 text-[#DCA936] shrink-0" />
              </div>
              <p className="text-[11px] text-[#78716C] font-normal truncate">
                {adminEmail}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-rose-700 bg-rose-50/80 hover:bg-rose-100 border border-rose-200/70 transition-all cursor-pointer group shadow-2xs"
            title="Đăng xuất khỏi hệ thống quản trị"
          >
            <LogOut className="w-3.5 h-3.5 text-rose-600 group-hover:-translate-x-0.5 transition-transform" />
            <span>Đăng xuất Quản trị</span>
          </button>
        </div>
      </aside>
    </>
  );
}

