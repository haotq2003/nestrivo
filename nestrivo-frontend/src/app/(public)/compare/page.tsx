"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowLeftRight,
  X,
  Trash2,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  MapPin,
  Maximize,
  Bed,
  Bath,
  Users,
  Zap,
  Droplets,
  Wifi,
  Car,
  ShieldCheck,
  ExternalLink,
} from "lucide-react";
import { useCompare } from "@/context/CompareContext";
import { useCompareListingsQuery } from "@/hooks/queries";
import { PROPERTY_TYPE_LABELS, FEE_TYPE_LABELS, FEE_UNIT_LABELS } from "@/types/listing";
import { formatVND, formatArea } from "@/lib/utils";
import { DEFAULT_LISTING_IMAGE } from "@/lib/image";
import { cn } from "@/lib/utils";

// ─── helpers ────────────────────────────────────────────────────────────────

function BoolCell({ value }: { value: boolean }) {
  return value ? (
    <CheckCircle2 className="w-5 h-5 text-emerald-500 mx-auto" />
  ) : (
    <XCircle className="w-5 h-5 text-[#D6D3D1] mx-auto" />
  );
}

function RowLabel({ icon, label }: { icon?: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2.5 text-sm font-medium text-[#44403C] py-3.5 px-4 bg-[#FAF8F5] border-b border-r border-[#E5E7EB]">
      {icon && <span className="text-[#805B10] shrink-0">{icon}</span>}
      <span className="truncate">{label}</span>
    </div>
  );
}

const feeIconMap: Record<string, React.ReactNode> = {
  ELECTRICITY: <Zap className="w-4 h-4" />,
  WATER: <Droplets className="w-4 h-4" />,
  INTERNET: <Wifi className="w-4 h-4" />,
  PARKING: <Car className="w-4 h-4" />,
};

// ─── main component ──────────────────────────────────────────────────────────

export default function ComparePage() {
  const { compareItems, compareIds, removeFromCompare, clearCompare } = useCompare();
  
  // Tận dụng TanStack Query: Caching tự động, không cần useState + useEffect thủ công
  const {
    data: compareRes,
    isLoading: loading,
    isError,
    refetch,
  } = useCompareListingsQuery(compareIds);

  const listings = compareRes?.data || [];
  const colCount = listings.length;

  // ─── empty state ────────────────────────────────────────────────────────
  if (compareIds.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6 px-4 py-20 text-center">
        <div className="w-20 h-20 rounded-full bg-[#FFF7E5] flex items-center justify-center">
          <ArrowLeftRight className="w-9 h-9 text-[#DCA936]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[#292524] mb-2">Chưa có phòng nào để so sánh</h1>
          <p className="text-[#78716C] text-sm max-w-sm mx-auto">
            Hãy quay lại trang danh sách phòng và nhấn biểu tượng{" "}
            <ArrowLeftRight className="inline w-4 h-4 text-[#DCA936]" /> để thêm phòng vào danh sách so sánh.
          </p>
        </div>
        <Link
          href="/"
          className="flex items-center gap-2 px-5 py-2.5 bg-[#F4CD65] hover:bg-[#ebbf4d] text-[#292524] font-semibold rounded-xl transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Tìm phòng ngay
        </Link>
      </div>
    );
  }

  // ─── loading ─────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-4 border-[#F4CD65] border-t-transparent animate-spin" />
          <p className="text-sm text-[#78716C]">Đang tải dữ liệu so sánh...</p>
        </div>
      </div>
    );
  }

  // ─── error ───────────────────────────────────────────────────────────────
  if (isError) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-4 px-4 text-center">
        <XCircle className="w-12 h-12 text-rose-400" />
        <p className="text-[#292524] font-medium">Lỗi kết nối. Không thể tải dữ liệu so sánh.</p>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 bg-[#F4CD65] hover:bg-[#ebbf4d] text-[#292524] font-semibold rounded-xl transition-colors cursor-pointer"
        >
          Thử lại
        </button>
      </div>
    );
  }

  // ─── Collect all amenity names across listings ────────────────────────
  const allAmenityNames = Array.from(
    new Set(
      listings.flatMap((l) => (l.amenities || []).map((a) => a.amenity.name))
    )
  );

  // ─── Collect all fee types ────────────────────────────────────────────
  const allFeeTypes = Array.from(
    new Set(listings.flatMap((l) => (l.fees || []).map((f) => f.type)))
  );

  const gridCols = {
    1: "grid-cols-[220px_1fr]",
    2: "grid-cols-[240px_1fr_1fr]",
    3: "grid-cols-[220px_1fr_1fr_1fr]",
    4: "grid-cols-[200px_1fr_1fr_1fr_1fr]",
  }[colCount] ?? "grid-cols-[220px_1fr]";

  // ─── render ───────────────────────────────────────────────────────────
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-32">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="p-2 rounded-xl border border-[#E5E7EB] hover:border-[#DCA936] hover:bg-[#FFF7E5] transition-colors text-[#57534E] hover:text-[#292524]"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#292524] flex items-center gap-2">
              <ArrowLeftRight className="w-5 h-5 text-[#DCA936]" />
              So sánh phòng trọ
            </h1>
            <p className="text-sm text-[#78716C]">
              Đang so sánh {colCount} phòng
            </p>
          </div>
        </div>
        <button
          onClick={clearCompare}
          className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-[#57534E] hover:text-rose-500 border border-[#E5E7EB] hover:border-rose-200 rounded-xl transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          Xóa tất cả
        </button>
      </div>

      {/* Comparison table */}
      <div className="overflow-x-auto rounded-2xl border border-[#E5E7EB] shadow-sm bg-white">
        <div className={cn("grid min-w-[640px]", gridCols)}>

          {/* ══ STICKY HEADER SECTION ══ */}
          {/* Label column header with summary card */}
          <div className="bg-gradient-to-b from-[#FFFDF8] to-[#FFF7E5] border-b border-r border-[#E5E7EB] p-4 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-[#F4CD65]/30 border border-[#F4CD65]/60 flex items-center justify-center text-[#805B10] mb-3 shadow-xs">
                <ArrowLeftRight className="w-5 h-5 text-[#805B10]" />
              </div>
              <h2 className="text-sm font-bold text-[#292524] mb-1">Tiêu chí so sánh</h2>
              <p className="text-xs text-[#78716C] leading-relaxed">
                Đối chiếu chi tiết diện tích, chi phí & tiện ích giữa các phòng.
              </p>
            </div>
            <div className="pt-3 border-t border-[#E5E7EB]/70">
              <span className="text-[11px] font-bold text-[#805B10] uppercase tracking-wider bg-white px-2.5 py-1 rounded-md border border-[#F4CD65]/40 inline-block shadow-2xs">
                Danh mục chi tiết
              </span>
            </div>
          </div>

          {/* Listing header cards */}
          {listings.map((listing) => {
            const imgUrl = listing.images?.[0]?.imageUrl || DEFAULT_LISTING_IMAGE;
            const isVerified = listing.landlord?.landlordProfile?.verificationStatus === "VERIFIED";
            return (
              <div
                key={listing.id}
                className="bg-[#FFFAEF] border-b border-r last:border-r-0 border-[#E5E7EB] p-3 flex flex-col gap-2"
              >
                {/* Thumbnail */}
                <div className="relative">
                  <img
                    src={imgUrl}
                    alt={listing.title}
                    className="w-full h-36 object-cover rounded-xl"
                    onError={(e) => {
                      e.currentTarget.src = DEFAULT_LISTING_IMAGE;
                    }}
                  />
                  <button
                    onClick={() => removeFromCompare(listing.id)}
                    className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white/90 hover:bg-rose-50 hover:text-rose-500 border border-[#E5E7EB] flex items-center justify-center transition-colors shadow-xs"
                    title="Xóa khỏi so sánh"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Title + link */}
                <Link
                  href={`/listings/${listing.id}`}
                  className="text-sm font-semibold text-[#292524] hover:text-[#805B10] line-clamp-2 leading-snug flex items-start gap-1 group"
                >
                  <span className="flex-1">{listing.title}</span>
                  <ExternalLink className="w-3.5 h-3.5 mt-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-[#805B10]" />
                </Link>

                {/* Type badge */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="px-2 py-0.5 text-[11px] font-medium rounded-md bg-[#F4CD65]/30 text-[#805B10] border border-[#F4CD65]/60">
                    {PROPERTY_TYPE_LABELS[listing.propertyType] || "Phòng trọ"}
                  </span>
                  {isVerified && (
                    <span className="px-2 py-0.5 text-[11px] font-medium rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-0.5">
                      <ShieldCheck className="w-3 h-3" />
                      Xác minh
                    </span>
                  )}
                </div>

                {/* Price */}
                <div>
                  <span className="text-lg font-bold text-[#292524]">{formatVND(listing.price)}</span>
                  <span className="text-xs text-[#78716C] ml-1">/tháng</span>
                </div>

                {/* CTA */}
                <Link
                  href={`/listings/${listing.id}`}
                  className="mt-auto w-full py-1.5 text-center text-xs font-semibold bg-[#F4CD65] hover:bg-[#ebbf4d] text-[#292524] rounded-xl transition-colors"
                >
                  Xem chi tiết
                </Link>
              </div>
            );
          })}

          {/* ══ THÔNG TIN CƠ BẢN ══ */}
          <SectionHeader label="Thông tin cơ bản" colCount={colCount} />

          {/* Địa chỉ */}
          <RowLabel icon={<MapPin className="w-4 h-4" />} label="Địa chỉ" />
          {listings.map((l) => (
            <Cell key={l.id}>
              <span className="text-sm text-[#292524]">
                {[l.ward, l.district, l.city].filter(Boolean).join(", ")}
              </span>
            </Cell>
          ))}

          {/* Diện tích */}
          <RowLabel icon={<Maximize className="w-4 h-4" />} label="Diện tích" />
          {listings.map((l) => (
            <Cell key={l.id}>
              <span className="text-sm font-semibold text-[#292524]">{formatArea(l.area)}</span>
            </Cell>
          ))}

          {/* Phòng ngủ */}
          <RowLabel icon={<Bed className="w-4 h-4" />} label="Phòng ngủ" />
          {listings.map((l) => (
            <Cell key={l.id}>
              <span className="text-sm text-[#292524]">{l.bedrooms || 1} phòng</span>
            </Cell>
          ))}

          {/* Phòng tắm */}
          <RowLabel icon={<Bath className="w-4 h-4" />} label="Phòng tắm" />
          {listings.map((l) => (
            <Cell key={l.id}>
              <span className="text-sm text-[#292524]">{l.bathrooms || 1} WC</span>
            </Cell>
          ))}

          {/* Số người */}
          <RowLabel icon={<Users className="w-4 h-4" />} label="Tối đa người ở" />
          {listings.map((l) => (
            <Cell key={l.id}>
              <span className="text-sm text-[#292524]">{l.maxOccupants || 2} người</span>
            </Cell>
          ))}

          {/* Tiền cọc */}
          <RowLabel label="Tiền đặt cọc" />
          {listings.map((l) => (
            <Cell key={l.id}>
              <span className="text-sm font-semibold text-[#292524]">{formatVND(l.deposit)}</span>
            </Cell>
          ))}

          {/* Thuê tối thiểu */}
          <RowLabel label="Thuê tối thiểu" />
          {listings.map((l) => (
            <Cell key={l.id}>
              <span className="text-sm text-[#292524]">
                {l.minimumStayMonths ? `${l.minimumStayMonths} tháng` : "Không yêu cầu"}
              </span>
            </Cell>
          ))}

          {/* ══ TIỆN NGHI & ĐẶC ĐIỂM ══ */}
          <SectionHeader label="Tiện nghi & Đặc điểm" colCount={colCount} />

          {/* Nội thất */}
          <RowLabel label="Nội thất" />
          {listings.map((l) => (
            <Cell key={l.id}>
              <BoolCell value={l.isFurnished} />
            </Cell>
          ))}

          {/* Gác lửng */}
          <RowLabel label="Gác lửng" />
          {listings.map((l) => (
            <Cell key={l.id}>
              <BoolCell value={l.hasMezzanine} />
            </Cell>
          ))}

          {/* Nuôi thú cưng */}
          <RowLabel label="Nuôi thú cưng" />
          {listings.map((l) => (
            <Cell key={l.id}>
              <BoolCell value={l.allowsPets} />
            </Cell>
          ))}

          {/* Dynamic amenities */}
          {allAmenityNames.map((amenityName) => (
            <React.Fragment key={amenityName}>
              <RowLabel label={amenityName} />
              {listings.map((l) => {
                const has = (l.amenities || []).some((a) => a.amenity.name === amenityName);
                return (
                  <Cell key={`${l.id}-${amenityName}`}>
                    <BoolCell value={has} />
                  </Cell>
                );
              })}
            </React.Fragment>
          ))}

          {/* ══ CHI PHÍ HÀNG THÁNG ══ */}
          {allFeeTypes.length > 0 && (
            <>
              <SectionHeader label="Chi phí hàng tháng" colCount={colCount} />
              {allFeeTypes.map((feeType) => (
                <React.Fragment key={feeType}>
                  <RowLabel
                    icon={feeIconMap[feeType]}
                    label={FEE_TYPE_LABELS[feeType] || feeType}
                  />
                  {listings.map((l) => {
                    const fee = (l.fees || []).find((f) => f.type === feeType);
                    return (
                      <Cell key={`${l.id}-fee-${feeType}`}>
                        {fee ? (
                          <div className="text-sm text-[#292524]">
                            <span className="font-medium">{formatVND(fee.amount)}</span>
                            <span className="text-[#78716C] text-xs ml-1">
                              {FEE_UNIT_LABELS[fee.unit] || fee.unit}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-[#A8A29E]">—</span>
                        )}
                      </Cell>
                    );
                  })}
                </React.Fragment>
              ))}
            </>
          )}

          {/* ══ CHỦ NHÀ ══ */}
          <SectionHeader label="Chủ nhà" colCount={colCount} />

          {/* Tên chủ nhà */}
          <RowLabel label="Chủ nhà" />
          {listings.map((l) => (
            <Cell key={l.id}>
              <div className="flex items-center gap-2">
                {l.landlord?.avatarUrl ? (
                  <img
                    src={l.landlord.avatarUrl}
                    alt={l.landlord.fullName}
                    className="w-7 h-7 rounded-full object-cover border border-[#E5E7EB]"
                    onError={(e) => { e.currentTarget.style.display = "none"; }}
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-[#F4CD65]/40 flex items-center justify-center text-xs font-bold text-[#805B10]">
                    {l.landlord?.fullName?.[0] || "?"}
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-[#292524]">
                    {l.landlord?.landlordProfile?.displayName || l.landlord?.fullName || "Chủ nhà"}
                  </p>
                  {l.landlord?.landlordProfile?.verificationStatus === "VERIFIED" && (
                    <p className="text-[11px] text-emerald-600 flex items-center gap-0.5">
                      <ShieldCheck className="w-3 h-3" /> Đã xác minh
                    </p>
                  )}
                </div>
              </div>
            </Cell>
          ))}

          {/* SĐT chủ nhà */}
          <RowLabel label="Số điện thoại" />
          {listings.map((l) => (
            <Cell key={l.id}>
              {l.landlord?.phoneNumber ? (
                <a
                  href={`tel:${l.landlord.phoneNumber}`}
                  className="text-sm text-[#805B10] hover:underline font-medium"
                >
                  {l.landlord.phoneNumber}
                </a>
              ) : (
                <span className="text-xs text-[#A8A29E]">Chưa cập nhật</span>
              )}
            </Cell>
          ))}
        </div>
      </div>

      {/* Bottom note */}
      <p className="mt-4 text-xs text-center text-[#A8A29E]">
        Thông tin được cập nhật bởi chủ nhà. Vui lòng liên hệ trực tiếp để xác nhận.
      </p>
    </div>
  );
}

// ─── Helper sub-components ───────────────────────────────────────────────────

function SectionHeader({ label, colCount }: { label: string; colCount: number }) {
  return (
    <>
      <div className="bg-[#FFF7E5] border-y border-r border-[#E5E7EB] px-3 py-2 flex items-center">
        <span className="text-xs font-bold text-[#805B10] uppercase tracking-wide">{label}</span>
      </div>
      {Array.from({ length: colCount }).map((_, i) => (
        <div key={i} className="bg-[#FFF7E5] border-y border-r last:border-r-0 border-[#E5E7EB]" />
      ))}
    </>
  );
}

function Cell({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-b border-r last:border-r-0 border-[#E5E7EB] px-3 py-3 flex items-center justify-center text-center">
      {children}
    </div>
  );
}
