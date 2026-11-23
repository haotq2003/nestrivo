"use client";

import { 
  User, 
  CreditCard, 
  MapPin, 
  Calendar, 
  Building, 
  FileEdit, 
  ShieldCheck, 
  Lock, 
  AlertCircle 
} from "lucide-react";
import { KycPersonalInfo, KycDocuments } from "@/types/verification";

interface Step3ReviewSubmitProps {
  personalInfo: KycPersonalInfo;
  documents: KycDocuments;
  confirmedTerms: boolean;
  onToggleTerms: (checked: boolean) => void;
  onEditStep: (stepNumber: number) => void;
  error?: string | null;
}

export function Step3ReviewSubmit({
  personalInfo,
  documents,
  confirmedTerms,
  onToggleTerms,
  onEditStep,
  error,
}: Step3ReviewSubmitProps) {
  return (
    <div className="space-y-6">
      <div className="border-b border-slate-100 pb-4">
        <h3 className="text-base sm:text-lg font-bold text-slate-900">
          Bước 3: Rà soát và Xác nhận hồ sơ định danh
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Vui lòng kiểm tra kỹ lưỡng các thông tin bên dưới trước khi gửi Admin Nestrivo xét duyệt.
        </p>
      </div>

      {/* 1. Personal Information Summary Card */}
      <div className="bg-slate-50/80 rounded-2xl border border-slate-200/90 p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200/70 pb-3">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
            <User className="w-4 h-4 text-[#DCA936]" />
            <span>Thông tin cá nhân</span>
          </div>

          <button
            type="button"
            onClick={() => onEditStep(1)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#805B10] hover:text-[#5c410b] bg-white hover:bg-[#FFF1CC] border border-[#F4CD65]/40 rounded-lg transition-colors cursor-pointer"
          >
            <FileEdit className="w-3.5 h-3.5" />
            <span>Sửa bước 1</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs sm:text-sm">
          <div>
            <span className="text-slate-500 block text-xs">Họ và tên:</span>
            <strong className="text-[#292524] text-sm sm:text-base font-semibold">{personalInfo.fullName}</strong>
          </div>

          <div>
            <span className="text-slate-500 block text-xs">Số CCCD:</span>
            <strong className="text-slate-900 font-mono text-sm sm:text-base font-bold tracking-wider">
              {personalInfo.idNumber}
            </strong>
          </div>

          <div>
            <span className="text-slate-500 block text-xs">Ngày sinh & Giới tính:</span>
            <strong className="text-slate-900">
              {personalInfo.dateOfBirth} · {personalInfo.gender === "MALE" ? "Nam" : personalInfo.gender === "FEMALE" ? "Nữ" : "Khác"}
            </strong>
          </div>

          <div className="sm:col-span-2">
            <span className="text-slate-500 block text-xs">Nơi thường trú:</span>
            <strong className="text-slate-900">{personalInfo.permanentAddress}</strong>
          </div>

          <div>
            <span className="text-slate-500 block text-xs">Ngày cấp & Nơi cấp:</span>
            <strong className="text-slate-900">
              {personalInfo.issueDate} · {personalInfo.issuingAuthority}
            </strong>
          </div>
        </div>
      </div>

      {/* 2. Documents Preview Card */}
      <div className="bg-slate-50/80 rounded-2xl border border-slate-200/90 p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200/70 pb-3">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
            <CreditCard className="w-4 h-4 text-[#DCA936]" />
            <span>Ảnh Căn cước công dân</span>
          </div>

          <button
            type="button"
            onClick={() => onEditStep(2)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#805B10] hover:text-[#5c410b] bg-white hover:bg-[#FFF1CC] border border-[#F4CD65]/40 rounded-lg transition-colors cursor-pointer"
          >
            <FileEdit className="w-3.5 h-3.5" />
            <span>Sửa bước 2</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <div className="text-xs font-semibold text-slate-600">Ảnh mặt trước:</div>
            <div className="relative aspect-[16/10] bg-slate-200 rounded-xl overflow-hidden border border-slate-300 shadow-2xs">
              {documents.frontImage ? (
                <img
                  src={documents.frontImage}
                  alt="Mặt trước CCCD"
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs text-slate-400">
                  Chưa có ảnh mặt trước
                </div>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="text-xs font-semibold text-slate-600">Ảnh mặt sau:</div>
            <div className="relative aspect-[16/10] bg-slate-200 rounded-xl overflow-hidden border border-slate-300 shadow-2xs">
              {documents.backImage ? (
                <img
                  src={documents.backImage}
                  alt="Mặt sau CCCD"
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs text-slate-400">
                  Chưa có ảnh mặt sau
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Explicit Confirmation Agreement Checkbox */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 space-y-3 shadow-2xs">
        <label className="flex items-start gap-3 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={confirmedTerms}
            onChange={(e) => onToggleTerms(e.target.checked)}
            className="w-5 h-5 rounded-md text-[#DCA936] accent-[#DCA936] border-slate-300 focus:ring-[#F4CD65] mt-0.5 cursor-pointer"
          />
          <div className="space-y-1 text-xs sm:text-sm text-slate-700 leading-relaxed">
            <span className="font-bold text-slate-900 block">
              Cam kết tính xác thực của thông tin định danh
            </span>
            <span>
              Tôi cam kết toàn bộ thông tin cá nhân và hình ảnh Căn cước công dân cung cấp ở trên là hoàn toàn chính xác, trung thực, thuộc quyền sở hữu hợp pháp của tôi. Tôi hoàn toàn chịu trách nhiệm trước pháp luật về tính chính xác của dữ liệu cung cấp và đồng ý với Quy chế hoạt động của Sàn Nestrivo.
            </span>
          </div>
        </label>

        {error && (
          <p className="text-xs text-rose-600 font-bold flex items-center gap-1.5 pt-1">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </p>
        )}
      </div>

      {/* Privacy Guarantee Note */}
      <div className="p-4 rounded-2xl bg-[#FFF7E5] border border-[#EDE5D5] flex items-start gap-3 text-xs text-[#373523]">
        <Lock className="w-4 h-4 text-[#805B10] shrink-0 mt-0.5" />
        <p className="leading-relaxed font-medium">
          <strong>Bảo mật thông tin eKYC:</strong> Nestrivo áp dụng tiêu chuẩn mã hóa dữ liệu nghiêm ngặt. Thông tin số Căn cước công dân của bạn chỉ phục vụ mục đích kiểm định phòng trọ minh bạch và không bao giờ bị lộ ra ngoài cho bên thứ ba.
        </p>
      </div>
    </div>
  );
}

