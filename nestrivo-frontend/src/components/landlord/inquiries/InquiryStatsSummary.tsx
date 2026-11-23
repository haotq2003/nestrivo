import { InquiryStats, InquiryStatus } from "@/types/inquiry";
import { MessageSquare, Clock, PhoneCall, CheckCircle2, CalendarCheck } from "lucide-react";

interface InquiryStatsSummaryProps {
  stats: InquiryStats;
  activeStatusFilter: "ALL" | InquiryStatus;
  onSelectFilter: (status: "ALL" | InquiryStatus) => void;
}

export function InquiryStatsSummary({
  stats,
  activeStatusFilter,
  onSelectFilter,
}: InquiryStatsSummaryProps) {
  const cards = [
    {
      key: "ALL" as const,
      title: "Tất cả yêu cầu",
      count: stats.total,
      hint: "Tổng khách quan tâm",
      icon: MessageSquare,
      iconBg: "bg-slate-100 text-slate-700",
      activeBorder: "border-[#DCA936] ring-2 ring-[#DCA936]/20",
      countColor: "text-slate-900",
    },
    {
      key: "PENDING" as const,
      title: "Chờ duyệt",
      count: stats.pending,
      hint: "Ưu tiên phản hồi sớm",
      icon: Clock,
      iconBg: "bg-amber-50 text-amber-700",
      activeBorder: "border-amber-500 ring-2 ring-amber-500/20",
      countColor: "text-amber-700",
    },
    {
      key: "CONFIRMED" as const,
      title: "Đã duyệt lịch",
      count: stats.confirmed || 0,
      hint: "Sẵn sàng đón khách xem",
      icon: CalendarCheck,
      iconBg: "bg-emerald-50 text-emerald-700",
      activeBorder: "border-emerald-500 ring-2 ring-emerald-500/20",
      countColor: "text-emerald-700",
    },
    {
      key: "CONTACTED" as const,
      title: "Đã liên hệ",
      count: stats.contacted,
      hint: "Đang trao đổi & hẹn giờ",
      icon: PhoneCall,
      iconBg: "bg-blue-50 text-blue-700",
      activeBorder: "border-blue-500 ring-2 ring-blue-500/20",
      countColor: "text-blue-700",
    },
    {
      key: "CLOSED" as const,
      title: "Đã đóng",
      count: stats.closed,
      hint: "Đã chốt hoặc kết thúc",
      icon: CheckCircle2,
      iconBg: "bg-slate-100 text-slate-600",
      activeBorder: "border-slate-500 ring-2 ring-slate-500/20",
      countColor: "text-slate-700",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        const isActive = activeStatusFilter === card.key;

        return (
          <button
            key={card.key}
            type="button"
            onClick={() => onSelectFilter(card.key)}
            className={`bg-white p-3.5 sm:p-4 rounded-2xl border text-left transition-all cursor-pointer shadow-2xs hover:shadow-xs group ${
              isActive
                ? `${card.activeBorder} shadow-xs bg-[#FFFDF7]`
                : "border-slate-200/90 hover:border-slate-300"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-600 group-hover:text-slate-900 transition-colors">
                {card.title}
              </span>
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${card.iconBg}`}>
                <Icon className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className={`text-xl sm:text-2xl font-bold mt-1.5 tabular-nums ${card.countColor}`}>
              {card.count}
            </div>
            <div className="text-[11px] font-medium text-slate-500 mt-0.5 truncate">
              {card.hint}
            </div>
          </button>
        );
      })}
    </div>
  );
}

