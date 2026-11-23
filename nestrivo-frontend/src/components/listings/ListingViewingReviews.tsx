"use client";

import { useState, useEffect, useRef } from "react";
import {
  Star,
  CheckCircle2,
  ShieldCheck,
  AlertCircle,
  CalendarCheck,
  ThumbsUp,
  ThumbsDown,
  Upload,
  X,
  Trash2,
  Loader2,
  MessageSquare,
  User,
  Maximize2,
  Clock,
  Sparkles,
  HelpCircle,
  ArrowRight
} from "lucide-react";
import { adminService } from "@/service/admin.service";
import { uploadImageToCloudinary } from "@/service/upload.service";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

interface ListingViewingReviewsProps {
  listingId: string;
  landlordId: string;
}

interface ReviewItem {
  id: string;
  renterId: string;
  landlordId: string;
  listingId: string;
  rating: number;
  accuracyRating?: number | null;
  communicationRating?: number | null;
  supportRating?: number | null;
  priceAccurate?: boolean | null;
  amenitiesAccurate?: boolean | null;
  evidenceUrls?: string[];
  content: string;
  isVerifiedStay: boolean;
  isVerifiedViewing: boolean;
  landlordResponse?: string | null;
  respondedAt?: string | null;
  createdAt: string;
  renter?: {
    id: string;
    fullName: string;
    avatarUrl?: string | null;
  };
}

interface ReviewStats {
  totalReviews: number;
  averageRating: number;
  accuracyAvg: number;
  communicationAvg: number;
  supportAvg: number;
  priceAccuracyPercent: number;
  verifiedViewingCount: number;
}

