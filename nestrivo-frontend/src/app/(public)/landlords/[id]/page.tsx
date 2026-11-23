"use client";

import { use, useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  Building2, 
  ShieldCheck, 
  Phone, 
  Copy, 
  Check, 
  MapPin, 
  Calendar, 
  Clock, 
  Search, 
  Filter, 
  ArrowUpDown, 
  MessageSquare, 
  AlertCircle,
  Home,
  Star,
  ExternalLink,
  ChevronRight,
  Shield,
  BadgeCheck,
  CheckCircle2
} from "lucide-react";
import ListingCard from "@/components/listings/ListingCard";
import { getPublicLandlordProfile, getListingsByLandlordId } from "@/lib/public-landlord-data";
import { PROPERTY_TYPE_LABELS, PropertyType } from "@/types/listing";

interface LandlordPublicPageProps {
  params: Promise<{ id: string }>;
}

export default function LandlordPublicStorePage({ params }: LandlordPublicPageProps) {
  const resolvedParams = use(params);
  const landlordId = resolvedParams.id;

  const landlord = useMemo(() => getPublicLandlordProfile(landlordId), [landlordId]);
  const allListings = useMemo(() => getListingsByLandlordId(landlordId), [landlordId]);

  // State
  const [selectedPropertyType, setSelectedPropertyType] = useState<string>("ALL");
  const [searchKeyword, setSearchKeyword] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("NEWEST");
  const [copiedPhone, setCopiedPhone] = useState<boolean>(false);
  const [phoneRevealed, setPhoneRevealed] = useState<boolean>(false);

  const handleCopyPhone = () => {
    if (!landlord.phoneNumber) return;
    navigator.clipboard.writeText(landlord.phoneNumber);
    setCopiedPhone(true);
    setTimeout(() => setCopiedPhone(false), 2000);
  };

  // Filtered & Sorted listings
  const filteredListings = useMemo(() => {
    return allListings
      .filter((item) => {
        if (selectedPropertyType !== "ALL" && item.propertyType !== selectedPropertyType) {
          return false;
        }
        if (searchKeyword.trim()) {
          const q = searchKeyword.toLowerCase().trim();
          const matchTitle = item.title.toLowerCase().includes(q);
          const matchAddress = item.address.toLowerCase().includes(q) || item.district.toLowerCase().includes(q);
          const matchDesc = item.description.toLowerCase().includes(q);
          if (!matchTitle && !matchAddress && !matchDesc) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === "PRICE_ASC") return Number(a.price) - Number(b.price);
        if (sortBy === "PRICE_DESC") return Number(b.price) - Number(a.price);
        if (sortBy === "AREA_DESC") return Number(b.area) - Number(a.area);
        // Default newest
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [allListings, selectedPropertyType, searchKeyword, sortBy]);

  // Categories with counts
  const categoryTabs = useMemo(() => {
    const studioCount = allListings.filter((x) => x.propertyType === "STUDIO").length;
    const serviceApartmentCount = allListings.filter((x) => x.propertyType === "SERVICE_APARTMENT").length;
    const roomShareCount = allListings.filter((x) => x.propertyType === "ROOM_SHARE").length;
    const wholeHouseCount = allListings.filter((x) => x.propertyType === "WHOLE_HOUSE").length;

    return [
      { id: "ALL", label: "Tất cả phòng", count: allListings.length },
      { id: "STUDIO", label: "Phòng Studio", count: studioCount },
      { id: "SERVICE_APARTMENT", label: "Căn hộ DV", count: serviceApartmentCount },
      { id: "ROOM_SHARE", label: "Ở ghép", count: roomShareCount },
      { id: "WHOLE_HOUSE", label: "Nguyên căn", count: wholeHouseCount },
    ];
  }, [allListings]);

  return (
    <div className="min-h-screen pb-20 space-y-8 sm:space-y-10">
      {/* 1. Breadcrumb Bar */}
      <div className="bg-[#FFF7E5]/70 border-b border-[#EDE5D5] py-2.5 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center gap-2 text-xs text-[#77715F] font-medium">
          <Link href="/" className="hover:text-[#DCA936] transition-colors flex items-center gap-1">
            <Home className="w-3.5 h-3.5" />
            <span>Trang chủ</span>
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-[#A8A190]" />
          <span>Danh bạ chủ nhà</span>
          <ChevronRight className="w-3.5 h-3.5 text-[#A8A190]" />
          <span className="text-[#373523] font-bold truncate max-w-[200px] sm:max-w-none">
            {landlord.displayName || landlord.fullName}
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* ========================================================= */}
        {/* 2. SHOPEE-STYLE SELLER / LANDLORD HERO SHOPFRONT BANNER   */}
        {/* ========================================================= */}
        <section className="relative rounded-[32px] overflow-hidden border border-[#EDE5D5] bg-white shadow-xl shadow-[#373523]/5">
          {/* Decorative Warm Ambient Cover */}
          <div className="h-32 sm:h-44 w-full bg-gradient-to-r from-[#FFF1CC] via-[#FFF7E5] to-[#F4CD65]/40 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-[#F4CD65]/20 rounded-full blur-2xl pointer-events-none -mr-20 -mt-20" />
            <div className="absolute bottom-0 left-1/4 w-60 h-60 bg-[#FFF7E5] rounded-full blur-xl pointer-events-none" />
            <div className="absolute top-4 right-4 sm:top-6 sm:right-6 flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/90 backdrop-blur-md text-[#373523] border border-[#EDE5D5] shadow-xs flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-[#DCA936]" />
                <span>Gian hàng chính chủ</span>
              </span>
            </div>
          </div>

          {/* Profile Header Main Content */}
          <div className="px-5 sm:px-8 pb-6 sm:pb-8 pt-0 relative">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 -mt-14 sm:-mt-16 mb-6">
              
              {/* Left Column: Avatar & Primary Landlord Identity */}
              <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 sm:gap-5">
                {/* Avatar with KYC Ring */}
                <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-3xl overflow-hidden border-4 border-white bg-[#FFF1CC] shadow-xl shrink-0 group">
                  <Image
                    src={landlord.avatarUrl}
                    alt={landlord.fullName}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform"
                    priority
                  />
                  {landlord.verificationStatus === "VERIFIED" && (
                    <div className="absolute bottom-1.5 right-1.5 w-6 h-6 rounded-full bg-[#F4CD65] text-[#373523] flex items-center justify-center shadow-xs border-2 border-white" title="Đã xác minh danh tính eKYC">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#373523]" />
                    </div>
                  )}
                </div>

                {/* Identity Information */}
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#292524] tracking-tight">
                      {landlord.displayName || landlord.fullName}
                    </h1>
                    {landlord.verificationStatus === "VERIFIED" && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#FFF1CC] text-[#805B10] border border-[#F4CD65]/50 shadow-2xs">
                        <BadgeCheck className="w-3.5 h-3.5 text-[#DCA936]" />
                        <span>Chủ nhà xác minh</span>
                      </span>
                    )}
                  </div>

                  {landlord.displayName && landlord.displayName !== landlord.fullName && (
                    <p className="text-xs sm:text-sm text-[#57534E] font-medium">
                      Chủ sở hữu: <b className="font-semibold text-[#292524]">{landlord.fullName}</b>
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-3 text-xs text-[#78716C]">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-[#DCA936]" />
                      <span>Tham gia từ {landlord.joinedDate}</span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-[#805B10] font-medium">
                      <Clock className="w-3.5 h-3.5 text-[#DCA936]" />
                      <span>Phản hồi: {landlord.responseTime}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Column: Contact Actions (Call, Copy, Chat) */}
              <div className="flex flex-wrap items-center gap-2.5 pt-2 md:pt-0">
                {!phoneRevealed ? (
                  <button
                    type="button"
                    onClick={() => setPhoneRevealed(true)}
                    className="min-h-[46px] px-6 py-2.5 rounded-2xl bg-[#F4CD65] hover:bg-[#ebbf4d] active:bg-[#dda934] text-[#292524] font-medium text-xs sm:text-sm shadow-xs transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <Phone className="w-4 h-4 text-[#292524]" />
                    <span>Xem số điện thoại</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-2 bg-[#FFF7E5] border border-[#EDE5D5] p-1.5 rounded-2xl">
                    <a
                      href={`tel:${landlord.phoneNumber}`}
                      className="px-4 py-2 rounded-xl bg-[#F4CD65] hover:bg-[#ebbf4d] text-[#292524] font-medium text-xs sm:text-sm flex items-center gap-1.5 shadow-2xs transition-all"
                    >
                      <Phone className="w-4 h-4 text-[#292524]" />
                      <span>{landlord.phoneNumber}</span>
                    </a>
                    <button
                      type="button"
                      onClick={handleCopyPhone}
                      className="p-2 rounded-xl bg-white border border-[#EDE5D5] hover:bg-[#FFFAEF] text-[#292524] text-xs font-medium transition-colors cursor-pointer"
                      title="Sao chép số"
                    >
                      {copiedPhone ? (
                        <Check className="w-4 h-4 text-[#805B10]" />
                      ) : (
                        <Copy className="w-4 h-4 text-[#78716C]" />
                      )}
                    </button>
                  </div>
                )}

                <a
                  href={`https://zalo.me/${landlord.phoneNumber.replace(/[^0-9]/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-h-[46px] px-5 py-2.5 rounded-2xl bg-white border border-[#EDE5D5] hover:bg-[#FFF7E5] text-[#292524] font-medium text-xs sm:text-sm transition-all flex items-center gap-2 shadow-2xs"
                >
                  <MessageSquare className="w-4 h-4 text-[#DCA936]" />
                  <span>Nhắn Zalo</span>
                </a>
              </div>
            </div>

            {/* Introduction & Operating Areas Row */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pt-5 border-t border-[#EDE5D5]">
              {/* Left 8 Cols: Introduction */}
              <div className="lg:col-span-8 space-y-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#805B10] block">
                  Giới thiệu chủ nhà &amp; Tiêu chuẩn cho thuê
                </span>
                <p className="text-xs sm:text-sm text-[#292524] leading-relaxed whitespace-pre-line font-normal">
                  {landlord.introduction}
                </p>
                <p className="text-xs text-[#78716C] flex items-center gap-1.5 pt-1">
                  <MapPin className="w-3.5 h-3.5 text-[#DCA936] shrink-0" />
                  <span>Văn phòng / Địa chỉ liên hệ: {landlord.contactAddress}</span>
                </p>
              </div>

              {/* Right 4 Cols: Operating Area Tags */}
              <div className="lg:col-span-4 space-y-2 bg-[#FFFAEF] p-4 rounded-2xl border border-[#EDE5D5]">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#805B10] block">
                  Khu vực hoạt động cho thuê
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {landlord.operatingAreas.map((area, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-xl text-xs font-semibold bg-white text-[#373523] border border-[#EDE5D5] shadow-2xs flex items-center gap-1"
                    >
                      <MapPin className="w-3 h-3 text-[#DCA936]" />
                      <span>{area}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* 3. STORE CREDIBILITY & PERFORMANCE KPI STRIP             */}
        {/* ========================================================= */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-4 sm:p-5 rounded-3xl bg-white border border-[#EDE5D5] shadow-2xs space-y-1">
            <span className="text-xs text-[#57534E] font-medium flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-[#DCA936]" />
              <span>Phòng đang cho thuê</span>
            </span>
            <div className="text-2xl sm:text-3xl font-bold text-[#292524]">
              {allListings.length} <span className="text-xs font-normal text-[#78716C]">căn phòng</span>
            </div>
            <p className="text-[11px] text-[#805B10] font-medium">100% Đã được kiểm duyệt</p>
          </div>

          <div className="p-4 sm:p-5 rounded-3xl bg-white border border-[#EDE5D5] shadow-2xs space-y-1">
            <span className="text-xs text-[#57534E] font-medium flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-[#DCA936]" />
              <span>Tỷ lệ phản hồi</span>
            </span>
            <div className="text-2xl sm:text-3xl font-bold text-[#292524]">
              {landlord.responseRate}
            </div>
            <p className="text-[11px] text-[#805B10] font-medium">{landlord.responseTime}</p>
          </div>

          <div className="p-4 sm:p-5 rounded-3xl bg-white border border-[#EDE5D5] shadow-2xs space-y-1">
            <span className="text-xs text-[#57534E] font-medium flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#DCA936]" />
              <span>Định danh eKYC</span>
            </span>
            <div className="text-2xl sm:text-3xl font-bold text-[#292524]">
              Đã duyệt
            </div>
            <p className="text-[11px] text-[#805B10] font-medium">CCCD đối chiếu trực tiếp</p>
          </div>

          <div className="p-4 sm:p-5 rounded-3xl bg-white border border-[#EDE5D5] shadow-2xs space-y-1">
            <span className="text-xs text-[#57534E] font-medium flex items-center gap-1.5">
              <Star className="w-4 h-4 text-[#DCA936]" />
              <span>Minh bạch chi phí</span>
            </span>
            <div className="text-2xl sm:text-3xl font-bold text-[#292524]">
              Cam kết
            </div>
            <p className="text-[11px] text-[#805B10] font-medium">Không phụ phí ẩn, không giá ảo</p>
          </div>
        </section>

        {/* ========================================================= */}
        {/* 4. LANDLORD'S INVENTORY & FILTERING TOOLBAR              */}
        {/* ========================================================= */}
        <section className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-[#DCA936] block">
                Gian hàng phòng trọ
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#292524] tracking-tight">
                Danh sách phòng đang cho thuê ({filteredListings.length})
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-[#57534E] max-w-md font-normal">
              Xem chi tiết giá thuê, bảng chi phí điện nước bóc tách và liên hệ trực tiếp chủ nhà không qua trung gian.
            </p>
          </div>

          {/* Filtering Toolbar Card */}
          <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#EDE5D5] shadow-2xs space-y-4">
            {/* Row 1: Property Type Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {categoryTabs.map((tab) => {
                const isActive = selectedPropertyType === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setSelectedPropertyType(tab.id)}
                    className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer border ${
                      isActive
                        ? "bg-[#F4CD65] text-[#373523] border-[#DCA936] shadow-xs"
                        : "bg-[#FFFAEF] text-[#77715F] border-[#EDE5D5] hover:bg-[#FFF7E5] hover:text-[#373523]"
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span className={`text-[11px] px-1.5 py-0.2 rounded-full ${isActive ? "bg-[#373523]/10 text-[#373523]" : "bg-white text-[#805B10] border border-[#EDE5D5]"}`}>
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Row 2: Search input inside store & Sort dropdown */}
            <div className="pt-2 border-t border-[#EDE5D5]/60 flex flex-col sm:flex-row items-center justify-between gap-3">
              {/* Search Inside Store */}
              <div className="w-full sm:w-80 flex items-center px-3.5 py-2 rounded-xl bg-[#FFFAEF] border border-[#EDE5D5] focus-within:border-[#F4CD65] focus-within:bg-white transition-all">
                <Search className="w-4 h-4 text-[#DCA936] mr-2 shrink-0" />
                <input
                  type="text"
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  placeholder="Tìm phòng theo đường, đặc điểm..."
                  className="w-full bg-transparent text-xs sm:text-sm text-[#373523] placeholder-[#77715F]/60 focus:outline-none font-medium"
                />
                {searchKeyword && (
                  <button
                    type="button"
                    onClick={() => setSearchKeyword("")}
                    className="text-xs text-[#77715F] hover:text-[#373523]"
                  >
                    Xóa
                  </button>
                )}
              </div>

              {/* Sort selector */}
              <div className="w-full sm:w-auto flex items-center justify-end gap-2 text-xs">
                <span className="text-[#77715F] font-bold flex items-center gap-1 shrink-0">
                  <ArrowUpDown className="w-3.5 h-3.5 text-[#DCA936]" />
                  <span>Sắp xếp:</span>
                </span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-[#FFFAEF] border border-[#EDE5D5] rounded-xl px-3 py-2 text-xs font-bold text-[#373523] focus:outline-none cursor-pointer"
                >
                  <option value="NEWEST">Mới nhất</option>
                  <option value="PRICE_ASC">Giá tăng dần</option>
                  <option value="PRICE_DESC">Giá giảm dần</option>
                  <option value="AREA_DESC">Diện tích lớn nhất</option>
                </select>
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* 5. LISTINGS GRID                                          */}
          {/* ========================================================= */}
          {filteredListings.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {filteredListings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-[#EDE5D5] p-12 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-[#FFF1CC] text-[#DCA936] flex items-center justify-center mx-auto">
                <Filter className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-[#373523]">Không tìm thấy phòng phù hợp</h3>
                <p className="text-xs sm:text-sm text-[#77715F] max-w-md mx-auto">
                  Chủ nhà hiện không có phòng nào khớp với từ khóa &quot;{searchKeyword}&quot; hoặc phân loại đã chọn.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedPropertyType("ALL");
                  setSearchKeyword("");
                }}
                className="px-5 py-2.5 rounded-xl bg-[#F4CD65] hover:bg-[#ebbf4d] text-[#373523] font-bold text-xs shadow-xs transition-colors"
              >
                Xem toàn bộ phòng của chủ nhà
              </button>
            </div>
          )}
        </section>

        {/* ========================================================= */}
        {/* 6. NESTRIVO TENANT SAFETY & TRUST GUARANTEE               */}
        {/* ========================================================= */}
        <section className="rounded-3xl bg-[#FFF7E5] border border-[#EDE5D5] p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FFF1CC] text-[#805B10] flex items-center justify-center border border-[#F4CD65]/40 shrink-0">
              <Shield className="w-5 h-5 text-[#DCA936]" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-[#292524]">
                Cam kết minh bạch &amp; Bảo vệ người thuê từ Nestrivo
              </h3>
              <p className="text-xs text-[#78716C] font-normal">
                An tâm tìm phòng — Mọi thông tin và danh tính đều được kiểm chứng độc lập
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs text-[#77715F]">
            <div className="flex items-start gap-2 bg-white/80 p-3 rounded-2xl border border-[#EDE5D5]">
              <CheckCircle2 className="w-4 h-4 text-[#DCA936] shrink-0 mt-0.5" />
              <p><b>Hình ảnh &amp; vị trí thật:</b> Phòng được kiểm duyệt ảnh thực tế, địa chỉ chính xác đến số nhà.</p>
            </div>
            <div className="flex items-start gap-2 bg-white/80 p-3 rounded-2xl border border-[#EDE5D5]">
              <CheckCircle2 className="w-4 h-4 text-[#DCA936] shrink-0 mt-0.5" />
              <p><b>Không phát sinh phụ phí ẩn:</b> Tiền điện, nước, gửi xe và phí quản lý được niêm yết rõ ràng trước khi ký hợp đồng.</p>
            </div>
            <div className="flex items-start gap-2 bg-white/80 p-3 rounded-2xl border border-[#EDE5D5]">
              <CheckCircle2 className="w-4 h-4 text-[#DCA936] shrink-0 mt-0.5" />
              <p><b>Báo cáo vi phạm 24/7:</b> Hỗ trợ can thiệp kịp thời nếu chủ nhà báo sai giá hoặc không đúng cam kết.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

