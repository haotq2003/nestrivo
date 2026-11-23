"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  AlertCircle, 
  RotateCcw, 
  ArrowLeft, 
  CheckCircle2, 
  X, 
  FileQuestion,
  AlertTriangle,
  Edit3,
  Clock
} from "lucide-react";
import { useLandlordLayout } from "@/components/landlord/layout/LandlordWorkspaceLayout";
import { ListingDetailHeader } from "@/components/landlord/listings/ListingDetailHeader";
import { ListingDetailGallery } from "@/components/landlord/listings/ListingDetailGallery";
import { ListingDetailOverview } from "@/components/landlord/listings/ListingDetailOverview";
import { 
  ListingActionModal, 
  ActionModalType 
} from "@/components/landlord/listings/ListingActionModal";
import { PromoteListingModal } from "@/components/landlord/promotions/PromoteListingModal";
import { LandlordListingItem } from "@/types/landlord";
import { ListingStatus, AvailabilityStatus } from "@/types/listing";
import { 
  RECOGNIZED_SAMPLE_IDS, 
  getFallbackLandlordListing 
} from "@/lib/landlord-listing-helpers";
import { landlordService, LandlordReportItem } from "@/service/landlord.service";
import { api } from "@/lib/api";

const STORAGE_LISTINGS_KEY = "nestrivo_landlord_listings_v1";

