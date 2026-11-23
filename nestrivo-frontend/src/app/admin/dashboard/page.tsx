"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { 
  Building2, 
  CheckSquare, 
  Users, 
  AlertTriangle, 
  TrendingUp, 
  Clock, 
  ShieldCheck, 
  ArrowUpRight, 
  ChevronRight,
  Sparkles,
  Layers,
  UserCheck,
  CheckCircle2,
  XCircle,
  Eye,
  RefreshCw,
  DollarSign,
  CreditCard,
  MapPin,
  PieChart,
  BarChart3,
  Activity,
  FileText,
  ShieldAlert,
  Calendar
} from "lucide-react";
import { useAdminLayout } from "@/components/admin/AdminWorkspaceLayout";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { adminService } from "@/service/admin.service";
import { 
  AdminDashboardStatsResponse,
  AdminListingItem 
} from "@/types/admin";
import { formatVND, cn } from "@/lib/utils";

export default function AdminDashboardPage() {
  const { toggleMobileMenu, pendingCount, setPendingCount } = useAdminLayout();

  const [statsData, setStatsData] = useState<AdminDashboardStatsResponse | null>(null);
  const [pendingListings, setPendingListings] = useState<AdminListingItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [timeRange, setTimeRange] = useState<"7d" | "30d">("7d");
  const [activeChartTab, setActiveChartTab] = useState<"GROWTH" | "REVENUE">("GROWTH");
  const [hoveredDayIndex, setHoveredDayIndex] = useState<number | null>(null);

  // Tải dữ liệu thống kê từ API thực tế
  const loadDashboardData = async (showFullLoading = true) => {
    if (showFullLoading) setIsLoading(true);
    else setIsRefreshing(true);

    try {
      const [statsRes, pendingRes] = await Promise.all([
        adminService.getDashboardStats({ timeRange }).catch(() => null),
        adminService.getPendingListings().catch(() => null),
      ]);

      if (statsRes && statsRes.success) {
        setStatsData(statsRes);
        if (statsRes.summary?.pendingListingsCount !== undefined) {
          setPendingCount(statsRes.summary.pendingListingsCount);
        }
      }

      if (pendingRes && Array.isArray(pendingRes.data)) {
        setPendingListings(pendingRes.data.slice(0, 4));
        if (!statsRes) {
          setPendingCount(pendingRes.data.length);
        }
      }
    } catch (err) {
      console.error("Lỗi khi tải dữ liệu Admin Dashboard:", err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboardData(true);
  }, [timeRange]);

  const summary = statsData?.summary || {
    pendingListingsCount: pendingCount,
    totalListingsCount: 0,
    publishedListingsCount: 0,
    rejectedListingsCount: 0,
    hiddenListingsCount: 0,
    totalUsersCount: 0,
    landlordsCount: 0,
    rentersCount: 0,
    lockedUsersCount: 0,
    pendingKycCount: 0,
    pendingReportsCount: 0,
    resolvedReportsCount: 0,
    totalReportsCount: 0,
    totalRevenue: 0,
    paidOrdersCount: 0,
    activePromosCount: 0,
    activePromosByTier: { VIP: 0, HOT: 0 },
  };

  const charts = statsData?.charts;
  const growthChart = charts?.growthChart || [];
  const listingStatusBreakdown = charts?.listingStatusBreakdown || [];
  const propertyDistribution = charts?.propertyDistribution || [];
  const topDistricts = charts?.topDistricts || [];
  const reportReasonsBreakdown = charts?.reportReasonsBreakdown || [];

  // Tổng hợp dữ liệu trong khoảng thời gian đã chọn
  const periodTotals = useMemo(() => {
    return growthChart.reduce(
      (acc, item) => ({
        listings: acc.listings + item.listings,
        users: acc.users + item.users,
        revenue: acc.revenue + item.revenue,
        orders: acc.orders + item.orders,
      }),
      { listings: 0, users: 0, revenue: 0, orders: 0 }
    );
  }, [growthChart]);

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#FFFAEF]/40">
      {/* Header */}
      <AdminHeader
        onToggleMobileMenu={toggleMobileMenu}
        title="Dashboard Tổng Quan &amp; Báo Cáo Sàn"
        subtitle="Trung tâm điều phối: Thống kê số liệu thời gian thực, doanh thu dịch vụ, an toàn sàn và giám sát thành viên"
        onRefresh={() => loadDashboardData(false)}
        isRefreshing={isLoading || isRefreshing}
      />

      {/* Main Container */}
      <main className="flex-1 px-4 sm:px-6 lg:px-8 xl:px-10 py-6 sm:py-8 space-y-8 w-full max-w-[1920px] mx-auto">
        
        {/* ========================================================= */}
        {/* 1. TOP PRIMARY KPI SUMMARY CARDS                          */}
        {/* ========================================================= */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {/* Card 1: Doanh thu gói quảng bá */}
          <div className="p-5 rounded-3xl bg-white border border-[#EDE5D5] shadow-xs hover:border-[#DCA936] transition-all group flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-[#805B10] uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#DCA936]" />
                Doanh thu gói tin VIP
              </span>
              <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 border border-amber-200/60 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-[#805B10]" />
              </div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-[#292524] tracking-tight">
                {formatVND(summary.totalRevenue)}
              </div>
              <p className="text-xs text-[#78716C] mt-1">
                {summary.paidOrdersCount} đơn thanh toán thành công
              </p>
              <div className="flex items-center justify-between pt-3 mt-3 border-t border-[#EDE5D5]/60 text-xs">
                <span className="text-[#805B10] font-medium flex items-center gap-1">
                  <CreditCard className="w-3.5 h-3.5" />
                  {summary.activePromosCount} tin đang kích hoạt
                </span>
                <Link
                  href="/admin/promotions"
                  className="font-semibold text-[#805B10] hover:text-[#292524] flex items-center gap-0.5 group-hover:translate-x-0.5 transition-all"
                >
                  <span>Xem đơn hàng</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>

          {/* Card 2: Hàng đợi duyệt tin */}
          <div className="p-5 rounded-3xl bg-white border border-[#EDE5D5] shadow-xs hover:border-[#DCA936] transition-all group flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-[#77715F] uppercase tracking-wider">Hàng đợi kiểm duyệt</span>
              <div className="w-10 h-10 rounded-2xl bg-[#FFF1CC] text-[#805B10] border border-[#F4CD65]/40 flex items-center justify-center">
                <CheckSquare className="w-5 h-5 text-[#DCA936]" />
              </div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-bold text-[#292524] tracking-tight">
                {summary.pendingListingsCount}
                <span className="text-xs font-normal text-[#78716C] ml-2">tin chờ</span>
              </div>
              <p className="text-xs text-[#78716C] mt-1">
                Tổng cộng {summary.totalListingsCount} phòng trên toàn hệ thống
              </p>
              <div className="flex items-center justify-between pt-3 mt-3 border-t border-[#EDE5D5]/60 text-xs">
                <span className="text-[#805B10] font-medium flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> SLA: &lt; 2 giờ
                </span>
                <Link
                  href="/admin/moderation"
                  className="font-medium text-[#292524] hover:text-[#DCA936] flex items-center gap-0.5 group-hover:translate-x-0.5 transition-all"
                >
                  <span>Xử lý ngay</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>

          {/* Card 3: Thành viên & eKYC */}
          <div className="p-5 rounded-3xl bg-white border border-[#EDE5D5] shadow-xs hover:border-[#DCA936] transition-all group flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-[#78716C] uppercase tracking-wider">Thành viên sàn</span>
              <div className="w-10 h-10 rounded-2xl bg-[#FFF1CC] text-[#805B10] border border-[#F4CD65]/40 flex items-center justify-center">
                <Users className="w-5 h-5 text-[#DCA936]" />
              </div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-bold text-[#292524] tracking-tight">
                {summary.totalUsersCount}
                <span className="text-xs font-normal text-[#78716C] ml-2">tài khoản</span>
              </div>
              <p className="text-xs text-[#78716C] mt-1">
                {summary.landlordsCount} Chủ nhà • {summary.rentersCount} Khách thuê
              </p>
              <div className="flex items-center justify-between pt-3 mt-3 border-t border-[#EDE5D5]/60 text-xs">
                <span className="text-amber-700 font-medium">
                  {summary.pendingKycCount > 0 ? `${summary.pendingKycCount} eKYC chờ duyệt` : "0 eKYC tồn đọng"}
                </span>
                <Link
                  href="/admin/users"
                  className="font-medium text-[#292524] hover:text-[#DCA936] flex items-center gap-0.5 group-hover:translate-x-0.5 transition-all"
                >
                  <span>Quản lý</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>

          {/* Card 4: Báo cáo vi phạm */}
          <div className="p-5 rounded-3xl bg-white border border-[#EDE5D5] shadow-xs hover:border-rose-300 transition-all group flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-[#78716C] uppercase tracking-wider">An toàn &amp; Báo cáo</span>
              <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-700 border border-rose-200 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
              </div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-bold text-rose-600 tracking-tight">
                {summary.pendingReportsCount}
                <span className="text-xs font-medium text-rose-600 ml-2">chờ xử lý</span>
              </div>
              <p className="text-xs text-[#78716C] mt-1">
                Đã giải quyết {summary.resolvedReportsCount} / {summary.totalReportsCount} khiếu nại
              </p>
              <div className="flex items-center justify-between pt-3 mt-3 border-t border-[#EDE5D5]/60 text-xs">
                <span className="text-[#78716C]">{summary.lockedUsersCount} tài khoản bị khóa</span>
                <Link
                  href="/admin/reports"
                  className="font-bold text-rose-700 hover:text-rose-800 flex items-center gap-0.5 group-hover:translate-x-0.5 transition-all"
                >
                  <span>Xem báo cáo</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* 2. MAIN CHARTS: XU HƯỚNG TĂNG TRƯỞNG & DOANH THU          */}
        {/* ========================================================= */}
        <section className="bg-white rounded-3xl border border-[#EDE5D5] p-5 sm:p-7 shadow-xs space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-2 border-b border-[#EDE5D5]/60">
            <div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#FFF1CC] text-[#805B10] flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-[#DCA936]" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-[#292524] tracking-tight">
                    {activeChartTab === "GROWTH" 
                      ? "Biểu đồ Tăng trưởng Tin đăng & Thành viên mới" 
                      : "Biểu đồ Doanh thu Gói Tin Nổi Bật (VND)"}
                  </h3>
                  <p className="text-xs text-[#57534E]">
                    {activeChartTab === "GROWTH"
                      ? "Số lượng phòng trọ mới gửi lên sàn và tài khoản đăng ký theo thời gian thực"
                      : "Dòng tiền thu được từ dịch vụ đẩy tin VIP Kim Cương & HOT Vàng"}
                  </p>
                </div>
              </div>
            </div>

            {/* Controls: Chart Switcher + Time Range */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Tab Switcher */}
              <div className="flex items-center p-1 rounded-xl bg-[#FFF7E5] border border-[#EDE5D5] text-xs font-medium">
                <button
                  type="button"
                  onClick={() => setActiveChartTab("GROWTH")}
                  className={cn(
                    "px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5",
                    activeChartTab === "GROWTH"
                      ? "bg-[#F4CD65] text-[#292524] font-bold shadow-2xs"
                      : "text-[#57534E] hover:text-[#292524]"
                  )}
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Tin &amp; Người dùng</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveChartTab("REVENUE")}
                  className={cn(
                    "px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5",
                    activeChartTab === "REVENUE"
                      ? "bg-[#F4CD65] text-[#292524] font-bold shadow-2xs"
                      : "text-[#57534E] hover:text-[#292524]"
                  )}
                >
                  <DollarSign className="w-3.5 h-3.5" />
                  <span>Doanh thu (VND)</span>
                </button>
              </div>

              {/* Time Range Selector */}
              <div className="flex items-center p-1 rounded-xl bg-[#FFF7E5] border border-[#EDE5D5] text-xs font-medium">
                <button
                  type="button"
                  onClick={() => setTimeRange("7d")}
                  className={cn(
                    "px-3 py-1.5 rounded-lg transition-all",
                    timeRange === "7d"
                      ? "bg-white text-[#292524] font-bold shadow-2xs border border-[#EDE5D5]"
                      : "text-[#57534E] hover:text-[#292524]"
                  )}
                >
                  7 Ngày
                </button>
                <button
                  type="button"
                  onClick={() => setTimeRange("30d")}
                  className={cn(
                    "px-3 py-1.5 rounded-lg transition-all",
                    timeRange === "30d"
                      ? "bg-white text-[#292524] font-bold shadow-2xs border border-[#EDE5D5]"
                      : "text-[#57534E] hover:text-[#292524]"
                  )}
                >
                  30 Ngày
                </button>
              </div>
            </div>
          </div>

          {/* Interactive Chart Container */}
          <div className="pt-4 pb-2">
            {growthChart.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-sm text-[#78716C] gap-2">
                <RefreshCw className="w-6 h-6 animate-spin text-[#DCA936]" />
                <span>Đang tải số liệu biểu đồ...</span>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Visual Bars Container */}
                <div className="h-64 sm:h-72 flex items-end justify-between gap-1 sm:gap-2 px-1 sm:px-4 border-b border-[#EDE5D5] relative">
                  {growthChart.map((item, idx) => {
                    const isHovered = hoveredDayIndex === idx;

                    return (
                      <div
                        key={idx}
                        onMouseEnter={() => setHoveredDayIndex(idx)}
                        onMouseLeave={() => setHoveredDayIndex(null)}
                        className="flex-1 flex flex-col items-center justify-end h-full group relative cursor-pointer"
                      >
                        {/* Interactive Tooltip Card */}
                        {isHovered && (
                          <div className="absolute -top-24 sm:-top-20 z-20 bg-[#292524] text-white px-3 py-2 rounded-xl text-xs shadow-xl pointer-events-none whitespace-nowrap min-w-[130px] border border-stone-700 animate-in fade-in zoom-in-95 duration-150">
                            <p className="font-bold text-amber-300 mb-1">{item.label}</p>
                            {activeChartTab === "GROWTH" ? (
                              <div className="space-y-0.5 text-[11px]">
                                <p className="flex justify-between gap-2">
                                  <span className="text-stone-300">Tin đăng:</span>
                                  <b className="text-white font-semibold">{item.listings} phòng</b>
                                </p>
                                <p className="flex justify-between gap-2">
                                  <span className="text-stone-300">Thành viên:</span>
                                  <b className="text-white font-semibold">{item.users} người</b>
                                </p>
                              </div>
                            ) : (
                              <div className="space-y-0.5 text-[11px]">
                                <p className="flex justify-between gap-2">
                                  <span className="text-stone-300">Doanh thu:</span>
                                  <b className="text-emerald-400 font-bold">{formatVND(item.revenue)}</b>
                                </p>
                                <p className="flex justify-between gap-2">
                                  <span className="text-stone-300">Đơn hàng:</span>
                                  <b className="text-white font-semibold">{item.orders} đơn</b>
                                </p>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Bars for GROWTH Tab (Dual Column) */}
                        {activeChartTab === "GROWTH" && (
                          <div className="w-full flex items-end justify-center gap-0.5 sm:gap-1.5 h-full">
                            {/* Listing Bar */}
                            <div
                              className={cn(
                                "w-full max-w-[18px] sm:max-w-[24px] rounded-t-lg bg-gradient-to-t from-[#DCA936] to-[#F4CD65] transition-all shadow-2xs",
                                isHovered ? "brightness-110 scale-y-105" : "hover:brightness-105"
                              )}
                              style={{ height: item.listingsHeight }}
                              title={`Tin đăng: ${item.listings}`}
                            />
                            {/* User Bar */}
                            <div
                              className={cn(
                                "w-full max-w-[18px] sm:max-w-[24px] rounded-t-lg bg-gradient-to-t from-[#373523] to-[#805B10] transition-all shadow-2xs",
                                isHovered ? "brightness-125 scale-y-105" : "hover:brightness-110"
                              )}
                              style={{ height: item.usersHeight }}
                              title={`Thành viên: ${item.users}`}
                            />
                          </div>
                        )}

                        {/* Bars for REVENUE Tab (Single High-Contrast Column) */}
                        {activeChartTab === "REVENUE" && (
                          <div className="w-full flex items-end justify-center h-full">
                            <div
                              className={cn(
                                "w-full max-w-[32px] sm:max-w-[42px] rounded-t-xl bg-gradient-to-t from-emerald-600 to-emerald-400 transition-all shadow-xs",
                                isHovered ? "brightness-115 scale-y-105" : "hover:brightness-105"
                              )}
                              style={{ height: item.revenueHeight }}
                              title={`Doanh thu: ${formatVND(item.revenue)}`}
                            />
                          </div>
                        )}

                        {/* Day Label under Bar */}
                        <span className={cn(
                          "text-[10px] sm:text-xs font-medium text-[#78716C] mt-2 truncate w-full text-center transition-colors",
                          isHovered && "text-[#292524] font-bold"
                        )}>
                          {item.day}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Legend & Stats Summary Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-[#57534E] pt-2 px-2">
                  {activeChartTab === "GROWTH" ? (
                    <div className="flex items-center gap-5">
                      <span className="flex items-center gap-1.5 font-medium text-[#292524]">
                        <span className="w-3 h-3 rounded-sm bg-[#F4CD65]" />
                        <span>Tin đăng mới (+{periodTotals.listings} phòng)</span>
                      </span>
                      <span className="flex items-center gap-1.5 font-medium text-[#292524]">
                        <span className="w-3 h-3 rounded-sm bg-[#373523]" />
                        <span>Thành viên mới (+{periodTotals.users} người)</span>
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-5">
                      <span className="flex items-center gap-1.5 font-medium text-[#292524]">
                        <span className="w-3 h-3 rounded-sm bg-emerald-500" />
                        <span>Tổng thu đợt này: <b>{formatVND(periodTotals.revenue)}</b> ({periodTotals.orders} đơn)</span>
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#FFF1CC] text-[#805B10] border border-[#F4CD65]/40">
                      SLA Kiểm duyệt: &lt; 2 giờ
                    </span>
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Tỷ lệ duyệt đúng hạn: 99.4%
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ========================================================= */}
        {/* 3. CHARTS ROW 2: KIỂM DUYỆT TIN & CƠ CẤU PHÒNG TRỌ        */}
        {/* ========================================================= */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
          {/* Left 6 Cols: Listing Status Moderation Funnel */}
          <div className="lg:col-span-6 bg-white rounded-3xl border border-[#EDE5D5] p-5 sm:p-7 shadow-xs space-y-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-50 text-[#805B10] flex items-center justify-center">
                    <PieChart className="w-5 h-5 text-[#DCA936]" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#292524]">Phễu Kiểm duyệt Tin đăng</h3>
                    <p className="text-xs text-[#57534E]">Tỷ lệ phân bổ trạng thái tin trên toàn hệ thống</p>
                  </div>
                </div>
                <Link
                  href="/admin/moderation"
                  className="text-xs font-semibold text-[#805B10] hover:text-[#292524] flex items-center gap-1"
                >
                  <span>Xem hàng đợi</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Segmented Funnel Bar */}
            <div className="space-y-4">
              <div className="h-5 w-full rounded-full overflow-hidden flex bg-stone-100 border border-[#EDE5D5] shadow-inner">
                {listingStatusBreakdown.map((item, idx) => (
                  <div
                    key={idx}
                    className="h-full transition-all hover:opacity-90 relative group"
                    style={{ width: `${Math.max(item.percent, item.count > 0 ? 3 : 0)}%`, backgroundColor: item.color }}
                    title={`${item.label}: ${item.count} tin (${item.percent}%)`}
                  />
                ))}
              </div>

              {/* Status Breakdown Grid Cards */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                {listingStatusBreakdown.map((item, idx) => (
                  <div key={idx} className="p-3 rounded-2xl bg-[#FFFAEF] border border-[#EDE5D5] space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1.5 font-medium text-[#292524]">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                        {item.label}
                      </span>
                      <b className="font-bold text-[#292524]">{item.percent}%</b>
                    </div>
                    <div className="text-lg font-bold text-[#292524]">
                      {item.count} <span className="text-xs font-normal text-[#78716C]">phòng</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Notice Footer */}
            <div className="p-3.5 rounded-2xl bg-[#FFF7E5] border border-[#EDE5D5] text-xs space-y-0.5">
              <span className="font-semibold text-[#292524] flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#DCA936]" />
                Chính sách an toàn &amp; minh bạch
              </span>
              <p className="text-[11px] text-[#57534E]">
                Mọi tin đăng xuất bản đều trải qua xác thực địa chỉ, cọc minh bạch và không chấp nhận thông tin ảo.
              </p>
            </div>
          </div>

          {/* Right 6 Cols: Property Types Distribution */}
          <div className="lg:col-span-6 bg-white rounded-3xl border border-[#EDE5D5] p-5 sm:p-7 shadow-xs space-y-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-50 text-[#805B10] flex items-center justify-center">
                    <Layers className="w-5 h-5 text-[#DCA936]" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#292524]">Cơ cấu Loại hình Phòng trọ</h3>
                    <p className="text-xs text-[#57534E]">Phân loại sản phẩm bất động sản đang có trên sàn</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Segmented Distribution Bar */}
            <div className="space-y-4">
              <div className="h-5 w-full rounded-full overflow-hidden flex bg-stone-100 border border-[#EDE5D5] shadow-inner">
                {propertyDistribution.map((item, idx) => (
                  <div
                    key={idx}
                    className={cn(item.color, "h-full transition-all hover:opacity-90")}
                    style={{ width: `${Math.max(item.percent, item.count > 0 ? 3 : 0)}%` }}
                    title={`${item.label}: ${item.count} tin (${item.percent}%)`}
                  />
                ))}
              </div>

              {/* Property Distribution List */}
              <div className="space-y-2.5 pt-1">
                {propertyDistribution.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs sm:text-sm p-2 rounded-xl hover:bg-[#FFF7E5]/50 transition-colors">
                    <div className="flex items-center gap-2.5">
                      <span className={cn("w-3 h-3 rounded-full shrink-0", item.color)} />
                      <span className="text-[#292524] font-medium">{item.label}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-[#78716C]">{item.count} tin</span>
                      <b className="font-bold text-[#292524] min-w-[36px] text-right">{item.percent}%</b>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Promo Tier Status Pill */}
            <div className="p-3.5 rounded-2xl bg-[#FFFAEF] border border-[#EDE5D5] text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#DCA936]" />
                <span className="font-semibold text-[#292524]">Tin Nổi Bật Đang Chạy:</span>
              </div>
              <div className="flex items-center gap-3 font-semibold text-[#805B10]">
                <span className="px-2 py-0.5 rounded-md bg-[#FFF1CC] border border-[#F4CD65]/40">
                  VIP: {summary.activePromosByTier?.VIP || 0}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-amber-100/70 border border-amber-300">
                  HOT: {summary.activePromosByTier?.HOT || 0}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* 4. CHARTS ROW 3: BẢN ĐỒ NHU CẦU & BÁO CÁO VI PHẠM         */}
        {/* ========================================================= */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
          {/* Left 6 Cols: Top 5 Districts with Most Supply */}
          <div className="lg:col-span-6 bg-white rounded-3xl border border-[#EDE5D5] p-5 sm:p-7 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-[#805B10] flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-[#DCA936]" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#292524]">Top Khu Vực Sôi Động Nhất</h3>
                  <p className="text-xs text-[#57534E]">Các Quận/Huyện có mật độ nguồn cung phòng trọ cao</p>
                </div>
              </div>
            </div>

            <div className="space-y-3.5 pt-2">
              {topDistricts.length === 0 ? (
                <div className="py-8 text-center text-xs text-[#78716C]">
                  Chưa có dữ liệu phân bổ khu vực
                </div>
              ) : (
                topDistricts.map((item, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-[#292524] flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-md bg-[#FFF7E5] border border-[#EDE5D5] text-[10px] font-bold flex items-center justify-center text-[#805B10]">
                          {idx + 1}
                        </span>
                        {item.district}
                      </span>
                      <span className="font-semibold text-[#292524]">
                        {item.count} phòng <span className="text-[#78716C] font-normal">({item.percent}%)</span>
                      </span>
                    </div>
                    {/* Horizontal Progress Bar */}
                    <div className="h-2 w-full rounded-full bg-stone-100 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#DCA936] to-[#F4CD65] rounded-full transition-all"
                        style={{ width: `${Math.max(item.percent, 8)}%` }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right 6 Cols: Report Reasons Breakdown */}
          <div className="lg:col-span-6 bg-white rounded-3xl border border-[#EDE5D5] p-5 sm:p-7 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center">
                  <ShieldAlert className="w-5 h-5 text-rose-600" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#292524]">Phân Tích Lý Do Tố Cáo Vi Phạm</h3>
                  <p className="text-xs text-[#57534E]">Các dạng vi phạm được khách thuê báo cáo nhiều nhất</p>
                </div>
              </div>
              <Link
                href="/admin/reports"
                className="text-xs font-semibold text-rose-700 hover:text-rose-800 flex items-center gap-1"
              >
                <span>Xử lý báo cáo</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-3 pt-2">
              {reportReasonsBreakdown.length === 0 ? (
                <div className="py-8 text-center text-xs text-[#78716C]">
                  Hiện chưa có báo cáo vi phạm nào trên hệ thống
                </div>
              ) : (
                reportReasonsBreakdown.map((item, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-[#292524] truncate max-w-[280px]">
                        {item.label}
                      </span>
                      <span className="font-bold text-rose-600">
                        {item.count} vụ <span className="text-[#78716C] font-normal">({item.percent}%)</span>
                      </span>
                    </div>
                    {/* Horizontal Progress Bar */}
                    <div className="h-2 w-full rounded-full bg-stone-100 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-rose-400 to-rose-600 rounded-full transition-all"
                        style={{ width: `${Math.max(item.percent, 8)}%` }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* 5. RECENT MODERATION ACTIONS & SYSTEM SHORTCUTS          */}
        {/* ========================================================= */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
          {/* Left 7 Cols: Quick Moderation Queue Preview */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-[#EDE5D5] p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-[#292524]">Hàng đợi chờ duyệt gần nhất</h3>
                <p className="text-xs text-[#57534E]">Ưu tiên xử lý đơn gửi trước (FIFO)</p>
              </div>
              <Link
                href="/admin/moderation"
                className="px-3.5 py-1.5 rounded-xl bg-[#F4CD65] hover:bg-[#ebbf4d] text-[#292524] font-medium text-xs shadow-2xs transition-all flex items-center gap-1"
              >
                <span>Vào duyệt tin</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="divide-y divide-[#EDE5D5]/60">
              {pendingListings.length === 0 ? (
                <div className="py-8 text-center text-xs text-[#78716C]">
                  Hiện không có tin đăng nào đang chờ duyệt. Mọi hồ sơ đã được xử lý!
                </div>
              ) : (
                pendingListings.map((item) => (
                  <div key={item.id} className="py-3 flex items-center justify-between gap-3">
                    <div className="min-w-0 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#FFF7E5] border border-[#EDE5D5] overflow-hidden shrink-0">
                        <img 
                          src={item.thumbnailUrl || (item.images && item.images[0]?.imageUrl) || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=120"} 
                          alt="" 
                          className="w-full h-full object-cover" 
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-[#292524] truncate">{item.title}</p>
                        <p className="text-[11px] text-[#57534E] truncate">
                          Chủ nhà: {item.landlord?.fullName || "Chưa cập nhật"} • {item.district}, {item.city}
                        </p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-[#FFF1CC] text-[#805B10] border border-[#F4CD65]/40 shrink-0">
                      Chờ duyệt
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right 5 Cols: Quick Admin Tools */}
          <div className="lg:col-span-5 bg-white rounded-3xl border border-[#EDE5D5] p-5 sm:p-6 shadow-xs space-y-4">
            <div>
              <h3 className="text-base font-semibold text-[#292524]">Lối tắt thao tác nhanh</h3>
              <p className="text-xs text-[#57534E]">Truy cập ngay các khu vực quản lý quan trọng</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Link
                href="/admin/moderation"
                className="p-3.5 rounded-2xl bg-[#FFFAEF] border border-[#EDE5D5] hover:border-[#DCA936] hover:bg-[#FFF7E5] transition-all space-y-1 group"
              >
                <div className="w-8 h-8 rounded-xl bg-[#FFF1CC] text-[#805B10] flex items-center justify-center">
                  <CheckSquare className="w-4 h-4 text-[#DCA936]" />
                </div>
                <p className="text-xs font-semibold text-[#292524] group-hover:text-[#805B10] transition-colors">
                  Duyệt tin nhanh
                </p>
                <p className="text-[11px] text-[#57534E]">{summary.pendingListingsCount} tin đang đợi</p>
              </Link>

              <Link
                href="/admin/users"
                className="p-3.5 rounded-2xl bg-[#FFFAEF] border border-[#EDE5D5] hover:border-[#DCA936] hover:bg-[#FFF7E5] transition-all space-y-1 group"
              >
                <div className="w-8 h-8 rounded-xl bg-[#FFF1CC] text-[#805B10] flex items-center justify-center">
                  <Users className="w-4 h-4 text-[#DCA936]" />
                </div>
                <p className="text-xs font-semibold text-[#292524] group-hover:text-[#805B10] transition-colors">
                  Khóa/Mở tài khoản
                </p>
                <p className="text-[11px] text-[#57534E]">{summary.lockedUsersCount} tài khoản bị khóa</p>
              </Link>

              <Link
                href="/admin/promotions"
                className="p-3.5 rounded-2xl bg-[#FFFAEF] border border-[#EDE5D5] hover:border-amber-300 hover:bg-amber-50/50 transition-all space-y-1 group"
              >
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                  <DollarSign className="w-4 h-4 text-[#805B10]" />
                </div>
                <p className="text-xs font-semibold text-[#292524] group-hover:text-[#805B10] transition-colors">
                  Gói Tin Nổi Bật
                </p>
                <p className="text-[11px] text-amber-800 font-medium">{summary.paidOrdersCount} đơn thanh toán</p>
              </Link>

              <Link
                href="/admin/reports"
                className="p-3.5 rounded-2xl bg-[#FFFAEF] border border-[#EDE5D5] hover:border-rose-300 hover:bg-rose-50/50 transition-all space-y-1 group"
              >
                <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                </div>
                <p className="text-xs font-semibold text-[#292524] group-hover:text-rose-700 transition-colors">
                  Xử lý báo cáo
                </p>
                <p className="text-[11px] text-rose-600 font-medium">{summary.pendingReportsCount} báo cáo mới</p>
              </Link>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}
