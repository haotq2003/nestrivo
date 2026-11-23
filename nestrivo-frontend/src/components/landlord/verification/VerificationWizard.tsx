"use client";

import { useState } from "react";
import { 
  Check, 
  ArrowLeft, 
  ArrowRight, 
  Send, 
  X, 
  ShieldCheck, 
  Clock, 
  FileCheck, 
  RefreshCw 
} from "lucide-react";
import { 
  KycVerificationData, 
  KycPersonalInfo, 
  KycDocuments 
} from "@/types/verification";
import { verificationService } from "@/service/verification.service";
import { Step1PersonalInfo } from "./Step1PersonalInfo";
import { Step2DocumentUpload } from "./Step2DocumentUpload";
import { Step3ReviewSubmit } from "./Step3ReviewSubmit";
import { Step4ResultSuccess } from "./Step4ResultSuccess";

interface VerificationWizardProps {
  initialData: KycVerificationData;
  onSubmit: (submittedData: KycVerificationData) => void;
  onCancel: () => void;
}

const WIZARD_STEPS = [
  { step: 1, title: "Thông tin cá nhân", desc: "Họ tên & số CCCD" },
  { step: 2, title: "Tải ảnh thẻ CCCD", desc: "Ảnh mặt trước & sau" },
  { step: 3, title: "Rà soát & Nộp", desc: "Kiểm tra & Cam kết" },
  { step: 4, title: "Hoàn tất", desc: "Chờ xét duyệt" },
];

