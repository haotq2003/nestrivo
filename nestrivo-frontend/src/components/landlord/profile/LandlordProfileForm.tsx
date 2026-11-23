"use client";

import { useState, useId } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  ShieldCheck, 
  Lock, 
  Plus, 
  X, 
  Save, 
  RotateCcw, 
  Camera, 
  AlertCircle,
  ExternalLink
} from "lucide-react";
import { LandlordProfileData } from "@/types/profile";
import { formatAccountCreatedDate, POPULAR_OPERATING_AREAS } from "@/lib/landlord-profile-helpers";
import { CITIES_AND_DISTRICTS } from "@/types/wizard";

interface LandlordProfileFormProps {
  initialData: LandlordProfileData;
  onSave: (updatedData: LandlordProfileData) => Promise<void> | void;
  isSaving?: boolean;
}

export function LandlordProfileForm({
  initialData,
  onSave,
  isSaving = false,
}: LandlordProfileFormProps) {
  // Local form state
  const [formData, setFormData] = useState<LandlordProfileData>(initialData);
  const [savedData, setSavedData] = useState<LandlordProfileData>(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [hasChanges, setHasChanges] = useState<boolean>(false);

  // Operating area picker state
  const [selectedCity, setSelectedCity] = useState<string>("Hồ Chí Minh");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("Bình Thạnh");
  const [showAvatarUrlInput, setShowAvatarUrlInput] = useState<boolean>(false);
  const [customAvatarUrl, setCustomAvatarUrl] = useState<string>("");

  const nameInputId = useId();
  const phoneInputId = useId();
  const emailInputId = useId();
  const addressInputId = useId();
  const introInputId = useId();
  const citySelectId = useId();
  const districtSelectId = useId();
  const avatarUrlInputId = useId();

  // Track if changes have been made
  const checkChanges = (newData: LandlordProfileData) => {
    const isDifferent =
      newData.fullName !== savedData.fullName ||
      newData.phoneNumber !== savedData.phoneNumber ||
      newData.contactAddress !== savedData.contactAddress ||
      newData.introduction !== savedData.introduction ||
      newData.avatarUrl !== savedData.avatarUrl ||
      JSON.stringify(newData.operatingAreas) !== JSON.stringify(savedData.operatingAreas);

    setHasChanges(isDifferent);
  };

  const handleFieldChange = (field: keyof LandlordProfileData, value: unknown) => {
    setFormData((prev) => {
      const next = { ...prev, [field]: value };
      checkChanges(next);
      return next;
    });

    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  // Add operating area
  const handleAddArea = (areaToAdd?: string) => {
    const area = areaToAdd || `${selectedDistrict}, ${selectedCity}`;
    if (!area.trim()) return;

    if (formData.operatingAreas.includes(area)) {
      setErrors((prev) => ({
        ...prev,
        operatingAreas: "Khu vực này đã có trong danh sách hoạt động.",
      }));
      return;
    }

    const updatedAreas = [...formData.operatingAreas, area];
    handleFieldChange("operatingAreas", updatedAreas);
    if (errors.operatingAreas) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.operatingAreas;
        return next;
      });
    }
  };

  // Remove operating area
  const handleRemoveArea = (areaToRemove: string) => {
    const updatedAreas = formData.operatingAreas.filter((a) => a !== areaToRemove);
    handleFieldChange("operatingAreas", updatedAreas);
  };

  // Avatar update
  const handleApplyCustomAvatar = () => {
    if (customAvatarUrl.trim()) {
      handleFieldChange("avatarUrl", customAvatarUrl.trim());
      setShowAvatarUrlInput(false);
      setCustomAvatarUrl("");
    }
  };

  const handleRemoveAvatar = () => {
    handleFieldChange("avatarUrl", null);
  };

  // Form validation
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim() || formData.fullName.trim().length < 2) {
      newErrors.fullName = "Họ và tên không được để trống (tối thiểu 2 ký tự).";
    }

    const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/;
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = "Số điện thoại liên hệ là bắt buộc.";
    } else if (!phoneRegex.test(formData.phoneNumber.trim().replace(/\s+/g, ""))) {
      newErrors.phoneNumber = "Số điện thoại không hợp lệ (cần 10 chữ số).";
    }

    if (!formData.contactAddress.trim()) {
      newErrors.contactAddress = "Địa chỉ liên hệ không được để trống.";
    }

    if (formData.introduction && formData.introduction.length > 300) {
      newErrors.introduction = "Lời giới thiệu không được vượt quá 300 ký tự.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle Save
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    await onSave(formData);
    setSavedData(formData);
    setHasChanges(false);
  };

  // Handle Cancel / Reset
  const handleCancel = () => {
    setFormData(savedData);
    setErrors({});
    setHasChanges(false);
    setShowAvatarUrlInput(false);
  };

  const availableDistricts =
    CITIES_AND_DISTRICTS[selectedCity]?.districts || [];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 1. Compact Header Profile Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            {/* Avatar container */}
            <div className="relative group shrink-0">
              <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-[#DCA936] to-[#F4CD65] text-[#292524] font-bold text-2xl flex items-center justify-center overflow-hidden shadow-xs ring-4 ring-[#FFF1CC]">
                {formData.avatarUrl ? (
                  <Image
                    src={formData.avatarUrl}
                    alt={formData.fullName}
                    width={80}
                    height={80}
                    className="w-full h-full object-cover"
                    unoptimized
                  />
                ) : (
                  <span>
                    {formData.fullName
                      ? formData.fullName
                          .split(" ")
                          .slice(-2)
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()
                      : "CN"}
                  </span>
                )}
              </div>

              {/* Avatar quick-action */}
              <button
                type="button"
                onClick={() => setShowAvatarUrlInput((prev) => !prev)}
                className="absolute -bottom-1.5 -right-1.5 w-7 h-7 bg-white rounded-lg border border-slate-200 text-slate-600 hover:text-[#805B10] hover:border-[#F4CD65] shadow-2xs flex items-center justify-center transition-all"
                title="Thay đổi ảnh đại diện"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Basic Info Overview */}
            <div className="space-y-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight truncate">
                  {formData.fullName || "Chưa đặt tên"}
                </h2>
                {/* KYC Badge (Read-only) */}
                <Link
                  href="/landlord/verification"
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border transition-colors ${
                    formData.verificationStatus === "VERIFIED"
                      ? "bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100"
                      : formData.verificationStatus === "PENDING"
                      ? "bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100"
                      : "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200"
                  }`}
                >
                  <ShieldCheck
                    className={`w-3.5 h-3.5 ${
                      formData.verificationStatus === "VERIFIED"
                        ? "text-emerald-600"
                        : formData.verificationStatus === "PENDING"
                        ? "text-amber-600"
                        : "text-slate-500"
                    }`}
                  />
                  <span>
                    {formData.verificationStatus === "VERIFIED"
                      ? "Đã xác minh KYC"
                      : formData.verificationStatus === "PENDING"
                      ? "Đang chờ duyệt KYC"
                      : "Chưa xác minh KYC"}
                  </span>
                  <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                </Link>
              </div>

              <p className="text-xs text-slate-500 truncate flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{formData.email}</span>
              </p>

              {/* Account Creation Date (Read-only) */}
              <div className="flex items-center gap-1.5 text-xs text-slate-600 pt-0.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>
                  Ngày tham gia Nestrivo:{" "}
                  <strong className="font-semibold text-slate-800">
                    {formatAccountCreatedDate(formData.createdAt)}
                  </strong>
                </span>
              </div>
            </div>
          </div>

          {/* Unsaved status badge */}
          {hasChanges && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 text-xs font-semibold animate-pulse self-start sm:self-center">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Có thay đổi chưa lưu</span>
            </div>
          )}
        </div>

        {/* Optional Avatar URL Input collapse */}
        {showAvatarUrlInput && (
          <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center gap-2">
            <label htmlFor={avatarUrlInputId} className="text-xs font-medium text-slate-600 shrink-0">
              Đường dẫn ảnh đại diện (URL):
            </label>
            <input
              id={avatarUrlInputId}
              type="url"
              value={customAvatarUrl}
              onChange={(e) => setCustomAvatarUrl(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="flex-1 min-w-[240px] px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-[#F4CD65] focus:bg-white"
            />
            <button
              type="button"
              onClick={handleApplyCustomAvatar}
              className="px-3 py-1.5 text-xs font-bold text-[#373523] bg-[#F4CD65] rounded-lg hover:bg-[#ebbf4d] transition-colors"
            >
              Áp dụng
            </button>
            {formData.avatarUrl && (
              <button
                type="button"
                onClick={handleRemoveAvatar}
                className="px-3 py-1.5 text-xs font-semibold text-rose-600 bg-rose-50 rounded-lg hover:bg-rose-100 transition-colors"
              >
                Gỡ ảnh
              </button>
            )}
            <button
              type="button"
              onClick={() => setShowAvatarUrlInput(false)}
              className="px-2 py-1.5 text-xs text-slate-500 hover:text-slate-700"
            >
              Đóng
            </button>
          </div>
        )}
      </div>

      {/* 2. Main Profile Details Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs space-y-5">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 pb-2 border-b border-slate-100 flex items-center gap-2">
          <User className="w-4 h-4 text-[#DCA936]" />
          <span>Thông tin cá nhân & Liên hệ</span>
        </h3>

        {/* 2-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          {/* Full Name (Editable) */}
          <div className="space-y-1.5">
            <label
              htmlFor={nameInputId}
              className="block text-xs font-bold text-slate-700"
            >
              Họ và tên <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id={nameInputId}
                type="text"
                value={formData.fullName}
                onChange={(e) => handleFieldChange("fullName", e.target.value)}
                placeholder="Nhập họ và tên đầy đủ"
                className={`w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm bg-white border rounded-xl text-slate-900 focus:outline-none focus:ring-2 transition-all ${
                  errors.fullName
                    ? "border-rose-400 focus:ring-rose-200"
                    : "border-slate-200 focus:border-[#F4CD65] focus:ring-[#F4CD65]/20"
                }`}
              />
            </div>
            {errors.fullName && (
              <p className="text-[11px] font-medium text-rose-600 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 shrink-0" />
                {errors.fullName}
              </p>
            )}
          </div>

          {/* Phone Number (Editable) */}
          <div className="space-y-1.5">
            <label
              htmlFor={phoneInputId}
              className="block text-xs font-bold text-slate-700"
            >
              Số điện thoại liên hệ <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id={phoneInputId}
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) => handleFieldChange("phoneNumber", e.target.value)}
                placeholder="VD: 0901234567"
                className={`w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm bg-white border rounded-xl text-slate-900 focus:outline-none focus:ring-2 transition-all ${
                  errors.phoneNumber
                    ? "border-rose-400 focus:ring-rose-200"
                    : "border-slate-200 focus:border-[#F4CD65] focus:ring-[#F4CD65]/20"
                }`}
              />
            </div>
            {errors.phoneNumber && (
              <p className="text-[11px] font-medium text-rose-600 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 shrink-0" />
                {errors.phoneNumber}
              </p>
            )}
          </div>

          {/* Email (Read-only) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor={emailInputId}
                className="block text-xs font-bold text-slate-700"
              >
                Email tài khoản
              </label>
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <Lock className="w-3 h-3 text-slate-400" />
                Cố định
              </span>
            </div>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id={emailInputId}
                type="email"
                value={formData.email}
                readOnly
                disabled
                className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm bg-slate-100 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed select-none font-medium"
              />
            </div>
            <p className="text-[11px] text-slate-400">
              Email dùng để đăng nhập và bảo mật tài khoản, không thể thay đổi trực tiếp.
            </p>
          </div>

          {/* Contact Address (Editable) */}
          <div className="space-y-1.5">
            <label
              htmlFor={addressInputId}
              className="block text-xs font-bold text-slate-700"
            >
              Địa chỉ liên hệ / Văn phòng <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id={addressInputId}
                type="text"
                value={formData.contactAddress}
                onChange={(e) => handleFieldChange("contactAddress", e.target.value)}
                placeholder="VD: 48/12 Điện Biên Phủ, Phường 25, Bình Thạnh..."
                className={`w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm bg-white border rounded-xl text-slate-900 focus:outline-none focus:ring-2 transition-all ${
                  errors.contactAddress
                    ? "border-rose-400 focus:ring-rose-200"
                    : "border-slate-200 focus:border-[#F4CD65] focus:ring-[#F4CD65]/20"
                }`}
              />
            </div>
            {errors.contactAddress && (
              <p className="text-[11px] font-medium text-rose-600 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 shrink-0" />
                {errors.contactAddress}
              </p>
            )}
          </div>
        </div>

        {/* 3. Personal Introduction (Editable Textarea, max 300) */}
        <div className="space-y-1.5 pt-3 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <label
              htmlFor={introInputId}
              className="block text-xs font-bold text-slate-700"
            >
              Giới thiệu bản thân
              <span className="ml-1 text-[11px] font-normal text-slate-400">
                (Không bắt buộc, tối đa 300 ký tự)
              </span>
            </label>
            <span
              className={`text-xs font-semibold tabular-nums ${
                (formData.introduction?.length || 0) > 280
                  ? "text-rose-600 font-bold"
                  : (formData.introduction?.length || 0) > 240
                  ? "text-amber-600"
                  : "text-slate-400"
              }`}
            >
              {formData.introduction?.length || 0} / 300 ký tự
            </span>
          </div>

          <textarea
            id={introInputId}
            rows={3}
            maxLength={300}
            value={formData.introduction || ""}
            onChange={(e) => handleFieldChange("introduction", e.target.value)}
            placeholder="Chia sẻ ngắn gọn về uy tín, kinh nghiệm cho thuê phòng hoặc phong cách quản lý để tạo dựng niềm tin với khách thuê..."
            className={`w-full px-3.5 py-2.5 text-xs sm:text-sm bg-white border rounded-xl text-slate-900 focus:outline-none focus:ring-2 transition-all leading-relaxed ${
              errors.introduction
                ? "border-rose-400 focus:ring-rose-200"
                : "border-slate-200 focus:border-[#F4CD65] focus:ring-[#F4CD65]/20"
            }`}
          />
          {errors.introduction ? (
            <p className="text-[11px] font-medium text-rose-600 flex items-center gap-1">
              <AlertCircle className="w-3 h-3 shrink-0" />
              {errors.introduction}
            </p>
          ) : (
            <p className="text-[11px] text-slate-400">
              Lời giới thiệu này sẽ hiển thị trên trang tin đăng phòng trọ của bạn để tăng độ tin cậy.
            </p>
          )}
        </div>

        {/* 4. Rental Operating Areas (Multi-tag selector) */}
        <div className="space-y-3 pt-3 border-t border-slate-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <label className="block text-xs font-bold text-slate-700">
              Khu vực hoạt động cho thuê
            </label>
            <span className="text-[11px] text-slate-400">
              Chọn các quận/huyện hoặc tỉnh/thành bạn đang có phòng cho thuê
            </span>
          </div>

          {/* Selected Area Tags */}
          <div className="flex flex-wrap gap-2 min-h-[38px] p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 items-center">
            {formData.operatingAreas.length === 0 ? (
              <span className="text-xs text-slate-400 italic">
                Chưa có khu vực nào được chọn. Vui lòng thêm khu vực bên dưới.
              </span>
            ) : (
              formData.operatingAreas.map((area) => (
                <span
                  key={area}
                  className="inline-flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 rounded-lg text-xs font-semibold bg-[#FFF1CC] text-[#805B10] border border-[#F4CD65]/40 shadow-2xs group"
                >
                  <MapPin className="w-3 h-3 text-[#805B10] shrink-0" />
                  <span>{area}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveArea(area)}
                    className="w-4 h-4 rounded-md text-[#805B10] hover:text-[#373523] hover:bg-[#F4CD65] flex items-center justify-center transition-colors ml-0.5"
                    aria-label={`Xóa khu vực ${area}`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))
            )}
          </div>
          {errors.operatingAreas && (
            <p className="text-[11px] font-medium text-rose-600 flex items-center gap-1">
              <AlertCircle className="w-3 h-3 shrink-0" />
              {errors.operatingAreas}
            </p>
          )}

          {/* Add Area Selector */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            {/* City Selector */}
            <div className="w-full sm:w-auto">
              <label htmlFor={citySelectId} className="sr-only">Tỉnh / Thành phố</label>
              <select
                id={citySelectId}
                value={selectedCity}
                onChange={(e) => {
                  const newCity = e.target.value;
                  setSelectedCity(newCity);
                  const firstDistrict = CITIES_AND_DISTRICTS[newCity]?.districts[0] || "";
                  setSelectedDistrict(firstDistrict);
                }}
                className="w-full sm:w-44 px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-800 font-medium focus:outline-none focus:border-[#F4CD65]"
              >
                {Object.keys(CITIES_AND_DISTRICTS).map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>

            {/* District Selector */}
            <div className="w-full sm:w-auto">
              <label htmlFor={districtSelectId} className="sr-only">Quận / Huyện</label>
              <select
                id={districtSelectId}
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="w-full sm:w-48 px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-800 font-medium focus:outline-none focus:border-[#F4CD65]"
              >
                {availableDistricts.map((district) => (
                  <option key={district} value={district}>
                    {district}
                  </option>
                ))}
              </select>
            </div>

            {/* Add Button */}
            <button
              type="button"
              onClick={() => handleAddArea()}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#F4CD65] hover:bg-[#ebbf4d] text-[#292524] font-medium text-xs shadow-xs transition-all w-full sm:w-auto cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Thêm khu vực</span>
            </button>
          </div>

          {/* Quick Suggestions Chips */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px]">
            <span className="text-slate-400 font-medium">Gợi ý nhanh:</span>
            {POPULAR_OPERATING_AREAS.filter(
              (area) => !formData.operatingAreas.includes(area)
            )
              .slice(0, 5)
              .map((area) => (
                <button
                  key={area}
                  type="button"
                  onClick={() => handleAddArea(area)}
                  className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 hover:bg-[#FFF1CC] hover:text-[#805B10] hover:border-[#F4CD65]/40 border border-slate-200/60 transition-all font-medium"
                >
                  + {area.split(",")[0]}
                </button>
              ))}
          </div>
        </div>
      </div>

      {/* 5. Sticky / Fixed Action Bar */}
      <div className="flex items-center justify-between gap-3 p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
          <span className="hidden sm:inline">
            Tài khoản tạo ngày:{" "}
            <strong className="text-slate-700 font-semibold">
              {formatAccountCreatedDate(formData.createdAt)}
            </strong>
          </span>
        </div>

        <div className="flex items-center gap-2.5 ml-auto">
          {/* Cancel button */}
          <button
            type="button"
            onClick={handleCancel}
            disabled={!hasChanges || isSaving}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              hasChanges && !isSaving
                ? "bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200"
                : "bg-slate-50 text-slate-400 border border-slate-200/60 cursor-not-allowed opacity-60"
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Hủy bỏ</span>
          </button>

          {/* Save button */}
          <button
            type="submit"
            disabled={!hasChanges || isSaving}
            className={`inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${
              hasChanges && !isSaving
                ? "bg-[#F4CD65] hover:bg-[#ebbf4d] active:bg-[#e0b03b] text-[#292524] shadow-xs"
                : "bg-slate-300 text-slate-500 cursor-not-allowed"
            }`}
          >
            {isSaving ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-slate-700/40 border-t-slate-900 rounded-full animate-spin" />
                <span>Đang lưu...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Lưu thay đổi</span>
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
