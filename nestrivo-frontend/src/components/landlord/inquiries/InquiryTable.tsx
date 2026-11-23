"use client";

import Link from "next/link";
import { 
  Eye, 
  Phone, 
  MapPin, 
  Calendar, 
  MessageSquare, 
  PhoneCall, 
  CheckCircle2, 
  ChevronRight,
  CalendarCheck,
  XCircle,
  RotateCcw
} from "lucide-react";
import { RentalInquiry, InquiryStatus } from "@/types/inquiry";
import { InquiryStatusBadge } from "./InquiryStatusBadge";
import { formatVND } from "@/lib/utils";

interface InquiryTableProps {
  inquiries: RentalInquiry[];
  onSelectInquiry: (inquiry: RentalInquiry) => void;
  onQuickStatusChange: (id: string, nextStatus: InquiryStatus) => void;
  onRejectInquiry?: (inquiry: RentalInquiry) => void;
}

export function InquiryTable({
  inquiries,
  onSelectInquiry,
  onQuickStatusChange,
  onRejectInquiry,
}: InquiryTableProps) {
  const getInitials = (name: string) => {
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[parts.length - 2][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const formatShortTime = (isoString: string) => {
    try {
      const d = new Date(isoString);
      const now = new Date();
      const diffMs = now.getTime() - d.getTime();
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffHours / 24);

      if (diffHours < 1) return "Vừa xong";
      if (diffHours < 24) return `${diffHours} giờ trước`;
      if (diffDays === 1) return "Hôm qua";
      if (diffDays < 7) return `${diffDays} ngày trước`;

      return d.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
      {/* ========================================================= */}
      {/* 1. DESKTOP DATA TABLE (Visible on >= lg screens)          */}
      {/* ========================================================= */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-700">
              <th className="py-3 px-4 min-w-[200px]">Khách thuê</th>
              <th className="py-3 px-3 min-w-[240px]">Phòng quan tâm</th>
              <th className="py-3 px-3 min-w-[260px]">Nội dung yêu cầu</th>
              <th className="py-3 px-3 whitespace-nowrap">Thời gian</th>
              <th className="py-3 px-3 whitespace-nowrap">Trạng thái</th>
              <th className="py-3 px-4 text-right whitespace-nowrap">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {inquiries.map((item) => {
              const isViewingTour =
                item.notes?.includes("Lịch hẹn xem phòng") ||
                item.notes?.includes("[LỊCH XEM PHÒNG]") ||
                item.notes?.toLowerCase().includes("lịch hẹn") ||
                item.message.toLowerCase().includes("xem phòng");

              return (
                <tr
                  key={item.id}
                  onClick={() => onSelectInquiry(item)}
                  className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                >
                  {/* Column 1: Tenant Profile */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#DCA936] to-[#F4CD65] text-[#292524] font-semibold text-xs flex items-center justify-center shrink-0 shadow-2xs">
                        {getInitials(item.renter.name)}
                      </div>
                      <div className="min-w-0 space-y-0.5">
                        <div className="font-bold text-slate-900 group-hover:text-[#805B10] transition-colors line-clamp-1">
                          {item.renter.name}
                        </div>
                        <div className="text-xs text-slate-500 font-medium flex items-center gap-1 tabular-nums">
                          <Phone className="w-3 h-3 text-[#805B10] shrink-0" />
                          <span>{item.renter.phoneNumber}</span>
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Column 2: Listing Information */}
                  <td className="py-3.5 px-3">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={
                          item.listing.thumbnailUrl ||
                          (item.listing as any).images?.[0]?.imageUrl ||
                          "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&auto=format&fit=crop&q=80"
                        }
                        alt={item.listing.title}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&auto=format&fit=crop&q=80";
                        }}
                        className="w-14 h-11 rounded-lg object-cover bg-slate-100 shrink-0 border border-slate-200/60"
                      />
                      <div className="min-w-0 space-y-0.5">
                        <div className="font-semibold text-slate-900 line-clamp-1 text-xs">
                          {item.listing.title}
                        </div>
                        <div className="text-xs font-bold text-[#805B10] tabular-nums">
                          {formatVND(item.listing.price)}
                          <span className="text-[10px] font-normal text-slate-500 ml-0.5">/tháng</span>
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Column 3: Inquiry Message & Tour Info */}
                  <td className="py-3.5 px-3">
                    <div className="space-y-1.5 max-w-sm">
                      {isViewingTour && (
                        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#FFF9EE] border border-[#FDE68A] text-[#805B10] text-[11px] font-bold">
                          <CalendarCheck className="w-3.5 h-3.5 text-[#805B10] shrink-0" />
                          <span>Lịch hẹn xem phòng</span>
                        </div>
                      )}
                      {item.notes && item.notes.includes("Lịch hẹn xem phòng:") && (
                        <div className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/80 line-clamp-1">
                          {item.notes.replace("Lịch hẹn xem phòng: ", "")}
                        </div>
                      )}
                      {item.status === "REJECTED" && item.rejectionReason && (
                        <div className="text-[11px] font-semibold text-rose-800 bg-rose-50 px-2 py-1 rounded-lg border border-rose-200/80 flex items-start gap-1">
                          <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                          <span className="line-clamp-2">Lý do từ chối: {item.rejectionReason}</span>
                        </div>
                      )}
                      <p className="text-xs text-slate-700 line-clamp-2 leading-relaxed">
                        &ldquo;{item.message}&rdquo;
                      </p>
                      {item.moveInDate && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500">
                          <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>Dọn vào: {item.moveInDate}</span>
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Column 4: Submission Time */}
                  <td className="py-3.5 px-3 whitespace-nowrap">
                    <div className="text-xs font-medium text-slate-700">
                      {formatShortTime(item.createdAt)}
                    </div>
                  </td>

                  {/* Column 5: Status Badge */}
                  <td className="py-3.5 px-3 whitespace-nowrap">
                    <InquiryStatusBadge status={item.status} size="sm" />
                  </td>

                  {/* Column 6: Action Buttons */}
                  <td 
                    className="py-3.5 px-4 whitespace-nowrap text-right"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-end gap-1.5">
                      {/* When PENDING */}
                      {item.status === "PENDING" && (
                        <>
                          <button
                            type="button"
                            onClick={() => onQuickStatusChange(item.id, "CONFIRMED")}
                            className="px-2.5 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors flex items-center gap-1 min-h-[34px] shadow-2xs cursor-pointer"
                            title="Duyệt lịch hẹn xem phòng"
                          >
                            <CalendarCheck className="w-3.5 h-3.5" />
                            <span>Duyệt lịch</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => onRejectInquiry ? onRejectInquiry(item) : onQuickStatusChange(item.id, "REJECTED")}
                            className="px-2 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200/70 rounded-lg transition-colors flex items-center gap-1 min-h-[34px] cursor-pointer"
                            title="Từ chối lịch hẹn và nhập lý do"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Từ chối</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => onQuickStatusChange(item.id, "CONTACTED")}
                            className="px-2 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200/60 rounded-lg transition-colors flex items-center gap-1 min-h-[34px] cursor-pointer"
                            title="Đã liên hệ trao đổi"
                          >
                            <PhoneCall className="w-3.5 h-3.5" />
                            <span className="hidden xl:inline">Đã gọi</span>
                          </button>
                        </>
                      )}

                      {/* When CONFIRMED */}
                      {item.status === "CONFIRMED" && (
                        <button
                          type="button"
                          onClick={() => onQuickStatusChange(item.id, "CLOSED")}
                          className="px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1 min-h-[34px] cursor-pointer"
                          title="Hoàn tất buổi xem phòng (Đóng)"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Hoàn tất</span>
                        </button>
                      )}

                      {/* When CONTACTED */}
                      {item.status === "CONTACTED" && (
                        <>
                          <button
                            type="button"
                            onClick={() => onQuickStatusChange(item.id, "CONFIRMED")}
                            className="px-2.5 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors flex items-center gap-1 min-h-[34px] shadow-2xs cursor-pointer"
                            title="Duyệt lịch hẹn xem phòng"
                          >
                            <CalendarCheck className="w-3.5 h-3.5" />
                            <span>Duyệt lịch</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => onQuickStatusChange(item.id, "CLOSED")}
                            className="px-2 py-1.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1 min-h-[34px] cursor-pointer"
                            title="Đóng yêu cầu"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Đóng</span>
                          </button>
                        </>
                      )}

                      {/* When REJECTED */}
                      {item.status === "REJECTED" && (
                        <button
                          type="button"
                          onClick={() => onQuickStatusChange(item.id, "PENDING")}
                          className="px-2.5 py-1.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1 min-h-[34px] cursor-pointer"
                          title="Mở lại yêu cầu"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Mở lại</span>
                        </button>
                      )}

                      {/* When CLOSED */}
                      {item.status === "CLOSED" && (
                        <button
                          type="button"
                          onClick={() => onQuickStatusChange(item.id, "PENDING")}
                          className="px-2 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 rounded-lg transition-colors cursor-pointer"
                          title="Mở lại yêu cầu"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {/* View Details Button */}
                      <button
                        type="button"
                        onClick={() => onSelectInquiry(item)}
                        className="p-1.5 text-slate-500 hover:text-[#805B10] hover:bg-[#FFF1CC] rounded-lg transition-colors min-h-[34px] min-w-[34px] flex items-center justify-center ml-1 cursor-pointer"
                        title="Xem chi tiết yêu cầu"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ========================================================= */}
      {/* 2. MOBILE & TABLET CARD LIST (Visible on < lg screens)    */}
      {/* ========================================================= */}
      <div className="lg:hidden divide-y divide-slate-100">
        {inquiries.map((item) => {
          const isViewingTour =
            item.notes?.includes("Lịch hẹn xem phòng") ||
            item.notes?.includes("[LỊCH XEM PHÒNG]") ||
            item.notes?.toLowerCase().includes("lịch hẹn") ||
            item.message.toLowerCase().includes("xem phòng");

          return (
            <div
              key={item.id}
              onClick={() => onSelectInquiry(item)}
              className="p-4 space-y-3 hover:bg-slate-50/80 transition-colors cursor-pointer active:bg-slate-100/70"
            >
              {/* Top row: Tenant + Status + Time */}
              <div className="flex items-start justify-between gap-2.5">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#DCA936] to-[#F4CD65] text-[#292524] font-semibold text-xs flex items-center justify-center shrink-0 shadow-2xs">
                    {getInitials(item.renter.name)}
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-slate-900 text-sm truncate">
                      {item.renter.name}
                    </div>
                    <div className="text-xs text-slate-500 flex items-center gap-1 tabular-nums font-normal">
                      <Phone className="w-3 h-3 text-[#805B10] shrink-0" />
                      <span>{item.renter.phoneNumber}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1 shrink-0">
                  <InquiryStatusBadge status={item.status} size="sm" />
                  <span className="text-[11px] text-slate-500">
                    {formatShortTime(item.createdAt)}
                  </span>
                </div>
              </div>

              {/* Tour Appointment Banner */}
              {isViewingTour && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#FFF9EE] border border-[#FDE68A] text-[#805B10] text-xs font-bold">
                  <CalendarCheck className="w-3.5 h-3.5 text-[#805B10] shrink-0" />
                  <span className="truncate">
                    {item.notes && item.notes.includes("Lịch hẹn xem phòng:")
                      ? item.notes.replace("Lịch hẹn xem phòng: ", "")
                      : "Lịch hẹn xem phòng"}
                  </span>
                </div>
              )}

              {/* Middle row: Listing summary */}
              <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 border border-slate-200/70">
                <img
                  src={
                    item.listing.thumbnailUrl ||
                    (item.listing as any).images?.[0]?.imageUrl ||
                    "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&auto=format&fit=crop&q=80"
                  }
                  alt={item.listing.title}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&auto=format&fit=crop&q=80";
                  }}
                  className="w-12 h-10 rounded-lg object-cover bg-slate-100 shrink-0 border border-slate-200/60"
                />
                <div className="min-w-0 flex-1 space-y-0.5">
                  <div className="text-xs font-semibold text-slate-900 truncate">
                    {item.listing.title}
                  </div>
                  <div className="text-xs font-semibold text-[#805B10] tabular-nums">
                    {formatVND(item.listing.price)}/tháng
                  </div>
                </div>
              </div>

              {/* Bottom row: Message preview */}
              <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed italic">
                &ldquo;{item.message}&rdquo;
              </p>

              {item.status === "REJECTED" && item.rejectionReason && (
                <div className="text-[11px] font-semibold text-rose-800 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200/80 flex items-start gap-1.5">
                  <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                  <span className="line-clamp-2">Lý do từ chối: {item.rejectionReason}</span>
                </div>
              )}

              {/* Mobile Actions Bar */}
              <div 
                className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2"
                onClick={(e) => e.stopPropagation()}
              >
                {item.moveInDate ? (
                  <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1 truncate">
                    <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                    <span>Dọn vào: {item.moveInDate}</span>
                  </span>
                ) : (
                  <span />
                )}

                <div className="flex items-center gap-1.5">
                  {item.status === "PENDING" && (
                    <>
                      <button
                        type="button"
                        onClick={() => onQuickStatusChange(item.id, "CONFIRMED")}
                        className="px-2.5 py-1 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors flex items-center gap-1"
                      >
                        <CalendarCheck className="w-3 h-3" />
                        <span>Duyệt</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onRejectInquiry ? onRejectInquiry(item) : onQuickStatusChange(item.id, "REJECTED")}
                        className="px-2 py-1 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors cursor-pointer"
                      >
                        Từ chối
                      </button>
                    </>
                  )}

                  {item.status === "CONFIRMED" && (
                    <button
                      type="button"
                      onClick={() => onQuickStatusChange(item.id, "CLOSED")}
                      className="px-2.5 py-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>Hoàn tất</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => onSelectInquiry(item)}
                    className="px-2.5 py-1 text-xs font-bold text-[#805B10] bg-[#FFF1CC] hover:bg-[#ffe7a3] rounded-lg transition-colors flex items-center gap-1"
                  >
                    <span>Chi tiết</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

