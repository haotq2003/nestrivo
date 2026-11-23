"use client";

import { AlertTriangle, AlertCircle, Trash2, EyeOff, CheckCircle2, X } from "lucide-react";

export type ActionModalType = "DELETE" | "TOGGLE_VISIBILITY" | "TOGGLE_AVAILABILITY" | "SUBMIT_REVIEW";

interface ListingActionModalProps {
  isOpen: boolean;
  type: ActionModalType;
  listingTitle: string;
  currentStatus?: string;
  currentAvailability?: string;
  isLoading: boolean;
  onConfirm: () => Promise<void> | void;
  onClose: () => void;
}

export function ListingActionModal({
  isOpen,
  type,
  listingTitle,
  currentStatus,
  currentAvailability,
  isLoading,
  onConfirm,
  onClose,
}: ListingActionModalProps) {
  if (!isOpen) return null;

  let title = "";
  let description = "";
  let confirmText = "Xác nhận";
  let confirmColorClass = "bg-[#F4CD65] hover:bg-[#ebbf4d] text-[#292524] font-semibold";
  let icon = <AlertCircle className="w-6 h-6 text-[#DCA936]" />;
  let iconBg = "bg-[#FFF1CC]";

  if (type === "DELETE") {
    title = "Xác nhận xóa vĩnh viễn tin đăng?";
    description = `Bạn có chắc chắn muốn xóa tin "${listingTitle}"? Toàn bộ hình ảnh và dữ liệu của tin đăng này sẽ bị xóa khỏi hệ thống và không thể khôi phục.`;
    confirmText = "Xóa vĩnh viễn";
    confirmColorClass = "bg-rose-600 hover:bg-rose-700 text-white shadow-rose-200 font-semibold";
    icon = <Trash2 className="w-6 h-6 text-rose-600" />;
    iconBg = "bg-rose-50";
  } else if (type === "TOGGLE_VISIBILITY") {
    const willHide = currentStatus === "PUBLISHED";
    title = willHide ? "Tạm ẩn tin đăng này?" : "Bật hiển thị lại tin đăng?";
    description = willHide
      ? `Tin "${listingTitle}" sẽ tạm thời bị ẩn khỏi kết quả tìm kiếm của người thuê. Bạn có thể bật hiển thị lại bất cứ lúc nào.`
      : `Tin "${listingTitle}" sẽ được kích hoạt hiển thị lại trên sàn Nestrivo để người thuê có thể xem và gửi yêu cầu hỏi thuê.`;
    confirmText = willHide ? "Tạm ẩn tin" : "Hiển thị lại";
    confirmColorClass = willHide ? "bg-[#805B10] hover:bg-[#68490a] text-white shadow-sm font-semibold" : "bg-[#F4CD65] hover:bg-[#ebbf4d] text-[#292524] font-semibold";
    icon = willHide ? <EyeOff className="w-6 h-6 text-slate-700" /> : <CheckCircle2 className="w-6 h-6 text-[#DCA936]" />;
    iconBg = willHide ? "bg-slate-100" : "bg-[#FFF1CC]";
  } else if (type === "TOGGLE_AVAILABILITY") {
    const willRent = currentAvailability === "AVAILABLE";
    title = willRent ? "Đánh dấu phòng ĐÃ CHO THUÊ?" : "Đánh dấu phòng CÒN TRỐNG?";
    description = willRent
      ? `Phòng "${listingTitle}" sẽ được đánh dấu đã có khách thuê. Người thuê sẽ nhìn thấy nhãn "Đã thuê" và không thể gửi yêu cầu hỏi thuê mới.`
      : `Phòng "${listingTitle}" sẽ được mở lại sang trạng thái còn trống để tiếp tục nhận khách thuê mới.`;
    confirmText = willRent ? "Đánh dấu đã thuê" : "Mở phòng trống";
    confirmColorClass = willRent ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200 font-semibold" : "bg-[#F4CD65] hover:bg-[#ebbf4d] text-[#292524] font-semibold";
    icon = <AlertTriangle className="w-6 h-6 text-indigo-600" />;
    iconBg = willRent ? "bg-indigo-50" : "bg-[#FFF1CC]";
  } else if (type === "SUBMIT_REVIEW") {
    title = "Gửi tin đăng lên kiểm duyệt?";
    description = `Tin "${listingTitle}" sẽ được chuyển sang trạng thái CHỜ DUYỆT. Đội ngũ kiểm duyệt viên Nestrivo sẽ đối soát thông tin và phê duyệt trong vòng 24 giờ làm việc.`;
    confirmText = "Gửi duyệt ngay";
    confirmColorClass = "bg-[#292524] hover:bg-[#1c1917] text-white font-semibold shadow-xs";
    icon = <CheckCircle2 className="w-6 h-6 text-[#DCA936]" />;
    iconBg = "bg-[#FFF1CC]";
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div 
        className="bg-white rounded-3xl border border-[#EDE5D5] p-6 sm:p-7 max-w-md w-full space-y-4 shadow-2xl animate-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between">
          <div className={`w-12 h-12 rounded-2xl ${iconBg} flex items-center justify-center shrink-0`}>
            {icon}
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            aria-label="Đóng cửa sổ"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-2">
          <h3 className="text-base sm:text-lg font-semibold text-[#292524] leading-snug">
            {title}
          </h3>
          <p className="text-xs sm:text-sm text-[#57534E] leading-relaxed">
            {description}
          </p>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium text-[#57534E] bg-stone-100 hover:bg-stone-200 transition-colors min-h-[42px]"
          >
            Hủy thao tác
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-medium shadow-xs transition-all min-h-[42px] flex items-center justify-center gap-2 ${confirmColorClass}`}
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Đang xử lý...</span>
              </>
            ) : (
              <span>{confirmText}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

