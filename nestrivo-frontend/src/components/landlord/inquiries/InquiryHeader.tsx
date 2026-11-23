"use client";

import { Search, Menu, Building2, PlusCircle, MessageSquare } from "lucide-react";
import Link from "next/link";
import { NotificationBell } from "@/components/layout/NotificationBell";

interface InquiryHeaderProps {
  totalCount: number;
  searchQuery: string;
  onSearchChange: (val: string) => void;
  onToggleMobileMenu: () => void;
}

export function InquiryHeader({
  totalCount,
  searchQuery,
  onSearchChange,
  onToggleMobileMenu,
}: InquiryHeaderProps) {
  return (
    <header className="h-18 bg-white border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 xl:px-10 flex items-center justify-between gap-4 sticky top-0 z-30 shadow-2xs">
      {/* Left: Mobile Menu Toggle + Title & Description */}
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
          <div className="flex items-center gap-2">
            <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-tight truncate">
              Yêu cầu hỏi thuê
            </h1>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[#FFF1CC] text-[#805B10] tabular-nums shrink-0">
              {totalCount}
            </span>
          </div>
          <p className="text-xs text-slate-500 hidden sm:block truncate mt-0.5">
            Theo dõi và quản lý những khách thuê đang quan tâm đến phòng của bạn.
          </p>
        </div>
      </div>

      {/* Right: Quick Search Box & Quick Navigation */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="relative hidden md:block w-64 lg:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Tìm theo tên, SĐT..."
            className="w-full pl-9 pr-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#F4CD65] focus:bg-white transition-all min-h-[40px]"
          />
        </div>

        {/* Notification Bell */}
        <NotificationBell />

        <Link
          href="/landlord/listings/new"
          className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-2.5 rounded-xl bg-[#F4CD65] hover:bg-[#ebbf4d] active:bg-[#e0b03b] text-[#292524] font-medium text-xs sm:text-sm shadow-xs transition-all min-h-[44px] shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span className="hidden sm:inline">Đăng tin mới</span>
        </Link>
      </div>
    </header>
  );
}

