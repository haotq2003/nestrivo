"use client";

import { useState, useEffect } from "react";
import { 
  Sparkles, 
  CheckCircle2, 
  X,
  AlertCircle
} from "lucide-react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { useAdminLayout } from "@/components/admin/AdminWorkspaceLayout";
import { promotionService } from "@/service/promotion.service";
import { PromotionPlan } from "@/types/promotion";
import { PromotionPlanTable } from "@/components/admin/promotions/PromotionPlanTable";
import { PromotionPlanModal } from "@/components/admin/promotions/PromotionPlanModal";

export default function AdminPromotionPlansPage() {
  const { toggleMobileMenu } = useAdminLayout();
  const [plans, setPlans] = useState<PromotionPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEditPlan, setSelectedEditPlan] = useState<PromotionPlan | null>(null);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 4000);
  };

  const fetchPlans = async () => {
    setIsLoading(true);
    try {
      const data = await promotionService.getAdminPlans();
      setPlans(data);
    } catch (err) {
      console.error("Lỗi khi tải danh sách gói tin:", err);
      showToast("Không thể tải danh sách gói tin quảng bá.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleOpenCreatePlan = () => {
    setSelectedEditPlan(null);
    setIsPlanModalOpen(true);
  };

  const handleOpenEditPlan = (plan: PromotionPlan) => {
    setSelectedEditPlan(plan);
    setIsPlanModalOpen(true);
  };

  const handleTogglePlanStatus = async (plan: PromotionPlan) => {
    try {
      const res = await promotionService.toggleAdminPlanStatus(plan.id);
      showToast(res.message);
      setPlans((prev) =>
        prev.map((p) => (p.id === plan.id ? { ...p, isActive: !p.isActive } : p))
      );
    } catch {
      showToast("Có lỗi khi thay đổi trạng thái gói tin.");
    }
  };

  const handleDeletePlan = async (plan: PromotionPlan) => {
    try {
      const res = await promotionService.deleteAdminPlan(plan.id);
      showToast(res.message);
      fetchPlans();
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Có lỗi khi xóa gói tin.";
      showToast(msg);
    }
  };

  const handlePlanModalSuccess = (msg: string) => {
    showToast(msg);
    fetchPlans();
  };

  return (
    <>
      {/* Admin Top Header */}
      <AdminHeader
        title="Cấu hình Gói Tin Nổi Bật"
        subtitle="Quản lý các gói đưa tin lên khu vực đầu tiên của Homepage (Rotation xoay vòng hiển thị công bằng)"
        onToggleMobileMenu={toggleMobileMenu}
        onRefresh={fetchPlans}
        isRefreshing={isLoading}
        badgeText="Quản lý bảng giá"
        placeholder="Tìm kiếm cấu hình..."
      />

      {/* Main Content Workspace */}
      <main className="p-4 sm:p-6 lg:p-8 xl:p-10 space-y-6 max-w-7xl w-full mx-auto pb-24">
        {/* Promotion Plan Table Component */}
        <PromotionPlanTable
          plans={plans}
          isLoading={isLoading}
          onRefresh={fetchPlans}
          onOpenCreate={handleOpenCreatePlan}
          onOpenEdit={handleOpenEditPlan}
          onToggleStatus={handleTogglePlanStatus}
          onDeletePlan={handleDeletePlan}
        />
      </main>

      {/* Promotion Plan Modal (Create & Edit) */}
      <PromotionPlanModal
        isOpen={isPlanModalOpen}
        onClose={() => setIsPlanModalOpen(false)}
        onSuccess={handlePlanModalSuccess}
        initialPlan={selectedEditPlan}
      />

      {/* Warm Toast Notification (No harsh black backgrounds) */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md bg-white text-[#292524] px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-200 border-2 border-[#F4CD65]">
          <div className="w-7 h-7 rounded-lg bg-[#FFF1CC] text-[#805B10] flex items-center justify-center shrink-0 border border-[#F4CD65]/40">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-xs sm:text-sm font-semibold leading-snug flex-1">
            {toastMessage}
          </p>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-stone-400 hover:text-stone-700 p-1 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </>
  );
}
