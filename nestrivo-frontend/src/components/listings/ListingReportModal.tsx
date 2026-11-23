"use client";

import { useState, useRef } from "react";
import {
  X,
  AlertTriangle,
  Flag,
  Upload,
  Image as ImageIcon,
  Loader2,
  CheckCircle2,
  ShieldAlert,
  Trash2,
  ExternalLink
} from "lucide-react";
import { adminService } from "@/service/admin.service";
import { uploadImageToCloudinary } from "@/service/upload.service";
import Link from "next/link";

interface ListingReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  listingId: string;
  listingTitle: string;
}

const REPORT_REASONS = [
  {
    key: "FAKE_IMAGES",
    label: "Hình ảnh không giống thực tế",
    desc: "Ảnh trên mạng lung linh nhưng phòng thực tế cũ kỹ, ẩm mốc, khác xa quảng cáo.",
  },
  {
    key: "WRONG_PRICE",
    label: "Giá thuê khác với giá niêm yết",
    desc: "Đến xem phòng bị báo giá cao hơn, hoặc phát sinh các khoản phụ phí vô lý.",
  },
  {
    key: "INCORRECT_AMENITIES",
    label: "Diện tích, tiện ích, nội thất sai lệch",
    desc: "Quảng cáo có máy giặt, điều hòa, gác lửng... nhưng thực tế không có hoặc hư hỏng.",
  },
  {
    key: "WRONG_ADDRESS",
    label: "Địa chỉ, vị trí không chính xác",
    desc: "Tin đăng một đường, đến nơi ở một nẻo, sai phường/quận hoặc vị trí bản đồ.",
  },
  {
    key: "ALREADY_RENTED",
    label: "Phòng đã cho thuê nhưng vẫn đăng",
    desc: "Chủ trọ hoặc môi giới dùng tin ảo để câu khách sang xem phòng khác.",
  },
  {
    key: "MISLEADING_INFO",
    label: "Chủ nhà cung cấp thông tin gây hiểu nhầm",
    desc: "Thông tin mập mờ về giờ giấc, cọc phòng, đối tượng ở chung...",
  },
  {
    key: "SCAM",
    label: "Có dấu hiệu lừa đảo / ép cọc giữ chỗ",
    desc: "Yêu cầu chuyển khoản cọc giữ chân trước khi xem phòng, giả mạo chủ nhà.",
  },
  {
    key: "OTHER",
    label: "Nội dung vi phạm quy định khác của Nestrivo",
    desc: "Ngôn từ thô tục, spam tin, bán hàng trái quy định...",
  },
];

