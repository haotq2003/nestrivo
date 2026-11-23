"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  ShieldCheck, 
  MessageSquare, 
  Building2, 
  Home, 
  ChevronRight, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Lock, 
  ExternalLink, 
  LogOut,
  Save,
  ArrowRight,
  PhoneCall,
  MapPin,
  RefreshCw,
  Camera,
  UploadCloud,
  Trash2,
  CalendarCheck,
  XCircle,
  Flag
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { updateProfileApi } from "@/service/auth.service";
import { fetchRenterInquiries, RenterInquiryItem } from "@/service/inquiry.service";
import { uploadImageToCloudinary } from "@/service/upload.service";
import { adminService } from "@/service/admin.service";
import { formatVND } from "@/lib/utils";

type ActiveTab = "inquiries" | "reports" | "info" | "security";

export default function CustomerProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: isAuthLoading, refreshUser, logout } = useAuth();

  const [activeTab, setActiveTab] = useState<ActiveTab>("inquiries");
  const [inquiries, setInquiries] = useState<RenterInquiryItem[]>([]);
  const [inquiryStatusFilter, setInquiryStatusFilter] = useState<string>("ALL");
  const [isInquiriesLoading, setIsInquiriesLoading] = useState<boolean>(true);

  // My Reports state
  const [myReports, setMyReports] = useState<any[]>([]);
  const [isReportsLoading, setIsReportsLoading] = useState<boolean>(false);

  // Form states for personal info
  const [fullName, setFullName] = useState<string>("");
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const [isSavingInfo, setIsSavingInfo] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Cloudinary Avatar upload state
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState<boolean>(false);
  const [avatarUploadProgress, setAvatarUploadProgress] = useState<number>(0);

  // Password form state
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Upload Avatar to Cloudinary
  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showToast("Vui lòng chọn file hình ảnh hợp lệ (PNG, JPG, WEBP)", "error");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast("Kích thước ảnh tối đa là 5MB", "error");
      return;
    }

    setIsUploadingAvatar(true);
    setAvatarUploadProgress(15);
    try {
      const res = await uploadImageToCloudinary(file, {
        folder: "nestrivo/avatars",
        onProgress: (percent) => setAvatarUploadProgress(percent),
      });
      setAvatarUrl(res.secureUrl);
      showToast("Tải ảnh đại diện thành công! Nhớ bấm 'Lưu thay đổi' để hoàn tất.");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Tải ảnh lên thất bại", "error");
    } finally {
      setIsUploadingAvatar(false);
      setAvatarUploadProgress(0);
      if (avatarInputRef.current) {
        avatarInputRef.current.value = "";
      }
    }
  };

  // Sync user details to form
  useEffect(() => {
    if (user) {
      setFullName(user.fullName || "");
      setPhoneNumber(user.phoneNumber || "");
      setAvatarUrl(user.avatarUrl || "");
    }
  }, [user]);

  // Load inquiries sent by this customer
  const loadMyInquiries = useCallback(async () => {
    setIsInquiriesLoading(true);
    try {
      const data = await fetchRenterInquiries(inquiryStatusFilter);
      setInquiries(data);
    } catch {
      // Ignored
    } finally {
      setIsInquiriesLoading(false);
    }
  }, [inquiryStatusFilter]);

  // Load reports sent by this customer
  const loadMyReports = useCallback(async () => {
    setIsReportsLoading(true);
    try {
      const res = await adminService.getMyReports();
      if (res && res.data) {
        setMyReports(res.data);
      }
    } catch {
      // Ignored
    } finally {
      setIsReportsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadMyInquiries();
      loadMyReports();
    }
  }, [isAuthenticated, loadMyInquiries, loadMyReports]);

  // Handle personal info submit
  const handleUpdateInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      showToast("Vui lòng nhập họ và tên", "error");
      return;
    }

    setIsSavingInfo(true);
    try {
      await updateProfileApi({
        fullName: fullName.trim(),
        phoneNumber: phoneNumber.trim(),
        avatarUrl: avatarUrl.trim() || null,
      });
      await refreshUser();
      showToast("Cập nhật thông tin cá nhân thành công!");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Có lỗi xảy ra khi lưu thông tin", "error");
    } finally {
      setIsSavingInfo(false);
    }
  };

  const isLandlord = user?.roles?.includes("LANDLORD");
  const isAdmin = user?.roles?.includes("ADMIN");

  const initialLetter = (fullName || user?.fullName || "K").charAt(0).toUpperCase();

  const formatDate = (isoString?: string | null) => {
    if (!isoString) return "Mới đây";
    try {
      return new Date(isoString).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFAEF] text-[#373523] pb-24">
      {/* Hidden File Input for Cloudinary Avatar Upload */}
      <input
        ref={avatarInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/jpg"
        className="hidden"
        onChange={handleAvatarFileChange}
      />

      {/* 1. Breadcrumb Navigation */}
      <div className="bg-white border-b border-[#EDE5D5]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-[#77715F]">
            <Link href="/" className="hover:text-[#373523] transition-colors flex items-center gap-1">
              <Home className="w-3.5 h-3.5" />
              <span>Trang chủ</span>
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-[#A8A190]" />
            <span className="font-bold text-[#373523]">Hồ sơ khách hàng</span>
          </div>

          <div className="flex items-center gap-3">
            {isLandlord && (
              <Link
                href="/landlord/dashboard"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FFF1CC] text-[#805B10] border border-[#F4CD65]/50 text-xs font-bold hover:bg-[#F4CD65] hover:text-[#373523] transition-all"
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Kênh Quản trị Chủ nhà</span>
              </Link>
            )}
            <button
              type="button"
              onClick={() => {
                logout();
                router.push("/login");
              }}
              className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Đăng xuất</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 space-y-6">
        {/* 2. Customer Hero Banner Card */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white via-[#FFFBF0] to-[#FFF6E3] border border-[#EDE5D5] p-6 sm:p-8 shadow-xs">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-[#F4CD65]/20 blur-3xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 sm:gap-6 relative z-10 text-center sm:text-left">
            {/* Avatar */}
            <div className="relative shrink-0 group">
              <div 
                onClick={() => !isUploadingAvatar && avatarInputRef.current?.click()}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-[#F4CD65] text-[#292524] font-bold text-2xl sm:text-3xl flex items-center justify-center shadow-md border-4 border-white overflow-hidden cursor-pointer relative"
                title="Bấm để tải ảnh đại diện từ máy tính"
              >
                {avatarUrl ? (
                  <Image
                    src={avatarUrl}
                    alt={fullName || "Avatar"}
                    width={96}
                    height={96}
                    className="w-full h-full object-cover group-hover:opacity-85 transition-opacity"
                    unoptimized
                  />
                ) : (
                  <span>{initialLetter}</span>
                )}
                {isUploadingAvatar && (
                  <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-1 text-white">
                    <RefreshCw className="w-5 h-5 animate-spin text-[#F4CD65]" />
                    <span className="text-[10px] font-medium">{avatarUploadProgress}%</span>
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                disabled={isUploadingAvatar}
                className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[#292524] hover:bg-black text-white border-2 border-white flex items-center justify-center shadow-xs transition-transform hover:scale-110 cursor-pointer disabled:opacity-50"
                title="Tải ảnh mới từ thiết bị"
              >
                <Camera className="w-3.5 h-3.5 text-[#F4CD65]" />
              </button>
            </div>

            {/* User Meta */}
            <div className="space-y-1.5 flex-1 min-w-0">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-[#292524] truncate">
                  {user?.fullName || "Khách thuê Nestrivo"}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#FFF1CC] text-[#805B10] border border-[#F4CD65]/40 inline-flex items-center gap-1">
                  <User className="w-3 h-3 text-[#DCA936]" />
                  <span>
                    {isAdmin
                      ? "Quản trị viên"
                      : isLandlord
                      ? "Chủ nhà & Khách thuê"
                      : "Khách thuê phòng (Renter)"}
                  </span>
                </span>
              </div>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-[#77715F] font-medium pt-0.5">
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-[#A8A190]" />
                  <span>{user?.email || "Chưa cập nhật email"}</span>
                </span>
                {user?.phoneNumber && (
                  <span className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-[#A8A190]" />
                    <span>{user.phoneNumber}</span>
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#A8A190]" />
                  <span>Thành viên từ 2026</span>
                </span>
              </div>
            </div>

            {/* Quick action: Link to Landlord Dashboard if user is landlord */}
            {isLandlord && (
              <div className="shrink-0 flex items-center gap-2 pt-2 sm:pt-0">
                <Link
                  href="/landlord/dashboard"
                  className="px-4 py-2.5 rounded-2xl bg-[#373523] hover:bg-[#2b2a1c] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
                >
                  <Building2 className="w-4 h-4 text-[#F4CD65]" />
                  <span>Kênh Chủ Nhà</span>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* 3. Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-[#EDE5D5] pb-px overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab("inquiries")}
            className={`px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === "inquiries"
                ? "border-[#DCA936] text-[#373523] bg-white rounded-t-2xl shadow-2xs"
                : "border-transparent text-[#77715F] hover:text-[#373523]"
            }`}
          >
            <MessageSquare className="w-4 h-4 text-[#DCA936]" />
            <span>Yêu cầu thuê đã gửi</span>
            {inquiries.length > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#FFF1CC] text-[#805B10] border border-[#F4CD65]/40">
                {inquiries.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("reports")}
            className={`px-4 py-3 text-xs sm:text-sm font-semibold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === "reports"
                ? "border-[#DCA936] text-[#373523] bg-white rounded-t-2xl shadow-2xs font-bold"
                : "border-transparent text-[#77715F] hover:text-[#373523]"
            }`}
          >
            <Flag className="w-4 h-4 text-rose-500" />
            <span>Tin đã báo cáo</span>
            {myReports.length > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-rose-50 text-rose-700 border border-rose-200">
                {myReports.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("info")}
            className={`px-4 py-3 text-xs sm:text-sm font-semibold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === "info"
                ? "border-[#DCA936] text-[#292524] bg-white rounded-t-2xl shadow-2xs"
                : "border-transparent text-[#57534E] hover:text-[#292524]"
            }`}
          >
            <User className="w-4 h-4 text-[#DCA936]" />
            <span>Thông tin cá nhân</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("security")}
            className={`px-4 py-3 text-xs sm:text-sm font-semibold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === "security"
                ? "border-[#DCA936] text-[#292524] bg-white rounded-t-2xl shadow-2xs"
                : "border-transparent text-[#57534E] hover:text-[#292524]"
            }`}
          >
            <Lock className="w-4 h-4 text-[#DCA936]" />
            <span>Bảo mật & Mật khẩu</span>
          </button>
        </div>

        {/* 4. Tab Content Area */}
        <div>
          {/* ======================================================== */}
          {/* TAB 1: YÊU CẦU THUÊ ĐÃ GỬI (SENT INQUIRIES)               */}
          {/* ======================================================== */}
          {activeTab === "inquiries" && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-base sm:text-lg font-semibold text-[#292524]">
                    Danh sách phòng đã gửi yêu cầu hỏi thuê
                  </h2>
                  <p className="text-xs text-[#57534E]">
                    Theo dõi phản hồi từ chủ nhà và lưu lại thông tin liên hệ tiện xem phòng
                  </p>
                </div>

                {/* Status Filter */}
                <div className="flex flex-wrap items-center gap-1.5">
                  {[
                    { key: "ALL", label: "Tất cả" },
                    { key: "PENDING", label: "Chờ duyệt" },
                    { key: "CONFIRMED", label: "Đã duyệt lịch" },
                    { key: "REJECTED", label: "Đã từ chối" },
                    { key: "CONTACTED", label: "Đã liên hệ" },
                    { key: "CLOSED", label: "Đã đóng" },
                  ].map((filter) => (
                    <button
                      key={filter.key}
                      type="button"
                      onClick={() => setInquiryStatusFilter(filter.key)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                        inquiryStatusFilter === filter.key
                          ? "bg-[#F4CD65] text-[#292524] shadow-xs"
                          : "bg-white text-[#57534E] border border-[#EDE5D5] hover:bg-[#FFF7E5]"
                      }`}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>
              </div>

              {isInquiriesLoading ? (
                <div className="bg-white rounded-3xl border border-[#EDE5D5] p-12 text-center flex flex-col items-center justify-center space-y-3 shadow-2xs">
                  <RefreshCw className="w-8 h-8 text-[#DCA936] animate-spin" />
                  <p className="text-sm font-medium text-[#57534E]">
                    Đang tải danh sách yêu cầu hỏi thuê...
                  </p>
                </div>
              ) : inquiries.length === 0 ? (
                <div className="bg-white rounded-3xl border border-[#EDE5D5] p-10 sm:p-14 text-center space-y-4 shadow-2xs">
                  <div className="w-16 h-16 rounded-2xl bg-[#FFF1CC] text-[#805B10] flex items-center justify-center mx-auto shadow-xs">
                    <MessageSquare className="w-8 h-8" />
                  </div>
                  <div className="space-y-1 max-w-md mx-auto">
                    <h3 className="text-base sm:text-lg font-semibold text-[#292524]">
                      Chưa có yêu cầu hỏi thuê nào
                    </h3>
                    <p className="text-xs sm:text-sm text-[#57534E] leading-relaxed font-normal">
                      Bạn chưa gửi yêu cầu hỏi thuê phòng trọ nào. Hãy dạo quanh sàn tìm phòng ưng ý và gửi yêu cầu để chủ nhà liên hệ bạn sớm nhất nhé!
                    </p>
                  </div>
                  <Link
                    href="/"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#F4CD65] hover:bg-[#ebbf4d] text-[#292524] font-medium text-xs sm:text-sm shadow-xs transition-all cursor-pointer"
                  >
                    <span>Khám phá phòng trọ ngay</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {inquiries.map((inq) => {
                    const isPending = inq.status === "PENDING";
                    const isConfirmed = inq.status === "CONFIRMED";
                    const isRejected = inq.status === "REJECTED";
                    const isContacted = inq.status === "CONTACTED";
                    const isClosed = inq.status === "CLOSED";

                    return (
                      <div
                        key={inq.id}
                        className="bg-white rounded-3xl border border-[#EDE5D5] p-5 sm:p-6 shadow-xs hover:border-[#DCA936] transition-all space-y-4"
                      >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#EDE5D5]/60 pb-4">
                          {/* Room Listing Preview */}
                          <div className="flex items-start gap-4 min-w-0">
                            <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-slate-100 shrink-0 border border-[#EDE5D5]">
                              <Image
                                src={
                                  inq.listing.thumbnailUrl ||
                                  (inq.listing as any).images?.[0]?.imageUrl ||
                                  "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&auto=format&fit=crop&q=80"
                                }
                                alt={inq.listing.title}
                                fill
                                className="object-cover"
                                unoptimized
                              />
                            </div>
                            <div className="space-y-1 min-w-0">
                              <span className="text-[11px] font-medium text-[#805B10] bg-[#FFF1CC] px-2 py-0.5 rounded-md border border-[#F4CD65]/40 inline-block">
                                {inq.listing.propertyType || "Phòng trọ"}
                              </span>
                              <Link
                                href={`/listings/${inq.listing.id}`}
                                className="text-sm sm:text-base font-semibold text-[#292524] hover:text-[#DCA936] transition-colors line-clamp-1 block"
                              >
                                {inq.listing.title}
                              </Link>
                              <div className="flex items-center gap-1.5 text-xs text-[#57534E] truncate font-normal">
                                <MapPin className="w-3.5 h-3.5 shrink-0 text-[#A8A29E]" />
                                <span className="truncate">
                                  {inq.listing.address}, {inq.listing.district}, {inq.listing.city}
                                </span>
                              </div>
                              <div className="text-sm font-semibold text-[#805B10] pt-0.5">
                                {formatVND(inq.listing.price)}/tháng
                              </div>
                            </div>
                          </div>

                          {/* Status Badge */}
                          <div className="shrink-0 flex md:flex-col items-center md:items-end justify-between gap-1.5">
                            {isPending && (
                              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200 inline-flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                                <span>Chờ chủ nhà duyệt lịch</span>
                              </span>
                            )}
                            {isConfirmed && (
                              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 inline-flex items-center gap-1.5">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Chủ nhà ĐÃ DUYỆT lịch hẹn</span>
                              </span>
                            )}
                            {isRejected && (
                              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-200 inline-flex items-center gap-1.5">
                                <XCircle className="w-3.5 h-3.5 text-rose-600" />
                                <span>Chủ nhà ĐÃ TỪ CHỐI lịch</span>
                              </span>
                            )}
                            {isContacted && (
                              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200 inline-flex items-center gap-1.5">
                                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                                <span>Chủ nhà đã liên hệ</span>
                              </span>
                            )}
                            {isClosed && (
                              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200 inline-flex items-center gap-1.5">
                                <CheckCircle2 className="w-3.5 h-3.5 text-slate-500" />
                                <span>Yêu cầu đã đóng</span>
                              </span>
                            )}
                            <span className="text-[11px] text-[#A8A190] font-medium">
                              Gửi ngày: {formatDate(inq.createdAt)}
                            </span>
                          </div>
                        </div>

                        {/* Notification Banner for Tour Status */}
                        {isConfirmed && (
                          <div className="p-3.5 rounded-2xl bg-emerald-50/90 border border-emerald-200 text-emerald-950 text-xs sm:text-sm font-semibold flex items-start gap-2.5">
                            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                            <div className="space-y-0.5">
                              <span className="font-bold">Lịch hẹn xem phòng đã được chủ nhà duyệt thành công!</span>
                              <p className="text-xs text-emerald-800 font-normal leading-relaxed">
                                Vui lòng ghi nhớ thời gian hẹn và đến xem phòng đúng giờ. Nếu cần đổi giờ hoặc hỏi thêm đường đi, bạn có thể gọi điện hoặc nhắn Zalo cho chủ nhà ở khung liên hệ bên dưới.
                              </p>
                            </div>
                          </div>
                        )}

                        {isRejected && (
                          <div className="p-3.5 rounded-2xl bg-rose-50/90 border border-rose-200 text-rose-950 text-xs sm:text-sm font-semibold flex items-start gap-2.5">
                            <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                            <div className="space-y-0.5">
                              <span className="font-bold">Chủ nhà đã từ chối lịch xem này</span>
                              <p className="text-xs text-rose-800 font-normal leading-relaxed">
                                Chủ nhà có thể bận vào khung giờ bạn đã chọn hoặc phòng đã có người cọc trước. Bạn có thể liên hệ trực tiếp chủ nhà hoặc tìm kiếm các căn phòng tương tự khác trên sàn.
                              </p>
                            </div>
                          </div>
                        )}

                        {isPending && (
                          <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200/70 text-amber-900 text-xs font-medium flex items-center gap-2">
                            <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                            <span>Yêu cầu đang chờ chủ nhà kiểm tra và xếp lịch. Chủ nhà thường phản hồi rất nhanh trong ngày.</span>
                          </div>
                        )}

                        {/* Renter Message & Details */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
                          <div className="md:col-span-2 space-y-2 bg-[#FFFAEF] p-4 rounded-2xl border border-[#EDE5D5]/80">
                            <span className="text-xs font-bold text-[#805B10] block">
                              Lời nhắn bạn đã gửi:
                            </span>
                            <p className="text-xs sm:text-sm text-[#373523] italic leading-relaxed">
                              &ldquo;{inq.message}&rdquo;
                            </p>
                            <div className="flex flex-wrap items-center gap-4 text-xs text-[#77715F] pt-1 border-t border-[#EDE5D5]/60 font-medium">
                              {inq.notes && (
                                <span className="text-[#805B10] font-semibold flex items-center gap-1 bg-[#FFF1CC] px-2.5 py-1 rounded-lg">
                                  <CalendarCheck className="w-3.5 h-3.5 text-[#805B10]" />
                                  <span>{inq.notes}</span>
                                </span>
                              )}
                              {inq.moveInDate && (
                                <span>Dự kiến dọn vào: <strong className="text-[#373523]">{formatDate(inq.moveInDate)}</strong></span>
                              )}
                              {inq.occupantsCount && (
                                <span>Số người ở: <strong className="text-[#373523]">{inq.occupantsCount} người</strong></span>
                              )}
                            </div>
                          </div>

                          {/* Landlord Contact Box */}
                          <div className="space-y-2 bg-white p-4 rounded-2xl border border-[#EDE5D5] flex flex-col justify-between">
                            <div>
                              <span className="text-xs font-bold text-[#373523] block mb-1">
                                Thông tin Chủ nhà:
                              </span>
                              <div className="text-xs font-bold text-[#373523] truncate">
                                {inq.landlord.name || "Chủ nhà Nestrivo"}
                              </div>
                              <div className="text-xs text-[#77715F] truncate">
                                {inq.landlord.phoneNumber || "Chưa cập nhật SĐT"}
                              </div>
                            </div>

                            {inq.landlord.phoneNumber && inq.landlord.phoneNumber !== "Chưa cập nhật" && (
                              <div className="pt-2 flex items-center gap-2">
                                <a
                                  href={`tel:${inq.landlord.phoneNumber}`}
                                  className="flex-1 py-1.5 px-3 rounded-xl bg-[#F4CD65] hover:bg-[#ebbf4d] text-[#373523] font-bold text-xs text-center transition-colors flex items-center justify-center gap-1.5"
                                >
                                  <PhoneCall className="w-3.5 h-3.5" />
                                  <span>Gọi điện</span>
                                </a>
                                <a
                                  href={`https://zalo.me/${inq.landlord.phoneNumber.replace(/\s+/g, "")}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex-1 py-1.5 px-3 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-xs text-center transition-colors border border-blue-200"
                                >
                                  <span>Zalo</span>
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB: DANH SÁCH BÁO CÁO VI PHẠM ĐÃ GỬI (MY REPORTS)       */}
          {/* ======================================================== */}
          {activeTab === "reports" && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-[#292524] flex items-center gap-2">
                    <Flag className="w-5 h-5 text-rose-500" />
                    <span>Lịch sử báo cáo tin đăng vi phạm ({myReports.length})</span>
                  </h2>
                  <p className="text-xs text-[#78716C] mt-0.5">
                    Theo dõi tiến độ xác minh và kết luận xử lý từ Ban quản trị Nestrivo
                  </p>
                </div>

                <button
                  type="button"
                  onClick={loadMyReports}
                  disabled={isReportsLoading}
                  className="px-3 py-1.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-xs font-semibold text-stone-600 flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isReportsLoading ? "animate-spin" : ""}`} />
                  <span>Làm mới</span>
                </button>
              </div>

              {isReportsLoading && myReports.length === 0 ? (
                <div className="py-16 text-center space-y-3 bg-white rounded-3xl border border-[#EDE5D5]">
                  <RefreshCw className="w-8 h-8 animate-spin text-[#805B10] mx-auto" />
                  <p className="text-xs text-stone-500">Đang tải lịch sử báo cáo...</p>
                </div>
              ) : myReports.length === 0 ? (
                <div className="py-16 px-4 text-center space-y-3 bg-white rounded-3xl border border-dashed border-[#EDE5D5]">
                  <div className="w-14 h-14 rounded-2xl bg-stone-100 text-stone-400 flex items-center justify-center mx-auto">
                    <Flag className="w-7 h-7" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-base font-bold text-[#292524]">
                      Bạn chưa gửi báo cáo vi phạm nào
                    </h4>
                    <p className="text-xs text-[#78716C] max-w-md mx-auto leading-relaxed">
                      Khi phát hiện tin đăng có thông tin không chính xác (sai giá, ảnh không đúng thực tế, hoặc có dấu hiệu cọc ảo), bạn có thể bấm &ldquo;Báo cáo vi phạm&rdquo; trên trang chi tiết phòng để giúp làm sạch cộng đồng Nestrivo.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3.5">
                  {myReports.map((rep) => {
                    const isPending = rep.status === "PENDING";
                    const isResolved = rep.status === "RESOLVED";
                    const isDismissed = rep.status === "DISMISSED";

                    return (
                      <div
                        key={rep.id}
                        className="bg-white rounded-3xl border border-[#EDE5D5] p-5 sm:p-6 shadow-2xs space-y-4 hover:border-[#DCA936]/60 transition-colors"
                      >
                        {/* Top: Status & Date */}
                        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-stone-100 text-xs">
                          <div className="flex flex-wrap items-center gap-2">
                            {isPending && (
                              <span className="px-2.5 py-1 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 font-semibold flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                                <span>Đang chờ Admin xác minh</span>
                              </span>
                            )}
                            {isResolved && (
                              <span className="px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold flex items-center gap-1.5">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Đã xử lý: {rep.resolutionAction || "Gỡ tin / Cảnh báo"}</span>
                              </span>
                            )}
                            {isDismissed && (
                              <span className="px-2.5 py-1 rounded-xl bg-stone-100 text-stone-700 border border-stone-200 font-semibold flex items-center gap-1.5">
                                <XCircle className="w-3.5 h-3.5 text-stone-500" />
                                <span>Đã bác bỏ (Tin hợp lệ)</span>
                              </span>
                            )}
                            <span className="px-2.5 py-1 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 font-semibold">
                              {rep.reasonLabel || rep.reason}
                            </span>
                          </div>

                          <span className="text-[11px] text-stone-400">
                            Gửi lúc: {formatDate(rep.createdAt)}
                          </span>
                        </div>

                        {/* Room Info */}
                        <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                          <div className="flex items-start gap-3.5 min-w-0">
                            <div className="w-16 h-16 rounded-2xl bg-stone-100 border border-stone-200 overflow-hidden shrink-0 relative">
                              {rep.listing?.images?.[0]?.url ? (
                                <img
                                  src={rep.listing.images[0].url}
                                  alt={rep.listing.title}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-stone-400">
                                  <Home className="w-6 h-6" />
                                </div>
                              )}
                            </div>
                            <div className="space-y-1 min-w-0">
                              <h3 className="font-bold text-sm text-[#292524] line-clamp-1">
                                {rep.listing?.title || "Phòng trọ đã báo cáo"}
                              </h3>
                              {rep.listing?.price && (
                                <span className="text-xs font-bold text-[#805B10] block">
                                  {formatVND(rep.listing.price)}/tháng
                                </span>
                              )}
                              {rep.listingId && (
                                <Link
                                  href={`/listings/${rep.listingId}`}
                                  target="_blank"
                                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-stone-500 hover:text-[#805B10] transition-colors"
                                >
                                  <span>Xem lại trang tin</span>
                                  <ExternalLink className="w-3 h-3" />
                                </Link>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Description submitted */}
                        <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-100 text-xs space-y-1">
                          <span className="font-semibold text-stone-600 block">Nội dung bạn đã phản ánh:</span>
                          <p className="text-stone-800 leading-relaxed italic">
                            &ldquo;{rep.description || "Không có nội dung mô tả"}&rdquo;
                          </p>

                          {/* Evidence thumbnail preview */}
                          {rep.evidenceUrls && rep.evidenceUrls.length > 0 && (
                            <div className="pt-2 flex flex-wrap gap-2">
                              {rep.evidenceUrls.map((url: string, idx: number) => (
                                <a
                                  key={idx}
                                  href={url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="w-12 h-12 rounded-xl overflow-hidden border border-stone-200 block hover:opacity-80 transition-opacity"
                                  title="Bấm để xem ảnh bằng chứng gốc"
                                >
                                  <img src={url} alt="Bằng chứng" className="w-full h-full object-cover" />
                                </a>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Admin Resolution Feedback (if resolved or dismissed) */}
                        {rep.adminNote && (
                          <div className={`p-3.5 rounded-2xl border text-xs space-y-1 ${
                            isResolved
                              ? "bg-emerald-50/70 border-emerald-200 text-emerald-950"
                              : "bg-stone-50 border-stone-200 text-stone-800"
                          }`}>
                            <div className="flex items-center gap-1.5 font-bold">
                              <CheckCircle2 className={`w-3.5 h-3.5 ${isResolved ? "text-emerald-600" : "text-stone-500"}`} />
                              <span>Phản hồi kết luận từ Ban quản trị Nestrivo:</span>
                            </div>
                            <p className="leading-relaxed pl-5">
                              {rep.adminNote}
                            </p>
                            {rep.resolvedAt && (
                              <span className="text-[10px] text-stone-500 block pl-5 pt-0.5">
                                Xử lý lúc: {formatDate(rep.resolvedAt)}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 2: THÔNG TIN CÁ NHÂN (PERSONAL INFO)                 */}
          {/* ======================================================== */}
          {activeTab === "info" && (
            <div className="bg-white rounded-3xl border border-[#EDE5D5] p-6 sm:p-8 shadow-xs max-w-2xl">
              <form onSubmit={handleUpdateInfo} className="space-y-5">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-[#373523]">
                    Thông tin tài khoản khách hàng
                  </h3>
                  <p className="text-xs text-[#77715F]">
                    Cập nhật họ tên và số điện thoại để chủ nhà dễ dàng liên hệ với bạn
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Full Name */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 block">
                      Họ và tên <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Nguyễn Văn A"
                      className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl text-[#373523] font-medium focus:outline-none focus:bg-white focus:border-[#F4CD65] focus:ring-2 focus:ring-[#F4CD65]/20 transition-all"
                      required
                    />
                  </div>

                  {/* Phone Number */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 block">
                      Số điện thoại liên hệ
                    </label>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="0912 345 678"
                      className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl text-[#373523] font-medium focus:outline-none focus:bg-white focus:border-[#F4CD65] focus:ring-2 focus:ring-[#F4CD65]/20 transition-all"
                    />
                  </div>

                  {/* Email (Readonly) */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 block">
                      Địa chỉ Email (Đăng nhập)
                    </label>
                    <input
                      type="email"
                      value={user?.email || ""}
                      disabled
                      className="w-full px-4 py-2.5 text-sm bg-slate-100 border border-slate-200 rounded-xl text-slate-500 font-medium cursor-not-allowed"
                    />
                    <span className="text-[11px] text-slate-400">
                      Email được cố định để bảo vệ tài khoản và xác thực phiên đăng nhập
                    </span>
                  </div>

                  {/* Avatar Upload with Cloudinary */}
                  <div className="space-y-2 pt-2 border-t border-[#EDE5D5]/60">
                    <label className="text-xs font-bold text-slate-700 block">
                      Ảnh đại diện
                    </label>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-2xl bg-[#FFFDF9] border border-[#EDE5D5]">
                      {/* Avatar Preview */}
                      <div className="relative w-16 h-16 rounded-2xl bg-[#F4CD65] text-[#292524] font-bold text-xl flex items-center justify-center overflow-hidden shrink-0 border-2 border-white shadow-2xs">
                        {avatarUrl ? (
                          <Image
                            src={avatarUrl}
                            alt="Avatar preview"
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        ) : (
                          <span>{initialLetter}</span>
                        )}
                        {isUploadingAvatar && (
                          <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-0.5 text-white">
                            <RefreshCw className="w-4 h-4 animate-spin text-[#F4CD65]" />
                            <span className="text-[9px] font-medium">{avatarUploadProgress}%</span>
                          </div>
                        )}
                      </div>

                      {/* Action buttons & description */}
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            disabled={isUploadingAvatar}
                            onClick={() => avatarInputRef.current?.click()}
                            className="px-4 py-2 rounded-xl bg-[#F4CD65] hover:bg-[#ebbf4d] active:bg-[#dda934] text-[#292524] font-medium text-xs transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                          >
                            <UploadCloud className="w-4 h-4 text-[#805B10]" />
                            <span>
                              {isUploadingAvatar
                                ? `Đang tải lên (${avatarUploadProgress}%)...`
                                : "Tải ảnh từ máy"}
                            </span>
                          </button>

                          {avatarUrl && (
                            <button
                              type="button"
                              disabled={isUploadingAvatar}
                              onClick={() => {
                                setAvatarUrl("");
                                showToast("Đã xóa ảnh. Nhớ bấm 'Lưu thay đổi' để hoàn tất cập nhật!");
                              }}
                              className="px-3.5 py-2 rounded-xl bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 font-medium text-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Gỡ ảnh</span>
                            </button>
                          )}
                        </div>
                        <p className="text-[11px] text-[#78716C] font-normal">
                          Định dạng JPG, PNG hoặc WEBP (dung lượng tối đa 5MB).
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSavingInfo}
                    className="px-6 py-2.5 rounded-2xl bg-[#F4CD65] hover:bg-[#ebbf4d] active:bg-[#dda934] text-[#292524] font-medium text-sm shadow-xs transition-all flex items-center gap-2 cursor-pointer disabled:opacity-60"
                  >
                    {isSavingInfo ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    <span>{isSavingInfo ? "Đang lưu..." : "Lưu thay đổi"}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 3: BẢO MẬT & ĐỔI MẬT KHẨU                            */}
          {/* ======================================================== */}
          {activeTab === "security" && (
            <div className="bg-white rounded-3xl border border-[#EDE5D5] p-6 sm:p-8 shadow-xs max-w-xl space-y-6">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-[#373523]">
                  Bảo mật tài khoản
                </h3>
                <p className="text-xs text-[#77715F]">
                  Thay đổi mật khẩu đăng nhập định kỳ để đảm bảo an toàn cho tài khoản
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#FFFAEF] border border-[#EDE5D5] space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-[#805B10]">
                  <ShieldCheck className="w-4 h-4 text-[#DCA936]" />
                  <span>Tiêu chuẩn bảo mật tài khoản Nestrivo</span>
                </div>
                <ul className="text-xs text-[#77715F] space-y-1 list-disc pl-4 font-medium">
                  <li>Mật khẩu tối thiểu 8 ký tự.</li>
                  <li>Mã hóa mật khẩu an toàn với thuật toán Bcrypt 12 vòng.</li>
                  <li>Không chia sẻ tài khoản đăng nhập với người khác.</li>
                </ul>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (newPassword !== confirmPassword) {
                    showToast("Mật khẩu xác nhận không khớp!", "error");
                    return;
                  }
                  if (newPassword.length < 8) {
                    showToast("Mật khẩu mới phải có tối thiểu 8 ký tự!", "error");
                    return;
                  }
                  setIsChangingPassword(true);
                  setTimeout(() => {
                    setIsChangingPassword(false);
                    setOldPassword("");
                    setNewPassword("");
                    setConfirmPassword("");
                    showToast("Đã cập nhật mật khẩu mới thành công!");
                  }, 800);
                }}
                className="space-y-4"
              >
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">
                    Mật khẩu hiện tại
                  </label>
                  <input
                    type="password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl text-[#373523] focus:outline-none focus:bg-white focus:border-[#F4CD65] focus:ring-2 focus:ring-[#F4CD65]/20 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">
                    Mật khẩu mới
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Tối thiểu 8 ký tự"
                    required
                    className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl text-[#373523] focus:outline-none focus:bg-white focus:border-[#F4CD65] focus:ring-2 focus:ring-[#F4CD65]/20 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">
                    Xác nhận mật khẩu mới
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Nhập lại mật khẩu mới"
                    required
                    className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl text-[#373523] focus:outline-none focus:bg-white focus:border-[#F4CD65] focus:ring-2 focus:ring-[#F4CD65]/20 transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isChangingPassword}
                  className="px-6 py-2.5 rounded-2xl bg-[#373523] hover:bg-[#2b2a1c] text-white font-bold text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  <Lock className="w-4 h-4 text-[#F4CD65]" />
                  <span>{isChangingPassword ? "Đang xử lý..." : "Cập nhật mật khẩu"}</span>
                </button>
              </form>
            </div>
          )}

        </div>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-200 border border-slate-700/80">
          <div
            className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
              toastMessage.type === "success"
                ? "bg-[#F4CD65] text-[#373523]"
                : "bg-rose-500 text-white"
            }`}
          >
            {toastMessage.type === "success" ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : (
              <AlertCircle className="w-4 h-4" />
            )}
          </div>
          <p className="text-xs font-bold flex-1">{toastMessage.text}</p>
        </div>
      )}
    </div>
  );
}

