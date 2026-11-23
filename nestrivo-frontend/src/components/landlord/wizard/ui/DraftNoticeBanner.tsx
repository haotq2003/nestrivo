"use client";

import { CheckCircle2, X } from "lucide-react";

interface DraftNoticeBannerProps {
  isOpen: boolean;
  onReset: () => void;
  onDismiss: () => void;
}

export function DraftNoticeBanner({ isOpen, onReset, onDismiss }: DraftNoticeBannerProps) {
  if (!isOpen) return null;

  return (
    <div className="p-3.5 rounded-2xl bg-[#FFF1CC] border border-[#F4CD65]/40 flex items-center justify-between gap-3 text-xs text-[#5A450C] shadow-xs">
      <div className="flex items-center gap-2.5">
        <CheckCircle2 className="w-4 h-4 text-[#DCA936] shrink-0" />
        <span>
          Đã khôi phục bản nháp chưa hoàn thành từ phiên làm việc trước đó của bạn.
        </span>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={onReset}
          className="font-bold text-rose-600 hover:text-rose-700 hover:underline"
        >
          Bắt đầu lại
        </button>
        <button
          type="button"
          onClick={onDismiss}
          className="text-slate-400 hover:text-slate-700"
          aria-label="Đóng thông báo"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
