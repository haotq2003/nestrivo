"use client";

import { useState } from "react";
import { 
  Zap, 
  Droplets, 
  Wifi, 
  Sparkles, 
  Car, 
  PlusCircle, 
  Trash2, 
  AlertCircle, 
  Calculator,
  CheckCircle2,
  HelpCircle
} from "lucide-react";
import { WizardFeeItem } from "@/types/wizard";
import { formatVND } from "@/lib/utils";

interface Step3Props {
  price: number;
  deposit: number;
  fees: WizardFeeItem[];
  errors: Record<string, string>;
  onChange: (field: string, value: unknown) => void;
}

const UNIT_LABELS: Record<string, string> = {
  PER_KWH: "₫/kWh",
  PER_M3: "₫/m³",
  PER_MONTH: "₫/tháng",
  PER_PERSON: "₫/người/tháng",
  PER_VEHICLE: "₫/xe/tháng",
  FIXED: "₫/tháng",
};

const FEE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  ELECTRICITY: Zap,
  WATER: Droplets,
  INTERNET: Wifi,
  SERVICE: Sparkles,
  PARKING: Car,
  OTHER: PlusCircle,
};

export function Step3PricingFees({
  price,
  deposit,
  fees,
  errors,
  onChange,
}: Step3Props) {
  // Update a specific fee field
  const handleUpdateFee = (id: string, updates: Partial<WizardFeeItem>) => {
    onChange(
      "fees",
      fees.map((f) => (f.id === id ? { ...f, ...updates } : f))
    );
  };

  // Add a new custom fee
  const handleAddCustomFee = () => {
    const newFee: WizardFeeItem = {
      id: `fee-custom-${Date.now()}`,
      type: "OTHER",
      name: "Chi phí tiện ích khác",
      amount: 50000,
      unit: "FIXED",
      isIncluded: false,
    };
    onChange("fees", [...fees, newFee]);
  };

  // Remove a fee item
  const handleRemoveFee = (id: string) => {
    onChange(
      "fees",
      fees.filter((f) => f.id !== id)
    );
  };

  // Preset prices in VND
  const PRICE_PRESETS = [3000000, 4500000, 6000000, 8500000, 12000000];

  // Calculate fixed monthly total
  const fixedFees = fees.filter(
    (f) => !f.isIncluded && (f.unit === "FIXED" || f.unit === "PER_MONTH" || f.unit === "PER_PERSON")
  );
  const fixedFeesSum = fixedFees.reduce((acc, f) => acc + (Number(f.amount) || 0), 0);
  const estimatedMonthlyFixed = price + fixedFeesSum;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* 1. Base Rent & Deposit */}
      <section className="space-y-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <span>1. Giá thuê niêm yết & Tiền đặt cọc</span>
            <span className="text-rose-500">*</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Mức giá niêm yết chính xác bằng đồng Việt Nam (VNĐ). Tuyệt đối minh bạch, không phát sinh chi phí ẩn.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Base Rent Input */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 space-y-3 shadow-2xs">
            <div className="flex items-center justify-between">
              <label htmlFor="wizard-price" className="text-xs font-bold text-slate-700">
                Giá thuê hàng tháng (VNĐ) <span className="text-rose-500">*</span>
              </label>
              <span className="text-sm font-bold text-[#805B10] bg-[#FFF6E3] px-2.5 py-0.5 rounded-lg border border-[#F4CD65]/50 tabular-nums">
                {formatVND(price)}
              </span>
            </div>

            <div className="relative flex items-center">
              <input
                id="wizard-price"
                type="number"
                step="100000"
                min="500000"
                value={price || ""}
                onChange={(e) => onChange("price", Number(e.target.value))}
                placeholder="4500000"
                className={`w-full pl-4 pr-14 py-2.5 text-base font-bold tracking-wide tabular-nums bg-slate-50/80 border rounded-xl text-[#373523] antialiased focus:outline-none focus:bg-white focus:ring-2 transition-all min-h-[44px] ${
                  errors.price
                    ? "border-rose-400 focus:ring-rose-500/20"
                    : "border-slate-200 focus:border-[#F4CD65] focus:ring-[#F4CD65]/20"
                }`}
              />
              <span className="absolute right-3.5 text-xs font-bold text-slate-400 pointer-events-none select-none">
                VNĐ
              </span>
            </div>

            {errors.price && (
              <p className="text-xs text-rose-600 font-medium flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errors.price}</span>
              </p>
            )}

            {/* Quick Price Presets */}
            <div className="pt-1">
              <span className="text-[11px] font-semibold text-slate-500 block mb-1.5">
                Chọn nhanh mức giá phổ biến:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {PRICE_PRESETS.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => onChange("price", p)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                      price === p
                        ? "bg-[#F4CD65] text-[#373523] shadow-xs"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {p >= 1000000 ? `${p / 1000000} triệu` : `${p / 1000}k`}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Deposit Input */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 space-y-3 shadow-2xs">
            <div className="flex items-center justify-between">
              <label htmlFor="wizard-deposit" className="text-xs font-bold text-slate-700">
                Tiền đặt cọc (VNĐ)
              </label>
              <span className="text-sm font-bold text-[#805B10] bg-[#FFF6E3] px-2.5 py-0.5 rounded-lg border border-[#F4CD65]/50 tabular-nums">
                {formatVND(deposit)}
              </span>
            </div>

            <div className="relative flex items-center">
              <input
                id="wizard-deposit"
                type="number"
                step="100000"
                min="0"
                value={deposit || ""}
                onChange={(e) => onChange("deposit", Number(e.target.value))}
                placeholder="4500000"
                className="w-full pl-4 pr-14 py-2.5 text-base font-bold tracking-wide tabular-nums bg-slate-50/80 border border-slate-200 rounded-xl text-[#373523] antialiased focus:outline-none focus:bg-white focus:border-[#F4CD65] focus:ring-2 focus:ring-[#F4CD65]/20 transition-all min-h-[44px]"
              />
              <span className="absolute right-3.5 text-xs font-bold text-slate-400 pointer-events-none select-none">
                VNĐ
              </span>
            </div>

            {/* Quick Deposit Options */}
            <div className="pt-1">
              <span className="text-[11px] font-semibold text-slate-500 block mb-1.5">
                Quy ước đặt cọc:
              </span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => onChange("deposit", price)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                    deposit === price && price > 0
                      ? "bg-[#F4CD65] text-[#373523] shadow-xs"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  Cọc 1 tháng ({formatVND(price)})
                </button>
                <button
                  type="button"
                  onClick={() => onChange("deposit", price * 2)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                    deposit === price * 2 && price > 0
                      ? "bg-[#F4CD65] text-[#373523] shadow-xs"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  Cọc 2 tháng ({formatVND(price * 2)})
                </button>
                <button
                  type="button"
                  onClick={() => onChange("deposit", 0)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                    deposit === 0
                      ? "bg-[#F4CD65] text-[#373523] shadow-xs"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  Không yêu cầu cọc
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Transparent Fee Breakdown Table */}
      <section className="space-y-4 pt-4 border-t border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <span>2. Bảng kê phụ phí dịch vụ minh bạch</span>
              <span className="text-xs font-bold text-[#805B10] bg-[#FFF1CC] px-2 py-0.5 rounded-md border border-[#F4CD65]/40">
                Chuẩn minh bạch Nestrivo
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Niêm yết rõ đơn giá điện, nước, internet giúp khách thuê an tâm, giảm 80% câu hỏi thắc mắc.
            </p>
          </div>

          <button
            type="button"
            onClick={handleAddCustomFee}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-[#373523] bg-[#FFF1CC] hover:bg-[#F4CD65] border border-[#EDE5D5] transition-colors self-start sm:self-auto min-h-[38px]"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Thêm loại phí khác</span>
          </button>
        </div>

        <div className="space-y-3">
          {fees.map((fee) => {
            const Icon = FEE_ICONS[fee.type] || FEE_ICONS.OTHER;

            return (
              <div
                key={fee.id}
                className="p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200/90 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-2xs hover:border-slate-300 transition-colors"
              >
                {/* Fee Name & Type Icon */}
                <div className="flex items-center gap-3 min-w-[200px]">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-[#DCA936]" />
                  </div>
                  <div className="min-w-0">
                    {fee.type === "OTHER" ? (
                      <input
                        type="text"
                        value={fee.name}
                        onChange={(e) => handleUpdateFee(fee.id, { name: e.target.value })}
                        placeholder="Tên khoản phí..."
                        className="text-xs sm:text-sm font-bold text-slate-900 border-b border-slate-300 focus:outline-none focus:border-[#F4CD65] bg-transparent py-0.5"
                      />
                    ) : (
                      <div className="text-xs sm:text-sm font-bold text-slate-900">
                        {fee.name}
                      </div>
                    )}
                    <div className="text-[11px] text-slate-600 font-medium">
                      {fee.isIncluded ? "Miễn phí hoặc đã gồm trong giá thuê" : "Thu theo tháng / mức tiêu thụ"}
                    </div>
                  </div>
                </div>

                {/* Amount & Unit inputs */}
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 flex-1 justify-start md:justify-end">
                  {/* Is Included checkbox toggle */}
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-600 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200/60 hover:bg-slate-100 min-h-[36px]">
                    <input
                      type="checkbox"
                      checked={fee.isIncluded}
                      onChange={(e) => handleUpdateFee(fee.id, { isIncluded: e.target.checked })}
                      className="rounded text-[#DCA936] focus:ring-[#F4CD65] w-4 h-4 accent-[#DCA936]"
                    />
                    <span>Đã bao gồm</span>
                  </label>

                  {!fee.isIncluded ? (
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        min="0"
                        step="1000"
                        value={fee.amount}
                        onChange={(e) =>
                          handleUpdateFee(fee.id, { amount: Number(e.target.value) })
                        }
                        className="w-24 sm:w-28 px-2.5 py-1.5 text-xs sm:text-sm font-bold tabular-nums tracking-wide bg-slate-50/80 border border-slate-200 rounded-lg text-[#373523] antialiased text-right focus:outline-none focus:bg-white focus:border-[#F4CD65] min-h-[36px]"
                      />

                      <select
                        value={fee.unit}
                        onChange={(e) =>
                          handleUpdateFee(fee.id, { unit: e.target.value as WizardFeeItem["unit"] })
                        }
                        className="px-2 py-1.5 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:bg-white min-h-[36px]"
                      >
                        <option value="PER_KWH">₫/kWh</option>
                        <option value="PER_M3">₫/m³</option>
                        <option value="PER_MONTH">₫/tháng</option>
                        <option value="PER_PERSON">₫/người/tháng</option>
                        <option value="PER_VEHICLE">₫/xe/tháng</option>
                        <option value="FIXED">₫/tháng cố định</option>
                      </select>
                    </div>
                  ) : (
                    <span className="text-xs font-bold text-[#805B10] bg-[#FFF1CC] px-3 py-1.5 rounded-lg border border-[#F4CD65]/40 min-h-[36px] flex items-center">
                      Miễn phí / Bao phòng
                    </span>
                  )}

                  {/* Remove custom fee */}
                  {fee.type === "OTHER" && (
                    <button
                      type="button"
                      onClick={() => handleRemoveFee(fee.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors rounded-lg hover:bg-rose-50"
                      title="Xóa phụ phí này"
                      aria-label="Xóa phụ phí"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. Estimated Total Monthly Cost Breakdown Card - Bright Warm Butter & Cream Palette */}
      <section className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-[#FFFDF9] via-[#FFF9EE] to-[#FFF3DC] border border-[#F4CD65]/60 text-[#373523] space-y-4 shadow-xs relative overflow-hidden">
        {/* Ambient soft glow */}
        <div className="absolute right-0 top-0 -mr-12 -mt-12 w-48 h-48 rounded-full bg-[#F4CD65]/20 blur-2xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#F4CD65]/35 pb-3 gap-2 relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#F4CD65]/40 border border-[#F4CD65]/70 flex items-center justify-center shrink-0 shadow-2xs">
              <Calculator className="w-4.5 h-4.5 text-[#805B10]" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-[#373523]">
                Dự toán chi phí cố định người thuê chi trả hàng tháng
              </h3>
              <p className="text-xs text-[#706B5B] font-medium">
                Ước tính tự động dựa trên giá phòng và các khoản phụ phí thu cố định
              </p>
            </div>
          </div>
          <span className="text-[11px] font-bold text-[#805B10] bg-white/90 px-2.5 py-1 rounded-full border border-[#F4CD65]/50 shrink-0 self-start sm:self-auto shadow-2xs">
            Chuẩn tính toán Nestrivo
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1 relative z-10">
          <div className="p-3.5 rounded-xl bg-white/90 border border-[#F4CD65]/30 space-y-1 shadow-2xs">
            <span className="text-xs text-slate-500 font-semibold block">Tiền phòng cố định:</span>
            <div className="text-base sm:text-lg font-bold text-slate-900 tabular-nums">
              {formatVND(price)}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-white/90 border border-[#F4CD65]/30 space-y-1 shadow-2xs">
            <span className="text-xs text-slate-500 font-semibold block">Phụ phí cố định ước tính:</span>
            <div className="text-base sm:text-lg font-bold text-[#805B10] tabular-nums">
              +{formatVND(fixedFeesSum)}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-gradient-to-r from-[#FFF1CC] to-[#FFE8A3] border border-[#F4CD65] space-y-1 shadow-2xs sm:text-right">
            <span className="text-xs text-[#805B10] font-bold block">
              Tổng chi phí cố định / tháng:
            </span>
            <div className="text-xl sm:text-2xl font-bold text-[#805B10] tabular-nums">
              {formatVND(estimatedMonthlyFixed)}
            </div>
          </div>
        </div>

        <div className="text-[11px] text-[#6B5A33] bg-white/85 p-3 rounded-xl border border-[#F4CD65]/40 relative z-10 leading-relaxed font-medium shadow-2xs">
          💡 <strong className="font-bold text-[#4F4120]">Lưu ý:</strong> Chưa bao gồm điện, nước tính theo chỉ số đồng hồ thực tế tiêu thụ trong tháng. Người thuê sẽ nhìn thấy bảng kê phụ phí chi tiết này trên trang thông tin phòng để đối chiếu rõ ràng.
        </div>
      </section>
    </div>
  );
}
