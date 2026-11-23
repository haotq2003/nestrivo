"use client";

import { useState, useEffect } from "react";
import { 
  X, 
  Sparkles, 
  Calendar, 
  DollarSign, 
  CheckCircle2, 
  AlertCircle,
  Eye
} from "lucide-react";
import { promotionService } from "@/service/promotion.service";
import { PromotionPlan, CreatePromotionPlanPayload, UpdatePromotionPlanPayload } from "@/types/promotion";
import { formatVND } from "@/lib/utils";

interface PromotionPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
  initialPlan?: PromotionPlan | null;
}

export function PromotionPlanModal({
  isOpen,
  onClose,
  onSuccess,
  initialPlan,
}: PromotionPlanModalProps) {
  const isEdit = Boolean(initialPlan?.id);

  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [durationDays, setDurationDays] = useState<number>(7);
  const [price, setPrice] = useState<number>(70000);
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState<boolean>(true);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (initialPlan) {
      setName(initialPlan.name || "");
      setCode(initialPlan.code || "");
      setDurationDays(initialPlan.durationDays || 7);
      setPrice(Number(initialPlan.price) || 0);
      setDescription(initialPlan.description || "");
      setIsActive(initialPlan.isActive !== undefined ? initialPlan.isActive : true);
    } else {
      setName("");
      setCode("");
      setDurationDays(7);
      setPrice(70000);
      setDescription("Tin đăng được đưa lên khu vực Phòng Nổi Bật đầu tiên trên Homepage, xoay vòng hiển thị công bằng.");
      setIsActive(true);
    }
    setErrorMsg(null);
  }, [initialPlan, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!name.trim()) {
      setErrorMsg("Vui lòng nhập tên gói tin.");
      return;
    }

    if (!durationDays || durationDays <= 0) {
      setErrorMsg("Số ngày hiệu lực phải lớn hơn 0.");
      return;
    }

    if (price === undefined || price < 0) {
      setErrorMsg("Giá bán không hợp lệ.");
      return;
    }

    setIsLoading(true);

    try {
      if (isEdit && initialPlan) {
        const payload: UpdatePromotionPlanPayload = {
          name: name.trim(),
          code: code.trim() || undefined,
          tier: "VIP",
          durationDays: Number(durationDays),
          price: Number(price),
          priority: 1,
          badgeColor: "#F4CD65",
          description: description.trim() || undefined,
          isActive,
        };

        const res = await promotionService.updateAdminPlan(initialPlan.id, payload);
        onSuccess(res.message || "Cập nhật gói tin thành công!");
      } else {
        const payload: CreatePromotionPlanPayload = {
          name: name.trim(),
          code: code.trim() || undefined,
          tier: "VIP",
          durationDays: Number(durationDays),
          price: Number(price),
          priority: 1,
          badgeColor: "#F4CD65",
          description: description.trim() || undefined,
          isActive,
        };

        const res = await promotionService.createAdminPlan(payload);
        onSuccess(res.message || "Tạo gói tin nổi bật mới thành công!");
      }

      onClose();
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Có lỗi xảy ra khi lưu gói tin.";
      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-stone-900/40 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-xl border border-[#EDE5D5] overflow-hidden my-8 animate-in zoom-in-95 duration-200 z-10">
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-[#EDE5D5] flex items-center justify-between bg-[#FFFDF7]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#FFF1CC] text-[#805B10] flex items-center justify-center font-bold shadow-2xs border border-[#F4CD65]/40">
              <Sparkles className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-[#292524]">
                {isEdit ? "Chỉnh sửa Gói Tin Nổi Bật" : "Thêm Gói Tin Nổi Bật Mới"}
              </h3>
              <p className="text-xs text-[#78716C]">
                Đưa tin lên khu vực đầu tiên trên Homepage (Xoay vòng Rotation công bằng)
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[78vh] overflow-y-auto">
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm font-medium flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Tên gói tin */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#373523] flex items-center gap-1">
              <span>Tên gói tin</span>
              <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ví dụ: Gói Tin Nổi Bật 1 Tuần"
              required
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-[#FFFDF7] border border-[#EDE5D5] rounded-xl text-[#292524] placeholder:text-stone-400 focus:outline-none focus:border-[#DCA936] focus:ring-2 focus:ring-[#DCA936]/20 transition-all font-medium"
            />
          </div>

          {/* Thời hạn & Giá bán */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Duration Days */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#373523] flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-[#805B10]" />
                <span>Thời hạn hiển thị (ngày)</span>
                <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  max="3650"
                  value={durationDays}
                  onChange={(e) => setDurationDays(Number(e.target.value))}
                  required
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-[#FFFDF7] border border-[#EDE5D5] rounded-xl text-[#292524] focus:outline-none focus:border-[#DCA936] focus:ring-2 focus:ring-[#DCA936]/20 transition-all font-bold"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-stone-400 pointer-events-none">
                  ngày
                </span>
              </div>
            </div>

            {/* Price */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#373523] flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                <span>Giá bán (VNĐ)</span>
                <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  required
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-[#FFFDF7] border border-[#EDE5D5] rounded-xl text-emerald-700 focus:outline-none focus:border-[#DCA936] focus:ring-2 focus:ring-[#DCA936]/20 transition-all font-bold"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-stone-400 pointer-events-none">
                  đ
                </span>
              </div>
              <div className="text-[11px] font-bold text-[#805B10]">
                Hiển thị: {formatVND(price || 0)}
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#373523]">
              Mô tả quyền lợi hiển thị
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Xuất hiện ở khu vực Tin Nổi Bật đầu tiên trên Homepage..."
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-[#FFFDF7] border border-[#EDE5D5] rounded-xl text-[#292524] placeholder:text-stone-400 focus:outline-none focus:border-[#DCA936] focus:ring-2 focus:ring-[#DCA936]/20 transition-all font-medium resize-none leading-relaxed"
            />
          </div>

          {/* Active Status Toggle */}
          <div className="p-3.5 rounded-2xl bg-[#FFFDF7] border border-[#EDE5D5] flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-[#292524]">Mở bán gói ngay trên sàn</div>
              <div className="text-[11px] text-[#78716C] font-normal">
                Nếu tắt, chủ nhà sẽ không nhìn thấy gói này khi chọn mua.
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-stone-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>

          {/* Live Preview Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-[#FFFDF7] to-[#FFF7E5] border border-[#F4CD65] space-y-2">
            <div className="text-[11px] font-bold text-[#805B10] uppercase flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5" />
              <span>Giao diện chủ nhà nhìn thấy khi mua:</span>
            </div>
            <div className="p-3.5 rounded-xl bg-white border border-[#EDE5D5] flex items-center justify-between gap-3 shadow-2xs">
              <div className="space-y-0.5 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-[#F4CD65] text-[#292524]">
                    Tin Nổi Bật
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-[#292524] truncate">
                    {name || "Tên gói tin"}
                  </span>
                </div>
                <p className="text-[11px] text-[#78716C] line-clamp-1">
                  {description || "Xuất hiện trên khu vực nổi bật Homepage"}
                </p>
              </div>

              <div className="text-right shrink-0">
                <div className="text-sm sm:text-base font-extrabold text-[#805B10] tabular-nums">
                  {formatVND(price || 0)}
                </div>
                <div className="text-[10px] font-semibold text-stone-500">
                  {durationDays} ngày
                </div>
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="pt-3 border-t border-[#EDE5D5] flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2.5 text-xs sm:text-sm font-semibold text-stone-600 hover:text-stone-800 hover:bg-stone-100 rounded-xl transition-colors cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2.5 text-xs sm:text-sm font-bold text-[#292524] bg-[#F4CD65] hover:bg-[#ebbf4d] active:bg-[#e0b03b] rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <span>Đang lưu...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isEdit ? "Cập nhật Gói Tin" : "Tạo Gói Tin Mới"}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
