"use client";

import { Suspense, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { 
  Building2, 
  Filter, 
  AlertCircle, 
  RotateCcw, 
  X,
  ArrowRight,
  TrendingUp,
  Heart,
  Sparkles,
  MapPin
} from "lucide-react";
import SearchBar from "@/components/search/SearchBar";
import ListingCard from "@/components/listings/ListingCard";
import SortDropdown from "@/components/search/SortDropdown";
import { PROPERTY_TYPE_LABELS, PropertyType } from "@/types/listing";
import { useListingsQuery } from "@/hooks/queries";
import { PublicListingFilterParams } from "@/service/listing.service";

function ListingsGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden animate-pulse"
        >
          <div className="h-48 bg-stone-200" />
          <div className="p-4 space-y-3">
            <div className="h-4 bg-stone-200 rounded w-3/4" />
            <div className="h-3 bg-stone-200 rounded w-1/2" />
            <div className="h-5 bg-stone-200 rounded w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

function HomePageContent() {
  const urlSearchParams = useSearchParams();

  const resolvedParams = useMemo(() => {
    const obj: Record<string, string | undefined> = {};
    urlSearchParams.forEach((value, key) => {
      obj[key] = value;
    });
    return obj;
  }, [urlSearchParams]);

  // Determine if user is performing an active search or filtering
  const hasSearchQuery = Boolean(resolvedParams.search?.trim());
  const hasCityFilter = Boolean(resolvedParams.city && resolvedParams.city !== "Tất cả tỉnh/thành");
  const hasDistrictFilter = Boolean(resolvedParams.district?.trim());
  const hasTypeFilter = Boolean(resolvedParams.propertyType);
  const hasPriceFilter = Boolean(resolvedParams.minPrice || resolvedParams.maxPrice);
  const hasExplicitSort = Boolean(resolvedParams.sortBy && resolvedParams.sortBy !== "newest");
  const hasPage = Boolean(resolvedParams.page && Number(resolvedParams.page) > 1);

  const isSearchMode = hasSearchQuery || hasCityFilter || hasDistrictFilter || hasTypeFilter || hasPriceFilter || hasExplicitSort || hasPage;

  // Extract active filter tags for the chips row
  const activeFilters: { key: string; label: string; value: string }[] = [];
  if (resolvedParams.search?.trim()) {
    activeFilters.push({ key: "search", label: "Từ khóa", value: `"${resolvedParams.search.trim()}"` });
  }
  if (hasCityFilter) {
    activeFilters.push({ key: "city", label: "Tỉnh/thành", value: resolvedParams.city! });
  }
  if (resolvedParams.district?.trim()) {
    activeFilters.push({ key: "district", label: "Quận/huyện", value: resolvedParams.district.trim() });
  }
  if (resolvedParams.propertyType) {
    const pLabel = PROPERTY_TYPE_LABELS[resolvedParams.propertyType as PropertyType] || resolvedParams.propertyType;
    activeFilters.push({ key: "propertyType", label: "Loại phòng", value: pLabel });
  }
  if (resolvedParams.minPrice || resolvedParams.maxPrice) {
    const minM = resolvedParams.minPrice ? `${Number(resolvedParams.minPrice) / 1000000}tr` : "0";
    const maxM = resolvedParams.maxPrice ? `${Number(resolvedParams.maxPrice) / 1000000}tr` : "không giới hạn";
    activeFilters.push({ key: "price", label: "Mức giá", value: `${minM} - ${maxM}` });
  }

  // Helper to build URL when toggling or removing filters
  const buildFilterUrl = (removeKey?: string, newPropertyType?: string, newSortBy?: string) => {
    const p = new URLSearchParams();
    Object.entries(resolvedParams).forEach(([k, v]) => {
      if (v && k !== removeKey) {
        if (removeKey === "price" && (k === "minPrice" || k === "maxPrice")) return;
        p.set(k, v);
      }
    });

    if (newPropertyType !== undefined) {
      if (newPropertyType) p.set("propertyType", newPropertyType);
      else p.delete("propertyType");
    }

    if (newSortBy !== undefined) {
      if (newSortBy) p.set("sortBy", newSortBy);
      else p.delete("sortBy");
    }

    const qStr = p.toString();
    return qStr ? `/?${qStr}` : "/";
  };

  // Build strongly-typed filter params for TanStack Query
  const searchFilterParams: PublicListingFilterParams = useMemo(() => {
    return {
      search: resolvedParams.search,
      city: hasCityFilter ? resolvedParams.city : undefined,
      district: resolvedParams.district,
      ward: resolvedParams.ward,
      propertyType: resolvedParams.propertyType,
      minPrice: resolvedParams.minPrice ? Number(resolvedParams.minPrice) : undefined,
      maxPrice: resolvedParams.maxPrice ? Number(resolvedParams.maxPrice) : undefined,
      sortBy: resolvedParams.sortBy,
      page: resolvedParams.page ? Number(resolvedParams.page) : undefined,
      limit: resolvedParams.limit ? Number(resolvedParams.limit) : 12,
    };
  }, [resolvedParams, hasCityFilter]);

  // TANSTACK QUERY DATA FETCHING (Cached 3 mins per section -> 0ms back navigation)
  const searchQuery = useListingsQuery(searchFilterParams, { enabled: isSearchMode });
  const featuredQuery = useListingsQuery({ featured: true, limit: 4 }, { enabled: !isSearchMode });
  const trendingQuery = useListingsQuery({ sortBy: "trending", minInquiries: 1, limit: 4 }, { enabled: !isSearchMode });
  const favoritedQuery = useListingsQuery({ sortBy: "favorites", minFavorites: 1, limit: 4 }, { enabled: !isSearchMode });
  const hcmQuery = useListingsQuery({ city: "Hồ Chí Minh", limit: 5 }, { enabled: !isSearchMode });
  const hanoiQuery = useListingsQuery({ city: "Hà Nội", limit: 5 }, { enabled: !isSearchMode });
  const latestQuery = useListingsQuery({ sortBy: "newest", limit: 8 }, { enabled: !isSearchMode });

  const searchResult = {
    listings: searchQuery.data?.data ?? [],
    totalItems: searchQuery.data?.pagination?.totalItems ?? searchQuery.data?.data?.length ?? 0,
    error: searchQuery.isError
      ? "Không thể kết nối đến máy chủ API. Vui lòng kiểm tra trạng thái máy chủ và thử lại."
      : null,
  };

  const featuredResult = { listings: featuredQuery.data?.data ?? [] };
  const trendingResult = { listings: trendingQuery.data?.data ?? [] };
  const favoritedResult = { listings: favoritedQuery.data?.data ?? [] };
  const hcmResult = { listings: hcmQuery.data?.data ?? [] };
  const hanoiResult = { listings: hanoiQuery.data?.data ?? [] };
  const latestResult = { listings: latestQuery.data?.data ?? [] };

  const isDiscoveryLoading =
    !isSearchMode &&
    (latestQuery.isLoading || hcmQuery.isLoading || featuredQuery.isLoading);

  return (
    <div className="bg-[#F8FAFC] min-h-screen text-[#292524] space-y-10 sm:space-y-12 pb-24">
      {/* 1. Hero Section - Sleek Architectural Interior & High-Impact Headline */}
      <section className="relative w-full min-h-[340px] sm:min-h-[380px] lg:min-h-[420px] flex flex-col justify-center items-center text-center overflow-hidden">
        {/* Full-width High-Quality Apartment Interior Photograph */}
        <img
          src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1920&auto=format&fit=crop&q=85"
          alt="Không gian phòng trọ và căn hộ hiện đại Nestrivo"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />

        {/* Subtle Dark Overlay for Superior Text Readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/65 via-black/40 to-black/75" />

        {/* Hero Content: Centered White Headline */}
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 pt-20 sm:pt-24 lg:pt-28 pb-16 sm:pb-20 lg:pb-24">
          <h1 className="text-3xl sm:text-5xl lg:text-[54px] font-extrabold tracking-tight text-white leading-[1.18] drop-shadow-sm">
            Tìm nơi ở. Bắt đầu hành trình mới.
          </h1>
        </div>
      </section>

      {/* 2. Floating Search Panel - Overlapping bottom edge of Hero (June Homes Style) */}
      <div className="relative z-20 max-w-5xl lg:max-w-6xl mx-auto px-4 -mt-12 sm:-mt-14 lg:-mt-16">
        <SearchBar
          initialSearch={resolvedParams.search}
          initialCity={resolvedParams.city}
          initialDistrict={resolvedParams.district}
          initialPropertyType={resolvedParams.propertyType}
          initialPriceRange={
            resolvedParams.minPrice || resolvedParams.maxPrice
              ? `${resolvedParams.minPrice || "0"}-${resolvedParams.maxPrice || ""}`
              : ""
          }
        />
      </div>

      {/* 2. MODE A: Active Search & Filter Results View */}
      {isSearchMode && searchResult && (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          {/* Results Summary & Sorting Bar */}
          <div className="bg-white rounded-2xl border border-[#E5E7EB] p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-[#292524]">
                  Kết quả tìm kiếm ({searchResult.totalItems} phòng)
                </h2>
              </div>

              {/* Active Filter Chips */}
              {activeFilters.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 pt-0.5">
                  <span className="text-xs text-[#78716C] font-normal">Đang lọc:</span>
                  {activeFilters.map((af) => (
                    <Link
                      key={af.key}
                      href={buildFilterUrl(af.key)}
                      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-[#292524] text-xs font-medium border border-[#E5E7EB] transition-colors group"
                      title={`Bỏ lọc ${af.label}`}
                    >
                      <span>
                        {af.label}: <b>{af.value}</b>
                      </span>
                      <X className="w-3.5 h-3.5 text-[#78716C] group-hover:text-[#292524]" />
                    </Link>
                  ))}
                  <Link
                    href="/"
                    className="text-xs font-medium text-rose-600 hover:text-rose-700 hover:underline ml-1"
                  >
                    Xóa tất cả bộ lọc
                  </Link>
                </div>
              )}
            </div>

            {/* Sort Dropdown */}
            <SortDropdown
              currentSort={resolvedParams.sortBy || "newest"}
              baseUrl={buildFilterUrl()}
            />
          </div>

          {/* Search Loading Skeleton */}
          {searchQuery.isLoading && <ListingsGridSkeleton count={8} />}

          {/* API Error State */}
          {!searchQuery.isLoading && searchResult.error && (
            <div className="max-w-md mx-auto my-12 p-6 rounded-2xl bg-white border border-[#E5E7EB] text-center space-y-3 shadow-xs">
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 mx-auto flex items-center justify-center">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-semibold text-[#292524]">Không thể tải dữ liệu tìm kiếm</h3>
                <p className="text-xs text-[#78716C] leading-relaxed">{searchResult.error}</p>
              </div>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => searchQuery.refetch()}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#F4CD65] hover:bg-[#ebbf4d] text-[#292524] font-semibold text-xs transition-all cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Thử lại</span>
                </button>
              </div>
            </div>
          )}

          {/* Clean Empty State */}
          {!searchQuery.isLoading && !searchResult.error && searchResult.listings.length === 0 && (
            <div className="max-w-md mx-auto my-14 text-center space-y-3 p-8 bg-white border border-[#E5E7EB] rounded-2xl shadow-xs">
              <div className="w-12 h-12 rounded-xl bg-stone-100 text-stone-600 mx-auto flex items-center justify-center">
                <Filter className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-semibold text-[#292524]">Không tìm thấy phòng phù hợp</h3>
                <p className="text-xs text-[#78716C] leading-relaxed">
                  Không có phòng trọ nào khớp với các tiêu chí tìm kiếm hiện tại. Bạn vui lòng thử xóa bớt điều kiện hoặc mở rộng khoảng giá.
                </p>
              </div>
              <div className="pt-2">
                <Link
                  href="/"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#F4CD65] hover:bg-[#ebbf4d] text-[#292524] text-xs font-semibold shadow-2xs transition-colors"
                >
                  <span>Xóa bộ lọc</span>
                </Link>
              </div>
            </div>
          )}

          {/* Search Result Grid */}
          {!searchResult.error && searchResult.listings.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
              {searchResult.listings.map((item) => (
                <ListingCard key={item.id} listing={item} />
              ))}
            </div>
          )}
        </main>
      )}

      {/* 3. MODE B: Real Marketplace Discovery Sections (Only rendered when not filtering) */}
      {!isSearchMode && (
        <main id="listings" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 sm:space-y-16 scroll-mt-24">
          {/* Section A: Featured Listings (Tin đăng nổi bật - Paid Promotion only) */}
          {/* Strictly hides if 0 eligible active promotions exist */}
          {featuredResult && featuredResult.listings.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-end justify-between gap-4 pb-2.5 border-b border-[#E5E7EB]">
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-[#805B10] uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Bộ sưu tập chọn lọc</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-[#292524] tracking-tight mt-0.5">
                    Phòng nổi bật hôm nay
                  </h2>
                </div>
                <Link
                  href="/?sortBy=priority"
                  className="text-xs sm:text-sm font-medium text-[#805B10] hover:text-[#5c4107] flex items-center gap-1 group shrink-0 transition-colors"
                >
                  <span>Xem tất cả</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
                {featuredResult.listings.map((item) => (
                  <ListingCard key={`featured-${item.id}`} listing={item} />
                ))}
              </div>
            </section>
          )}

          {/* Section B: Trending Listings (Xu hướng cho thuê - Real user activity) */}
          {/* Strictly hides if 0 eligible results with real inquiry activity */}
          {trendingResult && trendingResult.listings.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-end justify-between gap-4 pb-2.5 border-b border-[#E5E7EB]">
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-[#805B10] uppercase tracking-wider">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>Nhiều lượt quan tâm</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-[#292524] tracking-tight mt-0.5">
                    Xu hướng cho thuê
                  </h2>
                </div>
                <Link
                  href="/?sortBy=trending"
                  className="text-xs sm:text-sm font-medium text-[#805B10] hover:text-[#5c4107] flex items-center gap-1 group shrink-0 transition-colors"
                >
                  <span>Xem tất cả</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
                {trendingResult.listings.map((item) => (
                  <ListingCard key={`trending-${item.id}`} listing={item} />
                ))}
              </div>
            </section>
          )}

          {/* Section C: Most Favorited Listings (Phòng được yêu thích - Real favorites) */}
          {/* Strictly hides if 0 eligible listings with real favorites */}
          {favoritedResult && favoritedResult.listings.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-end justify-between gap-4 pb-2.5 border-b border-[#E5E7EB]">
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-600 uppercase tracking-wider">
                    <Heart className="w-3.5 h-3.5" />
                    <span>Được lưu nhiều</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-[#292524] tracking-tight mt-0.5">
                    Phòng được yêu thích
                  </h2>
                </div>
                <Link
                  href="/?sortBy=favorites"
                  className="text-xs sm:text-sm font-medium text-[#805B10] hover:text-[#5c4107] flex items-center gap-1 group shrink-0 transition-colors"
                >
                  <span>Xem tất cả</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
                {favoritedResult.listings.map((item) => (
                  <ListingCard key={`fav-${item.id}`} listing={item} />
                ))}
              </div>
            </section>
          )}

          {/* Section D: Ho Chi Minh City Listings (Phòng trọ tại TP.HCM) */}
          {/* Max 5 real listings located in TP.HCM */}
          {hcmResult && hcmResult.listings.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-end justify-between gap-4 pb-2.5 border-b border-[#E5E7EB]">
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-[#78716C] uppercase tracking-wider">
                    <MapPin className="w-3.5 h-3.5 text-[#805B10]" />
                    <span>Khu vực trọng điểm</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-[#292524] tracking-tight mt-0.5">
                    Phòng trọ tại TP.HCM
                  </h2>
                </div>
                <Link
                  href="/?city=H%E1%BB%93+Ch%C3%AD+Minh"
                  className="text-xs sm:text-sm font-medium text-[#805B10] hover:text-[#5c4107] flex items-center gap-1 group shrink-0 transition-colors"
                >
                  <span>Xem tất cả phòng trọ TP.HCM</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
                {hcmResult.listings.slice(0, 5).map((item) => (
                  <ListingCard key={`hcm-${item.id}`} listing={item} />
                ))}
              </div>
            </section>
          )}

          {/* Section E: Other Locations (e.g. Hà Nội) */}
          {/* Rendered ONLY when real listings exist in this location */}
          {hanoiResult && hanoiResult.listings.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-end justify-between gap-4 pb-2.5 border-b border-[#E5E7EB]">
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-[#78716C] uppercase tracking-wider">
                    <Building2 className="w-3.5 h-3.5 text-[#805B10]" />
                    <span>Khu vực thủ đô</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-[#292524] tracking-tight mt-0.5">
                    Phòng trọ tại Hà Nội
                  </h2>
                </div>
                <Link
                  href="/?city=H%C3%A0+N%E1%BB%99i"
                  className="text-xs sm:text-sm font-medium text-[#805B10] hover:text-[#5c4107] flex items-center gap-1 group shrink-0 transition-colors"
                >
                  <span>Xem tất cả phòng trọ Hà Nội</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
                {hanoiResult.listings.slice(0, 5).map((item) => (
                  <ListingCard key={`hanoi-${item.id}`} listing={item} />
                ))}
              </div>
            </section>
          )}

          {/* Discovery Section: Latest Listings (Khám phá tin đăng mới nhất) */}
          {latestResult && latestResult.listings.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-end justify-between gap-4 pb-2.5 border-b border-[#E5E7EB]">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-[#292524] tracking-tight">
                    Tin đăng mới nhất
                  </h2>
                  <p className="text-xs sm:text-sm text-[#57534E] mt-0.5 font-normal">
                    Các phòng trọ và căn hộ vừa được duyệt xuất bản trên sàn.
                  </p>
                </div>
                <Link
                  href="/?sortBy=newest"
                  className="text-xs sm:text-sm font-medium text-[#805B10] hover:text-[#5c4107] flex items-center gap-1 group shrink-0 transition-colors"
                >
                  <span>Xem tất cả</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
                {latestResult.listings.map((item) => (
                  <ListingCard key={`latest-${item.id}`} listing={item} />
                ))}
              </div>
            </section>
          )}

          {/* Loading Skeleton for Initial Discovery Fetch */}
          {isDiscoveryLoading && (
            <section className="space-y-4">
              <div className="h-7 w-56 bg-stone-200 rounded-lg animate-pulse" />
              <ListingsGridSkeleton count={8} />
            </section>
          )}

          {/* Fallback if all listing endpoints return 0 real listings */}
          {!isDiscoveryLoading &&
           (!latestResult || latestResult.listings.length === 0) &&
           (!hcmResult || hcmResult.listings.length === 0) &&
           (!hanoiResult || hanoiResult.listings.length === 0) && (
            <div className="max-w-md mx-auto my-16 text-center space-y-3 p-8 bg-white border border-[#E5E7EB] rounded-2xl shadow-xs">
              <div className="w-12 h-12 rounded-xl bg-stone-100 text-stone-600 mx-auto flex items-center justify-center">
                <Building2 className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-semibold text-[#292524]">Đang cập nhật phòng trọ</h3>
                <p className="text-xs text-[#78716C] leading-relaxed">
                  Hiện chưa có tin đăng nào sẵn sàng hiển thị. Các chủ nhà đang cập nhật phòng mới lên hệ thống.
                </p>
              </div>
            </div>
          )}
        </main>
      )}
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div className="bg-[#F8FAFC] min-h-screen max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <ListingsGridSkeleton count={8} />
        </div>
      }
    >
      <HomePageContent />
    </Suspense>
  );
}