export default function ListingReportModal({
  isOpen,
  onClose,
  listingId,
  listingTitle,
}: ListingReportModalProps) {
  const [selectedReason, setSelectedReason] = useState<string>("FAKE_IMAGES");
  const [description, setDescription] = useState<string>("");
  const [evidenceUrls, setEvidenceUrls] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (evidenceUrls.length + files.length > 5) {
      setErrorMessage("Bạn chỉ có thể tải lên tối đa 5 hình ảnh bằng chứng.");
      return;
    }

    setIsUploading(true);
    setErrorMessage(null);

    try {
      const uploaded: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file.type.startsWith("image/")) continue;
        const res = await uploadImageToCloudinary(file, { folder: "nestrivo/reports" });
        if (res.secureUrl) {
          uploaded.push(res.secureUrl);
        }
      }
      setEvidenceUrls((prev) => [...prev, ...uploaded]);
    } catch (err: any) {
      console.error("Upload error:", err);
      setErrorMessage("Không thể tải ảnh lên. Vui lòng thử lại hoặc sử dụng ảnh có dung lượng nhỏ hơn (< 5MB).");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemoveImage = (index: number) => {
    setEvidenceUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!selectedReason) {
      setErrorMessage("Vui lòng chọn lý do báo cáo.");
      return;
    }

    if (!description.trim() || description.trim().length < 10) {
      setErrorMessage("Vui lòng mô tả chi tiết ít nhất 10 ký tự để Admin có cơ sở xác minh.");
      return;
    }

    setIsSubmitting(true);
    try {
      await adminService.createReport({
        listingId,
        reason: selectedReason,
        description: description.trim(),
        evidenceUrls,
      });
      setIsSuccess(true);
    } catch (err: any) {
      console.error("Lỗi gửi báo cáo:", err);
      const msg = err?.message || err?.response?.data?.message || "Không thể gửi báo cáo. Vui lòng thử lại sau.";
      if (msg.includes("401") || msg.toLowerCase().includes("đăng nhập") || msg.toLowerCase().includes("unauthorized")) {
        setErrorMessage("Bạn cần đăng nhập tài khoản Nestrivo để gửi báo cáo vi phạm.");
      } else {
        setErrorMessage(msg);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    setSelectedReason("FAKE_IMAGES");
    setDescription("");
    setEvidenceUrls([]);
    setErrorMessage(null);
    setIsSuccess(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-xl max-h-[90vh] bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-stone-100 flex items-center justify-between bg-[#FFFBF0]/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center shrink-0">
              <Flag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-[#292524]">
                Báo cáo tin đăng vi phạm
              </h3>
              <p className="text-xs text-[#78716C] line-clamp-1">
                Phòng: <span className="font-semibold text-[#292524]">{listingTitle}</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleResetAndClose}
            className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-[#292524] flex-1">
          {isSuccess ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-1.5">
                <h4 className="text-lg font-bold text-[#292524]">
                  Đã gửi báo cáo thành công!
                </h4>
                <p className="text-xs sm:text-sm text-stone-600 max-w-md mx-auto leading-relaxed">
                  Cảm ơn bạn đã chung tay bảo vệ cộng đồng Nestrivo. Đội ngũ kiểm duyệt sẽ xác minh bằng chứng và có biện pháp xử lý nghiêm (cảnh báo, yêu cầu sửa đổi hoặc gỡ tin vĩnh viễn) trong vòng 24h.
                </p>
              </div>

              <div className="pt-4">
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="px-6 py-2.5 rounded-xl bg-[#F4CD65] hover:bg-[#ebbf4d] text-[#292524] font-semibold text-xs transition-colors cursor-pointer"
                >
                  Đóng cửa sổ
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Note / Trust statement */}
              <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-xs text-amber-900 flex items-start gap-2.5">
                <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div className="space-y-0.5 leading-relaxed">
                  <p className="font-semibold text-amber-950">Quy trình xử lý minh bạch:</p>
                  <p>
                    Nestrivo kiên quyết loại bỏ tin ảo, tin sai lệch giá và lừa đảo cọc. Nếu bạn đã đến xem phòng thực tế, hãy đính kèm ảnh chụp để làm bằng chứng xác thực nhất.
                  </p>
                </div>
              </div>

              {/* Error Banner */}
              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Reason Selection */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                  1. Chọn lý do báo cáo <span className="text-rose-500">*</span>
                </label>
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {REPORT_REASONS.map((r) => {
                    const isChecked = selectedReason === r.key;
                    return (
                      <label
                        key={r.key}
                        className={`flex items-start gap-3 p-3 rounded-2xl border transition-all cursor-pointer ${isChecked
                          ? "border-[#F4CD65] bg-[#FFF9EE] ring-1 ring-[#F4CD65]"
                          : "border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50"
                          }`}
                      >
                        <input
                          type="radio"
                          name="reportReason"
                          value={r.key}
                          checked={isChecked}
                          onChange={() => setSelectedReason(r.key)}
                          className="mt-1 text-[#805B10] focus:ring-[#F4CD65] cursor-pointer"
                        />
                        <div className="text-xs">
                          <span className="font-bold text-[#292524] block">
                            {r.label}
                          </span>
                          <span className="text-stone-500 leading-normal block mt-0.5">
                            {r.desc}
                          </span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                  2. Mô tả chi tiết vi phạm <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ví dụ: Tôi đã đến xem phòng trọ này vào lúc 15h hôm nay. Chủ nhà báo giá 4.2 triệu thay vì 3 triệu như bài đăng, và tiền điện báo 5.000đ/số..."
                  className="w-full p-3 rounded-2xl border border-stone-200 text-xs text-[#292524] placeholder-stone-400 focus:outline-hidden focus:ring-2 focus:ring-[#F4CD65] resize-none"
                />
              </div>

              {/* Evidence Upload */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                    3. Hình ảnh bằng chứng (ảnh thực tế / tin nhắn chat)
                  </label>
                  <span className="text-[11px] text-stone-500">
                    {evidenceUrls.length}/5 ảnh
                  </span>
                </div>

                {/* Upload Button */}
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading || evidenceUrls.length >= 5}
                    className="px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-medium border border-stone-200 flex items-center gap-2 transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    {isUploading ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-[#805B10]" />
                    ) : (
                      <Upload className="w-3.5 h-3.5 text-[#805B10]" />
                    )}
                    <span>{isUploading ? "Đang tải ảnh..." : "Tải ảnh từ máy"}</span>
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                  <span className="text-[11px] text-stone-500 italic">
                    Hỗ trợ ảnh JPG, PNG, WebP tối đa 5MB/ảnh
                  </span>
                </div>

                {/* Preview Thumbnail Grid */}
                {evidenceUrls.length > 0 && (
                  <div className="grid grid-cols-4 sm:grid-cols-5 gap-2.5 pt-2">
                    {evidenceUrls.map((url, idx) => (
                      <div
                        key={idx}
                        className="relative group aspect-square rounded-xl overflow-hidden border border-stone-200 bg-stone-50"
                      >
                        <img
                          src={url}
                          alt={`Bằng chứng ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className="absolute top-1 right-1 p-1 rounded-lg bg-black/60 text-white hover:bg-rose-600 transition-colors opacity-90 sm:opacity-0 group-hover:opacity-100 cursor-pointer"
                          title="Xóa ảnh"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Form Actions */}
              <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  disabled={isSubmitting}
                  className="px-4 py-2.5 rounded-xl border border-stone-200 text-xs font-semibold text-stone-600 hover:bg-stone-100 transition-colors cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || isUploading}
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 active:bg-rose-800 disabled:opacity-50 text-white font-semibold text-xs transition-colors flex items-center gap-2 shadow-xs cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Đang gửi báo cáo...</span>
                    </>
                  ) : (
                    <>
                      <Flag className="w-3.5 h-3.5" />
                      <span>Gửi báo cáo vi phạm</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
