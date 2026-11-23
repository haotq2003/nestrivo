import Link from "next/link";
import { PlusCircle, Building2, ShieldCheck, CheckCircle2 } from "lucide-react";

interface EmptyListingsStateProps {
  filterStatus?: string;
  onResetFilter?: () => void;
}

export function EmptyListingsState({ filterStatus, onResetFilter }: EmptyListingsStateProps) {
  if (filterStatus && filterStatus !== "ALL") {
    return (
      <div className="p-12 text-center bg-white rounded-2xl border border-slate-200/90 space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
          <Building2 className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-bold text-slate-900">
            Không có tin đăng nào ở trạng thái này
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
            Bạn hiện không có phòng nào trong danh mục đã chọn. Thử chọn danh mục khác hoặc xóa bộ lọc.
          </p>
        </div>
        {onResetFilter && (
          <button
            type="button"
            onClick={onResetFilter}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-semibold transition-colors min-h-[44px]"
          >
            Xem tất cả tin đăng
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-[#EDE5D5] p-8 sm:p-12 text-center space-y-8 shadow-xs max-w-3xl mx-auto">
      {/* Icon */}
      <div className="w-16 h-16 rounded-2xl bg-[#FFF1CC] border border-[#F4CD65]/40 text-[#DCA936] mx-auto flex items-center justify-center">
        <Building2 className="w-8 h-8" />
      </div>

      {/* Copy */}
      <div className="space-y-2 max-w-lg mx-auto">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#292524]">
          Chào mừng bạn đến với Kênh Chủ Nhà Nestrivo
        </h2>
        <p className="text-sm text-[#57534E] leading-relaxed font-normal">
          Bắt đầu tiếp cận người tìm thuê văn minh ngay hôm nay. Đăng tin phòng trọ, căn hộ hoàn toàn miễn phí và nhanh chóng.
        </p>
      </div>

      {/* 3 Step Guidance */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left max-w-2xl mx-auto pt-2">
        <div className="p-4 rounded-2xl bg-[#FFF7E5] border border-[#EDE5D5] flex flex-col gap-2">
          <div className="w-6 h-6 rounded-full bg-[#F4CD65] text-[#292524] font-semibold text-xs flex items-center justify-center">
            1
          </div>
          <div className="text-xs font-semibold text-[#292524]">Điền thông tin phòng</div>
          <div className="text-[11px] text-[#57534E] leading-relaxed font-normal">
            Nhập địa chỉ, diện tích, giá thuê và tiện ích có sẵn trong phòng.
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#FFF7E5] border border-[#EDE5D5] flex flex-col gap-2">
          <div className="w-6 h-6 rounded-full bg-[#F4CD65] text-[#292524] font-semibold text-xs flex items-center justify-center">
            2
          </div>
          <div className="text-xs font-semibold text-[#292524]">Minh bạch phụ phí</div>
          <div className="text-[11px] text-[#57534E] leading-relaxed font-normal">
            Niêm yết giá điện, nước, internet giúp người thuê tin tưởng ra quyết định.
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#FFF7E5] border border-[#EDE5D5] flex flex-col gap-2">
          <div className="w-6 h-6 rounded-full bg-[#F4CD65] text-[#292524] font-semibold text-xs flex items-center justify-center">
            3
          </div>
          <div className="text-xs font-semibold text-[#292524]">Kiểm duyệt & Hiển thị</div>
          <div className="text-[11px] text-[#57534E] leading-relaxed font-normal">
            Đội ngũ Admin xét duyệt trong 24h để đảm bảo sàn cho thuê văn minh.
          </div>
        </div>
      </div>

      {/* Primary Action Button */}
      <div className="pt-2">
        <Link
          href="/landlord/listings/new"
          className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-[#F4CD65] hover:bg-[#ebbf4d] active:bg-[#e0b03b] text-[#292524] font-medium text-sm shadow-xs transition-all min-h-[44px]"
        >
          <PlusCircle className="w-5 h-5" />
          <span>Tạo tin đăng cho thuê đầu tiên</span>
        </Link>
      </div>
    </div>
  );
}
