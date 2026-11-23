"use client";

import { useState, useRef } from "react";
import { 
  Upload, 
  Image as ImageIcon, 
  Trash2, 
  Star, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  Info,
  Maximize2,
  X,
  Loader2
} from "lucide-react";
import { WizardImageItem, SAMPLE_PHOTOS } from "@/types/wizard";
import { uploadImageToCloudinary } from "@/service/upload.service";

interface Step4Props {
  images: WizardImageItem[];
  errors: Record<string, string>;
  onChange: (field: string, value: unknown) => void;
}

export function Step4ImageUpload({ images, errors, onChange }: Step4Props) {
  const [isDragging, setIsDragging] = useState(false);
  const [previewModalImg, setPreviewModalImg] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgressText, setUploadProgressText] = useState("");
  const [cloudNotice, setCloudNotice] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processAndUploadFiles = async (fileList: File[]) => {
    if (fileList.length === 0) return;
    setIsUploading(true);
    setCloudNotice(null);

    const uploadedItems: WizardImageItem[] = [];

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      setUploadProgressText(`Đang tải ảnh ${i + 1}/${fileList.length}...`);

      try {
        const cloudResult = await uploadImageToCloudinary(file, {
          folder: "nestrivo/listings",
        });

        uploadedItems.push({
          id: cloudResult.publicId || `cloud-${Date.now()}-${i}`,
          imageUrl: cloudResult.secureUrl,
          caption: file.name,
          isCover: images.length === 0 && uploadedItems.length === 0,
        });
      } catch (cloudErr: unknown) {
        // Fallback sang Data URL nếu chưa tạo upload preset
        const dataUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });

        uploadedItems.push({
          id: `local-${Date.now()}-${i}`,
          imageUrl: dataUrl,
          caption: file.name,
          isCover: images.length === 0 && uploadedItems.length === 0,
        });

        if (cloudErr instanceof Error) {
          setCloudNotice(cloudErr.message);
        }
      }
    }

    onChange("images", [...images, ...uploadedItems]);
    setIsUploading(false);
    setUploadProgressText("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Handle local file uploads
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    processAndUploadFiles(Array.from(files));
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;

    const imageFiles = Array.from(files).filter((file) => file.type.startsWith("image/"));
    processAndUploadFiles(imageFiles);
  };

  // Add sample photos for quick testing
  const handleAddSamplePhotos = () => {
    const sampleItems: WizardImageItem[] = SAMPLE_PHOTOS.slice(0, 4).map((p, idx) => ({
      id: `sample-${Date.now()}-${idx}`,
      imageUrl: p.url,
      caption: p.label,
      isCover: images.length === 0 && idx === 0,
    }));
    onChange("images", [...images, ...sampleItems]);
  };

  // Set cover photo
  const handleSetCover = (id: string) => {
    onChange(
      "images",
      images.map((img) => ({
        ...img,
        isCover: img.id === id,
      }))
    );
  };

  // Remove photo
  const handleRemovePhoto = (id: string) => {
    const updated = images.filter((img) => img.id !== id);
    // If the removed image was cover and items remain, make first one cover
    if (updated.length > 0 && !updated.some((img) => img.isCover)) {
      updated[0].isCover = true;
    }
    onChange("images", updated);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* 1. Header & Quick Presets */}
      <section className="space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <span>Hình ảnh phòng thực tế</span>
              <span className="text-rose-500">*</span>
            </h2>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <span className="text-xs font-semibold text-[#805B10] bg-[#FFF1CC] px-2.5 py-0.5 rounded-md border border-[#F4CD65]/40">
                Đã chọn {images.length} ảnh
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Tải lên ít nhất 1 ảnh rõ nét (khuyến nghị từ 3 - 5 ảnh). Hỗ trợ định dạng JPG, PNG, WebP (tối đa 10MB/ảnh).
            </p>
          </div>

          {/* Quick Demo Helper */}
          <button
            type="button"
            onClick={handleAddSamplePhotos}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors self-start sm:self-auto min-h-[40px] shrink-0"
            title="Thêm nhanh các ảnh mẫu căn hộ mẫu để kiểm thử"
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Thêm 4 ảnh mẫu nhanh</span>
          </button>
        </div>

        {errors.images && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errors.images}</span>
          </div>
        )}

        {cloudNotice && (
          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-amber-900">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Lưu ý tải ảnh:</span>
            </div>
            <p>{cloudNotice}</p>
          </div>
        )}
      </section>

      {/* 2. Drag & Drop Upload Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isUploading && fileInputRef.current?.click()}
        className={`p-8 sm:p-10 rounded-3xl border-2 border-dashed text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-3.5 ${
          isDragging
            ? "border-[#F4CD65] bg-[#FFF7E5] scale-[1.01]"
            : isUploading
            ? "border-amber-400 bg-[#FFF7E5]/70 cursor-wait"
            : "border-slate-300 bg-white hover:bg-slate-50/80 hover:border-slate-400"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png, image/jpeg, image/webp"
          multiple
          disabled={isUploading}
          onChange={handleFileChange}
          className="hidden"
        />

        {isUploading ? (
          <div className="flex flex-col items-center justify-center gap-3 py-2">
            <div className="w-14 h-14 rounded-2xl bg-[#FFF1CC] text-[#805B10] flex items-center justify-center shadow-xs">
              <Loader2 className="w-7 h-7 animate-spin text-[#DCA936]" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-bold text-slate-800">{uploadProgressText}</p>
              <p className="text-xs text-slate-500">Đang đồng bộ ảnh lên hệ thống lưu trữ bảo mật...</p>
            </div>
          </div>
        ) : (
          <>
            <div className="w-14 h-14 rounded-2xl bg-[#FFF1CC] text-[#805B10] flex items-center justify-center shadow-xs">
              <Upload className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <p className="text-sm font-semibold text-slate-800">
                Kéo thả ảnh vào đây, hoặc{" "}
                <span className="text-[#805B10] underline font-semibold">duyệt từ thiết bị</span>
              </p>
              <p className="text-xs text-slate-600 font-medium">
                Hỗ trợ định dạng JPG, PNG, WEBP dung lượng tối đa 10MB/ảnh
              </p>
            </div>
          </>
        )}
      </div>

      {/* 3. Image Grid with Cover Badge and Actions */}
      {images.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Danh sách ảnh đã tải lên ({images.length} ảnh)
            </h3>
            <span className="text-[11px] text-slate-600 font-medium">
              * Ảnh đầu tiên hoặc có huy hiệu &quot;Ảnh bìa&quot; sẽ là ảnh đại diện thẻ tin
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5">
            {images.map((img, index) => {
              const isCover = img.isCover || (index === 0 && !images.some((i) => i.isCover));

              return (
                <div
                  key={img.id}
                  className={`group relative rounded-2xl overflow-hidden border bg-slate-100 aspect-[4/3] shadow-2xs transition-all ${
                    isCover
                      ? "ring-2 ring-[#F4CD65] border-[#F4CD65]"
                      : "border-slate-200/90 hover:border-slate-300"
                  }`}
                >
                  {/* Image */}
                  <img
                    src={img.imageUrl}
                    alt={img.caption || `Ảnh phòng ${index + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />

                  {/* Gradient Overlay for controls */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/30 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2.5" />

                  {/* Top Bar: Cover Badge or Make Cover button */}
                  <div className="absolute top-2 left-2 right-2 flex items-center justify-between gap-1 z-10">
                    {isCover ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-[#F4CD65] text-[#373523] shadow-xs">
                        <Star className="w-3 h-3 fill-[#373523]" />
                        <span>Ảnh bìa</span>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSetCover(img.id);
                        }}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold bg-slate-900/80 hover:bg-slate-900 text-white backdrop-blur-xs transition-colors"
                        title="Đặt làm ảnh bìa chính"
                      >
                        <Star className="w-3 h-3" />
                        <span>Đặt làm bìa</span>
                      </button>
                    )}

                    {/* Preview Zoom button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPreviewModalImg(img.imageUrl);
                      }}
                      className="w-7 h-7 rounded-lg bg-slate-900/80 hover:bg-slate-900 text-white flex items-center justify-center backdrop-blur-xs transition-colors"
                      title="Xem ảnh phóng to"
                      aria-label="Xem ảnh phóng to"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Bottom Bar: Delete button */}
                  <div className="absolute bottom-2 right-2 z-10">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemovePhoto(img.id);
                      }}
                      className="w-8 h-8 rounded-lg bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center shadow-xs transition-all active:scale-95"
                      title="Xóa ảnh này"
                      aria-label="Xóa ảnh"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 4. Quality & Moderation Guidelines Callout */}
      <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex items-start gap-3 text-slate-800">
        <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs">
          <h4 className="font-bold text-amber-900">
            Quy chuẩn kiểm duyệt hình ảnh Nestrivo
          </h4>
          <p className="text-amber-800/90 leading-relaxed font-medium">
            Để đảm bảo chất lượng sàn bất động sản văn minh, Admin sẽ từ chối các tin đăng có ảnh mờ, góc chụp quá hẹp, hoặc có số điện thoại/chữ đè lên hình ảnh. Hãy ưu tiên ảnh chụp tự nhiên, đủ ánh sáng ban ngày.
          </p>
        </div>
      </div>

      {/* Zoom Modal */}
      {previewModalImg && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setPreviewModalImg(null)}
        >
          <div
            className="relative max-w-4xl w-full bg-slate-900 rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setPreviewModalImg(null)}
              className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-slate-800/90 hover:bg-slate-700 text-white flex items-center justify-center"
              aria-label="Đóng xem ảnh"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={previewModalImg}
              alt="Phóng to ảnh phòng"
              className="w-full max-h-[80vh] object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}
