"use client";

import Image from "next/image";
import { 
  Check, 
  X, 
  Eye, 
  ShieldCheck, 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  XCircle,
  MapPin
} from "lucide-react";
import { AdminListingItem } from "@/types/admin";
import { formatPriceVnd, formatListingDate } from "@/lib/landlord-listing-helpers";

interface ModerationTableProps {
  listings: AdminListingItem[];
  onInspect: (listing: AdminListingItem) => void;
  onQuickApprove: (id: string) => void;
  onQuickReject: (listing: AdminListingItem) => void;
  isProcessingId?: string | null;
}

const PROPERTY_TYPE_NAMES: Record<string, string> = {
  ROOM_RENTAL: "Phòng trọ",
  STUDIO: "Studio",
  SERVICE_APARTMENT: "Căn hộ DV",
  WHOLE_HOUSE: "Nguyên căn",
  APARTMENT: "Chung cư",
  ROOM_SHARE: "Ở ghép",
};

export function ModerationTable({
  listings,
  onInspect,
  onQuickApprove,
  onQuickReject,
  isProcessingId,
}: ModerationTableProps) {
  if (listings.length === 0) {
    return (
      <div className="bg-white rounded-3xl border border-[#EDE5D5] p-12 text-center">
        <div className="w-16 h-16 rounded-2xl bg-[#FFF1CC] text-[#805B10] flex items-center justify-center mx-auto mb-4 border border-[#F4CD65]/40">
          <CheckCircle2 className="w-8 h-8 text-[#DCA936]" />
        </div>
        <h3 className="text-base font-semibold text-[#292524] mb-1">
          Hàng đợi kiểm duyệt đang trống!
        </h3>
        <p className="text-xs sm:text-sm text-[#57534E] max-w-md mx-auto font-normal">
          Không có tin đăng nào cần xử lý hoặc phù hợp với bộ lọc hiện tại. Tất cả tin đều đã được kiểm tra kịp thời theo SLA.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-[#EDE5D5] shadow-xs overflow-hidden">
      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#EDE5D5] bg-[#FFF7E5]/75 text-[11px] font-semibold text-[#57534E] uppercase tracking-wider">
              <th className="py-3.5 px-4 sm:px-6 min-w-[320px]">Thông tin phòng cho thuê</th>
              <th className="py-3.5 px-4 w-48 xl:w-56">Chủ nhà & KYC</th>
              <th className="py-3.5 px-4 w-44 xl:w-48">Thời gian gửi</th>
              <th className="py-3.5 px-4 w-36 xl:w-44">Trạng thái</th>
              <th className="py-3.5 px-4 sm:px-6 w-36 xl:w-40 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EDE5D5]/60 text-sm">
            {listings.map((item) => {
              const isPending = item.status === "PENDING_APPROVAL";
              const isApproved = item.status === "PUBLISHED";
              const isRejected = item.status === "REJECTED";
              const isProcessing = isProcessingId === item.id;
              const isKyc = Boolean(
                item.landlord?.isKycVerified ||
                item.landlord?.landlordProfile?.verificationStatus === "VERIFIED" ||
                item.landlord?.verificationRequests?.[0]?.status === "VERIFIED"
              );

              return (
                <tr
                  key={item.id}
                  className="hover:bg-[#FFF7E5]/40 transition-colors group cursor-pointer"
                  onClick={() => onInspect(item)}
                >
                  {/* Column 1: Phòng cho thuê */}
                  <td className="py-4 px-4 sm:px-6">
                    <div className="flex items-start gap-3.5">
                      <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-[#FFF7E5] border border-[#EDE5D5] shrink-0">
                        <Image
                          src={item.thumbnailUrl || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=300"}
                          alt={item.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="px-2 py-0.5 rounded-lg text-[10px] font-medium bg-[#FFFAEF] text-[#292524] border border-[#EDE5D5]">
                            {PROPERTY_TYPE_NAMES[item.propertyType] || item.propertyType}
                          </span>
                          <span className="text-xs font-semibold text-[#805B10]">
                            {formatPriceVnd(item.price)}/tháng
                          </span>
                        </div>
                        <p className="font-semibold text-[#292524] text-sm line-clamp-1 group-hover:text-[#DCA936] transition-colors">
                          {item.title}
                        </p>
                        <p className="text-xs text-[#77715F] line-clamp-1 mt-0.5 flex items-center gap-1">
                          <MapPin className="w-3 h-3 shrink-0 text-[#A8A190]" />
                          <span>{item.address}, {item.district}</span>
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Column 2: Chủ nhà & KYC */}
                  <td className="py-4 px-4" onClick={(e) => e.stopPropagation()}>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-[#373523] text-xs sm:text-sm truncate">
                          {item.landlord?.fullName || "Chưa cập nhật"}
                        </span>
                        {isKyc ? (
                          <span title="Chủ nhà đã xác minh danh tính" className="text-[#DCA936]">
                            <ShieldCheck className="w-4 h-4 shrink-0" />
                          </span>
                        ) : (
                          <span title="Chưa hoàn tất KYC" className="text-amber-500">
                            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#77715F] mt-0.5 truncate">
                        SĐT: {item.landlord?.phoneNumber || "Chưa có"}
                      </p>
                      <div className="mt-1">
                        {isKyc ? (
                          <span className="inline-block px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-[#FFF1CC] text-[#805B10] border border-[#F4CD65]/40">
                            Đã KYC
                          </span>
                        ) : (
                          <span className="inline-block px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                            Chưa KYC
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Column 3: Thời gian gửi */}
                  <td className="py-4 px-4">
                    <div className="flex flex-col text-xs text-[#77715F]">
                      <span className="font-semibold flex items-center gap-1 text-[#373523]">
                        <Clock className="w-3 h-3 text-[#A8A190]" />
                        {formatListingDate(item.createdAt)}
                      </span>
                      {isPending && (
                        <span className="text-[11px] font-bold text-[#805B10] mt-0.5">
                          Hàng đợi ưu tiên FIFO
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Column 4: Trạng thái */}
                  <td className="py-4 px-4">
                    {isPending && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-[#FFF1CC] text-[#805B10] border border-[#F4CD65]/50">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#F4CD65] animate-pulse" />
                        Chờ kiểm duyệt
                      </span>
                    )}
                    {isApproved && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-[#FFF7E5] text-[#292524] border border-[#EDE5D5]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#DCA936]" />
                        Đang xuất bản
                      </span>
                    )}
                    {isRejected && (
                      <div>
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-800 border border-rose-200">
                          <XCircle className="w-3.5 h-3.5 text-rose-600" />
                          Bị từ chối
                        </span>
                        {item.rejectionReason && (
                          <p className="text-[11px] text-rose-600 mt-1 line-clamp-1 max-w-[200px]" title={item.rejectionReason}>
                            {item.rejectionReason}
                          </p>
                        )}
                      </div>
                    )}
                    {item.status === "HIDDEN" && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                        Đang tạm ẩn
                      </span>
                    )}
                  </td>

                  {/* Column 5: Thao tác */}
                  <td className="py-4 px-4 sm:px-6 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => onInspect(item)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-[#EDE5D5] text-xs font-bold text-[#373523] hover:bg-[#FFF7E5] transition-colors"
                        title="Xem chi tiết toàn bộ tin đăng"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Xem</span>
                      </button>

                      {isPending && (
                        <>
                          <button
                            type="button"
                            onClick={() => onQuickApprove(item.id)}
                            disabled={isProcessing}
                            className="p-1.5 rounded-xl bg-[#FFF1CC] text-[#805B10] hover:bg-[#F4CD65] hover:text-[#373523] border border-[#F4CD65]/50 transition-all disabled:opacity-50"
                            title="Phê duyệt nhanh tin đăng này"
                          >
                            <Check className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => onQuickReject(item)}
                            disabled={isProcessing}
                            className="p-1.5 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-600 hover:text-white border border-rose-200 transition-all disabled:opacity-50"
                            title="Từ chối tin kèm lý do"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden divide-y divide-[#EDE5D5]/60">
        {listings.map((item) => {
          const isPending = item.status === "PENDING_APPROVAL";
          const isApproved = item.status === "PUBLISHED";
          const isRejected = item.status === "REJECTED";
          const isProcessing = isProcessingId === item.id;
          const isKyc = item.landlord?.landlordProfile?.verificationStatus === "VERIFIED";

          return (
            <div
              key={item.id}
              className="p-4 space-y-3 cursor-pointer hover:bg-[#FFF7E5]/40 transition-colors"
              onClick={() => onInspect(item)}
            >
              <div className="flex gap-3">
                <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-[#FFF7E5] border border-[#EDE5D5] shrink-0">
                  <Image
                    src={item.thumbnailUrl || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=300"}
                    alt={item.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-[#FFFAEF] text-[#292524] border border-[#EDE5D5]">
                      {PROPERTY_TYPE_NAMES[item.propertyType] || item.propertyType}
                    </span>
                    <span className="text-xs font-semibold text-[#805B10]">
                      {formatPriceVnd(item.price)}/th
                    </span>
                  </div>
                  <h4 className="font-semibold text-[#292524] text-xs sm:text-sm line-clamp-2">
                    {item.title}
                  </h4>
                  <p className="text-[11px] text-[#78716C] mt-1 truncate font-normal">
                    {item.address}, {item.district}
                  </p>
                </div>
              </div>

              {/* Landlord & Status Info */}
              <div className="flex items-center justify-between text-xs pt-1 border-t border-[#EDE5D5]/60 text-[#78716C]">
                <div className="flex items-center gap-1 truncate">
                  <span>Chủ nhà: <strong className="text-[#292524] font-medium">{item.landlord?.fullName}</strong></span>
                  {isKyc ? (
                    <ShieldCheck className="w-3.5 h-3.5 text-[#DCA936]" />
                  ) : (
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                  )}
                </div>
                <div>
                  {isPending && (
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#FFF1CC] text-[#805B10] border border-[#F4CD65]/40">
                      Chờ duyệt
                    </span>
                  )}
                  {isApproved && (
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#FFF7E5] text-[#292524] border border-[#EDE5D5]">
                      Đã duyệt
                    </span>
                  )}
                  {isRejected && (
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-rose-50 text-rose-800 border border-rose-200">
                      Bị từ chối
                    </span>
                  )}
                </div>
              </div>

              {/* Action row */}
              <div className="flex items-center justify-end gap-2 pt-2" onClick={(e) => e.stopPropagation()}>
                <button
                  type="button"
                  onClick={() => onInspect(item)}
                  className="px-3 py-1.5 rounded-xl border border-[#EDE5D5] text-xs font-medium text-[#292524] hover:bg-[#FFF7E5]"
                >
                  Xem chi tiết
                </button>
                {isPending && (
                  <>
                    <button
                      type="button"
                      onClick={() => onQuickReject(item)}
                      disabled={isProcessing}
                      className="px-3 py-1.5 rounded-xl bg-rose-50 text-rose-700 text-xs font-medium border border-rose-200"
                    >
                      Từ chối
                    </button>
                    <button
                      type="button"
                      onClick={() => onQuickApprove(item.id)}
                      disabled={isProcessing}
                      className="px-3.5 py-1.5 rounded-xl bg-[#F4CD65] text-[#292524] text-xs font-medium shadow-xs hover:bg-[#ebbf4d]"
                    >
                      Duyệt ngay
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
