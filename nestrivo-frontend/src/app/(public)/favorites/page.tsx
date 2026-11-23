"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Heart, Home, ChevronRight, ArrowRight, Trash2, Sparkles, AlertCircle } from "lucide-react";
import ListingCard from "@/components/listings/ListingCard";
import { useFavorites } from "@/context/FavoritesContext";
import { useAuth } from "@/context/AuthContext";
import { formatVND } from "@/lib/utils";

export default function FavoritesPage() {
  const { isAuthenticated } = useAuth();
  const {
    favoritesList,
    favoritesCount,
    fetchFavoritesList,
    clearFavorites,
    isLoadingList,
  } = useFavorites();

  const [isClearing, setIsClearing] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  useEffect(() => {
    fetchFavoritesList();
  }, [fetchFavoritesList]);

  const handleConfirmClear = async () => {
    setIsClearing(true);
    try {
      await clearFavorites();
      setShowClearConfirm(false);
    } finally {
      setIsClearing(false);
    }
  };

  // Tính toán nhanh mức giá thấp nhất & cao nhất trong danh sách đã lưu
  const prices = favoritesList.map((l) => Number(l.price) || 0).filter((p) => p > 0);
  const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
  const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;

  return (
    <div className="min-h-screen bg-[#FFFAEF] text-[#373523] pb-24">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-[#EDE5D5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-[#77715F]">
            <Link href="/" className="hover:text-[#373523] transition-colors flex items-center gap-1">
              <Home className="w-3.5 h-3.5" />
              <span>Trang chủ</span>
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-[#A8A190]" />
            <span className="font-bold text-[#373523]">Tin đã lưu</span>
          </div>
          {favoritesCount > 0 && (
            <span className="text-[#805B10] font-semibold bg-[#FFF7E5] px-2.5 py-1 rounded-full border border-[#F4CD65]/40">
              {favoritesCount} phòng đã lưu
            </span>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        {/* Header & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EDE5D5] pb-5">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-[#292524]">
                Phòng trọ & Căn hộ đã lưu
              </h1>
              {favoritesCount > 0 && (
                <span className="px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-200 text-xs font-bold">
                  {favoritesCount}
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-[#57534E] mt-1 font-normal">
              Danh sách các phòng trọ bạn đã đánh dấu yêu thích để tiện theo dõi, so sánh và đặt lịch hẹn xem phòng
            </p>
          </div>

          {favoritesList.length > 0 && (
            <div className="flex items-center gap-2 self-start sm:self-auto">
              {showClearConfirm ? (
                <div className="flex items-center gap-2 bg-rose-50 p-1.5 pl-3 rounded-2xl border border-rose-200 animate-in fade-in">
                  <span className="text-xs font-semibold text-rose-700">Xóa tất cả?</span>
                  <button
                    type="button"
                    onClick={handleConfirmClear}
                    disabled={isClearing}
                    className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow-2xs transition-all cursor-pointer"
                  >
                    {isClearing ? "Đang xóa..." : "Xác nhận"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowClearConfirm(false)}
                    disabled={isClearing}
                    className="px-2.5 py-1 bg-white hover:bg-stone-100 text-stone-700 rounded-xl text-xs font-medium border border-stone-200 transition-all cursor-pointer"
                  >
                    Hủy
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowClearConfirm(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium text-rose-600 hover:text-rose-700 bg-rose-50/70 hover:bg-rose-100/70 border border-rose-200/80 transition-all cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Xóa tất cả tin đã lưu</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Guest Banner if not authenticated */}
        {!isAuthenticated && favoritesCount > 0 && (
          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-center justify-between gap-3 text-xs text-[#805B10]">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                Bạn đang xem tin đã lưu trên trình duyệt này. Hãy <strong>đăng nhập</strong> để lưu vĩnh viễn và đồng bộ trên mọi thiết bị.
              </span>
            </div>
            <Link
              href="/login"
              className="px-3 py-1.5 rounded-xl bg-[#F4CD65] hover:bg-[#ebbf4d] text-[#292524] font-semibold shrink-0 shadow-2xs transition-all"
            >
              Đăng nhập ngay
            </Link>
          </div>
        )}

        {/* Content Section */}
        {isLoadingList ? (
          /* Loading Skeletons */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-[#EDE5D5] p-3 space-y-3 animate-pulse"
              >
                <div className="aspect-[16/10] bg-stone-200 rounded-xl" />
                <div className="h-4 bg-stone-200 rounded w-3/4" />
                <div className="h-3 bg-stone-200 rounded w-1/2" />
                <div className="pt-2 border-t border-stone-100 flex justify-between">
                  <div className="h-4 bg-stone-200 rounded w-1/3" />
                  <div className="h-6 bg-stone-200 rounded-lg w-16" />
                </div>
              </div>
            ))}
          </div>
        ) : favoritesList.length > 0 ? (
          <div className="space-y-6">
            {/* Quick summary banner */}
            <div className="bg-white rounded-2xl border border-[#EDE5D5] p-4 flex flex-wrap items-center justify-between gap-4 text-xs shadow-2xs">
              <div className="flex items-center gap-2 text-[#57534E]">
                <Sparkles className="w-4 h-4 text-[#805B10]" />
                <span>
                  Đang hiển thị <strong>{favoritesList.length}</strong> phòng trọ phù hợp với nhu cầu của bạn
                </span>
              </div>
              {prices.length > 0 && (
                <div className="flex items-center gap-2 text-[#292524] font-medium">
                  <span>Khoảng giá đã lưu:</span>
                  <span className="font-bold text-[#805B10]">
                    {formatVND(minPrice)} - {formatVND(maxPrice)}/tháng
                  </span>
                </div>
              )}
            </div>

            {/* Grid of Listings */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {favoritesList.map((listing) => (
                <ListingCard
                  key={listing.id}
                  listing={{
                    ...listing,
                    isFavorited: true,
                  }}
                />
              ))}
            </div>
          </div>
        ) : (
          /* Empty State */
          <div className="bg-white rounded-3xl border border-[#EDE5D5] p-10 sm:p-14 text-center space-y-4 shadow-2xs max-w-xl mx-auto my-12">
            <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-500 border border-rose-200/80 flex items-center justify-center mx-auto shadow-xs">
              <Heart className="w-8 h-8 fill-rose-100" />
            </div>
            <div className="space-y-1">
              <h2 className="text-base sm:text-lg font-semibold text-[#292524]">
                Chưa có phòng trọ nào được lưu
              </h2>
              <p className="text-xs sm:text-sm text-[#57534E] leading-relaxed font-normal">
                Khi xem danh sách phòng, hãy nhấn vào biểu tượng trái tim để lưu lại những căn phòng bạn ưng ý nhất vào danh sách này nhé!
              </p>
            </div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-[#F4CD65] hover:bg-[#ebbf4d] text-[#292524] font-medium text-xs sm:text-sm shadow-xs transition-all cursor-pointer"
            >
              <span>Khám phá phòng trọ ngay</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
