"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Building2, 
  MapPin, 
  Maximize, 
  Bed, 
  Bath, 
  Users, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Sparkles, 
  ShieldCheck, 
  FileText, 
  Layers, 
  Save, 
  Send, 
  RotateCcw, 
  ArrowRight,
  ExternalLink
} from "lucide-react";
import { WizardFormData, WIZARD_AMENITIES, clearListingDraft } from "@/types/wizard";
import { PROPERTY_TYPE_LABELS, FEE_UNIT_LABELS } from "@/types/listing";
import { formatVND, formatArea } from "@/lib/utils";
import { landlordService } from "@/service/landlord.service";
import { useAuth } from "@/context/AuthContext";

interface Step6Props {
  formData: WizardFormData;
  onEditStep: (step: number) => void;
  onSaveDraft: () => void;
  onResetWizard: () => void;
}

export function Step6ReviewSubmit({
  formData,
  onEditStep,
  onSaveDraft,
  onResetWizard,
}: Step6Props) {
  const { user } = useAuth();
  const [submissionState, setSubmissionState] = useState<
    "idle" | "validating" | "optimizing" | "submitting" | "success"
  >("idle");
  const [submittedRefId, setSubmittedRefId] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Submit directly to real PostgreSQL database via API
  const handleSubmitToBackend = async () => {
    setSubmissionState("validating");
    setErrorMessage(null);

    try {
      setSubmissionState("submitting");

      const payload = {
        title: formData.title,
        description: formData.description,
        propertyType: formData.propertyType,
        price: Number(formData.price) || 0,
        deposit: Number(formData.deposit) || 0,
        area: Number(formData.area) || 0,
        bedrooms: Number(formData.bedrooms) || 1,
        bathrooms: Number(formData.bathrooms) || 1,
        maxOccupants: Number(formData.maxOccupants) || 2,
        address: formData.address,
        ward: formData.ward || null,
        district: formData.district,
        city: formData.city,
        minimumStayMonths: Number(formData.minimumStayMonths) || 6,
        allowsPets: formData.allowsPets ?? false,
        hasMezzanine: formData.hasMezzanine ?? false,
        isFurnished: formData.isFurnished ?? false,
        status: "PENDING_APPROVAL",
        images: formData.images.map((img, idx) => ({
          imageUrl: img.imageUrl,
          isCover: img.isCover,
          sortOrder: idx,
          caption: img.caption || null,
        })),
        amenityIds: formData.amenities || [],
        fees: (formData.fees || []).map((fee) => ({
          type: fee.type,
          name: fee.name || null,
          amount: fee.isIncluded ? 0 : (Number(fee.amount) || 0),
          unit: fee.unit || "FIXED",
        })),
      };

      const res = await landlordService.createListing(payload);
      const generatedId = res.listing?.id 
        ? `NES-${res.listing.id.substring(0, 8).toUpperCase()}` 
        : `NES-2026-${Math.floor(1000 + Math.random() * 9000)}`;

      setSubmittedRefId(generatedId);
      setSubmissionState("success");

      // Clear draft storage so next time starts fresh
      clearListingDraft(user?.id);
    } catch (err: unknown) {
      setSubmissionState("idle");
      const msg = err instanceof Error ? err.message : "Đăng tin thất bại. Vui lòng kiểm tra lại thông tin và đăng nhập tài khoản Chủ nhà.";
      setErrorMessage(msg);
    }
  };

  const coverImg =
    formData.images.find((i) => i.isCover)?.imageUrl ||
    formData.images[0]?.imageUrl ||
    "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&auto=format&fit=crop&q=80";

  // Selected amenity objects
  const selectedAmenitiesList = WIZARD_AMENITIES.filter((a) =>
    formData.amenities.includes(a.id)
  );

  // If in Success State, render celebration view
  if (submissionState === "success") {
    return (
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-10 text-center space-y-6 shadow-sm max-w-2xl mx-auto animate-in fade-in duration-300">
        {/* Celebration Icon */}
        <div className="w-18 h-18 rounded-3xl bg-[#FFF1CC] border border-[#F4CD65]/50 text-[#805B10] mx-auto flex items-center justify-center shadow-xs">
          <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
        </div>

        {/* Copy */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3.5 h-3.5" />
            <span>Trạng thái: Chờ kiểm duyệt</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-[#292524] tracking-tight">
            Gửi tin đăng xét duyệt thành công!
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
            Mã tham chiếu hồ sơ: <strong className="text-[#292524] font-semibold">{submittedRefId}</strong>.
            Đội ngũ quản trị viên Nestrivo sẽ rà soát nội dung và duyệt tin trong vòng 24 giờ.
          </p>
        </div>

        {/* Submitted Listing Recap Card */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-left flex items-start gap-4">
          <img
            src={coverImg}
            alt={formData.title}
            className="w-20 h-20 rounded-xl object-cover shrink-0 border border-slate-200"
          />
          <div className="min-w-0 space-y-1">
            <span className="text-[10px] font-medium text-[#805B10] bg-[#FFF1CC] px-2 py-0.5 rounded-md">
              {PROPERTY_TYPE_LABELS[formData.propertyType]}
            </span>
            <h3 className="text-xs sm:text-sm font-semibold text-[#292524] truncate">
              {formData.title}
            </h3>
            <p className="text-xs text-slate-500 truncate">
              {formData.address}, {formData.district}, {formData.city}
            </p>
            <div className="text-xs font-semibold text-[#805B10] pt-0.5">
              {formatVND(formData.price)}/tháng · {formatArea(formData.area)}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/landlord/dashboard"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#F4CD65] hover:bg-[#ebbf4d] active:bg-[#e0b03b] text-[#292524] font-medium text-sm shadow-xs transition-all flex items-center justify-center gap-2 min-h-[44px]"
          >
            <span>Về Bảng điều khiển Quản lý tin</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <button
            type="button"
            onClick={onResetWizard}
            className="w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition-colors flex items-center justify-center gap-2 min-h-[44px]"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Tạo thêm tin đăng mới</span>
          </button>
        </div>
      </div>
    );
  }

  // Processing state
  if (submissionState !== "idle") {
    return (
      <div className="bg-white rounded-3xl border border-slate-200/90 p-10 sm:p-14 text-center space-y-6 shadow-sm max-w-lg mx-auto animate-in fade-in duration-300">
        <div className="w-16 h-16 rounded-2xl bg-[#FFF1CC] text-[#805B10] mx-auto flex items-center justify-center">
          <Clock className="w-8 h-8 animate-spin" />
        </div>

        <div className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900">
            {submissionState === "validating" && "Đang kiểm tra tính toàn vẹn của dữ liệu..."}
            {submissionState === "optimizing" && "Đang nén & tối ưu chất lượng hình ảnh..."}
            {submissionState === "submitting" && "Đang gửi hồ sơ vào hàng đợi xét duyệt của Admin..."}
          </h2>
          <p className="text-xs text-slate-500">
            Vui lòng không tắt trình duyệt trong quá trình xử lý
          </p>
        </div>

        {/* Progress simulation bar */}
        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
          <div
            className={`bg-[#F4CD65] h-2 rounded-full transition-all duration-500 ${
              submissionState === "validating"
                ? "w-1/3"
                : submissionState === "optimizing"
                ? "w-2/3"
                : "w-full"
            }`}
          />
        </div>
      </div>
    );
  }

  // Normal Review & Confirm State
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* 1. Header Banner */}
      <section className="space-y-1">
        <h2 className="text-base sm:text-lg font-bold text-slate-900">
          Kiểm tra thông tin trước khi gửi duyệt
        </h2>
        <p className="text-xs sm:text-sm text-slate-500">
          Hãy rà soát kỹ lưỡng các thông tin bên dưới. Bạn có thể nhấn vào bất kỳ mục nào để chỉnh sửa lại.
        </p>
      </section>

      {/* 2. Review Blocks */}
      <div className="space-y-4">
        {/* Block 1: Type & Address */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#DCA936]" />
              <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                1. Loại hình & Vị trí phòng
              </h3>
            </div>
            <button
              type="button"
              onClick={() => onEditStep(1)}
              className="text-xs font-bold text-[#805B10] hover:text-[#5c410b] hover:underline"
            >
              Chỉnh sửa
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-slate-500 font-medium">Loại hình:</span>
              <p className="text-slate-900 font-bold mt-0.5">
                {PROPERTY_TYPE_LABELS[formData.propertyType]}
              </p>
            </div>
            <div>
              <span className="text-slate-500 font-medium">Địa chỉ hiển thị:</span>
              <p className="text-slate-900 font-bold mt-0.5">
                {formData.address}, {formData.ward || ""}, {formData.district}, {formData.city}
              </p>
            </div>
          </div>
        </div>

        {/* Block 2: Property Details & Amenities */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#DCA936]" />
              <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                2. Chi tiết phòng & Tiện nghi
              </h3>
            </div>
            <button
              type="button"
              onClick={() => onEditStep(2)}
              className="text-xs font-bold text-[#805B10] hover:text-[#5c410b] hover:underline"
            >
              Chỉnh sửa
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-slate-500 font-medium">Diện tích:</span>
              <p className="text-slate-900 font-bold mt-0.5">{formatArea(formData.area)}</p>
            </div>
            <div>
              <span className="text-slate-500 font-medium">Phòng ngủ / WC:</span>
              <p className="text-slate-900 font-bold mt-0.5">
                {formData.bedrooms} PN · {formData.bathrooms} WC
              </p>
            </div>
            <div>
              <span className="text-slate-500 font-medium">Khách ở tối đa:</span>
              <p className="text-slate-900 font-bold mt-0.5">{formData.maxOccupants} người</p>
            </div>
            <div>
              <span className="text-slate-500 font-medium">Đặc điểm:</span>
              <p className="text-slate-900 font-bold mt-0.5">
                {formData.isFurnished ? "Full nội thất" : "Cơ bản"}
                {formData.hasMezzanine ? " · Có gác" : ""}
                {formData.allowsPets ? " · Cho pet" : ""}
              </p>
            </div>
          </div>

          {selectedAmenitiesList.length > 0 && (
            <div className="pt-2 border-t border-slate-100">
              <span className="text-[11px] font-semibold text-slate-500 block mb-1.5">
                Tiện nghi ({selectedAmenitiesList.length}):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {selectedAmenitiesList.map((a) => (
                  <span
                    key={a.id}
                    className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700"
                  >
                    {a.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Block 3: Pricing & Fees */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#DCA936]" />
              <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                3. Giá thuê & Phụ phí minh bạch
              </h3>
            </div>
            <button
              type="button"
              onClick={() => onEditStep(3)}
              className="text-xs font-bold text-[#805B10] hover:text-[#5c410b] hover:underline"
            >
              Chỉnh sửa
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-slate-500 font-medium">Giá thuê hàng tháng:</span>
              <p className="text-base font-semibold text-[#805B10] mt-0.5">
                {formatVND(formData.price)}/tháng
              </p>
            </div>
            <div>
              <span className="text-slate-500 font-medium">Tiền đặt cọc:</span>
              <p className="text-base font-semibold text-[#805B10] mt-0.5 tabular-nums">
                {formatVND(formData.deposit)}
              </p>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 space-y-1.5">
            <span className="text-[11px] font-semibold text-slate-500 block">
              Biểu phí phụ thu niêm yết:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {formData.fees.map((f) => (
                <div
                  key={f.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100"
                >
                  <span className="text-slate-700 font-medium">{f.name}:</span>
                  <span className="font-bold text-slate-900">
                    {f.isIncluded
                      ? "Đã bao gồm"
                      : `${formatVND(f.amount)} / ${FEE_UNIT_LABELS[f.unit] || f.unit}`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Block 4: Images & Title */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#DCA936]" />
              <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                4 & 5. Hình ảnh, Tiêu đề & Nội dung
              </h3>
            </div>
            <button
              type="button"
              onClick={() => onEditStep(5)}
              className="text-xs font-bold text-[#805B10] hover:text-[#5c410b] hover:underline"
            >
              Chỉnh sửa
            </button>
          </div>

          {/* Images horizontal reel */}
          <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-none">
            {formData.images.map((img, i) => (
              <div
                key={img.id}
                className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0 border border-slate-200"
              >
                <img
                  src={img.imageUrl}
                  alt={img.caption || `Ảnh ${i + 1}`}
                  className="w-full h-full object-cover"
                />
                {img.isCover && (
                  <span className="absolute bottom-1 left-1 right-1 text-[9px] font-bold bg-[#F4CD65] text-[#373523] text-center py-0.5 rounded">
                    Ảnh bìa
                  </span>
                )}
              </div>
            ))}
          </div>

          <div className="space-y-1.5 text-xs pt-1">
            <h4 className="font-bold text-slate-900">{formData.title}</h4>
            <p className="text-slate-600 line-clamp-3 leading-relaxed whitespace-pre-line">
              {formData.description}
            </p>
          </div>
        </div>
      </div>

      {/* Error Message if submit fails */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm font-semibold flex items-center gap-2.5">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* 3. Official Platform Disclosures */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#FFF7E5] border border-[#EDE5D5] space-y-2 text-slate-800">
        <div className="flex items-center gap-2 text-[#805B10] font-bold text-xs sm:text-sm">
          <ShieldCheck className="w-4 h-4 text-[#DCA936] shrink-0" />
          <span>Cam kết kiểm duyệt & Quy định vận hành Nestrivo</span>
        </div>
        <p className="text-xs text-[#77715F] leading-relaxed font-medium">
          Mọi tin đăng trên Nestrivo bắt buộc phải qua khâu kiểm duyệt thông tin của Admin trước khi hiển thị công khai cho người thuê. Quy trình này đảm bảo tính xác thực của chủ nhà và ngăn chặn tin giả, sai giá.
        </p>
      </div>

      {/* 4. Action Buttons for Final Step */}
      <div className="p-4 rounded-2xl bg-white border border-[#EDE5D5] flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xs">
        <button
          type="button"
          onClick={onSaveDraft}
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 transition-colors flex items-center justify-center gap-2 min-h-[44px]"
        >
          <Save className="w-4 h-4 text-slate-600" />
          <span>Lưu thành bản nháp (DRAFT)</span>
        </button>

        <button
          type="button"
          onClick={handleSubmitToBackend}
          className="w-full sm:w-auto px-7 py-3 rounded-xl text-xs sm:text-sm font-semibold text-[#292524] bg-[#F4CD65] hover:bg-[#ebbf4d] active:bg-[#e0b03b] shadow-xs transition-all flex items-center justify-center gap-2 min-h-[44px]"
        >
          <Send className="w-4 h-4" />
          <span>Gửi Admin xét duyệt ngay</span>
        </button>
      </div>
    </div>
  );
}