export default function LandlordListingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toggleMobileMenu } = useLandlordLayout();

  const id = typeof params.id === "string" ? params.id : Array.isArray(params.id) ? params.id[0] : "";

  // Page State
  const [listing, setListing] = useState<LandlordListingItem | null>(null);
  const [listingReports, setListingReports] = useState<LandlordReportItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isNotFound, setIsNotFound] = useState<boolean>(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Action Modal State
  const [modalType, setModalType] = useState<ActionModalType | null>(null);
  const [isPromoteModalOpen, setIsPromoteModalOpen] = useState<boolean>(false);
  const [isActionLoading, setIsActionLoading] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Fetch or Load Listing
  const loadListing = useCallback(async () => {
    if (!id) return;

    setIsLoading(true);
    setIsNotFound(false);
    setFetchError(null);

    // 1. Strict Check: Explicitly Recognized Fallback IDs
    if (RECOGNIZED_SAMPLE_IDS.includes(id)) {
      const sampleItem = getFallbackLandlordListing(id);
      if (sampleItem) {
        // Check if there are local status modifications in localStorage
        try {
          const stored = localStorage.getItem(STORAGE_LISTINGS_KEY);
          if (stored) {
            const list: LandlordListingItem[] = JSON.parse(stored);
            const found = list.find((item) => item.id === id);
            if (found) {
              setListing({ ...sampleItem, ...found });
              setIsLoading(false);
              return;
            }
          }
        } catch {
          // Ignore parse error
        }

        setListing(sampleItem);
        setIsLoading(false);
        return;
      }
    }

    // 2. Real API Data Fetching (Never substitute mock details on real ID failure)
    try {
      const res = await api.get<LandlordListingItem>(`/landlord/listings/${id}`);
      if (res && res.listing) {
        setListing(res.listing);
        try {
          const repRes = await landlordService.getListingReports();
          if (repRes && repRes.data) {
            setListingReports(repRes.data.filter((r) => r.listingId === id));
          }
        } catch {}
      } else {
        // Check localStorage for newly created listing from wizard
        try {
          const stored = localStorage.getItem(STORAGE_LISTINGS_KEY);
          if (stored) {
            const list: LandlordListingItem[] = JSON.parse(stored);
            const found = list.find((item) => item.id === id);
            if (found) {
              setListing(found);
              setIsLoading(false);
              return;
            }
          }
        } catch {}

        setIsNotFound(true);
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);

      // Check if 404
      if (errMsg.includes("404") || errMsg.includes("Không tìm thấy") || errMsg.includes("không có quyền")) {
        // Check local storage before concluding 404
        try {
          const stored = localStorage.getItem(STORAGE_LISTINGS_KEY);
          if (stored) {
            const list: LandlordListingItem[] = JSON.parse(stored);
            const found = list.find((item) => item.id === id);
            if (found) {
              setListing(found);
              setIsLoading(false);
              return;
            }
          }
        } catch {}

        setIsNotFound(true);
      } else {
        // Honest Error State with Retry
        setFetchError("Không thể tải thông tin tin đăng từ hệ thống máy chủ. Vui lòng thử lại.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    let isCancelled = false;

    const timer = setTimeout(() => {
      if (!isCancelled) {
        loadListing();
      }
    }, 0);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [loadListing]);

  // Handle Action Execution
  const handleExecuteAction = async () => {
    if (!listing || !modalType) return;

    setIsActionLoading(true);
    try {
      if (modalType === "DELETE") {
        // Delete action
        if (!RECOGNIZED_SAMPLE_IDS.includes(listing.id)) {
          await api.delete(`/landlord/listings/${listing.id}`);
        }

        // Also update local storage if present
        try {
          const stored = localStorage.getItem(STORAGE_LISTINGS_KEY);
          if (stored) {
            const list: LandlordListingItem[] = JSON.parse(stored);
            const updated = list.filter((item) => item.id !== listing.id);
            localStorage.setItem(STORAGE_LISTINGS_KEY, JSON.stringify(updated));
          }
        } catch {}

        showToast(`Đã xóa tin đăng "${listing.title}" thành công.`);
        setModalType(null);
        setTimeout(() => {
          router.push("/landlord/dashboard");
        }, 800);
      } else if (modalType === "TOGGLE_VISIBILITY") {
        // Toggle visibility action (PUBLISHED <-> HIDDEN)
        const nextStatus: ListingStatus = listing.status === "PUBLISHED" ? "HIDDEN" : "PUBLISHED";

        if (!RECOGNIZED_SAMPLE_IDS.includes(listing.id)) {
          await api.patch(`/landlord/listings/${listing.id}/visibility`);
        }

        const updatedListing: LandlordListingItem = { ...listing, status: nextStatus };
        setListing(updatedListing);

        // Update local storage
        try {
          const stored = localStorage.getItem(STORAGE_LISTINGS_KEY);
          if (stored) {
            const list: LandlordListingItem[] = JSON.parse(stored);
            const updatedList = list.map((item) => (item.id === listing.id ? updatedListing : item));
            localStorage.setItem(STORAGE_LISTINGS_KEY, JSON.stringify(updatedList));
          }
        } catch {}

        showToast(
          nextStatus === "HIDDEN"
            ? `Đã tạm ẩn tin "${listing.title}" khỏi người thuê.`
            : `Đã kích hoạt hiển thị lại tin "${listing.title}" trên sàn.`
        );
        setModalType(null);
      } else if (modalType === "TOGGLE_AVAILABILITY") {
        // Toggle availability action (AVAILABLE <-> RENTED)
        const nextAvail: AvailabilityStatus = listing.availabilityStatus === "AVAILABLE" ? "RENTED" : "AVAILABLE";

        if (!RECOGNIZED_SAMPLE_IDS.includes(listing.id)) {
          await api.patch(`/landlord/listings/${listing.id}/availability`, {
            availabilityStatus: nextAvail,
          });
        }

        const updatedListing: LandlordListingItem = { ...listing, availabilityStatus: nextAvail };
        setListing(updatedListing);

        // Update local storage
        try {
          const stored = localStorage.getItem(STORAGE_LISTINGS_KEY);
          if (stored) {
            const list: LandlordListingItem[] = JSON.parse(stored);
            const updatedList = list.map((item) => (item.id === listing.id ? updatedListing : item));
            localStorage.setItem(STORAGE_LISTINGS_KEY, JSON.stringify(updatedList));
          }
        } catch {}

        showToast(
          nextAvail === "RENTED"
            ? `Đã đánh dấu phòng "${listing.title}" sang trạng thái ĐÃ CHO THUÊ.`
            : `Đã mở lại phòng "${listing.title}" sang trạng thái CÒN TRỐNG.`
        );
        setModalType(null);
      } else if (modalType === "SUBMIT_REVIEW") {
        // Submit for review action (DRAFT / REJECTED -> PENDING_APPROVAL)
        if (!RECOGNIZED_SAMPLE_IDS.includes(listing.id)) {
          await api.patch(`/landlord/listings/${listing.id}/submit`);
        }

        const updatedListing = {
          ...listing,
          status: "PENDING_APPROVAL" as const,
          rejectionReason: null,
          updatedAt: new Date().toISOString(),
        };
        setListing(updatedListing);

        // Update local storage
        try {
          const stored = localStorage.getItem(STORAGE_LISTINGS_KEY);
          if (stored) {
            const list: LandlordListingItem[] = JSON.parse(stored);
            const updatedList = list.map((item) => (item.id === listing.id ? updatedListing : item));
            localStorage.setItem(STORAGE_LISTINGS_KEY, JSON.stringify(updatedList));
          }
        } catch {}

        showToast(`Đã gửi tin "${listing.title}" lên kiểm duyệt thành công!`);
        setModalType(null);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Đã xảy ra lỗi khi thực hiện thao tác.";
      showToast(msg);
    } finally {
      setIsActionLoading(false);
    }
  };

  // 1. Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        {/* Header Skeleton */}
        <div className="h-18 bg-white border-b border-slate-200/80 px-6 flex items-center justify-between">
          <div className="h-6 w-48 bg-slate-200 rounded-lg animate-pulse" />
          <div className="h-8 w-32 bg-slate-200 rounded-xl animate-pulse" />
        </div>

        {/* Content Skeleton */}
        <main className="px-4 sm:px-6 lg:px-8 xl:px-10 py-6 max-w-7xl w-full mx-auto space-y-6">
          <div className="h-80 w-full bg-slate-200 rounded-2xl animate-pulse" />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 space-y-4">
              <div className="h-44 bg-slate-200 rounded-2xl animate-pulse" />
              <div className="h-60 bg-slate-200 rounded-2xl animate-pulse" />
            </div>
            <div className="lg:col-span-5 space-y-4">
              <div className="h-48 bg-slate-200 rounded-2xl animate-pulse" />
              <div className="h-40 bg-slate-200 rounded-2xl animate-pulse" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  // 2. 404 Not Found State
  if (isNotFound) {
    return (
      <main className="min-h-[75vh] flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 p-7 sm:p-8 text-center space-y-5 shadow-2xs">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-500 mx-auto flex items-center justify-center">
            <FileQuestion className="w-8 h-8" />
          </div>
          <div className="space-y-1.5">
            <h1 className="text-xl font-bold text-slate-900">
              Không tìm thấy tin đăng
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Mã tin đăng <code className="px-1.5 py-0.5 rounded bg-slate-100 font-mono text-slate-800">{id}</code> không tồn tại trên hệ thống hoặc bạn không có quyền truy cập tin này.
            </p>
          </div>
          <div className="pt-2">
            <Link
              href="/landlord/dashboard"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#F4CD65] hover:bg-[#ebbf4d] text-[#373523] font-bold text-xs sm:text-sm transition-all shadow-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Về Bảng điều khiển tin đăng</span>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // 3. Server / Network Error State with Retry
  if (fetchError || !listing) {
    return (
      <main className="min-h-[75vh] flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 p-7 sm:p-8 text-center space-y-5 shadow-2xs">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 mx-auto flex items-center justify-center border border-amber-200">
            <AlertCircle className="w-8 h-8" />
          </div>
          <div className="space-y-1.5">
            <h1 className="text-xl font-semibold text-[#292524]">
              Không thể tải dữ liệu
            </h1>
            <p className="text-xs sm:text-sm text-[#57534E] leading-relaxed">
              {fetchError || "Đã xảy ra lỗi trong quá trình kết nối với máy chủ."}
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={loadListing}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#F4CD65] hover:bg-[#ebbf4d] text-[#292524] font-medium text-xs sm:text-sm transition-all shadow-xs shadow-[#F4CD65]/20"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Thử lại</span>
            </button>
            <Link
              href="/landlord/dashboard"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-[#57534E] font-medium text-xs sm:text-sm transition-colors"
            >
              <span>Về Bảng điều khiển</span>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // 4. Main Listing Detail View
  return (
    <>
      {/* Top Detail Header */}
      <ListingDetailHeader
        listing={listing}
        onToggleMobileMenu={toggleMobileMenu}
        onPromote={() => setIsPromoteModalOpen(true)}
      />

      {/* Main Workspace Container */}
      <main className="px-4 sm:px-6 lg:px-8 xl:px-10 py-6 max-w-7xl w-full mx-auto space-y-6 pb-24 sm:pb-28">
        {/* Admin Violation / Moderation Notice for this specific room */}
        {listingReports.some(r => r.status === "RESOLVED" && (r.resolutionAction === "WARN_LANDLORD" || r.resolutionAction === "HIDE_LISTING")) && (
          <div className="space-y-3">
            {listingReports.filter(r => r.status === "RESOLVED").map((r, idx) => (
              <div
                key={idx}
                className={`p-4 sm:p-5 rounded-3xl border-2 space-y-3 shadow-xs ${
                  r.resolutionAction === "WARN_LANDLORD"
                    ? r.isFixed
                      ? "bg-emerald-50 border-emerald-300 text-emerald-950"
                      : r.isExpired
                      ? "bg-rose-50 border-rose-300 text-rose-950"
                      : "bg-amber-50 border-amber-300 text-amber-950"
                    : "bg-stone-100 border-stone-300 text-stone-900"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 font-bold text-sm">
                    {r.resolutionAction === "WARN_LANDLORD" && r.isFixed ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    ) : r.resolutionAction === "WARN_LANDLORD" && r.isExpired ? (
                      <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
                    ) : r.resolutionAction === "WARN_LANDLORD" ? (
                      <Clock className="w-5 h-5 text-amber-700 shrink-0 animate-pulse" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-stone-700 shrink-0" />
                    )}

                    <span>
                      {r.resolutionAction === "WARN_LANDLORD"
                        ? r.isFixed
                          ? "Bạn đã cập nhật lại tin theo chỉ đạo của BQT:"
                          : r.isExpired
                          ? "Quá hạn 24h: Tin đã tự động bị ẩn khỏi sàn Nestrivo"
                          : `Cảnh báo vi phạm nhẹ: Còn lại ${r.remainingHours ?? 24}h ${r.remainingMinutes ?? 0}p để sửa lại tin`
                        : "Tin đăng đã bị gỡ do vi phạm quy chế nghiêm trọng:"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {r.resolutionAction === "WARN_LANDLORD" && !r.isFixed && (
                      <Link
                        href={`/landlord/listings/${listing.id}/edit`}
                        className="px-3.5 py-1.5 rounded-xl bg-[#292524] hover:bg-black text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 shrink-0"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Chỉnh sửa tin ngay</span>
                      </Link>
                    )}
                  </div>
                </div>

                <div className="bg-white/90 p-3.5 rounded-2xl border border-stone-200 text-xs space-y-1.5">
                  <span className="font-semibold text-stone-900 block">
                    Lý do phản ánh: <strong>{r.reasonLabel}</strong>
                  </span>
                  {r.adminNote && (
                    <p className="text-stone-800 leading-relaxed font-medium">
                      Chỉ đạo của BQT: &ldquo;{r.adminNote}&rdquo;
                    </p>
                  )}
                  {r.resolutionAction === "WARN_LANDLORD" && !r.isFixed && !r.isExpired && (
                    <p className="text-amber-800 font-semibold text-[11px] pt-1 border-t border-amber-100">
                      ⏱️ Tin vẫn tạm hiển thị trên Nestrivo trong 24h. Sau thời gian này hệ thống sẽ tự động gỡ tin nếu bạn không sửa lại thông số.
                    </p>
                  )}
                  {r.description && (
                    <p className="text-stone-500 italic text-[11px] pt-1 border-t border-stone-100">
                      Khách thuê phản ánh: &ldquo;{r.description}&rdquo;
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Listing Image Gallery */}
        <ListingDetailGallery
          images={listing.images || []}
          title={listing.title}
        />

        {/* Detailed Sections (Property info, Pricing, Amenities, Actions) */}
        <ListingDetailOverview
          listing={listing}
          onRequestAction={(type) => setModalType(type)}
        />
      </main>

      {/* Promote Listing Modal */}
      {isPromoteModalOpen && (
        <PromoteListingModal
          isOpen={isPromoteModalOpen}
          onClose={() => setIsPromoteModalOpen(false)}
          listing={{
            id: listing.id,
            title: listing.title,
            address: `${listing.address}, ${listing.district}`,
            price: listing.price,
            thumbnailUrl: listing.thumbnailUrl,
            currentTier: listing.currentTier,
          }}
          onSuccess={() => {
            setListing((prev) => (prev ? { ...prev, currentTier: "VIP", priority: 2 } : prev));
            showToast("Đã nâng cấp phòng lên mục Tin Nổi Bật thành công!");
          }}
        />
      )}

      {/* Confirmation Modal */}
      {modalType && (
        <ListingActionModal
          isOpen={true}
          type={modalType}
          listingTitle={listing.title}
          currentStatus={listing.status}
          currentAvailability={listing.availabilityStatus}
          isLoading={isActionLoading}
          onConfirm={handleExecuteAction}
          onClose={() => setModalType(null)}
        />
      )}

      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-200 border border-slate-700/80">
          <div className="w-7 h-7 rounded-xl bg-[#F4CD65] text-[#373523] flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <p className="text-xs sm:text-sm font-medium leading-snug flex-1">
            {toastMessage}
          </p>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white p-1"
            aria-label="Đóng thông báo"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </>
  );
}
