"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  X, 
  Phone, 
  Copy, 
  Check, 
  ExternalLink, 
  MapPin, 
  Calendar, 
  Users, 
  Mail, 
  PhoneCall, 
  CheckCircle2, 
  RotateCcw, 
  MessageSquare,
  Clock,
  Sparkles,
  Info,
  CalendarCheck,
  XCircle
} from "lucide-react";
import { RentalInquiry, InquiryStatus } from "@/types/inquiry";
import { InquiryStatusBadge } from "./InquiryStatusBadge";
import { formatVND } from "@/lib/utils";

interface InquiryDetailDrawerProps {
  inquiry: RentalInquiry | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus: (id: string, newStatus: InquiryStatus) => void;
  onRejectInquiry?: (inquiry: RentalInquiry) => void;
}

export function InquiryDetailDrawer({
  inquiry,
  isOpen,
  onClose,
  onUpdateStatus,
  onRejectInquiry,
}: InquiryDetailDrawerProps) {
  const [copiedPhone, setCopiedPhone] = useState(false);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !inquiry) return null;

  const handleCopyPhone = () => {
    navigator.clipboard.writeText(inquiry.renter.phoneNumber.replace(/\s+/g, ""));
    setCopiedPhone(true);
    setTimeout(() => setCopiedPhone(false), 2000);
  };

  const getInitials = (name: string) => {
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[parts.length - 2][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const formatDate = (isoString: string) => {
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

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-over Drawer Panel */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md sm:max-w-lg bg-white border-l border-slate-200/90 shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300">
          {/* Header */}
          <div className="h-18 px-5 sm:px-6 border-b border-slate-200/80 flex items-center justify-between shrink-0 bg-white">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-[#FFF1CC] text-[#805B10] flex items-center justify-center shrink-0">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h2 className="text-sm sm:text-base font-bold text-slate-900 truncate">
                  Chi tiết yêu cầu hỏi thuê
                </h2>
                <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium">
                  <span>Mã: #{inquiry.id.slice(-6).toUpperCase()}</span>
                  <span>·</span>
                  <span>{formatDate(inquiry.createdAt)}</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center shrink-0"
              aria-label="Đóng cửa sổ"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Body (Scrollable) */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
            {/* 1. Status & Timeline Banner */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3">
              <div className="space-y-0.5">
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Trạng thái xử lý
                </div>
                <div className="text-xs text-slate-600">
                  {inquiry.status === "PENDING" && "Khách đang đợi phản hồi từ bạn"}
                  {inquiry.status === "CONTACTED" && "Đang trong quá trình trao đổi"}
                  {inquiry.status === "CLOSED" && "Yêu cầu đã hoàn tất xử lý"}
                </div>
              </div>
              <InquiryStatusBadge status={inquiry.status} size="md" />
            </div>

            {/* 2. Tenant Profile Card */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 space-y-4 shadow-2xs">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center justify-between">
                <span>Thông tin khách thuê</span>
                {inquiry.renter.occupation && (
                  <span className="text-[11px] font-semibold text-[#805B10] bg-[#FFF1CC] px-2 py-0.5 rounded-md">
                    {inquiry.renter.occupation}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#DCA936] to-[#F4CD65] text-[#292524] font-semibold text-base flex items-center justify-center shadow-xs shrink-0">
                  {getInitials(inquiry.renter.name)}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-base font-bold text-slate-900 truncate">
                    {inquiry.renter.name}
                  </h3>
                  <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{inquiry.renter.email || "Chưa có email"}</span>
                  </div>
                </div>
              </div>

              {/* Phone number & Action buttons */}
              <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200/80 text-xs font-bold text-slate-900 tabular-nums">
                  <Phone className="w-3.5 h-3.5 text-[#805B10] shrink-0" />
                  <span>{inquiry.renter.phoneNumber}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopyPhone}
                    className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 transition-colors min-h-[38px]"
                    title="Sao chép số điện thoại"
                  >
                    {copiedPhone ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-[#805B10]" />
                        <span className="text-[#805B10] font-bold">Đã sao chép!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-500" />
                        <span>Sao chép SĐT</span>
                      </>
                    )}
                  </button>

                  <a
                    href={`tel:${inquiry.renter.phoneNumber.replace(/\s+/g, "")}`}
                    className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium text-[#292524] bg-[#F4CD65] hover:bg-[#ebbf4d] active:bg-[#e0b03b] shadow-xs transition-all min-h-[38px]"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>Gọi điện</span>
                  </a>
                </div>
              </div>
            </div>

            {/* 3. Inquiry Message Details */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 space-y-3 shadow-2xs">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Nội dung câu hỏi & Nhu cầu
              </div>

              {inquiry.notes && (
                inquiry.notes.includes("Lịch hẹn xem phòng") || inquiry.notes.includes("[LỊCH XEM PHÒNG]") ? (
                  <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#FFFDF7] to-[#FFF7E5] border border-[#F4CD65] space-y-2 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-[#F4CD65] text-[#292524] flex items-center justify-center font-bold">
                          <CalendarCheck className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-bold text-[#805B10] uppercase tracking-wider">
                          Lịch hẹn xem phòng
                        </span>
                      </div>
                      <InquiryStatusBadge status={inquiry.status} size="sm" />
                    </div>
                    <div className="p-2.5 rounded-xl bg-white/90 border border-[#EDE5D5] text-xs font-bold text-slate-900">
                      {inquiry.notes.replace("Lịch hẹn xem phòng: ", "")}
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-[#805B10] font-medium">
                      <Clock className="w-3.5 h-3.5 text-[#805B10] shrink-0" />
                      <span>Vui lòng kiểm tra thời gian và nhấn nút duyệt hoặc đổi giờ với khách.</span>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-[#FFF9EE] border border-[#FDE68A] text-xs font-semibold text-[#805B10] flex items-center gap-2">
                    <CalendarCheck className="w-4 h-4 text-[#805B10] shrink-0" />
                    <span>{inquiry.notes}</span>
                  </div>
                )
              )}

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">
                &ldquo;{inquiry.message}&rdquo;
              </div>

              {/* Extra parameters: Move-in date & Occupants */}
              <div className="grid grid-cols-2 gap-2.5 pt-1">
                <div className="p-2.5 rounded-xl bg-[#FFF7E5] border border-[#EDE5D5] flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#805B10] shrink-0" />
                  <div className="min-w-0">
                    <div className="text-[10px] font-bold text-[#805B10] uppercase">Dự kiến dọn vào</div>
                    <div className="text-xs font-bold text-[#373523] truncate">
                      {inquiry.moveInDate || "Thỏa thuận"}
                    </div>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-100 border border-slate-200/70 flex items-center gap-2">
                  <Users className="w-4 h-4 text-slate-600 shrink-0" />
                  <div className="min-w-0">
                    <div className="text-[10px] font-bold text-slate-700 uppercase">Số người ở</div>
                    <div className="text-xs font-bold text-slate-900 truncate">
                      {inquiry.occupantsCount ? `${inquiry.occupantsCount} người` : "1 người"}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 4. Target Listing Information */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 space-y-3 shadow-2xs">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center justify-between">
                <span>Phòng quan tâm</span>
                <Link
                  href={`/listings/${inquiry.listing.id}`}
                  className="text-xs font-semibold text-[#805B10] hover:text-[#5c410b] hover:underline flex items-center gap-1"
                  target="_blank"
                >
                  <span>Xem tin đăng</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <img
                  src={inquiry.listing.thumbnailUrl}
                  alt={inquiry.listing.title}
                  className="w-20 h-16 rounded-lg object-cover bg-slate-100 shrink-0 border border-slate-200/80"
                />
                <div className="min-w-0 space-y-1 flex-1">
                  <div className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-1">
                    {inquiry.listing.title}
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-slate-600 line-clamp-1">
                    <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                    <span>{inquiry.listing.address}, {inquiry.listing.district}</span>
                  </div>
                  <div className="text-xs font-semibold text-[#805B10] tabular-nums">
                    {formatVND(inquiry.listing.price)}
                    <span className="text-[10px] font-normal text-slate-500 ml-0.5">/tháng</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 5. Rejection Reason if inquiry was rejected */}
            {inquiry.status === "REJECTED" && inquiry.rejectionReason && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-900 space-y-1.5 shadow-2xs">
                <div className="font-bold flex items-center gap-1.5 text-rose-700">
                  <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>Lý do từ chối lịch hẹn xem phòng:</span>
                </div>
                <p className="text-rose-800 leading-relaxed font-medium pl-5.5">
                  &ldquo;{inquiry.rejectionReason}&rdquo;
                </p>
              </div>
            )}

            {/* 6. Internal Notes if available */}
            {inquiry.notes && !inquiry.notes.includes("Lịch hẹn xem phòng") && !inquiry.notes.includes("[LỊCH XEM PHÒNG]") && (
              <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200/80 text-xs text-amber-900 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>Ghi chú của chủ nhà</span>
                </div>
                <p className="text-amber-800 leading-relaxed font-medium">
                  {inquiry.notes}
                </p>
              </div>
            )}
          </div>

          {/* Footer: Status Transition Actions */}
          <div className="p-4 sm:p-5 border-t border-slate-200/80 bg-slate-50/80 space-y-2.5 shrink-0">
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
              <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>Cập nhật trạng thái xử lý yêu cầu khách thuê:</span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {inquiry.status === "PENDING" && (
                <>
                  <button
                    type="button"
                    onClick={() => onUpdateStatus(inquiry.id, "CONFIRMED")}
                    className="flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 shadow-xs transition-all flex items-center justify-center gap-1.5 min-h-[42px] cursor-pointer"
                  >
                    <CalendarCheck className="w-4 h-4" />
                    <span>Duyệt lịch hẹn</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (onRejectInquiry) {
                        onRejectInquiry(inquiry);
                      } else {
                        onUpdateStatus(inquiry.id, "REJECTED");
                      }
                    }}
                    className="py-2.5 px-3.5 rounded-xl text-xs sm:text-sm font-semibold text-rose-600 bg-white hover:bg-rose-50 border border-rose-200 transition-all flex items-center justify-center gap-1.5 min-h-[42px] cursor-pointer"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Từ chối lịch</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onUpdateStatus(inquiry.id, "CONTACTED")}
                    className="py-2.5 px-3 rounded-xl text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 transition-all flex items-center justify-center gap-1.5 min-h-[42px] cursor-pointer"
                    title="Đánh dấu đã liên hệ"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Đã liên hệ</span>
                  </button>
                </>
              )}

              {inquiry.status === "CONFIRMED" && (
                <>
                  <button
                    type="button"
                    onClick={() => onUpdateStatus(inquiry.id, "CLOSED")}
                    className="flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold text-white bg-[#292524] hover:bg-black shadow-xs transition-all flex items-center justify-center gap-2 min-h-[42px] cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Hoàn tất buổi xem phòng (Đóng)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onUpdateStatus(inquiry.id, "PENDING")}
                    className="px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-100 transition-colors min-h-[42px]"
                    title="Chuyển lại về chờ duyệt"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </>
              )}

              {inquiry.status === "REJECTED" && (
                <button
                  type="button"
                  onClick={() => onUpdateStatus(inquiry.id, "PENDING")}
                  className="flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 active:bg-slate-200 transition-all flex items-center justify-center gap-2 min-h-[42px] cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Mở lại yêu cầu này (Chờ duyệt lại)</span>
                </button>
              )}

              {inquiry.status === "CONTACTED" && (
                <>
                  <button
                    type="button"
                    onClick={() => onUpdateStatus(inquiry.id, "CONFIRMED")}
                    className="flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs transition-all flex items-center justify-center gap-2 min-h-[42px] cursor-pointer"
                  >
                    <CalendarCheck className="w-4 h-4" />
                    <span>Duyệt lịch hẹn</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onUpdateStatus(inquiry.id, "CLOSED")}
                    className="py-2.5 px-3.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 transition-all flex items-center justify-center gap-2 min-h-[42px] cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Đóng</span>
                  </button>
                </>
              )}

              {inquiry.status === "CLOSED" && (
                <button
                  type="button"
                  onClick={() => onUpdateStatus(inquiry.id, "PENDING")}
                  className="flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 active:bg-slate-200 transition-all flex items-center justify-center gap-2 min-h-[42px] cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Mở lại yêu cầu này</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

