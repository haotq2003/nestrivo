"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  CalendarX,
  AlertCircle,
  Building2,
  User,
  MessageSquare,
  Check,
  Send,
} from "lucide-react";
import { RentalInquiry } from "@/types/inquiry";

interface InquiryRejectModalProps {
  inquiry: RentalInquiry | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmReject: (id: string, rejectionReason: string) => Promise<void>;
}

const PRESET_REASONS = [
  "Phòng đã có khách cọc / đã cho thuê",
  "Trùng lịch / Bận việc đột xuất không thể đón tiếp giờ này",
  "Số lượng người ở vượt quá quy định hoặc không phù hợp tiêu chí",
  "Thời gian hẹn quá gấp hoặc ngoài khung giờ xem phòng cho phép",
  "Lý do khác (Nhập chi tiết bên dưới)",
];

export function InquiryRejectModal({
  inquiry,
  isOpen,
  onClose,
  onConfirmReject,
}: InquiryRejectModalProps) {
  const [selectedPreset, setSelectedPreset] = useState<string>(PRESET_REASONS[0]);
  const [customDetail, setCustomDetail] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedPreset(PRESET_REASONS[0]);
      setCustomDetail("");
      setIsSubmitting(false);
    }
  }, [isOpen]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isSubmitting) onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isSubmitting, onClose]);

  if (!isOpen || !inquiry) return null;

  // Tính toán lý do hoàn chỉnh
  const computedReason =
    selectedPreset === "Lý do khác (Nhập chi tiết bên dưới)"
      ? customDetail.trim()
      : customDetail.trim()
      ? `${selectedPreset}. Ghi chú: ${customDetail.trim()}`
      : selectedPreset;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!computedReason) return;

    try {
      setIsSubmitting(true);
      await onConfirmReject(inquiry.id, computedReason);
      onClose();
    } catch (err) {
      console.error("Lỗi khi từ chối lịch hẹn:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={() => !isSubmitting && onClose()}
        aria-hidden="true"
      />

      {/* Modal Dialog Card */}
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-10 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4.5 bg-gradient-to-r from-rose-50 to-amber-50/50 border-b border-rose-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-100 border border-rose-200 text-rose-700 flex items-center justify-center shrink-0 shadow-2xs">
              <CalendarX className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 leading-snug">
                Từ chối lịch hẹn xem phòng
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Gửi phản hồi và lý do cụ thể đến khách thuê
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-white/80 rounded-xl transition-all"
            aria-label="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Target Inquiry Info Card */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-500" />
                <span>Khách: <strong className="text-slate-900 font-bold">{inquiry.renter.name}</strong> ({inquiry.renter.phoneNumber})</span>
              </span>
            </div>
            <div className="text-slate-600 truncate flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{inquiry.listing.title}</span>
            </div>
            {inquiry.notes && inquiry.notes.includes("Lịch hẹn xem phòng:") && (
              <div className="text-[11px] font-semibold text-emerald-800 bg-emerald-50/80 px-2 py-0.5 rounded border border-emerald-200/60 inline-block">
                {inquiry.notes.replace("Lịch hẹn xem phòng: ", "")}
              </div>
            )}
          </div>

          {/* Preset Reasons Picker */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-800">
              Chọn lý do từ chối phù hợp:
            </label>
            <div className="space-y-1.5">
              {PRESET_REASONS.map((reason) => {
                const isSelected = selectedPreset === reason;
                return (
                  <button
                    key={reason}
                    type="button"
                    onClick={() => setSelectedPreset(reason)}
                    className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-medium border transition-all flex items-center justify-between ${
                      isSelected
                        ? "bg-rose-50/70 border-rose-300 text-rose-900 font-semibold shadow-2xs"
                        : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <span>{reason}</span>
                    {isSelected && (
                      <Check className="w-4 h-4 text-rose-600 shrink-0 ml-2" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Detailed / Extra Note Field */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-800 flex items-center justify-between">
              <span>
                {selectedPreset === "Lý do khác (Nhập chi tiết bên dưới)"
                  ? "Nhập lý do chi tiết (bắt buộc):"
                  : "Lời nhắn thêm cho khách thuê (tùy chọn):"}
              </span>
              <span className="text-[11px] font-normal text-slate-400">
                Hiển thị trong thông báo của khách
              </span>
            </label>
            <textarea
              rows={3}
              value={customDetail}
              onChange={(e) => setCustomDetail(e.target.value)}
              placeholder={
                selectedPreset === "Lý do khác (Nhập chi tiết bên dưới)"
                  ? "Ví dụ: Phòng này mình đang ưu tiên cho nữ thuê, hoặc bạn có thể đổi lịch sang 15h Chủ Nhật được không?..."
                  : "Ví dụ: Bạn có thể tham khảo phòng tương tự tầng 2 của mình, hoặc nhắn lại khung giờ khác nhé..."
              }
              className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-rose-400 focus:bg-white transition-all resize-none"
              required={selectedPreset === "Lý do khác (Nhập chi tiết bên dưới)"}
            />
          </div>

          {/* Live Notification Preview Box */}
          <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200/70 text-[11px] text-amber-900 space-y-1">
            <div className="font-bold flex items-center gap-1 text-amber-800">
              <MessageSquare className="w-3.5 h-3.5 text-amber-600" />
              <span>Xem trước thông báo gửi đến khách:</span>
            </div>
            <p className="italic text-amber-800 line-clamp-2">
              &ldquo;Chủ nhà tạm thời chưa thể tiếp nhận lịch hẹn xem phòng. Lý do: &lsquo;{computedReason || "..."}&rsquo;&rdquo;
            </p>
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
            >
              Quay lại
            </button>

            <button
              type="submit"
              disabled={isSubmitting || !computedReason}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 active:bg-rose-800 shadow-sm transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Đang xử lý...</span>
              ) : (
                <>
                  <CalendarX className="w-4 h-4" />
                  <span>Xác nhận từ chối hẹn</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
