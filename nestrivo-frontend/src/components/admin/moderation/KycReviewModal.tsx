"use client";

import { useState } from "react";
import { 
  X, 
  ShieldCheck, 
  User, 
  CreditCard, 
  MapPin, 
  Calendar, 
  Building, 
  Maximize2, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  RefreshCw 
} from "lucide-react";
import { AdminKycVerificationItem } from "@/service/admin.service";

interface KycReviewModalProps {
  isOpen: boolean;
  item: AdminKycVerificationItem | null;
  onClose: () => void;
  onApprove: (userId: string) => Promise<void>;
  onRejectOpen: (item: AdminKycVerificationItem) => void;
  isLoading?: boolean;
}

export function KycReviewModal({
  isOpen,
  item,
  onClose,
  onApprove,
  onRejectOpen,
  isLoading = false,
}: KycReviewModalProps) {
  const [zoomImage, setZoomImage] = useState<{ src: string; title: string } | null>(null);

  if (!isOpen || !item) return null;

  const info = item.kycDetails?.personalInfo;
  const docs = item.kycDetails?.documents;

  const formatDate = (isoStr?: string | null) => {
    if (!isoStr) return "Chưa xác định";
    try {
      return new Date(isoStr).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return isoStr;
    }
  };

  return (
    <>
      <div 
        className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-200"
        onClick={onClose}
      >
        <div 
          className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto flex flex-col max-h-[92vh]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-amber-50/50 via-white to-transparent">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#FFF1CC] text-[#805B10] flex items-center justify-center shrink-0 shadow-xs">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base sm:text-lg font-semibold text-[#292524] leading-tight">
                    Hồ sơ eKYC: {info?.fullName || item.user.fullName}
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                    Chờ duyệt
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Nộp lúc: {formatDate(item.submittedAt)} · Email: {item.user.email}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              aria-label="Đóng"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Body: Two Columns (Declared Info vs CCCD Photos) */}
          <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
            {/* 1. Declared Legal Information */}
            <div className="bg-slate-50/80 rounded-2xl border border-slate-200/90 p-4 sm:p-5 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wider">
                <User className="w-4 h-4 text-[#DCA936]" />
                <span>1. Thông tin cá nhân người đăng ký</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 text-xs sm:text-sm">
                <div>
                  <span className="text-slate-500 block text-xs">Họ và tên khai báo:</span>
                  <strong className="text-slate-900 text-sm font-bold">
                    {info?.fullName || item.user.fullName}
                  </strong>
                </div>

                <div>
                  <span className="text-slate-500 block text-xs">Số CCCD (12 chữ số):</span>
                  <strong className="text-slate-900 font-mono text-sm sm:text-base font-semibold tracking-wider text-[#805B10]">
                    {info?.idNumber || "Chưa có"}
                  </strong>
                </div>

                <div>
                  <span className="text-slate-500 block text-xs">Ngày sinh & Giới tính:</span>
                  <strong className="text-slate-900">
                    {info?.dateOfBirth || "N/A"} · {info?.gender === "MALE" ? "Nam" : info?.gender === "FEMALE" ? "Nữ" : "Khác"}
                  </strong>
                </div>

                <div className="sm:col-span-2">
                  <span className="text-slate-500 block text-xs">Địa chỉ thường trú:</span>
                  <strong className="text-slate-900 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{info?.permanentAddress || "Chưa cung cấp"}</span>
                  </strong>
                </div>

                <div>
                  <span className="text-slate-500 block text-xs">Số điện thoại liên hệ:</span>
                  <strong className="text-slate-900 font-mono">
                    {item.user.phoneNumber || "Chưa cập nhật"}
                  </strong>
                </div>

                <div className="sm:col-span-3">
                  <span className="text-slate-500 block text-xs">Cơ quan cấp & Ngày cấp:</span>
                  <strong className="text-slate-800">
                    {info?.issueDate ? `${info.issueDate} · ` : ""}{info?.issuingAuthority || "Cục Cảnh sát QLHC về TTXH"}
                  </strong>
                </div>
              </div>
            </div>

            {/* 2. Photo Evidence from Cloudinary */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wider">
                  <CreditCard className="w-4 h-4 text-[#DCA936]" />
                  <span>2. Ảnh chụp Căn cước công dân gốc</span>
                </div>
                <span className="text-[11px] text-slate-500 font-medium">
                  Nhấp vào ảnh để phóng to đối chiếu
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Front Image */}
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <span>Mặt trước Căn cước</span>
                    {docs?.frontImage && (
                      <button
                        type="button"
                        onClick={() =>
                          setZoomImage({
                            src: docs.frontImage!,
                            title: `Mặt trước CCCD - ${info?.fullName || item.user.fullName}`,
                          })
                        }
                        className="text-[#805B10] hover:underline flex items-center gap-1 text-[11px] cursor-pointer"
                      >
                        <Maximize2 className="w-3 h-3" />
                        <span>Phóng to</span>
                      </button>
                    )}
                  </div>

                  <div 
                    onClick={() =>
                      docs?.frontImage &&
                      setZoomImage({
                        src: docs.frontImage,
                        title: `Mặt trước CCCD - ${info?.fullName || item.user.fullName}`,
                      })
                    }
                    className="aspect-[16/10] bg-slate-200 rounded-xl overflow-hidden border border-slate-300 relative group cursor-pointer"
                  >
                    {docs?.frontImage ? (
                      <>
                        <img
                          src={docs.frontImage}
                          alt="Mặt trước CCCD"
                          className="w-full h-full object-contain group-hover:scale-102 transition-transform duration-200"
                        />
                        <div className="absolute inset-0 bg-slate-900/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1.5">
                          <Maximize2 className="w-4 h-4" />
                          <span>Xem chi tiết</span>
                        </div>
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-slate-400">
                        Chưa có ảnh mặt trước
                      </div>
                    )}
                  </div>
                </div>

                {/* Back Image */}
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <span>Mặt sau Căn cước</span>
                    {docs?.backImage && (
                      <button
                        type="button"
                        onClick={() =>
                          setZoomImage({
                            src: docs.backImage!,
                            title: `Mặt sau CCCD - ${info?.fullName || item.user.fullName}`,
                          })
                        }
                        className="text-[#805B10] hover:underline flex items-center gap-1 text-[11px] cursor-pointer"
                      >
                        <Maximize2 className="w-3 h-3" />
                        <span>Phóng to</span>
                      </button>
                    )}
                  </div>

                  <div 
                    onClick={() =>
                      docs?.backImage &&
                      setZoomImage({
                        src: docs.backImage,
                        title: `Mặt sau CCCD - ${info?.fullName || item.user.fullName}`,
                      })
                    }
                    className="aspect-[16/10] bg-slate-200 rounded-xl overflow-hidden border border-slate-300 relative group cursor-pointer"
                  >
                    {docs?.backImage ? (
                      <>
                        <img
                          src={docs.backImage}
                          alt="Mặt sau CCCD"
                          className="w-full h-full object-contain group-hover:scale-102 transition-transform duration-200"
                        />
                        <div className="absolute inset-0 bg-slate-900/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1.5">
                          <Maximize2 className="w-4 h-4" />
                          <span>Xem chi tiết</span>
                        </div>
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-slate-400">
                        Chưa có ảnh mặt sau
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Decision Actions */}
          <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              Đóng lại
            </button>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => onRejectOpen(item)}
                disabled={isLoading}
                className="px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <AlertTriangle className="w-4 h-4" />
                <span>Từ chối hồ sơ</span>
              </button>

              <button
                type="button"
                onClick={() => onApprove(item.userId)}
                disabled={isLoading}
                className="px-5 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-[#292524] bg-[#F4CD65] hover:bg-[#ebbf4d] shadow-xs transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Đang duyệt...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Duyệt cấp Tích Xanh</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox Zoom Modal */}
      {zoomImage && (
        <div 
          className="fixed inset-0 z-60 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setZoomImage(null)}
        >
          <div className="max-w-4xl w-full bg-slate-900 rounded-2xl p-4 space-y-3 shadow-2xl">
            <div className="flex items-center justify-between text-white text-xs sm:text-sm font-bold">
              <span>{zoomImage.title}</span>
              <button
                type="button"
                onClick={() => setZoomImage(null)}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-xs rounded-lg text-slate-300 hover:text-white cursor-pointer"
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
    </>
  );
}

