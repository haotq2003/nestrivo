"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { 
  Building2, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  MessageSquare, 
  Heart, 
  PlusCircle, 
  ShieldCheck, 
  Sparkles, 
  RefreshCw,
  Loader2,
  Flag,
  ArrowRight,
  ExternalLink,
  X,
  ShieldAlert,
  Home
} from "lucide-react";
import { LandlordHeader } from "@/components/landlord/layout/LandlordHeader";
import { useLandlordLayout } from "@/components/landlord/layout/LandlordWorkspaceLayout";
import { ListingManagementTable } from "@/components/landlord/listings/ListingManagementTable";
import { EmptyListingsState } from "@/components/landlord/listings/EmptyListingsState";
import { PromoteListingModal } from "@/components/landlord/promotions/PromoteListingModal";
import { LandlordListingItem } from "@/types/landlord";
import { landlordService, LandlordReportItem } from "@/service/landlord.service";
import { promotionService } from "@/service/promotion.service";
import { formatVND } from "@/lib/utils";

export default function LandlordDashboardPage() {
  const { toggleMobileMenu } = useLandlordLayout();
  const [listings, setListings] = useState<LandlordListingItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [selectedListingForPromotion, setSelectedListingForPromotion] = useState<LandlordListingItem | null>(null);
  const [listingReports, setListingReports] = useState<LandlordReportItem[]>([]);
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
  const momoProcessedRef = useRef(false);

  // Check for MoMo redirect callback in URL
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (momoProcessedRef.current) return;

    let search = window.location.search;
    if (!search) return;

    if (search.includes("?")) {
      const firstQ = search.indexOf("?");
      search = search.substring(0, firstQ + 1) + search.substring(firstQ + 1).replace(/\?/g, "&");
    }
    const urlParams = new URLSearchParams(search);
    const orderCode = urlParams.get("orderId") || urlParams.get("orderCode");
    const resultCode = urlParams.get("resultCode");
    const payment = urlParams.get("payment");

    if (orderCode && (resultCode === "0" || payment === "success")) {
      momoProcessedRef.current = true;
      // Dọn dẹp URL ngay lập tức để tránh gọi lặp khi reload
      window.history.replaceState({}, "", "/landlord/dashboard");

      promotionService
        .handleMoMoReturn({
          orderCode,
          resultCode: resultCode || 0,
          transId: urlParams.get("transId") || undefined,
        })
        .then(() => {
          showToast("🎉 Thanh toán MoMo thành công! Gói Tin Nổi Bật đã được kích hoạt.");
          landlordService.getMyListings().then((res) => {
            if (Array.isArray(res.data)) setListings(res.data);
          });
        })
        .catch((err) => {
          console.warn("Xác nhận thanh toán MoMo:", err);
          // Tải lại danh sách phòng vì giao dịch đã được hệ thống ghi nhận thành công
          landlordService.getMyListings().then((res) => {
            if (Array.isArray(res.data)) setListings(res.data);
          });
        });
    }
  }, []);

  // Load real landlord listings from Database API
  useEffect(() => {
    let isMounted = true;
    const fetchMyListings = async () => {
      setIsLoading(true);
      try {
        const [listingsRes, reportsRes] = await Promise.allSettled([
          landlordService.getMyListings(),
          landlordService.getListingReports(),
        ]);

        if (isMounted) {
          if (listingsRes.status === "fulfilled" && Array.isArray(listingsRes.value.data)) {
            setListings(listingsRes.value.data);
          }
          if (reportsRes.status === "fulfilled" && reportsRes.value?.data) {
            setListingReports(reportsRes.value.data);
          }
        }
      } catch (err: unknown) {
        console.error("Lỗi khi tải danh sách phòng của chủ nhà:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchMyListings();
    return () => {
      isMounted = false;
    };
  }, []);

  // Filter listings by search query
  const displayedListings = listings.filter((item) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      item.address.toLowerCase().includes(q) ||
      item.district.toLowerCase().includes(q)
    );
  });

  // Action: Toggle availability (AVAILABLE <-> RENTED)
  const handleToggleAvailability = async (id: string) => {
    const target = listings.find((item) => item.id === id);
    if (!target) return;
    const nextStatus = target.availabilityStatus === "AVAILABLE" ? "RENTED" : "AVAILABLE";

    try {
      await landlordService.updateAvailability(id, nextStatus);
      setListings((prev) =>
        prev.map((item) => (item.id === id ? { ...item, availabilityStatus: nextStatus } : item))
      );
      showToast(
        nextStatus === "RENTED"
          ? `Đã cập nhật: Phòng "${target.title}" sang trạng thái ĐÃ CHO THUÊ.`
          : `Đã cập nhật: Phòng "${target.title}" sang trạng thái CÒN PHÒNG TRỐNG.`
      );
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Cập nhật trạng thái thất bại.");
    }
  };

  // Action: Toggle visibility (PUBLISHED <-> HIDDEN)
  const handleToggleVisibility = async (id: string) => {
    const target = listings.find((item) => item.id === id);
    if (!target) return;

    try {
      await landlordService.toggleVisibility(id);
      const nextStatus = target.status === "PUBLISHED" ? "HIDDEN" : "PUBLISHED";
      setListings((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status: nextStatus } : item))
      );
      showToast(
        nextStatus === "HIDDEN"
          ? `Đã tạm ẩn tin "${target.title}" khỏi kết quả tìm kiếm của người thuê.`
          : `Đã kích hoạt hiển thị lại tin "${target.title}" trên sàn Nestrivo.`
      );
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Cập nhật hiển thị thất bại.");
    }
  };

  // Action: Submit for review (from DRAFT or REJECTED -> PENDING_APPROVAL)
  const handleSubmitForReview = async (id: string) => {
    const target = listings.find((item) => item.id === id);
    if (!target) return;

    try {
      await landlordService.submitForReview(id);
      setListings((prev) =>
        prev.map((item) =>
          item.id === id
            ? { ...item, status: "PENDING_APPROVAL", rejectionReason: null, updatedAt: new Date().toISOString() }
            : item
        )
      );
      showToast(`Đã gửi tin "${target.title}" lên hệ thống. Admin sẽ kiểm duyệt trong vòng 24h.`);
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Gửi duyệt thất bại.");
    }
  };

  // Action: Delete listing (only DRAFT or REJECTED)
  const handleDeleteListing = async (id: string) => {
    const target = listings.find((l) => l.id === id);
    if (!target) return;
    if (confirm(`Bạn có chắc chắn muốn xóa tin "${target.title}"?`)) {
      try {
        await landlordService.deleteListing(id);
        setListings((prev) => prev.filter((item) => item.id !== id));
        showToast(`Đã xóa tin đăng "${target.title}".`);
      } catch (err: unknown) {
        showToast(err instanceof Error ? err.message : "Xóa tin thất bại.");
      }
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handlePromotionSuccess = () => {
    if (selectedListingForPromotion) {
      setListings((prev) =>
        prev.map((item) =>
          item.id === selectedListingForPromotion.id
            ? { ...item, currentTier: "VIP", priority: 2 }
            : item
        )
      );
      showToast(`Đã nâng cấp phòng "${selectedListingForPromotion.title}" lên mục Tin Nổi Bật thành công!`);
    }
  };

  // Calculations for KPI Cards
  const totalListings = displayedListings.length;
  const publishedListings = displayedListings.filter((l) => l.status === "PUBLISHED");
  const availableCount = publishedListings.filter((l) => l.availabilityStatus === "AVAILABLE").length;
  const pendingCount = displayedListings.filter((l) => l.status === "PENDING_APPROVAL").length;
  const rejectedCount = displayedListings.filter((l) => l.status === "REJECTED").length;
  const totalInquiries = displayedListings.reduce((sum, l) => sum + (l._count?.inquiries || 0), 0);
  const totalFavorites = displayedListings.reduce((sum, l) => sum + (l._count?.favorites || 0), 0);

  // Check if there is any rejected listing for top warning alert
  const rejectedListing = displayedListings.find((l) => l.status === "REJECTED");

  // Phân loại báo cáo vi phạm
  const activeReportWarnings = listingReports.filter(
    (r) => r.status === "RESOLVED" && (r.resolutionAction === "WARN_LANDLORD" || r.resolutionAction === "HIDE_LISTING")
  );
  const warningReports = listingReports.filter(
    (r) => r.status === "RESOLVED" && r.resolutionAction === "WARN_LANDLORD"
  );
  const active24hWarnings = warningReports.filter((r) => r.isWarningActive);
  const expiredWarnings = warningReports.filter((r) => r.isExpired);
  const hiddenViolations = listingReports.filter(
    (r) => r.status === "RESOLVED" && r.resolutionAction === "HIDE_LISTING"
  );

  const formatDate = (isoStr?: string | null) => {
    if (!isoStr) return "";
    try {
      const d = new Date(isoStr);
      return `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1).toString().padStart(2, "0")}/${d.getFullYear()}`;
    } catch {
      return isoStr;
    }
  };

  return (
    <>
      {/* Top Header */}
      <LandlordHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onToggleMobileMenu={toggleMobileMenu}
      />

      {/* Dashboard Content Container */}
      <main className="px-4 sm:px-6 lg:px-8 xl:px-10 pt-4 sm:pt-6 lg:pt-8 pb-24 sm:pb-28 lg:pb-32 space-y-6 w-full max-w-[1920px] mx-auto">
        {/* 1. Active 24h Warning Callout Banner (Vi phạm nhẹ - Gia hạn 24h) */}
        {active24hWarnings.length > 0 && (
          <div className="p-4 sm:p-5 rounded-3xl bg-amber-50/95 border-2 border-amber-300 text-amber-950 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-in fade-in">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-amber-200 text-amber-900 flex items-center justify-center shrink-0 mt-0.5">
                <Clock className="w-5 h-5 text-amber-800 animate-pulse" />
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-sm font-bold text-amber-950">
                    Cảnh báo vi phạm nhẹ: Cần chỉnh sửa lại tin ({active24hWarnings.length} tin cần xử lý)
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-200 text-amber-900 border border-amber-300">
                    ⏱️ Còn lại {active24hWarnings[0].remainingHours ?? 24}h {active24hWarnings[0].remainingMinutes ?? 0}p
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white/80 text-amber-800 border border-amber-200">
                    Tin vẫn tạm hiển thị
                  </span>
                </div>
                <p className="text-xs text-amber-900/90 leading-relaxed max-w-2xl">
                  Phòng <strong>&ldquo;{active24hWarnings[0].listingTitle}&rdquo;</strong> có phản ánh: <em>{active24hWarnings[0].reasonLabel}</em>.
                  {active24hWarnings[0].adminNote && (
                    <span className="block font-semibold mt-0.5 text-amber-950">
                      Chỉ đạo của BQT: &ldquo;{active24hWarnings[0].adminNote}&rdquo;
                    </span>
                  )}
                  <span className="block text-[11px] text-amber-800 italic mt-0.5">
                    Hạn chót: {formatDate(active24hWarnings[0].warningExpiresAt)}. Sau 24h hệ thống sẽ tự động gỡ tin khỏi sàn nếu bạn không cập nhật lại thông số.
                  </span>
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 shrink-0 self-end md:self-auto">
              <button
                type="button"
                onClick={() => setIsReportModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-white border border-amber-300 hover:bg-amber-100/70 text-amber-900 text-xs font-bold transition-all shadow-2xs cursor-pointer"
              >
                Xem chi tiết ({listingReports.length})
              </button>
              <Link
                href={`/landlord/listings/${active24hWarnings[0].listingId}/edit`}
                className="px-4 py-2 rounded-xl bg-[#292524] hover:bg-black text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
              >
                <span>Chỉnh sửa tin ngay</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}

        {/* 2. Expired 24h Warning Banner (Quá hạn 24h -> Đã tự động gỡ tin) */}
        {active24hWarnings.length === 0 && expiredWarnings.length > 0 && (
          <div className="p-4 sm:p-5 rounded-3xl bg-rose-50/95 border-2 border-rose-300 text-rose-950 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-in fade-in">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-rose-200 text-rose-900 flex items-center justify-center shrink-0 mt-0.5">
                <AlertTriangle className="w-5 h-5 text-rose-800" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-rose-950">
                    Tin đăng đã tự động bị gỡ do quá hạn 24h ({expiredWarnings.length} tin)
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-200 text-rose-900">
                    Đã chuyển sang ẨN
                  </span>
                </div>
                <p className="text-xs text-rose-900/90 leading-relaxed max-w-2xl">
                  Phòng <strong>&ldquo;{expiredWarnings[0].listingTitle}&rdquo;</strong> đã tự động bị tạm ẩn khỏi sàn do quá thời hạn 24 giờ mà chưa được cập nhật thông tin theo cảnh báo của BQT. Bạn có thể sửa lại thông số để đăng lại.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 shrink-0 self-end md:self-auto">
              <button
                type="button"
                onClick={() => setIsReportModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-white border border-rose-300 hover:bg-rose-100/70 text-rose-900 text-xs font-bold transition-all shadow-2xs cursor-pointer"
              >
                Xem chi tiết
              </button>
              <Link
                href={`/landlord/listings/${expiredWarnings[0].listingId}/edit`}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
              >
                <span>Sửa tin để đăng lại</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}

        {/* 3. Severe Violation Immediate Takedown Banner (Vi phạm nặng) */}
        {active24hWarnings.length === 0 && expiredWarnings.length === 0 && hiddenViolations.length > 0 && (
          <div className="p-4 sm:p-5 rounded-3xl bg-stone-100 border-2 border-stone-300 text-stone-900 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-in fade-in">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-stone-200 text-stone-800 flex items-center justify-center shrink-0 mt-0.5">
                <AlertTriangle className="w-5 h-5 text-stone-700" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-stone-900">
                    Tin đăng bị gỡ khỏi sàn do vi phạm quy chế nghiêm trọng ({hiddenViolations.length} tin)
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                    Vi phạm nặng
                  </span>
                </div>
                <p className="text-xs text-stone-600 leading-relaxed max-w-2xl">
                  Phòng <strong>&ldquo;{hiddenViolations[0].listingTitle}&rdquo;</strong> có phản ánh: <em>{hiddenViolations[0].reasonLabel}</em>. BQT đã gỡ tin ngay lập tức.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 shrink-0 self-end md:self-auto">
              <button
                type="button"
                onClick={() => setIsReportModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-white border border-stone-300 hover:bg-stone-200 text-stone-800 text-xs font-bold transition-all shadow-2xs cursor-pointer"
              >
                Xem chi tiết phản ánh
              </button>
            </div>
          </div>
        )}

        {/* Actionable Rejection Banner if any listing is REJECTED */}
        {rejectedListing && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200/90 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-rose-900 shadow-2xs">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0 mt-0.5">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold">
                  Bạn có 1 tin đăng cần chỉnh sửa theo yêu cầu của Admin
                </h3>
                <p className="text-xs text-rose-700/90 mt-0.5 line-clamp-1">
                  &quot;{rejectedListing.title}&quot; — {rejectedListing.rejectionReason}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleSubmitForReview(rejectedListing.id)}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shrink-0 min-h-[38px] flex items-center gap-1.5"
            >
              <span>Gửi duyệt lại ngay</span>
            </button>
          </div>
        )}

        {/* KPI Statistics Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Card 1: Total Listings */}
          <div className="bg-white p-4 sm:p-5 rounded-3xl border border-[#EDE5D5] space-y-2 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[#78716C]">Tổng số phòng</span>
              <div className="w-8 h-8 rounded-xl bg-[#FFF7E5] text-[#78716C] flex items-center justify-center">
                <Building2 className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-[#292524] tabular-nums">
              {totalListings}
            </div>
            <div className="text-[11px] font-normal text-[#78716C]">
              Bao gồm cả tin nháp &amp; chờ duyệt
            </div>
          </div>

          {/* Card 2: Published & Available */}
          <div className="bg-white p-4 sm:p-5 rounded-3xl border border-[#EDE5D5] space-y-2 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[#292524]">Đang hiển thị trên sàn</span>
              <div className="w-8 h-8 rounded-xl bg-[#FFF1CC] text-[#805B10] flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-[#DCA936]" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-[#292524] tabular-nums">
              {availableCount}
            </div>
            <div className="text-[11px] font-normal text-[#78716C]">
              {publishedListings.length} tin đã được duyệt
            </div>
          </div>

          {/* Card 3: Pending Approval */}
          <div className="bg-white p-4 sm:p-5 rounded-3xl border border-[#EDE5D5] space-y-2 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[#805B10]">Đang chờ kiểm duyệt</span>
              <div className="w-8 h-8 rounded-xl bg-[#FFF7E5] text-[#DCA936] flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-[#805B10] tabular-nums">
              {pendingCount}
            </div>
            <div className="text-[11px] font-normal text-[#78716C]">
              Xét duyệt trung bình &lt; 24h
            </div>
          </div>

          {/* Card 4: Inquiries & Favorites */}
          <div className="bg-white p-4 sm:p-5 rounded-3xl border border-[#EDE5D5] space-y-2 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[#78716C]">Tương tác khách thuê</span>
              <div className="w-8 h-8 rounded-xl bg-[#FFF7E5] text-[#292524] flex items-center justify-center">
                <MessageSquare className="w-4 h-4 text-[#DCA936]" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-[#292524] tabular-nums">
              {totalInquiries}
            </div>
            <div className="text-[11px] font-normal text-[#78716C] flex items-center gap-1.5">
              <span>{totalFavorites} lượt lưu phòng</span>
            </div>
          </div>
        </div>

        {/* Operational Listing Management Table / Mobile Cards */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-[#292524]">
                Danh mục phòng cho thuê
              </h2>
              <p className="text-xs text-slate-500">
                Cập nhật giá, thông tin phòng và tình trạng phòng trống cho người thuê
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsReportModalOpen(true)}
                className="px-3.5 py-2 rounded-2xl bg-white border border-[#EDE5D5] hover:bg-[#FFF9EE] hover:border-[#F4CD65] text-xs font-bold text-[#292524] transition-all flex items-center gap-2 shadow-2xs cursor-pointer"
              >
                <Flag className="w-3.5 h-3.5 text-rose-500" />
                <span>Phản ánh từ Admin</span>
                {listingReports.length > 0 && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    activeReportWarnings.length > 0
                      ? "bg-rose-50 text-rose-700 border border-rose-200 animate-pulse"
                      : "bg-stone-100 text-stone-700 border border-stone-200"
                  }`}>
                    {listingReports.length}
                  </span>
                )}
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="py-16 flex flex-col items-center justify-center gap-3 bg-white rounded-3xl border border-[#EDE5D5]">
              <Loader2 className="w-8 h-8 animate-spin text-[#DCA936]" />
              <p className="text-xs font-semibold text-[#77715F]">Đang tải danh sách phòng từ cơ sở dữ liệu...</p>
            </div>
          ) : displayedListings.length === 0 ? (
            <EmptyListingsState />
          ) : (
            <ListingManagementTable
              listings={displayedListings}
              onToggleAvailability={handleToggleAvailability}
              onToggleVisibility={handleToggleVisibility}
              onSubmitForReview={handleSubmitForReview}
              onDeleteListing={handleDeleteListing}
              onPromoteListing={(item) => setSelectedListingForPromotion(item)}
            />
          )}
        </section>
      </main>

      {/* Promote Listing Modal */}
      {selectedListingForPromotion && (
        <PromoteListingModal
          isOpen={Boolean(selectedListingForPromotion)}
          onClose={() => setSelectedListingForPromotion(null)}
          listing={{
            id: selectedListingForPromotion.id,
            title: selectedListingForPromotion.title,
            address: `${selectedListingForPromotion.address}, ${selectedListingForPromotion.district}`,
            price: selectedListingForPromotion.price,
            thumbnailUrl: selectedListingForPromotion.thumbnailUrl,
            currentTier: selectedListingForPromotion.currentTier,
          }}
          onSuccess={handlePromotionSuccess}
        />
      )}

      {/* Landlord Reports & Admin Moderation Notices Modal */}
      {isReportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div
            className="w-full max-w-2xl max-h-[85vh] bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-5 sm:p-6 border-b border-stone-100 flex items-center justify-between bg-[#FFFBF0]/60 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-900 border border-amber-300 flex items-center justify-center shrink-0">
                  <ShieldAlert className="w-5 h-5 text-amber-800" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-[#292524]">
                    Hòm thư Cảnh báo & Phản ánh từ Ban quản trị
                  </h3>
                  <p className="text-xs text-[#78716C]">
                    Danh sách các tin đăng nhận được phản ánh từ người thuê và kết luận xử lý của Admin
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsReportModalOpen(false)}
                className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1">
              {listingReports.length === 0 ? (
                <div className="py-12 text-center space-y-2">
                  <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                  <h4 className="text-sm font-bold text-[#292524]">
                    Tất cả tin đăng của bạn đều tuân thủ tốt quy định!
                  </h4>
                  <p className="text-xs text-stone-500 max-w-md mx-auto">
                    Hiện không có phản ánh vi phạm nào từ người thuê hoặc cảnh báo từ Ban quản trị đối với các phòng của bạn.
                  </p>
                </div>
              ) : (
                listingReports.map((rep) => {
                  const isWarning = rep.resolutionAction === "WARN_LANDLORD";
                  const isHidden = rep.resolutionAction === "HIDE_LISTING";
                  const isDismissed = rep.status === "DISMISSED";
                  const isPending = rep.status === "PENDING";

                  return (
                    <div
                      key={rep.id}
                      className={`p-4 sm:p-5 rounded-2xl border space-y-3.5 transition-colors ${
                        isWarning
                          ? "bg-amber-50/70 border-amber-300 ring-1 ring-amber-300/60"
                          : isHidden
                          ? "bg-rose-50/70 border-rose-300"
                          : "bg-white border-stone-200"
                      }`}
                    >
                      {/* Top: Status Badge & Listing */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-stone-100 text-xs">
                        <div className="flex flex-wrap items-center gap-2">
                          {rep.resolutionAction === "WARN_LANDLORD" ? (
                            rep.isFixed ? (
                              <span className="px-2.5 py-0.5 rounded-lg bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold flex items-center gap-1.5">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Đã cập nhật lại tin</span>
                              </span>
                            ) : rep.isExpired ? (
                              <span className="px-2.5 py-0.5 rounded-lg bg-rose-100 text-rose-900 border border-rose-300 font-bold flex items-center gap-1.5">
                                <AlertTriangle className="w-3.5 h-3.5 text-rose-700" />
                                <span>Quá hạn 24h (Tự động gỡ)</span>
                              </span>
                            ) : (
                              <span className="px-2.5 py-0.5 rounded-lg bg-amber-100 text-amber-900 border border-amber-300 font-bold flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5 text-amber-700 animate-pulse" />
                                <span>Gia hạn 24h (Còn {rep.remainingHours ?? 24}h {rep.remainingMinutes ?? 0}p)</span>
                              </span>
                            )
                          ) : isHidden ? (
                            <span className="px-2.5 py-0.5 rounded-lg bg-rose-100 text-rose-900 border border-rose-300 font-bold flex items-center gap-1.5">
                              <X className="w-3.5 h-3.5 text-rose-700" />
                              <span>Vi phạm nặng: Tin đã bị gỡ</span>
                            </span>
                          ) : isDismissed ? (
                            <span className="px-2.5 py-0.5 rounded-lg bg-stone-100 text-stone-700 border border-stone-200 font-semibold">
                              Phản ánh sai (Đã bác bỏ)
                            </span>
                          ) : isPending ? (
                            <span className="px-2.5 py-0.5 rounded-lg bg-sky-50 text-sky-800 border border-sky-200 font-semibold flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-sky-600 animate-pulse" />
                              <span>Admin đang xác minh</span>
                            </span>
                          ) : null}
                          <span className="px-2.5 py-0.5 rounded-lg bg-white border border-stone-200 font-semibold text-stone-700">
                            {rep.reasonLabel}
                          </span>
                        </div>

                        <span className="text-[11px] text-stone-400">
                          {formatDate(rep.createdAt)}
                        </span>
                      </div>

                      {/* Listing Reference */}
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-12 h-12 rounded-xl bg-stone-100 border border-stone-200 overflow-hidden shrink-0">
                            {rep.listingThumbnailUrl ? (
                              <img src={rep.listingThumbnailUrl} alt={rep.listingTitle} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-stone-400">
                                <Home className="w-5 h-5" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <h5 className="font-bold text-xs sm:text-sm text-[#292524] truncate">
                              {rep.listingTitle}
                            </h5>
                            <span className="text-xs text-stone-500 block truncate">
                              {rep.listingAddress || "Chưa có địa chỉ"}
                            </span>
                          </div>
                        </div>

                        <Link
                          href={`/landlord/listings/${rep.listingId}/edit`}
                          className="px-3.5 py-1.5 rounded-xl bg-[#292524] hover:bg-black text-white text-xs font-semibold shrink-0 transition-colors flex items-center gap-1"
                        >
                          <span>Chỉnh sửa tin</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>

                      {/* Customer Complaint Details */}
                      {rep.description && (
                        <div className="p-3 rounded-xl bg-white/80 border border-stone-200 text-xs space-y-1">
                          <span className="font-bold text-stone-700 block">Nội dung người thuê phản ánh:</span>
                          <p className="text-stone-800 leading-relaxed italic">
                            &ldquo;{rep.description}&rdquo;
                          </p>
                          {rep.evidenceUrls && rep.evidenceUrls.length > 0 && (
                            <div className="pt-1.5 flex flex-wrap gap-2">
                              {rep.evidenceUrls.map((url, imgIdx) => (
                                <a
                                  key={imgIdx}
                                  href={url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="w-12 h-12 rounded-lg overflow-hidden border border-stone-200 block"
                                  title="Xem ảnh bằng chứng của khách"
                                >
                                  <img src={url} alt="Bằng chứng" className="w-full h-full object-cover" />
                                </a>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Admin Resolution & Directive */}
                      {rep.adminNote && (
                        <div className="p-3 rounded-xl bg-white border border-amber-300/80 text-xs space-y-1">
                          <span className="font-bold text-amber-950 flex items-center gap-1.5">
                            <ShieldCheck className="w-4 h-4 text-amber-700" />
                            <span>Kết luận & Yêu cầu từ Ban Quản Trị Nestrivo:</span>
                          </span>
                          <p className="text-[#292524] font-medium leading-relaxed pl-5">
                            {rep.adminNote}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-stone-100 flex items-center justify-end bg-stone-50 shrink-0">
              <button
                type="button"
                onClick={() => setIsReportModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-800 font-semibold text-xs transition-colors cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Action Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md bg-slate-900 text-white text-xs sm:text-sm font-medium px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-slate-800 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <CheckCircle2 className="w-4 h-4 text-[#F4CD65] shrink-0" />
          <span className="flex-1 leading-snug">{toastMessage}</span>
        </div>
      )}
    </>
  );
}
