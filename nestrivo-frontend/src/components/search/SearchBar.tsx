"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin, Building2, Coins } from "lucide-react";
import { cn } from "@/lib/utils";
import { ALL_PROVINCES, getDistrictsByProvince } from "@/lib/vietnam-locations";

interface SearchBarProps {
  initialSearch?: string;
  initialCity?: string;
  initialDistrict?: string;
  initialPropertyType?: string;
  initialPriceRange?: string;
  isDemo?: boolean;
  className?: string;
}

const SEARCH_TABS = [
  { label: "Tất cả", value: "" },
  { label: "Phòng trọ", value: "ROOM_SHARE" },
  { label: "Studio", value: "STUDIO" },
  { label: "Căn hộ dịch vụ", value: "SERVICE_APARTMENT" },
  { label: "Nhà nguyên căn", value: "WHOLE_HOUSE" },
];

const PRICE_RANGES = [
  { value: "", label: "Tất cả mức giá" },
  { value: "0-3000000", label: "Dưới 3 triệu" },
  { value: "3000000-5000000", label: "3 - 5 triệu" },
  { value: "5000000-8000000", label: "5 - 8 triệu" },
  { value: "8000000-15000000", label: "8 - 15 triệu" },
  { value: "15000000-", label: "Trên 15 triệu" },
];

