"use client";

import { 
  ShieldCheck, 
  Clock, 
  User, 
  CreditCard, 
  MapPin, 
  CheckCircle2, 
  AlertTriangle, 
  Eye, 
  Maximize2,
  RefreshCw,
  Sparkles
} from "lucide-react";
import { AdminKycVerificationItem } from "@/service/admin.service";

interface KycModerationTableProps {
  items: AdminKycVerificationItem[];
  onInspect: (item: AdminKycVerificationItem) => void;
  onQuickApprove: (userId: string) => void;
  onQuickReject: (item: AdminKycVerificationItem) => void;
  isProcessingId?: string | null;
}

export function KycModerationTable({
  items,
  onInspect,
  onQuickApprove,
  onQuickReject,
  isProcessingId,
}: KycModerationTableProps) {
  const formatDate = (isoStr?: string | null) => {
    if (!isoStr) return "Chưa xác định";
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return isoStr;
    }
  };

  const maskIdNumber = (idStr?: string) => {
    if (!idStr || idStr.length < 8) return idStr || "—";
    return idStr.slice(0, 4) + " •••• " + idStr.slice(-4);
  };

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200/90 p-12 text-center space-y-3 shadow-2xs">
        <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h3 className="text-base font-bold text-slate-900">
          Hàng chờ eKYC sạch sẽ!
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
          Hiện không có hồ sơ xác minh danh tính chủ nhà nào đang chờ kiểm duyệt. Hệ thống sẽ tự động cập nhật khi có hồ sơ mới được nộp.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-2xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/75 text-[11px] font-semibold uppercase tracking-wider text-[#57534E]">
              <th className="py-3.5 px-4 sm:px-6">Chủ nhà & Liên hệ</th>
              <th className="py-3.5 px-4">Thông tin CCCD khai báo</th>
              <th className="py-3.5 px-4">Ảnh thẻ CCCD</th>
              <th className="py-3.5 px-4">Thời gian gửi</th>
              <th className="py-3.5 px-4 sm:px-6 text-right">Thao tác kiểm duyệt</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
            {items.map((item) => {
              const isProcessing = isProcessingId === item.userId;
              const info = item.kycDetails?.personalInfo;
              const docs = item.kycDetails?.documents;

              return (
                <tr 
                  key={item.userId}
                  className="hover:bg-amber-50/30 transition-colors group"
                >
                  {/* Column 1: Landlord Profile */}
                  <td className="py-4 px-4 sm:px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-[#FFF1CC] text-[#805B10] flex items-center justify-center font-bold text-sm shrink-0 border border-[#F4CD65]/40 shadow-xs">
                        {(info?.fullName || item.user.fullName).charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-slate-900 leading-snug truncate">
                          {info?.fullName || item.user.fullName}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate">
                          {item.user.email}
                        </div>
                        {item.user.phoneNumber && (
                          <div className="text-[11px] font-mono text-[#805B10] font-medium">
                            {item.user.phoneNumber}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Column 2: CCCD Info */}
                  <td className="py-4 px-4">
                    <div className="space-y-1">
                      <div className="font-mono font-bold text-slate-900 tracking-wider">
                        {maskIdNumber(info?.idNumber)}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Sinh: {info?.dateOfBirth || "—"} · {info?.gender === "MALE" ? "Nam" : info?.gender === "FEMALE" ? "Nữ" : "Khác"}
                      </div>
                      <div className="text-[11px] text-slate-600 line-clamp-1 max-w-xs flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>{info?.permanentAddress || "Chưa cung cấp"}</span>
                      </div>
                    </div>
                  </td>

                  {/* Column 3: Photo Thumbnails */}
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      {docs?.frontImage ? (
                        <div 
                          onClick={() => onInspect(item)}
                          className="w-14 h-9 rounded-lg bg-slate-100 overflow-hidden border border-slate-200 relative group/thumb cursor-pointer shrink-0 shadow-2xs hover:ring-2 hover:ring-[#F4CD65]"
                          title="Bấm để xem ảnh mặt trước"
                        >
                          <img
                            src={docs.frontImage}
                            alt="Mặt trước"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-center justify-center text-white">
                            <Eye className="w-3.5 h-3.5" />
                          </div>
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-400">Thiếu trước</span>
                      )}

                      {docs?.backImage ? (
                        <div 
                          onClick={() => onInspect(item)}
                          className="w-14 h-9 rounded-lg bg-slate-100 overflow-hidden border border-slate-200 relative group/thumb cursor-pointer shrink-0 shadow-2xs hover:ring-2 hover:ring-[#F4CD65]"
                          title="Bấm để xem ảnh mặt sau"
                        >
                          <img
                            src={docs.backImage}
                            alt="Mặt sau"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-center justify-center text-white">
                            <Eye className="w-3.5 h-3.5" />
                          </div>
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-400">Thiếu sau</span>
                      )}
                    </div>
                  </td>

                  {/* Column 4: Timestamp */}
                  <td className="py-4 px-4 text-xs text-slate-600 whitespace-nowrap">
                    <div className="flex items-center gap-1.5 font-medium">
                      <Clock className="w-3.5 h-3.5 text-amber-500" />
                      <span>{formatDate(item.submittedAt)}</span>
                    </div>
                  </td>

                  {/* Column 5: Action Buttons */}
                  <td className="py-4 px-4 sm:px-6 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* View & Inspect Dossier */}
                      <button
                        type="button"
                        onClick={() => onInspect(item)}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors flex items-center gap-1 cursor-pointer"
                        title="Xem ảnh phóng to & đối chiếu chi tiết"
                      >
                        <Eye className="w-3.5 h-3.5 text-slate-500" />
                        <span>Xem đối chiếu</span>
                      </button>

                      {/* Quick Reject */}
                      <button
                        type="button"
                        onClick={() => onQuickReject(item)}
                        disabled={isProcessing}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
                        title="Từ chối hồ sơ kèm lý do"
                      >
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Từ chối</span>
                      </button>

                      {/* Quick Approve */}
                      <button
                        type="button"
                        onClick={() => onQuickApprove(item.userId)}
                        disabled={isProcessing}
                        className="px-3.5 py-1.5 rounded-xl text-xs font-medium text-[#292524] bg-[#F4CD65] hover:bg-[#ebbf4d] shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                        title="Phê duyệt và cấp Tích Xanh chính chủ"
                      >
                        {isProcessing ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        )}
                        <span>Duyệt Tích Xanh</span>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

