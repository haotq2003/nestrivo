import { InquiryStatus } from "@/types/inquiry";
import { Clock, PhoneCall, CheckCircle2, XCircle, CalendarCheck } from "lucide-react";

interface InquiryStatusBadgeProps {
  status: InquiryStatus;
  size?: "sm" | "md";
}

export function InquiryStatusBadge({ status, size = "md" }: InquiryStatusBadgeProps) {
  const isSmall = size === "sm";

  switch (status) {
    case "PENDING":
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-semibold rounded-lg border whitespace-nowrap bg-amber-50 text-amber-800 border-amber-200/80 ${
            isSmall ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs"
          }`}
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
          </span>
          <span>Chờ duyệt</span>
        </span>
      );

    case "CONFIRMED":
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-semibold rounded-lg border whitespace-nowrap bg-emerald-50 text-emerald-800 border-emerald-200/80 ${
            isSmall ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs"
          }`}
        >
          <CalendarCheck className={isSmall ? "w-3 h-3 text-emerald-600 shrink-0" : "w-3.5 h-3.5 text-emerald-600 shrink-0"} />
          <span>Đã duyệt lịch hẹn</span>
        </span>
      );

    case "REJECTED":
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-semibold rounded-lg border whitespace-nowrap bg-rose-50 text-rose-800 border-rose-200/80 ${
            isSmall ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs"
          }`}
        >
          <XCircle className={isSmall ? "w-3 h-3 text-rose-600 shrink-0" : "w-3.5 h-3.5 text-rose-600 shrink-0"} />
          <span>Đã từ chối lịch</span>
        </span>
      );

    case "CONTACTED":
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-semibold rounded-lg border whitespace-nowrap bg-blue-50 text-blue-800 border-blue-200/80 ${
            isSmall ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs"
          }`}
        >
          <PhoneCall className={isSmall ? "w-3 h-3 text-blue-600 shrink-0" : "w-3.5 h-3.5 text-blue-600 shrink-0"} />
          <span>Đã liên hệ</span>
        </span>
      );

    case "CLOSED":
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-semibold rounded-lg border whitespace-nowrap bg-slate-100 text-slate-700 border-slate-200/90 ${
            isSmall ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs"
          }`}
        >
          <CheckCircle2 className={isSmall ? "w-3 h-3 text-slate-500 shrink-0" : "w-3.5 h-3.5 text-slate-500 shrink-0"} />
          <span>Đã đóng</span>
        </span>
      );

    default:
      return null;
  }
}

