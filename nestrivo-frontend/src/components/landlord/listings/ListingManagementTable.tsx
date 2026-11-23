"use client";

import Link from "next/link";
import { useState } from "react";
import { 
  Building2, 
  MapPin, 
  Eye, 
  FileEdit, 
  Trash2, 
  Send, 
  EyeOff, 
  Eye as EyeIcon, 
  AlertTriangle,
  MessageSquare,
  Heart,
  MoreVertical,
  CheckCircle2,
  Maximize,
  Sparkles
} from "lucide-react";
import { LandlordListingItem } from "@/types/landlord";
import { PROPERTY_TYPE_LABELS } from "@/types/listing";
import { ListingStatusBadge, AvailabilityPill } from "./ListingStatusBadge";
import { EmptyListingsState } from "./EmptyListingsState";
import { formatVND, formatArea } from "@/lib/utils";
import { resolveListingThumbnail, handleListingImageError } from "@/lib/image";

interface ListingManagementTableProps {
  listings: LandlordListingItem[];
  onToggleAvailability: (id: string) => void;
  onToggleVisibility: (id: string) => void;
  onSubmitForReview: (id: string) => void;
  onDeleteListing: (id: string) => void;
  onPromoteListing?: (listing: LandlordListingItem) => void;
}

export function ListingManagementTable({
  listings,
  onToggleAvailability,
  onToggleVisibility,
  onSubmitForReview,
  onDeleteListing,
  onPromoteListing,
}: ListingManagementTableProps) {
  const [activeTab, setActiveTab] = useState<string>("ALL");
  const [selectedListingForReason, setSelectedListingForReason] = useState<LandlordListingItem | null>(null);

  // Compute status counts for tabs
  const counts = {
    ALL: listings.length,
    PUBLISHED: listings.filter((l) => l.status === "PUBLISHED").length,
    PENDING_APPROVAL: listings.filter((l) => l.status === "PENDING_APPROVAL").length,
    REJECTED: listings.filter((l) => l.status === "REJECTED").length,
    DRAFT: listings.filter((l) => l.status === "DRAFT").length,
    HIDDEN: listings.filter((l) => l.status === "HIDDEN").length,
  };

  const filteredListings = listings.filter((item) => {
    if (activeTab === "ALL") return true;
    return item.status === activeTab;
  });

  return (
    <div className="space-y-4">
      {/* Moderation Status Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none border-b border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab("ALL")}
          className={`px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition-all min-h-[44px] flex items-center gap-1.5 cursor-pointer ${
            activeTab === "ALL"
              ? "bg-[#F4CD65] text-[#292524] shadow-xs font-semibold"
              : "text-[#57534E] hover:text-[#292524] hover:bg-[#FFF7E5]"
          }`}
        >
          <span>Tất cả phòng</span>
          <span className={`px-1.5 py-0.5 rounded-md text-[11px] font-medium ${
            activeTab === "ALL" ? "bg-white/80 text-[#805B10]" : "bg-[#FFF1CC] text-[#805B10]"
          }`}>
            {counts.ALL}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("PUBLISHED")}
          className={`px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition-all min-h-[44px] flex items-center gap-1.5 cursor-pointer ${
            activeTab === "PUBLISHED"
              ? "bg-[#F4CD65] text-[#292524] shadow-xs font-semibold"
              : "text-[#57534E] hover:text-[#292524] hover:bg-[#FFF7E5]"
          }`}
        >
          <span>Đang hiển thị</span>
          <span className={`px-1.5 py-0.5 rounded-md text-[11px] font-medium ${
            activeTab === "PUBLISHED" ? "bg-white/80 text-[#805B10]" : "bg-[#FFF1CC] text-[#805B10]"
          }`}>
            {counts.PUBLISHED}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("PENDING_APPROVAL")}
          className={`px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all min-h-[44px] flex items-center gap-1.5 cursor-pointer ${
            activeTab === "PENDING_APPROVAL"
              ? "bg-amber-500 text-white shadow-xs font-bold"
              : "text-[#77715F] hover:text-amber-800 hover:bg-amber-50"
          }`}
        >
          <span>Chờ kiểm duyệt</span>
          <span className={`px-1.5 py-0.5 rounded-md text-[11px] font-bold ${
            activeTab === "PENDING_APPROVAL" ? "bg-white/30 text-white" : "bg-amber-50 text-amber-800"
          }`}>
            {counts.PENDING_APPROVAL}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("REJECTED")}
          className={`px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all min-h-[44px] flex items-center gap-1.5 cursor-pointer ${
            activeTab === "REJECTED"
              ? "bg-rose-600 text-white shadow-xs font-bold"
              : "text-[#77715F] hover:text-rose-700 hover:bg-rose-50"
          }`}
        >
          <span>Cần chỉnh sửa</span>
          <span className={`px-1.5 py-0.5 rounded-md text-[11px] font-bold ${
            activeTab === "REJECTED" ? "bg-white/30 text-white" : "bg-rose-50 text-rose-800"
          }`}>
            {counts.REJECTED}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("DRAFT")}
          className={`px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all min-h-[44px] flex items-center gap-1.5 cursor-pointer ${
            activeTab === "DRAFT"
              ? "bg-[#FFF1CC] text-[#805B10] font-bold border border-[#F4CD65]/50 shadow-2xs"
              : "text-[#77715F] hover:text-[#373523] hover:bg-[#FFF7E5]"
          }`}
        >
          <span>Bản nháp</span>
          <span className={`px-1.5 py-0.5 rounded-md text-[11px] font-bold ${
            activeTab === "DRAFT" ? "bg-[#F4CD65] text-[#373523]" : "bg-slate-100 text-slate-600"
          }`}>
            {counts.DRAFT}
          </span>
        </button>

        {counts.HIDDEN > 0 && (
          <button
            type="button"
            onClick={() => setActiveTab("HIDDEN")}
            className={`px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all min-h-[44px] flex items-center gap-1.5 cursor-pointer ${
              activeTab === "HIDDEN"
                ? "bg-[#EDE5D5] text-[#77715F] font-bold border border-[#DCA936]/40"
                : "text-[#77715F] hover:text-[#373523] hover:bg-[#FFF7E5]"
            }`}
          >
            <span>Tạm ẩn</span>
            <span className={`px-1.5 py-0.5 rounded-md text-[11px] font-bold ${
              activeTab === "HIDDEN" ? "bg-white text-[#77715F]" : "bg-slate-100 text-slate-600"
            }`}>
              {counts.HIDDEN}
            </span>
          </button>
        )}
      </div>

      {/* Main Container */}
      {filteredListings.length === 0 ? (
        <EmptyListingsState
          filterStatus={activeTab}
          onResetFilter={() => setActiveTab("ALL")}
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
          {/* ========================================================= */}
          {/* DESKTOP DATA TABLE (Visible on >= lg screens)             */}
          {/* ========================================================= */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-700">
                  <th className="py-3 px-4">Thông tin phòng</th>
                  <th className="py-3 px-3">Loại hình</th>
                  <th className="py-3 px-4">Giá thuê</th>
                  <th className="py-3 px-3">Tương tác</th>
                  <th className="py-3 px-3">Kiểm duyệt</th>
                  <th className="py-3 px-3">Tình trạng</th>
                  <th className="py-3 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredListings.map((item) => {
                  const propertyTypeLabel = PROPERTY_TYPE_LABELS[item.propertyType] || "Phòng trọ";
                  const thumbUrl = resolveListingThumbnail(item.thumbnailUrl, item.images);

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      {/* Column 1: Info (Thumb, Title, Address) */}
                      <td className="py-3.5 px-4 min-w-[280px]">
                        <div className="flex items-center gap-3">
                          <img
                            src={thumbUrl}
                            alt={item.title}
                            referrerPolicy="no-referrer"
                            loading="lazy"
                            onError={handleListingImageError}
                            className="w-16 h-12 rounded-lg object-cover bg-[#FFF7E5] shrink-0 border border-slate-200/60"
                          />
                          <div className="min-w-0 space-y-0.5">
                            <div className="flex items-center gap-1.5">
                              <Link
                                href={`/landlord/listings/${item.id}`}
                                className="font-bold text-[#373523] group-hover:text-[#DCA936] transition-colors line-clamp-1 block text-sm leading-snug"
                                title={item.title}
                              >
                                {item.title}
                              </Link>
                              {(item.currentTier === "VIP" || item.currentTier === "HOT" || (item.promotionRemainingDays && item.promotionRemainingDays > 0)) && (
                                <span
                                  className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#FFF1CC] text-[#805B10] border border-[#F4CD65]/70 shadow-2xs"
                                  title={item.promotionEndDate ? `Hạn hiển thị nổi bật đến: ${new Date(item.promotionEndDate).toLocaleDateString("vi-VN")}` : undefined}
                                >
                                  <Sparkles className="w-2.5 h-2.5 text-amber-600" />
                                  <span>
                                    {item.promotionRemainingDays && item.promotionRemainingDays > 0
                                      ? `Nổi bật • Còn ${item.promotionRemainingDays} ngày`
                                      : "Nổi bật"}
                                  </span>
                                </span>
                              )}
                            </div>
                            <p className="flex items-center gap-1 text-xs text-[#77715F] line-clamp-1">
                              <MapPin className="w-3 h-3 text-[#A8A190] shrink-0" />
                              <span>{item.address}, {item.district}</span>
                            </p>
                            {/* Rejection alert preview if REJECTED */}
                            {item.status === "REJECTED" && item.rejectionReason && (
                              <button
                                type="button"
                                onClick={() => setSelectedListingForReason(item)}
                                className="text-[11px] font-semibold text-rose-700 hover:text-rose-800 hover:underline flex items-center gap-1 pt-0.5"
                              >
                                <AlertTriangle className="w-3 h-3 text-rose-500 shrink-0" />
                                <span className="line-clamp-1">Lý do từ chối: {item.rejectionReason}</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Column 2: Property Type & Area */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <div className="font-medium text-[#292524] text-xs">{propertyTypeLabel}</div>
                        <div className="text-[11px] text-[#78716C] font-normal">{formatArea(item.area)}</div>
                      </td>

                      {/* Column 3: Price & Deposit */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-semibold text-[#805B10] text-sm tabular-nums">
                          {formatVND(item.price)}
                          <span className="text-[11px] text-[#78716C] font-normal ml-0.5">/tháng</span>
                        </div>
                        <div className="text-[11px] text-[#78716C] font-normal">
                          Cọc: {formatVND(item.deposit)}
                        </div>
                      </td>

                      {/* Column 4: Interactions (Views, Inquiries, Favorites) */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <div className="flex items-center gap-2.5 text-xs text-[#292524] font-medium">
                          <span className="flex items-center gap-1 text-[#78716C]" title="Lượt xem phòng">
                            <Eye className="w-3.5 h-3.5 text-slate-400" />
                            <span>{item.views || 0}</span>
                          </span>
                          <span className="flex items-center gap-1" title="Lượt hỏi thuê">
                            <MessageSquare className="w-3.5 h-3.5 text-[#DCA936]" />
                            <span>{item._count.inquiries}</span>
                          </span>
                          <span className="flex items-center gap-1" title="Lượt lưu tin">
                            <Heart className="w-3.5 h-3.5 text-rose-500" />
                            <span>{item._count.favorites}</span>
                          </span>
                        </div>
                      </td>

                      {/* Column 5: Moderation Status */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <ListingStatusBadge status={item.status} />
                      </td>

                      {/* Column 6: Room Availability Status */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        {item.status === "PUBLISHED" ? (
                          <AvailabilityPill
                            status={item.availabilityStatus}
                            interactive={true}
                            onClick={() => onToggleAvailability(item.id)}
                          />
                        ) : (
                          <span className="text-xs text-slate-500 font-medium italic">
                            Chưa công khai
                          </span>
                        )}
                      </td>

                      {/* Column 7: Operational Action Buttons */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* If PUBLISHED: Boost/Promote, Preview, Edit, Hide */}
                          {item.status === "PUBLISHED" && (
                            <>
                              <button
                                type="button"
                                onClick={() => onPromoteListing?.(item)}
                                className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 min-h-[36px] ${
                                  item.currentTier === "VIP" || item.currentTier === "HOT"
                                    ? "bg-[#FFF1CC] hover:bg-[#F4CD65]/50 text-[#805B10] border border-[#F4CD65]/70"
                                    : "bg-[#F4CD65] hover:bg-[#ebbf4d] text-[#292524] shadow-2xs"
                                }`}
                                title={item.currentTier === "VIP" || item.currentTier === "HOT" ? "Gia hạn gói Tin Nổi Bật" : "Nâng cấp lên Tin Nổi Bật"}
                              >
                                <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                                <span>{item.currentTier === "VIP" || item.currentTier === "HOT" ? "Gia hạn" : "Đẩy tin"}</span>
                              </button>
                              <Link
                                href={`/listings/${item.id}`}
                                className="p-2 text-[#77715F] hover:text-[#DCA936] hover:bg-[#FFF7E5] rounded-xl transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
                                title="Xem trang người thuê"
                              >
                                <Eye className="w-4 h-4" />
                              </Link>
                              <Link
                                href={`/landlord/listings/${item.id}/edit`}
                                className="px-2.5 py-1.5 bg-[#FFF7E5] hover:bg-[#FFF1CC] text-[#373523] rounded-xl text-xs font-bold transition-colors flex items-center gap-1 min-h-[36px]"
                                title="Chỉnh sửa thông tin phòng"
                              >
                                <FileEdit className="w-3.5 h-3.5" />
                                <span>Sửa</span>
                              </Link>
                              <button
                                type="button"
                                onClick={() => onToggleVisibility(item.id)}
                                className="p-2 text-[#77715F] hover:text-[#373523] hover:bg-[#FFF7E5] rounded-xl transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
                                title="Tạm ẩn tin khỏi kết quả tìm kiếm"
                              >
                                <EyeOff className="w-4 h-4" />
                              </button>
                            </>
                          )}

                          {/* If PENDING_APPROVAL: Inspect details */}
                          {item.status === "PENDING_APPROVAL" && (
                            <Link
                              href={`/listings/${item.id}`}
                              className="px-3 py-1.5 bg-[#FFF1CC] hover:bg-[#F4CD65]/50 text-[#805B10] rounded-xl text-xs font-bold transition-colors flex items-center gap-1 min-h-[36px]"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Xem tin gửi</span>
                            </Link>
                          )}

                          {/* If REJECTED: Show reason, Edit & Resubmit, Delete */}
                          {item.status === "REJECTED" && (
                            <>
                              <button
                                type="button"
                                onClick={() => setSelectedListingForReason(item)}
                                className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1 min-h-[36px]"
                              >
                                <AlertTriangle className="w-3.5 h-3.5" />
                                <span>Lý do</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => onSubmitForReview(item.id)}
                                className="px-2.5 py-1.5 bg-[#F4CD65] hover:bg-[#ebbf4d] text-[#292524] rounded-xl text-xs font-semibold transition-colors flex items-center gap-1 min-h-[36px]"
                                title="Gửi duyệt lại lên Admin"
                              >
                                <Send className="w-3.5 h-3.5" />
                                <span>Gửi lại</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => onDeleteListing(item.id)}
                                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
                                title="Xóa tin đăng"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}

                          {/* If DRAFT: Edit, Submit, Delete */}
                          {item.status === "DRAFT" && (
                            <>
                              <Link
                                href={`/landlord/listings/${item.id}/edit`}
                                className="px-2.5 py-1.5 bg-[#FFF7E5] hover:bg-[#FFF1CC] text-[#292524] rounded-xl text-xs font-medium transition-colors flex items-center gap-1 min-h-[36px]"
                              >
                                <FileEdit className="w-3.5 h-3.5" />
                                <span>Sửa</span>
                              </Link>
                              <button
                                type="button"
                                onClick={() => onSubmitForReview(item.id)}
                                className="px-2.5 py-1.5 bg-[#F4CD65] hover:bg-[#ebbf4d] text-[#292524] rounded-xl text-xs font-semibold transition-colors flex items-center gap-1 min-h-[36px]"
                              >
                                <Send className="w-3.5 h-3.5" />
                                <span>Gửi duyệt</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => onDeleteListing(item.id)}
                                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
                                title="Xóa bản nháp"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}

                          {/* If HIDDEN: Unhide */}
                          {item.status === "HIDDEN" && (
                            <button
                              type="button"
                              onClick={() => onToggleVisibility(item.id)}
                              className="px-3 py-1.5 bg-[#FFF1CC] hover:bg-[#F4CD65] text-[#373523] rounded-xl text-xs font-bold transition-colors flex items-center gap-1 min-h-[36px]"
                            >
                              <EyeIcon className="w-3.5 h-3.5" />
                              <span>Bật lại</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* ========================================================= */}
          {/* MOBILE CARD LIST (Visible on < lg screens)                */}
          {/* ========================================================= */}
          <div className="block lg:hidden divide-y divide-slate-100">
            {filteredListings.map((item) => {
              const propertyTypeLabel = PROPERTY_TYPE_LABELS[item.propertyType] || "Phòng trọ";
              const thumbUrl = resolveListingThumbnail(item.thumbnailUrl, item.images);

              return (
                <div key={item.id} className="p-4 space-y-3">
                  <div className="flex gap-3">
                    <img
                      src={thumbUrl}
                      alt={item.title}
                      referrerPolicy="no-referrer"
                      loading="lazy"
                      onError={handleListingImageError}
                      className="w-20 h-16 rounded-xl object-cover bg-[#FFF7E5] shrink-0 border border-slate-200"
                    />
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <Link
                          href={`/landlord/listings/${item.id}`}
                          className="font-bold text-slate-900 text-sm line-clamp-1 leading-snug"
                        >
                          {item.title}
                        </Link>
                        {(item.currentTier === "VIP" || item.currentTier === "HOT" || (item.promotionRemainingDays && item.promotionRemainingDays > 0)) && (
                          <span
                            className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#FFF1CC] text-[#805B10] border border-[#F4CD65]/70 shadow-2xs"
                            title={item.promotionEndDate ? `Hạn hiển thị nổi bật đến: ${new Date(item.promotionEndDate).toLocaleDateString("vi-VN")}` : undefined}
                          >
                            <Sparkles className="w-2.5 h-2.5 text-amber-600" />
                            <span>
                              {item.promotionRemainingDays && item.promotionRemainingDays > 0
                                ? `Nổi bật • Còn ${item.promotionRemainingDays} ngày`
                                : "Nổi bật"}
                            </span>
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span>{propertyTypeLabel}</span>
                        <span>•</span>
                        <span>{formatArea(item.area)}</span>
                        <span>•</span>
                        <span>{item.views || 0} lượt xem</span>
                      </div>
                      <div className="font-semibold text-[#805B10] text-sm">
                        {formatVND(item.price)}
                        <span className="text-[11px] text-[#78716C] font-normal">/th</span>
                      </div>
                    </div>
                  </div>

                  {/* Status row */}
                  <div className="flex items-center justify-between gap-2 pt-1 border-t border-[#EDE5D5]/60 text-xs">
                    <ListingStatusBadge status={item.status} />

                    {item.status === "PUBLISHED" ? (
                      <AvailabilityPill
                        status={item.availabilityStatus}
                        interactive={true}
                        onClick={() => onToggleAvailability(item.id)}
                      />
                    ) : (
                      <span className="text-[#78716C] text-xs italic font-normal">Chưa công khai</span>
                    )}
                  </div>

                  {/* Rejection Alert if any */}
                  {item.status === "REJECTED" && item.rejectionReason && (
                    <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 space-y-1">
                      <div className="font-semibold flex items-center gap-1 text-rose-900">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                        <span>Lý do từ chối kiểm duyệt:</span>
                      </div>
                      <p className="leading-relaxed font-normal">{item.rejectionReason}</p>
                    </div>
                  )}

                  {/* Action Buttons Row (min 44px touch target) */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    {item.status === "PUBLISHED" && (
                      <>
                        <button
                          type="button"
                          onClick={() => onPromoteListing?.(item)}
                          className={`w-full text-center py-2 px-3 rounded-xl font-bold text-xs min-h-[44px] flex items-center justify-center gap-1.5 transition-all ${
                            item.currentTier === "VIP" || item.currentTier === "HOT"
                              ? "bg-[#FFF1CC] text-[#805B10] border border-[#F4CD65] hover:bg-[#F4CD65]/40"
                              : "bg-[#F4CD65] hover:bg-[#ebbf4d] text-[#292524] shadow-xs"
                          }`}
                        >
                          <Sparkles className="w-4 h-4 text-amber-700" />
                          <span>{item.currentTier === "VIP" || item.currentTier === "HOT" ? "Gia hạn gói Tin Nổi Bật" : "Nâng cấp gói Tin Nổi Bật"}</span>
                        </button>
                        <Link
                          href={`/listings/${item.id}`}
                          className="flex-1 text-center py-2 px-3 rounded-xl bg-[#FFF7E5] text-[#292524] font-medium text-xs min-h-[44px] flex items-center justify-center gap-1.5"
                        >
                          <Eye className="w-4 h-4" />
                          <span>Xem tin</span>
                        </Link>
                        <Link
                          href={`/landlord/listings/${item.id}/edit`}
                          className="flex-1 text-center py-2 px-3 rounded-xl bg-[#FFF7E5] text-[#292524] font-medium text-xs min-h-[44px] flex items-center justify-center gap-1.5"
                        >
                          <FileEdit className="w-4 h-4" />
                          <span>Sửa</span>
                        </Link>
                        <button
                          type="button"
                          onClick={() => onToggleVisibility(item.id)}
                          className="p-2.5 text-[#57534E] bg-[#FFF7E5] rounded-xl min-h-[44px] min-w-[44px] flex items-center justify-center"
                          title="Tạm ẩn"
                        >
                          <EyeOff className="w-4 h-4" />
                        </button>
                      </>
                    )}

                    {item.status === "REJECTED" && (
                      <>
                        <button
                          type="button"
                          onClick={() => onSubmitForReview(item.id)}
                          className="flex-1 py-2 px-3 rounded-xl bg-[#F4CD65] hover:bg-[#ebbf4d] text-[#292524] font-semibold text-xs min-h-[44px] flex items-center justify-center gap-1.5"
                        >
                          <Send className="w-4 h-4" />
                          <span>Gửi duyệt lại</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteListing(item.id)}
                          className="p-2.5 text-rose-600 bg-rose-50 rounded-xl min-h-[44px] min-w-[44px] flex items-center justify-center"
                          title="Xóa tin"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}

                    {item.status === "DRAFT" && (
                      <>
                        <Link
                          href={`/landlord/listings/${item.id}/edit`}
                          className="flex-1 text-center py-2 px-3 rounded-xl bg-[#FFF7E5] text-[#292524] font-medium text-xs min-h-[44px] flex items-center justify-center gap-1.5"
                        >
                          <FileEdit className="w-4 h-4" />
                          <span>Sửa</span>
                        </Link>
                        <button
                          type="button"
                          onClick={() => onSubmitForReview(item.id)}
                          className="flex-1 py-2 px-3 rounded-xl bg-[#F4CD65] hover:bg-[#ebbf4d] text-[#292524] font-semibold text-xs min-h-[44px] flex items-center justify-center gap-1.5"
                        >
                          <Send className="w-4 h-4" />
                          <span>Gửi duyệt</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteListing(item.id)}
                          className="p-2.5 text-slate-400 bg-slate-100 rounded-xl min-h-[44px] min-w-[44px] flex items-center justify-center"
                          title="Xóa nháp"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}

                    {item.status === "HIDDEN" && (
                      <button
                        type="button"
                        onClick={() => onToggleVisibility(item.id)}
                        className="w-full py-2.5 px-3 rounded-xl bg-[#F4CD65] hover:bg-[#ebbf4d] text-[#292524] font-semibold text-xs min-h-[44px] flex items-center justify-center gap-1.5"
                      >
                        <EyeIcon className="w-4 h-4" />
                        <span>Bật hiển thị lại</span>
                      </button>
                    )}

                    {item.status === "PENDING_APPROVAL" && (
                      <div className="w-full text-center text-xs text-amber-800 bg-amber-50 py-2.5 px-3 rounded-xl font-medium">
                        Tin đang trong hàng đợi kiểm duyệt của Admin (trong vòng 24h)
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Rejection Reason Modal/Dialog (Protected Feedback) */}
      {selectedListingForReason && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <div className="flex items-center gap-2.5 text-rose-700">
              <div className="w-9 h-9 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900">Chi tiết lý do từ chối</h3>
            </div>

            <div className="space-y-2 text-xs sm:text-sm text-slate-700 leading-relaxed bg-rose-50/60 p-4 rounded-xl border border-rose-100">
              <div className="font-bold text-slate-900">{selectedListingForReason.title}</div>
              <p>{selectedListingForReason.rejectionReason}</p>
            </div>

            <p className="text-xs text-slate-500">
              Bạn có thể cập nhật lại hình ảnh hoặc nội dung theo góp ý của Admin, sau đó nhấn &quot;Gửi duyệt lại&quot;.
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedListingForReason(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold min-h-[44px]"
              >
                Đóng
              </button>
              <button
                type="button"
                onClick={() => {
                  onSubmitForReview(selectedListingForReason.id);
                  setSelectedListingForReason(null);
                }}
                className="px-4 py-2 rounded-xl bg-[#F4CD65] hover:bg-[#ebbf4d] text-[#292524] text-xs font-semibold min-h-[44px]"
              >
                Gửi duyệt lại ngay
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
