"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { 
  X, 
  Calendar, 
  Clock, 
  MessageSquare, 
  AlertCircle, 
  CalendarCheck,
  ArrowRight,
  Phone,
  MapPin,
  LogIn,
  Info,
  Hourglass
} from "lucide-react";
import { ListingItem } from "@/types/listing";
import { formatVND } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { inquiryService } from "@/service/inquiry.service";

interface BookingViewingModalProps {
  isOpen: boolean;
  onClose: () => void;
  listing: ListingItem;
}

const QUICK_MESSAGES = [
  "Em muốn hẹn xem phòng trực tiếp vào ngày trên.",
  "Em muốn qua xem phòng và kiểm tra chỗ gửi xe máy.",
  "Cho em hỏi thêm về giờ giấc ra vào có tự do 24/7 không ạ?",
];

export default function BookingViewingModal({
  isOpen,
  onClose,
  listing,
}: BookingViewingModalProps) {
  const { user, isAuthenticated } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock body scroll and listen for Escape key when modal is open
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow || "unset";
    };
  }, [isOpen, onClose]);

  // Helper date generators for presets
  const today = new Date();
  const formatDateForInput = (d: Date) => d.toISOString().split("T")[0];
  const todayStr = formatDateForInput(today);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = formatDateForInput(tomorrow);

  // Form State
  const [viewingDate, setViewingDate] = useState<string>(tomorrowStr);
  const [message, setMessage] = useState<string>(
    "Em muốn hẹn xem phòng trực tiếp vào ngày trên. Nhờ chủ nhà duyệt lịch giúp em ạ."
  );
  const [contactPhone, setContactPhone] = useState<string>(user?.phoneNumber || "");

  // Submission State
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen || !mounted) return null;

  // Compute selected date label
  const getViewingTimeSummary = () => {
    return `ngày ${viewingDate.split("-").reverse().join("/")}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!viewingDate) {
      setErrorMsg("Vui lòng chọn ngày bạn muốn đến xem phòng.");
      return;
    }

    if (!message.trim()) {
      setErrorMsg("Vui lòng nhập lời nhắn hoặc yêu cầu gửi đến chủ nhà.");
      return;
    }

    if (!isAuthenticated) {
      setErrorMsg("Vui lòng đăng nhập để gửi yêu cầu đặt lịch và theo dõi kết quả phê duyệt từ chủ nhà.");
      return;
    }

    setIsLoading(true);

    try {
      const formattedScheduleNote = `Lịch hẹn xem phòng: ${getViewingTimeSummary()}${
        contactPhone ? ` | SĐT người thuê: ${contactPhone}` : ""
      }`;

      await inquiryService.create({
        listingId: listing.id,
        message: message.trim(),
        occupantsCount: 1,
        notes: formattedScheduleNote,
      });

      setIsSuccess(true);
    } catch (error: any) {
      const serverMessage = error?.response?.data?.message || error?.message || "Không thể gửi yêu cầu đặt lịch. Vui lòng thử lại sau.";
      setErrorMsg(serverMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetAndClose = () => {
    setIsSuccess(false);
    setErrorMsg(null);
    onClose();
  };

  const modalContent = (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-start justify-center overflow-y-auto pt-24 sm:pt-28 pb-12 px-3 sm:px-4 animate-fade-in"
      style={{ zIndex: 999999 }}
      onClick={handleResetAndClose}
    >
      <div 
        className="relative bg-white rounded-3xl max-w-lg w-full border border-[#E5E7EB] shadow-2xl flex flex-col max-h-[calc(100vh-140px)] sm:max-h-[calc(100vh-160px)] overflow-hidden my-0"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar (Positioned comfortably below Navbar with clean breathing room) */}
        <div className="shrink-0 px-5 sm:px-6 py-4 border-b border-[#E5E7EB] flex items-center justify-between bg-stone-50/90 rounded-t-3xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FFF1CC] text-[#805B10] flex items-center justify-center shrink-0 shadow-2xs">
              <CalendarCheck className="w-5 h-5 text-[#805B10]" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-[#292524] leading-snug">
                Đặt lịch xem phòng
              </h3>
              <p className="text-xs text-[#78716C] mt-0.5">
                Chủ nhà sẽ nhận và xét duyệt lịch hẹn của bạn
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleResetAndClose}
            className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-[#57534E] flex items-center justify-center transition-colors cursor-pointer shrink-0"
            aria-label="Đóng cửa sổ"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ========================================================= */}
        {/* SUCCESS VIEW                                              */}
        {/* ========================================================= */}
        {isSuccess ? (
          <div className="p-6 sm:p-8 text-center space-y-4 flex-1 overflow-y-auto">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto shadow-xs">
              <Hourglass className="w-7 h-7 animate-pulse text-amber-600" />
            </div>

            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                <Clock className="w-3.5 h-3.5" />
                <span>Đang chờ chủ nhà duyệt lịch</span>
              </div>
              <h4 className="text-lg sm:text-xl font-bold text-[#292524]">Đã gửi yêu cầu đặt lịch hẹn!</h4>
              <p className="text-xs sm:text-sm text-[#57534E] max-w-sm mx-auto leading-relaxed">
                Yêu cầu xem phòng của bạn đã được chuyển tới chủ nhà. Chủ nhà sẽ <strong>Duyệt (Đồng ý)</strong> hoặc <strong>Từ chối (Hẹn lại giờ khác)</strong>. Bạn có thể theo dõi tiến độ trên trang cá nhân.
              </p>
            </div>

            {/* Appointment Summary Box */}
            <div className="p-3.5 rounded-2xl bg-stone-50 border border-[#E5E7EB] text-left text-xs space-y-2">
              <div className="flex items-center justify-between border-b border-stone-200/80 pb-1.5">
                <span className="text-[#78716C]">Phòng:</span>
                <span className="font-semibold text-[#292524] truncate max-w-[200px]">{listing.title}</span>
              </div>
              <div className="flex items-center justify-between border-b border-stone-200/80 pb-1.5">
                <span className="text-[#78716C]">Thời gian bạn đề xuất:</span>
                <span className="font-semibold text-[#805B10]">{getViewingTimeSummary()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#78716C]">Trạng thái:</span>
                <span className="font-semibold text-amber-700">Chờ chủ nhà xác nhận</span>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center gap-2.5">
              <Link
                href="/profile"
                className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-[#F4CD65] hover:bg-[#ebbf4d] text-[#292524] font-semibold text-xs transition-all text-center"
              >
                Kiểm tra tiến độ duyệt trên trang cá nhân
              </Link>
              <button
                type="button"
                onClick={handleResetAndClose}
                className="w-full sm:w-auto py-2.5 px-5 rounded-xl bg-white border border-[#E5E7EB] text-[#57534E] hover:bg-stone-50 font-medium text-xs transition-colors cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        ) : (
          /* ========================================================= */
          /* BOOKING FORM VIEW                                         */
          /* ========================================================= */
          <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5">
              {/* Room Summary Header */}
              <div className="p-3 rounded-2xl bg-stone-50 border border-[#E5E7EB] flex items-center gap-3">
                <div className="w-14 h-12 rounded-xl overflow-hidden bg-stone-200 shrink-0">
                  <img
                    src={listing.images?.[0]?.imageUrl || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=300"}
                    alt={listing.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs sm:text-sm font-semibold text-[#292524] truncate">
                    {listing.title}
                  </h4>
                  <p className="text-[11px] text-[#78716C] flex items-center gap-1 mt-0.5 truncate">
                    <MapPin className="w-3 h-3 shrink-0" />
                    <span>{listing.district ? `${listing.district}, ` : ""}{listing.city}</span>
                  </p>
                  <p className="text-xs font-bold text-[#805B10] mt-0.5">
                    {formatVND(listing.price)}/tháng
                  </p>
                </div>
              </div>

              {/* Explanatory Approval Note */}
              <div className="p-2.5 rounded-xl bg-[#FFF9EE] border border-[#FDE68A] text-xs text-[#805B10] flex items-start gap-2">
                <Info className="w-4 h-4 text-[#805B10] shrink-0 mt-0.5" />
                <span className="leading-relaxed">
                  Lịch hẹn sau khi gửi sẽ ở trạng thái <strong>Chờ chủ nhà duyệt</strong>. Chủ nhà có quyền chấp nhận hoặc trao đổi lại khung giờ phù hợp.
                </span>
              </div>

              {/* Error Banner */}
              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Authentication Prompt if not logged in */}
              {!isAuthenticated && (
                <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1.5">
                  <div className="flex items-center gap-2 font-semibold">
                    <LogIn className="w-4 h-4 text-amber-700" />
                    <span>Bạn chưa đăng nhập</span>
                  </div>
                  <p className="text-[11px] text-amber-800 leading-relaxed">
                    Để nhận thông báo khi chủ nhà duyệt hoặc từ chối lịch hẹn, bạn vui lòng đăng nhập tài khoản người thuê trước khi gửi.
                  </p>
                  <div className="pt-1">
                    <Link
                      href={`/login?redirect=/listings/${listing.id}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#292524] hover:bg-black text-white font-medium text-xs transition-colors"
                    >
                      <span>Đăng nhập ngay</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              )}

              {/* 1. Select Viewing Date */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#292524] flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#805B10]" />
                  <span>1. Chọn ngày bạn muốn đến xem phòng</span>
                  <span className="text-rose-500">*</span>
                </label>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setViewingDate(todayStr)}
                    className={`py-1.5 px-2 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                      viewingDate === todayStr
                        ? "bg-[#FFF1CC] text-[#805B10] border-[#F4CD65] font-semibold"
                        : "bg-white text-[#57534E] border-[#E5E7EB] hover:bg-stone-50"
                    }`}
                  >
                    Hôm nay
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewingDate(tomorrowStr)}
                    className={`py-1.5 px-2 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                      viewingDate === tomorrowStr
                        ? "bg-[#FFF1CC] text-[#805B10] border-[#F4CD65] font-semibold"
                        : "bg-white text-[#57534E] border-[#E5E7EB] hover:bg-stone-50"
                    }`}
                  >
                    Ngày mai
                  </button>
                  <input
                    type="date"
                    min={todayStr}
                    value={viewingDate}
                    onChange={(e) => setViewingDate(e.target.value)}
                    className="py-1 px-2 rounded-xl text-xs font-medium border border-[#E5E7EB] bg-white text-[#292524] focus:outline-none focus:border-[#DCA936] cursor-pointer"
                  />
                </div>
              </div>

              {/* 2. Phone Number for Contact */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#292524] flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-[#78716C]" />
                  <span>2. Số điện thoại của bạn</span>
                  <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="Nhập số điện thoại để chủ nhà gọi/Zalo xác nhận..."
                  className="w-full p-2.5 rounded-xl border border-[#E5E7EB] text-xs text-[#292524] placeholder-[#A8A29E] focus:outline-none focus:border-[#DCA936]"
                />
              </div>

              {/* 3. Message for Landlord */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#292524] flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-[#78716C]" />
                  <span>3. Lời nhắn gửi chủ nhà</span>
                </label>

                {/* Quick Preset Phrases */}
                <div className="flex flex-wrap gap-1 pb-0.5">
                  {QUICK_MESSAGES.map((msg, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setMessage(msg)}
                      className="text-[10px] py-1 px-2 rounded-lg bg-stone-100 hover:bg-stone-200 text-[#57534E] transition-colors cursor-pointer text-left"
                    >
                      + {msg}
                    </button>
                  ))}
                </div>

                <textarea
                  rows={2}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Nhập câu hỏi hoặc chi tiết giờ hẹn..."
                  className="w-full p-2 rounded-xl border border-[#E5E7EB] text-xs text-[#292524] placeholder-[#A8A29E] focus:outline-none focus:border-[#DCA936] resize-none"
                />
              </div>
            </div>

            {/* Sticky Action Footer */}
            <div className="shrink-0 p-3.5 sm:p-4 border-t border-[#E5E7EB] bg-stone-50/80 flex items-center gap-2.5">
              <button
                type="button"
                onClick={handleResetAndClose}
                className="py-2.5 px-4 rounded-xl border border-[#E5E7EB] text-xs font-medium text-[#57534E] hover:bg-stone-100 transition-colors cursor-pointer"
              >
                Hủy
              </button>

              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 py-2.5 px-4 rounded-xl bg-[#F4CD65] hover:bg-[#ebbf4d] active:bg-[#dda934] disabled:opacity-50 text-[#292524] font-semibold text-xs transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                {isLoading ? (
                  <span>Đang gửi yêu cầu...</span>
                ) : (
                  <>
                    <CalendarCheck className="w-4 h-4" />
                    <span>Gửi yêu cầu để chủ nhà duyệt</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