export function VerificationWizard({
  initialData,
  onSubmit,
  onCancel,
}: VerificationWizardProps) {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [personalInfo, setPersonalInfo] = useState<KycPersonalInfo>(initialData.personalInfo);
  const [documents, setDocuments] = useState<KycDocuments>(initialData.documents);
  const [confirmedTerms, setConfirmedTerms] = useState<boolean>(initialData.confirmedTerms || false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Field change for Step 1
  const handlePersonalInfoChange = (field: keyof KycPersonalInfo, value: string) => {
    setPersonalInfo((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  // Document change for Step 2
  const handleDocumentsChange = (docs: Partial<KycDocuments>) => {
    setDocuments((prev) => ({ ...prev, ...docs }));
    setErrors((prev) => {
      const next = { ...prev };
      if (docs.frontImage) delete next.frontImage;
      if (docs.backImage) delete next.backImage;
      return next;
    });
  };

  // Validate Step 1
  const validateStep1 = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!personalInfo.fullName.trim() || personalInfo.fullName.trim().length < 3) {
      newErrors.fullName = "Vui lòng nhập họ và tên đầy đủ hợp lệ.";
    }

    if (!personalInfo.dateOfBirth) {
      newErrors.dateOfBirth = "Vui lòng chọn ngày tháng năm sinh.";
    } else {
      const birthYear = new Date(personalInfo.dateOfBirth).getFullYear();
      const currentYear = new Date().getFullYear();
      if (currentYear - birthYear < 18) {
        newErrors.dateOfBirth = "Chủ nhà phải từ 18 tuổi trở lên để xác thực danh tính.";
      }
    }

    if (!personalInfo.idNumber || !/^\d{12}$/.test(personalInfo.idNumber.trim())) {
      newErrors.idNumber = "Số Căn cước công dân phải bao gồm đúng 12 chữ số.";
    }

    if (!personalInfo.issueDate) {
      newErrors.issueDate = "Vui lòng chọn ngày cấp thẻ CCCD.";
    }

    if (!personalInfo.issuingAuthority.trim()) {
      newErrors.issuingAuthority = "Vui lòng nhập cơ quan cấp thẻ CCCD.";
    }

    if (!personalInfo.permanentAddress.trim() || personalInfo.permanentAddress.trim().length < 8) {
      newErrors.permanentAddress = "Vui lòng nhập đầy đủ địa chỉ thường trú ghi trên thẻ CCCD.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validate Step 2
  const validateStep2 = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!documents.frontImage) {
      newErrors.frontImage = "Vui lòng tải lên hình ảnh mặt trước của thẻ CCCD.";
    }

    if (!documents.backImage) {
      newErrors.backImage = "Vui lòng tải lên hình ảnh mặt sau của thẻ CCCD.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validate Step 3
  const validateStep3 = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!confirmedTerms) {
      newErrors.terms = "Vui lòng đọc và tích chọn ô cam kết tính chính xác của thông tin trước khi nộp.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (currentStep === 1) {
      if (!validateStep1()) return;
      setCurrentStep(2);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (currentStep === 2) {
      if (!validateStep2()) return;
      setCurrentStep(3);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (currentStep === 3) {
      if (!validateStep3()) return;
      handleSubmit();
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const res = await verificationService.submitKyc({
        personalInfo,
        documents,
      });
      setIsSubmitting(false);
      setCurrentStep(4);
      onSubmit(res.kyc);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: unknown) {
      setIsSubmitting(false);
      const msg = err instanceof Error ? err.message : "Đã xảy ra lỗi khi gửi hồ sơ xác minh.";
      setSubmitError(msg);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Wizard Header Bar & Stepper */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#F4CD65] text-[#373523] flex items-center justify-center font-bold text-xs shadow-xs">
              eKYC
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
                Quy trình xác minh danh tính 4 bước
              </h2>
              <p className="text-[11px] text-slate-500">
                Bước {currentStep} / {WIZARD_STEPS.length}: {WIZARD_STEPS[currentStep - 1]?.title}
              </p>
            </div>
          </div>

          {currentStep < 4 && (
            <button
              type="button"
              onClick={onCancel}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 p-2 rounded-xl hover:bg-slate-100 transition-colors flex items-center gap-1"
            >
              <X className="w-4 h-4" />
              <span className="hidden sm:inline">Hủy bỏ</span>
            </button>
          )}
        </div>

        {/* 4-Step Visual Progress Stepper */}
        <div className="grid grid-cols-4 gap-2 sm:gap-4 relative">
          {WIZARD_STEPS.map((s) => {
            const isCompleted = currentStep > s.step;
            const isCurrent = currentStep === s.step;

            return (
              <div
                key={s.step}
                className={`flex flex-col items-center sm:items-start p-2 sm:p-3 rounded-2xl border transition-all ${
                  isCurrent
                    ? "border-[#F4CD65] bg-[#FFF7E5] ring-1 ring-[#F4CD65]/30"
                    : isCompleted
                    ? "border-[#F4CD65]/40 bg-[#FFF1CC]/40 text-[#373523]"
                    : "border-slate-100 bg-slate-50/50 text-slate-400"
                }`}
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                      isCompleted
                        ? "bg-[#F4CD65] text-[#373523]"
                        : isCurrent
                        ? "bg-[#F4CD65] text-[#373523] ring-2 ring-[#F4CD65]/40"
                        : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    {isCompleted ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : s.step}
                  </div>
                  <span className="text-xs font-bold hidden sm:inline truncate text-slate-900">
                    {s.title}
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 hidden sm:block mt-1 truncate">
                  {s.desc}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Active Step Content Form View */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-8 shadow-xs">
        {currentStep === 1 && (
          <Step1PersonalInfo
            personalInfo={personalInfo}
            errors={errors}
            onChange={handlePersonalInfoChange}
          />
        )}

        {currentStep === 2 && (
          <Step2DocumentUpload
            documents={documents}
            errors={errors}
            onChange={handleDocumentsChange}
          />
        )}

        {currentStep === 3 && (
          <Step3ReviewSubmit
            personalInfo={personalInfo}
            documents={documents}
            confirmedTerms={confirmedTerms}
            onToggleTerms={(checked) => {
              setConfirmedTerms(checked);
              if (errors.terms) {
                setErrors((prev) => {
                  const next = { ...prev };
                  delete next.terms;
                  return next;
                });
              }
            }}
            onEditStep={(step) => {
              setCurrentStep(step);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            error={errors.terms}
          />
        )}

        {currentStep === 4 && (
          <Step4ResultSuccess onReturnToOverview={onCancel} />
        )}

        {/* Error message if submission failed */}
        {submitError && (
          <div className="mt-4 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
            <X className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{submitError}</span>
          </div>
        )}

        {/* Navigation Buttons Row (Steps 1–3) */}
        {currentStep < 4 && (
          <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={handlePrev}
              disabled={currentStep === 1}
              className={`h-[38px] px-3.5 sm:px-4 rounded-xl text-xs sm:text-sm font-medium transition-colors flex items-center gap-1.5 ${
                currentStep === 1
                  ? "text-slate-300 cursor-not-allowed bg-transparent"
                  : "text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 cursor-pointer"
              }`}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Quay lại</span>
            </button>

            <div className="text-xs font-semibold text-slate-400 hidden sm:block">
              Bước {currentStep} trên 3
            </div>

            {currentStep < 3 ? (
              <button
                type="button"
                onClick={handleNext}
                className="h-[38px] px-4 sm:px-5 rounded-xl text-xs sm:text-sm font-semibold text-[#292524] bg-[#F4CD65] hover:bg-[#ebbf4d] active:bg-[#e0b03b] shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Tiếp tục</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleNext}
                disabled={isSubmitting}
                className="h-[38px] px-5 sm:px-6 rounded-xl text-xs sm:text-sm font-semibold text-[#292524] bg-[#F4CD65] hover:bg-[#ebbf4d] active:bg-[#e0b03b] shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Đang gửi hồ sơ...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Xác nhận & Nộp hồ sơ</span>
                  </>
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

