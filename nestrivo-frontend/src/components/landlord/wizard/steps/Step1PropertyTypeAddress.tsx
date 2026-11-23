"use client";

import { Building2, Home, Hotel, Layers, MapPin, Check, AlertCircle } from "lucide-react";
import { PropertyType } from "@/types/listing";
import { CITIES_AND_DISTRICTS } from "@/types/wizard";

interface Step1Props {
  propertyType: PropertyType;
  city: string;
  district: string;
  ward: string;
  address: string;
  errors: Record<string, string>;
  onChange: (field: string, value: unknown) => void;
}

const PROPERTY_TYPES_CONFIG: {
  type: PropertyType;
  title: string;
  badge: string;
  desc: string;
  icon: typeof Building2;
}[] = [
  {
    type: "STUDIO",
    title: "Phòng Studio",
    badge: "Phổ biến nhất",
    desc: "Không gian mở tích hợp phòng ngủ, bếp và WC khép kín.",
    icon: Building2,
  },
  {
    type: "ROOM_SHARE",
    title: "Ở ghép / Phòng trọ",
    badge: "Tiết kiệm",
    desc: "Phòng đơn trong dãy trọ truyền thống hoặc căn hộ chia phòng.",
    icon: Home,
  },
  {
    type: "SERVICE_APARTMENT",
    title: "Căn hộ dịch vụ",
    badge: "Cao cấp",
    desc: "Căn hộ tiện nghi đầy đủ, bao gồm dịch vụ dọn phòng định kỳ.",
    icon: Hotel,
  },
  {
    type: "WHOLE_HOUSE",
    title: "Nhà nguyên căn",
    badge: "Độc lập",
    desc: "Toàn bộ ngôi nhà nhiều tầng hoặc nhà phố, không chung chủ.",
    icon: Layers,
  },
];

