"use client";

import { 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  Lock, 
  TrendingUp, 
  Award, 
  FileCheck, 
  Clock, 
  Camera, 
  UserCheck 
} from "lucide-react";

interface VerificationOverviewProps {
  onStartVerification: () => void;
}

export function VerificationOverview({ onStartVerification }: VerificationOverviewProps) {
  const benefits = [
    {
      icon: ShieldCheck,
      title: "Huy hiệu Tích Xanh Kiểm Duyệt",
      desc: "Tất cả tin đăng của bạn sẽ tự động gắn huy hiệu 'Chủ nhà đã xác minh KYC', tăng tối đa độ tin cậy.",
      color: "text-emerald-700 bg-emerald-50 border border-emerald-200/80",
    },
    {
      icon: TrendingUp,
      title: "Ưu Tiên Hiển Thị Top Tìm Kiếm",
      desc: "Thuật toán Nestrivo ưu tiên đẩy các phòng của chủ nhà đã xác minh lên trang nhất và mục Nổi Bật.",
      color: "text-blue-700 bg-blue-50 border border-blue-200/80",
    },
    {
      icon: UserCheck,
      title: "Tăng 250% Tỷ Lệ Khách Hỏi Thuê",
      desc: "Người tìm phòng luôn ưu tiên liên hệ chủ nhà minh bạch để an tâm đặt cọc và hẹn lịch xem phòng.",
      color: "text-indigo-700 bg-indigo-50 border border-indigo-200/80",
    },
    {
      icon: FileCheck,
      title: "Bảo Vệ Pháp Lý & Hợp Đồng",
      desc: "Thông tin định danh chính chủ hỗ trợ giải quyết tranh chấp pháp lý và bảo hộ quy trình cho thuê chuẩn mực.",
      color: "text-amber-700 bg-amber-50 border border-amber-200/80",
    },
  ];

  const steps = [
    {
      number: "1",
      title: "Thông tin cá nhân",
      desc: "Nhập họ tên, số CCCD và địa chỉ thường trú chính xác.",
      icon: UserCheck,
    },
    {
      number: "2",
      title: "Chụp ảnh thẻ CCCD",
      desc: "Tải lên 2 mặt ảnh Căn cước công dân rõ nét, không lóa sáng.",
      icon: Camera,
    },
    {
      number: "3",
      title: "Xét duyệt nhanh chóng",
      desc: "Admin Nestrivo kiểm duyệt hồ sơ trong vòng tối đa 24 giờ làm việc.",
      icon: Clock,
    },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Hero Banner - Warm Butter Cream Gradient replacing harsh dark colors */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#FFFDF5] via-[#FFF8E7] to-[#FCEEC2] border border-[#F4CD65]/50 text-[#373523] p-6 sm:p-10 shadow-sm">
        {/* Decorative background glow */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-[#F4CD65]/35 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-16 w-60 h-60 rounded-full bg-[#FFE382]/30 blur-2xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 border border-[#F4CD65] text-[#805B10] text-xs font-bold uppercase tracking-wider shadow-2xs">
            <ShieldCheck className="w-4 h-4 text-[#DCA936]" />
            <span>Tiêu chuẩn PropTech an toàn Nestrivo</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-[#292524] leading-tight">
            Xác minh danh tính để trở thành Chủ nhà Uy tín
          </h2>

          <p className="text-sm sm:text-base text-[#57534E] leading-relaxed max-w-2xl font-normal">
            Định danh điện tử (eKYC) giúp xác thực bạn là chủ sở hữu hợp pháp hoặc người quản lý chính thức của bất động sản. Giúp loại bỏ tin ảo, bảo vệ bạn và người thuê phòng khỏi các rủi ro giả mạo.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={onStartVerification}
              className="px-6 py-3.5 rounded-2xl bg-[#F4CD65] hover:bg-[#ebbf4d] active:bg-[#e0b03b] text-[#292524] font-medium text-sm sm:text-base shadow-xs transition-all flex items-center gap-2 cursor-pointer transform hover:-translate-y-0.5"
            >
              <span>Bắt đầu xác minh ngay</span>
              <ArrowRight className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-xs text-[#77715F] font-semibold">
              <Lock className="w-4 h-4 text-[#805B10]" />
              <span>Chỉ mất khoảng 2–3 phút thao tác</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Key Benefits Grid - Optimized inline icon layout with no wasted empty space */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 px-1">
          <Sparkles className="w-4 h-4 text-[#DCA936]" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">
            Quyền lợi khi hoàn tất xác minh
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {benefits.map((b, i) => {
            const Icon = b.icon;
            return (
              <div
                key={i}
                className="bg-white rounded-2xl border border-slate-200/90 p-5 space-y-2.5 shadow-2xs hover:shadow-xs hover:border-[#F4CD65]/60 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${b.color} group-hover:scale-105 transition-transform shadow-2xs`}>
                    <Icon className="w-4.5 h-4.5" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 leading-snug">
                    {b.title}
                  </h4>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed pl-0.5">
                  {b.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. 3-Step Simple Process Overview */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 space-y-6 shadow-2xs">
        <div className="max-w-xl space-y-1">
          <h3 className="text-base sm:text-lg font-bold text-slate-900">
            Quy trình xác minh 3 bước đơn giản
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            Dữ liệu cá nhân của bạn được mã hóa an toàn theo tiêu chuẩn bảo mật dữ liệu quốc gia và chỉ dùng duy nhất cho mục đích xét duyệt tài khoản.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {steps.map((step, idx) => {
            const StepIcon = step.icon;
            return (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3 relative group hover:border-[#F4CD65] transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-xl bg-[#F4CD65] text-[#292524] font-semibold text-xs flex items-center justify-center shadow-xs">
                    {step.number}
                  </div>
                  <StepIcon className="w-5 h-5 text-slate-400 group-hover:text-[#805B10] transition-colors" />
                </div>
                <h4 className="text-sm font-semibold text-[#292524]">
                  {step.title}
                </h4>
                <p className="text-xs text-[#57534E] leading-relaxed font-normal">
                  {step.desc}
                </p>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA trigger */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <CheckCircle2 className="w-4 h-4 text-[#805B10] shrink-0" />
            <span>Miễn phí 100% · Hỗ trợ thẻ CCCD gắn chip mới nhất</span>
          </div>

          <button
            type="button"
            onClick={onStartVerification}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#F4CD65] hover:bg-[#ebbf4d] active:bg-[#e0b03b] text-[#292524] font-medium text-xs sm:text-sm shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Bắt đầu xác minh danh tính</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

