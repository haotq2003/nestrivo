"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, 
  Save, 
  Building2, 
  AlertTriangle, 
  CheckCircle2, 
  Check,
  Zap, 
  Droplets, 
  Wifi, 
  Sparkles, 
  Car, 
  Plus, 
  Trash2, 
  Maximize, 
  Bed, 
  Bath, 
  Users, 
  KeyRound, 
  Sun, 
  ArrowUpDown, 
  ChefHat, 
  Clock, 
  ShieldCheck, 
  DoorClosed, 
  Wind, 
  Flame, 
  Image as ImageIcon, 
  Upload, 
  Loader2, 
  Info,
  Layers,
  HeartHandshake,
  DollarSign
} from "lucide-react";
import { useLandlordLayout } from "@/components/landlord/layout/LandlordWorkspaceLayout";
import { landlordService, LandlordReportItem } from "@/service/landlord.service";
import { LandlordListingItem } from "@/types/landlord";
import { PropertyType } from "@/types/listing";
import { WIZARD_AMENITIES, CITIES_AND_DISTRICTS } from "@/types/wizard";
import { uploadImageToCloudinary } from "@/service/upload.service";
import { formatVND } from "@/lib/utils";

const AMENITY_ICONS: Record<string, any> = {
  Wind,
  Flame,
  Refrigerator: Bed,
  WashingMachine: Sun,
  Wifi,
  KeyRound,
  Sun,
  ArrowUpDown,
  Car,
  ChefHat,
  Clock,
  ShieldCheck,
  Bed,
  DoorClosed,
};

const AMENITY_MAP: Record<string, string[]> = {
  "air-con": ["air-con", "air-conditioner", "điều hòa", "máy lạnh", "air conditioner"],
  "water-heater": ["water-heater", "nóng lạnh", "bình nóng lạnh", "water heater"],
  "fridge": ["fridge", "refrigerator", "tủ lạnh"],
  "washer": ["washer", "washing-machine", "máy giặt", "washing machine"],
  "wifi": ["wifi", "wi-fi", "mạng", "internet"],
  "fingerprint": ["fingerprint", "khóa vân tay", "thẻ từ", "khóa điện tử", "vân tay"],
  "balcony": ["balcony", "ban công", "cửa sổ", "cửa sổ lớn", "cửa sổ thoáng"],
  "elevator": ["elevator", "thang máy"],
  "parking": ["parking", "bãi để xe", "chỗ để xe", "giữ xe", "để xe"],
  "kitchen": ["kitchen", "kệ bếp", "bếp nấu ăn", "bếp"],
  "free-hours": ["free-hours", "giờ giấc tự do", "tự do", "không chung chủ", "clock"],
  "security": ["security", "camera", "bảo vệ", "cctv", "an ninh"],
  "bed": ["bed", "giường", "nệm"],
  "wardrobe": ["wardrobe", "tủ quần áo", "tủ đồ"],
  "pet": ["pet", "thú cưng", "chó mèo"],
};

const PROPERTY_TYPES: { value: PropertyType; label: string; desc: string }[] = [
  { value: "STUDIO", label: "Phòng Studio", desc: "Không gian mở khép kín, tiện nghi hiện đại" },
  { value: "ROOM_SHARE", label: "Phòng trọ / Ở ghép", desc: "Phòng trong dãy trọ hoặc căn hộ chia sẻ" },
  { value: "SERVICE_APARTMENT", label: "Căn hộ dịch vụ", desc: "Đầy đủ tiện ích cao cấp, dọn phòng" },
  { value: "WHOLE_HOUSE", label: "Nhà nguyên căn", desc: "Nguyên căn riêng biệt nhiều tầng" },
];

const FEE_TYPES: { type: string; label: string; defaultUnit: string; icon: any }[] = [
  { type: "ELECTRICITY", label: "Tiền điện sinh hoạt", defaultUnit: "PER_KWH", icon: Zap },
  { type: "WATER", label: "Tiền nước sinh hoạt", defaultUnit: "PER_M3", icon: Droplets },
  { type: "INTERNET", label: "WiFi / Internet", defaultUnit: "PER_MONTH", icon: Wifi },
  { type: "SERVICE", label: "Phí dịch vụ chung (vệ sinh, rác)", defaultUnit: "PER_MONTH", icon: Sparkles },
  { type: "PARKING", label: "Phí giữ xe máy", defaultUnit: "PER_VEHICLE", icon: Car },
];

