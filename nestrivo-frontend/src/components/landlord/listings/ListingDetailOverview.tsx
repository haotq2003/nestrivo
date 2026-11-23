"use client";

import Link from "next/link";
import { 
  Building2, 
  MapPin, 
  Maximize, 
  Bed, 
  Bath, 
  Users, 
  Calendar, 
  ShieldAlert, 
  Clock, 
  EyeOff, 
  CheckCircle2, 
  DollarSign, 
  Coins, 
  Heart, 
  MessageSquare, 
  FileEdit, 
  Trash2, 
  Send,
  Eye,
  DoorOpen,
  DoorClosed,
  Dog,
  Layers,
  Armchair,
  Info,
  ChevronRight,
  ExternalLink
} from "lucide-react";
import { LandlordListingItem } from "@/types/landlord";
import { PROPERTY_TYPE_LABELS, FEE_TYPE_LABELS, FEE_UNIT_LABELS } from "@/types/listing";
import { formatListingDate, formatPriceVnd } from "@/lib/landlord-listing-helpers";
import { formatArea } from "@/lib/utils";
import { ActionModalType } from "./ListingActionModal";

interface ListingDetailOverviewProps {
  listing: LandlordListingItem;
  onRequestAction: (type: ActionModalType) => void;
}

export function ListingDetailOverview({
  listing,
  onRequestAction,
}: ListingDetailOverviewProps) {
  const propertyTypeLabel = PROPERTY_TYPE_LABELS[listing.propertyType] || listing.propertyType;

  const isDeletable = listing.status === "DRAFT" || listing.status === "REJECTED";
  const canToggleVisibility = listing.status === "PUBLISHED" || listing.status === "HIDDEN";
  const canSubmitForReview = listing.status === "DRAFT" || listing.status === "REJECTED";

  return (
    <div className="space-y-6">
      {/* 1. Status Banners */}
      {listing.status === "REJECTED" && (
        <div className="p-4 sm:p-5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 shadow-2xs space-y-2">
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0" />
            <h2 className="text-sm sm:text-base font-semibold text-rose-900">
              Tin đăng bị từ chối phê duyệt bởi Ban Quản Trị
            </h2>
          </div>
          <div className="pl-7 space-y-2">
            <p className="text-xs sm:text-sm text-rose-800 leading-relaxed bg-white/70 p-3 rounded-xl border border-rose-200/60 font-normal">
              <strong className="font-semibold text-rose-900">Lý do từ chối: </strong>
              {listing.rejectionReason || "Thông tin phòng chưa đáp ứng đầy đủ tiêu chuẩn kiểm duyệt của Nestrivo. Vui lòng cập nhật lại thông tin."}
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Link
                href={`/landlord/listings/new?edit=${listing.id}`}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium bg-rose-600 hover:bg-rose-700 text-white transition-colors shadow-2xs"
              >
                <FileEdit className="w-3.5 h-3.5" />
                <span>Chỉnh sửa thông tin vi phạm</span>
              </Link>
              <button
                type="button"
                onClick={() => onRequestAction("SUBMIT_REVIEW")}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium bg-white text-rose-700 hover:bg-rose-100 border border-rose-200 transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Gửi duyệt lại</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {listing.status === "PENDING_APPROVAL" && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 shadow-2xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Clock className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <h2 className="text-sm font-semibold text-amber-900">
                Tin đăng đang trong hàng đợi chờ kiểm duyệt
              </h2>
              <p className="text-xs text-amber-700 font-normal">
                Đội ngũ Nestrivo sẽ rà soát tính xác thực và phê duyệt hiển thị trong vòng 24h làm việc.
              </p>
            </div>
          </div>
        </div>
      )}

      {listing.status === "HIDDEN" && (
        <div className="p-4 rounded-2xl bg-stone-100 border border-stone-200 text-[#292524] shadow-2xs flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <EyeOff className="w-5 h-5 text-[#78716C] shrink-0" />
            <div>
              <h2 className="text-sm font-semibold text-[#292524]">
                Tin đăng đang tạm ẩn
              </h2>
              <p className="text-xs text-[#57534E] font-normal">
                Người thuê không thể tìm thấy tin này trên sàn Nestrivo. Bạn có thể bật hiển thị lại bất cứ lúc nào.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onRequestAction("TOGGLE_VISIBILITY")}
            className="px-3 py-1.5 rounded-xl bg-[#F4CD65] hover:bg-[#ebbf4d] text-[#292524] text-xs font-medium transition-all ml-auto shadow-xs"
          >
            Bật hiển thị lại
          </button>
        </div>
      )}

      {listing.availabilityStatus === "RENTED" && (
        <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-900 shadow-2xs flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <DoorClosed className="w-5 h-5 text-indigo-600 shrink-0" />
            <div>
              <h2 className="text-sm font-semibold text-indigo-900">
                Phòng đang ở trạng thái: ĐÃ CHO THUÊ
              </h2>
              <p className="text-xs text-indigo-700 font-normal">
                Tin vẫn hiển thị nhãn &quot;Đã thuê&quot; để người thuê biết phòng tạm thời không tiếp nhận liên hệ mới.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onRequestAction("TOGGLE_AVAILABILITY")}
            className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium transition-colors ml-auto"
          >
            Đánh dấu còn trống
          </button>
        </div>
      )}

      {/* 2. Main 2-Column Responsive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Details & Description & Amenities (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Property Features */}
          <div className="bg-white rounded-3xl border border-[#EDE5D5] p-5 sm:p-6 shadow-xs space-y-4">
            <h2 className="text-sm font-semibold text-[#292524] pb-2 border-b border-[#EDE5D5] flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#DCA936]" />
              <span>Đặc điểm & Thông số phòng</span>
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <div className="p-3 rounded-xl bg-[#FFF7E5] border border-[#EDE5D5] space-y-1">
                <span className="text-[11px] font-medium text-[#78716C] flex items-center gap-1">
                  <Maximize className="w-3.5 h-3.5 text-[#A8A29E]" />
                  Diện tích
                </span>
                <p className="text-sm font-semibold text-[#292524]">{formatArea(listing.area)}</p>
              </div>

              <div className="p-3 rounded-xl bg-[#FFF7E5] border border-[#EDE5D5] space-y-1">
                <span className="text-[11px] font-medium text-[#78716C] flex items-center gap-1">
                  <Bed className="w-3.5 h-3.5 text-[#A8A29E]" />
                  Phòng ngủ
                </span>
                <p className="text-sm font-semibold text-[#292524]">{listing.bedrooms || 1} phòng</p>
              </div>

              <div className="p-3 rounded-xl bg-[#FFF7E5] border border-[#EDE5D5] space-y-1">
                <span className="text-[11px] font-medium text-[#78716C] flex items-center gap-1">
                  <Bath className="w-3.5 h-3.5 text-[#A8A29E]" />
                  Phòng tắm
                </span>
                <p className="text-sm font-semibold text-[#292524]">{listing.bathrooms || 1} WC</p>
              </div>

              <div className="p-3 rounded-xl bg-[#FFF7E5] border border-[#EDE5D5] space-y-1">
                <span className="text-[11px] font-medium text-[#78716C] flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-[#A8A29E]" />
                  Sức chứa
                </span>
                <p className="text-sm font-semibold text-[#292524]">Tối đa {listing.maxOccupants || 2} người</p>
              </div>
            </div>

            {/* Sub-features: Pets, Mezzanine, Furnished, Minimum Stay */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
              <div className="flex items-center gap-2 text-[#57534E]">
                <Armchair className="w-4 h-4 text-[#DCA936] shrink-0" />
                <span>Nội thất: <strong className="font-medium text-[#292524]">{listing.isFurnished ? "Đầy đủ" : "Cơ bản"}</strong></span>
              </div>
              <div className="flex items-center gap-2 text-[#57534E]">
                <Layers className="w-4 h-4 text-[#DCA936] shrink-0" />
                <span>Gác lửng: <strong className="font-medium text-[#292524]">{listing.hasMezzanine ? "Có gác" : "Không"}</strong></span>
              </div>
              <div className="flex items-center gap-2 text-[#57534E]">
                <Dog className="w-4 h-4 text-[#DCA936] shrink-0" />
                <span>Thú cưng: <strong className="font-medium text-[#292524]">{listing.allowsPets ? "Cho phép" : "Không"}</strong></span>
              </div>
              <div className="flex items-center gap-2 text-[#57534E]">
                <Calendar className="w-4 h-4 text-[#DCA936] shrink-0" />
                <span>Hợp đồng: <strong className="font-medium text-[#292524]">Tối thiểu {listing.minimumStayMonths || 6} tháng</strong></span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="bg-white rounded-3xl border border-[#EDE5D5] p-5 sm:p-6 shadow-xs space-y-3">
            <h2 className="text-sm font-semibold text-[#292524] pb-2 border-b border-[#EDE5D5] flex items-center gap-2">
              <Info className="w-4 h-4 text-[#DCA936]" />
              <span>Mô tả chi tiết phòng</span>
            </h2>

            <div className="text-xs sm:text-sm text-[#292524] leading-relaxed whitespace-pre-line font-normal">
              {listing.description || "Chưa có mô tả chi tiết."}
            </div>
          </div>

          {/* Amenities Grid */}
          <div className="bg-white rounded-3xl border border-[#EDE5D5] p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#EDE5D5]">
              <h2 className="text-sm font-semibold text-[#292524] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#DCA936]" />
                <span>Tiện ích & Dịch vụ đi kèm</span>
              </h2>
              <span className="text-xs font-medium text-[#78716C]">
                {listing.amenities?.length || 0} tiện ích
              </span>
            </div>

            {listing.amenities && listing.amenities.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {listing.amenities.map((item, idx) => (
                  <div
                    key={item.amenityId || idx}
                    className="flex items-center gap-2 p-2.5 rounded-xl bg-[#FFF7E5] border border-[#EDE5D5] text-xs font-normal text-[#292524]"
                  >
                    <div className="w-2 h-2 rounded-full bg-[#F4CD65] shrink-0" />
                    <span className="truncate">{item.amenity?.name || "Tiện ích"}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#A8A29E] italic font-normal">Tin đăng này chưa liệt kê danh sách tiện ích.</p>
            )}
          </div>
        </div>

        {/* Right Column: Pricing, Location, Stats & Actions (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Pricing & Fees Card */}
          <div className="bg-white rounded-3xl border border-[#EDE5D5] p-5 sm:p-6 shadow-xs space-y-4">
            <h2 className="text-sm font-semibold text-[#292524] pb-2 border-b border-[#EDE5D5] flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-[#DCA936]" />
              <span>Giá thuê & Phụ phí dịch vụ</span>
            </h2>

            {/* Main Price */}
            <div className="p-4 rounded-2xl bg-[#FFF7E5] border border-[#EDE5D5] flex items-center justify-between">
              <div>
                <span className="text-xs font-medium text-[#78716C] block">Giá thuê niêm yết</span>
                <span className="text-xl sm:text-2xl font-bold text-[#805B10] tracking-tight">
                  {formatPriceVnd(listing.price)}
                </span>
                <span className="text-xs text-[#78716C] font-normal"> / tháng</span>
              </div>
              <div className="text-right">
                <span className="text-xs font-medium text-[#78716C] block">Tiền cọc</span>
                <span className="text-sm font-semibold text-[#292524]">
                  {formatPriceVnd(listing.deposit)}
                </span>
              </div>
            </div>

            {/* Additional Fees Table */}
            <div className="space-y-2 pt-1">
              <span className="text-xs font-semibold text-[#292524] block">Các phụ phí sinh hoạt</span>
              {listing.fees && listing.fees.length > 0 ? (
                <div className="space-y-1.5">
                  {listing.fees.map((fee, idx) => (
                    <div
                      key={fee.id || idx}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-[#FFF7E5] border border-[#EDE5D5] text-xs"
                    >
                      <span className="font-normal text-[#57534E]">
                        {fee.name || FEE_TYPE_LABELS[fee.type] || fee.type}
                      </span>
                      <span className="font-semibold text-[#292524]">
                        {formatPriceVnd(fee.amount)}
                        <span className="font-normal text-[#78716C] text-[11px] ml-1">
                          {FEE_UNIT_LABELS[fee.unit] || fee.unit}
                        </span>
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[#A8A29E] italic font-normal">Không có phụ phí phát sinh thêm.</p>
              )}
            </div>
          </div>

          {/* Location Card */}
          <div className="bg-white rounded-3xl border border-[#EDE5D5] p-5 sm:p-6 shadow-xs space-y-3">
            <h2 className="text-sm font-semibold text-[#292524] pb-2 border-b border-[#EDE5D5] flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#DCA936]" />
              <span>Địa chỉ & Vị trí</span>
            </h2>

            <div className="space-y-1.5 text-xs sm:text-sm">
              <p className="font-semibold text-[#292524] leading-snug">
                {listing.address}
                {listing.ward ? `, ${listing.ward}` : ""}
              </p>
              <p className="text-[#57534E] font-normal">
                {listing.district}, {listing.city}
              </p>
              <div className="pt-1 flex items-center gap-2">
                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-[#FFFAEF] text-[#292524] border border-[#EDE5D5]">
                  {propertyTypeLabel}
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-[#FFF1CC] text-[#805B10] border border-[#F4CD65]/40">
                  {listing.city}
                </span>
              </div>
            </div>
          </div>

          {/* System Timeline & Real Statistics Card */}
          <div className="bg-white rounded-3xl border border-[#EDE5D5] p-5 sm:p-6 shadow-xs space-y-3 text-xs">
            <h2 className="text-sm font-semibold text-[#292524] pb-2 border-b border-[#EDE5D5] flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#DCA936]" />
              <span>Thời gian & Tương tác thực tế</span>
            </h2>

            <div className="space-y-2 text-[#57534E]">
              <div className="flex items-center justify-between">
                <span>Ngày tạo tin:</span>
                <strong className="text-[#292524] font-medium">{formatListingDate(listing.createdAt)}</strong>
              </div>
              <div className="flex items-center justify-between">
                <span>Cập nhật lần cuối:</span>
                <strong className="text-[#292524] font-medium">{formatListingDate(listing.updatedAt)}</strong>
              </div>
              {listing.publishedAt && (
                <div className="flex items-center justify-between">
                  <span>Ngày xuất bản:</span>
                  <strong className="text-[#805B10] font-semibold">{formatListingDate(listing.publishedAt)}</strong>
                </div>
              )}
            </div>

            {/* Real Statistics (Only shown if numbers exist) */}
            {listing._count && (
              <div className="pt-2 border-t border-[#EDE5D5] grid grid-cols-2 gap-2 text-center">
                <div className="p-2.5 rounded-2xl bg-[#FFF7E5] border border-[#EDE5D5]">
                  <div className="flex items-center justify-center gap-1 text-[#78716C] text-[11px] font-medium">
                    <Heart className="w-3.5 h-3.5 text-rose-500" />
                    <span>Lượt lưu thích</span>
                  </div>
                  <span className="text-base font-bold text-[#292524] block mt-0.5">
                    {listing._count.favorites || 0}
                  </span>
                </div>

                <div className="p-2.5 rounded-2xl bg-[#FFF7E5] border border-[#EDE5D5]">
                  <div className="flex items-center justify-center gap-1 text-[#78716C] text-[11px] font-medium">
                    <MessageSquare className="w-3.5 h-3.5 text-[#DCA936]" />
                    <span>Hỏi thuê</span>
                  </div>
                  <span className="text-base font-bold text-[#292524] block mt-0.5">
                    {listing._count.inquiries || 0}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Landlord Management Actions Card */}
          <div className="bg-white rounded-3xl border border-[#EDE5D5] p-5 sm:p-6 shadow-xs space-y-3.5">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-[#78716C] pb-2 border-b border-[#EDE5D5]">
              Hành động quản lý tin
            </h2>

            <div className="space-y-2.5">
              {/* Preview Public Page */}
              <Link
                href={`/listings/${listing.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full group flex items-center gap-3 py-2.5 px-3.5 rounded-2xl text-xs sm:text-sm font-medium bg-white hover:bg-stone-50 border border-stone-200 text-[#292524] transition-all hover:border-stone-300 shadow-2xs"
              >
                <div className="w-8 h-8 rounded-xl bg-stone-100 text-[#57534E] flex items-center justify-center shrink-0">
                  <Eye className="w-4 h-4" />
                </div>
                <span className="flex-1 text-left truncate font-medium">Xem trang công cộng (Người thuê)</span>
                <ExternalLink className="w-3.5 h-3.5 text-[#A8A29E] group-hover:text-[#292524] shrink-0 transition-colors" />
              </Link>

              {/* Edit Listing */}
              <Link
                href={`/landlord/listings/new?edit=${listing.id}`}
                className="w-full group flex items-center gap-3 py-2.5 px-3.5 rounded-2xl text-xs sm:text-sm font-medium bg-[#F4CD65] hover:bg-[#ebbf4d] active:bg-[#dda934] text-[#292524] transition-all shadow-xs shadow-[#F4CD65]/20 border border-[#F4CD65]/80"
              >
                <div className="w-8 h-8 rounded-xl bg-black/5 text-[#292524] flex items-center justify-center shrink-0">
                  <FileEdit className="w-4 h-4" />
                </div>
                <span className="flex-1 text-left truncate font-medium">Chỉnh sửa thông tin phòng</span>
                <ChevronRight className="w-3.5 h-3.5 text-[#292524]/70 group-hover:translate-x-0.5 shrink-0 transition-transform" />
              </Link>

              {/* Submit for Review (Draft or Rejected) */}
              {canSubmitForReview && (
                <button
                  type="button"
                  onClick={() => onRequestAction("SUBMIT_REVIEW")}
                  className="w-full group flex items-center gap-3 py-2.5 px-3.5 rounded-2xl text-xs sm:text-sm font-medium bg-[#292524] hover:bg-[#1c1917] active:bg-black text-white transition-all shadow-xs cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-xl bg-white/10 text-[#F4CD65] flex items-center justify-center shrink-0">
                    <Send className="w-4 h-4" />
                  </div>
                  <span className="flex-1 text-left truncate font-medium">Gửi tin đăng lên kiểm duyệt</span>
                  <ChevronRight className="w-3.5 h-3.5 text-white/60 group-hover:translate-x-0.5 shrink-0 transition-transform" />
                </button>
              )}

              {/* Toggle Availability (Available <-> Rented) */}
              <button
                type="button"
                onClick={() => onRequestAction("TOGGLE_AVAILABILITY")}
                className={`w-full group flex items-center gap-3 py-2.5 px-3.5 rounded-2xl text-xs sm:text-sm font-medium border transition-all cursor-pointer shadow-2xs ${
                  listing.availabilityStatus === "RENTED"
                    ? "bg-[#FFF9EE] text-[#805B10] border-[#F4CD65]/60 hover:bg-[#FFF3DC]"
                    : "bg-white text-[#292524] border-stone-200 hover:bg-stone-50 hover:border-stone-300"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                    listing.availabilityStatus === "RENTED"
                      ? "bg-[#FFF1CC] text-[#805B10]"
                      : "bg-stone-100 text-stone-700"
                  }`}
                >
                  {listing.availabilityStatus === "RENTED" ? (
                    <DoorOpen className="w-4 h-4 text-[#805B10]" />
                  ) : (
                    <DoorClosed className="w-4 h-4 text-stone-700" />
                  )}
                </div>
                <span className="flex-1 text-left truncate font-medium">
                  {listing.availabilityStatus === "RENTED"
                    ? "Mở lại phòng trống (Còn phòng)"
                    : "Đánh dấu phòng đã cho thuê"}
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-stone-400 group-hover:translate-x-0.5 shrink-0 transition-transform" />
              </button>

              {/* Toggle Visibility (Published <-> Hidden) */}
              {canToggleVisibility && (
                <button
                  type="button"
                  onClick={() => onRequestAction("TOGGLE_VISIBILITY")}
                  className={`w-full group flex items-center gap-3 py-2.5 px-3.5 rounded-2xl text-xs sm:text-sm font-medium border transition-all cursor-pointer shadow-2xs ${
                    listing.status === "HIDDEN"
                      ? "bg-[#FFF9EE] text-[#805B10] border-[#F4CD65]/60 hover:bg-[#FFF3DC]"
                      : "bg-white text-[#57534E] border-stone-200 hover:bg-stone-50 hover:text-[#292524]"
                  }`}
                >
                  <div className="w-8 h-8 rounded-xl bg-stone-100 text-[#57534E] flex items-center justify-center shrink-0">
                    {listing.status === "HIDDEN" ? (
                      <CheckCircle2 className="w-4 h-4 text-[#805B10]" />
                    ) : (
                      <EyeOff className="w-4 h-4" />
                    )}
                  </div>
                  <span className="flex-1 text-left truncate font-medium">
                    {listing.status === "HIDDEN"
                      ? "Bật hiển thị lại trên sàn"
                      : "Tạm ẩn tin đăng này"}
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-stone-400 group-hover:translate-x-0.5 shrink-0 transition-transform" />
                </button>
              )}

              {/* Delete Draft/Rejected Listing */}
              {isDeletable && (
                <button
                  type="button"
                  onClick={() => onRequestAction("DELETE")}
                  className="w-full group flex items-center gap-3 py-2.5 px-3.5 rounded-2xl text-xs sm:text-sm font-medium text-rose-600 bg-white hover:bg-rose-50/70 border border-rose-200/80 hover:border-rose-300 transition-all cursor-pointer shadow-2xs"
                >
                  <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                    <Trash2 className="w-4 h-4" />
                  </div>
                  <span className="flex-1 text-left truncate font-medium">Xóa vĩnh viễn tin đăng này</span>
                  <ChevronRight className="w-3.5 h-3.5 text-rose-400 group-hover:translate-x-0.5 shrink-0 transition-transform" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