export default function ListingViewingReviews({
  listingId,
  landlordId,
}: ListingViewingReviewsProps) {
  const { user, isAuthenticated } = useAuth();

  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [filterStar, setFilterStar] = useState<number | null>(null);

  // Floating Toast State
  const [toast, setToast] = useState<{
    type: "success" | "error" | "warning" | "info";
    title: string;
    message: string;
    actionText?: string;
    actionUrl?: string;
  } | null>(null);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      setToast(null);
    }, 6000);
    return () => clearTimeout(timer);
  }, [toast]);

  // Review Form Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [eligibility, setEligibility] = useState<{
    canReview: boolean;
    canReviewViewing?: boolean;
    canReviewStay?: boolean;
    inquiryId?: string | null;
    rentalConfirmationId?: string | null;
    alreadyReviewed?: boolean;
    reason?: string;
  } | null>(null);
  const [isCheckingEligibility, setIsCheckingEligibility] = useState<boolean>(false);
  const [ineligibilityReason, setIneligibilityReason] = useState<string | null>(null);

  // Form Fields
  const [rating, setRating] = useState<number>(5);
  const [accuracyRating, setAccuracyRating] = useState<number>(5);
  const [communicationRating, setCommunicationRating] = useState<number>(5);
  const [supportRating, setSupportRating] = useState<number>(5);
  const [priceAccurate, setPriceAccurate] = useState<boolean>(true);
  const [amenitiesAccurate, setAmenitiesAccurate] = useState<boolean>(true);
  const [content, setContent] = useState<string>("");
  const [evidenceUrls, setEvidenceUrls] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);

  // Lightbox for photos
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch reviews on mount
  useEffect(() => {
    fetchReviews();
  }, [listingId, filterStar]);

  const fetchReviews = async () => {
    setIsLoading(true);
    try {
      const res = await adminService.getListingReviews(listingId, {
        star: filterStar || undefined,
        limit: 20,
      });
      if (res && res.data) {
        setReviews(res.data);
        if (res.stats) {
          setStats(res.stats);
        }
      }
    } catch (err) {
      console.error("Failed to fetch listing reviews:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenWriteReview = async () => {
    // 1. Kiểm tra trạng thái đăng nhập trên client để hiển thị toast ngay lập tức
    if (!isAuthenticated || !user) {
      setToast({
        type: "warning",
        title: "Yêu cầu đăng nhập",
        message: "Bạn cần đăng nhập tài khoản Nestrivo để viết đánh giá trải nghiệm xem phòng thực tế.",
        actionText: "Đăng nhập ngay",
        actionUrl: `/login?redirect=${encodeURIComponent(`/listings/${listingId}`)}`,
      });
      return;
    }

    setIsCheckingEligibility(true);
    setIneligibilityReason(null);
    try {
      const res = await adminService.checkReviewEligibility(listingId);
      setEligibility(res);

      if (res.alreadyReviewed) {
        const msg = "Bạn đã gửi đánh giá cho tin đăng này rồi. Mỗi người thuê được đánh giá 1 lần cho mỗi phòng.";
        setIneligibilityReason(msg);
        setToast({
          type: "info",
          title: "Đã có đánh giá",
          message: msg,
        });
        return;
      }

      if (res.reason === "IS_LANDLORD") {
        const msg = "Bạn là chủ nhà của tin đăng này nên không thể tự đánh giá phòng của mình.";
        setIneligibilityReason(msg);
        setToast({
          type: "warning",
          title: "Không thể tự đánh giá",
          message: msg,
        });
        return;
      }

      if (res.reason === "NOT_LOGGED_IN") {
        const msg = "Vui lòng đăng nhập tài khoản để đánh giá trải nghiệm xem phòng.";
        setIneligibilityReason(msg);
        setToast({
          type: "warning",
          title: "Yêu cầu đăng nhập",
          message: msg,
          actionText: "Đăng nhập ngay",
          actionUrl: `/login?redirect=${encodeURIComponent(`/listings/${listingId}`)}`,
        });
        return;
      }

      if (!res.canReview) {
        const msg = "Để đảm bảo 100% dữ liệu uy tín thực tế, chỉ người dùng đã đặt lịch hẹn xem phòng và được chủ nhà xác nhận trên Nestrivo mới có quyền đánh giá.";
        setIneligibilityReason(msg);
        setToast({
          type: "warning",
          title: "Chưa đủ điều kiện đánh giá",
          message: msg,
        });
        return;
      }

      // Eligible! Open form
      setIsModalOpen(true);
    } catch (err: any) {
      console.error("Check eligibility error:", err);
      const isAuthErr = err?.status === 401 || err?.message?.includes("401") || err?.message?.includes("token");
      const msg = isAuthErr
        ? "Phiên đăng nhập đã hết hạn hoặc bạn chưa đăng nhập. Vui lòng đăng nhập để tiếp tục."
        : (err?.message || "Đã xảy ra lỗi khi kiểm tra quyền đánh giá.");

      setIneligibilityReason(msg);
      setToast({
        type: "warning",
        title: isAuthErr ? "Yêu cầu đăng nhập" : "Thông báo",
        message: msg,
        actionText: isAuthErr ? "Đăng nhập ngay" : undefined,
        actionUrl: isAuthErr ? `/login?redirect=${encodeURIComponent(`/listings/${listingId}`)}` : undefined,
      });
    } finally {
      setIsCheckingEligibility(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (evidenceUrls.length + files.length > 4) {
      setSubmitError("Bạn chỉ có thể tải lên tối đa 4 hình ảnh thực tế.");
      return;
    }

    setIsUploading(true);
    setSubmitError(null);

    try {
      const uploaded: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file.type.startsWith("image/")) continue;
        const res = await uploadImageToCloudinary(file, { folder: "nestrivo/reviews" });
        if (res.secureUrl) {
          uploaded.push(res.secureUrl);
        }
      }
      setEvidenceUrls((prev) => [...prev, ...uploaded]);
    } catch (err) {
      console.error("Upload error:", err);
      setSubmitError("Lỗi tải ảnh lên. Vui lòng thử lại với ảnh nhỏ hơn (< 5MB).");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!content.trim() || content.trim().length < 15) {
      setSubmitError("Vui lòng viết nhận xét chi tiết ít nhất 15 ký tự để giúp ích cho những người thuê sau.");
      return;
    }

    setIsSubmitting(true);
    try {
      await adminService.createReview({
        listingId,
        landlordId,
        inquiryId: eligibility?.inquiryId,
        rating,
        accuracyRating,
        communicationRating,
        supportRating,
        priceAccurate,
        amenitiesAccurate,
        evidenceUrls,
        content: content.trim(),
      });

      setSubmitSuccess(true);
      fetchReviews();
    } catch (err: any) {
      console.error("Submit review error:", err);
      const msg = err?.message || err?.response?.data?.message || "Lỗi khi gửi đánh giá. Vui lòng thử lại.";
      setSubmitError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSubmitSuccess(false);
    setSubmitError(null);
    setContent("");
    setEvidenceUrls([]);
    setRating(5);
    setAccuracyRating(5);
    setCommunicationRating(5);
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1).toString().padStart(2, "0")}/${d.getFullYear()}`;
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-[#E5E7EB] p-5 sm:p-7 shadow-xs space-y-6">
      {/* 1. Header & Write Review Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5E7EB]">
        <div>
          <h2 className="text-base sm:text-lg font-semibold text-[#292524] flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>Đánh giá trải nghiệm xem phòng thực tế</span>
          </h2>
          <p className="text-xs text-[#78716C] mt-0.5">
            Dữ liệu uy tín từ những người thuê đã đặt lịch hẹn và đến xem phòng trực tiếp
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenWriteReview}
          disabled={isCheckingEligibility}
          className="px-4 py-2.5 rounded-xl bg-[#F4CD65] hover:bg-[#ebbf4d] active:bg-[#e0af36] text-[#292524] font-semibold text-xs transition-colors flex items-center justify-center gap-2 shrink-0 cursor-pointer shadow-xs disabled:opacity-50"
        >
          {isCheckingEligibility ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <CalendarCheck className="w-4 h-4 text-[#805B10]" />
          )}
          <span>Viết đánh giá xem phòng</span>
        </button>
      </div>

      {/* Ineligibility Warning dialog if user clicks button without qualifying appointment */}
      {ineligibilityReason && (
        <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs text-amber-900 flex items-start justify-between gap-3 animate-in fade-in">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold block text-amber-950">Điều kiện đánh giá xem phòng:</span>
              <p className="leading-relaxed">{ineligibilityReason}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIneligibilityReason(null)}
            className="text-amber-700 hover:text-amber-950 p-1 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 2. Aggregate KPI Stats Bar */}
      {stats && stats.totalReviews > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-[#FFFBF0]/60 border border-[#EDE5D5]">
          {/* Average Rating */}
          <div className="space-y-1">
            <span className="text-[11px] text-stone-500 font-medium block">Điểm trung bình</span>
            <div className="flex items-center gap-1.5">
              <span className="text-2xl font-bold text-[#292524]">{stats.averageRating}</span>
              <div className="flex items-center text-amber-400">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`w-3.5 h-3.5 ${s <= Math.round(stats.averageRating)
                      ? "fill-amber-400 text-amber-400"
                      : "text-stone-300"
                      }`}
                  />
                ))}
              </div>
            </div>
            <span className="text-[10px] text-stone-500 block">
              Dựa trên {stats.totalReviews} lượt đánh giá
            </span>
          </div>

          {/* Price Accuracy % */}
          <div className="space-y-1">
            <span className="text-[11px] text-stone-500 font-medium block">Đúng giá niêm yết</span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-emerald-700">{stats.priceAccuracyPercent}%</span>
              <span className="text-[10px] text-emerald-700 font-semibold">xác nhận</span>
            </div>
            <span className="text-[10px] text-stone-500 block">
              Không bị đội giá hoặc phụ phí vô lý
            </span>
          </div>

          {/* Real Accuracy Score */}
          <div className="space-y-1">
            <span className="text-[11px] text-stone-500 font-medium block">Đúng ảnh & thực tế</span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-[#805B10]">{stats.accuracyAvg || 5.0}</span>
              <span className="text-xs text-stone-500">/ 5.0</span>
            </div>
            <span className="text-[10px] text-stone-500 block">
              Mức độ trùng khớp với ảnh chụp
            </span>
          </div>

          {/* Landlord Communication */}
          <div className="space-y-1">
            <span className="text-[11px] text-stone-500 font-medium block">Thái độ chủ nhà</span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-[#292524]">{stats.communicationAvg || 5.0}</span>
              <span className="text-xs text-stone-500">/ 5.0</span>
            </div>
            <span className="text-[10px] text-stone-500 block">
              Nhiệt tình, trung thực khi đón khách
            </span>
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-2xl bg-stone-50/70 border border-dashed border-stone-200 text-center space-y-1.5 py-6">
          <ShieldCheck className="w-8 h-8 text-stone-400 mx-auto" />
          <p className="text-xs font-semibold text-[#292524]">
            Chưa có đánh giá xem phòng nào cho tin đăng này
          </p>
          <p className="text-[11px] text-stone-500 max-w-sm mx-auto">
            Bạn đã từng đến xem phòng trọ này? Hãy đặt lịch xem và để lại đánh giá thực tế đầu tiên để nhận điểm uy tín Nestrivo!
          </p>
        </div>
      )}

      {/* 3. Filter by Star */}
      {reviews.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <button
            type="button"
            onClick={() => setFilterStar(null)}
            className={`px-3 py-1.5 rounded-xl font-medium transition-colors cursor-pointer shrink-0 ${filterStar === null
              ? "bg-[#292524] text-white"
              : "bg-stone-100 hover:bg-stone-200 text-stone-700"
              }`}
          >
            Tất cả ({stats?.totalReviews || reviews.length})
          </button>
          {[5, 4, 3, 2, 1].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setFilterStar(filterStar === s ? null : s)}
              className={`px-3 py-1.5 rounded-xl font-medium transition-colors cursor-pointer shrink-0 flex items-center gap-1 ${filterStar === s
                ? "bg-[#805B10] text-white"
                : "bg-stone-100 hover:bg-stone-200 text-stone-700"
                }`}
            >
              <span>{s} sao</span>
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            </button>
          ))}
        </div>
      )}

      {/* 4. Reviews List */}
      <div className="space-y-4">
        {reviews.map((rev) => (
          <div
            key={rev.id}
            className="p-4 sm:p-5 rounded-2xl bg-[#F8FAFC] border border-slate-100 space-y-3"
          >
            {/* Top row: Renter info & Badges */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-stone-200 border border-stone-300 overflow-hidden flex items-center justify-center shrink-0">
                  {rev.renter?.avatarUrl ? (
                    <img
                      src={rev.renter.avatarUrl}
                      alt={rev.renter.fullName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-5 h-5 text-stone-500" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs sm:text-sm text-[#292524]">
                      {rev.renter?.fullName || "Người thuê ẩn danh"}
                    </span>
                    {rev.isVerifiedViewing && (
                      <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Đã xem phòng thực tế</span>
                      </span>
                    )}
                    {rev.isVerifiedStay && (
                      <span className="px-2 py-0.5 rounded-md bg-sky-50 text-sky-800 border border-sky-200 text-[10px] font-semibold flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-sky-600" />
                        <span>Đã thuê trọ</span>
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-stone-400 block mt-0.5">
                    Đánh giá ngày {formatDate(rev.createdAt)}
                  </span>
                </div>
              </div>

              {/* Star Rating */}
              <div className="flex items-center gap-1 text-amber-400 shrink-0">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`w-3.5 h-3.5 ${s <= rev.rating ? "fill-amber-400 text-amber-400" : "text-stone-300"
                      }`}
                  />
                ))}
              </div>
            </div>

            {/* Verification Criteria Pills */}
            <div className="flex flex-wrap items-center gap-2 text-[11px]">
              {rev.priceAccurate !== null && rev.priceAccurate !== undefined && (
                <span
                  className={`px-2 py-1 rounded-lg border font-medium flex items-center gap-1 ${rev.priceAccurate
                    ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                    : "bg-rose-50 text-rose-800 border-rose-200"
                    }`}
                >
                  {rev.priceAccurate ? (
                    <>
                      <ThumbsUp className="w-3 h-3 text-emerald-600" />
                      <span>Đúng giá niêm yết</span>
                    </>
                  ) : (
                    <>
                      <ThumbsDown className="w-3 h-3 text-rose-600" />
                      <span>Giá thực tế khác tin đăng</span>
                    </>
                  )}
                </span>
              )}

              {rev.amenitiesAccurate !== null && rev.amenitiesAccurate !== undefined && (
                <span
                  className={`px-2 py-1 rounded-lg border font-medium flex items-center gap-1 ${rev.amenitiesAccurate
                    ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                    : "bg-amber-50 text-amber-800 border-amber-200"
                    }`}
                >
                  {rev.amenitiesAccurate ? (
                    <>
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>Đúng tiện ích quảng cáo</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-3 h-3 text-amber-600" />
                      <span>Thiếu tiện ích so với tin</span>
                    </>
                  )}
                </span>
              )}

              {rev.accuracyRating && (
                <span className="px-2 py-1 rounded-lg bg-stone-100 text-stone-700 border border-stone-200">
                  Độ chính xác ảnh: <strong>{rev.accuracyRating}/5</strong>
                </span>
              )}

              {rev.communicationRating && (
                <span className="px-2 py-1 rounded-lg bg-stone-100 text-stone-700 border border-stone-200">
                  Chủ nhà: <strong>{rev.communicationRating}/5</strong>
                </span>
              )}
            </div>

            {/* Review Comment Content */}
            <p className="text-xs sm:text-sm text-[#292524] leading-relaxed whitespace-pre-line">
              {rev.content}
            </p>

            {/* Evidence Photos (if user took photos during viewing) */}
            {rev.evidenceUrls && rev.evidenceUrls.length > 0 && (
              <div className="pt-1 space-y-1.5">
                <span className="text-[11px] font-semibold text-stone-500 block">
                  Ảnh chụp thực tế khi xem phòng ({rev.evidenceUrls.length} ảnh):
                </span>
                <div className="flex flex-wrap gap-2">
                  {rev.evidenceUrls.map((url, imgIdx) => (
                    <button
                      key={imgIdx}
                      type="button"
                      onClick={() => setSelectedPhoto(url)}
                      className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border border-stone-200 group cursor-pointer"
                    >
                      <img
                        src={url}
                        alt={`Ảnh chụp ${imgIdx + 1}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                        <Maximize2 className="w-4 h-4" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Landlord Response (if present) */}
            {rev.landlordResponse && (
              <div className="p-3 rounded-xl bg-white border border-[#EDE5D5] space-y-1 text-xs mt-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[#805B10] flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Phản hồi từ chủ nhà</span>
                  </span>
                  {rev.respondedAt && (
                    <span className="text-[10px] text-stone-400">
                      {formatDate(rev.respondedAt)}
                    </span>
                  )}
                </div>
                <p className="text-stone-700 leading-relaxed italic">
                  &ldquo;{rev.landlordResponse}&rdquo;
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 5. Photo Lightbox Modal */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-xs"
          onClick={() => setSelectedPhoto(null)}
        >
          <div className="relative max-w-3xl max-h-[90vh] overflow-hidden rounded-2xl bg-black">
            <button
              type="button"
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-3 right-3 p-2 rounded-full bg-black/60 text-white hover:bg-black transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={selectedPhoto}
              alt="Ảnh phóng to"
              className="max-h-[85vh] w-auto object-contain mx-auto"
            />
          </div>
        </div>
      )}

      {/* 6. WRITE VIEWING REVIEW MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div
            className="w-full max-w-lg max-h-[90vh] bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-5 border-b border-stone-100 flex items-center justify-between bg-[#FFFBF0]/60 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#292524]">
                    Đánh giá trải nghiệm xem phòng
                  </h3>
                  <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Lịch hẹn xem phòng hợp lệ đã xác nhận</span>
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCloseModal}
                className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-4 text-xs text-[#292524] flex-1">
              {submitSuccess ? (
                <div className="text-center py-6 space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <h4 className="text-base font-bold text-[#292524]">
                    Cảm ơn bạn đã gửi đánh giá!
                  </h4>
                  <p className="text-stone-600 text-xs max-w-sm mx-auto leading-relaxed">
                    Nhận xét thực tế của bạn sẽ được hiển thị công khai kèm huy hiệu <strong>&ldquo;Đã xem phòng thực tế&rdquo;</strong>, giúp cộng đồng người thuê phòng có thông tin minh bạch nhất.
                  </p>
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-5 py-2 rounded-xl bg-[#F4CD65] hover:bg-[#ebbf4d] text-[#292524] font-semibold text-xs cursor-pointer"
                  >
                    Đóng
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmitReview} className="space-y-4">
                  {submitError && (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                      <span>{submitError}</span>
                    </div>
                  )}

                  {/* 1. Overall Rating */}
                  <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
                    <label className="font-bold text-stone-800 block">
                      1. Đánh giá chung về buổi xem phòng (1 - 5 sao):
                    </label>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setRating(s)}
                          className="p-1 hover:scale-110 transition-transform cursor-pointer"
                        >
                          <Star
                            className={`w-7 h-7 ${s <= rating
                              ? "fill-amber-400 text-amber-400"
                              : "text-stone-300 hover:text-stone-400"
                              }`}
                          />
                        </button>
                      ))}
                      <span className="ml-2 font-bold text-sm text-[#805B10]">
                        {rating === 5 ? "Rất hài lòng" : rating === 4 ? "Hài lòng" : rating === 3 ? "Bình thường" : rating === 2 ? "Không hài lòng" : "Rất tệ"}
                      </span>
                    </div>
                  </div>

                  {/* 2. Quick Verification Questions */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Price Accuracy */}
                    <div className="p-3 rounded-2xl border border-stone-200 bg-white space-y-2">
                      <span className="font-bold text-stone-800 block">
                        Giá thuê có đúng như tin đăng?
                      </span>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setPriceAccurate(true)}
                          className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${priceAccurate
                            ? "bg-emerald-50 text-emerald-800 border-emerald-300 ring-1 ring-emerald-300"
                            : "bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100"
                            }`}
                        >
                          <ThumbsUp className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Đúng giá</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setPriceAccurate(false)}
                          className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${!priceAccurate
                            ? "bg-rose-50 text-rose-800 border-rose-300 ring-1 ring-rose-300"
                            : "bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100"
                            }`}
                        >
                          <ThumbsDown className="w-3.5 h-3.5 text-rose-600" />
                          <span>Bị đội giá</span>
                        </button>
                      </div>
                    </div>

                    {/* Amenities Accuracy */}
                    <div className="p-3 rounded-2xl border border-stone-200 bg-white space-y-2">
                      <span className="font-bold text-stone-800 block">
                        Phòng đúng tiện ích quảng cáo?
                      </span>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setAmenitiesAccurate(true)}
                          className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${amenitiesAccurate
                            ? "bg-emerald-50 text-emerald-800 border-emerald-300 ring-1 ring-emerald-300"
                            : "bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100"
                            }`}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Đầy đủ, đúng</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setAmenitiesAccurate(false)}
                          className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${!amenitiesAccurate
                            ? "bg-amber-50 text-amber-800 border-amber-300 ring-1 ring-amber-300"
                            : "bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100"
                            }`}
                        >
                          <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                          <span>Thiếu tiện ích</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* 3. Detailed Sub-ratings */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 p-3 rounded-2xl bg-stone-50/80 border border-stone-200">
                    <div className="flex items-center justify-between">
                      <span className="text-stone-600 font-medium">Độ đúng thực tế của ảnh:</span>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => setAccuracyRating(s)}
                            className="cursor-pointer"
                          >
                            <Star
                              className={`w-4 h-4 ${s <= accuracyRating
                                ? "fill-amber-400 text-amber-400"
                                : "text-stone-300"
                                }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-stone-600 font-medium">Thái độ chủ nhà khi gặp:</span>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => setCommunicationRating(s)}
                            className="cursor-pointer"
                          >
                            <Star
                              className={`w-4 h-4 ${s <= communicationRating
                                ? "fill-amber-400 text-amber-400"
                                : "text-stone-300"
                                }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* 4. Detailed Comment */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-stone-800 block">
                      Nhận xét thêm về trải nghiệm thực tế <span className="text-rose-500">*</span>:
                    </label>
                    <textarea
                      rows={3}
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="Chia sẻ thực tế về vị trí hẻm, ánh sáng, phòng vệ sinh, thái độ đón khách của chủ nhà..."
                      className="w-full p-3 rounded-2xl border border-stone-200 text-xs text-[#292524] placeholder-stone-400 focus:outline-hidden focus:ring-2 focus:ring-[#F4CD65] resize-none"
                    />
                  </div>

                  {/* 5. Upload evidence photos */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-stone-800 block">
                        Đính kèm ảnh chụp thực tế (tối đa 4 ảnh):
                      </span>
                      <span className="text-[11px] text-stone-500">{evidenceUrls.length}/4</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading || evidenceUrls.length >= 4}
                        className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-medium border border-stone-200 flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                      >
                        {isUploading ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-[#805B10]" />
                        ) : (
                          <Upload className="w-3.5 h-3.5 text-[#805B10]" />
                        )}
                        <span>{isUploading ? "Đang tải ảnh..." : "Thêm ảnh chụp"}</span>
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={handleFileUpload}
                      />
                    </div>

                    {evidenceUrls.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-1">
                        {evidenceUrls.map((url, idx) => (
                          <div
                            key={idx}
                            className="relative w-14 h-14 rounded-xl overflow-hidden border border-stone-200 group"
                          >
                            <img src={url} alt={`Upload ${idx}`} className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => setEvidenceUrls((prev) => prev.filter((_, i) => i !== idx))}
                              className="absolute inset-0 bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Submit buttons */}
                  <div className="pt-2 border-t border-stone-100 flex items-center justify-end gap-2.5">
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      disabled={isSubmitting}
                      className="px-4 py-2 rounded-xl border border-stone-200 text-xs font-semibold text-stone-600 hover:bg-stone-100 cursor-pointer"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting || isUploading}
                      className="px-5 py-2 rounded-xl bg-[#F4CD65] hover:bg-[#ebbf4d] text-[#292524] font-bold text-xs transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Đang đăng...</span>
                        </>
                      ) : (
                        <span>Gửi đánh giá công khai</span>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Floating Toast Feedback Notification */}
      {toast && (
        <div className="fixed top-24 right-4 sm:right-6 z-50 max-w-sm w-[calc(100vw-32px)] sm:w-full animate-in slide-in-from-top-4 fade-in duration-300">
          <div
            className={`p-4 rounded-2xl shadow-2xl border backdrop-blur-md flex items-start gap-3 ${toast.type === "success"
              ? "bg-emerald-50/95 border-emerald-300 text-emerald-950"
              : toast.type === "warning"
                ? "bg-[#FFF9EE]/98 border-[#F4CD65] text-[#451A03] ring-1 ring-[#F4CD65]/60"
                : toast.type === "error"
                  ? "bg-rose-50/95 border-rose-300 text-rose-950"
                  : "bg-sky-50/95 border-sky-300 text-sky-950"
              }`}
          >
            <div className="shrink-0 mt-0.5">
              {toast.type === "success" && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
              {toast.type === "warning" && <AlertCircle className="w-5 h-5 text-[#D97706]" />}
              {toast.type === "error" && <AlertCircle className="w-5 h-5 text-rose-600" />}
              {toast.type === "info" && <HelpCircle className="w-5 h-5 text-sky-600" />}
            </div>

            <div className="flex-1 space-y-1">
              <h5 className="font-bold text-xs sm:text-sm">{toast.title}</h5>
              <p className="text-xs opacity-90 leading-relaxed">{toast.message}</p>
              {toast.actionUrl && (
                <div className="pt-2">
                  <Link
                    href={toast.actionUrl}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#292524] text-white text-xs font-semibold hover:bg-black transition-colors shadow-xs"
                  >
                    <span>{toast.actionText || "Đăng nhập ngay"}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setToast(null)}
              className="p-1 rounded-lg hover:bg-black/5 opacity-60 hover:opacity-100 transition-opacity cursor-pointer shrink-0"
              title="Đóng thông báo"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
