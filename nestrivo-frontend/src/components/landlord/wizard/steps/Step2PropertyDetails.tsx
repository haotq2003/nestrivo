"use client";

import { 
  Maximize, 
  Bed, 
  Bath, 
  Users, 
  Wind, 
  Flame, 
  Wifi, 
  KeyRound, 
  Sun, 
  ArrowUpDown, 
  Car, 
  ChefHat, 
  Clock, 
  ShieldCheck, 
  DoorClosed, 
  Check, 
  AlertCircle,
  Plus,
  Minus
} from "lucide-react";
import { WIZARD_AMENITIES, WizardAmenityItem } from "@/types/wizard";

interface Step2Props {
  area: number;
  bedrooms: number;
  bathrooms: number;
  maxOccupants: number;
  hasMezzanine: boolean;
  allowsPets: boolean;
  isFurnished: boolean;
  minimumStayMonths: number | null;
  amenities: string[];
  errors: Record<string, string>;
  onChange: (field: string, value: unknown) => void;
}

// Map icon names to Lucide components
const AMENITY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Wind,
  Flame,
  Refrigerator: Bed, // fallback representation
  WashingMachine: Sun,
  Wifi,
  KeyRound,
  Sun,
  ArrowUpDown,
  Car,
  ChefHat,
  Clock,
  ShieldCheck,
  Bed,
  DoorClosed,
};

