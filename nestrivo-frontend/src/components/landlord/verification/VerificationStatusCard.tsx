"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  ShieldCheck, 
  Clock, 
  AlertTriangle, 
  Calendar, 
  User, 
  CreditCard, 
  MapPin, 
  Building2, 
  CheckCircle2, 
  ArrowRight, 
  ExternalLink, 
  Maximize2, 
  RotateCcw,
  Sparkles,
  Info
} from "lucide-react";
import { KycVerificationData } from "@/types/verification";

interface VerificationStatusCardProps {
  data: KycVerificationData;
  onStartResubmit: () => void;
}

export function VerificationStatusCard({
  data,
  onStartResubmit,
}: VerificationStatusCardProps) {
  const [zoomImage, setZoomImage] = useState<{ src: string; title: string } | null>(null);

  const formatDate = (isoString?: string | null) => {
    if (!isoString) return "Chưa xác định";
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return isoString;
    }
  };

  const maskIdNumber = (idStr: string) => {
    if (!idStr || idStr.length < 8) return idStr;
    return idStr.slice(0, 6) + "******" + idStr.slice(-3);
  };

  // 1. APPROVED (VERIFIED) State
  if (data.status === "APPROVED") {
    return (
      <div className="space-y-6">
        {/* Hero Approved Banner - Prestige Emerald Green Verified Aesthetics */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-emerald-800 via-emerald-900 to-teal-950 text-white space-y-4 shadow-xl border border-emerald-600/40 relative overflow-hidden">
          {/* Subtle glowing ambient lights */}
          <div className="absolute right-0 top-0 -mr-16 -mt-16 w-72 h-72 rounded-full bg-emerald-400/20 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 -mb-16 w-56 h-56 rounded-full bg-teal-300/15 blur-2xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white text-emerald-700 flex items-center justify-center shrink-0 shadow-lg ring-4 ring-emerald-500/25">
                <ShieldCheck className="w-8 h-8 text-emerald-600" />
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-400/20 text-emerald-200 border border-emerald-300/30 text-[11px] font-bold uppercase tracking-wider mb-1.5 backdrop-blur-xs">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Đã duyệt chính thức · Tích Xanh Chuẩn PropTech</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-white">
                  Tài khoản Chủ nhà đã xác minh KYC
                </h2>
                <p className="text-xs sm:text-sm text-emerald-100/90 mt-0.5">
                  Phê duyệt lúc: {formatDate(data.approvedAt)} · Hệ thống kiểm duyệt Nestrivo
                </p>
              </div>
            </div>

            <Link
              href="/landlord/dashboard"
              className="px-5 py-2.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 active:bg-emerald-500 text-emerald-950 font-medium text-xs sm:text-sm shadow-xs transition-all shrink-0 flex items-center gap-2"
            >
              <span>Xem Bảng điều khiển</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Verified Profile Card */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 space-y-6 shadow-2xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-emerald-600" />
              <h3 className="text-base font-bold text-slate-900">
                Thông tin định danh đã xác thực
              </h3>
            </div>
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>CCCD Gắn Chip Hợp Pháp</span>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 text-sm">
            <div className="space-y-1">
              <div className="text-xs text-slate-500 font-semibold">Họ và tên chủ sở hữu</div>
              <div className="font-bold text-slate-900 text-base">{data.personalInfo.fullName}</div>
            </div>

            <div className="space-y-1">
              <div className="text-xs text-slate-500 font-semibold">Số Căn cước công dân</div>
              <div className="font-bold text-slate-900 font-mono tracking-wider">
                {maskIdNumber(data.personalInfo.idNumber)}
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-xs text-slate-500 font-semibold">Ngày sinh & Giới tính</div>
              <div className="font-semibold text-slate-800">
                {data.personalInfo.dateOfBirth} · {data.personalInfo.gender === "MALE" ? "Nam" : "Nữ"}
              </div>
            </div>

            <div className="space-y-1 sm:col-span-2">
              <div className="text-xs text-slate-500 font-semibold">Địa chỉ thường trú</div>
              <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                <span>{data.personalInfo.permanentAddress}</span>
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-xs text-slate-500 font-semibold">Nơi cấp & Ngày cấp</div>
              <div className="font-semibold text-slate-800">
                {data.personalInfo.issueDate} · {data.personalInfo.issuingAuthority}
              </div>
            </div>
          </div>

          {/* Document Previews */}
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Tài liệu Căn cước công dân đã đối chiếu
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {data.documents.frontImage && (
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
                    <div className="flex items-center gap-2">
                      <span>Mặt trước CCCD</span>
                      <span className="inline-flex items-center gap-1 text-[10.5px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Hợp lệ</span>
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setZoomImage({
                          src: data.documents.frontImage!,
                          title: "Mặt trước Căn cước công dân",
                        })
                      }
                      className="text-emerald-700 hover:text-emerald-900 hover:underline flex items-center gap-1 font-medium"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                      <span>Xem phóng to</span>
                    </button>
                  </div>
                  <div className="relative aspect-[16/10] bg-slate-200 rounded-xl overflow-hidden border border-slate-200">
                    <img
                      src={data.documents.frontImage}
                      alt="CCCD mặt trước"
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
              )}

              {data.documents.backImage && (
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
                    <div className="flex items-center gap-2">
                      <span>Mặt sau CCCD</span>
                      <span className="inline-flex items-center gap-1 text-[10.5px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Hợp lệ</span>
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setZoomImage({
                          src: data.documents.backImage!,
                          title: "Mặt sau Căn cước công dân",
                        })
                      }
                      className="text-emerald-700 hover:text-emerald-900 hover:underline flex items-center gap-1 font-medium"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                      <span>Xem phóng to</span>
                    </button>
                  </div>
                  <div className="relative aspect-[16/10] bg-slate-200 rounded-xl overflow-hidden border border-slate-200">
                    <img
                      src={data.documents.backImage}
                      alt="CCCD mặt sau"
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Zoom Lightbox Modal */}
        {zoomImage && (
          <div
            className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
            onClick={() => setZoomImage(null)}
          >
            <div className="relative max-w-3xl w-full bg-slate-900 rounded-2xl p-4 space-y-3 shadow-2xl">
              <div className="flex items-center justify-between text-white text-sm font-bold">
                <span>{zoomImage.title}</span>
                <button
                  type="button"
                  onClick={() => setZoomImage(null)}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-xs rounded-lg text-slate-300 hover:text-white"
                >
                  Đóng (ESC)
                </button>
              </div>
              <div className="aspect-[16/10] bg-slate-950 rounded-xl overflow-hidden flex items-center justify-center">
                <img
                  src={zoomImage.src}
                  alt={zoomImage.title}
                  className="max-h-[75vh] w-full object-contain"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // 2. PENDING State
  if (data.status === "PENDING") {
    return (
      <div className="space-y-6">
        {/* Pending Notice Box */}
        <div className="p-6 sm:p-8 rounded-3xl bg-amber-50/90 border border-amber-200/90 space-y-4 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <Clock className="w-6 h-6 animate-spin" />
            </div>
            <div className="space-y-1 flex-1">
              <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-200/70 text-amber-900 text-[11px] font-bold uppercase tracking-wider">
                Đang xử lý hồ sơ
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-amber-950">
                Hồ sơ xác minh đang chờ Admin xét duyệt
              </h2>
              <p className="text-xs sm:text-sm text-amber-900/90 leading-relaxed font-medium">
                Hồ sơ định danh của bạn đã được gửi thành công vào lúc <strong>{formatDate(data.submittedAt)}</strong>. Đội ngũ kiểm duyệt viên Nestrivo đang đối chiếu dữ liệu thẻ Căn cước công dân trong vòng tối đa <strong>24 giờ làm việc</strong>.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white border border-amber-200/80 text-xs text-amber-900 flex items-center gap-2">
            <Info className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              Để đảm bảo tính nhất quán của quá trình kiểm duyệt, hồ sơ được khóa tạm thời và không thể chỉnh sửa trong thời gian chờ xét duyệt.
            </span>
          </div>
        </div>

        {/* Read-only Submission Snapshot */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 space-y-5 shadow-2xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h3 className="text-base font-bold text-slate-900">
              Tóm tắt thông tin đã gửi duyệt
            </h3>
            <span className="text-xs font-semibold text-slate-500">
              Mã hồ sơ: #{data.personalInfo.idNumber.slice(-6) || "KYC-NEW"}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs sm:text-sm">
            <div>
              <span className="text-slate-500 block text-xs">Họ và tên:</span>
              <strong className="text-slate-900">{data.personalInfo.fullName}</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-xs">Số CCCD:</span>
              <strong className="text-slate-900 font-mono">{maskIdNumber(data.personalInfo.idNumber)}</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-xs">Ngày sinh:</span>
              <strong className="text-slate-900">{data.personalInfo.dateOfBirth}</strong>
            </div>
            <div className="sm:col-span-2">
              <span className="text-slate-500 block text-xs">Địa chỉ thường trú:</span>
              <strong className="text-slate-900">{data.personalInfo.permanentAddress}</strong>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 3. REJECTED State
  if (data.status === "REJECTED") {
    return (
      <div className="space-y-6">
        {/* Rejection Alert Box */}
        <div className="p-6 sm:p-8 rounded-3xl bg-rose-50 border border-rose-200/90 space-y-4 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="space-y-1.5 flex-1">
              <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-200 text-rose-900 text-[11px] font-bold uppercase tracking-wider">
                Yêu cầu chỉnh sửa
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-rose-950">
                Hồ sơ xác minh cần được cập nhật lại
              </h2>
              <p className="text-xs sm:text-sm text-rose-900/90 leading-relaxed font-medium">
                Kiểm duyệt viên đã phản hồi vào lúc <strong>{formatDate(data.rejectedAt)}</strong> với lý do cụ thể sau:
              </p>
            </div>
          </div>

          {/* Admin Rejection Reason Callout */}
          <div className="p-4 rounded-2xl bg-white border border-rose-200/80 text-xs sm:text-sm text-rose-950 font-semibold space-y-1.5 shadow-2xs">
            <div className="text-[11px] font-bold uppercase tracking-wider text-rose-700">
              Lý do từ chối từ Admin Nestrivo:
            </div>
            <div className="p-3 rounded-xl bg-rose-50/60 border border-rose-100 text-rose-900 font-medium leading-relaxed">
              &ldquo;{data.rejectionReason}&rdquo;
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
            <button
              type="button"
              onClick={onStartResubmit}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-bold text-xs sm:text-sm shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Cập nhật hồ sơ & Gửi duyệt lại ngay</span>
            </button>
            <span className="text-xs text-rose-700 font-medium">
              Thông tin đã nhập trước đó sẽ được giữ nguyên để bạn dễ dàng sửa đổi.
            </span>
          </div>
        </div>

        {/* Highlighted problematic items */}
        {data.rejectedFields && data.rejectedFields.length > 0 && (
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 space-y-3 shadow-2xs">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">
              Các mục cần lưu ý chụp lại hoặc sửa đổi:
            </h3>
            <ul className="list-disc pl-5 text-xs sm:text-sm text-slate-600 space-y-1">
              {data.rejectedFields.includes("documents.backImage") && (
                <li className="text-rose-700 font-semibold">
                  Ảnh mặt sau thẻ Căn cước công dân (Chụp thẳng góc, đủ ánh sáng, không lóa mờ mã vạch hoặc vân tay).
                </li>
              )}
              {data.rejectedFields.includes("documents.frontImage") && (
                <li className="text-rose-700 font-semibold">
                  Ảnh mặt trước thẻ Căn cước công dân (Chụp rõ nét khuôn mặt và 12 chữ số CCCD).
                </li>
              )}
            </ul>
          </div>
        )}
      </div>
    );
  }

  return null;
}

