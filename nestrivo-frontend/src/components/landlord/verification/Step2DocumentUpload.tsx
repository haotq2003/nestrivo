"use client";

import { useState, useRef, DragEvent, ChangeEvent } from "react";
import { 
  Camera, 
  Upload, 
  Trash2, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Info, 
  ShieldCheck,
  FileCheck
} from "lucide-react";
import { KycDocuments } from "@/types/verification";
import { uploadImageToCloudinary } from "@/service/upload.service";

interface Step2DocumentUploadProps {
  documents: KycDocuments;
  errors: Record<string, string>;
  onChange: (docs: Partial<KycDocuments>) => void;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export function Step2DocumentUpload({
  documents,
  errors,
  onChange,
}: Step2DocumentUploadProps) {
  const [isUploadingFront, setIsUploadingFront] = useState(false);
  const [isUploadingBack, setIsUploadingBack] = useState(false);
  const [uploadProgressFront, setUploadProgressFront] = useState(0);
  const [uploadProgressBack, setUploadProgressBack] = useState(0);
  const [isDraggingFront, setIsDraggingFront] = useState(false);
  const [isDraggingBack, setIsDraggingBack] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const frontInputRef = useRef<HTMLInputElement>(null);
  const backInputRef = useRef<HTMLInputElement>(null);

  const processFile = async (
    file: File,
    side: "front" | "back"
  ) => {
    setLocalError(null);

    // Validate type
    if (!ALLOWED_TYPES.includes(file.type)) {
      setLocalError("Định dạng file không hỗ trợ. Vui lòng tải file ảnh JPG, PNG hoặc WEBP.");
      return;
    }

    // Validate size
    if (file.size > MAX_FILE_SIZE) {
      setLocalError("Dung lượng file vượt quá 5MB. Vui lòng chọn ảnh có kích thước nhỏ hơn.");
      return;
    }

    const isFront = side === "front";
    if (isFront) {
      setIsUploadingFront(true);
      setUploadProgressFront(10);
    } else {
      setIsUploadingBack(true);
      setUploadProgressBack(10);
    }

    try {
      // Tải ảnh trực tiếp lên Cloudinary với thư mục nestrivo/kyc
      const uploadRes = await uploadImageToCloudinary(file, {
        folder: "nestrivo/kyc",
        onProgress: (percent) => {
          if (isFront) setUploadProgressFront(percent);
          else setUploadProgressBack(percent);
        },
      });

      if (isFront) {
        setUploadProgressFront(100);
        setIsUploadingFront(false);
        onChange({
          frontImage: uploadRes.secureUrl || uploadRes.url,
          frontFileName: uploadRes.originalFilename || file.name,
          frontFileSize: uploadRes.bytes || file.size,
        });
      } else {
        setUploadProgressBack(100);
        setIsUploadingBack(false);
        onChange({
          backImage: uploadRes.secureUrl || uploadRes.url,
          backFileName: uploadRes.originalFilename || file.name,
          backFileSize: uploadRes.bytes || file.size,
        });
      }
    } catch (err: unknown) {
      console.warn("Cloudinary upload failed, falling back to local data URL:", err);
      // Fallback: read as DataURL if upload route fails
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        if (isFront) {
          setUploadProgressFront(100);
          setIsUploadingFront(false);
          onChange({
            frontImage: dataUrl,
            frontFileName: file.name,
            frontFileSize: file.size,
          });
        } else {
          setUploadProgressBack(100);
          setIsUploadingBack(false);
          onChange({
            backImage: dataUrl,
            backFileName: file.name,
            backFileSize: file.size,
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>, side: "front" | "back") => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file, side);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>, side: "front" | "back") => {
    e.preventDefault();
    if (side === "front") setIsDraggingFront(false);
    else setIsDraggingBack(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file, side);
    }
  };

  const formatFileSize = (bytes?: number | null) => {
    if (!bytes) return "";
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900">
            Bước 2: Tải lên hình ảnh thẻ Căn cước công dân
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Chụp ảnh 2 mặt thẻ CCCD gắn chip gốc, rõ nét, đủ ánh sáng và không bị mất 4 góc thẻ.
          </p>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200/80">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Mã hóa bảo mật thông tin</span>
        </div>
      </div>

      {localError && (
        <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{localError}</span>
        </div>
      )}

      {/* Grid: 2 Document Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
        {/* ======================================================== */}
        {/* CARD 1: Mặt trước CCCD                                   */}
        {/* ======================================================== */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <span>Mặt trước Căn cước công dân</span>
              <span className="text-rose-500">*</span>
            </label>
            {documents.frontImage && (
              <span className="text-[11px] font-bold text-[#805B10] flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Đã tải lên</span>
              </span>
            )}
          </div>

          <input
            type="file"
            ref={frontInputRef}
            onChange={(e) => handleFileChange(e, "front")}
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            aria-label="Tải ảnh mặt trước CCCD"
          />

          {!documents.frontImage ? (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDraggingFront(true);
              }}
              onDragLeave={() => setIsDraggingFront(false)}
              onDrop={(e) => handleDrop(e, "front")}
              onClick={() => frontInputRef.current?.click()}
              className={`border-2 border-dashed rounded-3xl p-6 sm:p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[220px] aspect-[16/10] ${
                isDraggingFront
                  ? "border-[#F4CD65] bg-[#FFF7E5]"
                  : errors.frontImage
                  ? "border-rose-400 bg-rose-50/30 hover:bg-rose-50/50"
                  : "border-slate-300 hover:border-[#F4CD65] hover:bg-slate-50/80 bg-slate-50/40"
              }`}
            >
              {isUploadingFront ? (
                <div className="w-full max-w-xs space-y-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#FFF1CC] text-[#805B10] flex items-center justify-center mx-auto">
                    <RefreshCw className="w-5 h-5 animate-spin" />
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs font-bold text-slate-900">
                      Đang tải ảnh lên... {uploadProgressFront}%
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-[#F4CD65] h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgressFront}%` }}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-2.5">
                  <div className="w-12 h-12 rounded-2xl bg-white shadow-2xs border border-slate-200 text-[#805B10] flex items-center justify-center mx-auto">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm font-bold text-slate-900">
                      Kéo thả ảnh hoặc <span className="text-[#805B10] hover:underline">Duyệt file</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Hỗ trợ JPG, PNG, WEBP (Tối đa 5MB)
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Uploaded Preview Card */
            <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 aspect-[16/10] group shadow-2xs">
              <img
                src={documents.frontImage}
                alt="Mặt trước CCCD"
                className="w-full h-full object-contain"
              />

              {/* Bottom bar overlay */}
              <div className="absolute inset-x-0 bottom-0 bg-slate-900/80 backdrop-blur-xs p-2.5 px-3 flex items-center justify-between text-white text-xs">
                <div className="min-w-0 pr-2">
                  <div className="font-semibold truncate text-[11px]">
                    {documents.frontFileName || "Mặt trước CCCD"}
                  </div>
                  <div className="text-[10px] text-slate-300">
                    {formatFileSize(documents.frontFileSize)}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => frontInputRef.current?.click()}
                    className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white transition-colors cursor-pointer"
                    title="Thay đổi ảnh khác"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      onChange({
                        frontImage: null,
                        frontFileName: null,
                        frontFileSize: null,
                      })
                    }
                    className="p-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white transition-colors cursor-pointer"
                    title="Xóa ảnh này"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {errors.frontImage && (
            <p className="text-xs text-rose-600 font-medium flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errors.frontImage}</span>
            </p>
          )}
        </div>

        {/* ======================================================== */}
        {/* CARD 2: Mặt sau CCCD                                     */}
        {/* ======================================================== */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <span>Mặt sau Căn cước công dân</span>
              <span className="text-rose-500">*</span>
            </label>
            {documents.backImage && (
              <span className="text-[11px] font-bold text-[#805B10] flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Đã tải lên</span>
              </span>
            )}
          </div>

          <input
            type="file"
            ref={backInputRef}
            onChange={(e) => handleFileChange(e, "back")}
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            aria-label="Tải ảnh mặt sau CCCD"
          />

          {!documents.backImage ? (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDraggingBack(true);
              }}
              onDragLeave={() => setIsDraggingBack(false)}
              onDrop={(e) => handleDrop(e, "back")}
              onClick={() => backInputRef.current?.click()}
              className={`border-2 border-dashed rounded-3xl p-6 sm:p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[220px] aspect-[16/10] ${
                isDraggingBack
                  ? "border-[#F4CD65] bg-[#FFF7E5]"
                  : errors.backImage
                  ? "border-rose-400 bg-rose-50/30 hover:bg-rose-50/50"
                  : "border-slate-300 hover:border-[#F4CD65] hover:bg-slate-50/80 bg-slate-50/40"
              }`}
            >
              {isUploadingBack ? (
                <div className="w-full max-w-xs space-y-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#FFF1CC] text-[#805B10] flex items-center justify-center mx-auto">
                    <RefreshCw className="w-5 h-5 animate-spin" />
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs font-bold text-slate-900">
                      Đang tải ảnh lên... {uploadProgressBack}%
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-[#F4CD65] h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgressBack}%` }}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-2.5">
                  <div className="w-12 h-12 rounded-2xl bg-white shadow-2xs border border-slate-200 text-[#805B10] flex items-center justify-center mx-auto">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm font-bold text-slate-900">
                      Kéo thả ảnh hoặc <span className="text-[#805B10] hover:underline">Duyệt file</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Hỗ trợ JPG, PNG, WEBP (Tối đa 5MB)
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Uploaded Preview Card */
            <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 aspect-[16/10] group shadow-2xs">
              <img
                src={documents.backImage}
                alt="Mặt sau CCCD"
                className="w-full h-full object-contain"
              />

              {/* Bottom bar overlay */}
              <div className="absolute inset-x-0 bottom-0 bg-slate-900/80 backdrop-blur-xs p-2.5 px-3 flex items-center justify-between text-white text-xs">
                <div className="min-w-0 pr-2">
                  <div className="font-semibold truncate text-[11px]">
                    {documents.backFileName || "Mặt sau CCCD"}
                  </div>
                  <div className="text-[10px] text-slate-300">
                    {formatFileSize(documents.backFileSize)}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => backInputRef.current?.click()}
                    className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white transition-colors cursor-pointer"
                    title="Thay đổi ảnh khác"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      onChange({
                        backImage: null,
                        backFileName: null,
                        backFileSize: null,
                      })
                    }
                    className="p-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white transition-colors cursor-pointer"
                    title="Xóa ảnh này"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {errors.backImage && (
            <p className="text-xs text-rose-600 font-medium flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errors.backImage}</span>
            </p>
          )}
        </div>
      </div>

      {/* Upload Guidelines */}
      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs text-slate-700">
        <div className="flex items-center gap-2 font-bold text-slate-900">
          <Info className="w-4 h-4 text-[#DCA936] shrink-0" />
          <span>Yêu cầu chụp ảnh CCCD hợp lệ để được duyệt ngay:</span>
        </div>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-600 pl-6 list-disc">
          <li>Chụp thẻ gốc, không sử dụng bản photocopy hoặc chụp lại qua màn hình.</li>
          <li>Đủ 4 góc của thẻ, không để ngón tay che khuất thông tin chữ hoặc số.</li>
          <li>Không bị lóa đèn flash hoặc bóng mờ ở phần mã QR / chip / vân tay.</li>
          <li>Độ phân giải tối thiểu 1000 x 600 px để hệ thống OCR đối chiếu dữ liệu.</li>
        </ul>
      </div>
    </div>
  );
}
