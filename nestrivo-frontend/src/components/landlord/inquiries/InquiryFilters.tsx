import { InquiryStatus } from "@/types/inquiry";
import { Search, X, Filter, ArrowUpDown, Building, CalendarCheck } from "lucide-react";

interface InquiryFiltersProps {
  activeStatus: "ALL" | InquiryStatus;
  onStatusChange: (status: "ALL" | InquiryStatus) => void;
  counts: {
    ALL: number;
    PENDING: number;
    CONFIRMED?: number;
    REJECTED?: number;
    CONTACTED: number;
    CLOSED: number;
  };
  searchQuery: string;
  onSearchChange: (query: string) => void;
  dateSort: "newest" | "oldest";
  onDateSortChange: (sort: "newest" | "oldest") => void;
  selectedListingId: string;
  onListingFilterChange: (id: string) => void;
  availableListings: { id: string; title: string }[];
  onResetFilters: () => void;
  hasActiveFilters: boolean;
  onlyViewingTours?: boolean;
  onToggleOnlyViewingTours?: (val: boolean) => void;
  viewingToursCount?: number;
}

export function InquiryFilters({
  activeStatus,
  onStatusChange,
  counts,
  searchQuery,
  onSearchChange,
  dateSort,
  onDateSortChange,
  selectedListingId,
  onListingFilterChange,
  availableListings,
  onResetFilters,
  hasActiveFilters,
  onlyViewingTours = false,
  onToggleOnlyViewingTours,
  viewingToursCount = 0,
}: InquiryFiltersProps) {
  return (
    <div className="space-y-3.5">
      {/* 1. Status Tabs Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none border-b border-slate-200">
        <button
          type="button"
          onClick={() => onStatusChange("ALL")}
          className={`px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition-all min-h-[44px] flex items-center gap-2 cursor-pointer ${
            activeStatus === "ALL"
              ? "bg-[#F4CD65] text-[#292524] shadow-xs font-semibold"
              : "text-slate-600 hover:text-slate-900 hover:bg-[#FFF7E5]"
          }`}
        >
          <span>Tất cả yêu cầu</span>
          <span
            className={`px-1.5 py-0.5 rounded-md text-[11px] font-bold ${
              activeStatus === "ALL" ? "bg-white/80 text-[#805B10]" : "bg-[#FFF1CC] text-[#805B10]"
            }`}
          >
            {counts.ALL}
          </span>
        </button>

        <button
          type="button"
          onClick={() => onStatusChange("PENDING")}
          className={`px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all min-h-[44px] flex items-center gap-2 cursor-pointer ${
            activeStatus === "PENDING"
              ? "bg-amber-500 text-white shadow-xs font-bold"
              : "text-slate-600 hover:text-amber-800 hover:bg-amber-50"
          }`}
        >
          <span>Chờ duyệt</span>
          <span
            className={`px-1.5 py-0.5 rounded-md text-[11px] font-bold ${
              activeStatus === "PENDING" ? "bg-white/30 text-white" : "bg-amber-50 text-amber-800"
            }`}
          >
            {counts.PENDING}
          </span>
        </button>

        <button
          type="button"
          onClick={() => onStatusChange("CONFIRMED")}
          className={`px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all min-h-[44px] flex items-center gap-2 cursor-pointer ${
            activeStatus === "CONFIRMED"
              ? "bg-emerald-600 text-white shadow-xs font-bold"
              : "text-slate-600 hover:text-emerald-800 hover:bg-emerald-50"
          }`}
        >
          <span>Đã duyệt lịch</span>
          <span
            className={`px-1.5 py-0.5 rounded-md text-[11px] font-bold ${
              activeStatus === "CONFIRMED" ? "bg-white/30 text-white" : "bg-emerald-50 text-emerald-800"
            }`}
          >
            {counts.CONFIRMED || 0}
          </span>
        </button>

        <button
          type="button"
          onClick={() => onStatusChange("REJECTED")}
          className={`px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all min-h-[44px] flex items-center gap-2 cursor-pointer ${
            activeStatus === "REJECTED"
              ? "bg-rose-600 text-white shadow-xs font-bold"
              : "text-slate-600 hover:text-rose-800 hover:bg-rose-50"
          }`}
        >
          <span>Đã từ chối</span>
          <span
            className={`px-1.5 py-0.5 rounded-md text-[11px] font-bold ${
              activeStatus === "REJECTED" ? "bg-white/30 text-white" : "bg-rose-50 text-rose-800"
            }`}
          >
            {counts.REJECTED || 0}
          </span>
        </button>

        <button
          type="button"
          onClick={() => onStatusChange("CONTACTED")}
          className={`px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all min-h-[44px] flex items-center gap-2 cursor-pointer ${
            activeStatus === "CONTACTED"
              ? "bg-blue-600 text-white shadow-xs font-bold"
              : "text-slate-600 hover:text-blue-800 hover:bg-blue-50"
          }`}
        >
          <span>Đã liên hệ</span>
          <span
            className={`px-1.5 py-0.5 rounded-md text-[11px] font-bold ${
              activeStatus === "CONTACTED" ? "bg-white/30 text-white" : "bg-blue-50 text-blue-800"
            }`}
          >
            {counts.CONTACTED}
          </span>
        </button>

        <button
          type="button"
          onClick={() => onStatusChange("CLOSED")}
          className={`px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all min-h-[44px] flex items-center gap-2 cursor-pointer ${
            activeStatus === "CLOSED"
              ? "bg-[#EDE5D5] text-[#77715F] font-bold border border-[#DCA936]/40"
              : "text-slate-600 hover:text-slate-900 hover:bg-[#FFF7E5]"
          }`}
        >
          <span>Đã đóng</span>
          <span
            className={`px-1.5 py-0.5 rounded-md text-[11px] font-bold ${
              activeStatus === "CLOSED" ? "bg-white text-[#77715F]" : "bg-slate-100 text-slate-600"
            }`}
          >
            {counts.CLOSED}
          </span>
        </button>

        {/* Viewing Tours Toggle Pill */}
        {onToggleOnlyViewingTours && (
          <button
            type="button"
            onClick={() => onToggleOnlyViewingTours(!onlyViewingTours)}
            className={`ml-auto px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all min-h-[40px] flex items-center gap-1.5 cursor-pointer shrink-0 border ${
              onlyViewingTours
                ? "bg-[#FFF1CC] text-[#805B10] border-[#F4CD65] shadow-xs ring-1 ring-[#F4CD65]/40"
                : "bg-white text-slate-700 border-slate-200 hover:bg-amber-50/50"
            }`}
            title="Lọc chỉ các yêu cầu có hẹn lịch xem phòng"
          >
            <CalendarCheck className={`w-4 h-4 ${onlyViewingTours ? "text-[#805B10]" : "text-amber-500"}`} />
            <span>Lịch hẹn xem ({viewingToursCount})</span>
            {onlyViewingTours && <X className="w-3.5 h-3.5 ml-0.5 text-[#805B10]" />}
          </button>
        )}
      </div>

      {/* 2. Search & Select Filters Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-lg">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Tìm theo tên khách thuê, SĐT hoặc tên phòng..."
            className="w-full pl-10 pr-9 py-2.5 text-xs sm:text-sm bg-white border border-slate-200/90 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#F4CD65] focus:ring-2 focus:ring-[#F4CD65]/20 shadow-2xs transition-all min-h-[42px]"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 rounded-md"
              title="Xóa tìm kiếm"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Dropdowns: Listing & Date Sort */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Listing Filter Dropdown */}
          <div className="relative flex-1 sm:flex-initial min-w-[180px]">
            <select
              value={selectedListingId}
              onChange={(e) => onListingFilterChange(e.target.value)}
              className="w-full pl-3 pr-8 py-2.5 text-xs sm:text-sm font-medium bg-white border border-slate-200/90 rounded-xl text-slate-700 focus:outline-none focus:border-[#F4CD65] focus:ring-2 focus:ring-[#F4CD65]/20 shadow-2xs min-h-[42px] cursor-pointer appearance-none"
              aria-label="Lọc theo phòng"
            >
              <option value="ALL">Tất cả phòng đăng</option>
              {availableListings.map((listing) => (
                <option key={listing.id} value={listing.id}>
                  {listing.title.length > 35 ? `${listing.title.substring(0, 35)}...` : listing.title}
                </option>
              ))}
            </select>
            <Building className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Date Sort Dropdown */}
          <div className="relative flex-1 sm:flex-initial min-w-[140px]">
            <select
              value={dateSort}
              onChange={(e) => onDateSortChange(e.target.value as "newest" | "oldest")}
              className="w-full pl-3 pr-8 py-2.5 text-xs sm:text-sm font-medium bg-white border border-slate-200/90 rounded-xl text-slate-700 focus:outline-none focus:border-[#F4CD65] focus:ring-2 focus:ring-[#F4CD65]/20 shadow-2xs min-h-[42px] cursor-pointer appearance-none"
              aria-label="Sắp xếp thời gian"
            >
              <option value="newest">Mới nhất trước</option>
              <option value="oldest">Cũ nhất trước</option>
            </select>
            <ArrowUpDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Reset Filters CTA if active */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={onResetFilters}
              className="px-3 py-2 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors min-h-[42px] flex items-center gap-1.5"
            >
              <X className="w-3.5 h-3.5" />
              <span>Đặt lại</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

