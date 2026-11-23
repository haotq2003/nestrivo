"use client";

import { useState } from "react";
import Image from "next/image";
import { X, AlertTriangle, CheckCircle, Info } from "lucide-react";
import { AdminListingItem } from "@/types/admin";
import { PRESET_REJECTION_REASONS } from "@/lib/admin-mock-data";

interface RejectReasonModalProps {
  isOpen: boolean;
  listing: AdminListingItem | null;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void>;
  isLoading?: boolean;
}

export function RejectReasonModal({
  isOpen,
  listing,
  onClose,
  onConfirm,
  isLoading = false,
}: RejectReasonModalProps) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !listing) return null;

  const handleSelectPreset = (presetText: string) => {
    setReason(presetText);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = reason.trim();
    if (trimmed.length < 5) {
      setError("Vui lòng nhập lý do cụ thể tối thiểu 5 ký tự để chủ nhà hiểu rõ.");
      return;
    }
    setError(null);
    await onConfirm(trimmed);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-rose-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-tight">
                Từ chối phê duyệt tin đăng
              </h2>
              <p className="text-xs text-rose-700 font-medium">
                Gửi phản hồi yêu cầu chủ nhà chỉnh sửa
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          {/* Target Listing Summary */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-slate-200 shrink-0">
              <Image
                src={listing.thumbnailUrl || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=300"}
                alt={listing.title}
                fill
                className="object-cover"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-900 truncate">
                {listing.title}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                Chủ nhà: {listing.landlord?.fullName || "Chưa cập nhật"} • {listing.address}
              </p>
            </div>
          </div>

          {/* Preset quick selection chips */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              Lý do mẫu thường gặp (Nhấn chọn nhanh):
            </label>
            <div className="flex flex-col gap-1.5">
              {PRESET_REJECTION_REASONS.map((preset, idx) => {
                const isSelected = reason === preset;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectPreset(preset)}
                    className={`text-left text-xs p-2.5 rounded-xl border transition-all flex items-start gap-2 ${
                      isSelected
                        ? "bg-rose-50 border-rose-300 text-rose-900 font-medium shadow-2xs"
                        : "bg-white border-slate-200/90 text-slate-700 hover:bg-slate-50 hover:border-slate-300"
                    }`}
                  >
                    <CheckCircle
                      className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${
                        isSelected ? "text-rose-600" : "text-slate-300"
                      }`}
                    />
                    <span className="leading-snug">{preset}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Reason Textarea */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="rejectionReason" className="text-xs font-bold text-slate-700">
                Nội dung lý do từ chối gửi chủ nhà <span className="text-rose-600">*</span>
              </label>
              <span className={`text-[11px] font-semibold ${reason.trim().length < 5 ? "text-[#A8A190]" : "text-[#805B10]"}`}>
                {reason.trim().length} ký tự
              </span>
            </div>
            <textarea
              id="rejectionReason"
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (error) setError(null);
              }}
              rows={3}
              placeholder="Nhập chi tiết yêu cầu cần chỉnh sửa (tối thiểu 5 ký tự)..."
              className={`w-full p-3 text-xs sm:text-sm rounded-xl border bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white transition-all resize-none ${
                error
                  ? "border-rose-400 focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                  : "border-slate-200 focus:border-rose-500"
              }`}
            />
            {error && (
              <p className="text-xs font-medium text-rose-600 mt-1 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                {error}
              </p>
            )}
          </div>

          {/* Notice info */}
          <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-50/70 border border-amber-200/70 text-amber-800 text-xs">
            <Info className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
            <p className="leading-relaxed">
              Lý do này sẽ hiển thị nổi bật trên giao diện của chủ nhà kèm hướng dẫn để họ khắc phục nhanh và gửi duyệt lại.
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors min-h-[40px]"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={isLoading || reason.trim().length < 5}
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white text-xs sm:text-sm font-bold shadow-xs shadow-rose-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed min-h-[40px]"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                "Xác nhận từ chối"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