export function Step2PropertyDetails({
  area,
  bedrooms,
  bathrooms,
  maxOccupants,
  hasMezzanine,
  allowsPets,
  isFurnished,
  minimumStayMonths,
  amenities,
  errors,
  onChange,
}: Step2Props) {
  // Toggle an amenity in the list
  const handleToggleAmenity = (id: string) => {
    if (amenities.includes(id)) {
      onChange(
        "amenities",
        amenities.filter((item) => item !== id)
      );
    } else {
      onChange("amenities", [...amenities, id]);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* 1. Spatial Dimensions & Capacities */}
      <section className="space-y-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <span>1. Diện tích & Sức chứa</span>
            <span className="text-rose-500">*</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Thông số cơ bản giúp người thuê tính toán không gian và số lượng người ở phù hợp.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Area */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200/90 space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="wizard-area" className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Maximize className="w-3.5 h-3.5 text-[#DCA936]" />
                <span>Diện tích sử dụng</span>
              </label>
              <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                m²
              </span>
            </div>
            <div className="relative">
              <input
                id="wizard-area"
                type="number"
                min="5"
                max="500"
                value={area || ""}
                onChange={(e) => onChange("area", Number(e.target.value))}
                placeholder="VD: 30"
                className={`w-full px-3.5 py-2 text-sm font-bold bg-slate-50 border rounded-xl text-slate-900 focus:outline-none focus:bg-white focus:ring-2 transition-all min-h-[44px] ${
                  errors.area
                    ? "border-rose-400 focus:ring-rose-500/20"
                    : "border-slate-200 focus:border-[#F4CD65] focus:ring-[#F4CD65]/20"
                }`}
              />
            </div>
            {errors.area ? (
              <p className="text-xs text-rose-600 font-medium">{errors.area}</p>
            ) : (
              <p className="text-[11px] text-slate-600 font-medium">Bao gồm cả diện tích gác (nếu có)</p>
            )}
          </div>

          {/* Bedrooms Stepper */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200/90 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Bed className="w-3.5 h-3.5 text-[#DCA936]" />
                <span>Số phòng ngủ</span>
              </span>
            </div>
            <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl p-1 min-h-[44px]">
              <button
                type="button"
                onClick={() => onChange("bedrooms", Math.max(1, bedrooms - 1))}
                className="w-9 h-9 rounded-lg bg-white border border-slate-200 text-slate-700 font-bold flex items-center justify-center hover:bg-slate-100 active:scale-95 transition-all cursor-pointer"
                aria-label="Giảm số phòng ngủ"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="text-base font-semibold text-[#292524] tabular-nums">
                {bedrooms}
              </span>
              <button
                type="button"
                onClick={() => onChange("bedrooms", Math.min(10, bedrooms + 1))}
                className="w-9 h-9 rounded-lg bg-white border border-slate-200 text-slate-700 font-bold flex items-center justify-center hover:bg-slate-100 active:scale-95 transition-all cursor-pointer"
                aria-label="Tăng số phòng ngủ"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <p className="text-[11px] text-slate-600 font-medium">Studio tính là 1 phòng ngủ</p>
          </div>

          {/* Bathrooms Stepper */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200/90 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Bath className="w-3.5 h-3.5 text-[#DCA936]" />
                <span>Số phòng tắm/WC</span>
              </span>
            </div>
            <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl p-1 min-h-[44px]">
              <button
                type="button"
                onClick={() => onChange("bathrooms", Math.max(1, bathrooms - 1))}
                className="w-9 h-9 rounded-lg bg-white border border-slate-200 text-slate-700 font-bold flex items-center justify-center hover:bg-slate-100 active:scale-95 transition-all cursor-pointer"
                aria-label="Giảm số phòng tắm"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="text-base font-semibold text-[#292524] tabular-nums">
                {bathrooms}
              </span>
              <button
                type="button"
                onClick={() => onChange("bathrooms", Math.min(10, bathrooms + 1))}
                className="w-9 h-9 rounded-lg bg-white border border-slate-200 text-slate-700 font-bold flex items-center justify-center hover:bg-slate-100 active:scale-95 transition-all cursor-pointer"
                aria-label="Tăng số phòng tắm"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <p className="text-[11px] text-slate-600 font-medium">Khép kín hoặc dùng chung</p>
          </div>

          {/* Max Occupants Stepper */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200/90 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-[#DCA936]" />
                <span>Khách ở tối đa</span>
              </span>
            </div>
            <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl p-1 min-h-[44px]">
              <button
                type="button"
                onClick={() => onChange("maxOccupants", Math.max(1, maxOccupants - 1))}
                className="w-9 h-9 rounded-lg bg-white border border-slate-200 text-slate-700 font-bold flex items-center justify-center hover:bg-slate-100 active:scale-95 transition-all cursor-pointer"
                aria-label="Giảm số người ở"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="text-base font-semibold text-[#292524] tabular-nums">
                {maxOccupants}
              </span>
              <button
                type="button"
                onClick={() => onChange("maxOccupants", Math.min(20, maxOccupants + 1))}
                className="w-9 h-9 rounded-lg bg-white border border-slate-200 text-slate-700 font-bold flex items-center justify-center hover:bg-slate-100 active:scale-95 transition-all cursor-pointer"
                aria-label="Tăng số người ở"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <p className="text-[11px] text-slate-600 font-medium">Người ở tối đa</p>
          </div>
        </div>
      </section>

      {/* 2. Room Features Toggles & Minimum Lease Duration */}
      <section className="space-y-4 pt-4 border-t border-slate-200">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900">
            2. Đặc điểm nổi bật & Quy định thuê
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Các điểm cộng giúp người thuê lọc tìm kiếm nhanh chóng.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          {/* Mezzanine Toggle */}
          <button
            type="button"
            onClick={() => onChange("hasMezzanine", !hasMezzanine)}
            className={`p-4 rounded-2xl border text-left flex items-start justify-between gap-3 transition-all cursor-pointer ${
              hasMezzanine
                ? "bg-[#FFF7E5] border-[#F4CD65] shadow-xs"
                : "bg-white border-slate-200/90 hover:bg-slate-50/60"
            }`}
            aria-pressed={hasMezzanine}
          >
            <div>
              <div className="text-sm font-bold text-slate-900">Có gác lửng / đúc</div>
              <p className="text-xs text-slate-500 mt-1">
                Tăng diện tích sử dụng cho phòng
              </p>
            </div>
            <div
              className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                hasMezzanine
                  ? "bg-[#F4CD65] text-[#373523]"
                  : "bg-slate-100 text-transparent"
              }`}
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
            </div>
          </button>

          {/* Pets Toggle */}
          <button
            type="button"
            onClick={() => onChange("allowsPets", !allowsPets)}
            className={`p-4 rounded-2xl border text-left flex items-start justify-between gap-3 transition-all cursor-pointer ${
              allowsPets
                ? "bg-[#FFF7E5] border-[#F4CD65] shadow-xs"
                : "bg-white border-slate-200/90 hover:bg-slate-50/60"
            }`}
            aria-pressed={allowsPets}
          >
            <div>
              <div className="text-sm font-bold text-slate-900">Cho nuôi thú cưng</div>
              <p className="text-xs text-slate-500 mt-1">
                Cho phép chó, mèo hoặc pet nhỏ
              </p>
            </div>
            <div
              className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                allowsPets
                  ? "bg-[#F4CD65] text-[#373523]"
                  : "bg-slate-100 text-transparent"
              }`}
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
            </div>
          </button>

          {/* Furnished Toggle */}
          <button
            type="button"
            onClick={() => onChange("isFurnished", !isFurnished)}
            className={`p-4 rounded-2xl border text-left flex items-start justify-between gap-3 transition-all cursor-pointer ${
              isFurnished
                ? "bg-[#FFF7E5] border-[#F4CD65] shadow-xs"
                : "bg-white border-slate-200/90 hover:bg-slate-50/60"
            }`}
            aria-pressed={isFurnished}
          >
            <div>
              <div className="text-sm font-bold text-slate-900">Full nội thất cao cấp</div>
              <p className="text-xs text-slate-500 mt-1">
                Sẵn giường, nệm, tủ, bàn ghế
              </p>
            </div>
            <div
              className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                isFurnished
                  ? "bg-[#F4CD65] text-[#373523]"
                  : "bg-slate-100 text-transparent"
              }`}
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
            </div>
          </button>
        </div>

        {/* Minimum Stay Months Selector */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 space-y-2">
          <label className="block text-xs font-bold text-slate-700">
            Thời hạn hợp đồng thuê tối thiểu
          </label>
          <div className="flex flex-wrap gap-2">
            {[
              { val: null, label: "Linh hoạt (Không yêu cầu)" },
              { val: 3, label: "Tối thiểu 3 tháng" },
              { val: 6, label: "Tối thiểu 6 tháng" },
              { val: 12, label: "Tối thiểu 12 tháng" },
            ].map((option) => {
              const isSelected = minimumStayMonths === option.val;
              return (
                <button
                  key={String(option.val)}
                  type="button"
                  onClick={() => onChange("minimumStayMonths", option.val)}
                  className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all min-h-[40px] ${
                    isSelected
                      ? "bg-[#F4CD65] text-[#373523] shadow-xs"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. Amenities Checklist */}
      <section className="space-y-4 pt-4 border-t border-slate-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <span>3. Tiện nghi & Dịch vụ đi kèm</span>
              <span className="text-xs font-semibold text-[#805B10] bg-[#FFF1CC] px-2 py-0.5 rounded-md border border-[#F4CD65]/40">
                Đã chọn {amenities.length} tiện ích
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Chọn các tiện nghi đang có sẵn tại phòng để thu hút người thuê phù hợp.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {WIZARD_AMENITIES.map((item) => {
            const Icon = AMENITY_ICONS[item.iconName] || Sun;
            const isSelected = amenities.includes(item.id);

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleToggleAmenity(item.id)}
                className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all cursor-pointer min-h-[52px] ${
                  isSelected
                    ? "bg-[#FFF7E5] border-[#F4CD65] text-[#373523] font-bold ring-1 ring-[#F4CD65]/30"
                    : "bg-white border-slate-200/90 text-slate-700 hover:border-slate-300 hover:bg-slate-50/60 font-medium"
                }`}
                aria-pressed={isSelected}
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                    isSelected
                      ? "bg-[#F4CD65] text-[#373523]"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs line-clamp-2 leading-tight flex-1">
                  {item.name}
                </span>
                {isSelected && (
                  <Check className="w-4 h-4 text-[#805B10] shrink-0 stroke-[2.5]" />
                )}
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
