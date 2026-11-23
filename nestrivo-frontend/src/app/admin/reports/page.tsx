"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  AlertTriangle, 
  Search, 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  Eye, 
  Building2, 
  Phone, 
  Mail, 
  User, 
  Clock, 
  Calendar, 
  Filter, 
  X, 
  AlertOctagon, 
  Lock, 
  EyeOff,
  Check,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  ImageIcon
} from "lucide-react";
import { useAdminLayout } from "@/components/admin/AdminWorkspaceLayout";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { adminService } from "@/service/admin.service";
import { AdminReportItem, ReportReasonType, ReportStatus } from "@/types/admin";

export default function AdminReportsPage() {
  const { toggleMobileMenu } = useAdminLayout();

  const [reports, setReports] = useState<AdminReportItem[]>([]);
  const [stats, setStats] = useState({
    pending: 0,
    resolved: 0,
    dismissed: 0,
    total: 0,
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalItems: 0,
    totalPages: 1,
  });

  const [activeTab, setActiveTab] = useState<string>("PENDING");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedReason, setSelectedReason] = useState<string>("ALL");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Modals state
  const [actionReport, setActionReport] = useState<AdminReportItem | null>(null);
  const [actionType, setActionType] = useState<"HIDE_LISTING" | "WARN_LANDLORD" | "LOCK_LANDLORD" | "DISMISS" | null>(null);
  const [actionNotes, setActionNotes] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [inspectReport, setInspectReport] = useState<AdminReportItem | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Toast
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Fetch Reports from API
  const fetchReports = useCallback(async (pageToLoad = 1, silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const res = await adminService.getReports({
        page: pageToLoad,
        limit: 10,
        status: activeTab !== "ALL" ? activeTab : undefined,
        reason: selectedReason !== "ALL" ? selectedReason : undefined,
        search: searchQuery.trim() || undefined,
      });

      if (res && res.data) {
        setReports(res.data);
        if (res.stats) {
          setStats(res.stats);
        }
        if (res.pagination) {
          setPagination(res.pagination);
        }
      }
    } catch (err: any) {
      showToast(err.message || "Không thể tải danh sách báo cáo vi phạm.", "error");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [activeTab, selectedReason, searchQuery]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchReports(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchReports]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchReports(pagination.page, true);
  };

  // Handlers
  const handleOpenActionModal = (report: AdminReportItem, type: "HIDE_LISTING" | "WARN_LANDLORD" | "LOCK_LANDLORD" | "DISMISS") => {
    setActionReport(report);
    setActionType(type);
    if (type === "HIDE_LISTING") {
      setActionNotes("Vi phạm nặng: Thông tin phòng lừa dối người thuê / Phát hiện sai phạm nghiêm trọng khi xem phòng. Đã gỡ tin ngay lập tức khỏi sàn Nestrivo.");
    } else if (type === "WARN_LANDLORD") {
      setActionNotes("Cảnh báo vi phạm nhẹ: Yêu cầu chủ nhà kiểm tra và cập nhật lại thông số phòng chính xác trong vòng 24 giờ. Quá 24 giờ tin sẽ tự động bị gỡ.");
    } else if (type === "LOCK_LANDLORD") {
      setActionNotes("Khóa tài khoản chủ nhà do vi phạm chính sách tiền cọc và thông tin ảo nghiêm trọng.");
    } else {
      setActionNotes("Bác bỏ: Thông tin phòng trọ hợp lệ, người thuê hiểu nhầm chính sách niêm yết.");
    }
  };

  const handleConfirmAction = async () => {
    if (!actionReport || !actionType) return;
    setIsProcessing(true);
    try {
      const res = await adminService.resolveReport(actionReport.id, actionType, actionNotes);
      showToast(res.message, "success");
      setActionReport(null);
      await fetchReports(pagination.page, true);
      if (inspectReport?.id === actionReport.id) {
        setInspectReport(null);
      }
    } catch (err: any) {
      showToast(err.message || "Lỗi khi xử lý báo cáo vi phạm.", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  const formatDate = (isoString?: string | null) => {
    if (!isoString) return "Vừa xong";
    try {
      const d = new Date(isoString);
      return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")} - ${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1).toString().padStart(2, "0")}/${d.getFullYear()}`;
    } catch {
      return "Vừa xong";
    }
  };

  const REASON_COLORS: Record<string, { bg: string; text: string; border: string }> = {
    WRONG_PRICE: { bg: "bg-rose-50", text: "text-rose-800", border: "border-rose-200" },
    FAKE_IMAGES: { bg: "bg-purple-50", text: "text-purple-800", border: "border-purple-200" },
    INCORRECT_AMENITIES: { bg: "bg-amber-50", text: "text-amber-800", border: "border-amber-200" },
    WRONG_ADDRESS: { bg: "bg-blue-50", text: "text-blue-800", border: "border-blue-200" },
    ALREADY_RENTED: { bg: "bg-[#FFF1CC]", text: "text-[#805B10]", border: "border-[#F4CD65]/40" },
    MISLEADING_INFO: { bg: "bg-orange-50", text: "text-orange-800", border: "border-orange-200" },
    SCAM: { bg: "bg-red-100", text: "text-red-900", border: "border-red-300" },
    OTHER: { bg: "bg-slate-100", text: "text-slate-800", border: "border-slate-200" },
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#FFFAEF]/40 min-h-screen">
      {/* Header */}
      <AdminHeader
        onToggleMobileMenu={toggleMobileMenu}
        title="Quản lý báo cáo vi phạm"
        subtitle="Xử lý phản ánh từ người thuê: Ẩn tin rác, kiểm tra ảnh thực tế, cảnh cáo chủ nhà và bảo vệ giá trị thật"
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        placeholder="Tìm theo tin đăng, chủ nhà, người báo cáo..."
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
      />

      {/* Main Container */}
      <main className="flex-1 px-4 sm:px-6 lg:px-8 xl:px-10 py-6 sm:py-8 space-y-6 w-full max-w-[1920px] mx-auto">
        
        {/* Toast Alert */}
        {toast && (
          <div
            className={`fixed top-20 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl shadow-xl border animate-in slide-in-from-top-3 duration-200 ${
              toast.type === "success"
                ? "bg-[#292524] text-white border-stone-700"
                : "bg-rose-600 text-white border-rose-700"
            }`}
          >
            {toast.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-[#F4CD65]" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-white" />
            )}
            <span className="text-xs sm:text-sm font-medium">{toast.message}</span>
          </div>
        )}

        {/* ========================================================= */}
        {/* 1. KPI SUMMARY CARDS                                      */}
        {/* ========================================================= */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
          <button
            type="button"
            onClick={() => setActiveTab("PENDING")}
            className={`text-left p-4 sm:p-5 rounded-3xl bg-white border border-[#EDE5D5] transition-all cursor-pointer hover:border-rose-300 ${
              activeTab === "PENDING" ? "ring-2 ring-rose-400 bg-rose-50/50 shadow-xs" : ""
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 border border-rose-200 flex items-center justify-center text-rose-700">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
              </div>
              <span className="text-2xl sm:text-3xl font-bold text-rose-700">{stats.pending}</span>
            </div>
            <p className="text-xs sm:text-sm font-semibold text-[#292524]">Chờ xử lý (Cần giải quyết)</p>
            <p className="text-[11px] text-[#57534E] mt-0.5">Báo cáo vi phạm đang chờ xác minh</p>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("RESOLVED")}
            className={`text-left p-4 sm:p-5 rounded-3xl bg-white border border-[#EDE5D5] transition-all cursor-pointer hover:border-[#DCA936] ${
              activeTab === "RESOLVED" ? "ring-2 ring-[#F4CD65] bg-[#FFF7E5] shadow-xs" : ""
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-2xl bg-[#FFF1CC] border border-[#F4CD65]/40 flex items-center justify-center text-[#805B10]">
                <CheckCircle2 className="w-5 h-5 text-[#DCA936]" />
              </div>
              <span className="text-2xl sm:text-3xl font-bold text-[#292524]">{stats.resolved}</span>
            </div>
            <p className="text-xs sm:text-sm font-semibold text-[#292524]">Đã giải quyết (Resolved)</p>
            <p className="text-[11px] text-[#57534E] mt-0.5">Đã ẩn tin rác hoặc cảnh báo chủ nhà</p>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("DISMISSED")}
            className={`text-left p-4 sm:p-5 rounded-3xl bg-white border border-[#EDE5D5] transition-all cursor-pointer hover:border-[#DCA936] ${
              activeTab === "DISMISSED" ? "ring-2 ring-[#EDE5D5] bg-[#FFF7E5] shadow-xs" : ""
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-2xl bg-white border border-[#EDE5D5] flex items-center justify-center text-[#57534E]">
                <XCircle className="w-5 h-5 text-[#A8A29E]" />
              </div>
              <span className="text-2xl sm:text-3xl font-bold text-[#292524]">{stats.dismissed}</span>
            </div>
            <p className="text-xs sm:text-sm font-semibold text-[#292524]">Đã bác bỏ (Dismissed)</p>
            <p className="text-[11px] text-[#57534E] mt-0.5">Báo cáo sai hoặc không đủ chứng cứ</p>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("ALL")}
            className={`text-left p-4 sm:p-5 rounded-3xl bg-white border border-[#EDE5D5] transition-all cursor-pointer hover:border-[#DCA936] ${
              activeTab === "ALL" ? "ring-2 ring-[#292524] bg-[#FFF7E5] shadow-xs" : ""
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-2xl bg-white border border-[#EDE5D5] flex items-center justify-center text-[#57534E]">
                <AlertOctagon className="w-5 h-5 text-[#292524]" />
              </div>
              <span className="text-2xl sm:text-3xl font-bold text-[#292524]">{stats.total}</span>
            </div>
            <p className="text-xs sm:text-sm font-semibold text-[#292524]">Tổng lượt báo cáo</p>
            <p className="text-[11px] text-[#57534E] mt-0.5">Toàn bộ lịch sử khiếu nại sàn</p>
          </button>
        </section>

        {/* ========================================================= */}
        {/* 1b. QUY CHẾ XỬ LÝ VI PHẠM (2 CẤP ĐỘ RÕ RÀNG)             */}
        {/* ========================================================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {/* Cấp độ 1: Vi phạm nhẹ */}
          <div className="p-4 rounded-3xl bg-amber-50/70 border border-amber-200/90 text-amber-950 space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-amber-200 text-amber-900 font-bold text-xs flex items-center justify-center">1</span>
              <h4 className="font-bold text-xs text-amber-950 uppercase tracking-wide">Vi phạm nhẹ (Sai sót thông tin)</h4>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-200 text-amber-900">Gia hạn 24h</span>
            </div>
            <p className="text-xs text-amber-900 leading-relaxed">
              <strong>Hành vi:</strong> Gõ nhầm giá điện/nước, thiếu thông tin gác lửng/nội thất, tiện ích tạm bảo trì...
            </p>
            <p className="text-[11px] text-amber-800 leading-relaxed">
              👉 <strong>Xử lý:</strong> Chọn <em>Cảnh báo (24h)</em>. Tin vẫn tạm hiện trong 24h để chủ nhà kịp sửa lại thông số. Quá 24h không sửa hệ thống sẽ <strong>tự động gỡ tin</strong>.
            </p>
          </div>

          {/* Cấp độ 2: Vi phạm nặng */}
          <div className="p-4 rounded-3xl bg-rose-50/70 border border-rose-200/90 text-rose-950 space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-rose-200 text-rose-900 font-bold text-xs flex items-center justify-center">2</span>
              <h4 className="font-bold text-xs text-rose-950 uppercase tracking-wide">Vi phạm nặng (Lừa dối người thuê)</h4>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-200 text-rose-900">Gỡ tin ngay</span>
            </div>
            <p className="text-xs text-rose-900 leading-relaxed">
              <strong>Hành vi:</strong> Tráo phòng khi xem (&ldquo;treo đầu dê bán thịt chó&rdquo;), phụ phí ẩn trên trời ép khách, ảnh giả 100%, lừa cọc...
            </p>
            <p className="text-[11px] text-rose-800 leading-relaxed">
              👉 <strong>Xử lý:</strong> Chọn <em>Gỡ tin ngay</em>. Tin bị <strong>gỡ lập tức khỏi sàn Nestrivo</strong> để bảo vệ an toàn cho người thuê.
            </p>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 2. FILTER TOOLBAR                                         */}
        {/* ========================================================= */}
        <div className="p-4 rounded-3xl bg-white border border-[#EDE5D5] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {[
              { id: "PENDING", label: "Chờ xử lý", count: stats.pending },
              { id: "RESOLVED", label: "Đã giải quyết", count: stats.resolved },
              { id: "DISMISSED", label: "Đã bác bỏ", count: stats.dismissed },
              { id: "ALL", label: "Tất cả", count: stats.total },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3.5 py-1.5 rounded-2xl text-xs font-medium transition-all shrink-0 cursor-pointer flex items-center gap-1.5 border ${
                    isActive
                      ? "bg-[#F4CD65] text-[#292524] border-[#DCA936] font-semibold shadow-2xs"
                      : "bg-[#FFFAEF] text-[#57534E] border-[#EDE5D5] hover:bg-[#FFF7E5] hover:text-[#292524]"
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isActive ? "bg-[#292524]/10 text-[#292524] font-semibold" : "bg-white text-[#57534E] border border-[#EDE5D5]"}`}>
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-[#57534E] font-medium hidden sm:inline">Lý do vi phạm:</span>
            <select
              value={selectedReason}
              onChange={(e) => setSelectedReason(e.target.value)}
              className="bg-[#FFFAEF] border border-[#EDE5D5] rounded-xl px-3 py-1.5 text-xs font-medium text-[#292524] focus:outline-none cursor-pointer"
            >
              <option value="ALL">Tất cả lý do</option>
              <option value="FAKE_IMAGES">Hình ảnh không đúng thực tế</option>
              <option value="WRONG_PRICE">Báo sai giá niêm yết</option>
              <option value="INCORRECT_AMENITIES">Diện tích, tiện ích không đúng</option>
              <option value="WRONG_ADDRESS">Địa chỉ không chính xác</option>
              <option value="ALREADY_RENTED">Phòng đã có người thuê</option>
              <option value="MISLEADING_INFO">Thông tin gây hiểu nhầm</option>
              <option value="SCAM">Lừa đảo tiền cọc</option>
              <option value="OTHER">Vi phạm quy chế khác</option>
            </select>

            <button
              type="button"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-1.5 rounded-xl border border-[#EDE5D5] bg-[#FFFAEF] hover:bg-[#FFF7E5] text-[#292524] transition-colors ml-1"
              title="Làm mới dữ liệu"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin text-[#DCA936]" : ""}`} />
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 3. REPORTS LIST                                           */}
        {/* ========================================================= */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="p-16 text-center space-y-3 bg-white rounded-3xl border border-[#EDE5D5]">
              <RefreshCw className="w-8 h-8 animate-spin text-[#DCA936] mx-auto" />
              <p className="text-sm font-medium text-[#57534E]">Đang tải danh sách báo cáo vi phạm...</p>
            </div>
          ) : reports.length > 0 ? (
            reports.map((item) => {
              const reasonStyle = REASON_COLORS[item.reason] || REASON_COLORS.OTHER;
              const isPending = item.status === "PENDING";
              const isResolved = item.status === "RESOLVED";

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-3xl border border-[#EDE5D5] p-5 sm:p-6 shadow-xs hover:border-[#DCA936] transition-all space-y-4"
                >
                  {/* Top Bar: Target Listing + Status Badge */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#EDE5D5]/60">
                    <div className="flex items-center gap-3">
                      <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-[#FFF7E5] border border-[#EDE5D5] shrink-0">
                        <img
                          src={item.listingThumbnailUrl || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=150"}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-[#292524] text-sm truncate">{item.listingTitle}</p>
                          <Link
                            href={`/listings/${item.listingId}`}
                            target="_blank"
                            className="text-[#DCA936] hover:text-[#805B10] shrink-0"
                            title="Xem tin đăng thực tế"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                        <p className="text-xs text-[#57534E] truncate">
                          Chủ nhà: <b className="font-semibold text-[#292524]">{item.landlordName}</b> • SĐT: {item.landlordPhone}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`px-2.5 py-1 rounded-xl text-xs font-medium border ${reasonStyle.bg} ${reasonStyle.text} ${reasonStyle.border}`}>
                        {item.reasonLabel}
                      </span>
                      {isPending && (
                        <span className="px-2.5 py-1 rounded-xl text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse" />
                          Chờ xử lý
                        </span>
                      )}
                      {isResolved && (
                        <span className="px-2.5 py-1 rounded-xl text-xs font-medium bg-[#FFF1CC] text-[#805B10] border border-[#F4CD65]/40 flex items-center gap-1">
                          <Check className="w-3.5 h-3.5 text-[#16A34A]" />
                          Đã xử lý
                        </span>
                      )}
                      {item.status === "DISMISSED" && (
                        <span className="px-2.5 py-1 rounded-xl text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                          Đã bác bỏ
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 text-xs">
                    {/* Column 1 & 2: Report Description & Evidence Images */}
                    <div className="lg:col-span-2 space-y-3">
                      <div className="p-3.5 rounded-2xl bg-[#FFFAEF] border border-[#EDE5D5] space-y-1.5">
                        <span className="font-semibold text-[#292524] block">Nội dung phản ánh từ người xem phòng:</span>
                        <p className="text-[#57534E] leading-relaxed text-xs sm:text-sm whitespace-pre-line">
                          {item.description}
                        </p>
                      </div>

                      {/* Evidence Images */}
                      {item.evidenceUrls && item.evidenceUrls.length > 0 && (
                        <div className="space-y-1.5">
                          <span className="font-semibold text-[#292524] flex items-center gap-1.5">
                            <ImageIcon className="w-3.5 h-3.5 text-[#DCA936]" />
                            <span>Hình ảnh bằng chứng thực tế khi đi xem phòng ({item.evidenceUrls.length}):</span>
                          </span>
                          <div className="flex flex-wrap gap-2 pt-1">
                            {item.evidenceUrls.map((url, idx) => (
                              <div
                                key={idx}
                                onClick={() => setPreviewImage(url)}
                                className="relative w-20 h-20 rounded-xl overflow-hidden border border-[#EDE5D5] cursor-pointer hover:opacity-90 hover:scale-105 transition-all group"
                              >
                                <img src={url} alt="Bằng chứng" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                  <Eye className="w-4 h-4 text-white" />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Resolution details if already processed */}
                      {item.adminNote && (
                        <div className="space-y-2">
                          {item.resolutionAction === "WARN_LANDLORD" ? (
                            item.isFixed ? (
                              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-950 space-y-1">
                                <div className="flex items-center justify-between gap-1.5 font-bold text-xs text-emerald-800">
                                  <div className="flex items-center gap-1.5">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                    <span>Cảnh báo nhẹ: Chủ nhà ĐÃ CẬP NHẬT LẠI TIN ĐĂNG</span>
                                  </div>
                                  <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-200 text-emerald-900 font-bold">
                                    Đã khắc phục
                                  </span>
                                </div>
                                <p className="text-xs text-emerald-900 font-medium">{item.adminNote}</p>
                                <p className="text-[10px] text-emerald-700">Xử lý lúc: {formatDate(item.resolvedAt)}</p>
                              </div>
                            ) : item.isExpired ? (
                              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-300 text-rose-950 space-y-1">
                                <div className="flex items-center justify-between gap-1.5 font-bold text-xs text-rose-800">
                                  <div className="flex items-center gap-1.5">
                                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                                    <span>Quá hạn 24h: HỆ THỐNG ĐÃ TỰ ĐỘNG GỠ TIN</span>
                                  </div>
                                  <span className="px-2 py-0.5 rounded-full text-[10px] bg-rose-200 text-rose-900 font-bold">
                                    Đã ẩn tin
                                  </span>
                                </div>
                                <p className="text-xs text-rose-900 font-medium">{item.adminNote}</p>
                                <p className="text-[10px] text-rose-700">Hết hạn lúc: {formatDate(item.warningExpiresAt)}</p>
                              </div>
                            ) : (
                              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-300 text-amber-950 space-y-1">
                                <div className="flex items-center justify-between gap-1.5 font-bold text-xs text-amber-900">
                                  <div className="flex items-center gap-1.5">
                                    <Clock className="w-4 h-4 text-amber-600 animate-pulse" />
                                    <span>Đang gia hạn 24h: Còn lại {item.remainingHours ?? 24}h {item.remainingMinutes ?? 0}p để sửa</span>
                                  </div>
                                  <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-200 text-amber-900 font-bold">
                                    Tin vẫn hiển thị
                                  </span>
                                </div>
                                <p className="text-xs text-amber-900 font-medium">{item.adminNote}</p>
                                <p className="text-[10px] text-amber-700">Hạn chót: {formatDate(item.warningExpiresAt)}</p>
                              </div>
                            )
                          ) : item.resolutionAction === "HIDE_LISTING" ? (
                            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-950 space-y-1">
                              <div className="flex items-center justify-between gap-1.5 font-bold text-xs text-rose-800">
                                <div className="flex items-center gap-1.5">
                                  <EyeOff className="w-4 h-4 text-rose-600" />
                                  <span>Vi phạm nặng: ĐÃ GỠ / ẨN TIN NGAY LẬP TỨC</span>
                                </div>
                                <span className="px-2 py-0.5 rounded-full text-[10px] bg-rose-200 text-rose-900 font-bold">
                                  Đã gỡ khỏi sàn
                                </span>
                              </div>
                              <p className="text-xs text-rose-900 font-medium">{item.adminNote}</p>
                              <p className="text-[10px] text-rose-700">Xử lý lúc: {formatDate(item.resolvedAt)}</p>
                            </div>
                          ) : (
                            <div className="p-3.5 rounded-2xl bg-[#FFF1CC]/60 border border-[#F4CD65]/50 text-[#805B10] space-y-1">
                              <div className="flex items-center gap-1.5 font-semibold text-xs">
                                <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
                                <span>Kết luận xử lý ({item.resolutionAction}):</span>
                              </div>
                              <p className="text-xs text-[#292524]">{item.adminNote}</p>
                              <p className="text-[10px] text-[#78716C]">Xử lý lúc: {formatDate(item.resolvedAt)}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Column 3: Reporter Contact & Meta Info */}
                    <div className="p-4 rounded-2xl bg-white border border-[#EDE5D5] space-y-2.5 h-fit">
                      <p className="font-semibold text-[#292524] pb-1.5 border-b border-[#EDE5D5]">Thông tin người báo cáo</p>
                      <div className="space-y-1.5 text-[11px] text-[#57534E]">
                        <p className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-[#A8A29E]" />
                          <span>Họ tên: <b className="text-[#292524]">{item.reporterName}</b></span>
                        </p>
                        <p className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-[#A8A29E]" />
                          <span>SĐT: <b className="text-[#292524]">{item.reporterPhone}</b></span>
                        </p>
                        <p className="flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-[#A8A29E]" />
                          <span className="truncate">Email: {item.reporterEmail}</span>
                        </p>

                        {/* Thống kê lịch sử người gửi để Admin nhận biết spammer / đối thủ dìm hàng */}
                        <div className="flex flex-wrap items-center gap-1.5 pt-1.5">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-stone-100 text-stone-700 border border-stone-200">
                            Đã gửi: <strong>{item.reporterTotalReports ?? 1}</strong> báo cáo
                          </span>
                          {(item.reporterDismissedReports ?? 0) > 0 ? (
                            <span 
                              className="px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200"
                              title="Số lần gửi báo cáo sai bị Admin bác bỏ"
                            >
                              ⚠️ {item.reporterDismissedReports} bị bác bỏ
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                              Uy tín tốt
                            </span>
                          )}
                        </div>

                        <p className="flex items-center gap-1.5 pt-1 text-[10px] text-[#78716C]">
                          <Clock className="w-3 h-3 text-[#A8A29E]" />
                          <span>Gửi lúc: {formatDate(item.createdAt)}</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  {isPending && (
                    <div className="flex flex-wrap items-center justify-end gap-2 pt-3 border-t border-[#EDE5D5]/60">
                      {/* Bác bỏ */}
                      <button
                        type="button"
                        onClick={() => handleOpenActionModal(item, "DISMISS")}
                        className="px-3.5 py-1.5 rounded-xl border border-[#EDE5D5] bg-[#FFFAEF] hover:bg-[#FFF7E5] text-xs font-medium text-[#57534E] cursor-pointer"
                      >
                        Bác bỏ (Hợp lệ)
                      </button>

                      {/* Vi phạm nhẹ: Cảnh báo gia hạn 24h */}
                      <button
                        type="button"
                        onClick={() => handleOpenActionModal(item, "WARN_LANDLORD")}
                        className="px-3.5 py-1.5 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-xs font-bold text-amber-900 flex items-center gap-1.5 cursor-pointer shadow-2xs"
                      >
                        <Clock className="w-3.5 h-3.5 text-amber-700" />
                        <span>Vi phạm nhẹ: Cảnh báo (24h)</span>
                      </button>

                      {/* Vi phạm nặng: Ẩn tin ngay lập tức */}
                      <button
                        type="button"
                        onClick={() => handleOpenActionModal(item, "HIDE_LISTING")}
                        className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer"
                      >
                        <EyeOff className="w-3.5 h-3.5" />
                        <span>Vi phạm nặng: Gỡ tin ngay</span>
                      </button>

                      {/* Khóa tài khoản nếu lừa cọc */}
                      {item.reason === "SCAM" && (
                        <button
                          type="button"
                          onClick={() => handleOpenActionModal(item, "LOCK_LANDLORD")}
                          className="px-3.5 py-1.5 rounded-xl bg-[#292524] hover:bg-black text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer"
                        >
                          <Lock className="w-3.5 h-3.5" />
                          <span>Khóa chủ nhà</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="p-16 text-center space-y-3 bg-white rounded-3xl border border-[#EDE5D5]">
              <div className="w-12 h-12 rounded-2xl bg-[#FFF1CC] text-[#DCA936] flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-semibold text-[#292524]">Không có báo cáo vi phạm nào</h3>
              <p className="text-xs text-[#57534E]">Tất cả các tin đăng hiện tại đều đang tuân thủ tốt quy chế sàn.</p>
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="px-4 py-3.5 border border-[#EDE5D5] rounded-3xl bg-white flex items-center justify-between">
              <span className="text-xs text-[#57534E]">
                Trang <b className="text-[#292524]">{pagination.page}</b> / <b>{pagination.totalPages}</b> (Tổng cộng {pagination.totalItems} báo cáo)
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={pagination.page <= 1}
                  onClick={() => fetchReports(pagination.page - 1)}
                  className="p-1.5 rounded-xl border border-[#EDE5D5] bg-[#FFFAEF] text-xs font-medium text-[#292524] hover:bg-[#FFF7E5] disabled:opacity-40"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => fetchReports(pagination.page + 1)}
                  className="p-1.5 rounded-xl border border-[#EDE5D5] bg-[#FFFAEF] text-xs font-medium text-[#292524] hover:bg-[#FFF7E5] disabled:opacity-40"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ========================================================= */}
        {/* 4. MODAL: RESOLVE / ACTION DIALOG                         */}
        {/* ========================================================= */}
        {actionReport && actionType && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
            onClick={() => setActionReport(null)}
          >
            <div
              className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-[#EDE5D5] overflow-hidden p-6 space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#EDE5D5]">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                    actionType === "LOCK_LANDLORD" || actionType === "HIDE_LISTING"
                      ? "bg-rose-100 text-rose-700"
                      : actionType === "WARN_LANDLORD"
                      ? "bg-amber-100 text-amber-800"
                      : "bg-[#FFF1CC] text-[#805B10]"
                  }`}>
                    {actionType === "HIDE_LISTING" && <EyeOff className="w-4 h-4" />}
                    {actionType === "LOCK_LANDLORD" && <Lock className="w-4 h-4" />}
                    {actionType === "WARN_LANDLORD" && <AlertTriangle className="w-4 h-4" />}
                    {actionType === "DISMISS" && <XCircle className="w-4 h-4" />}
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-[#292524]">
                      {actionType === "HIDE_LISTING" && "Gỡ / Ẩn tin ngay lập tức (Vi phạm nặng)"}
                      {actionType === "WARN_LANDLORD" && "Cảnh báo vi phạm nhẹ (Gia hạn 24h để sửa)"}
                      {actionType === "LOCK_LANDLORD" && "Khóa tài khoản chủ nhà"}
                      {actionType === "DISMISS" && "Bác bỏ khiếu nại báo cáo"}
                    </h3>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActionReport(null)}
                  className="p-1 rounded-lg text-[#78716C] hover:text-[#292524]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Policy explanation banner */}
              {actionType === "WARN_LANDLORD" && (
                <div className="p-3 rounded-2xl bg-amber-50 border border-amber-300 text-xs text-amber-950 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-amber-900">
                    <Clock className="w-3.5 h-3.5 text-amber-700" />
                    <span>Quy chế 24h tự động gỡ tin:</span>
                  </div>
                  <p className="text-[11px] text-amber-900/90 leading-relaxed">
                    Tin đăng vẫn tạm hiển thị trên Nestrivo trong 24h để chủ nhà kịp vào sửa lại thông số. Nếu sau 24h không sửa, hệ thống sẽ <strong>tự động gỡ tin khỏi sàn</strong>.
                  </p>
                </div>
              )}

              {actionType === "HIDE_LISTING" && (
                <div className="p-3 rounded-2xl bg-rose-50 border border-rose-300 text-xs text-rose-950 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-rose-900">
                    <EyeOff className="w-3.5 h-3.5 text-rose-700" />
                    <span>Ẩn tin ngay lập tức:</span>
                  </div>
                  <p className="text-[11px] text-rose-900/90 leading-relaxed">
                    Tin đăng sẽ bị <strong>gỡ lập tức khỏi sàn Nestrivo</strong>. Khách thuê sẽ không thể xem hoặc đặt lịch hẹn nữa.
                  </p>
                </div>
              )}

              <div className="p-3 rounded-2xl bg-[#FFFAEF] border border-[#EDE5D5] text-xs space-y-1">
                <p className="font-semibold text-[#292524] truncate">{actionReport.listingTitle}</p>
                <p className="text-[#57534E]">Chủ nhà: {actionReport.landlordName} • {actionReport.landlordPhone}</p>
                <p className="text-rose-700 font-medium">Lý do báo cáo: {actionReport.reasonLabel}</p>
              </div>

              {/* Quick Template Chips */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold text-[#78716C] block">Mẫu ghi chú nhanh gợi ý:</span>
                <div className="flex flex-wrap gap-1.5">
                  {actionType === "WARN_LANDLORD" && (
                    <>
                      <button
                        type="button"
                        onClick={() => setActionNotes("Sai sót giá điện/nước: Giá điện/nước thực tế khác với mức niêm yết. Yêu cầu chủ nhà kiểm tra và chỉnh sửa lại đúng biểu phí trong vòng 24 giờ.")}
                        className="px-2 py-1 rounded-lg text-[10px] font-medium bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 cursor-pointer"
                      >
                        ⚡ Sai sót tiền điện/nước
                      </button>
                      <button
                        type="button"
                        onClick={() => setActionNotes("Thiếu thông tin gác lửng/nội thất hoặc giờ giấc: Thông tin phòng chưa đầy đủ thực tế. Yêu cầu bổ sung chính xác trong vòng 24 giờ.")}
                        className="px-2 py-1 rounded-lg text-[10px] font-medium bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 cursor-pointer"
                      >
                        📐 Thiếu gác lửng / nội thất
                      </button>
                      <button
                        type="button"
                        onClick={() => setActionNotes("Tiện ích tạm gián đoạn: Tiện ích niêm yết đang bảo trì hoặc chưa sẵn sàng. Yêu cầu chủ nhà ghi chú rõ trong bài đăng trong vòng 24 giờ.")}
                        className="px-2 py-1 rounded-lg text-[10px] font-medium bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 cursor-pointer"
                      >
                        🔧 Tiện ích tạm bảo trì
                      </button>
                    </>
                  )}

                  {actionType === "HIDE_LISTING" && (
                    <>
                      <button
                        type="button"
                        onClick={() => setActionNotes("Tráo phòng khi xem: Dẫn khách sang phòng khác không đúng mô tả và hình ảnh ('treo đầu dê bán thịt chó'). Ban quản trị gỡ tin ngay lập tức.")}
                        className="px-2 py-1 rounded-lg text-[10px] font-medium bg-rose-50 hover:bg-rose-100 text-rose-900 border border-rose-200 cursor-pointer"
                      >
                        🚪 Tráo phòng khi xem
                      </button>
                      <button
                        type="button"
                        onClick={() => setActionNotes("Phụ phí ẩn trên trời: Phát sinh nhiều phụ phí ép buộc vô lý đội giá phòng khi khách đến xem. Ban quản trị gỡ tin ngay lập tức.")}
                        className="px-2 py-1 rounded-lg text-[10px] font-medium bg-rose-50 hover:bg-rose-100 text-rose-900 border border-rose-200 cursor-pointer"
                      >
                        💸 Phụ phí ẩn trên trời
                      </button>
                      <button
                        type="button"
                        onClick={() => setActionNotes("Địa chỉ ma / Hình ảnh giả 100%: Phòng trọ không có thật hoặc dùng ảnh giả lừa cọc. Ban quản trị gỡ tin ngay lập tức.")}
                        className="px-2 py-1 rounded-lg text-[10px] font-medium bg-rose-50 hover:bg-rose-100 text-rose-900 border border-rose-200 cursor-pointer"
                      >
                        📍 Địa chỉ ma / Ảnh giả
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#292524] block mb-1">
                  Ghi chú kết luận của Quản trị viên <span className="text-rose-600">*</span>
                </label>
                <textarea
                  rows={3}
                  value={actionNotes}
                  onChange={(e) => setActionNotes(e.target.value)}
                  placeholder="Ghi rõ lý do xử lý hoặc yêu cầu chỉnh sửa gửi đến chủ nhà..."
                  className="w-full p-3 rounded-xl border border-[#EDE5D5] bg-[#FFFAEF] text-xs text-[#292524] focus:outline-none focus:border-[#DCA936] focus:bg-white resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#EDE5D5]">
                <button
                  type="button"
                  onClick={() => setActionReport(null)}
                  disabled={isProcessing}
                  className="px-4 py-2 rounded-xl border border-[#EDE5D5] text-xs font-medium text-[#57534E] hover:bg-[#FFF7E5]"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleConfirmAction}
                  disabled={isProcessing || !actionNotes.trim()}
                  className={`px-5 py-2 rounded-xl text-xs font-semibold text-white shadow-xs disabled:opacity-50 ${
                    actionType === "LOCK_LANDLORD" || actionType === "HIDE_LISTING"
                      ? "bg-rose-600 hover:bg-rose-700"
                      : actionType === "WARN_LANDLORD"
                      ? "bg-amber-600 hover:bg-amber-700"
                      : "bg-[#292524] hover:bg-[#44403C]"
                  }`}
                >
                  {isProcessing ? "Đang xử lý..." : "Xác nhận xử lý"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* 5. MODAL: IMAGE EVIDENCE LIGHTBOX                         */}
        {/* ========================================================= */}
        {previewImage && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setPreviewImage(null)}
          >
            <div className="relative max-w-3xl max-h-[85vh] overflow-hidden rounded-2xl bg-black" onClick={(e) => e.stopPropagation()}>
              <img src={previewImage} alt="Ảnh bằng chứng" className="max-w-full max-h-[85vh] object-contain" />
              <button
                type="button"
                onClick={() => setPreviewImage(null)}
                className="absolute top-3 right-3 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/90"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
