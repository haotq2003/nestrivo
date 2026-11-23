"use client";

import { useState } from "react";
import Image from "next/image";
import { 
  X, 
  CheckCircle2, 
  XCircle, 
  MapPin, 
  Calendar, 
  ShieldCheck, 
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ExternalLink
} from "lucide-react";
import { AdminListingItem } from "@/types/admin";
import { formatPriceVnd, formatListingDate } from "@/lib/landlord-listing-helpers";

interface ListingReviewModalProps {
  isOpen: boolean;
  listing: AdminListingItem | null;
  onClose: () => void;
  onApprove: (id: string) => Promise<void>;
  onRejectOpen: (listing: AdminListingItem) => void;
  onHideListing?: (id: string) => Promise<void>;
  isProcessing?: boolean;
}

const PROPERTY_TYPE_NAMES: Record<string, string> = {
  ROOM_RENTAL: "Phòng trọ",
  STUDIO: "Phòng Studio",
  SERVICE_APARTMENT: "Căn hộ dịch vụ",
  WHOLE_HOUSE: "Nhà nguyên căn",
  APARTMENT: "Chung cư",
  ROOM_SHARE: "Ở ghép",
};

export function ListingReviewModal({
  isOpen,
  listing,
  onClose,
  onApprove,
  onRejectOpen,
  onHideListing,
  isProcessing = false,
}: ListingReviewModalProps) {
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);

  if (!isOpen || !listing) return null;

  const images = listing.images && listing.images.length > 0 
    ? listing.images 
    : [{ id: "thumb", listingId: listing.id, imageUrl: listing.thumbnailUrl || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200", sortOrder: 0 }];

  const currentImage = images[activeImageIndex] || images[0];

  const handleNextImage = () => {
    setActiveImageIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrevImage = () => {
    setActiveImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const isKycVerified = Boolean(
    listing.landlord?.isKycVerified ||
    listing.landlord?.landlordProfile?.verificationStatus === "VERIFIED" ||
    listing.landlord?.verificationRequests?.[0]?.status === "VERIFIED"
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200/80 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-[#FFF1CC] text-[#805B10] border border-[#F4CD65]/40">
              {PROPERTY_TYPE_NAMES[listing.propertyType] || listing.propertyType}
            </span>
            {listing.status === "PENDING_APPROVAL" && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#FFF1CC] text-[#805B10] border border-[#F4CD65]/40 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#F4CD65] animate-pulse" />
                Chờ kiểm duyệt
              </span>
            )}
            {listing.status === "PUBLISHED" && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#FFF7E5] text-[#292524] border border-[#EDE5D5] flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#DCA936]" />
                Đang xuất bản
              </span>
            )}
            {listing.status === "REJECTED" && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200 flex items-center gap-1">
                <XCircle className="w-3.5 h-3.5" />
                Bị từ chối
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Inspection Area */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-800 text-sm">
          {/* Rejection Alert if present */}
          {listing.status === "REJECTED" && listing.rejectionReason && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-rose-700">
                  Lý do từ chối hiện tại:
                </p>
                <p className="text-sm font-medium mt-0.5 leading-relaxed">
                  {listing.rejectionReason}
                </p>
              </div>
            </div>
          )}

          {/* Photo Gallery with Inspector */}
          <div className="space-y-3">
            <div className="relative aspect-video sm:aspect-21/9 w-full rounded-2xl overflow-hidden bg-slate-900 shadow-inner group">
              <Image
                src={currentImage.imageUrl}
                alt={listing.title}
                fill
                className="object-cover"
                priority
              />
              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={handlePrevImage}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
                    aria-label="Ảnh trước"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={handleNextImage}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
                    aria-label="Ảnh kế tiếp"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                  <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-md bg-black/70 text-white text-xs font-semibold backdrop-blur-xs">
                    {activeImageIndex + 1} / {images.length} ảnh
                  </div>
                </>
              )}
            </div>

            {/* Thumbnails row */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {images.map((img, idx) => (
                  <button
                    key={img.id || idx}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative w-20 h-14 rounded-lg overflow-hidden shrink-0 border-2 transition-all ${
                      activeImageIndex === idx
                        ? "border-[#F4CD65] ring-2 ring-[#F4CD65]/40 scale-102 shadow-xs"
                        : "border-transparent opacity-70 hover:opacity-100"
                    }`}
                  >
                    <Image
                      src={img.imageUrl}
                      alt="Thumbnail"
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Title & Key Pricing Highlights */}
          <div className="space-y-2">
            <h1 className="text-xl sm:text-2xl font-semibold text-[#292524] leading-snug">
              {listing.title}
            </h1>
            <p className="flex items-center gap-1.5 text-[#57534E] text-sm font-normal">
              <MapPin className="w-4 h-4 text-[#DCA936] shrink-0" />
              <span>{listing.address}, {listing.district}, {listing.city}</span>
            </p>
          </div>

          {/* Pricing & Key Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-[#FFF7E5] border border-[#EDE5D5]">
            <div>
              <span className="text-[11px] font-medium text-[#78716C] uppercase tracking-wider block">
                Giá thuê niêm yết
              </span>
              <span className="text-lg font-semibold text-[#805B10]">
                {formatPriceVnd(listing.price)}/tháng
              </span>
            </div>
            <div>
              <span className="text-[11px] font-bold text-[#77715F] uppercase tracking-wider block">
                Tiền cọc
              </span>
              <span className="text-base font-bold text-[#373523]">
                {formatPriceVnd(listing.deposit)}
              </span>
            </div>
            <div>
              <span className="text-[11px] font-bold text-[#77715F] uppercase tracking-wider block">
                Diện tích
              </span>
              <span className="text-base font-bold text-[#373523]">
                {listing.area} m²
              </span>
            </div>
            <div>
              <span className="text-[11px] font-bold text-[#77715F] uppercase tracking-wider block">
                Sức chứa & Phòng
              </span>
              <span className="text-base font-bold text-[#373523]">
                {listing.bedrooms} PN • {listing.bathrooms} WC • Tối đa {listing.maxOccupants} ng
              </span>
            </div>
          </div>

          {/* Landlord Information & Identity Card */}
          <div className="p-4 rounded-2xl border border-[#EDE5D5] bg-white space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#77715F] uppercase tracking-wider">
                Thông tin chủ nhà gửi tin
              </span>
              {isKycVerified ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#FFF1CC] text-[#805B10] border border-[#F4CD65]/40">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#DCA936]" />
                  Đã xác minh KYC
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  Chưa xác minh danh tính
                </span>
              )}
            </div>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-700 shrink-0 text-sm border border-slate-200">
                {listing.landlord?.fullName?.charAt(0) || "U"}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-slate-900">
                  {listing.landlord?.fullName || "Chưa có tên"}
                  {listing.landlord?.landlordProfile?.displayName && (
                    <span className="text-xs font-normal text-slate-500 ml-1.5">
                      ({listing.landlord.landlordProfile.displayName})
                    </span>
                  )}
                </p>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-0.5">
                  <span>SĐT: <strong className="text-slate-800">{listing.landlord?.phoneNumber || "Chưa có"}</strong></span>
                  <span>•</span>
                  <span>Email: <strong className="text-slate-800">{listing.landlord?.email || "Chưa có"}</strong></span>
                </div>
              </div>
            </div>
          </div>

          {/* Living Fees Breakdown */}
          {listing.fees && listing.fees.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Chi phí sinh hoạt bổ sung
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {listing.fees.map((fee) => (
                  <div key={fee.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                    <span className="text-xs text-slate-500 block">{fee.name}</span>
                    <span className="text-sm font-bold text-slate-900 mt-0.5 block">
                      {formatPriceVnd(fee.amount)} / {fee.unit === "PER_KWH" ? "kWh" : fee.unit === "PER_PERSON" ? "người" : fee.unit === "PER_MONTH" ? "tháng" : "cố định"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Amenities & Characteristics */}
          {listing.amenities && listing.amenities.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#77715F]">
                Tiện ích & Nội thất
              </h3>
              <div className="flex flex-wrap gap-2">
                {listing.amenities.map((item) => (
                  <span
                    key={item.amenityId}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FFF7E5] border border-[#EDE5D5] text-[#373523] text-xs font-bold"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#DCA936]" />
                    {item.amenity.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#77715F]">
              Mô tả chi tiết phòng trọ
            </h3>
            <div className="p-4 rounded-2xl bg-[#FFFAEF] border border-[#EDE5D5] text-xs sm:text-sm text-[#373523] whitespace-pre-line leading-relaxed">
              {listing.description || "Chưa có nội dung mô tả."}
            </div>
          </div>

          {/* Timeline & Metadata */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-[#77715F] pt-2 border-t border-[#EDE5D5]">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-[#A8A190]" />
              Gửi duyệt: {formatListingDate(listing.createdAt)}
            </span>
            {listing.publishedAt && (
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#DCA936]" />
                Xuất bản: {formatListingDate(listing.publishedAt)}
              </span>
            )}
          </div>
        </div>

        {/* Sticky Action Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-[#EDE5D5] bg-white">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-[#EDE5D5] text-xs sm:text-sm font-bold text-[#373523] hover:bg-[#FFF7E5] transition-colors min-h-[40px]"
          >
            Đóng
          </button>

          <div className="flex items-center gap-2.5">
            {listing.status === "PENDING_APPROVAL" && (
              <>
                <button
                  type="button"
                  onClick={() => onRejectOpen(listing)}
                  disabled={isProcessing}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl border border-rose-200 bg-rose-50 hover:bg-rose-100 active:bg-rose-200 text-rose-700 font-bold text-xs sm:text-sm transition-all disabled:opacity-50 min-h-[40px]"
                >
                  <XCircle className="w-4 h-4 text-rose-600" />
                  <span>Từ chối</span>
                </button>

                <button
                  type="button"
                  onClick={() => onApprove(listing.id)}
                  disabled={isProcessing}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-2xl bg-[#F4CD65] hover:bg-[#ebbf4d] active:bg-[#e0b03b] text-[#292524] font-medium text-xs sm:text-sm shadow-xs transition-all disabled:opacity-50 min-h-[40px]"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Phê duyệt xuất bản</span>
                </button>
              </>
            )}

            {listing.status === "PUBLISHED" && (
              <>
                {onHideListing && (
                  <button
                    type="button"
                    onClick={() => onHideListing(listing.id)}
                    disabled={isProcessing}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl border border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-800 font-medium text-xs sm:text-sm transition-all min-h-[40px]"
                  >
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>Tạm ẩn vi phạm</span>
                  </button>
                )}
                <a
                  href={`/rentals`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-[#FFF1CC] hover:bg-[#F4CD65] text-[#805B10] hover:text-[#292524] border border-[#F4CD65]/50 font-medium text-xs sm:text-sm transition-all min-h-[40px]"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Xem trên sàn</span>
                </a>
              </>
            )}

            {listing.status === "REJECTED" && (
              <>
                <button
                  type="button"
                  onClick={() => onRejectOpen(listing)}
                  disabled={isProcessing}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 font-medium text-xs sm:text-sm transition-all min-h-[40px]"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Sửa lý do từ chối</span>
                </button>
                <button
                  type="button"
                  onClick={() => onApprove(listing.id)}
                  disabled={isProcessing}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-2xl bg-[#F4CD65] hover:bg-[#ebbf4d] text-[#292524] font-medium text-xs sm:text-sm shadow-xs transition-all min-h-[40px]"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Duyệt lại tin này</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
