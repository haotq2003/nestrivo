"use client";

import Link from "next/link";
import { CheckCircle2, Clock, ShieldCheck, ArrowRight, Building2, BellRing } from "lucide-react";

interface Step4ResultSuccessProps {
  onReturnToOverview: () => void;
}

export function Step4ResultSuccess({ onReturnToOverview }: Step4ResultSuccessProps) {
  return (
    <div className="text-center py-6 sm:py-10 space-y-6 max-w-xl mx-auto">
      {/* Success Icon */}
      <div className="w-20 h-20 rounded-3xl bg-[#FFF1CC] text-[#805B10] flex items-center justify-center mx-auto shadow-md">
        <CheckCircle2 className="w-10 h-10" />
      </div>

      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF1CC] text-[#805B10] text-xs font-bold border border-[#F4CD65]/40">
          <ShieldCheck className="w-3.5 h-3.5 text-[#805B10]" />
          <span>Hồ sơ đã được tiếp nhận</span>
        </div>

        <h3 className="text-2xl sm:text-3xl font-bold text-[#292524] tracking-tight">
          Nộp hồ sơ xác minh thành công!
        </h3>

        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-md mx-auto">
          Cảm ơn bạn đã hoàn tất quy trình định danh điện tử eKYC. Hồ sơ của bạn đã được chuyển đến bộ phận kiểm duyệt viên của Nestrivo.
        </p>
      </div>

      {/* Processing Notice Box */}
      <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/90 text-left space-y-3 shadow-2xs">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700">
          <Clock className="w-4 h-4 text-[#DCA936]" />
          <span>Thông tin xét duyệt hồ sơ:</span>
        </div>

        <div className="space-y-2 text-xs text-slate-600 leading-relaxed">
          <div className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#DCA936] mt-1.5 shrink-0" />
            <span>
              <strong>Thời gian xét duyệt:</strong> Tối đa 24 giờ làm việc kể từ thời điểm gửi hồ sơ (thường chỉ mất từ 2–4 giờ trong giờ hành chính).
            </span>
          </div>

          <div className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#DCA936] mt-1.5 shrink-0" />
            <span>
              <strong>Thông báo kết quả:</strong> Hệ thống sẽ tự động cập nhật huy hiệu Tích Xanh KYC trên trang Quản trị và toàn bộ các tin đăng của bạn ngay khi được phê duyệt.
            </span>
          </div>

          <div className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#DCA936] mt-1.5 shrink-0" />
            <span>
              <strong>Trường hợp cần bổ sung:</strong> Nếu ảnh chụp mờ hoặc thông tin chưa trùng khớp, kiểm duyệt viên sẽ ghi chú chi tiết lý do để bạn chụp lại ảnh nhanh chóng.
            </span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
        <button
          type="button"
          onClick={onReturnToOverview}
          className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#F4CD65] hover:bg-[#ebbf4d] active:bg-[#e0b03b] text-[#292524] font-medium text-xs sm:text-sm shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>Xem trạng thái hồ sơ</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <Link
          href="/landlord/dashboard"
          className="w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs sm:text-sm transition-colors flex items-center justify-center gap-2"
        >
          <Building2 className="w-4 h-4 text-slate-500" />
          <span>Về Bảng điều khiển</span>
        </Link>
      </div>
    </div>
  );
}

