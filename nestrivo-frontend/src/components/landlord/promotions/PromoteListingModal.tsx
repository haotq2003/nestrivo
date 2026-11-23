"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { 
  X, 
  Sparkles, 
  Check, 
  ShieldCheck, 
  AlertCircle, 
  ArrowRight, 
  Loader2, 
  CheckCircle2,
  Calendar,
  Copy,
  Info,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { formatVND } from "@/lib/utils";
import { resolveListingThumbnail, handleListingImageError } from "@/lib/image";
import { useAuth } from "@/context/AuthContext";
import { promotionService } from "@/service/promotion.service";
import { PromotionPlan } from "@/types/promotion";

interface PromoteListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  listing: {
    id: string;
    title: string;
    address: string;
    price: number | string;
    thumbnailUrl?: string;
    images?: Array<{ imageUrl?: string }>;
    currentTier?: string;
    promotionRemainingDays?: number;
    promotionEndDate?: string | null;
  };
  onSuccess?: () => void;
}

export function PromoteListingModal({
  isOpen,
  onClose,
  listing,
  onSuccess,
}: PromoteListingModalProps) {
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);

  // Data states
  const [plans, setPlans] = useState<PromotionPlan[]>([]);
  const [selectedPlanCode, setSelectedPlanCode] = useState<string>("PROMO_30D");
  const [isLoadingPlans, setIsLoadingPlans] = useState(true);

  // Workflow states: 'select' -> 'success'
  const [step, setStep] = useState<"select" | "success">("select");
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Optional Sandbox Test Card Helper Accordion
  const [showSandboxGuide, setShowSandboxGuide] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Landlord verification check
  const isKycVerified = user?.landlordProfile?.verificationStatus === "VERIFIED";

  useEffect(() => {
    setMounted(true);
  }, []);

  // Keyboard and scroll lock
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow || "unset";
    };
  }, [isOpen]);

  // Load plans on modal open
  useEffect(() => {
    if (isOpen) {
      loadPlans();
    }
  }, [isOpen]);

  const loadPlans = async () => {
    try {
      setIsLoadingPlans(true);
      setErrorMsg(null);
      const data = await promotionService.getPlans();
      setPlans(data);
      if (data.length > 0) {
        const has30D = data.find((p) => p.code === "PROMO_30D");
        setSelectedPlanCode(has30D ? "PROMO_30D" : data[0].code);
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Không thể tải danh sách gói nổi bật.");
    } finally {
      setIsLoadingPlans(false);
    }
  };

  const handleClose = () => {
    setStep("select");
    setIsRedirecting(false);
    setErrorMsg(null);
    setCopiedField(null);
    setShowSandboxGuide(false);
    onClose();
  };

  const handleCopyText = (text: string, fieldKey: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldKey);
    setTimeout(() => {
      setCopiedField((prev) => (prev === fieldKey ? null : prev));
    }, 2000);
  };

  // Create order & REDIRECT DIRECTLY to MoMo Payment Gateway
  const handleProceedToMoMo = async () => {
    if (!isKycVerified) {
      setErrorMsg("Vui lòng hoàn tất Xác minh danh tính chủ nhà (eKYC) trước khi mua gói quảng bá.");
      return;
    }

    const selectedPlan = plans.find((p) => p.code === selectedPlanCode);
    if (!selectedPlan) {
      setErrorMsg("Vui lòng chọn 1 chu kỳ gói nổi bật.");
      return;
    }

    try {
      setIsRedirecting(true);
      setErrorMsg(null);

      // 1. Tạo đơn hàng
      const orderRes = await promotionService.createOrder({
        listingId: listing.id,
        planId: selectedPlan.id,
      });

      const orderId = orderRes.order.id;

      // 2. Yêu cầu link thanh toán MoMo (payWithATM)
      const momoRes = await promotionService.createMoMoPayment(orderId, "payWithATM");

      if (momoRes.data?.payUrl) {
        // 3. Chuyển hướng trực tiếp sang cổng thanh toán MoMo ngay lập tức
        window.location.href = momoRes.data.payUrl;
      } else {
        throw new Error("Không nhận được liên kết thanh toán từ cổng MoMo.");
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Lỗi khi kết nối tới cổng thanh toán MoMo.");
      setIsRedirecting(false);
    }
  };

  if (!isOpen || !mounted) return null;

  const selectedPlan = plans.find((p) => p.code === selectedPlanCode);
  const roomThumbnail = resolveListingThumbnail(listing.thumbnailUrl, listing.images);

  const modalContent = (
    <div
      className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs flex items-start justify-center overflow-y-auto pt-16 sm:pt-20 pb-12 px-3 sm:px-4 animate-fade-in"
      style={{ zIndex: 999999 }}
      onClick={handleClose}
    >
      <div
        className="relative bg-[#FFFDF7] rounded-3xl max-w-xl w-full border border-[#EDE5D5] shadow-2xl flex flex-col max-h-[calc(100vh-100px)] overflow-hidden my-0"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="shrink-0 p-5 sm:p-6 border-b border-[#EDE5D5] flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FFF1CC] text-[#805B10] flex items-center justify-center border border-[#F4CD65]/60 shadow-2xs">
              <Sparkles className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-[#292524] flex items-center gap-2">
                <span>{listing.promotionRemainingDays && listing.promotionRemainingDays > 0 ? "Gia hạn Tin Nổi Bật" : "Nâng cấp Tin Nổi Bật"}</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#F4CD65] text-[#292524]">
                  Ưu tiên số 1
                </span>
              </h3>
              <p className="text-xs text-[#78716C]">
                Đưa phòng lên đầu Trang chủ và kết quả tìm kiếm với lượt tiếp cận cao nhất
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="w-8 h-8 rounded-full hover:bg-[#FFF7E5] flex items-center justify-center text-[#78716C] hover:text-[#292524] transition-colors cursor-pointer"
            aria-label="Đóng"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {/* Room Summary Header */}
          <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white border border-[#EDE5D5] shadow-2xs">
            <img
              src={roomThumbnail}
              alt={listing.title}
              referrerPolicy="no-referrer"
              loading="lazy"
              onError={handleListingImageError}
              className="w-14 h-12 rounded-xl object-cover bg-[#FFF7E5] shrink-0 border border-stone-200"
            />
            <div className="min-w-0 flex-1">
              <h4 className="font-bold text-xs sm:text-sm text-[#292524] truncate">
                {listing.title}
              </h4>
              <p className="text-[11px] text-[#78716C] truncate">{listing.address}</p>
              {listing.promotionRemainingDays && listing.promotionRemainingDays > 0 ? (
                <div className="mt-1 flex items-center gap-1.5 text-[11px] font-bold text-[#805B10]">
                  <Sparkles className="w-3 h-3 text-amber-600" />
                  <span>
                    Đang kích hoạt: Còn <strong>{listing.promotionRemainingDays} ngày</strong>
                    {listing.promotionEndDate && ` (đến ${new Date(listing.promotionEndDate).toLocaleDateString("vi-VN")})`}
                  </span>
                </div>
              ) : null}
            </div>
            <div className="text-right shrink-0">
              <span className="text-xs sm:text-sm font-bold text-[#805B10] tabular-nums">
                {formatVND(listing.price)}
              </span>
              <span className="text-[10px] text-[#78716C] block">/tháng</span>
            </div>
          </div>

          {/* KYC Gatekeeper Warning if NOT VERIFIED */}
          {!isKycVerified && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 space-y-2">
              <div className="flex items-center gap-2 font-bold text-xs sm:text-sm text-amber-950">
                <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0" />
                <span>Yêu cầu xác minh danh tính chủ nhà</span>
              </div>
              <p className="text-xs leading-relaxed text-amber-800">
                Để bảo vệ an toàn cho người thuê và chất lượng tin nổi bật, bạn cần hoàn tất xác minh CCCD trước khi thanh toán.
              </p>
              <Link
                href="/landlord/verification"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-semibold transition-colors mt-1"
              >
                <span>Xác minh ngay (eKYC)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}

          {/* Error Message if any */}
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* STEP 1: SELECT PACKAGE CYCLE */}
          {step === "select" && (
            <div className="space-y-4">
              {/* Value Proposition Box */}
              <div className="p-4 rounded-2xl bg-[#FFF9EE] border border-[#FDE68A] space-y-2">
                <span className="text-xs font-bold text-[#805B10] uppercase tracking-wider block">
                  Đặc quyền khi nâng cấp Tin Nổi Bật:
                </span>
                <ul className="text-xs text-[#57534E] space-y-1.5 leading-relaxed">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Xuất hiện ở vị trí ưu tiên đầu tiên trên Trang chủ.</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Thuật toán xoay vòng Round-Robin công bằng theo mỗi lượt khách truy cập.</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Khung viền vàng ấm áp + huy hiệu <strong>✨ Nổi bật</strong> nhận diện tức thì.</span>
                  </li>
                </ul>
              </div>

              {/* Package Plan Choices */}
              <div className="space-y-2.5">
                <label className="block text-xs font-bold text-[#292524] uppercase tracking-wider">
                  Chọn chu kỳ hiển thị:
                </label>

                {isLoadingPlans ? (
                  <div className="py-8 text-center text-xs text-stone-500 flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-[#805B10]" />
                    <span>Đang tải các gói tin nổi bật...</span>
                  </div>
                ) : plans.length === 0 ? (
                  <div className="p-4 rounded-2xl bg-stone-100 text-center text-xs text-stone-600">
                    Hiện chưa có gói tin nào mở bán. Vui lòng liên hệ Admin.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {plans.map((p) => {
                      const isSelected = selectedPlanCode === p.code;
                      return (
                        <div
                          key={p.code}
                          onClick={() => setSelectedPlanCode(p.code)}
                          className={`relative p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between min-h-[110px] ${
                            isSelected
                              ? "border-[#F4CD65] bg-[#FFF9EE] shadow-sm ring-1 ring-[#F4CD65]"
                              : "border-[#EDE5D5] bg-white hover:border-[#DCA936] hover:bg-[#FFFDF7]"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <span className="font-bold text-xs sm:text-sm text-[#292524] block">
                                {p.name}
                              </span>
                              <span className="text-[11px] text-[#78716C] flex items-center gap-1 mt-0.5">
                                <Calendar className="w-3 h-3 text-[#805B10]" />
                                <span>{p.durationDays} ngày hiển thị</span>
                              </span>
                            </div>

                            <div
                              className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all ${
                                isSelected
                                  ? "bg-[#F4CD65] border-[#DCA936] text-[#292524]"
                                  : "border-stone-300 bg-white"
                              }`}
                            >
                              {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                            </div>
                          </div>

                          <div className="mt-3 pt-2 border-t border-[#EDE5D5] flex items-baseline justify-between">
                            <span className="text-sm sm:text-base font-bold text-[#805B10] tabular-nums">
                              {formatVND(p.price)}
                            </span>
                            <span className="text-[10px] text-stone-500 font-medium">
                              ~{formatVND(Math.round(Number(p.price) / p.durationDays))}/ngày
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Payment Gateway info */}
              <div className="p-3.5 rounded-2xl bg-white border border-[#EDE5D5] flex items-center justify-between text-xs text-[#57534E] shadow-2xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#D82D8B] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                    M
                  </div>
                  <div>
                    <span className="font-bold text-[#292524] block">Thanh toán an toàn qua Cổng MoMo</span>
                    <span className="text-[11px] text-stone-500">Chuyển hướng trực tiếp sang cổng thanh toán MoMo</span>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 text-[10px] font-semibold border border-emerald-200">
                  Tự động kích hoạt
                </span>
              </div>

              {/* Collapsible Sandbox Test Note (For Developers / Testers) */}
              <div className="rounded-2xl border border-amber-200/80 bg-amber-50/50 overflow-hidden text-xs">
                <button
                  type="button"
                  onClick={() => setShowSandboxGuide((prev) => !prev)}
                  className="w-full p-3 flex items-center justify-between text-left font-semibold text-amber-900 hover:bg-amber-100/60 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Info className="w-4 h-4 text-amber-700 shrink-0" />
                    <span>Thông tin thẻ ATM Agribank giả lập (Dành cho MoMo Sandbox)</span>
                  </div>
                  {showSandboxGuide ? (
                    <ChevronUp className="w-4 h-4 text-amber-700" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-amber-700" />
                  )}
                </button>

                {showSandboxGuide && (
                  <div className="p-3 pt-0 border-t border-amber-200/60 space-y-2 text-[11px] text-amber-900">
                    <p className="leading-relaxed">
                      Trên cổng MoMo Sandbox, chọn phương thức <strong>Thẻ ATM nội địa &rarr; Agribank</strong> và nhập:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-white/80 p-2.5 rounded-xl border border-amber-200">
                      <div>
                        <span className="text-stone-500 block">Số thẻ ATM:</span>
                        <div className="flex items-center gap-1 font-mono font-bold text-stone-900">
                          <span>9704 0000 0000 0018</span>
                          <button
                            type="button"
                            onClick={() => handleCopyText("9704000000000018", "card")}
                            className="text-amber-800 hover:text-amber-950 transition-colors p-0.5 cursor-pointer"
                            title="Sao chép số thẻ"
                          >
                            {copiedField === "card" ? (
                              <Check className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </div>

                      <div>
                        <span className="text-stone-500 block">Tên chủ thẻ:</span>
                        <span className="font-mono font-bold text-stone-900">NGUYEN VAN A</span>
                      </div>

                      <div>
                        <span className="text-stone-500 block">Hạn sử dụng:</span>
                        <span className="font-mono font-bold text-stone-900">03/07</span>
                      </div>

                      <div>
                        <span className="text-stone-500 block">Mã OTP:</span>
                        <span className="font-mono font-bold text-stone-900">Bất kỳ (ví dụ: OTP)</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 2: SUCCESS VIEW */}
          {step === "success" && (
            <div className="text-center space-y-4 py-4">
              <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto shadow-xs">
                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
              </div>

              <div className="space-y-1">
                <h4 className="text-xl font-bold text-[#292524]">
                  Kích hoạt Tin Nổi Bật thành công!
                </h4>
                <p className="text-xs sm:text-sm text-[#57534E] max-w-sm mx-auto leading-relaxed">
                  Tin đăng của bạn đã được nâng cấp lên vị trí <strong>Phòng Nổi Bật</strong>. Tin sẽ được ghim ưu tiên trên Trang chủ và xoay vòng theo lượt truy cập.
                </p>
              </div>

              {/* Summary of Activated Package */}
              <div className="p-4 rounded-2xl bg-white border border-[#EDE5D5] max-w-sm mx-auto text-left text-xs space-y-2 shadow-2xs">
                <div className="flex justify-between items-center border-b border-[#EDE5D5] pb-1.5">
                  <span className="text-stone-500">Phòng:</span>
                  <span className="font-semibold text-[#292524] truncate max-w-[200px]">{listing.title}</span>
                </div>
                <div className="flex justify-between items-center border-b border-[#EDE5D5] pb-1.5">
                  <span className="text-stone-500">Gói dịch vụ:</span>
                  <span className="font-semibold text-[#805B10]">
                    Tin Nổi Bật ({selectedPlan?.durationDays} ngày)
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-stone-500">Trạng thái:</span>
                  <span className="font-semibold text-emerald-700 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Đang hiển thị nổi bật
                  </span>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2.5">
                <Link
                  href="/"
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#F4CD65] hover:bg-[#ebbf4d] text-[#292524] font-semibold text-xs transition-colors"
                >
                  Xem tin trên Trang chủ
                </Link>
                <button
                  type="button"
                  onClick={handleClose}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white border border-stone-200 text-stone-600 hover:bg-stone-50 font-medium text-xs transition-colors cursor-pointer"
                >
                  Đóng
                </button>
              </div>
            </div>
          )}
        </div>

        {/* FOOTER ACTIONS */}
        {step === "select" && (
          <div className="shrink-0 p-4 sm:p-5 border-t border-[#EDE5D5] bg-white flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="w-full sm:w-auto text-left">
              <span className="text-[11px] text-[#78716C] block">Tổng thanh toán:</span>
              <span className="text-lg sm:text-xl font-bold text-[#805B10] tabular-nums">
                {selectedPlan ? formatVND(selectedPlan.price) : "0 ₫"}
              </span>
            </div>

            <div className="w-full sm:w-auto flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={handleClose}
                disabled={isRedirecting}
                className="py-2.5 px-4 rounded-xl border border-stone-200 text-xs font-semibold text-stone-600 hover:bg-stone-100 transition-colors cursor-pointer"
              >
                Hủy
              </button>

              <button
                type="button"
                onClick={handleProceedToMoMo}
                disabled={!isKycVerified || isRedirecting || isLoadingPlans}
                className="py-2.5 px-5 rounded-xl bg-[#D82D8B] hover:bg-[#c2247b] active:bg-[#a81c69] disabled:opacity-50 text-white font-bold text-xs transition-all shadow-md shadow-pink-500/20 flex items-center gap-2 cursor-pointer"
              >
                {isRedirecting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Đang chuyển sang cổng MoMo...</span>
                  </>
                ) : (
                  <>
                    <span>{listing.promotionRemainingDays && listing.promotionRemainingDays > 0 ? "Gia hạn qua cổng MoMo" : "Thanh toán qua cổng MoMo"}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