const UNIT_LABELS: Record<string, string> = {
  PER_KWH: "₫/kWh",
  PER_M3: "₫/m³",
  PER_MONTH: "₫/tháng",
  PER_PERSON: "₫/người/tháng",
  PER_VEHICLE: "₫/xe/tháng",
  FIXED: "₫/tháng",
};

interface EditFormState {
  title: string;
  description: string;
  propertyType: PropertyType;
  price: number;
  deposit: number;
  area: number;
  bedrooms: number;
  bathrooms: number;
  maxOccupants: number;
  hasMezzanine: boolean;
  allowsPets: boolean;
  isFurnished: boolean;
  minimumStayMonths: number | null;
  city: string;
  district: string;
  ward: string;
  address: string;
  amenityIds: string[];
  fees: {
    type: string;
    name: string;
    amount: number;
    unit: string;
  }[];
  images: string[];
}

export default function LandlordEditListingPage() {
  const params = useParams();
  const router = useRouter();
  const { toggleMobileMenu } = useLandlordLayout();

  const id = typeof params.id === "string" ? params.id : Array.isArray(params.id) ? params.id[0] : "";

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Active Warning Reports for this room
  const [roomReports, setRoomReports] = useState<LandlordReportItem[]>([]);

  // Form State
  const [form, setForm] = useState<EditFormState>({
    title: "",
    description: "",
    propertyType: "STUDIO",
    price: 3500000,
    deposit: 3500000,
    area: 25,
    bedrooms: 1,
    bathrooms: 1,
    maxOccupants: 2,
    hasMezzanine: false,
    allowsPets: false,
    isFurnished: true,
    minimumStayMonths: 6,
    city: "Hồ Chí Minh",
    district: "Bình Thạnh",
    ward: "",
    address: "",
    amenityIds: [],
    fees: [],
    images: [],
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // 1. Load existing listing and reports
  const loadListingData = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const [listingRes, reportsRes] = await Promise.allSettled([
        landlordService.getListingById(id),
        landlordService.getListingReports(),
      ]);

      if (listingRes.status === "fulfilled" && listingRes.value?.listing) {
        const l = listingRes.value.listing;

        // Parse amenities and map to slugs
        const loadedAmenityIds = new Set<string>();
        if (Array.isArray(l.amenities)) {
          for (const item of l.amenities) {
            const rawId = (item?.amenityId || item?.amenity?.id || "").toLowerCase();
            const name = (item?.amenity?.name || "").toLowerCase();
            const icon = (item?.amenity?.icon || "").toLowerCase();

            let matched = false;
            for (const [slug, aliases] of Object.entries(AMENITY_MAP)) {
              if (
                rawId === slug ||
                aliases.some((a) => name.includes(a) || icon.includes(a) || rawId.includes(a))
              ) {
                loadedAmenityIds.add(slug);
                matched = true;
              }
            }
            if (!matched && rawId) {
              loadedAmenityIds.add(rawId);
            }
          }
        }

        // Parse fees
        const loadedFees: EditFormState["fees"] = [];
        if (Array.isArray(l.fees) && l.fees.length > 0) {
          for (const f of l.fees) {
            loadedFees.push({
              type: f.type,
              name: f.name || "",
              amount: Number(f.amount) || 0,
              unit: f.unit || "FIXED",
            });
          }
        } else {
          // Default standard fee list
          loadedFees.push(
            { type: "ELECTRICITY", name: "Tiền điện sinh hoạt", amount: 3500, unit: "PER_KWH" },
            { type: "WATER", name: "Tiền nước sinh hoạt", amount: 100000, unit: "PER_PERSON" },
            { type: "INTERNET", name: "WiFi / Internet", amount: 100000, unit: "PER_MONTH" },
            { type: "SERVICE", name: "Phí dịch vụ chung", amount: 120000, unit: "PER_MONTH" }
          );
        }

        // Parse images
        const loadedImages: string[] = [];
        if (Array.isArray(l.images)) {
          for (const img of l.images) {
            if (img.imageUrl) loadedImages.push(img.imageUrl);
          }
        }

        setForm({
          title: l.title || "",
          description: l.description || "",
          propertyType: l.propertyType || "STUDIO",
          price: Number(l.price) || 0,
          deposit: Number(l.deposit) || 0,
          area: Number(l.area) || 20,
          bedrooms: l.bedrooms || 1,
          bathrooms: l.bathrooms || 1,
          maxOccupants: l.maxOccupants || 2,
          hasMezzanine: Boolean(l.hasMezzanine),
          allowsPets: Boolean(l.allowsPets),
          isFurnished: Boolean(l.isFurnished),
          minimumStayMonths: l.minimumStayMonths || 6,
          city: l.city || "Hồ Chí Minh",
          district: l.district || "Bình Thạnh",
          ward: l.ward || "",
          address: l.address || "",
          amenityIds: [...new Set(loadedAmenityIds)],
          fees: loadedFees,
          images: loadedImages,
        });
      } else {
        setErrorMsg("Không tìm thấy thông tin phòng trọ hoặc bạn không có quyền sửa.");
      }

      if (reportsRes.status === "fulfilled" && reportsRes.value?.data) {
        setRoomReports(reportsRes.value.data.filter((r) => r.listingId === id));
      }
    } catch (err: unknown) {
      console.error("Load listing error:", err);
      setErrorMsg("Lỗi khi tải thông tin phòng từ máy chủ.");
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadListingData();
  }, [loadListingData]);

  // Handle Field Change
  const handleChange = (field: keyof EditFormState, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  // Toggle Amenity
  const handleToggleAmenity = (amenityId: string) => {
    setForm((prev) => {
      const exists = prev.amenityIds.includes(amenityId);
      const next = exists
        ? prev.amenityIds.filter((x) => x !== amenityId)
        : [...prev.amenityIds, amenityId];
      return { ...prev, amenityIds: next };
    });
  };

  // Handle Fee Update
  const handleUpdateFee = (index: number, field: string, val: any) => {
    setForm((prev) => {
      const updated = [...prev.fees];
      updated[index] = { ...updated[index], [field]: val };
      return { ...prev, fees: updated };
    });
  };

  const handleAddFee = (type: string) => {
    const meta = FEE_TYPES.find((f) => f.type === type) || FEE_TYPES[0];
    setForm((prev) => ({
      ...prev,
      fees: [
        ...prev.fees,
        {
          type,
          name: meta.label,
          amount: type === "ELECTRICITY" ? 3800 : type === "WATER" ? 100000 : 100000,
          unit: meta.defaultUnit,
        },
      ],
    }));
  };

  const handleRemoveFee = (index: number) => {
    setForm((prev) => ({
      ...prev,
      fees: prev.fees.filter((_, idx) => idx !== index),
    }));
  };

  // Handle Images Upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const newUrls: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const res = await uploadImageToCloudinary(file, { folder: "nestrivo/listings" });
        if (res?.secureUrl) newUrls.push(res.secureUrl);
      } catch (err) {
        // Fallback FileReader
        const dataUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
        newUrls.push(dataUrl);
      }
    }

    setForm((prev) => ({ ...prev, images: [...prev.images, ...newUrls] }));
    setIsUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleRemoveImage = (index: number) => {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, idx) => idx !== index),
    }));
  };

  // Handle Save
  const handleSaveListing = async () => {
    if (!form.title.trim()) {
      showToast("Vui lòng nhập tiêu đề phòng.");
      return;
    }
    if (form.price <= 0) {
      showToast("Giá thuê phòng phải lớn hơn 0.");
      return;
    }

    setIsSaving(true);
    try {
      await landlordService.updateListing(id, {
        title: form.title.trim(),
        description: form.description.trim(),
        propertyType: form.propertyType,
        price: form.price,
        deposit: form.deposit,
        area: form.area,
        bedrooms: form.bedrooms,
        bathrooms: form.bathrooms,
        maxOccupants: form.maxOccupants,
        hasMezzanine: form.hasMezzanine,
        allowsPets: form.allowsPets,
        isFurnished: form.isFurnished,
        minimumStayMonths: form.minimumStayMonths,
        city: form.city,
        district: form.district,
        ward: form.ward,
        address: form.address,
        amenityIds: form.amenityIds,
        fees: form.fees.map((f) => ({
          type: f.type,
          name: f.name || null,
          amount: Number(f.amount) || 0,
          unit: f.unit,
        })),
        images: form.images.map((url, idx) => ({
          imageUrl: url,
          sortOrder: idx,
        })),
      });

      showToast("🎉 Lưu thay đổi thành công! Ban Quản Trị đã ghi nhận bạn khắc phục sai sót.");
      setTimeout(() => {
        router.push(`/landlord/listings/${id}`);
      }, 1200);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Đã xảy ra lỗi khi lưu tin.";
      showToast(msg);
    } finally {
      setIsSaving(false);
    }
  };

  // Find active warning report
  const activeWarning = roomReports.find(
    (r) => r.status === "RESOLVED" && r.resolutionAction === "WARN_LANDLORD" && !r.isFixed
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#DCA936]" />
        <p className="text-sm font-semibold text-[#57534E]">Đang tải toàn bộ dữ liệu phòng để chỉnh sửa...</p>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex flex-col items-center justify-center p-6 text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center">
          <AlertTriangle className="w-7 h-7" />
        </div>
        <h2 className="text-lg font-bold text-[#292524]">{errorMsg}</h2>
        <Link
          href="/landlord/dashboard"
          className="px-5 py-2.5 rounded-xl bg-[#292524] text-white text-xs font-semibold hover:bg-black transition-colors"
        >
          Quay lại Bảng điều khiển
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] pb-32">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#EDE5D5] px-4 sm:px-8 py-3.5 shadow-xs">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href={`/landlord/listings/${id}`}
              className="p-2 rounded-xl text-[#78716C] hover:text-[#292524] hover:bg-[#FFF7E5] transition-colors shrink-0"
              title="Quay lại chi tiết tin"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="min-w-0">
              <span className="text-[11px] font-semibold text-[#805B10] uppercase tracking-wider block">
                Chỉnh sửa tin đăng
              </span>
              <h1 className="text-base sm:text-lg font-bold text-[#292524] truncate">
                {form.title || "Chỉnh sửa thông tin phòng"}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <Link
              href={`/landlord/listings/${id}`}
              className="px-4 py-2 rounded-xl border border-[#EDE5D5] bg-white hover:bg-[#FFF7E5] text-xs font-semibold text-[#57534E] transition-all"
            >
              Hủy
            </Link>
            <button
              type="button"
              onClick={handleSaveListing}
              disabled={isSaving}
              className="px-5 py-2 rounded-xl bg-[#292524] hover:bg-black text-white text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#F4CD65]" />
                  <span>Đang lưu...</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5 text-[#F4CD65]" />
                  <span>Lưu thay đổi</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Form Content Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-8 pt-6 space-y-6">
        {/* Callout Notice if Room has Active Admin Warning */}
        {activeWarning && (
          <div className="p-4 sm:p-5 rounded-3xl bg-amber-50 border-2 border-amber-300 text-amber-950 space-y-2 shadow-xs animate-in fade-in">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 font-bold text-sm text-amber-950">
                <Clock className="w-5 h-5 text-amber-700 animate-pulse" />
                <span>Cảnh báo từ Ban Quản Trị ({activeWarning.reasonLabel}):</span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-200 text-amber-900 border border-amber-300">
                ⏱️ Còn lại {activeWarning.remainingHours ?? 24}h {activeWarning.remainingMinutes ?? 0}p
              </span>
            </div>
            {activeWarning.adminNote && (
              <p className="text-xs sm:text-sm font-semibold text-amber-900 leading-relaxed bg-white/80 p-3 rounded-2xl border border-amber-200">
                Chỉ đạo của BQT: &ldquo;{activeWarning.adminNote}&rdquo;
              </p>
            )}
            <p className="text-[11px] text-amber-800 leading-relaxed italic">
              👉 Hãy sửa lại thông số tương ứng bên dưới (ví dụ: tiền điện/nước, tích chọn gác lửng) và bấm <strong>&ldquo;Lưu thay đổi&rdquo;</strong>. Sau khi bạn lưu, hệ thống sẽ tự động cập nhật và giữ tin đăng hiển thị bình thường.
            </p>
          </div>
        )}

        {/* ======================================================== */}
        {/* SECTION 1: GIÁ THUÊ & BIỂU PHÍ DỊCH VỤ                   */}
        {/* ======================================================== */}
        <section className="bg-white rounded-3xl border border-[#EDE5D5] p-5 sm:p-7 space-y-6 shadow-xs">
          <div className="flex items-center gap-3 pb-3 border-b border-[#EDE5D5]">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#292524]">1. Giá thuê & Biểu phí chi tiết</h2>
              <p className="text-xs text-[#78716C]">
                Đảm bảo giá điện, nước và các khoản phí được niêm yết đúng 100% với thực tế khi khách đến xem phòng
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-[#292524] block mb-1.5">
                Giá thuê phòng niêm yết (₫/tháng) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={form.price || ""}
                  onChange={(e) => handleChange("price", Number(e.target.value) || 0)}
                  placeholder="3500000"
                  className="w-full p-3 rounded-xl border border-[#EDE5D5] bg-[#FFFAEF] text-sm font-bold text-[#292524] focus:outline-none focus:border-[#DCA936] focus:bg-white"
                />
                <span className="absolute right-3 top-3 text-xs font-semibold text-[#78716C]">
                  {formatVND(form.price)}
                </span>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-[#292524] block mb-1.5">
                Tiền đặt cọc phòng (₫)
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={form.deposit || ""}
                  onChange={(e) => handleChange("deposit", Number(e.target.value) || 0)}
                  placeholder="3500000"
                  className="w-full p-3 rounded-xl border border-[#EDE5D5] bg-[#FFFAEF] text-sm font-bold text-[#292524] focus:outline-none focus:border-[#DCA936] focus:bg-white"
                />
                <span className="absolute right-3 top-3 text-xs font-semibold text-[#78716C]">
                  {formatVND(form.deposit)}
                </span>
              </div>
            </div>
          </div>

          {/* Biểu phí dịch vụ (Điện, Nước, WiFi...) */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#292524] block">
                Biểu phí dịch vụ & Phụ phí thực tế (Điện, nước, giữ xe, wifi...)
              </label>
              <div className="flex items-center gap-1.5">
                {FEE_TYPES.map((ft) => (
                  <button
                    key={ft.type}
                    type="button"
                    onClick={() => handleAddFee(ft.type)}
                    className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-[#FFFAEF] hover:bg-[#FFF1CC] text-[#805B10] border border-[#EDE5D5] transition-all cursor-pointer flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>{ft.label.split(" ")[1] || ft.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2.5">
              {form.fees.map((fee, idx) => {
                const meta = FEE_TYPES.find((f) => f.type === fee.type) || FEE_TYPES[0];
                const Icon = meta.icon;
                return (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-[#FFFAEF] border border-[#EDE5D5] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-2.5 min-w-[180px]">
                      <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <input
                          type="text"
                          value={fee.name}
                          onChange={(e) => handleUpdateFee(idx, "name", e.target.value)}
                          className="font-bold text-xs text-[#292524] bg-transparent border-b border-transparent hover:border-[#EDE5D5] focus:outline-none focus:border-[#DCA936]"
                        />
                        <span className="text-[10px] text-[#78716C] block">{fee.type}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <div className="relative flex-1 sm:w-36">
                        <input
                          type="number"
                          value={fee.amount}
                          onChange={(e) => handleUpdateFee(idx, "amount", Number(e.target.value) || 0)}
                          placeholder="Số tiền"
                          className="w-full p-2 rounded-lg border border-[#EDE5D5] bg-white text-xs font-bold text-[#292524] focus:outline-none focus:border-[#DCA936]"
                        />
                      </div>

                      <select
                        value={fee.unit}
                        onChange={(e) => handleUpdateFee(idx, "unit", e.target.value)}
                        className="p-2 rounded-lg border border-[#EDE5D5] bg-white text-xs font-semibold text-[#292524] focus:outline-none focus:border-[#DCA936]"
                      >
                        {Object.entries(UNIT_LABELS).map(([unitKey, unitName]) => (
                          <option key={unitKey} value={unitKey}>
                            {unitName}
                          </option>
                        ))}
                      </select>

                      <button
                        type="button"
                        onClick={() => handleRemoveFee(idx)}
                        className="p-2 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Xóa phụ phí này"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* SECTION 2: QUY CÁCH PHÒNG & NỘI THẤT (GÁC LỬNG, DIỆN TÍCH) */}
        {/* ======================================================== */}
        <section className="bg-white rounded-3xl border border-[#EDE5D5] p-5 sm:p-7 space-y-6 shadow-xs">
          <div className="flex items-center gap-3 pb-3 border-b border-[#EDE5D5]">
            <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-800 flex items-center justify-center font-bold">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#292524]">2. Quy cách phòng & Nội thất</h2>
              <p className="text-xs text-[#78716C]">
                Cập nhật chính xác thông tin gác lửng, diện tích, sức chứa và nội thất sẵn có
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className="text-xs font-bold text-[#292524] block mb-1.5">Diện tích (m²)</label>
              <input
                type="number"
                value={form.area || ""}
                onChange={(e) => handleChange("area", Number(e.target.value) || 0)}
                className="w-full p-2.5 rounded-xl border border-[#EDE5D5] bg-[#FFFAEF] text-sm font-bold text-[#292524] focus:outline-none focus:border-[#DCA936] focus:bg-white"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-[#292524] block mb-1.5">Số người tối đa</label>
              <input
                type="number"
                value={form.maxOccupants || ""}
                onChange={(e) => handleChange("maxOccupants", Number(e.target.value) || 1)}
                className="w-full p-2.5 rounded-xl border border-[#EDE5D5] bg-[#FFFAEF] text-sm font-bold text-[#292524] focus:outline-none focus:border-[#DCA936] focus:bg-white"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-[#292524] block mb-1.5">Số phòng ngủ</label>
              <input
                type="number"
                value={form.bedrooms || ""}
                onChange={(e) => handleChange("bedrooms", Number(e.target.value) || 1)}
                className="w-full p-2.5 rounded-xl border border-[#EDE5D5] bg-[#FFFAEF] text-sm font-bold text-[#292524] focus:outline-none focus:border-[#DCA936] focus:bg-white"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-[#292524] block mb-1.5">Số phòng tắm</label>
              <input
                type="number"
                value={form.bathrooms || ""}
                onChange={(e) => handleChange("bathrooms", Number(e.target.value) || 1)}
                className="w-full p-2.5 rounded-xl border border-[#EDE5D5] bg-[#FFFAEF] text-sm font-bold text-[#292524] focus:outline-none focus:border-[#DCA936] focus:bg-white"
              />
            </div>
          </div>

          {/* Toggle Switches (Gác lửng, Thú cưng, Nội thất...) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            {/* Gác lửng */}
            <div
              onClick={() => handleChange("hasMezzanine", !form.hasMezzanine)}
              className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                form.hasMezzanine
                  ? "bg-amber-50/80 border-amber-300 ring-1 ring-amber-300/80"
                  : "bg-[#FFFAEF] border-[#EDE5D5] hover:border-[#DCA936]"
              }`}
            >
              <div>
                <span className="font-bold text-xs text-[#292524] block">Phòng có gác lửng</span>
                <span className="text-[10px] text-[#78716C]">Tăng diện tích sử dụng</span>
              </div>
              <input
                type="checkbox"
                checked={form.hasMezzanine}
                onChange={() => {}}
                className="w-4 h-4 accent-[#DCA936]"
              />
            </div>

            {/* Nội thất */}
            <div
              onClick={() => handleChange("isFurnished", !form.isFurnished)}
              className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                form.isFurnished
                  ? "bg-amber-50/80 border-amber-300 ring-1 ring-amber-300/80"
                  : "bg-[#FFFAEF] border-[#EDE5D5] hover:border-[#DCA936]"
              }`}
            >
              <div>
                <span className="font-bold text-xs text-[#292524] block">Full nội thất sẵn có</span>
                <span className="text-[10px] text-[#78716C]">Giường, nệm, tủ quần áo...</span>
              </div>
              <input
                type="checkbox"
                checked={form.isFurnished}
                onChange={() => {}}
                className="w-4 h-4 accent-[#DCA936]"
              />
            </div>

            {/* Nuôi thú cưng */}
            <div
              onClick={() => handleChange("allowsPets", !form.allowsPets)}
              className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                form.allowsPets
                  ? "bg-amber-50/80 border-amber-300 ring-1 ring-amber-300/80"
                  : "bg-[#FFFAEF] border-[#EDE5D5] hover:border-[#DCA936]"
              }`}
            >
              <div>
                <span className="font-bold text-xs text-[#292524] block">Cho phép nuôi thú cưng</span>
                <span className="text-[10px] text-[#78716C]">Chó mèo nhỏ, cam kết sạch sẽ</span>
              </div>
              <input
                type="checkbox"
                checked={form.allowsPets}
                onChange={() => {}}
                className="w-4 h-4 accent-[#DCA936]"
              />
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* SECTION 3: TIỆN ÍCH & TRANG THIẾT BỊ                      */}
        {/* ======================================================== */}
        <section className="bg-white rounded-3xl border border-[#EDE5D5] p-5 sm:p-7 space-y-5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#EDE5D5] gap-2">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-[#292524]">3. Tiện ích & Cơ sở vật chất sẵn có</h2>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FFF1CC] text-[#805B10] border border-[#F4CD65]/40">
                    Đã chọn {form.amenityIds.length} tiện ích
                  </span>
                </div>
                <p className="text-xs text-[#78716C] mt-0.5">
                  Tích chọn những tiện ích, trang thiết bị đang có sẵn và hoạt động tốt tại phòng
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {WIZARD_AMENITIES.map((am) => {
              const Icon = AMENITY_ICONS[am.iconName] || Sun;
              const isSelected = form.amenityIds.includes(am.id);
              return (
                <button
                  key={am.id}
                  type="button"
                  onClick={() => handleToggleAmenity(am.id)}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-2.5 min-h-[56px] ${
                    isSelected
                      ? "bg-[#FFF7E5] border-[#F4CD65] text-[#292524] font-bold ring-1 ring-[#F4CD65]/40 shadow-2xs"
                      : "bg-[#FFFAEF] border-[#EDE5D5] text-[#57534E] hover:border-[#DCA936] hover:bg-white"
                  }`}
                  aria-pressed={isSelected}
                >
                  <div
                    className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                      isSelected ? "bg-[#F4CD65] text-[#292524]" : "bg-white border border-[#EDE5D5] text-[#78716C]"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs flex-1 leading-tight">{am.name}</span>
                  <div
                    className={`w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 transition-colors ${
                      isSelected
                        ? "bg-[#DCA936] border-[#DCA936] text-white"
                        : "border-[#EDE5D5] bg-white text-transparent"
                    }`}
                  >
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* ======================================================== */}
        {/* SECTION 4: TIÊU ĐỀ & MÔ TẢ CHI TIẾT                       */}
        {/* ======================================================== */}
        <section className="bg-white rounded-3xl border border-[#EDE5D5] p-5 sm:p-7 space-y-4 shadow-xs">
          <div className="flex items-center gap-3 pb-3 border-b border-[#EDE5D5]">
            <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center font-bold">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#292524]">4. Tiêu đề & Nội dung mô tả</h2>
              <p className="text-xs text-[#78716C]">
                Nội dung mô tả trung thực, rõ ràng sẽ giúp phòng cho thuê nhanh hơn
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-[#292524] block mb-1.5">
                Tiêu đề tin đăng <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => handleChange("title", e.target.value)}
                placeholder="Ví dụ: Phòng Studio có gác lửng, ban công thoáng, ngay Hàng Xanh"
                className="w-full p-3 rounded-xl border border-[#EDE5D5] bg-[#FFFAEF] text-xs sm:text-sm font-semibold text-[#292524] focus:outline-none focus:border-[#DCA936] focus:bg-white"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#292524] block mb-1.5">
                Mô tả chi tiết phòng trọ
              </label>
              <textarea
                rows={5}
                value={form.description}
                onChange={(e) => handleChange("description", e.target.value)}
                placeholder="Mô tả kỹ về phòng, tiện ích xung quanh, giờ giấc, an ninh, bãi giữ xe..."
                className="w-full p-3 rounded-xl border border-[#EDE5D5] bg-[#FFFAEF] text-xs sm:text-sm text-[#292524] focus:outline-none focus:border-[#DCA936] focus:bg-white leading-relaxed resize-none"
              />
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* SECTION 5: THƯ VIỆN HÌNH ẢNH                             */}
        {/* ======================================================== */}
        <section className="bg-white rounded-3xl border border-[#EDE5D5] p-5 sm:p-7 space-y-4 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-[#EDE5D5]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center font-bold">
                <ImageIcon className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-[#292524]">5. Hình ảnh phòng thực tế ({form.images.length})</h2>
                <p className="text-xs text-[#78716C]">
                  Đăng tải ảnh chụp thật của phòng, tránh dùng ảnh phối cảnh 3D gây hiểu nhầm
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="px-3.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{isUploading ? "Đang tải ảnh..." : "Thêm ảnh mới"}</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {form.images.map((imgUrl, idx) => (
              <div
                key={idx}
                className="relative aspect-4/3 rounded-2xl overflow-hidden border border-[#EDE5D5] group bg-stone-100 shadow-2xs"
              >
                <img src={imgUrl} alt={`Ảnh ${idx + 1}`} className="w-full h-full object-cover" />
                {idx === 0 && (
                  <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-amber-500 text-white font-bold text-[9px] shadow-xs">
                    Ảnh bìa
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => handleRemoveImage(idx)}
                  className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/60 hover:bg-rose-600 text-white flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                  title="Xóa ảnh này"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* ======================================================== */}
        {/* SECTION 6: VỊ TRÍ & ĐỊA CHỈ                              */}
        {/* ======================================================== */}
        <section className="bg-white rounded-3xl border border-[#EDE5D5] p-5 sm:p-7 space-y-4 shadow-xs">
          <div className="flex items-center gap-3 pb-3 border-b border-[#EDE5D5]">
            <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-800 flex items-center justify-center font-bold">
              <DoorClosed className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#292524]">6. Loại hình & Vị trí phòng</h2>
              <p className="text-xs text-[#78716C]">
                Địa chỉ rõ ràng giúp khách dễ dàng tìm đến xem phòng
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-[#292524] block mb-1.5">Loại hình bất động sản</label>
              <select
                value={form.propertyType}
                onChange={(e) => handleChange("propertyType", e.target.value as PropertyType)}
                className="w-full p-2.5 rounded-xl border border-[#EDE5D5] bg-[#FFFAEF] text-xs font-bold text-[#292524] focus:outline-none focus:border-[#DCA936] focus:bg-white"
              >
                {PROPERTY_TYPES.map((pt) => (
                  <option key={pt.value} value={pt.value}>
                    {pt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-[#292524] block mb-1.5">Địa chỉ chi tiết (Số nhà, tên đường)</label>
              <input
                type="text"
                value={form.address}
                onChange={(e) => handleChange("address", e.target.value)}
                placeholder="Ví dụ: 123/45 Điện Biên Phủ"
                className="w-full p-2.5 rounded-xl border border-[#EDE5D5] bg-[#FFFAEF] text-xs font-semibold text-[#292524] focus:outline-none focus:border-[#DCA936] focus:bg-white"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#292524] block mb-1.5">Quận / Huyện</label>
              <input
                type="text"
                value={form.district}
                onChange={(e) => handleChange("district", e.target.value)}
                placeholder="Quận Bình Thạnh"
                className="w-full p-2.5 rounded-xl border border-[#EDE5D5] bg-[#FFFAEF] text-xs font-semibold text-[#292524] focus:outline-none focus:border-[#DCA936] focus:bg-white"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#292524] block mb-1.5">Tỉnh / Thành phố</label>
              <input
                type="text"
                value={form.city}
                onChange={(e) => handleChange("city", e.target.value)}
                placeholder="Hồ Chí Minh"
                className="w-full p-2.5 rounded-xl border border-[#EDE5D5] bg-[#FFFAEF] text-xs font-semibold text-[#292524] focus:outline-none focus:border-[#DCA936] focus:bg-white"
              />
            </div>
          </div>
        </section>

        {/* Bottom Save Action Bar */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#EDE5D5]">
          <Link
            href={`/landlord/listings/${id}`}
            className="px-5 py-2.5 rounded-2xl border border-[#EDE5D5] bg-white hover:bg-[#FFF7E5] text-xs font-bold text-[#57534E] transition-all"
          >
            Hủy bỏ
          </Link>
          <button
            type="button"
            onClick={handleSaveListing}
            disabled={isSaving}
            className="px-7 py-2.5 rounded-2xl bg-[#292524] hover:bg-black text-white text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-[#F4CD65]" />
                <span>Đang lưu dữ liệu...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4 text-[#F4CD65]" />
                <span>Lưu thay đổi tin đăng</span>
              </>
            )}
          </button>
        </div>
      </main>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md bg-slate-900 text-white text-xs sm:text-sm font-medium px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-slate-800 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <CheckCircle2 className="w-4 h-4 text-[#F4CD65] shrink-0" />
          <span className="flex-1 leading-snug">{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
