import { ListingStatus, AvailabilityStatus } from "@/types/listing";
import { CheckCircle2, Clock, AlertTriangle, FileEdit, EyeOff } from "lucide-react";

interface ListingStatusBadgeProps {
  status: ListingStatus;
  className?: string;
}

export function ListingStatusBadge({ status, className = "" }: ListingStatusBadgeProps) {
  switch (status) {
    case "PUBLISHED":
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-[#FFF7E5] text-[#373523] border border-[#EDE5D5] ${className}`}
        >
          <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-[#DCA936]" />
          <span>Đang hiển thị</span>
        </span>
      );

    case "PENDING_APPROVAL":
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-[#FFF1CC] text-[#805B10] border border-[#F4CD65]/40 ${className}`}
        >
          <Clock className="w-3.5 h-3.5 shrink-0 text-[#DCA936]" />
          <span>Chờ kiểm duyệt</span>
        </span>
      );

    case "REJECTED":
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200/80 ${className}`}
        >
          <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-rose-600" />
          <span>Cần chỉnh sửa</span>
        </span>
      );

    case "DRAFT":
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200 ${className}`}
        >
          <FileEdit className="w-3.5 h-3.5 shrink-0 text-slate-500" />
          <span>Bản nháp</span>
        </span>
      );

    case "HIDDEN":
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-50 text-slate-500 border border-slate-200 ${className}`}
        >
          <EyeOff className="w-3.5 h-3.5 shrink-0 text-slate-400" />
          <span>Đang tạm ẩn</span>
        </span>
      );

    default:
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200 ${className}`}
        >
          <span>{status}</span>
        </span>
      );
  }
}

interface AvailabilityPillProps {
  status: AvailabilityStatus;
  onClick?: () => void;
  interactive?: boolean;
}

export function AvailabilityPill({ status, onClick, interactive = false }: AvailabilityPillProps) {
  const isAvailable = status === "AVAILABLE";

  const content = (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
        isAvailable
          ? "bg-[#FFF1CC] text-[#373523] border border-[#F4CD65]/40"
          : "bg-slate-100 text-[#77715F] border border-slate-200"
      } ${interactive ? "cursor-pointer hover:shadow-xs active:scale-95" : ""}`}
    >
      <span
        className={`w-2 h-2 rounded-full shrink-0 ${
          isAvailable ? "bg-[#F4CD65] animate-pulse" : "bg-slate-400"
        }`}
      />
      <span>{isAvailable ? "Còn phòng trống" : "Đã cho thuê"}</span>
    </span>
  );

  if (interactive && onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="focus:outline-none focus:ring-2 focus:ring-[#DCA936]/30 rounded-lg"
        title="Nhấp để thay đổi tình trạng phòng"
      >
        {content}
      </button>
    );
  }

  return content;
}
