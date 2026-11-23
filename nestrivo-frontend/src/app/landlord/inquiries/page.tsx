"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { 
  SlidersHorizontal, 
  CheckCircle2, 
  X 
} from "lucide-react";
import { useLandlordLayout } from "@/components/landlord/layout/LandlordWorkspaceLayout";
import { InquiryHeader } from "@/components/landlord/inquiries/InquiryHeader";
import { InquiryStatsSummary } from "@/components/landlord/inquiries/InquiryStatsSummary";
import { InquiryFilters } from "@/components/landlord/inquiries/InquiryFilters";
import { InquiryTable } from "@/components/landlord/inquiries/InquiryTable";
import { InquiryDetailDrawer } from "@/components/landlord/inquiries/InquiryDetailDrawer";
import { InquiryEmptyState } from "@/components/landlord/inquiries/InquiryEmptyState";
import { InquiryRejectModal } from "@/components/landlord/inquiries/InquiryRejectModal";
import { 
  fetchLandlordInquiries, 
  updateInquiryStatusApi,
  calculateInquiryStats 
} from "@/service/inquiry.service";
import { RentalInquiry, InquiryStatus } from "@/types/inquiry";

export default function LandlordInquiriesPage() {
  const { toggleMobileMenu } = useLandlordLayout();

  // 1. Core State - Connect Live Backend API
  const [inquiries, setInquiries] = useState<RentalInquiry[]>([]);
  const [activeStatus, setActiveStatus] = useState<"ALL" | InquiryStatus>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateSort, setDateSort] = useState<"newest" | "oldest">("newest");
  const [selectedListingId, setSelectedListingId] = useState("ALL");
  const [onlyViewingTours, setOnlyViewingTours] = useState(false);

  // 2. Drawer & Modal State
  const [selectedInquiry, setSelectedInquiry] = useState<RentalInquiry | null>(null);
  const [rejectTargetInquiry, setRejectTargetInquiry] = useState<RentalInquiry | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Show Toast Helper
  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage((prev) => (prev === message ? null : prev));
    }, 3500);
  };

  // Load inquiries from backend database
  const loadInquiries = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fetchLandlordInquiries();
      setInquiries(data);
    } catch (err) {
      console.warn("Failed to load inquiries:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInquiries();
  }, [loadInquiries]);

  // Status transitions: update backend and optimistic update UI
  const handleUpdateStatus = async (id: string, nextStatus: InquiryStatus) => {
    try {
      await updateInquiryStatusApi(id, nextStatus);
      setInquiries((prev) =>
        prev.map((item) => {
          if (item.id === id) {
            const now = new Date().toISOString();
            const updated: RentalInquiry = {
              ...item,
              status: nextStatus,
              updatedAt: now,
              contactedAt: nextStatus === "CONTACTED" ? now : item.contactedAt,
              closedAt: nextStatus === "CLOSED" ? now : item.closedAt,
            };
            if (selectedInquiry?.id === id) {
              setSelectedInquiry(updated);
            }
            return updated;
          }
          return item;
        })
      );

      const statusLabels: Record<InquiryStatus, string> = {
        PENDING: "CHỜ DUYỆT",
        CONFIRMED: "ĐÃ DUYỆT LỊCH",
        REJECTED: "ĐÃ TỪ CHỐI LỊCH",
        CONTACTED: "ĐÃ LIÊN HỆ",
        CLOSED: "ĐÃ ĐÓNG",
      };
      showToast(`Đã cập nhật yêu cầu sang trạng thái ${statusLabels[nextStatus]}.`);
    } catch {
      showToast("Có lỗi khi cập nhật trạng thái yêu cầu hỏi thuê.");
    }
  };

  // Reject appointment with specific reason
  const handleConfirmReject = async (id: string, rejectionReason: string) => {
    try {
      await updateInquiryStatusApi(id, "REJECTED", undefined, rejectionReason);
      setInquiries((prev) =>
        prev.map((item) => {
          if (item.id === id) {
            const now = new Date().toISOString();
            const updated: RentalInquiry = {
              ...item,
              status: "REJECTED",
              rejectionReason,
              updatedAt: now,
              closedAt: now,
            };
            if (selectedInquiry?.id === id) {
              setSelectedInquiry(updated);
            }
            return updated;
          }
          return item;
        })
      );
      showToast("Đã từ chối lịch hẹn và gửi thông báo lý do đến khách thuê.");
    } catch {
      showToast("Có lỗi khi từ chối lịch hẹn xem phòng.");
      throw new Error("Lỗi khi từ chối");
    }
  };

  // Open drawer
  const handleOpenDrawer = (item: RentalInquiry) => {
    setSelectedInquiry(item);
    setIsDrawerOpen(true);
  };

  // Close drawer
  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
  };

  // Reset all filters
  const handleResetFilters = () => {
    setActiveStatus("ALL");
    setSearchQuery("");
    setDateSort("newest");
    setSelectedListingId("ALL");
    setOnlyViewingTours(false);
  };

  // Retry from error state
  const handleRetry = () => {
    loadInquiries();
    showToast("Đang tải lại danh sách yêu cầu hỏi thuê...");
  };

  // Distinct available listings for the filter dropdown
  const availableListings = useMemo(() => {
    const map = new Map<string, string>();
    inquiries.forEach((inq) => {
      if (!map.has(inq.listing.id)) {
        map.set(inq.listing.id, inq.listing.title);
      }
    });
    return Array.from(map.entries()).map(([id, title]) => ({ id, title }));
  }, [inquiries]);

  // Compute live statistics
  const stats = useMemo(() => {
    return calculateInquiryStats(inquiries);
  }, [inquiries]);

  // Count viewing tour inquiries
  const viewingToursCount = useMemo(() => {
    return inquiries.filter(
      (i) =>
        i.notes?.includes("Lịch hẹn xem phòng") ||
        i.notes?.includes("[LỊCH XEM PHÒNG]") ||
        i.notes?.toLowerCase().includes("lịch hẹn") ||
        i.message.toLowerCase().includes("xem phòng")
    ).length;
  }, [inquiries]);

  // Filtered & Sorted Inquiries
  const displayedInquiries = useMemo(() => {
    let list = [...inquiries];

    // Viewing tours only filter
    if (onlyViewingTours) {
      list = list.filter(
        (i) =>
          i.notes?.includes("Lịch hẹn xem phòng") ||
          i.notes?.includes("[LỊCH XEM PHÒNG]") ||
          i.notes?.toLowerCase().includes("lịch hẹn") ||
          i.message.toLowerCase().includes("xem phòng")
      );
    }

    // Status filter
    if (activeStatus !== "ALL") {
      list = list.filter((i) => i.status === activeStatus);
    }

    // Listing filter
    if (selectedListingId !== "ALL") {
      list = list.filter((i) => i.listing.id === selectedListingId);
    }

    // Search query filter (name, phone, listing title, message)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (i) =>
          i.renter.name.toLowerCase().includes(q) ||
          i.renter.phoneNumber.replace(/\s+/g, "").includes(q.replace(/\s+/g, "")) ||
          i.listing.title.toLowerCase().includes(q) ||
          i.message.toLowerCase().includes(q)
      );
    }

    // Date sort
    list.sort((a, b) => {
      const timeA = new Date(a.createdAt).getTime();
      const timeB = new Date(b.createdAt).getTime();
      return dateSort === "newest" ? timeB - timeA : timeA - timeB;
    });

    return list;
  }, [inquiries, onlyViewingTours, activeStatus, selectedListingId, searchQuery, dateSort]);

  const hasActiveFilters =
    activeStatus !== "ALL" ||
    searchQuery.trim() !== "" ||
    selectedListingId !== "ALL" ||
    dateSort !== "newest" ||
    onlyViewingTours;

  return (
    <>
      {/* 1. Dedicated Landlord Inquiries Header */}
      <InquiryHeader
        totalCount={stats.total}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onToggleMobileMenu={toggleMobileMenu}
      />

      {/* 2. Main Content Container */}
      <main className="px-4 sm:px-6 lg:px-8 xl:px-10 pt-4 sm:pt-6 lg:pt-8 pb-24 sm:pb-28 lg:pb-32 space-y-6 w-full max-w-[1920px] mx-auto">
        {/* 3. Four Compact Summary Cards */}
        <InquiryStatsSummary
          stats={stats}
          activeStatusFilter={activeStatus}
          onSelectFilter={setActiveStatus}
        />

        {/* 4. Filter Navigation (Tabs, Search, Date & Listing filters) */}
        <InquiryFilters
          activeStatus={activeStatus}
          onStatusChange={setActiveStatus}
          counts={{
            ALL: stats.total,
            PENDING: stats.pending,
            CONFIRMED: stats.confirmed || 0,
            REJECTED: stats.rejected || 0,
            CONTACTED: stats.contacted,
            CLOSED: stats.closed,
          }}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          dateSort={dateSort}
          onDateSortChange={setDateSort}
          selectedListingId={selectedListingId}
          onListingFilterChange={setSelectedListingId}
          availableListings={availableListings}
          onResetFilters={handleResetFilters}
          hasActiveFilters={hasActiveFilters}
          onlyViewingTours={onlyViewingTours}
          onToggleOnlyViewingTours={setOnlyViewingTours}
          viewingToursCount={viewingToursCount}
        />

        {/* 5. Main Data View (Loading, Empty, or Table) */}
        {isLoading ? (
          <InquiryEmptyState mode="loading" />
        ) : displayedInquiries.length === 0 ? (
          <InquiryEmptyState
            mode={hasActiveFilters ? "filtered-empty" : "empty"}
            searchQuery={searchQuery}
            onResetFilter={handleResetFilters}
          />
        ) : (
          <InquiryTable
            inquiries={displayedInquiries}
            onSelectInquiry={handleOpenDrawer}
            onQuickStatusChange={handleUpdateStatus}
            onRejectInquiry={setRejectTargetInquiry}
          />
        )}
      </main>

      {/* 6. Detail Slide-over Drawer */}
      <InquiryDetailDrawer
        inquiry={selectedInquiry}
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        onUpdateStatus={handleUpdateStatus}
        onRejectInquiry={setRejectTargetInquiry}
      />

      {/* 7. Dedicated Rejection Reason Modal */}
      <InquiryRejectModal
        inquiry={rejectTargetInquiry}
        isOpen={Boolean(rejectTargetInquiry)}
        onClose={() => setRejectTargetInquiry(null)}
        onConfirmReject={handleConfirmReject}
      />

      {/* 8. Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-200 border border-slate-700/80">
          <div className="w-7 h-7 rounded-lg bg-[#F4CD65] text-[#373523] flex items-center justify-center shrink-0">
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

