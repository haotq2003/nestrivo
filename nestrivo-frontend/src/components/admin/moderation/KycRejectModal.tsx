"use client";

import { useState } from "react";
import { X, AlertTriangle, Send, Check } from "lucide-react";
import { AdminKycVerificationItem } from "@/service/admin.service";

interface KycRejectModalProps {
  isOpen: boolean;
  item: AdminKycVerificationItem | null;
  onClose: () => void;
  onConfirm: (userId: string, reason: string) => Promise<void>;
  isLoading?: boolean;
}

const PRESET_KYC_REASONS = [
  "Ảnh chụp CCCD bị chói lóa ánh sáng đèn, làm mờ thông tin ngày cấp hoặc mã vạch.",
  "Ảnh chụp bị cắt mất góc thẻ CCCD, không đảm bảo tính nguyên bản của giấy tờ.",
  "Số Căn cước công dân hoặc Họ tên khai báo không trùng khớp với ảnh chụp thẻ.",
  "Ảnh chụp là bản photocopy hoặc chụp lại qua màn hình điện thoại/máy tính khác.",
  "Ảnh chụp bị mờ nhòe, độ phân giải thấp, không thể đối chiếu nhận dạng.",
];

export function KycRejectModal({
  isOpen,
  item,
  onClose,
  onConfirm,
  isLoading = false,
}: KycRejectModalProps) {
  const [selectedPreset, setSelectedPreset] = useState<string>("");
  const [customReason, setCustomReason] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !item) return null;

  const currentReason = customReason.trim() || selectedPreset;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentReason) {
      setError("Vui lòng chọn hoặc nhập lý do từ chối hồ sơ xác minh.");
      return;
    }
    setError(null);
    await onConfirm(item.userId, currentReason);
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-rose-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                Từ chối hồ sơ xác minh eKYC
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Chủ nhà: {item.kycDetails?.personalInfo?.fullName || item.user.fullName}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              Chọn lý do mẫu thường gặp:
            </label>
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {PRESET_KYC_REASONS.map((preset, idx) => {
                const isSelected = selectedPreset === preset && !customReason;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setSelectedPreset(preset);
                      setCustomReason("");
                      setError(null);
                    }}
                    className={`w-full text-left p-2.5 rounded-xl text-xs font-medium transition-all border flex items-start gap-2 cursor-pointer ${
                      isSelected
                        ? "bg-rose-50 border-rose-300 text-rose-950 ring-1 ring-rose-400"
                        : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5 border ${
                      isSelected ? "bg-rose-600 border-rose-600 text-white" : "border-slate-300 bg-white"
                    }`}>
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                    <span className="leading-snug">{preset}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Reason */}
          <div className="space-y-1.5">
            <label htmlFor="custom-kyc-reason" className="block text-xs font-bold text-slate-700">
              Hoặc nhập ghi chú lý do chi tiết cho chủ nhà:
            </label>
            <textarea
              id="custom-kyc-reason"
              rows={3}
              value={customReason}
              onChange={(e) => {
                setCustomReason(e.target.value);
                if (e.target.value) setSelectedPreset("");
                setError(null);
              }}
              placeholder="VD: Ảnh chụp mặt sau bị lóa đèn flash, vui lòng chụp lại ngoài trời hoặc nơi đủ sáng..."
              className="w-full p-3 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
            />
          </div>

          {error && (
            <p className="text-xs text-rose-600 font-bold flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              <span>{error}</span>
            </p>
          )}

          {/* Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Hủy bỏ
            </button>

            <button
              type="submit"
              disabled={isLoading || !currentReason}
              className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 transition-all shadow-md shadow-rose-600/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{isLoading ? "Đang gửi..." : "Gửi thông báo từ chối"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

