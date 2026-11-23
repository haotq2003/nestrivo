"use client";

import Link from "next/link";
import { 
  ArrowLeft, 
  Menu, 
  Eye, 
  Edit3, 
  ShieldAlert, 
  Clock, 
  CheckCircle2, 
  EyeOff, 
  FileText,
  DoorOpen,
  DoorClosed,
  Sparkles
} from "lucide-react";
import { LandlordListingItem } from "@/types/landlord";
import { NotificationBell } from "@/components/layout/NotificationBell";

interface ListingDetailHeaderProps {
  listing: LandlordListingItem;
  onToggleMobileMenu: () => void;
  onPromote?: () => void;
}

export function ListingDetailHeader({
  listing,
  onToggleMobileMenu,
  onPromote,
}: ListingDetailHeaderProps) {
  const getStatusBadge = () => {
    switch (listing.status) {
      case "PUBLISHED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-[#FFF7E5] text-[#292524] border border-[#EDE5D5]">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#DCA936]" />
            <span>Đã xuất bản</span>
          </span>
        );
      case "PENDING_APPROVAL":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-[#FFF1CC] text-[#805B10] border border-[#F4CD65]/40">
            <Clock className="w-3.5 h-3.5 text-[#DCA936]" />
            <span>Đang chờ duyệt</span>
          </span>
        );
      case "REJECTED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-rose-50 text-rose-800 border border-rose-200/90">
            <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
            <span>Bị từ chối</span>
          </span>
        );
      case "HIDDEN":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-stone-100 text-[#57534E] border border-stone-200">
            <EyeOff className="w-3.5 h-3.5 text-[#78716C]" />
            <span>Tạm ẩn</span>
          </span>
        );
      case "DRAFT":
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-stone-100 text-[#57534E] border border-stone-200">
            <FileText className="w-3.5 h-3.5 text-[#78716C]" />
            <span>Bản nháp</span>
          </span>
        );
    }
  };

  const getAvailabilityBadge = () => {
    if (listing.availabilityStatus === "RENTED") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-indigo-50 text-indigo-800 border border-indigo-200/80">
          <DoorClosed className="w-3.5 h-3.5 text-indigo-600" />
          <span>Đã cho thuê</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-[#FFF1CC] text-[#292524] border border-[#F4CD65]/40">
        <DoorOpen className="w-3.5 h-3.5 text-[#DCA936]" />
        <span>Còn phòng trống</span>
      </span>
    );
  };

  return (
    <header className="bg-white border-b border-[#EDE5D5] px-4 sm:px-6 lg:px-8 xl:px-10 py-3.5 sticky top-0 z-30 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Left: Back button & Breadcrumb */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onToggleMobileMenu}
            className="p-2 rounded-xl text-[#78716C] hover:text-[#292524] hover:bg-[#FFF7E5] lg:hidden focus:outline-none"
            aria-label="Mở menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <Link
            href="/landlord/dashboard"
            className="p-2 rounded-xl text-[#78716C] hover:text-[#292524] hover:bg-[#FFF7E5] transition-colors shrink-0"
            title="Quay lại Bảng điều khiển"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>

          <div className="min-w-0">
            <div className="flex items-center gap-2 text-xs text-[#78716C]">
              <Link href="/landlord/dashboard" className="hover:text-[#DCA936] transition-colors">
                Bảng điều khiển
              </Link>
              <span>/</span>
              <span className="text-[#292524] font-medium">Chi tiết tin đăng</span>
            </div>
            <h1 className="text-base sm:text-lg font-semibold text-[#292524] truncate leading-snug">
              {listing.title}
            </h1>
          </div>
        </div>

        {/* Right: Status Badges & Quick Links */}
        <div className="flex items-center flex-wrap gap-2 sm:self-center ml-auto sm:ml-0">
          {getStatusBadge()}
          {getAvailabilityBadge()}

          {/* Promote listing button */}
          {listing.status === "PUBLISHED" && (
            <button
              type="button"
              onClick={onPromote}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-2xs ${
                listing.currentTier === "VIP" || listing.currentTier === "HOT" || (listing.promotionRemainingDays && listing.promotionRemainingDays > 0)
                  ? "bg-[#FFF1CC] hover:bg-[#F4CD65]/40 text-[#805B10] border border-[#F4CD65]"
                  : "bg-[#F4CD65] hover:bg-[#ebbf4d] text-[#292524]"
              }`}
              title={
                listing.promotionEndDate
                  ? `Tin Nổi Bật còn ${listing.promotionRemainingDays} ngày (đến ${new Date(listing.promotionEndDate).toLocaleDateString("vi-VN")})`
                  : listing.currentTier === "VIP" || listing.currentTier === "HOT"
                  ? "Gói Tin Nổi Bật đang hoạt động"
                  : "Nâng cấp lên Tin Nổi Bật"
              }
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-700" />
              <span>
                {listing.promotionRemainingDays && listing.promotionRemainingDays > 0
                  ? `Nổi bật • Còn ${listing.promotionRemainingDays} ngày`
                  : listing.currentTier === "VIP" || listing.currentTier === "HOT"
                  ? "Đang nổi bật"
                  : "Đẩy tin"}
              </span>
            </button>
          )}

          {/* Preview public listing button */}
          <Link
            href={`/listings/${listing.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-[#FFF7E5] hover:bg-[#FFF1CC] text-[#292524] transition-colors ml-1"
            title="Xem trang người thuê (tab mới)"
          >
            <Eye className="w-3.5 h-3.5 text-[#78716C]" />
            <span className="hidden xs:inline">Xem trang người thuê</span>
          </Link>

          {/* Notification Bell */}
          <NotificationBell />

          {/* Edit button */}
          <Link
            href={`/landlord/listings/${listing.id}/edit`}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-[#FFF7E5] hover:bg-[#FFF1CC] text-[#292524] transition-all border border-slate-200"
            title="Chỉnh sửa thông tin tin đăng này"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Chỉnh sửa</span>
          </Link>
        </div>
      </div>
    </header>
  );
}