export function Step1PropertyTypeAddress({
  propertyType,
  city,
  district,
  ward,
  address,
  errors,
  onChange,
}: Step1Props) {
  const currentCityConfig = CITIES_AND_DISTRICTS[city] || CITIES_AND_DISTRICTS["Hồ Chí Minh"];
  const districtList = currentCityConfig.districts;

  // Handle city change: automatically reset district to the first available in the new city
  const handleCityChange = (newCity: string) => {
    onChange("city", newCity);
    const newCityDistricts = CITIES_AND_DISTRICTS[newCity]?.districts || [];
    if (newCityDistricts.length > 0) {
      onChange("district", newCityDistricts[0]);
    } else {
      onChange("district", "");
    }
  };

  const formattedFullAddress = [address.trim(), ward.trim(), district.trim(), city.trim()]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* 1. Property Type Selector */}
      <section className="space-y-3">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <span>1. Chọn loại hình bất động sản</span>
            <span className="text-rose-500">*</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Phân loại chính xác giúp người thuê tìm thấy phòng của bạn đúng với nhu cầu.
          </p>
        </div>

        {errors.propertyType && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errors.propertyType}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
          {PROPERTY_TYPES_CONFIG.map((item) => {
            const Icon = item.icon;
            const isSelected = propertyType === item.type;

            return (
              <button
                key={item.type}
                type="button"
                onClick={() => onChange("propertyType", item.type)}
                className={`p-4 rounded-2xl border text-left transition-all duration-200 relative cursor-pointer flex flex-col justify-between min-h-[110px] ${
                  isSelected
                    ? "bg-[#FFF7E5] border-[#F4CD65] ring-2 ring-[#F4CD65]/30 shadow-xs"
                    : "bg-white border-slate-200/90 hover:border-slate-300 hover:bg-slate-50/60"
                }`}
                aria-pressed={isSelected}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                        isSelected
                          ? "bg-[#F4CD65] text-[#373523] shadow-xs"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">{item.title}</h3>
                      <span className="inline-block text-[10px] font-bold text-[#805B10] bg-[#FFF1CC] px-2 py-0.5 rounded-md mt-0.5">
                        {item.badge}
                      </span>
                    </div>
                  </div>

                  {/* Radio check icon */}
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-all ${
                      isSelected
                        ? "bg-[#F4CD65] text-[#373523] ring-2 ring-[#F4CD65]/40"
                        : "border-2 border-slate-300 bg-white"
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                </div>

                <p className="text-xs text-slate-500 mt-2.5 leading-relaxed line-clamp-2">
                  {item.desc}
                </p>
              </button>
            );
          })}
        </div>
      </section>

      {/* 2. Address & Location Selector */}
      <section className="space-y-4 pt-4 border-t border-slate-200">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <span>2. Vị trí & Địa chỉ phòng</span>
            <span className="text-rose-500">*</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Địa chỉ chính xác giúp tin đăng nhanh chóng được phê duyệt và tăng độ tin cậy.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          {/* City */}
          <div className="space-y-1.5">
            <label htmlFor="wizard-city" className="block text-xs font-bold text-slate-700">
              Tỉnh / Thành phố <span className="text-rose-500">*</span>
            </label>
            <select
              id="wizard-city"
              value={city}
              onChange={(e) => handleCityChange(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:border-[#F4CD65] focus:ring-2 focus:ring-[#F4CD65]/20 transition-all min-h-[44px]"
            >
              {Object.keys(CITIES_AND_DISTRICTS).map((cityName) => (
                <option key={cityName} value={cityName}>
                  {cityName}
                </option>
              ))}
            </select>
          </div>

          {/* District */}
          <div className="space-y-1.5">
            <label htmlFor="wizard-district" className="block text-xs font-bold text-slate-700">
              Quận / Huyện <span className="text-rose-500">*</span>
            </label>
            <select
              id="wizard-district"
              value={district}
              onChange={(e) => onChange("district", e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:border-[#F4CD65] focus:ring-2 focus:ring-[#F4CD65]/20 transition-all min-h-[44px]"
            >
              {districtList.map((dist) => (
                <option key={dist} value={dist}>
                  {dist}
                </option>
              ))}
            </select>
          </div>

          {/* Ward */}
          <div className="space-y-1.5">
            <label htmlFor="wizard-ward" className="block text-xs font-bold text-slate-700">
              Phường / Xã <span className="text-slate-400 font-normal">(Tùy chọn)</span>
            </label>
            <input
              id="wizard-ward"
              type="text"
              value={ward}
              onChange={(e) => onChange("ward", e.target.value)}
              placeholder="VD: Phường 25, Phường Bến Nghé"
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:border-[#F4CD65] focus:ring-2 focus:ring-[#F4CD65]/20 transition-all min-h-[44px]"
            />
          </div>
        </div>

        {/* Street Address */}
        <div className="space-y-1.5">
          <label htmlFor="wizard-address" className="block text-xs font-bold text-slate-700">
            Số nhà, Tên đường, Ngõ / Hẻm <span className="text-rose-500">*</span>
          </label>
          <input
            id="wizard-address"
            type="text"
            value={address}
            onChange={(e) => onChange("address", e.target.value)}
            placeholder="VD: 48/12 Điện Biên Phủ hoặc Số 15 Ngõ 68 Cầu Giấy"
            className={`w-full px-3.5 py-2.5 text-xs sm:text-sm bg-white border rounded-xl text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all min-h-[44px] ${
              errors.address
                ? "border-rose-400 focus:border-rose-500 focus:ring-rose-500/20"
                : "border-slate-200 focus:border-[#F4CD65] focus:ring-[#F4CD65]/20"
            }`}
          />
          {errors.address && (
            <p className="text-xs text-rose-600 font-medium flex items-center gap-1.5 mt-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errors.address}</span>
            </p>
          )}
        </div>

        {/* Live Formatted Address Card */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#FFF1CC] text-[#805B10] flex items-center justify-center shrink-0 mt-0.5">
            <MapPin className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Địa chỉ hiển thị đầy đủ
            </div>
            <div className="text-xs sm:text-sm font-bold text-slate-800 mt-0.5">
              {formattedFullAddress || (
                <span className="text-slate-400 font-normal italic">
                  Vui lòng nhập số nhà và tên đường ở trên...
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-600 font-medium mt-1">
              Người thuê trên sàn sẽ nhìn thấy địa chỉ này cùng bản đồ khu vực tương ứng.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
