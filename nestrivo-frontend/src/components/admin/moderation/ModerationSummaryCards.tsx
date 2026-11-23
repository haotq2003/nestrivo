"use client";

import { Clock, CheckCircle2, AlertTriangle, Layers } from "lucide-react";

interface ModerationSummaryCardsProps {
  pendingCount: number;
  approvedCount: number;
  rejectedCount: number;
  totalCount: number;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function ModerationSummaryCards({
  pendingCount,
  approvedCount,
  rejectedCount,
  totalCount,
  activeTab,
  onTabChange,
}: ModerationSummaryCardsProps) {
  const cards = [
    {
      id: "PENDING",
      label: "Chờ kiểm duyệt",
      subLabel: "SLA ưu tiên xử lý trước",
      count: pendingCount,
      icon: Clock,
      colorClass: "text-[#805B10] bg-[#FFF1CC] border-[#F4CD65]/50",
      iconColor: "text-[#DCA936]",
      activeClass: "ring-2 ring-[#F4CD65] bg-[#FFF7E5] shadow-xs border-[#F4CD65]",
    },
    {
      id: "PUBLISHED",
      label: "Đã phê duyệt",
      subLabel: "Đang hiển thị công khai trên sàn",
      count: approvedCount,
      icon: CheckCircle2,
      colorClass: "text-[#373523] bg-[#FFF1CC]/60 border-[#EDE5D5]",
      iconColor: "text-[#DCA936]",
      activeClass: "ring-2 ring-[#F4CD65] bg-[#FFF7E5] shadow-xs border-[#F4CD65]",
    },
    {
      id: "REJECTED",
      label: "Đã từ chối",
      subLabel: "Chờ chủ nhà cập nhật chỉnh sửa",
      count: rejectedCount,
      icon: AlertTriangle,
      colorClass: "text-rose-800 bg-rose-50 border-rose-200/80",
      iconColor: "text-rose-600",
      activeClass: "ring-2 ring-rose-400 bg-rose-50/50 shadow-xs border-rose-300",
    },
    {
      id: "ALL",
      label: "Tổng tin hệ thống",
      subLabel: "Toàn bộ tin đăng trong luồng",
      count: totalCount,
      icon: Layers,
      colorClass: "text-[#373523] bg-white border-[#EDE5D5]",
      iconColor: "text-[#77715F]",
      activeClass: "ring-2 ring-[#F4CD65] bg-[#FFF7E5] shadow-xs border-[#F4CD65]",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
      {cards.map((c) => {
        const Icon = c.icon;
        const isActive = activeTab === c.id;

        return (
          <button
            key={c.id}
            type="button"
            onClick={() => onTabChange(c.id)}
            className={`text-left p-4 sm:p-5 rounded-3xl bg-white border border-[#EDE5D5] transition-all cursor-pointer hover:border-[#DCA936] hover:shadow-xs group ${
              isActive ? c.activeClass : ""
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center border ${c.colorClass}`}
              >
                <Icon className={`w-5 h-5 ${c.iconColor}`} />
              </div>
              <span className="text-2xl sm:text-3xl font-bold text-[#292524] tracking-tight">
                {c.count}
              </span>
            </div>

            <div>
              <p className="text-xs sm:text-sm font-semibold text-[#292524] group-hover:text-[#DCA936] transition-colors">
                {c.label}
              </p>
              <p className="text-[11px] text-[#78716C] mt-0.5 truncate hidden sm:block font-normal">
                {c.subLabel}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}

