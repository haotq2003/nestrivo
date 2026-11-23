"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import axios from "axios";
import { 
  MapPin, 
  Maximize, 
  Bed, 
  Bath, 
  Users, 
  ShieldCheck, 
  Sparkles,
  Wifi,
  Wind,
  Flame,
  KeyRound,
  Check,
  AlertCircle,
  RotateCcw,
  Home,
  Building2,
  Calendar,
  Clock,
  FileText,
  Camera,
  DoorOpen,
  Armchair,
  Layers,
  Dog,
  Shirt,
  Car,
  ArrowUpDown,
  Sun,
  UtensilsCrossed,
  CalendarCheck,
  Info
} from "lucide-react";
import ListingGallery from "@/components/listings/ListingGallery";
import ListingDetailRail from "@/components/listings/ListingDetailRail";
import ListingCard from "@/components/listings/ListingCard";
import ListingViewingReviews from "@/components/listings/ListingViewingReviews";
import ListingMapLocation from "@/components/listings/ListingMapLocation";
import { ListingAmenity, PROPERTY_TYPE_LABELS } from "@/types/listing";
import { formatArea } from "@/lib/utils";
import { useListingDetailQuery } from "@/hooks/queries";

/**
 * Maps an amenity name to a relevant Lucide icon.
 */
function getAmenityIcon(name: string) {
  const lower = name.toLowerCase();
  if (lower.includes("camera") || lower.includes("an ninh")) return Camera;
  if (lower.includes("vân tay") || lower.includes("khóa") || lower.includes("thẻ từ")) return KeyRound;
  if (lower.includes("giờ") || lower.includes("tự do")) return Clock;
  if (lower.includes("không chung chủ") || lower.includes("cổng riêng") || lower.includes("lối đi")) return DoorOpen;
  if (lower.includes("bảo vệ")) return ShieldCheck;
  if (lower.includes("điều hòa") || lower.includes("máy lạnh")) return Wind;
  if (lower.includes("nóng lạnh") || lower.includes("bình nóng")) return Flame;
  if (lower.includes("wc") || lower.includes("vệ sinh") || lower.includes("tắm")) return Bath;
  if (lower.includes("ban công") || lower.includes("cửa sổ") || lower.includes("sáng")) return Sun;
  if (lower.includes("bếp") || lower.includes("nấu ăn")) return UtensilsCrossed;
  if (lower.includes("giường") || lower.includes("nệm") || lower.includes("đệm")) return Bed;
  if (lower.includes("tủ") || lower.includes("bàn") || lower.includes("ghế") || lower.includes("sofa")) return Armchair;
  if (lower.includes("thang máy")) return ArrowUpDown;
  if (lower.includes("xe") || lower.includes("đỗ xe")) return Car;
  if (lower.includes("wifi") || lower.includes("internet") || lower.includes("mạng")) return Wifi;
  if (lower.includes("giặt") || lower.includes("phơi")) return Shirt;
  return Check;
}

/**
 * Organizes listing amenities into logical categories (Security, Living, Shared, Other).
 */
function categorizeAmenities(amenities: ListingAmenity[] = []) {
  const groups: {
    security: ListingAmenity[];
    living: ListingAmenity[];
    shared: ListingAmenity[];
    other: ListingAmenity[];
  } = {
    security: [],
    living: [],
    shared: [],
    other: [],
  };

  const securityKeywords = [
    "camera", "khóa", "vân tay", "thẻ từ", "an ninh", "bảo vệ", "giờ giấc", "tự do", "không chung chủ", "cổng riêng", "lối đi riêng", "chuông"
  ];
  const livingKeywords = [
    "điều hòa", "máy lạnh", "nóng lạnh", "bình nóng", "wc", "vệ sinh", "phòng tắm", "ban công", "cửa sổ", "tủ lạnh", "bếp", "giường", "nệm", "đệm", "tủ quần áo", "bàn", "ghế", "sofa", "nội thất"
  ];
  const sharedKeywords = [
    "xe", "đỗ xe", "nhà xe", "bãi xe", "thang máy", "wifi", "internet", "máy giặt", "sân phơi", "giặt", "dọn phòng", "hồ bơi", "gym"
  ];

  for (const item of amenities) {
    const name = (item.amenity?.name || "").toLowerCase();
    if (securityKeywords.some((k) => name.includes(k))) {
      groups.security.push(item);
    } else if (livingKeywords.some((k) => name.includes(k))) {
      groups.living.push(item);
    } else if (sharedKeywords.some((k) => name.includes(k))) {
      groups.shared.push(item);
    } else {
      groups.other.push(item);
    }
  }

  const result: { title: string; icon: any; items: ListingAmenity[] }[] = [];
  if (groups.security.length > 0) {
    result.push({ title: "An ninh & Ra vào", icon: ShieldCheck, items: groups.security });
  }
  if (groups.living.length > 0) {
    result.push({ title: "Tiện nghi sinh hoạt", icon: Home, items: groups.living });
  }
  if (groups.shared.length > 0) {
    result.push({ title: "Tiện ích chung & Dịch vụ", icon: Building2, items: groups.shared });
  }
  if (groups.other.length > 0) {
    result.push({ title: "Tiện ích khác", icon: Sparkles, items: groups.other });
  }

  return result;
}

