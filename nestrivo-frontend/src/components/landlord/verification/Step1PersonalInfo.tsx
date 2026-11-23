"use client";

import { KycPersonalInfo } from "@/types/verification";
import { User, Calendar, CreditCard, MapPin, Building, AlertCircle } from "lucide-react";

interface Step1PersonalInfoProps {
  personalInfo: KycPersonalInfo;
  errors: Record<string, string>;
  onChange: (field: keyof KycPersonalInfo, value: string) => void;
}

export function Step1PersonalInfo({
  personalInfo,
  errors,
  onChange,
}: Step1PersonalInfoProps) {
  return (
    <div className="space-y-6">
      <div className="border-b border-slate-100 pb-4">
        <h3 className="text-base sm:text-lg font-bold text-slate-900">
          Bước 1: Thông tin cá nhân theo Căn cước công dân
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Vui lòng nhập chính xác từng ký tự in hoa/thường theo đúng thông tin trên thẻ CCCD gắn chip của bạn.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
        {/* Full Legal Name */}
        <div className="space-y-1.5 sm:col-span-2">
          <label htmlFor="kyc-fullname" className="block text-xs font-bold text-slate-700">
            Họ và tên đầy đủ <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="kyc-fullname"
              type="text"
              value={personalInfo.fullName}
              onChange={(e) => onChange("fullName", e.target.value.toUpperCase())}
              placeholder="VD: NGUYỄN VĂN HÙNG"
              className={`w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm bg-white border rounded-xl text-slate-900 font-bold placeholder:text-slate-400 placeholder:font-normal focus:outline-none focus:ring-2 transition-all min-h-[44px] ${
                errors.fullName
                  ? "border-rose-400 focus:border-rose-500 focus:ring-rose-500/20"
                  : "border-slate-200 focus:border-[#F4CD65] focus:ring-[#F4CD65]/20"
              }`}
            />
          </div>
          {errors.fullName && (
            <p className="text-xs text-rose-600 font-medium flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errors.fullName}</span>
            </p>
          )}
        </div>

        {/* Date of Birth */}
        <div className="space-y-1.5">
          <label htmlFor="kyc-dob" className="block text-xs font-bold text-slate-700">
            Ngày sinh <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="kyc-dob"
              type="date"
              value={personalInfo.dateOfBirth}
              onChange={(e) => onChange("dateOfBirth", e.target.value)}
              className={`w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm bg-white border rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-2 transition-all min-h-[44px] ${
                errors.dateOfBirth
                  ? "border-rose-400 focus:border-rose-500 focus:ring-rose-500/20"
                  : "border-slate-200 focus:border-[#F4CD65] focus:ring-[#F4CD65]/20"
              }`}
            />
          </div>
          {errors.dateOfBirth && (
            <p className="text-xs text-rose-600 font-medium flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errors.dateOfBirth}</span>
            </p>
          )}
        </div>

        {/* Gender */}
        <div className="space-y-1.5">
          <label htmlFor="kyc-gender" className="block text-xs font-bold text-slate-700">
            Giới tính <span className="text-rose-500">*</span>
          </label>
          <select
            id="kyc-gender"
            value={personalInfo.gender}
            onChange={(e) => onChange("gender", e.target.value as KycPersonalInfo["gender"])}
            className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:border-[#F4CD65] focus:ring-2 focus:ring-[#F4CD65]/20 transition-all min-h-[44px] cursor-pointer"
          >
            <option value="MALE">Nam</option>
            <option value="FEMALE">Nữ</option>
            <option value="OTHER">Khác</option>
          </select>
        </div>

        {/* Citizen ID Number (Số CCCD) */}
        <div className="space-y-1.5">
          <label htmlFor="kyc-idnumber" className="block text-xs font-bold text-slate-700">
            Số Căn cước công dân (12 chữ số) <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <CreditCard className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="kyc-idnumber"
              type="text"
              maxLength={12}
              value={personalInfo.idNumber}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, "");
                onChange("idNumber", val);
              }}
              placeholder="VD: 079088014529"
              className={`w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm bg-white border rounded-xl text-slate-900 font-mono font-bold tracking-wider placeholder:text-slate-400 placeholder:font-normal focus:outline-none focus:ring-2 transition-all min-h-[44px] ${
                errors.idNumber
                  ? "border-rose-400 focus:border-rose-500 focus:ring-rose-500/20"
                  : "border-slate-200 focus:border-[#F4CD65] focus:ring-[#F4CD65]/20"
              }`}
            />
          </div>
          {errors.idNumber && (
            <p className="text-xs text-rose-600 font-medium flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errors.idNumber}</span>
            </p>
          )}
        </div>

        {/* Issue Date */}
        <div className="space-y-1.5">
          <label htmlFor="kyc-issuedate" className="block text-xs font-bold text-slate-700">
            Ngày cấp <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="kyc-issuedate"
              type="date"
              value={personalInfo.issueDate}
              onChange={(e) => onChange("issueDate", e.target.value)}
              className={`w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm bg-white border rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-2 transition-all min-h-[44px] ${
                errors.issueDate
                  ? "border-rose-400 focus:border-rose-500 focus:ring-rose-500/20"
                  : "border-slate-200 focus:border-[#F4CD65] focus:ring-[#F4CD65]/20"
              }`}
            />
          </div>
          {errors.issueDate && (
            <p className="text-xs text-rose-600 font-medium flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errors.issueDate}</span>
            </p>
          )}
        </div>

        {/* Issuing Authority */}
        <div className="space-y-1.5 sm:col-span-2">
          <label htmlFor="kyc-authority" className="block text-xs font-bold text-slate-700">
            Nơi cấp <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <Building className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="kyc-authority"
              type="text"
              value={personalInfo.issuingAuthority}
              onChange={(e) => onChange("issuingAuthority", e.target.value)}
              placeholder="VD: Cục Cảnh sát Quản lý hành chính về trật tự xã hội"
              className={`w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm bg-white border rounded-xl text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all min-h-[44px] ${
                errors.issuingAuthority
                  ? "border-rose-400 focus:border-rose-500 focus:ring-rose-500/20"
                  : "border-slate-200 focus:border-[#F4CD65] focus:ring-[#F4CD65]/20"
              }`}
            />
          </div>
          {errors.issuingAuthority && (
            <p className="text-xs text-rose-600 font-medium flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errors.issuingAuthority}</span>
            </p>
          )}
        </div>

        {/* Permanent Address */}
        <div className="space-y-1.5 sm:col-span-2">
          <label htmlFor="kyc-address" className="block text-xs font-bold text-slate-700">
            Nơi thường trú <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
            <textarea
              id="kyc-address"
              rows={2}
              value={personalInfo.permanentAddress}
              onChange={(e) => onChange("permanentAddress", e.target.value)}
              placeholder="VD: 48/12 Điện Biên Phủ, Phường 25, Quận Bình Thạnh, TP. Hồ Chí Minh"
              className={`w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm bg-white border rounded-xl text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all ${
                errors.permanentAddress
                  ? "border-rose-400 focus:border-rose-500 focus:ring-rose-500/20"
                  : "border-slate-200 focus:border-[#F4CD65] focus:ring-[#F4CD65]/20"
              }`}
            />
          </div>
          {errors.permanentAddress && (
            <p className="text-xs text-rose-600 font-medium flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errors.permanentAddress}</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

