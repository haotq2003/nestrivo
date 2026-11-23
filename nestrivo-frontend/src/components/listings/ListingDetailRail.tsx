"use client";

import { useState } from "react";
import { Phone, Copy, Check, Calendar, CalendarCheck, Flag, Heart } from "lucide-react";
import { ListingItem, FEE_TYPE_LABELS, FEE_UNIT_LABELS } from "@/types/listing";
import { formatVND } from "@/lib/utils";
import BookingViewingModal from "./BookingViewingModal";
import ListingReportModal from "./ListingReportModal";
import { useFavorites } from "@/context/FavoritesContext";

interface ListingDetailRailProps {
  listing: ListingItem;
  isMock?: boolean;
}

export default function ListingDetailRail({ listing, isMock = false }: ListingDetailRailProps) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const isFav = isMock ? false : isFavorite(listing.id);
  const [phoneRevealed, setPhoneRevealed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [favSubmitting, setFavSubmitting] = useState(false);

  const handleToggleFavorite = async () => {
    if (isMock || favSubmitting) return;
    setFavSubmitting(true);
    try {
      await toggleFavorite(listing.id, listing);
    } finally {
      setFavSubmitting(false);
    }
  };

  const basePrice = Number(listing.price) || 0;
  const deposit = Number(listing.deposit) || 0;

  // Separate fixed monthly fees from usage-based rate fees
  const fixedFees = (listing.fees || []).filter(
    (f) => f.unit === "FIXED" || f.unit === "PER_MONTH" || f.unit === "PER_PERSON"
  );

  const usageFees = (listing.fees || []).filter(
    (f) =>
      f.unit === "PER_KWH" ||
      f.unit === "PER_M3" ||
      (!fixedFees.includes(f) &&
        f.unit !== "FIXED" &&
        f.unit !== "PER_MONTH" &&
        f.unit !== "PER_PERSON")
  );

  // Compute total monthly fixed cost (rent + fixed fees)
  const totalMonthlyCost = fixedFees.reduce((acc, f) => acc + (Number(f.amount) || 0), basePrice);

  const rawPhone = listing.landlord?.phoneNumber || "";

  const handleCopyPhone = () => {
    if (!rawPhone) return;
    navigator.clipboard.writeText(rawPhone);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return "Mới đăng";
    try {
      const d = new Date(dateStr);
      return `Đăng ngày ${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
    } catch {
      return "Mới đăng";
    }
  };

  const depositMonthsText =
    deposit > 0 && basePrice > 0 && deposit === basePrice
      ? " (1 tháng tiền phòng)"
      : deposit > 0 && basePrice > 0 && deposit === basePrice * 2
      ? " (2 tháng tiền phòng)"
      : "";

  return (
    <>
      {/* ========================================================= */}
      {/* 1. DESKTOP STICKY DECISION RAIL (Hidden on mobile < 1024px) */}
      {/* ========================================================= */}
      <aside className="hidden lg:block w-full bg-white border border-[#E5E7EB] rounded-3xl p-6 shadow-md shadow-slate-900/5 space-y-5">
        {/* Base Rent Header */}
        <div>
          <span className="text-xs font-medium text-[#78716C] block">
            Giá thuê niêm yết
          </span>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-3xl xl:text-4xl font-bold text-[#292524] tracking-tight">
              {formatVND(basePrice)}
            </span>
            <span className="text-sm font-normal text-[#78716C]">/tháng</span>
          </div>
        </div>

        <hr className="border-[#E5E7EB]" />

        {/* Cost Breakdown */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-[#292524]">
            Chi phí hàng tháng dự kiến
          </h3>

          <div className="space-y-2 text-sm text-[#292524]">
            <div className="flex justify-between items-center py-1 border-b border-[#E5E7EB]">
              <span className="text-[#57534E] font-normal">Tiền thuê phòng</span>
              <span className="font-semibold text-[#292524]">{formatVND(basePrice)}</span>
            </div>

            {fixedFees.map((fee) => {
              const label = fee.name || FEE_TYPE_LABELS[fee.type] || "Phí dịch vụ";
              const amountNum = Number(fee.amount) || 0;
              return (
                <div key={fee.id} className="flex justify-between items-center py-1 border-b border-[#E5E7EB]">
                  <span className="text-[#57534E] font-normal">{label}</span>
                  <span className="font-semibold text-[#292524]">
                    {amountNum === 0 ? (
                      <span className="text-emerald-700 font-medium text-xs bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        Đã bao gồm
                      </span>
                    ) : (
                      <>
                        {formatVND(amountNum)}
                        {fee.unit === "PER_PERSON" ? " /người" : ""}
                      </>
                    )}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Highlighted Total Monthly Box */}
          <div className="bg-[#FFF9EE] border border-[#FDE68A]/80 rounded-2xl p-4">
            <span className="block text-xs font-medium text-[#805B10]">
              Tổng cố định dự kiến mỗi tháng
            </span>
            <span className="text-xl font-bold text-[#805B10] block mt-0.5">
              {formatVND(totalMonthlyCost)}/tháng
            </span>
            <span className="text-[11px] text-[#78716C] block mt-1">
              (Chưa gồm điện, nước tính theo đồng hồ chỉ số)
            </span>
          </div>

          {/* Usage-based Rate Notes */}
          {usageFees.length > 0 && (
            <div className="text-xs text-[#78716C] space-y-1 pt-1 leading-relaxed">
              {usageFees.map((fee) => {
                const label = fee.name || FEE_TYPE_LABELS[fee.type] || "Chi phí";
                const unitStr = FEE_UNIT_LABELS[fee.unit] || "";
                const amountNum = Number(fee.amount) || 0;
                return (
                  <p key={fee.id}>
                    * {label}:{" "}
                    <span className="font-semibold text-[#292524]">
                      {amountNum === 0 ? (
                        <span className="text-emerald-700 font-medium text-xs bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                          Đã bao gồm
                        </span>
                      ) : (
                        `${formatVND(amountNum)} ${unitStr}`
                      )}
                    </span>{" "}
                    {amountNum > 0 && "(tính theo công tơ thực tế)."}
                  </p>
                );
              })}
            </div>
          )}
        </div>

        <hr className="border-[#E5E7EB]" />

        {/* Deposit Row */}
        <div className="flex justify-between items-center text-sm py-0.5">
          <span className="text-[#57534E] font-normal">Tiền đặt cọc</span>
          <span className="font-semibold text-[#292524]">
            {formatVND(deposit)}
            {depositMonthsText && (
              <span className="font-normal text-xs text-[#78716C] ml-1">
                {depositMonthsText}
              </span>
            )}
          </span>
        </div>

        {/* Action Buttons: Schedule Viewing & Contact */}
        <div className="pt-2 space-y-2.5">
          {/* Primary CTA: Schedule Viewing Tour */}
          <button
            type="button"
            onClick={() => setIsBookingOpen(true)}
            className="w-full h-12 bg-[#F4CD65] hover:bg-[#ebbf4d] active:bg-[#dda934] text-[#292524] font-semibold text-sm rounded-2xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <CalendarCheck className="w-4 h-4 text-[#292524]" />
            <span>Đặt lịch xem phòng</span>
          </button>

          {/* Secondary CTA: Reveal Phone Number */}
          {!phoneRevealed ? (
            <button
              type="button"
              onClick={() => setPhoneRevealed(true)}
              className="w-full h-11 bg-white hover:bg-stone-50 border border-[#E5E7EB] hover:border-stone-300 text-[#292524] font-medium text-xs sm:text-sm rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
            >
              <Phone className="w-3.5 h-3.5 text-[#78716C]" />
              <span>Xem số điện thoại liên hệ</span>
            </button>
          ) : (
            <div className="p-4 rounded-2xl bg-stone-50 border border-[#E5E7EB] space-y-3">
              <span className="text-xs text-[#78716C] font-medium block">
                Số điện thoại liên hệ chủ phòng:
              </span>
              <div className="flex items-center justify-between gap-2">
                <a
                  href={`tel:${rawPhone}`}
                  className="text-lg font-bold text-[#292524] hover:underline tracking-wider"
                >
                  {rawPhone || "Chưa cập nhật"}
                </a>
                {rawPhone && (
                  <button
                    type="button"
                    onClick={handleCopyPhone}
                    className="p-2 rounded-xl bg-white border border-[#E5E7EB] hover:bg-slate-100 text-[#292524] text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer"
                    title="Sao chép số"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-[#805B10]" />
                        <span className="text-[#805B10] font-medium">Đã chép</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-[#78716C]" />
                        <span>Sao chép</span>
                      </>
                    )}
                  </button>
                )}
              </div>
              {rawPhone && (
                <a
                  href={`tel:${rawPhone}`}
                  className="w-full h-10 bg-[#292524] hover:bg-black text-white font-medium text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-xs"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Gọi điện trực tiếp</span>
                </a>
              )}
            </div>
          )}

          {/* Favorite Toggle Button */}
          <button
            type="button"
            onClick={handleToggleFavorite}
            disabled={favSubmitting}
            className={`w-full h-11 border rounded-2xl font-medium text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs ${
              isFav
                ? "bg-rose-50 border-rose-200 text-rose-600 hover:bg-rose-100"
                : "bg-white hover:bg-stone-50 border-[#E5E7EB] text-[#57534E] hover:text-[#292524]"
            }`}
          >
            <Heart className={`w-4 h-4 transition-colors ${isFav ? "fill-rose-500 text-rose-500" : ""}`} />
            <span>{isFav ? "Đã lưu vào danh sách yêu thích" : "Lưu tin yêu thích"}</span>
          </button>
        </div>

        {/* Date & Views Footer */}
        <div className="pt-2 border-t border-[#E5E7EB] flex items-center justify-between text-xs text-[#78716C] font-normal">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-[#A8A29E]" />
            <span>{formatDate(listing.publishedAt || listing.createdAt)}</span>
          </div>
          {typeof listing.views === "number" && listing.views > 0 && (
            <span>{listing.views} lượt xem</span>
          )}
        </div>

        {/* Report Listing Button */}
        <div className="pt-1 flex items-center justify-center">
          <button
            type="button"
            onClick={() => setIsReportOpen(true)}
            className="flex items-center gap-1.5 text-xs text-stone-500 hover:text-rose-600 transition-colors py-1 cursor-pointer"
          >
            <Flag className="w-3.5 h-3.5 text-rose-500" />
            <span>Báo cáo tin sai lệch hoặc vi phạm</span>
          </button>
        </div>
      </aside>

      {/* ========================================================= */}
      {/* 2. MOBILE INLINE SUMMARY CARD (Visible only on < 1024px) */}
      {/* ========================================================= */}
      <div className="block lg:hidden bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-xs space-y-3">
        <div className="flex items-baseline justify-between">
          <div>
            <span className="text-xs text-[#78716C] font-medium block">Giá thuê niêm yết</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-2xl font-bold text-[#292524]">{formatVND(basePrice)}</span>
              <span className="text-xs text-[#78716C]">/tháng</span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs text-[#805B10] font-medium block">Tổng cố định dự kiến</span>
            <span className="text-lg font-bold text-[#805B10]">{formatVND(totalMonthlyCost)}/th</span>
          </div>
        </div>

        {deposit > 0 && (
          <div className="text-xs text-[#57534E] flex justify-between py-1.5 border-t border-[#E5E7EB]">
            <span>Tiền đặt cọc</span>
            <span className="text-[#292524] font-semibold">
              {formatVND(deposit)} {depositMonthsText}
            </span>
          </div>
        )}

        <button
          type="button"
          onClick={() => setIsBookingOpen(true)}
          className="w-full py-2.5 bg-[#F4CD65] hover:bg-[#ebbf4d] text-[#292524] font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-xs"
        >
          <CalendarCheck className="w-4 h-4" />
          <span>Đặt lịch hẹn xem phòng ngay</span>
        </button>

        <div className="flex items-center justify-center pt-1 border-t border-stone-100">
          <button
            type="button"
            onClick={() => setIsReportOpen(true)}
            className="flex items-center gap-1.5 text-[11px] text-stone-500 hover:text-rose-600 transition-colors cursor-pointer"
          >
            <Flag className="w-3 h-3 text-rose-500" />
            <span>Báo cáo tin sai lệch</span>
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 3. MOBILE STICKY BOTTOM BAR (Visible only on < 1024px)    */}
      {/* ========================================================= */}
      <div className="block lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E5E7EB] px-4 py-3 shadow-lg">
        <div className="max-w-md mx-auto flex items-center justify-between gap-2.5">
          <div>
            <span className="text-[11px] text-[#78716C] block font-normal">Tổng cố định/tháng</span>
            <div className="text-base font-bold text-[#292524] leading-tight">
              {formatVND(totalMonthlyCost)}
              <span className="text-xs text-[#78716C] font-normal">/th</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick Favorite Button */}
            <button
              type="button"
              onClick={handleToggleFavorite}
              disabled={favSubmitting}
              className={`w-11 h-11 rounded-xl flex items-center justify-center transition-colors border cursor-pointer ${
                isFav
                  ? "bg-rose-50 border-rose-200 text-rose-600"
                  : "bg-stone-100 hover:bg-stone-200 text-[#57534E] border-[#E5E7EB]"
              }`}
              title={isFav ? "Bỏ lưu tin" : "Lưu tin"}
            >
              <Heart className={`w-4 h-4 ${isFav ? "fill-rose-500 text-rose-500" : ""}`} />
            </button>

            {/* Quick Call Button */}
            {rawPhone ? (
              <a
                href={`tel:${rawPhone}`}
                className="w-11 h-11 rounded-xl bg-stone-100 hover:bg-stone-200 text-[#292524] flex items-center justify-center transition-colors border border-[#E5E7EB]"
                title="Gọi chủ nhà"
              >
                <Phone className="w-4 h-4" />
              </a>
            ) : null}

            {/* Schedule Button */}
            <button
              type="button"
              onClick={() => setIsBookingOpen(true)}
              className="h-11 px-4 bg-[#F4CD65] hover:bg-[#ebbf4d] active:bg-[#dda934] text-[#292524] font-semibold text-xs sm:text-sm rounded-xl flex items-center gap-1.5 shadow-xs transition-all cursor-pointer whitespace-nowrap"
            >
              <CalendarCheck className="w-4 h-4" />
              <span>Đặt lịch xem</span>
            </button>
          </div>
        </div>
      </div>

      {/* Booking Viewing Modal */}
      <BookingViewingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        listing={listing}
      />

      {/* Listing Violation Report Modal */}
      <ListingReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        listingId={listing.id}
        listingTitle={listing.title}
      />
    </>
  );
}
