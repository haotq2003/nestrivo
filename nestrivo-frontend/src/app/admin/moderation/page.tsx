"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  X,
  Building2,
  ShieldCheck,
  Clock,
  Layers,
  Sparkles
} from "lucide-react";
import { useAdminLayout } from "@/components/admin/AdminWorkspaceLayout";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { ModerationSummaryCards } from "@/components/admin/moderation/ModerationSummaryCards";
import { ModerationTable } from "@/components/admin/moderation/ModerationTable";
import { RejectReasonModal } from "@/components/admin/moderation/RejectReasonModal";
import { ListingReviewModal } from "@/components/admin/moderation/ListingReviewModal";
import { KycModerationTable } from "@/components/admin/moderation/KycModerationTable";
import { KycReviewModal } from "@/components/admin/moderation/KycReviewModal";
import { KycRejectModal } from "@/components/admin/moderation/KycRejectModal";
import { AdminListingItem } from "@/types/admin";
import { 
  fetchAdminListings, 
  approveListing, 
  rejectListing, 
  hideListing 
} from "@/lib/admin-api";
import { 
  adminService, 
  AdminKycVerificationItem 
} from "@/service/admin.service";

export default function AdminModerationPage() {
  const { toggleMobileMenu, setPendingCount } = useAdminLayout();

  // Top Section: Duyệt Tin Đăng vs Duyệt Xác Minh eKYC
  const [moderationSection, setModerationSection] = useState<"LISTINGS" | "KYC">("LISTINGS");

  // Listings Data & Loading state
  const [listings, setListings] = useState<AdminListingItem[]>([]);
  const [isLoadingListings, setIsLoadingListings] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // KYC Data & Loading state
  const [kycItems, setKycItems] = useState<AdminKycVerificationItem[]>([]);
  const [isLoadingKyc, setIsLoadingKyc] = useState<boolean>(true);
  const [inspectKyc, setInspectKyc] = useState<AdminKycVerificationItem | null>(null);
  const [rejectingKyc, setRejectingKyc] = useState<AdminKycVerificationItem | null>(null);
  const [isKycActionLoading, setIsKycActionLoading] = useState<boolean>(false);

  // Listings Filters state
  const [activeTab, setActiveTab] = useState<string>("PENDING");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedPropertyType, setSelectedPropertyType] = useState<string>("ALL");
  const [selectedSort, setSelectedSort] = useState<string>("FIFO"); // FIFO or NEWEST

  // Listings Modals state
  const [inspectListing, setInspectListing] = useState<AdminListingItem | null>(null);
  const [rejectingListing, setRejectingListing] = useState<AdminListingItem | null>(null);
  const [isModalActionLoading, setIsModalActionLoading] = useState<boolean>(false);

  // Toast feedback
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = useCallback((message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  }, []);

  // 1. Fetch Listings Data
  const loadListingsData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setIsRefreshing(true);
    else setIsLoadingListings(true);

    try {
      const data = await fetchAdminListings();
      setListings(data);
      const pending = data.filter((item) => item.status === "PENDING_APPROVAL").length;
      setPendingCount(pending);
    } catch {
      showToast("Không thể tải danh sách tin kiểm duyệt.", "error");
    } finally {
      setIsLoadingListings(false);
      setIsRefreshing(false);
    }
  }, [setPendingCount, showToast]);

  // 2. Fetch KYC Verifications Data
  const loadKycData = useCallback(async () => {
    setIsLoadingKyc(true);
    try {
      const res = await adminService.getPendingVerifications();
      setKycItems(res?.data || []);
    } catch (err) {
      console.warn("Failed to load pending KYC:", err);
    } finally {
      setIsLoadingKyc(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadListingsData();
      loadKycData();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadListingsData, loadKycData]);

  // Statistics calculation for Listings
  const stats = useMemo(() => {
    const pending = listings.filter((item) => item.status === "PENDING_APPROVAL").length;
    const approved = listings.filter((item) => item.status === "PUBLISHED").length;
    const rejected = listings.filter((item) => item.status === "REJECTED").length;
    const total = listings.length;
    return { pending, approved, rejected, total };
  }, [listings]);

  // Filtered & Sorted listings
  const filteredListings = useMemo(() => {
    return listings
      .filter((item) => {
        if (activeTab === "PENDING" && item.status !== "PENDING_APPROVAL") return false;
        if (activeTab === "PUBLISHED" && item.status !== "PUBLISHED") return false;
        if (activeTab === "REJECTED" && item.status !== "REJECTED") return false;
        
        if (selectedPropertyType !== "ALL" && item.propertyType !== selectedPropertyType) {
          return false;
        }

        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchTitle = item.title.toLowerCase().includes(q);
          const matchAddress = item.address.toLowerCase().includes(q) || item.district.toLowerCase().includes(q);
          const matchLandlord = item.landlord?.fullName.toLowerCase().includes(q);
          const matchPhone = item.landlord?.phoneNumber?.includes(q);
          if (!matchTitle && !matchAddress && !matchLandlord && !matchPhone) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        const timeA = new Date(a.createdAt).getTime();
        const timeB = new Date(b.createdAt).getTime();
        if (selectedSort === "FIFO") {
          return timeA - timeB;
        }
        return timeB - timeA;
      });
  }, [listings, activeTab, selectedPropertyType, searchQuery, selectedSort]);

  // Handlers for Listing Moderation
  const handleApprove = async (id: string) => {
    setProcessingId(id);
    setIsModalActionLoading(true);
    try {
      const res = await approveListing(id);
      if (res.success) {
        showToast(res.message, "success");
        setListings((prev) =>
          prev.map((item) =>
            item.id === id
              ? { ...item, status: "PUBLISHED", publishedAt: new Date().toISOString(), rejectionReason: null }
              : item
          )
        );
        setPendingCount(Math.max(0, stats.pending - 1));
        if (inspectListing?.id === id) {
          setInspectListing((prev) =>
            prev ? { ...prev, status: "PUBLISHED", publishedAt: new Date().toISOString(), rejectionReason: null } : null
          );
        }
      } else {
        showToast(res.message, "error");
      }
    } catch {
      showToast("Lỗi hệ thống khi phê duyệt tin đăng.", "error");
    } finally {
      setProcessingId(null);
      setIsModalActionLoading(false);
    }
  };

  const handleRejectConfirm = async (reason: string) => {
    if (!rejectingListing) return;
    const id = rejectingListing.id;
    setProcessingId(id);
    setIsModalActionLoading(true);
    try {
      const res = await rejectListing(id, reason);
      if (res.success) {
        showToast(res.message, "success");
        setListings((prev) =>
          prev.map((item) =>
            item.id === id
              ? { ...item, status: "REJECTED", rejectionReason: reason }
              : item
          )
        );
        setPendingCount(Math.max(0, stats.pending - 1));
        setRejectingListing(null);
        if (inspectListing?.id === id) {
          setInspectListing((prev) =>
            prev ? { ...prev, status: "REJECTED", rejectionReason: reason } : null
          );
        }
      } else {
        showToast(res.message, "error");
      }
    } catch {
      showToast("Lỗi hệ thống khi từ chối tin đăng.", "error");
    } finally {
      setProcessingId(null);
      setIsModalActionLoading(false);
    }
  };

  const handleHideListing = async (id: string) => {
    setProcessingId(id);
    setIsModalActionLoading(true);
    try {
      const res = await hideListing(id, "Tạm ẩn do vi phạm quy chế hiển thị");
      if (res.success) {
        showToast(res.message, "success");
        setListings((prev) =>
          prev.map((item) =>
            item.id === id ? { ...item, status: "HIDDEN" } : item
          )
        );
        if (inspectListing?.id === id) {
          setInspectListing((prev) =>
            prev ? { ...prev, status: "HIDDEN" } : null
          );
        }
      } else {
        showToast(res.message, "error");
      }
    } catch {
      showToast("Lỗi khi tạm ẩn tin đăng.", "error");
    } finally {
      setProcessingId(null);
      setIsModalActionLoading(false);
    }
  };

  // Handlers for KYC Moderation
  const handleApproveKyc = async (userId: string) => {
    setProcessingId(userId);
    setIsKycActionLoading(true);
    try {
      const res = await adminService.approveVerification(userId);
      showToast(res.message || "Đã phê duyệt thành công hồ sơ xác minh cho chủ nhà!", "success");
      setKycItems((prev) => prev.filter((item) => item.userId !== userId));
      setInspectKyc(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Lỗi khi phê duyệt hồ sơ xác minh.";
      showToast(msg, "error");
    } finally {
      setProcessingId(null);
      setIsKycActionLoading(false);
    }
  };

  const handleRejectKycConfirm = async (userId: string, reason: string) => {
    setProcessingId(userId);
    setIsKycActionLoading(true);
    try {
      const res = await adminService.rejectVerification(userId, reason);
      showToast(res.message || "Đã từ chối hồ sơ xác minh của chủ nhà.", "success");
      setKycItems((prev) => prev.filter((item) => item.userId !== userId));
      setRejectingKyc(null);
      if (inspectKyc?.userId === userId) {
        setInspectKyc(null);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Lỗi khi từ chối hồ sơ xác minh.";
      showToast(msg, "error");
    } finally {
      setProcessingId(null);
      setIsKycActionLoading(false);
    }
  };

  const handleRefreshAll = () => {
    loadListingsData(true);
    loadKycData();
  };

  return (
    <div className="flex-1 flex flex-col min-w-0">
      {/* Header */}
      <AdminHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onToggleMobileMenu={toggleMobileMenu}
        onRefresh={handleRefreshAll}
        isRefreshing={isRefreshing}
        pendingCount={stats.pending + kycItems.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 px-4 sm:px-6 lg:px-8 xl:px-10 py-6 sm:py-8 space-y-6 w-full max-w-[1920px] mx-auto">
        {/* Top Primary Navigation Segment: Listings vs eKYC */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-1.5 bg-white rounded-2xl border border-[#EDE5D5] shadow-xs">
          <div className="flex items-center gap-1.5 w-full sm:w-auto">
            {/* Tab 1: Moderation Tin đăng */}
            <button
              type="button"
              onClick={() => setModerationSection("LISTINGS")}
              className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all flex items-center justify-center gap-2 cursor-pointer ${
                moderationSection === "LISTINGS"
                  ? "bg-[#F4CD65] text-[#292524] shadow-xs font-semibold"
                  : "text-[#57534E] hover:text-[#292524] hover:bg-[#FFF7E5]"
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Duyệt Tin Đăng Phòng Trọ</span>
              {stats.pending > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#FFF1CC] text-[#805B10] border border-[#F4CD65]/40">
                  {stats.pending}
                </span>
              )}
            </button>

            {/* Tab 2: Moderation eKYC Chủ Nhà */}
            <button
              type="button"
              onClick={() => setModerationSection("KYC")}
              className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all flex items-center justify-center gap-2 cursor-pointer ${
                moderationSection === "KYC"
                  ? "bg-[#F4CD65] text-[#292524] shadow-xs font-semibold"
                  : "text-[#57534E] hover:text-[#292524] hover:bg-[#FFF7E5]"
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-[#805B10]" />
              <span>Xác Minh Danh Tính Chủ Nhà (eKYC)</span>
              {kycItems.length > 0 ? (
                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-600 text-white animate-pulse">
                  {kycItems.length} mới
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-200 text-slate-700">
                  0
                </span>
              )}
            </button>
          </div>

          <div className="hidden lg:flex items-center gap-2 text-xs font-medium text-[#805B10]">
            <Sparkles className="w-3.5 h-3.5 text-[#DCA936]" />
            <span>Hệ thống đối chiếu hồ sơ định danh an toàn</span>
          </div>
        </div>

        {/* SECTION 1: DUYỆT TIN ĐĂNG */}
        {moderationSection === "LISTINGS" && (
          <div className="space-y-6">
            {/* KPI Summary Cards */}
            <ModerationSummaryCards
              pendingCount={stats.pending}
              approvedCount={stats.approved}
              rejectedCount={stats.rejected}
              totalCount={stats.total}
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />

            {/* Filter & Search Toolbar */}
            <div className="p-4 rounded-3xl bg-white border border-[#EDE5D5] shadow-xs space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                {/* Status Tabs */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                  <button
                    type="button"
                    onClick={() => setActiveTab("PENDING")}
                    className={`px-4 py-2 rounded-2xl text-xs sm:text-sm transition-all shrink-0 cursor-pointer ${
                      activeTab === "PENDING"
                        ? "bg-[#F4CD65] text-[#292524] shadow-xs font-semibold"
                        : "text-[#57534E] hover:text-[#292524] hover:bg-[#FFF7E5] font-medium"
                    }`}
                  >
                    Chờ kiểm duyệt ({stats.pending})
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("PUBLISHED")}
                    className={`px-4 py-2 rounded-2xl text-xs sm:text-sm transition-all shrink-0 cursor-pointer ${
                      activeTab === "PUBLISHED"
                        ? "bg-[#F4CD65] text-[#292524] shadow-xs font-semibold"
                        : "text-[#57534E] hover:text-[#292524] hover:bg-[#FFF7E5] font-medium"
                    }`}
                  >
                    Đã duyệt ({stats.approved})
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("REJECTED")}
                    className={`px-4 py-2 rounded-2xl text-xs sm:text-sm transition-all shrink-0 cursor-pointer ${
                      activeTab === "REJECTED"
                        ? "bg-rose-600 text-white shadow-xs font-semibold"
                        : "text-[#57534E] hover:text-[#292524] hover:bg-[#FFF7E5] font-medium"
                    }`}
                  >
                    Bị từ chối ({stats.rejected})
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("ALL")}
                    className={`px-4 py-2 rounded-2xl text-xs sm:text-sm transition-all shrink-0 cursor-pointer ${
                      activeTab === "ALL"
                        ? "bg-[#F4CD65] text-[#292524] shadow-xs font-semibold"
                        : "text-[#57534E] hover:text-[#292524] hover:bg-[#FFF7E5] font-medium"
                    }`}
                  >
                    Tất cả tin ({stats.total})
                  </button>
                </div>

                {/* Quick Sorting & Property Type Filter */}
                <div className="flex items-center gap-2.5">
                  <div className="relative">
                    <select
                      value={selectedPropertyType}
                      onChange={(e) => setSelectedPropertyType(e.target.value)}
                      className="pl-3 pr-8 py-2 text-xs font-medium bg-[#FFFAEF] border border-[#EDE5D5] rounded-xl text-[#292524] hover:border-[#DCA936] focus:outline-none focus:border-[#DCA936] cursor-pointer min-h-[38px]"
                    >
                      <option value="ALL">Tất cả loại phòng</option>
                      <option value="STUDIO">Studio</option>
                      <option value="SERVICE_APARTMENT">Căn hộ dịch vụ</option>
                      <option value="ROOM_RENTAL">Phòng trọ</option>
                      <option value="WHOLE_HOUSE">Nhà nguyên căn</option>
                      <option value="ROOM_SHARE">Ở ghép</option>
                    </select>
                  </div>

                  <div className="relative">
                    <select
                      value={selectedSort}
                      onChange={(e) => setSelectedSort(e.target.value)}
                      className="pl-3 pr-8 py-2 text-xs font-medium bg-[#FFFAEF] border border-[#EDE5D5] rounded-xl text-[#292524] hover:border-[#DCA936] focus:outline-none focus:border-[#DCA936] cursor-pointer min-h-[38px]"
                    >
                      <option value="FIFO">Ưu tiên cũ nhất (FIFO)</option>
                      <option value="NEWEST">Mới nhất lên đầu</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Mobile search bar if on small screen */}
              <div className="relative block md:hidden">
                <Search className="w-4 h-4 text-[#A8A190] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm theo tên phòng, chủ nhà, SĐT..."
                  className="w-full pl-9 pr-3.5 py-2 text-xs bg-[#FFFAEF] border border-[#EDE5D5] rounded-xl text-[#292524] placeholder:text-[#A8A29E] focus:outline-none focus:border-[#DCA936] min-h-[40px]"
                />
              </div>
            </div>

            {/* Listings Table / Queue */}
            {isLoadingListings ? (
              <div className="bg-white rounded-3xl border border-[#EDE5D5] p-12 text-center">
                <div className="w-8 h-8 border-3 border-[#F4CD65] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-xs font-medium text-[#57534E]">
                  Đang tải danh sách tin kiểm duyệt...
                </p>
              </div>
            ) : (
              <ModerationTable
                listings={filteredListings}
                onInspect={(item) => setInspectListing(item)}
                onQuickApprove={(id) => handleApprove(id)}
                onQuickReject={(item) => setRejectingListing(item)}
                isProcessingId={processingId}
              />
            )}
          </div>
        )}

        {/* SECTION 2: DUYỆT XÁC MINH eKYC CHỦ NHÀ */}
        {moderationSection === "KYC" && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-amber-50/70 border border-amber-200/80 rounded-2xl">
              <div>
                <h3 className="text-sm font-semibold text-amber-950 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#805B10]" />
                  <span>Danh sách hồ sơ định danh điện tử eKYC chờ kiểm duyệt</span>
                </h3>
                <p className="text-xs text-amber-900/80 mt-0.5">
                  Đối chiếu ảnh thẻ Căn cước công dân gốc với dữ liệu khai báo. Khi được phê duyệt, chủ nhà sẽ được cấp Tích Xanh chính chủ.
                </p>
              </div>

              <div className="text-xs font-semibold text-[#805B10] bg-white px-3 py-1.5 rounded-xl border border-amber-200/90 shadow-2xs shrink-0 self-start sm:self-auto">
                {kycItems.length} hồ sơ đang chờ
              </div>
            </div>

            {isLoadingKyc ? (
              <div className="bg-white rounded-3xl border border-[#EDE5D5] p-12 text-center">
                <div className="w-8 h-8 border-3 border-[#F4CD65] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-xs font-medium text-[#57534E]">
                  Đang tải danh sách hồ sơ xác minh...
                </p>
              </div>
            ) : (
              <KycModerationTable
                items={kycItems}
                onInspect={(item) => setInspectKyc(item)}
                onQuickApprove={(userId) => handleApproveKyc(userId)}
                onQuickReject={(item) => setRejectingKyc(item)}
                isProcessingId={processingId}
              />
            )}
          </div>
        )}
      </main>

      {/* Listing Review Modal */}
      <ListingReviewModal
        isOpen={!!inspectListing}
        listing={inspectListing}
        onClose={() => setInspectListing(null)}
        onApprove={handleApprove}
        onRejectOpen={(item) => {
          setInspectListing(null);
          setRejectingListing(item);
        }}
        onHideListing={handleHideListing}
        isProcessing={isModalActionLoading}
      />

      {/* Listing Reject Modal */}
      <RejectReasonModal
        isOpen={!!rejectingListing}
        listing={rejectingListing}
        onClose={() => setRejectingListing(null)}
        onConfirm={handleRejectConfirm}
        isLoading={isModalActionLoading}
      />

      {/* KYC Review & Dossier Modal */}
      <KycReviewModal
        isOpen={!!inspectKyc}
        item={inspectKyc}
        onClose={() => setInspectKyc(null)}
        onApprove={handleApproveKyc}
        onRejectOpen={(item) => {
          setInspectKyc(null);
          setRejectingKyc(item);
        }}
        isLoading={isKycActionLoading}
      />

      {/* KYC Reject Modal */}
      <KycRejectModal
        isOpen={!!rejectingKyc}
        item={rejectingKyc}
        onClose={() => setRejectingKyc(null)}
        onConfirm={handleRejectKycConfirm}
        isLoading={isKycActionLoading}
      />

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-200 border border-slate-700/80">
          <div
            className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
              toast.type === "success"
                ? "bg-[#F4CD65] text-[#292524]"
                : "bg-rose-500 text-white"
            }`}
          >
            {toast.type === "success" ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : (
              <AlertCircle className="w-4 h-4" />
            )}
          </div>
          <p className="text-xs sm:text-sm font-medium leading-snug flex-1">
            {toast.message}
          </p>
          <button
            type="button"
            onClick={() => setToast(null)}
            className="text-slate-400 hover:text-white p-1 cursor-pointer"
            aria-label="Đóng thông báo"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
