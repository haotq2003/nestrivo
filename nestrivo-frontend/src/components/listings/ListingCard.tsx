"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Heart,
  MapPin,
  Maximize,
  Bed,
  Bath,
  Users,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  ArrowLeftRight,
} from "lucide-react";
import { ListingItem, PROPERTY_TYPE_LABELS } from "@/types/listing";
import { formatVND, formatArea } from "@/lib/utils";
import { resolveListingThumbnail, DEFAULT_LISTING_IMAGE } from "@/lib/image";
import { useFavorites } from "@/context/FavoritesContext";
import { useCompare } from "@/context/CompareContext";
import { cn } from "@/lib/utils";

interface ListingCardProps {
  listing: ListingItem;
  isMock?: boolean;
  onToggleFavorite?: (id: string, nextState: boolean) => void;
}

export default function ListingCard({
  listing,
  isMock = false,
  onToggleFavorite,
}: ListingCardProps) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const { isInCompare, toggleCompare, compareCount, maxLimit } = useCompare();

  const isFav = isMock ? listing.isFavorited || false : isFavorite(listing.id);
  const inCompare = isInCompare(listing.id);

  const [showFavTooltip, setShowFavTooltip] = useState(false);
  const [tooltipText, setTooltipText] = useState("");
  const [showCompareTooltip, setShowCompareTooltip] = useState(false);
  const [compareTooltipText, setCompareTooltipText] = useState("");
  const [imgSrc, setImgSrc] = useState(
    resolveListingThumbnail(undefined, listing.images)
  );

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isMock) {
      const next = !isFav;
      setShowFavTooltip(true);
      setTooltipText(next ? "Đã lưu tin" : "Đã bỏ lưu");
      setTimeout(() => setShowFavTooltip(false), 2400);
      onToggleFavorite?.(listing.id, next);
      return;
    }

    const nextState = await toggleFavorite(listing.id, listing);
    setTooltipText(
      nextState ? "Đã lưu vào danh sách yêu thích" : "Đã xóa khỏi danh sách yêu thích"
    );
    setShowFavTooltip(true);
    setTimeout(() => setShowFavTooltip(false), 2400);
    onToggleFavorite?.(listing.id, nextState);
  };

  const handleCompareClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!inCompare && compareCount >= maxLimit) {
      setCompareTooltipText(`Tối đa ${maxLimit} phòng`);
      setShowCompareTooltip(true);
      setTimeout(() => setShowCompareTooltip(false), 2400);
      return;
    }

    const result = toggleCompare(listing);
    setCompareTooltipText(
      result.isAdded ? "Đã thêm vào so sánh" : "Đã xóa khỏi so sánh"
    );
    setShowCompareTooltip(true);
    setTimeout(() => setShowCompareTooltip(false), 2400);
  };

  const propertyTypeLabel =
    PROPERTY_TYPE_LABELS[listing.propertyType] || "Phòng trọ";
  const isVerifiedLandlord =
    !isMock &&
    listing.landlord?.landlordProfile?.verificationStatus === "VERIFIED";
  const isFeatured =
    !isMock &&
    (listing.currentTier === "HOT" || listing.currentTier === "VIP");

  return (
    <article
      className={`group bg-white rounded-2xl overflow-hidden transition-all duration-300 flex flex-col h-full ${
        isFeatured
          ? "border-2 border-[#F4CD65]/80 shadow-[0_4px_22px_-4px_rgba(244,205,101,0.28)] hover:border-[#DCA936] hover:shadow-[0_8px_30px_-6px_rgba(244,205,101,0.4)] hover:-translate-y-1"
          : "border border-[#E5E7EB] hover:border-[#DCA936] hover:shadow-lg hover:shadow-stone-900/5 hover:-translate-y-0.5"
      }`}
    >
      {/* Image Container */}
      <Link
        href={`/listings/${listing.id}`}
        className="relative block aspect-[16/10] overflow-hidden bg-stone-100"
      >
        <img
          src={imgSrc}
          alt={listing.title}
          referrerPolicy="no-referrer"
          onError={(e) => {
            const target = e.currentTarget;
            target.onerror = null;
            target.src = DEFAULT_LISTING_IMAGE;
          }}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
        />

        {/* Property & Featured Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5">
          {isFeatured && (
            <span className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-[#F4CD65] text-[#292524] shadow-xs flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-[#292524]" />
              <span>Phòng nổi bật</span>
            </span>
          )}
          <span className="px-2 py-0.5 text-[11px] font-medium rounded-md bg-white/95 backdrop-blur-sm text-[#292524] border border-[#E5E7EB] shadow-2xs">
            {propertyTypeLabel}
          </span>
          {isVerifiedLandlord && (
            <span className="px-2 py-0.5 text-[11px] font-medium rounded-md bg-white/95 backdrop-blur-sm text-[#292524] border border-[#E5E7EB] flex items-center gap-1 shadow-2xs">
              <ShieldCheck className="w-3 h-3 text-[#805B10]" />
              Xác minh
            </span>
          )}
        </div>

        {/* Top-right action buttons: Favorite + Compare */}
        <div className="absolute top-2.5 right-2.5 flex flex-col items-end gap-1.5">
          {/* Favorite */}
          <div className="flex flex-col items-end">
            <button
              onClick={handleFavoriteClick}
              className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-[#57534E] hover:text-rose-500 hover:bg-white active:scale-95 shadow-xs transition-all cursor-pointer border border-[#E5E7EB]"
              aria-label={isFav ? "Bỏ lưu tin" : "Lưu tin"}
              title="Lưu tin"
            >
              <Heart
                className={`w-3.5 h-3.5 transition-colors ${
                  isFav ? "fill-rose-500 text-rose-500" : ""
                }`}
              />
            </button>
            {showFavTooltip && (
              <span className="mt-1 px-2.5 py-1 text-[11px] font-medium bg-[#292524] text-white rounded-lg shadow-md pointer-events-none whitespace-nowrap animate-in fade-in zoom-in-95">
                {tooltipText || (isFav ? "Đã lưu tin" : "Đã bỏ lưu")}
              </span>
            )}
          </div>

          {/* Compare */}
          <div className="flex flex-col items-end">
            <button
              onClick={handleCompareClick}
              className={cn(
                "w-8 h-8 rounded-full backdrop-blur-sm flex items-center justify-center active:scale-95 shadow-xs transition-all cursor-pointer border",
                inCompare
                  ? "bg-[#F4CD65] border-[#DCA936] text-[#292524] hover:bg-[#ebbf4d]"
                  : "bg-white/90 border-[#E5E7EB] text-[#57534E] hover:text-[#805B10] hover:bg-white"
              )}
              aria-label={inCompare ? "Xóa khỏi so sánh" : "Thêm vào so sánh"}
              title="So sánh phòng"
            >
              <ArrowLeftRight className="w-3.5 h-3.5" />
            </button>
            {showCompareTooltip && (
              <span className="mt-1 px-2.5 py-1 text-[11px] font-medium bg-[#292524] text-white rounded-lg shadow-md pointer-events-none whitespace-nowrap animate-in fade-in zoom-in-95">
                {compareTooltipText}
              </span>
            )}
          </div>
        </div>
      </Link>

      {/* Details Container */}
      <div className="p-3.5 sm:p-4 flex flex-col flex-1 justify-between gap-2.5 bg-white">
        <div>
          {/* Title */}
          <Link href={`/listings/${listing.id}`}>
            <h3 className="text-sm sm:text-base font-semibold text-[#292524] line-clamp-2 group-hover:text-[#805B10] transition-colors leading-snug">
              {listing.title}
            </h3>
          </Link>

          {/* Location */}
          <p className="mt-1 flex items-center gap-1 text-xs text-[#57534E] font-normal line-clamp-1">
            <MapPin className="w-3.5 h-3.5 text-[#78716C] shrink-0" />
            <span>
              {listing.district ? `${listing.district}, ` : ""}
              {listing.city}
            </span>
          </p>
        </div>

        {/* Room Attributes Row */}
        <div className="pt-2 border-t border-[#E5E7EB] flex items-center justify-between text-xs text-[#78716C] font-normal">
          <div className="flex items-center gap-1" title="Diện tích">
            <Maximize className="w-3.5 h-3.5 text-[#78716C]" />
            <span>{formatArea(listing.area)}</span>
          </div>

          <div className="flex items-center gap-1" title="Phòng ngủ">
            <Bed className="w-3.5 h-3.5 text-[#78716C]" />
            <span>{listing.bedrooms || 1} PN</span>
          </div>

          <div className="flex items-center gap-1" title="Phòng tắm/WC">
            <Bath className="w-3.5 h-3.5 text-[#78716C]" />
            <span>{listing.bathrooms || 1} WC</span>
          </div>

          <div className="flex items-center gap-1" title="Số người tối đa">
            <Users className="w-3.5 h-3.5 text-[#78716C]" />
            <span>{listing.maxOccupants || 2} người</span>
          </div>
        </div>

        {/* Price & Action Row */}
        <div className="pt-2.5 border-t border-[#E5E7EB] flex items-center justify-between">
          <div>
            <span className="text-base sm:text-lg font-bold text-[#292524]">
              {formatVND(listing.price)}
            </span>
            <span className="text-xs text-[#78716C] ml-1">/tháng</span>
          </div>

          <Link
            href={`/listings/${listing.id}`}
            className={`px-3.5 py-1.5 rounded-xl font-medium text-xs transition-all flex items-center gap-1 shadow-2xs group/btn ${
              isFeatured
                ? "bg-[#F4CD65] hover:bg-[#ebbf4d] active:bg-[#dda934] text-[#292524] font-semibold"
                : "bg-stone-100 hover:bg-stone-200 text-[#292524]"
            }`}
          >
            <span>Chi tiết</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </article>
  );
}