export default function SearchBar({
  initialSearch = "",
  initialCity = "",
  initialDistrict = "",
  initialPropertyType = "",
  initialPriceRange = "",
  isDemo = false,
  className = "",
}: SearchBarProps) {
  const router = useRouter();
  const [search, setSearch] = useState(initialSearch);
  const [city, setCity] = useState(initialCity);
  const [district, setDistrict] = useState(initialDistrict);
  const [propertyType, setPropertyType] = useState(initialPropertyType);
  const [priceRange, setPriceRange] = useState(initialPriceRange);

  // Lấy danh sách quận/huyện dựa theo tỉnh thành đã chọn
  const availableDistricts = useMemo(() => {
    return getDistrictsByProvince(city);
  }, [city]);

  // Xử lý khi thay đổi Tỉnh / Thành phố: tự động cập nhật danh sách quận huyện
  const handleCityChange = (newCity: string) => {
    setCity(newCity);
    const newDistricts = getDistrictsByProvince(newCity);
    // Nếu quận huyện hiện tại không thuộc tỉnh thành mới, reset về tất cả
    if (district && !newDistricts.includes(district)) {
      setDistrict("");
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();

    if (search.trim()) params.set("search", search.trim());
    if (city && city !== "Tất cả tỉnh/thành") params.set("city", city);
    if (district.trim() && district !== "Tất cả quận/huyện") params.set("district", district.trim());
    if (propertyType) params.set("propertyType", propertyType);

    if (priceRange) {
      const [min, max] = priceRange.split("-");
      if (min) params.set("minPrice", min);
      if (max) params.set("maxPrice", max);
    }

    if (isDemo) {
      params.set("demo", "true");
    }

    const queryStr = params.toString();
    router.push(queryStr ? `/?${queryStr}` : "/");
  };

  return (
    <div
      className={cn(
        "bg-white rounded-2xl sm:rounded-3xl p-3.5 sm:p-4 lg:p-5 shadow-[0_15px_40px_rgba(0,0,0,0.1)] border border-[#EDE5D5] max-w-5xl mx-auto",
        className
      )}
    >
      {/* 1. Search Tabs: Tất cả, Phòng trọ, Studio, Căn hộ dịch vụ, Nhà nguyên căn */}
      <div className="flex items-center gap-1 sm:gap-1.5 pb-2.5 sm:pb-3 border-b border-[#EDE5D5]/80 mb-2.5 sm:mb-3.5 overflow-x-auto scrollbar-none">
        {SEARCH_TABS.map((tab) => {
          const isActive = propertyType === tab.value;
          return (
            <button
              key={tab.label}
              type="button"
              onClick={() => setPropertyType(tab.value)}
              className={cn(
                "px-3 sm:px-4 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all shrink-0 cursor-pointer",
                isActive
                  ? "bg-[#292524] text-white shadow-2xs"
                  : "text-[#57534E] hover:text-[#292524] hover:bg-[#FFF7E5]"
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* 2. Compact Search Fields Form với Dropdown Tỉnh/Thành & Quận/Huyện */}
      <form onSubmit={handleSearch}>
        <div className="flex flex-col sm:grid sm:grid-cols-2 lg:flex lg:flex-row lg:items-center gap-2.5 sm:gap-3 lg:gap-0 lg:divide-x lg:divide-[#EDE5D5] bg-[#FBF9F4] sm:bg-transparent rounded-xl p-1.5 sm:p-0">
          
          {/* Field 1: Dropdown Tỉnh / Thành phố */}
          <div className="flex-1 px-3 py-1.5 rounded-lg sm:rounded-none bg-white sm:bg-transparent border sm:border-0 border-[#EDE5D5] flex items-center gap-2.5 min-h-[46px] hover:bg-stone-50/80 transition-colors">
            <div className="w-7 h-7 rounded-lg bg-[#FFF1CC] text-[#805B10] flex items-center justify-center shrink-0">
              <Building2 className="w-3.5 h-3.5 text-[#805B10]" />
            </div>
            <div className="flex-1 min-w-0">
              <label className="text-[9px] font-bold uppercase tracking-wider text-[#78716C] block leading-none">
                Tỉnh / Thành phố
              </label>
              <select
                value={city}
                onChange={(e) => handleCityChange(e.target.value)}
                className="w-full bg-transparent text-xs sm:text-sm text-[#292524] font-semibold focus:outline-none cursor-pointer mt-0.5 truncate"
              >
                <option value="">Tất cả tỉnh/thành</option>
                {ALL_PROVINCES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Field 2: Dropdown Quận / Huyện (Tự động thay đổi theo Tỉnh/Thành) */}
          <div className="flex-1 px-3 py-1.5 rounded-lg sm:rounded-none bg-white sm:bg-transparent border sm:border-0 border-[#EDE5D5] flex items-center gap-2.5 min-h-[46px] hover:bg-stone-50/80 transition-colors">
            <div className="w-7 h-7 rounded-lg bg-[#FFF1CC] text-[#805B10] flex items-center justify-center shrink-0">
              <MapPin className="w-3.5 h-3.5 text-[#805B10]" />
            </div>
            <div className="flex-1 min-w-0">
              <label className="text-[9px] font-bold uppercase tracking-wider text-[#78716C] block leading-none">
                Quận / Huyện
              </label>
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full bg-transparent text-xs sm:text-sm text-[#292524] font-semibold focus:outline-none cursor-pointer mt-0.5 truncate"
              >
                <option value="">
                  {city ? `Tất cả quận/huyện ở ${city}` : "Tất cả quận/huyện"}
                </option>
                {availableDistricts.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Field 3: Khu vực / Tên đường */}
          <div className="flex-[1.2] px-3 py-1.5 rounded-lg sm:rounded-none bg-white sm:bg-transparent border sm:border-0 border-[#EDE5D5] flex items-center gap-2.5 min-h-[46px] hover:bg-stone-50/80 transition-colors">
            <div className="w-7 h-7 rounded-lg bg-[#FFF1CC] text-[#805B10] flex items-center justify-center shrink-0">
              <Search className="w-3.5 h-3.5 text-[#805B10]" />
            </div>
            <div className="flex-1 min-w-0">
              <label className="text-[9px] font-bold uppercase tracking-wider text-[#78716C] block leading-none">
                Khu vực / Tên đường
              </label>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="VD: Điện Biên Phủ, gần trường..."
                className="w-full bg-transparent text-xs sm:text-sm text-[#292524] font-semibold placeholder:font-normal placeholder:text-[#A8A29E] focus:outline-none mt-0.5 truncate"
              />
            </div>
          </div>

          {/* Field 4: Khoảng giá */}
          <div className="flex-1 px-3 py-1.5 rounded-lg sm:rounded-none bg-white sm:bg-transparent border sm:border-0 border-[#EDE5D5] flex items-center gap-2.5 min-h-[46px] hover:bg-stone-50/80 transition-colors">
            <div className="w-7 h-7 rounded-lg bg-[#FFF1CC] text-[#805B10] flex items-center justify-center shrink-0">
              <Coins className="w-3.5 h-3.5 text-[#805B10]" />
            </div>
            <div className="flex-1 min-w-0">
              <label className="text-[9px] font-bold uppercase tracking-wider text-[#78716C] block leading-none">
                Khoảng giá
              </label>
              <select
                value={priceRange}
                onChange={(e) => setPriceRange(e.target.value)}
                className="w-full bg-transparent text-xs sm:text-sm text-[#292524] font-semibold focus:outline-none cursor-pointer mt-0.5 truncate"
              >
                {PRICE_RANGES.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Action Button: Nút Tìm kiếm nổi bật màu vàng */}
          <div className="lg:pl-3 pt-1 sm:pt-0 sm:col-span-2 lg:col-span-1">
            <button
              type="submit"
              className="w-full lg:w-auto px-6 py-2.5 rounded-xl bg-[#F4CD65] hover:bg-[#ebbf4d] active:bg-[#dda934] text-[#292524] font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer min-h-[46px]"
            >
              <Search className="w-4 h-4 stroke-[2.5]" />
              <span>Tìm kiếm</span>
            </button>
          </div>

        </div>
      </form>
    </div>
  );
}
