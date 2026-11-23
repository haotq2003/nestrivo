"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { 
  Sparkles, 
  TrendingUp, 
  CheckCircle2, 
  CreditCard, 
  Clock, 
  AlertCircle, 
  Eye, 
  Search, 
  RefreshCw, 
  Calendar, 
  User, 
  Building2, 
  ExternalLink,
  ChevronRight,
  Filter,
  X,
  ShieldCheck,
  Zap,
  ArrowUpRight
} from "lucide-react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { useAdminLayout } from "@/components/admin/AdminWorkspaceLayout";
import { promotionService } from "@/service/promotion.service";
import { AdminPromotionOrder } from "@/types/promotion";
import { formatVND } from "@/lib/utils";

export default function AdminPromotionsPage() {
  const { toggleMobileMenu } = useAdminLayout();
  const [orders, setOrders] = useState<AdminPromotionOrder[]>([]);
  const [stats, setStats] = useState({ totalRevenue: 0, paidOrdersCount: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [selectedOrder, setSelectedOrder] = useState<AdminPromotionOrder | null>(null);

  const fetchOrders = async (showLoadingSpinner = true) => {
    if (showLoadingSpinner) setIsLoading(true);
    else setIsRefreshing(true);

    try {
      const res = await promotionService.getAdminOrders({
        status: statusFilter === "ALL" ? undefined : statusFilter,
        limit: 50,
      });
      setOrders(res.data || []);
      if (res.stats) {
        setStats(res.stats);
      }
    } catch (err: unknown) {
      console.error("Lỗi khi tải danh sách đơn hàng quảng bá admin:", err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders(true);
  }, [statusFilter]);

  // Client-side search filtering
  const filteredOrders = useMemo(() => {
    if (!searchQuery.trim()) return orders;
    const q = searchQuery.toLowerCase().trim();
    return orders.filter((o) => {
      const orderCode = (o.orderCode || "").toLowerCase();
      const landlordName = (o.landlord?.fullName || "").toLowerCase();
      const landlordEmail = (o.landlord?.email || "").toLowerCase();
      const listingTitle = (o.listing?.title || "").toLowerCase();
      const planName = (o.plan?.name || "").toLowerCase();
      const transId = (o.payment?.transactionCode || "").toLowerCase();

      return (
        orderCode.includes(q) ||
        landlordName.includes(q) ||
        landlordEmail.includes(q) ||
        listingTitle.includes(q) ||
        planName.includes(q) ||
        transId.includes(q)
      );
    });
  }, [orders, searchQuery]);

  // Tab counts
  const counts = useMemo(() => {
    return {
      ALL: orders.length,
      PAID: orders.filter((o) => o.status === "PAID").length,
      PENDING_PAYMENT: orders.filter((o) => o.status === "PENDING_PAYMENT").length,
      CANCELLED: orders.filter((o) => o.status === "CANCELLED").length,
    };
  }, [orders]);

  // Active listings count
  const activePromotionsCount = useMemo(() => {
    const now = new Date().getTime();
    return orders.filter((o) => {
      if (o.status !== "PAID" || !o.listingPromotion) return false;
      const end = new Date(o.listingPromotion.endDate).getTime();
      return end > now;
    }).length;
  }, [orders]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PAID":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Đã thanh toán</span>
          </span>
        );
      case "PENDING_PAYMENT":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>Chờ thanh toán</span>
          </span>
        );
      case "CANCELLED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-stone-100 text-stone-600 border border-stone-200">
            <X className="w-3.5 h-3.5 text-stone-400" />
            <span>Đã hủy</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-stone-100 text-stone-600 border border-stone-200">
            <span>{status}</span>
          </span>
        );
    }
  };

  return (
    <>
      {/* Top Header */}
      <AdminHeader
        title="Doanh thu & Đơn hàng MoMo"
        subtitle="Báo cáo dòng tiền thanh toán trực tiếp qua cổng MoMo AIO Gateway v2 và quản lý đơn mua gói nổi bật"
        onToggleMobileMenu={toggleMobileMenu}
        onRefresh={() => fetchOrders(false)}
        isRefreshing={isRefreshing}
        badgeText="MoMo Gateway v2"
        placeholder="Tìm theo mã đơn, tên phòng, email chủ nhà, mã GD..."
      />

      {/* Main Content Workspace */}
      <main className="p-4 sm:p-6 lg:p-8 xl:p-10 space-y-6 max-w-7xl w-full mx-auto pb-24">
        {/* KPI Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {/* Card 1: Tổng doanh thu MoMo */}
          <div className="bg-white p-5 rounded-3xl border border-[#EDE5D5] shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[#78716C]">Tổng doanh thu đã nhận</span>
              <div className="w-9 h-9 rounded-2xl bg-[#FFF1CC] text-[#805B10] flex items-center justify-center border border-[#F4CD65]/50">
                <TrendingUp className="w-4 h-4 text-amber-700" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-[#805B10] tabular-nums">
              {formatVND(stats.totalRevenue)}
            </div>
            <p className="text-[11px] text-[#78716C] flex items-center gap-1">
              <span className="text-emerald-700 font-semibold">● MoMo Sandbox</span>
              <span>• Quyết toán tự động</span>
            </p>
          </div>

          {/* Card 2: Đơn hàng thành công */}
          <div className="bg-white p-5 rounded-3xl border border-[#EDE5D5] shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[#78716C]">Đơn hàng thành công</span>
              <div className="w-9 h-9 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-[#292524] tabular-nums">
              {stats.paidOrdersCount} <span className="text-sm font-normal text-stone-500">đơn</span>
            </div>
            <p className="text-[11px] text-[#78716C]">
              Tỉ lệ thanh toán thành công cao
            </p>
          </div>

          {/* Card 3: Phòng đang hiển thị nổi bật */}
          <div className="bg-white p-5 rounded-3xl border border-[#EDE5D5] shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[#78716C]">Tin đang nổi bật hôm nay</span>
              <div className="w-9 h-9 rounded-2xl bg-[#FFF7E5] text-[#DCA936] flex items-center justify-center border border-[#F4CD65]/40">
                <Sparkles className="w-4 h-4 text-amber-600" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-[#292524] tabular-nums">
              {activePromotionsCount} <span className="text-sm font-normal text-stone-500">phòng</span>
            </div>
            <p className="text-[11px] text-[#78716C]">
              Hiển thị top đầu trang chủ (Rotation công bằng)
            </p>
          </div>

          {/* Card 4: Trạng thái cổng MoMo */}
          <div className="bg-white p-5 rounded-3xl border border-[#EDE5D5] shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[#78716C]">Cổng thanh toán MoMo</span>
              <div className="w-9 h-9 rounded-2xl bg-[#D82D8B]/10 text-[#D82D8B] flex items-center justify-center border border-[#D82D8B]/20 font-bold text-xs">
                M
              </div>
            </div>
            <div className="text-base sm:text-lg font-bold text-[#292524] flex items-center gap-2 pt-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Hoạt động bình thường</span>
            </div>
            <p className="text-[11px] text-[#78716C]">
              Hỗ trợ Thẻ ATM Napas &amp; Ví MoMo
            </p>
          </div>
        </div>

        {/* Orders Table Container */}
        <section className="bg-white rounded-3xl border border-[#EDE5D5] shadow-xs overflow-hidden space-y-4">
          {/* Status Filter Tabs & Search */}
          <div className="p-4 sm:p-5 border-b border-[#EDE5D5] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              <button
                type="button"
                onClick={() => setStatusFilter("ALL")}
                className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                  statusFilter === "ALL"
                    ? "bg-[#F4CD65] text-[#292524] shadow-xs"
                    : "text-[#57534E] hover:text-[#292524] hover:bg-[#FFF7E5]"
                }`}
              >
                <span>Tất cả</span>
                <span className="px-1.5 py-0.5 rounded-md bg-white/70 text-[11px] font-bold">
                  {counts.ALL}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setStatusFilter("PAID")}
                className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                  statusFilter === "PAID"
                    ? "bg-[#F4CD65] text-[#292524] shadow-xs"
                    : "text-[#57534E] hover:text-[#292524] hover:bg-[#FFF7E5]"
                }`}
              >
                <span>Đã thanh toán</span>
                <span className="px-1.5 py-0.5 rounded-md bg-white/70 text-[11px] font-bold">
                  {counts.PAID}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setStatusFilter("PENDING_PAYMENT")}
                className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                  statusFilter === "PENDING_PAYMENT"
                    ? "bg-[#F4CD65] text-[#292524] shadow-xs"
                    : "text-[#57534E] hover:text-[#292524] hover:bg-[#FFF7E5]"
                }`}
              >
                <span>Chờ thanh toán</span>
                <span className="px-1.5 py-0.5 rounded-md bg-white/70 text-[11px] font-bold">
                  {counts.PENDING_PAYMENT}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setStatusFilter("CANCELLED")}
                className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                  statusFilter === "CANCELLED"
                    ? "bg-[#F4CD65] text-[#292524] shadow-xs"
                    : "text-[#57534E] hover:text-[#292524] hover:bg-[#FFF7E5]"
                }`}
              >
                <span>Đã hủy</span>
                <span className="px-1.5 py-0.5 rounded-md bg-white/70 text-[11px] font-bold">
                  {counts.CANCELLED}
                </span>
              </button>
            </div>

            {/* Quick search input */}
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm mã đơn, phòng, chủ nhà..."
                className="w-full pl-9 pr-8 py-2 text-xs bg-[#FFFDF7] border border-[#EDE5D5] rounded-xl text-[#292524] placeholder:text-stone-400 focus:outline-none focus:border-[#DCA936] focus:ring-2 focus:ring-[#DCA936]/20 transition-all font-medium"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-stone-400 hover:text-stone-700 rounded-md"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Table Data View */}
          {isLoading ? (
            <div className="py-20 text-center flex flex-col items-center justify-center space-y-3">
              <RefreshCw className="w-8 h-8 text-[#DCA936] animate-spin" />
              <p className="text-xs sm:text-sm text-[#78716C] font-medium">
                Đang tải danh sách đơn hàng quảng bá...
              </p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#FFF1CC] text-[#805B10] flex items-center justify-center mx-auto border border-[#F4CD65]/40">
                <CreditCard className="w-6 h-6 text-amber-700" />
              </div>
              <div className="text-sm font-bold text-[#292524]">Không tìm thấy đơn hàng nào</div>
              <p className="text-xs text-[#78716C] max-w-sm mx-auto">
                {searchQuery
                  ? "Không có giao dịch nào khớp với từ khóa tìm kiếm của bạn."
                  : "Chưa có chủ nhà nào đặt mua gói quảng bá trong mục này."}
              </p>
            </div>
          ) : (
            <>
              {/* Desktop Table (>= lg) */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#FFFDF7] border-b border-[#EDE5D5] text-[11px] font-bold uppercase tracking-wider text-[#78716C]">
                      <th className="py-3.5 px-5 whitespace-nowrap">Mã đơn & Ngày tạo</th>
                      <th className="py-3.5 px-4 min-w-[200px]">Chủ nhà (Landlord)</th>
                      <th className="py-3.5 px-4 min-w-[240px]">Phòng đăng ký</th>
                      <th className="py-3.5 px-4 whitespace-nowrap">Gói dịch vụ</th>
                      <th className="py-3.5 px-4 whitespace-nowrap">Số tiền (VNĐ)</th>
                      <th className="py-3.5 px-4 whitespace-nowrap">Trạng thái</th>
                      <th className="py-3.5 px-5 text-right whitespace-nowrap">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EDE5D5]/60 text-sm">
                    {filteredOrders.map((order) => {
                      const createdDate = new Date(order.createdAt).toLocaleDateString("vi-VN", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      });

                      return (
                        <tr
                          key={order.id}
                          onClick={() => setSelectedOrder(order)}
                          className="hover:bg-[#FFFDF7] transition-colors cursor-pointer group"
                        >
                          {/* Mã đơn */}
                          <td className="py-4 px-5 whitespace-nowrap">
                            <div className="space-y-0.5">
                              <span className="font-mono font-bold text-xs text-[#292524] group-hover:text-[#805B10] transition-colors">
                                #{order.orderCode}
                              </span>
                              <div className="text-[11px] text-stone-400 font-medium">
                                {createdDate}
                              </div>
                            </div>
                          </td>

                          {/* Chủ nhà */}
                          <td className="py-4 px-4">
                            <div className="space-y-0.5">
                              <div className="font-bold text-xs text-[#292524] truncate">
                                {order.landlord?.fullName || "Chủ nhà"}
                              </div>
                              <div className="text-[11px] text-stone-500 font-medium truncate">
                                {order.landlord?.email}
                              </div>
                            </div>
                          </td>

                          {/* Phòng */}
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center shrink-0 border border-stone-200">
                                <Building2 className="w-4 h-4 text-stone-500" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="text-xs font-semibold text-[#292524] truncate group-hover:text-[#805B10] transition-colors">
                                  {order.listing?.title || "Phòng trọ"}
                                </div>
                                <span className="text-[10px] text-stone-400 block truncate">
                                  ID: {order.listingId.slice(-8)}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Gói tin */}
                          <td className="py-4 px-4 whitespace-nowrap">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-[#FFF7E5] text-[#805B10] border border-[#F4CD65]/50">
                              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                              <span>{order.plan?.name || "Tin Nổi Bật"}</span>
                            </span>
                          </td>

                          {/* Số tiền */}
                          <td className="py-4 px-4 whitespace-nowrap">
                            <div className="text-xs font-extrabold text-[#805B10] tabular-nums">
                              {formatVND(order.amount)}
                            </div>
                            <span className="text-[10px] text-stone-400 block">
                              {order.payment?.paymentMethod || "MOMO"}
                            </span>
                          </td>

                          {/* Trạng thái */}
                          <td className="py-4 px-4 whitespace-nowrap">
                            {getStatusBadge(order.status)}
                          </td>

                          {/* Thao tác */}
                          <td className="py-4 px-5 whitespace-nowrap text-right">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedOrder(order);
                              }}
                              className="px-3 py-1.5 rounded-xl text-xs font-semibold text-stone-700 bg-[#FFF7E5] hover:bg-[#FFF1CC] border border-[#F4CD65]/40 transition-colors inline-flex items-center gap-1 cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5 text-amber-700" />
                              <span>Chi tiết</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards List (< lg) */}
              <div className="lg:hidden divide-y divide-[#EDE5D5]/60">
                {filteredOrders.map((order) => {
                  const formattedDate = new Date(order.createdAt).toLocaleDateString("vi-VN", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  });

                  return (
                    <div
                      key={order.id}
                      onClick={() => setSelectedOrder(order)}
                      className="p-4 space-y-3 hover:bg-[#FFFDF7] transition-colors cursor-pointer"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="font-mono font-bold text-xs text-[#292524] block">
                            #{order.orderCode}
                          </span>
                          <span className="text-xs text-stone-600 font-medium">
                            {order.landlord?.fullName || "Chủ nhà"}
                          </span>
                        </div>
                        {getStatusBadge(order.status)}
                      </div>

                      <div className="p-2.5 rounded-2xl bg-[#FFFDF7] border border-[#EDE5D5] space-y-1">
                        <div className="text-xs font-semibold text-[#292524] truncate">
                          {order.listing?.title}
                        </div>
                        <div className="flex items-center justify-between text-xs pt-1 border-t border-[#EDE5D5]/60">
                          <span className="text-stone-500">Gói: {order.plan?.name}</span>
                          <span className="font-bold text-[#805B10] tabular-nums">
                            {formatVND(order.amount)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-stone-400">
                        <span>{formattedDate}</span>
                        <span className="text-[#DCA936] font-semibold flex items-center gap-0.5">
                          <span>Xem chi tiết</span>
                          <ChevronRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </section>
      </main>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div
          className="fixed inset-0 bg-stone-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in"
          onClick={() => setSelectedOrder(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 border border-[#EDE5D5] shadow-xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#EDE5D5] pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#FFF1CC] text-[#805B10] flex items-center justify-center font-bold text-xs border border-[#F4CD65]/40">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-[#292524]">
                    Chi tiết đơn hàng #{selectedOrder.orderCode}
                  </h3>
                  <span className="text-[11px] text-stone-500">
                    Khởi tạo: {new Date(selectedOrder.createdAt).toLocaleString("vi-VN")}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="w-8 h-8 rounded-full hover:bg-stone-100 flex items-center justify-center text-stone-400 hover:text-stone-700 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="space-y-4 text-xs">
              {/* Status & Amount Box */}
              <div className="p-4 rounded-2xl bg-[#FFFDF7] border border-[#EDE5D5] flex items-center justify-between">
                <div>
                  <span className="text-stone-500 block mb-1">Trạng thái thanh toán:</span>
                  {getStatusBadge(selectedOrder.status)}
                </div>
                <div className="text-right">
                  <span className="text-stone-500 block mb-0.5">Tổng số tiền:</span>
                  <span className="text-xl font-bold text-[#805B10] tabular-nums">
                    {formatVND(selectedOrder.amount)}
                  </span>
                </div>
              </div>

              {/* Information Grid */}
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-[#EDE5D5]/60">
                  <span className="text-stone-500">Gói cước:</span>
                  <span className="font-bold text-[#292524]">{selectedOrder.plan?.name} ({selectedOrder.plan?.durationDays} ngày)</span>
                </div>

                <div className="flex justify-between py-2 border-b border-[#EDE5D5]/60">
                  <span className="text-stone-500">Phòng đăng ký:</span>
                  <div className="text-right max-w-[250px]">
                    <span className="font-bold text-[#292524] truncate block">{selectedOrder.listing?.title}</span>
                    {selectedOrder.listing?.id && (
                      <Link
                        href={`/listings/${selectedOrder.listing.id}`}
                        target="_blank"
                        className="text-[#DCA936] hover:underline inline-flex items-center gap-1 text-[11px]"
                      >
                        <span>Mở trang phòng</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    )}
                  </div>
                </div>

                <div className="flex justify-between py-2 border-b border-[#EDE5D5]/60">
                  <span className="text-stone-500">Chủ nhà (Landlord):</span>
                  <div className="text-right">
                    <span className="font-bold text-[#292524] block">{selectedOrder.landlord?.fullName || "Chủ nhà"}</span>
                    <span className="text-stone-500 text-[11px]">{selectedOrder.landlord?.email}</span>
                  </div>
                </div>

                <div className="flex justify-between py-2 border-b border-[#EDE5D5]/60">
                  <span className="text-stone-500">Cổng thanh toán:</span>
                  <span className="font-semibold text-stone-800 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-[#D82D8B]" />
                    <span>MoMo AIO Gateway v2</span>
                  </span>
                </div>

                {selectedOrder.payment?.transactionCode && (
                  <div className="flex justify-between py-2 border-b border-[#EDE5D5]/60">
                    <span className="text-stone-500">Mã giao dịch MoMo:</span>
                    <span className="font-mono font-bold text-slate-900">
                      #{selectedOrder.payment.transactionCode}
                    </span>
                  </div>
                )}

                {selectedOrder.listingPromotion && (
                  <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-1">
                    <span className="font-bold text-amber-900 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                      <span>Thời hạn hiển thị nổi bật:</span>
                    </span>
                    <p className="text-[11px] text-amber-800 leading-relaxed">
                      Từ ngày <strong>{new Date(selectedOrder.listingPromotion.startDate).toLocaleDateString("vi-VN")}</strong> đến ngày <strong>{new Date(selectedOrder.listingPromotion.endDate).toLocaleDateString("vi-VN")}</strong>.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="px-5 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold text-xs transition-colors cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
