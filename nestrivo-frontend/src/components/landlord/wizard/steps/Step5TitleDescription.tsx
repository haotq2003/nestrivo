"use client";

import { useState } from "react";
import { 
  Sparkles, 
  FileText, 
  Eye, 
  AlertCircle, 
  MapPin, 
  Maximize, 
  Bed, 
  Bath, 
  Users, 
  ShieldCheck,
  CheckCircle2
} from "lucide-react";
import { WizardFormData } from "@/types/wizard";
import { PROPERTY_TYPE_LABELS } from "@/types/listing";
import { formatVND, formatArea } from "@/lib/utils";

interface Step5Props {
  formData: WizardFormData;
  errors: Record<string, string>;
  onChange: (field: string, value: unknown) => void;
}

export function Step5TitleDescription({ formData, errors, onChange }: Step5Props) {
  const [previewMode, setPreviewMode] = useState<"card" | "full">("card");

  const titleLength = formData.title.trim().length;
  const descLength = formData.description.trim().length;

  // Smart Title Generator
  const handleGenerateTitle = () => {
    const typeLabel = PROPERTY_TYPE_LABELS[formData.propertyType] || "Phòng";
    const highlight = formData.isFurnished
      ? "Full Nội Thất Cao Cấp"
      : formData.hasMezzanine
      ? "Có Gác Lửng Thoáng Mát"
      : "Ban Công Thoáng Sáng";
    const loc = formData.district || formData.city || "Trung Tâm";
    const suggestedTitle = `${typeLabel} ${highlight}, Gần Tiện Ích ${loc}`;
    onChange("title", suggestedTitle);
  };

  // Structured Professional Description Template
  const handleInsertTemplate = () => {
    const typeLabel = PROPERTY_TYPE_LABELS[formData.propertyType] || "Phòng";
    const template = `[THÔNG TIN PHÒNG CHO THUÊ]
- Loại hình: ${typeLabel} mới, sạch sẽ, dọn vào ở ngay.
- Diện tích: ${formData.area} m², tối đa ${formData.maxOccupants} người ở.
- Kết cấu: ${formData.bedrooms} phòng ngủ, ${formData.bathrooms} WC khép kín. ${
      formData.hasMezzanine ? "Có gác lửng đúc cao không đụng đầu." : ""
    }

[NỘI THẤT & TIỆN NGHI SẴN CÓ]
${
  formData.isFurnished
    ? "- Đầy đủ nội thất: Máy lạnh, máy nước nóng, tủ lạnh, máy giặt, giường nệm, tủ quần áo."
    : "- Phòng cơ bản sẵn điều hòa và bình nóng lạnh, dễ dàng bài trí theo sở thích."
}
- Giờ giấc tự do 24/7, khóa cửa vân tay an ninh, camera giám sát toàn tòa nhà.

[VỊ TRÍ & KẾT NỐI]
- Địa chỉ: ${formData.address || "Vị trí thuận tiện"}, ${formData.ward || ""}, ${
      formData.district
    }, ${formData.city}.
- Gần các trường đại học, siêu thị, chợ dân sinh và các tuyến đường huyết mạch.

[ĐIỀU KIỆN THUÊ]
- Giá thuê niêm yết: ${formatVND(formData.price)}/tháng.
- Tiền đặt cọc: ${formatVND(formData.deposit)}.
- Hợp đồng thuê linh hoạt, hỗ trợ đăng ký tạm trú đầy đủ.`;

    onChange("description", template);
  };

  const coverImg =
    formData.images.find((i) => i.isCover)?.imageUrl ||
    formData.images[0]?.imageUrl ||
    "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&auto=format&fit=crop&q=80";

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* 1. Title Input & Suggestions */}
      <section className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <span>1. Tiêu đề tin đăng</span>
              <span className="text-rose-500">*</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Tiêu đề hấp dẫn, chứa loại phòng và quận/huyện giúp người thuê tìm thấy ngay.
            </p>
          </div>

          <button
            type="button"
            onClick={handleGenerateTitle}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-[#373523] bg-[#FFF1CC] hover:bg-[#F4CD65] border border-[#EDE5D5] transition-colors self-start sm:self-auto min-h-[38px]"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#DCA936]" />
            <span>Gợi ý tiêu đề tự động</span>
          </button>
        </div>

        <div className="space-y-1.5">
          <div className="relative">
            <input
              type="text"
              maxLength={100}
              value={formData.title}
              onChange={(e) => onChange("title", e.target.value)}
              placeholder="VD: Phòng Studio Ban Công Thoáng Mát Gần ĐH HUTECH, Bình Thạnh"
              className={`w-full px-4 py-3 text-sm sm:text-base font-bold bg-white border rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all min-h-[48px] ${
                errors.title
                  ? "border-rose-400 focus:border-rose-500 focus:ring-rose-500/20"
                  : "border-slate-200 focus:border-[#F4CD65] focus:ring-[#F4CD65]/20"
              }`}
            />
          </div>

          <div className="flex items-center justify-between text-xs">
            {errors.title ? (
              <p className="text-rose-600 font-medium flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errors.title}</span>
              </p>
            ) : (
              <span className="text-slate-600 font-medium">Tối thiểu 15 ký tự, tối đa 100 ký tự</span>
            )}
            <span
              className={`font-bold tabular-nums ${
                titleLength < 15 || titleLength > 100 ? "text-amber-600" : "text-[#805B10]"
              }`}
            >
              {titleLength} / 100 ký tự
            </span>
          </div>
        </div>
      </section>

      {/* 2. Description Textarea & Templates */}
      <section className="space-y-3 pt-4 border-t border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <span>2. Mô tả chi tiết căn phòng</span>
              <span className="text-rose-500">*</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Cung cấp chi tiết các tiện ích, giờ giấc, quy định và môi trường xung quanh.
            </p>
          </div>

          <button
            type="button"
            onClick={handleInsertTemplate}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors self-start sm:self-auto min-h-[38px]"
          >
            <FileText className="w-3.5 h-3.5 text-slate-500" />
            <span>Chèn mẫu mô tả chuẩn</span>
          </button>
        </div>

        <div className="space-y-1.5">
          <textarea
            rows={7}
            value={formData.description}
            onChange={(e) => onChange("description", e.target.value)}
            placeholder="Nhập mô tả chi tiết về căn phòng của bạn..."
            className={`w-full px-4 py-3 text-xs sm:text-sm bg-white border rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all leading-relaxed ${
              errors.description
                ? "border-rose-400 focus:border-rose-500 focus:ring-rose-500/20"
                : "border-slate-200 focus:border-[#F4CD65] focus:ring-[#F4CD65]/20"
            }`}
          />

          <div className="flex items-center justify-between text-xs">
            {errors.description ? (
              <p className="text-rose-600 font-medium flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errors.description}</span>
              </p>
            ) : (
              <span className="text-slate-600 font-medium">Tối thiểu 30 ký tự</span>
            )}
            <span
              className={`font-bold tabular-nums ${
                descLength < 30 ? "text-amber-600" : "text-[#805B10]"
              }`}
            >
              {descLength} ký tự
            </span>
          </div>
        </div>
      </section>

      {/* 3. Live Card & Detail Preview */}
      <section className="space-y-4 pt-4 border-t border-slate-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-[#DCA936]" />
            <h3 className="text-sm font-bold text-slate-900">
              Xem trước hiển thị thực tế trên sàn
            </h3>
          </div>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold">
            <button
              type="button"
              onClick={() => setPreviewMode("card")}
              className={`px-3 py-1 rounded-lg transition-all ${
                previewMode === "card"
                  ? "bg-white text-slate-900 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Thẻ tìm kiếm
            </button>
            <button
              type="button"
              onClick={() => setPreviewMode("full")}
              className={`px-3 py-1 rounded-lg transition-all ${
                previewMode === "full"
                  ? "bg-white text-slate-900 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Tóm tắt chi tiết
            </button>
          </div>
        </div>

        {/* Live Preview Card */}
        {previewMode === "card" ? (
          <div className="max-w-md mx-auto">
            <div className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-md flex flex-col">
              {/* Image with badges */}
              <div className="relative aspect-[16/10] bg-slate-100 overflow-hidden">
                <img
                  src={coverImg}
                  alt={formData.title || "Ảnh xem trước"}
                  className="w-full h-full object-cover"
                />

                <div className="absolute top-3 left-3 flex gap-1.5">
                  <span className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-900/80 backdrop-blur-md text-white">
                    {PROPERTY_TYPE_LABELS[formData.propertyType]}
                  </span>
                </div>

                <div className="absolute bottom-3 left-3 bg-slate-950/85 backdrop-blur-md px-3 py-1.5 rounded-xl text-white">
                  <span className="text-base font-bold text-[#F4CD65]">
                    {formatVND(formData.price)}
                  </span>
                  <span className="text-xs text-slate-300 ml-1">/tháng</span>
                </div>
              </div>

              {/* Info */}
              <div className="p-4 space-y-2">
                <h4 className="text-sm font-bold text-slate-900 line-clamp-2 leading-snug">
                  {formData.title || "Tiêu đề tin đăng sẽ xuất hiện tại đây..."}
                </h4>

                <p className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>
                    {formData.district ? `${formData.district}, ` : ""}
                    {formData.city}
                  </span>
                </p>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 font-medium">
                  <div className="flex items-center gap-1">
                    <Maximize className="w-3.5 h-3.5 text-slate-400" />
                    <span>{formatArea(formData.area)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Bed className="w-3.5 h-3.5 text-slate-400" />
                    <span>{formData.bedrooms} PN</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Bath className="w-3.5 h-3.5 text-slate-400" />
                    <span>{formData.bathrooms} WC</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span>{formData.maxOccupants} người</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Full Summary Box */
          <div className="bg-slate-50 rounded-2xl border border-slate-200/90 p-5 space-y-4">
            <div className="flex items-start gap-4">
              <img
                src={coverImg}
                alt="Ảnh bìa"
                className="w-24 h-24 rounded-xl object-cover shrink-0 border border-slate-200"
              />
              <div className="space-y-1 min-w-0">
                <span className="text-[11px] font-bold text-[#805B10] bg-[#FFF1CC] px-2 py-0.5 rounded-md border border-[#F4CD65]/40">
                  {PROPERTY_TYPE_LABELS[formData.propertyType]}
                </span>
                <h4 className="text-base font-bold text-slate-900 leading-snug">
                  {formData.title || "Chưa nhập tiêu đề"}
                </h4>
                <p className="text-xs text-slate-500 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>
                    {formData.address}, {formData.ward}, {formData.district}, {formData.city}
                  </span>
                </p>
                <div className="text-sm font-semibold text-[#805B10] pt-1">
                  {formatVND(formData.price)}/tháng · Cọc {formatVND(formData.deposit)}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 text-xs text-slate-700 whitespace-pre-line leading-relaxed font-normal">
              {formData.description || "Chưa nhập nội dung mô tả chi tiết..."}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
