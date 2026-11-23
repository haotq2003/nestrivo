"use client";

import { MessageSquare, SearchX, AlertTriangle, RefreshCw, Sparkles, Building2 } from "lucide-react";
import Link from "next/link";

interface InquiryEmptyStateProps {
  mode: "empty" | "filtered-empty" | "error" | "loading";
  searchQuery?: string;
  errorMessage?: string;
  onResetFilter?: () => void;
  onRetry?: () => void;
}

export function InquiryEmptyState({
  mode,
  searchQuery,
  errorMessage,
  onResetFilter,
  onRetry,
}: InquiryEmptyStateProps) {
  // 1. Loading Skeleton
  if (mode === "loading") {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 space-y-4 shadow-2xs animate-pulse">
        <div className="h-5 bg-slate-100 rounded-md w-1/4" />
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 bg-slate-50 rounded-xl border border-slate-100 flex items-center px-4 justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-200" />
                <div className="space-y-1.5">
                  <div className="h-3.5 bg-slate-200 rounded w-28" />
                  <div className="h-2.5 bg-slate-100 rounded w-20" />
                </div>
              </div>
              <div className="hidden sm:block h-3.5 bg-slate-100 rounded w-48" />
              <div className="h-6 bg-slate-200 rounded-lg w-20" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 2. Error State with Honest Retry
  if (mode === "error") {
    return (
      <div className="bg-white rounded-2xl border border-rose-200 p-8 sm:p-12 text-center shadow-2xs space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto shadow-2xs">
          <AlertTriangle className="w-7 h-7" />
        </div>
        <div className="max-w-md mx-auto space-y-1.5">
          <h3 className="text-base font-bold text-slate-900">
            Không thể tải dữ liệu yêu cầu hỏi thuê
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            {errorMessage || "Hệ thống gặp sự cố khi đồng bộ danh sách khách thuê quan tâm. Vui lòng kiểm tra lại kết nối mạng hoặc thử lại sau ít phút."}
          </p>
        </div>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-bold text-xs sm:text-sm shadow-xs transition-all cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Thử tải lại dữ liệu</span>
          </button>
        )}
      </div>
    );
  }

  // 3. Filter-specific Empty State
  if (mode === "filtered-empty") {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/90 p-8 sm:p-12 text-center shadow-2xs space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
          <SearchX className="w-7 h-7" />
        </div>
        <div className="max-w-md mx-auto space-y-1.5">
          <h3 className="text-base font-bold text-slate-900">
            Không tìm thấy yêu cầu phù hợp
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            {searchQuery
              ? `Không có khách thuê nào khớp với từ khóa tìm kiếm "${searchQuery}".`
              : "Không có yêu cầu hỏi thuê nào khớp với các tiêu chí bộ lọc đã chọn."}
          </p>
        </div>
        {onResetFilter && (
          <button
            type="button"
            onClick={onResetFilter}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#F4CD65] hover:bg-[#ebbf4d] text-[#292524] font-medium text-xs sm:text-sm shadow-xs transition-all cursor-pointer"
          >
            <span>Đặt lại toàn bộ bộ lọc</span>
          </button>
        )}
      </div>
    );
  }

  // 4. Primary Empty State (0 Inquiries)
  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 p-8 sm:p-12 text-center shadow-2xs space-y-5">
      <div className="w-16 h-16 rounded-3xl bg-[#FFF1CC] text-[#805B10] flex items-center justify-center mx-auto shadow-2xs">
        <MessageSquare className="w-8 h-8" />
      </div>

      <div className="max-w-md mx-auto space-y-2">
        <h3 className="text-lg font-bold text-slate-900">
          Chưa có yêu cầu hỏi thuê nào
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
          Khi người tìm phòng quan tâm và gửi tin nhắn hoặc số điện thoại liên hệ từ tin đăng của bạn, các yêu cầu sẽ xuất hiện tập trung tại đây.
        </p>
      </div>

      {/* Helpful Tip Box */}
      <div className="max-w-md mx-auto p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-left space-y-2 text-xs text-slate-700">
        <div className="flex items-center gap-2 font-bold text-[#805B10]">
          <Sparkles className="w-4 h-4 text-[#DCA936] shrink-0" />
          <span>Mẹo thu hút khách thuê nhanh chóng:</span>
        </div>
        <ul className="list-disc pl-5 space-y-1 text-slate-600">
          <li>Bổ sung từ 5–8 ảnh chụp thực tế góc rộng, đủ ánh sáng ban ngày.</li>
          <li>Công khai minh bạch tiền điện, nước, internet và phí gửi xe.</li>
          <li>Kích hoạt hiển thị các phòng đang trống trên Bảng điều khiển.</li>
        </ul>
      </div>

      <div className="pt-2">
        <Link
          href="/landlord/dashboard"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#F4CD65] hover:bg-[#ebbf4d] active:bg-[#e0b03b] text-[#292524] font-medium text-xs sm:text-sm shadow-xs transition-all"
        >
          <Building2 className="w-4 h-4" />
          <span>Quay lại Bảng điều khiển tin đăng</span>
        </Link>
      </div>
    </div>
  );
}

