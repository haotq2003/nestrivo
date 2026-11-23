"use client";

import { ShieldCheck, Menu, ArrowLeft, Clock, AlertTriangle, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { LandlordVerificationStatus } from "@/types/verification";

interface VerificationHeaderProps {
  status: LandlordVerificationStatus;
  onToggleMobileMenu: () => void;
}

export function VerificationHeader({
  status,
  onToggleMobileMenu,
}: VerificationHeaderProps) {
  const renderStatusBadge = () => {
    switch (status) {
      case "APPROVED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-300 shadow-2xs">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Đã xác minh KYC (Tích Xanh)</span>
          </span>
        );
      case "PENDING":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200/80">
            <Clock className="w-4 h-4 text-amber-600 animate-spin" />
            <span>Đang chờ duyệt hồ sơ</span>
          </span>
        );
      case "REJECTED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200/80">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            <span>Cần bổ sung / chỉnh sửa</span>
          </span>
        );
      case "NOT_VERIFIED":
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200/80">
            <ShieldAlert className="w-4 h-4 text-slate-500" />
            <span>Chưa xác minh</span>
          </span>
        );
    }
  };

  return (
    <header className="h-18 bg-white border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 xl:px-10 flex items-center justify-between gap-4 sticky top-0 z-30 shadow-2xs">
      {/* Left: Mobile Toggle & Title */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onToggleMobileMenu}
          className="p-2.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 lg:hidden focus:outline-none min-h-[44px] min-w-[44px] flex items-center justify-center shrink-0"
          aria-label="Mở menu điều hướng"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="min-w-0">
          <div className="flex items-center gap-2.5">
            <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-tight truncate">
              Xác minh danh tính chủ nhà
            </h1>
            <div className="hidden sm:inline-block shrink-0">
              {renderStatusBadge()}
            </div>
          </div>
          <p className="text-xs text-slate-500 hidden sm:block truncate mt-0.5">
            Quy trình định danh điện tử eKYC chuẩn PropTech bảo vệ quyền lợi chủ nhà và người thuê phòng.
          </p>
        </div>
      </div>

      {/* Right: Quick actions */}
      <div className="flex items-center gap-2.5 shrink-0">
        <div className="sm:hidden">
          {renderStatusBadge()}
        </div>

        <Link
          href="/landlord/dashboard"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors min-h-[40px]"
        >
          <ArrowLeft className="w-4 h-4 text-slate-500" />
          <span className="hidden sm:inline">Bảng điều khiển</span>
        </Link>
      </div>
    </header>
  );
}

