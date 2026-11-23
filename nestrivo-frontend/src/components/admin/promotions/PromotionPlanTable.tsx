"use client";

import { useState } from "react";
import { 
  Sparkles, 
  Plus, 
  Edit3, 
  Trash2, 
  Calendar, 
  ShoppingBag, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  RefreshCw
} from "lucide-react";
import { PromotionPlan } from "@/types/promotion";
import { formatVND } from "@/lib/utils";

interface PromotionPlanTableProps {
  plans: PromotionPlan[];
  isLoading: boolean;
  onRefresh: () => void;
  onOpenCreate: () => void;
  onOpenEdit: (plan: PromotionPlan) => void;
  onToggleStatus: (plan: PromotionPlan) => void;
  onDeletePlan: (plan: PromotionPlan) => void;
}

export function PromotionPlanTable({
  plans,
  isLoading,
  onRefresh,
  onOpenCreate,
  onOpenEdit,
  onToggleStatus,
  onDeletePlan,
}: PromotionPlanTableProps) {
  const [deleteConfirmPlan, setDeleteConfirmPlan] = useState<PromotionPlan | null>(null);

  return (
    <div className="space-y-4">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-5 bg-white rounded-3xl border border-[#EDE5D5] shadow-xs">
        <div>
          <h3 className="text-base font-bold text-[#292524] flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>Danh sách Gói Tin Nổi Bật ({plans.length} gói)</span>
          </h3>
          <p className="text-xs text-[#78716C] mt-0.5">
            Các gói quảng bá giúp tin đăng của chủ nhà xuất hiện trên khu vực đầu tiên của Homepage (Rotation xoay vòng công bằng)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onRefresh}
            className="p-2.5 text-stone-600 hover:text-stone-900 hover:bg-[#FFF7E5] rounded-xl transition-colors cursor-pointer border border-[#EDE5D5]"
            title="Tải lại danh sách"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          </button>

          <button
            type="button"
            onClick={onOpenCreate}
            className="px-4 py-2.5 text-xs sm:text-sm font-bold text-[#292524] bg-[#F4CD65] hover:bg-[#ebbf4d] active:bg-[#e0b03b] rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm Gói Mới</span>
          </button>
        </div>
      </div>

      {/* Main Table / Cards */}
      <div className="bg-white rounded-3xl border border-[#EDE5D5] shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="py-20 text-center flex flex-col items-center justify-center space-y-3">
            <RefreshCw className="w-8 h-8 text-[#DCA936] animate-spin" />
            <p className="text-xs sm:text-sm text-[#78716C] font-medium">
              Đang tải danh sách các gói tin...
            </p>
          </div>
        ) : plans.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#FFF1CC] text-[#805B10] flex items-center justify-center mx-auto border border-[#F4CD65]/40">
              <Sparkles className="w-6 h-6 text-amber-600" />
            </div>
            <div className="text-sm font-bold text-[#292524]">Chưa có gói tin nổi bật nào</div>
            <p className="text-xs text-[#78716C] max-w-sm mx-auto">
              Nhấn nút Thêm Gói Mới để cấu hình các gói quảng bá cho chủ nhà mua trên sàn.
            </p>
            <button
              type="button"
              onClick={onOpenCreate}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-[#292524] bg-[#F4CD65] rounded-xl shadow-xs cursor-pointer hover:bg-[#ebbf4d]"
            >
              <Plus className="w-4 h-4" />
              <span>Tạo gói đầu tiên</span>
            </button>
          </div>
        ) : (
          <>
            {/* 1. Desktop Data Table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#FFFDF7] border-b border-[#EDE5D5] text-[11px] font-bold uppercase tracking-wider text-[#78716C]">
                    <th className="py-3.5 px-5 min-w-[260px]">Tên Gói Tin</th>
                    <th className="py-3.5 px-4 whitespace-nowrap">Thời hạn hiển thị</th>
                    <th className="py-3.5 px-4 whitespace-nowrap">Giá niêm yết</th>
                    <th className="py-3.5 px-4 whitespace-nowrap">Đơn đã mua</th>
                    <th className="py-3.5 px-4 whitespace-nowrap">Trạng thái mở bán</th>
                    <th className="py-3.5 px-5 text-right whitespace-nowrap">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EDE5D5]/60 text-sm">
                  {plans.map((plan) => (
                    <tr key={plan.id} className="hover:bg-[#FFFDF7] transition-colors">
                      {/* Name */}
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-2.5">
                          <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-[#F4CD65] text-[#292524] shrink-0 shadow-2xs">
                            Tin Nổi Bật
                          </span>
                          <div className="min-w-0 space-y-0.5">
                            <div className="font-bold text-[#292524] line-clamp-1">
                              {plan.name}
                            </div>
                            {plan.description && (
                              <p className="text-[11px] text-[#78716C] line-clamp-1">
                                {plan.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Duration */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-[#292524]">
                          <Calendar className="w-3.5 h-3.5 text-[#805B10] shrink-0" />
                          <span>{plan.durationDays} ngày</span>
                        </div>
                      </td>

                      {/* Price */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="text-xs font-extrabold text-[#805B10] tabular-nums">
                          {formatVND(Number(plan.price))}
                        </div>
                      </td>

                      {/* Orders Count */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1 text-xs font-semibold text-[#57534E] tabular-nums">
                          <ShoppingBag className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                          <span>{plan._count?.orders || 0} lượt mua</span>
                        </div>
                      </td>

                      {/* Status Toggle */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => onToggleStatus(plan)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                            plan.isActive
                              ? "bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100"
                              : "bg-stone-100 text-stone-600 border border-stone-200 hover:bg-stone-200"
                          }`}
                          title="Nhấn để đổi trạng thái mở bán"
                        >
                          {plan.isActive ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Đang mở bán</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3.5 h-3.5 text-stone-400" />
                              <span>Tạm ẩn</span>
                            </>
                          )}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-5 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => onOpenEdit(plan)}
                            className="p-2 text-stone-600 hover:text-stone-900 hover:bg-[#FFF7E5] rounded-xl transition-colors cursor-pointer border border-[#EDE5D5]"
                            title="Chỉnh sửa gói tin"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => setDeleteConfirmPlan(plan)}
                            className="p-2 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer border border-rose-200/60"
                            title="Xóa gói tin"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 2. Mobile Cards List */}
            <div className="lg:hidden divide-y divide-[#EDE5D5]/60">
              {plans.map((plan) => (
                <div key={plan.id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2.5">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-[#F4CD65] text-[#292524]">
                          Tin Nổi Bật
                        </span>
                        <span className="font-bold text-[#292524] text-sm">
                          {plan.name}
                        </span>
                      </div>
                      {plan.description && (
                        <p className="text-xs text-[#78716C] line-clamp-1">
                          {plan.description}
                        </p>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => onToggleStatus(plan)}
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold shrink-0 ${
                        plan.isActive
                          ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                          : "bg-stone-100 text-stone-600 border border-stone-200"
                      }`}
                    >
                      {plan.isActive ? "Mở bán" : "Tạm ẩn"}
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs p-2.5 rounded-2xl bg-[#FFFDF7] border border-[#EDE5D5]">
                    <div>
                      <span className="text-[10px] text-stone-400 block">Thời hạn:</span>
                      <span className="font-bold text-[#292524]">{plan.durationDays} ngày</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-stone-400 block">Giá bán:</span>
                      <span className="font-extrabold text-[#805B10]">{formatVND(Number(plan.price))}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-stone-400 block">Đã mua:</span>
                      <span className="font-semibold text-stone-700">{plan._count?.orders || 0} lượt</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#EDE5D5]/60 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => onOpenEdit(plan)}
                      className="px-3 py-1.5 text-xs font-semibold text-stone-700 bg-[#FFF7E5] hover:bg-[#FFF1CC] rounded-xl transition-colors flex items-center gap-1 cursor-pointer border border-[#F4CD65]/40"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-amber-700" />
                      <span>Sửa</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeleteConfirmPlan(plan)}
                      className="px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors flex items-center gap-1 cursor-pointer border border-rose-200/60"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Xóa</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="fixed inset-0 bg-stone-900/40 backdrop-blur-xs animate-in fade-in"
            onClick={() => setDeleteConfirmPlan(null)}
          />
          <div className="relative w-full max-w-md bg-white rounded-3xl p-6 shadow-xl border border-[#EDE5D5] z-10 space-y-4 animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-200/60">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-[#292524]">
                Xác nhận xóa gói tin nổi bật?
              </h3>
              <p className="text-xs text-[#78716C] leading-relaxed">
                Bạn có chắc chắn muốn xóa gói <strong>&ldquo;{deleteConfirmPlan.name}&rdquo;</strong>?
              </p>
              {deleteConfirmPlan._count && deleteConfirmPlan._count.orders > 0 && (
                <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs text-left font-medium">
                  ⚠️ Gói này đã có <strong>{deleteConfirmPlan._count.orders} đơn hàng</strong> trong lịch sử giao dịch. Để bảo toàn dữ liệu tài chính, hệ thống sẽ tự động chuyển gói sang trạng thái <strong>Tạm ẩn</strong> thay vì xóa vĩnh viễn.
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmPlan(null)}
                className="flex-1 py-2.5 px-4 text-xs font-semibold text-stone-700 hover:bg-stone-100 rounded-xl transition-colors cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={() => {
                  const plan = deleteConfirmPlan;
                  setDeleteConfirmPlan(null);
                  onDeletePlan(plan);
                }}
                className="flex-1 py-2.5 px-4 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
