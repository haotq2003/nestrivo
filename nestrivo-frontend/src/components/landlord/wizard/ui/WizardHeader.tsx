"use client";

import Link from "next/link";
import { ArrowLeft, CheckCircle2, Clock, Save, Menu } from "lucide-react";

interface WizardHeaderProps {
  lastSavedText: string;
  isSaving: boolean;
  onManualSave: () => void;
  onCancelClick: () => void;
  onToggleMobileMenu?: () => void;
}

export function WizardHeader({
  lastSavedText,
  isSaving,
  onManualSave,
  onCancelClick,
  onToggleMobileMenu,
}: WizardHeaderProps) {
  return (
    <header className="h-16 bg-white border-b border-[#EDE5D5] px-4 sm:px-6 lg:px-8 xl:px-10 flex items-center justify-between gap-3 sticky top-0 z-30 shadow-xs">
      {/* Left: Back / Breadcrumbs */}
      <div className="flex items-center gap-3 min-w-0">
        {onToggleMobileMenu && (
          <button
            type="button"
            onClick={onToggleMobileMenu}
            className="p-2 rounded-xl text-[#77715F] hover:text-[#373523] hover:bg-[#FFF7E5] lg:hidden focus:outline-none min-h-[44px] min-w-[44px] flex items-center justify-center shrink-0"
            aria-label="Mở menu điều hướng"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <button
          type="button"
          onClick={onCancelClick}
          className="p-2 rounded-xl text-[#77715F] hover:text-[#373523] hover:bg-[#FFF7E5] transition-colors shrink-0 min-h-[40px] min-w-[40px] flex items-center justify-center"
          title="Quay lại Bảng điều khiển"
          aria-label="Quay lại Bảng điều khiển"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="min-w-0">
          <div className="flex items-center gap-1.5 text-xs text-[#77715F] font-medium">
            <Link
              href="/landlord/dashboard"
              className="hover:text-[#DCA936] hover:underline truncate"
            >
              Bảng điều khiển
            </Link>
            <span>/</span>
            <span className="text-[#292524] font-medium truncate">Đăng tin mới</span>
          </div>
          <h1 className="text-sm sm:text-base font-semibold text-[#292524] truncate">
            Quy trình tạo tin phòng cho thuê
          </h1>
        </div>
      </div>

      {/* Right: Autosave status & Actions */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Autosave badge */}
        <div className="hidden sm:flex items-center gap-1.5 text-xs text-[#77715F] font-medium px-2.5 py-1 rounded-xl bg-[#FFF7E5] border border-[#EDE5D5]">
          {isSaving ? (
            <>
              <Clock className="w-3.5 h-3.5 text-amber-500 animate-spin" />
              <span>Đang lưu...</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-[#DCA936]" />
              <span className="text-[11px]">{lastSavedText || "Đã lưu vào bộ nhớ tạm"}</span>
            </>
          )}
        </div>

        {/* Manual Save Draft Button */}
        <button
          type="button"
          onClick={onManualSave}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 transition-colors min-h-[40px]"
          title="Lưu bản nháp vào trình duyệt này"
        >
          <Save className="w-4 h-4 text-slate-600" />
          <span className="hidden xs:inline">Lưu nháp</span>
        </button>

        {/* Exit Button */}
        <button
          type="button"
          onClick={onCancelClick}
          className="inline-flex items-center px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold text-rose-600 hover:bg-rose-50 transition-colors min-h-[40px]"
        >
          Thoát
        </button>
      </div>
    </header>
  );
}