export default function ListingDetailPage() {
  const params = useParams();
  const id = (params?.id as string) || "";

  // TanStack Query: Cache chi tiết phòng 5 phút -> quay lại xem cực nhanh (0ms)
  const { data, isLoading, isError, error, refetch } = useListingDetailQuery(id);

  const isNotFound =
    isError && axios.isAxiosError(error) && error.response?.status === 404;

  // Loading Skeleton (chỉ hiện lần đầu khi chưa có trong cache)
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC]">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-pulse">
          <div className="h-4 bg-stone-200 rounded w-48" />
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] xl:grid-cols-[1fr_380px] gap-8">
            <div className="space-y-6">
              <div className="h-8 bg-stone-200 rounded w-3/4" />
              <div className="h-[380px] bg-stone-200 rounded-2xl" />
              <div className="h-32 bg-stone-200 rounded-2xl" />
            </div>
            <div className="h-[420px] bg-stone-200 rounded-2xl" />
          </div>
        </main>
      </div>
    );
  }

  // 404 Not Found State
  if (isNotFound || (!isError && !data?.listing)) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-stone-100 border border-stone-200 text-stone-500 mx-auto flex items-center justify-center">
          <Home className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-[#292524]">Không tìm thấy phòng trọ</h1>
          <p className="text-sm text-[#57534E] leading-relaxed">
            Tin đăng này có thể đã bị gỡ bỏ, tạm ẩn hoặc đường dẫn không tồn tại.
          </p>
        </div>
        <div className="flex items-center justify-center pt-2">
          <Link
            href="/"
            className="px-5 py-2.5 rounded-xl bg-[#F4CD65] hover:bg-[#ebbf4d] text-[#292524] text-sm font-semibold shadow-xs transition-all flex items-center gap-2"
          >
            <Home className="w-4 h-4" />
            <span>Về trang chủ tìm phòng khác</span>
          </Link>
        </div>
      </div>
    );
  }

  // Error State with Retry
  if (isError) {
    const fetchError =
      "Không thể kết nối đến máy chủ API. Vui lòng kiểm tra lại kết nối mạng hoặc trạng thái máy chủ.";
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 mx-auto flex items-center justify-center">
          <AlertCircle className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-[#292524]">Không thể tải dữ liệu</h1>
          <p className="text-sm text-[#57534E] leading-relaxed">{fetchError}</p>
        </div>
        <div className="flex items-center justify-center gap-3 pt-2">
          <Link
            href="/"
            className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#57534E] text-sm font-medium transition-colors flex items-center gap-2"
          >
            <Home className="w-4 h-4" />
            <span>Về trang chủ</span>
          </Link>
          <button
            type="button"
            onClick={() => refetch()}
            className="px-5 py-2.5 rounded-xl bg-[#F4CD65] hover:bg-[#ebbf4d] text-[#292524] text-sm font-semibold shadow-xs transition-all flex items-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Thử lại</span>
          </button>
        </div>
      </div>
    );
  }

  const listing = data!.listing;
  const similarListings = data?.similarListings || [];
  const isMock = false;

  const propertyTypeLabel = PROPERTY_TYPE_LABELS[listing.propertyType] || "Phòng trọ";
  const isVerifiedLandlord = !isMock && listing.landlord?.landlordProfile?.verificationStatus === "VERIFIED";

  const amenityGroups = categorizeAmenities(listing.amenities || []);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Top Banner for Mock Data */}
      {isMock && (
        <div className="h-9 bg-[#FFF9EE] text-[#805B10] text-xs sm:text-sm font-medium flex items-center justify-center border-b border-[#FDE68A] px-4 text-center">
          Tin đăng mẫu — dữ liệu minh họa trải nghiệm giao diện người dùng
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8 pb-28 lg:pb-16">
        {/* ========================================================= */}
        {/* TWO-COLUMN DETAIL LAYOUT (Specification on Left, Rail on Right) */}
        {/* ========================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] xl:grid-cols-[1fr_380px] gap-8 xl:gap-10">
          {/* Left Column: Full Property Specification */}
          <section className="space-y-6 sm:space-y-8 min-w-0">
            {/* Breadcrumb Navigation */}
            <nav className="flex items-center gap-2 text-xs text-[#78716C] font-normal">
              <Link href="/" className="hover:text-[#805B10] transition-colors">
                Trang chủ
              </Link>
              <span>/</span>
              <Link href={`/?city=${encodeURIComponent(listing.city)}`} className="hover:text-[#805B10] transition-colors">
                {listing.city}
              </Link>
              {listing.district && (
                <>
                  <span>/</span>
                  <Link
                    href={`/?city=${encodeURIComponent(listing.city)}&district=${encodeURIComponent(listing.district)}`}
                    className="hover:text-[#805B10] transition-colors"
                  >
                    {listing.district}
                  </Link>
                </>
              )}
            </nav>

            {/* Listing Header: Title, Badges & Exact Address */}
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg bg-[#292524] text-white font-medium text-xs">
                  {propertyTypeLabel}
                </span>

                {listing.availabilityStatus === "AVAILABLE" ? (
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-medium flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Đang trống phòng
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 text-xs font-medium">
                    Đã cho thuê
                  </span>
                )}

                {isVerifiedLandlord && (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-[#805B10] bg-[#FFF9EE] border border-[#FDE68A] px-2.5 py-1 rounded-lg">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#DCA936]" />
                    Chủ nhà đã xác minh eKYC
                  </span>
                )}

                {!isMock && (listing.currentTier === "VIP" || listing.currentTier === "HOT") && (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-[#805B10] bg-[#FFF1CC] border border-[#F4CD65] px-2.5 py-1 rounded-lg">
                    <Sparkles className="w-3.5 h-3.5 text-[#805B10]" />
                    Phòng nổi bật
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#292524] tracking-tight leading-snug">
                {listing.title}
              </h1>

              {/* Exact Address with MapPin & Jump to Map */}
              <div>
                <a
                  href="#map-location"
                  className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-[#57534E] hover:text-[#805B10] font-normal pt-0.5 group transition-colors cursor-pointer"
                  title="Bấm để cuộn xuống xem vị trí trên bản đồ"
                >
                  <MapPin className="w-4 h-4 text-[#78716C] group-hover:text-[#805B10] shrink-0 transition-colors" />
                  <span className="underline decoration-dotted decoration-stone-300 underline-offset-4 group-hover:decoration-[#805B10]">
                    {listing.address}
                    {listing.ward ? `, Phường ${listing.ward}` : ""}
                    {listing.district ? `, ${listing.district}` : ""}
                    {`, ${listing.city}`}
                  </span>
                  <span className="text-[11px] text-[#805B10] bg-[#FFF7E5] px-2 py-0.5 rounded-full font-medium ml-1">
                    Xem bản đồ
                  </span>
                </a>
              </div>
            </div>

            {/* Image Gallery */}
            <ListingGallery images={listing.images || []} title={listing.title} />

            {/* Mobile Inline Decision Summary (rendered only on < 1024px) */}
            <div className="block lg:hidden">
              <ListingDetailRail listing={listing} isMock={isMock} />
            </div>

            {/* ========================================================= */}
            {/* 1. ROOM INFORMATION OVERVIEW (Clean Grid Layout)          */}
            {/* ========================================================= */}
            <div className="bg-white rounded-3xl border border-[#E5E7EB] p-5 sm:p-7 shadow-xs space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB]">
                <h2 className="text-base sm:text-lg font-semibold text-[#292524] flex items-center gap-2">
                  <Home className="w-5 h-5 text-[#805B10]" />
                  <span>Thông số &amp; Đặc điểm phòng</span>
                </h2>
                <div className="flex items-center gap-2 text-xs text-[#78716C] font-normal">
                  <span>Mã tin: #{listing.id.slice(-6).toUpperCase()}</span>
                  {typeof listing.views === "number" && listing.views > 0 && (
                    <>
                      <span>•</span>
                      <span>{listing.views} lượt xem</span>
                    </>
                  )}
                </div>
              </div>

              {/* 8-Cell Compact Specifications Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                <div className="p-3.5 rounded-2xl bg-[#F8FAFC] border border-slate-100 space-y-1">
                  <span className="text-xs font-normal text-[#78716C] flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-[#A8A29E]" />
                    Loại phòng
                  </span>
                  <p className="text-sm font-semibold text-[#292524] truncate">{propertyTypeLabel}</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#F8FAFC] border border-slate-100 space-y-1">
                  <span className="text-xs font-normal text-[#78716C] flex items-center gap-1.5">
                    <Maximize className="w-3.5 h-3.5 text-[#A8A29E]" />
                    Diện tích
                  </span>
                  <p className="text-sm font-semibold text-[#292524]">{formatArea(listing.area)}</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#F8FAFC] border border-slate-100 space-y-1">
                  <span className="text-xs font-normal text-[#78716C] flex items-center gap-1.5">
                    <Bed className="w-3.5 h-3.5 text-[#A8A29E]" />
                    Phòng ngủ
                  </span>
                  <p className="text-sm font-semibold text-[#292524]">{listing.bedrooms || 1} phòng</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#F8FAFC] border border-slate-100 space-y-1">
                  <span className="text-xs font-normal text-[#78716C] flex items-center gap-1.5">
                    <Bath className="w-3.5 h-3.5 text-[#A8A29E]" />
                    Phòng tắm
                  </span>
                  <p className="text-sm font-semibold text-[#292524]">{listing.bathrooms || 1} WC</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#F8FAFC] border border-slate-100 space-y-1">
                  <span className="text-xs font-normal text-[#78716C] flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-[#A8A29E]" />
                    Sức chứa
                  </span>
                  <p className="text-sm font-semibold text-[#292524]">Tối đa {listing.maxOccupants || 2} người</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#F8FAFC] border border-slate-100 space-y-1">
                  <span className="text-xs font-normal text-[#78716C] flex items-center gap-1.5">
                    <Armchair className="w-3.5 h-3.5 text-[#A8A29E]" />
                    Nội thất
                  </span>
                  <p className="text-sm font-semibold text-[#292524] truncate">
                    {listing.isFurnished ? "Đầy đủ nội thất" : "Nội thất cơ bản"}
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#F8FAFC] border border-slate-100 space-y-1">
                  <span className="text-xs font-normal text-[#78716C] flex items-center gap-1.5">
                    <CalendarCheck className="w-3.5 h-3.5 text-[#A8A29E]" />
                    Dọn vào ở
                  </span>
                  <p className="text-sm font-semibold text-[#292524] truncate">
                    {listing.availabilityStatus === "AVAILABLE" ? "Ở ngay" : "Liên hệ"}
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#F8FAFC] border border-slate-100 space-y-1">
                  <span className="text-xs font-normal text-[#78716C] flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-[#A8A29E]" />
                    Hợp đồng
                  </span>
                  <p className="text-sm font-semibold text-[#292524] truncate">
                    {listing.minimumStayMonths ? `≥ ${listing.minimumStayMonths} tháng` : "Linh hoạt"}
                  </p>
                </div>
              </div>

              {/* Sub-specs Strip: Mezzanine & Pets */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs sm:text-sm text-[#57534E]">
                <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-[#F8FAFC] border border-slate-100">
                  <Layers className="w-4 h-4 text-[#805B10] shrink-0" />
                  <span>
                    Gác lửng:{" "}
                    <strong className="font-semibold text-[#292524]">
                      {listing.hasMezzanine ? "Có gác lửng kiên cố" : "Không có gác lửng"}
                    </strong>
                  </span>
                </div>

                <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-[#F8FAFC] border border-slate-100">
                  <Dog className="w-4 h-4 text-[#805B10] shrink-0" />
                  <span>
                    Quy định thú cưng:{" "}
                    <strong className="font-semibold text-[#292524]">
                      {listing.allowsPets ? "Cho phép nuôi thú cưng" : "Không cho phép nuôi thú cưng"}
                    </strong>
                  </span>
                </div>
              </div>
            </div>

            {/* ========================================================= */}
            {/* 2. AMENITIES AND FURNISHING (Categorized Groups)          */}
            {/* ========================================================= */}
            <div className="bg-white rounded-3xl border border-[#E5E7EB] p-5 sm:p-7 shadow-xs space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB]">
                <h2 className="text-base sm:text-lg font-semibold text-[#292524] flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#805B10]" />
                  <span>Tiện nghi &amp; Cơ sở vật chất</span>
                </h2>
                <span className="text-xs text-[#78716C] font-normal">
                  {listing.amenities?.length || 0} tiện ích được trang bị
                </span>
              </div>

              {amenityGroups.length > 0 ? (
                <div className="space-y-6">
                  {amenityGroups.map((group, groupIdx) => {
                    const GroupIcon = group.icon;
                    return (
                      <div key={groupIdx} className="space-y-3">
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-[#78716C] flex items-center gap-1.5">
                          <GroupIcon className="w-4 h-4 text-[#805B10]" />
                          <span>{group.title}</span>
                        </h3>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3">
                          {group.items.map((item) => {
                            const AmenityIcon = getAmenityIcon(item.amenity?.name || "");
                            return (
                              <div
                                key={item.amenityId || item.amenity.name}
                                className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[#F8FAFC] border border-slate-100 text-xs sm:text-sm font-normal text-[#292524]"
                              >
                                <div className="w-6 h-6 rounded-lg bg-white border border-[#E5E7EB] text-[#57534E] flex items-center justify-center shrink-0 shadow-2xs">
                                  <AmenityIcon className="w-3.5 h-3.5" />
                                </div>
                                <span className="truncate">{item.amenity.name}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-[#78716C] italic font-normal">
                  Chưa có danh sách tiện ích cụ thể cho tin đăng này.
                </p>
              )}
            </div>

            {/* ========================================================= */}
            {/* 3. DETAILED PROPERTY DESCRIPTION                          */}
            {/* ========================================================= */}
            <div className="bg-white rounded-3xl border border-[#E5E7EB] p-5 sm:p-7 shadow-xs space-y-4">
              <h2 className="text-base sm:text-lg font-semibold text-[#292524] flex items-center gap-2 pb-3 border-b border-[#E5E7EB]">
                <Info className="w-5 h-5 text-[#805B10]" />
                <span>Mô tả chi tiết phòng trọ</span>
              </h2>

              <div className="text-sm sm:text-base text-[#292524] leading-relaxed whitespace-pre-line font-normal">
                {listing.description || "Chưa có nội dung mô tả chi tiết từ chủ phòng."}
              </div>
            </div>

            {/* ========================================================= */}
            {/* 4. LOCATION ON MAP (Xem trên bản đồ)                      */}
            {/* ========================================================= */}
            <div id="map-location" className="scroll-mt-28">
              <ListingMapLocation
                address={listing.address}
                ward={listing.ward}
                district={listing.district}
                city={listing.city}
                latitude={listing.latitude}
                longitude={listing.longitude}
                title={listing.title}
              />
            </div>

            {/* ========================================================= */}
            {/* 5. VERIFIED VIEWING REVIEWS (Đánh giá trải nghiệm thực tế) */}
            {/* ========================================================= */}
            <ListingViewingReviews
              listingId={listing.id}
              landlordId={listing.landlordId}
            />
          </section>

          {/* Right Column: Sticky Decision Rail (Desktop Only - Glides/sticks on scroll) */}
          <div className="hidden lg:block sticky top-24 self-start">
            <ListingDetailRail listing={listing} isMock={isMock} />
          </div>
        </div>

        {/* ========================================================= */}
        {/* SIMILAR LISTINGS SECTION (Below entire 2-column layout)    */}
        {/* ========================================================= */}
        {similarListings.length > 0 && (
          <section className="pt-10 border-t border-[#E5E7EB] space-y-6">
            <div className="space-y-1">
              <h2 className="text-xl sm:text-2xl font-bold text-[#292524]">
                Phòng trọ tương tự tại {listing.city}
              </h2>
              <p className="text-xs sm:text-sm text-[#57534E] font-normal">
                Gợi ý các phòng cùng khu vực hoặc cùng loại hình cho thuê
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {similarListings.map((sim) => (
                <ListingCard key={sim.id} listing={sim} />
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
