"use client";

import { Menu, ShieldCheck, User } from "lucide-react";
import Link from "next/link";

interface ProfileHeaderProps {
  onToggleMobileMenu: () => void;
  verificationStatus: "VERIFIED" | "PENDING" | "REJECTED" | "NOT_VERIFIED";
}

export function ProfileHeader({
  onToggleMobileMenu,
  verificationStatus,
}: ProfileHeaderProps) {
  return (
    <header className="h-18 bg-white border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 xl:px-10 flex items-center justify-between gap-4 sticky top-0 z-30 shadow-2xs">
      {/* Left: Mobile hamburger + Title */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleMobileMenu}
          className="p-2.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 lg:hidden focus:outline-none min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label="Mở menu điều hướng"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
              Hồ sơ chủ nhà
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-700">
              <User className="w-3 h-3 text-slate-500" />
              Tài khoản
            </span>
          </div>
          <p className="text-xs text-slate-500 hidden sm:block">
            Quản lý thông tin liên hệ, khu vực cho thuê và trạng thái tài khoản
          </p>
        </div>
      </div>

      {/* Right: KYC Status Badge shortcut */}
      <div className="flex items-center gap-3">
        <Link
          href="/landlord/verification"
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
            verificationStatus === "VERIFIED"
              ? "bg-[#FFF1CC] text-[#805B10] border-[#F4CD65]/40 hover:bg-[#ffe7a3]"
              : verificationStatus === "PENDING"
              ? "bg-amber-50 text-amber-800 border-amber-200/80 hover:bg-amber-100"
              : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
          }`}
          title="Xem chi tiết xác minh danh tính"
        >
          <ShieldCheck
            className={`w-4 h-4 ${
              verificationStatus === "VERIFIED"
                ? "text-[#805B10]"
                : verificationStatus === "PENDING"
                ? "text-amber-600"
                : "text-slate-400"
            }`}
          />
          <span className="hidden xs:inline">
            {verificationStatus === "VERIFIED"
              ? "Đã xác minh KYC"
              : verificationStatus === "PENDING"
              ? "Đang chờ duyệt KYC"
              : "Chưa xác minh"}
          </span>
        </Link>
      </div>
    </header>
  );
}

