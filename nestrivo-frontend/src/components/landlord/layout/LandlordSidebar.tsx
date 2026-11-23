"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { 
  Building2, 
  LayoutDashboard, 
  MessageSquare, 
  ShieldCheck, 
  ExternalLink,
  ChevronRight,
  Home,
  UserCheck,
  User,
  Clock,
  AlertTriangle,
  CheckCircle2,
  LogOut
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { getLocalUserKyc } from "@/service/verification.service";
import { fetchLandlordInquiryStats } from "@/service/inquiry.service";

interface LandlordSidebarProps {
  activeTab?: string;
  inquiriesCount?: number;
  isOpenOnMobile?: boolean;
  onCloseMobile?: () => void;
}

export function LandlordSidebar({
  activeTab,
  inquiriesCount,
  isOpenOnMobile = false,
  onCloseMobile,
}: LandlordSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [localKycStatus, setLocalKycStatus] = useState<string | null>(null);
  const [livePendingInquiries, setLivePendingInquiries] = useState<number>(0);

  const handleLogout = () => {
    logout();
    if (onCloseMobile) onCloseMobile();
    router.push("/login");
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = getLocalUserKyc(user?.id);
      if (stored?.status) {
        setLocalKycStatus(stored.status);
      }
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) {
      fetchLandlordInquiryStats()
        .then((stats) => {
          setLivePendingInquiries(stats.pending || 0);
        })
        .catch(() => {});
    }
  }, [user?.id]);

  const effectiveInquiriesCount = inquiriesCount !== undefined ? inquiriesCount : livePendingInquiries;

  // Compute live verification status from User and Local Storage
  const rawStatus = user?.landlordProfile?.verificationStatus || localKycStatus;
  const isVerified = rawStatus === "VERIFIED" || rawStatus === "APPROVED";
  const isPending = rawStatus === "PENDING";
  const isRejected = rawStatus === "REJECTED";

  const landlordName = user?.landlordProfile?.displayName || user?.fullName || "Chủ nhà";
  const initialLetter = landlordName.charAt(0).toUpperCase() || "C";

  const isOverviewActive =
    activeTab === "listings" ||
    pathname === "/landlord" ||
    pathname === "/landlord/dashboard" ||
    pathname.startsWith("/landlord/listings");
  const isInquiriesActive =
    activeTab === "inquiries" ||
    pathname === "/landlord/inquiries" ||
    pathname.startsWith("/landlord/inquiries");
  const isVerificationActive =
    activeTab === "verification" ||
    pathname === "/landlord/verification" ||
    pathname.startsWith("/landlord/verification");
  const isProfileActive =
    activeTab === "profile" ||
    pathname === "/landlord/profile" ||
    pathname.startsWith("/landlord/profile");
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
        className={`fixed top-0 bottom-0 left-0 z-50 w-[260px] bg-white border-r border-slate-200/90 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpenOnMobile ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col flex-1 overflow-y-auto">
          {/* Brand Header */}
          <div className="h-18 px-5 border-b border-[#EDE5D5] flex items-center justify-between">
            <Link href="/landlord/dashboard" className="flex items-center gap-2.5 group">
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
                <span className="text-[10px] font-medium text-[#805B10] uppercase tracking-wider -mt-0.5">
                  Kênh Chủ Nhà
                </span>
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1 flex-1">
            <div className="px-3 pt-2 pb-1 text-[11px] font-medium uppercase tracking-wider text-[#78716C]">
              Quản trị cho thuê
            </div>

            <Link
              href="/landlord/dashboard"
              onClick={onCloseMobile}
              className={`flex items-center justify-between px-3 py-2.5 rounded-2xl text-sm font-semibold transition-all gap-2 ${
                isOverviewActive
                  ? "bg-[#FFF1CC] text-[#373523] font-bold border border-[#F4CD65]/50 shadow-xs"
                  : "text-[#77715F] hover:text-[#373523] hover:bg-[#FFF7E5]"
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <LayoutDashboard className={`w-4 h-4 shrink-0 ${isOverviewActive ? "text-[#DCA936]" : "text-[#77715F]"}`} />
                <span className="whitespace-nowrap">Tổng quan & Tin đăng</span>
              </div>
            </Link>

            <Link
              href="/landlord/inquiries"
              onClick={onCloseMobile}
              className={`flex items-center justify-between px-3 py-2.5 rounded-2xl text-sm transition-all gap-2 ${
                isInquiriesActive
                  ? "bg-[#FFF1CC] text-[#373523] font-bold border border-[#F4CD65]/50 shadow-xs"
                  : "text-[#77715F] hover:text-[#373523] hover:bg-[#FFF7E5] font-medium"
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <MessageSquare
                  className={`w-4 h-4 shrink-0 ${
                    isInquiriesActive ? "text-[#DCA936]" : "text-[#77715F]"
                  }`}
                />
                <span className="whitespace-nowrap">Yêu cầu hỏi thuê</span>
              </div>
              {effectiveInquiriesCount > 0 && (
                <span
                  className={`ml-auto shrink-0 px-2 py-0.5 text-xs font-semibold rounded-full tabular-nums ${
                    isInquiriesActive
                      ? "bg-[#F4CD65] text-[#292524]"
                      : "bg-[#FFF1CC] text-[#805B10] border border-[#F4CD65]/40"
                  }`}
                >
                  {effectiveInquiriesCount}
                </span>
              )}
            </Link>

            <Link
              href="/landlord/verification"
              onClick={onCloseMobile}
              className={`flex items-center justify-between px-3 py-2.5 rounded-2xl text-sm transition-all gap-2 ${
                isVerificationActive
                  ? "bg-[#FFF1CC] text-[#373523] font-bold border border-[#F4CD65]/50 shadow-xs"
                  : "text-[#77715F] hover:text-[#373523] hover:bg-[#FFF7E5] font-medium"
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <ShieldCheck
                  className={`w-4 h-4 shrink-0 ${
                    isVerificationActive
                      ? "text-[#DCA936]"
                      : isVerified
                      ? "text-emerald-600"
                      : "text-[#77715F]"
                  }`}
                />
                <span className="whitespace-nowrap text-[13.5px]">Xác minh danh tính</span>
              </div>
              {isVerified ? (
                <span className="ml-auto shrink-0 text-[10.5px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md border border-emerald-300 whitespace-nowrap">
                  Đã duyệt
                </span>
              ) : isPending ? (
                <span className="ml-auto shrink-0 text-[10.5px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md border border-amber-300 whitespace-nowrap">
                  Chờ duyệt
                </span>
              ) : isRejected ? (
                <span className="ml-auto shrink-0 text-[10.5px] font-bold text-rose-800 bg-rose-100 px-2 py-0.5 rounded-md border border-rose-300 whitespace-nowrap">
                  Cần nộp lại
                </span>
              ) : (
                <span className="ml-auto shrink-0 text-[10.5px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200 whitespace-nowrap">
                  Chưa duyệt
                </span>
              )}
            </Link>

            <Link
              href="/landlord/profile"
              onClick={onCloseMobile}
              className={`flex items-center justify-between px-3 py-2.5 rounded-2xl text-sm transition-all gap-2 ${
                isProfileActive
                  ? "bg-[#FFF1CC] text-[#373523] font-bold border border-[#F4CD65]/50 shadow-xs"
                  : "text-[#77715F] hover:text-[#373523] hover:bg-[#FFF7E5] font-medium"
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <User
                  className={`w-4 h-4 shrink-0 ${
                    isProfileActive ? "text-[#DCA936]" : "text-[#77715F]"
                  }`}
                />
                <span className="whitespace-nowrap text-[13.5px]">Hồ sơ chủ nhà</span>
              </div>
            </Link>

            <div className="pt-3 mt-3 border-t border-[#EDE5D5]">
              <Link
                href="/"
                className="flex items-center justify-between px-3 py-2.5 rounded-2xl text-[13px] sm:text-sm font-medium text-[#77715F] hover:text-[#373523] hover:bg-[#FFF7E5] transition-colors group gap-2"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Home className="w-4 h-4 text-[#A8A190] group-hover:text-[#DCA936] shrink-0" />
                  <span className="whitespace-nowrap">Về Trang Chủ</span>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-[#A8A190] group-hover:text-[#DCA936] shrink-0 ml-auto" />
              </Link>
            </div>
          </nav>
        </div>

        {/* Landlord Profile Footer */}
        <div className="p-3 border-t border-[#EDE5D5] bg-[#FFF7E5]/70 space-y-2">
          <Link
            href="/landlord/profile"
            onClick={onCloseMobile}
            className={`p-2.5 rounded-2xl border flex items-center justify-between gap-2.5 transition-all group ${
              isProfileActive
                ? "bg-[#FFF1CC] border-[#F4CD65] ring-1 ring-[#F4CD65]/40"
                : "bg-white border-[#EDE5D5] hover:border-[#DCA936] hover:shadow-xs"
            }`}
            title="Xem & chỉnh sửa hồ sơ chủ nhà"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-[#F4CD65] text-[#292524] font-semibold text-sm flex items-center justify-center shrink-0 shadow-xs relative">
                {initialLetter}
                {isVerified && (
                  <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center shadow-2xs">
                    <CheckCircle2 className="w-2.5 h-2.5 text-white" />
                  </span>
                )}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-semibold text-[#292524] truncate group-hover:text-[#DCA936] transition-colors">
                  {landlordName}
                </div>
                {isVerified ? (
                  <div className="flex items-center gap-1 text-[11px] font-medium text-emerald-700">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                    <span className="truncate">Đã xác minh KYC</span>
                  </div>
                ) : isPending ? (
                  <div className="flex items-center gap-1 text-[11px] font-semibold text-amber-700">
                    <Clock className="w-3 h-3 text-amber-600 shrink-0" />
                    <span className="truncate">Chờ duyệt KYC</span>
                  </div>
                ) : isRejected ? (
                  <div className="flex items-center gap-1 text-[11px] font-semibold text-rose-700">
                    <AlertTriangle className="w-3 h-3 text-rose-600 shrink-0" />
                    <span className="truncate">Cần nộp lại KYC</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-[11px] font-medium text-slate-500">
                    <User className="w-3 h-3 text-slate-400 shrink-0" />
                    <span className="truncate">Chưa xác minh KYC</span>
                  </div>
                )}
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#A8A190] group-hover:text-[#DCA936] shrink-0" />
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-rose-700 bg-rose-50/80 hover:bg-rose-100 border border-rose-200/70 transition-all cursor-pointer group shadow-2xs"
            title="Đăng xuất khỏi tài khoản chủ nhà"
          >
            <LogOut className="w-3.5 h-3.5 text-rose-600 group-hover:-translate-x-0.5 transition-transform" />
            <span>Đăng xuất tài khoản</span>
          </button>
        </div>
      </aside>
    </>
  );
}
