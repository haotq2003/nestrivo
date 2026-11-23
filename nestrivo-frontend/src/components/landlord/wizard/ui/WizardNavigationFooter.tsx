"use client";

import { ArrowLeft, ArrowRight, Save, Send, AlertCircle } from "lucide-react";

interface WizardNavigationFooterProps {
  currentStep: number;
  totalSteps: number;
  hasErrors?: boolean;
  onPrev: () => void;
  onNext: () => void;
  onSaveDraft: () => void;
  isSubmitting?: boolean;
}

export function WizardNavigationFooter({
  currentStep,
  totalSteps,
  hasErrors = false,
  onPrev,
  onNext,
  onSaveDraft,
  isSubmitting = false,
}: WizardNavigationFooterProps) {
  const isFirstStep = currentStep === 1;
  const isLastStep = currentStep === totalSteps;

  return (
    <div className="fixed bottom-0 left-0 lg:left-[260px] right-0 z-40 bg-white border-t border-slate-200/80 shadow-[0_-4px_20px_rgba(0,0,0,0.03)] pb-[env(safe-area-inset-bottom)]">
      <div className="h-20 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-3 sm:gap-4">
        {/* Left: Back button */}
        <div className="flex items-center min-w-[70px] sm:min-w-[140px] justify-start">
          <button
            type="button"
            onClick={onPrev}
            disabled={isFirstStep}
            className={`h-[38px] px-3 sm:px-3.5 rounded-xl text-xs sm:text-sm font-medium transition-colors flex items-center gap-1.5 ${
              isFirstStep
                ? "text-slate-300 cursor-not-allowed bg-transparent"
                : "text-slate-600 hover:text-slate-900 bg-slate-100/80 hover:bg-slate-100 border border-slate-200/60 active:bg-slate-200 cursor-pointer"
            }`}
            aria-label="Quay lại bước trước"
          >
            <ArrowLeft className="w-3.5 h-3.5 shrink-0" />
            <span>Quay lại</span>
          </button>
        </div>

        {/* Center: Step Indicator & Validation Error hint */}
        <div className="flex items-center justify-center flex-1 text-center min-w-0">
          {hasErrors ? (
            <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-rose-600 animate-pulse">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Vui lòng kiểm tra các trường bắt buộc</span>
            </div>
          ) : (
            <div className="text-xs sm:text-sm font-medium text-slate-500 tabular-nums">
              Bước <span className="text-[#292524] font-semibold">{currentStep}</span> / {totalSteps}
            </div>
          )}
        </div>

        {/* Right: Save Draft & Continue Button */}
        <div className="flex items-center justify-end gap-2 sm:gap-2.5 min-w-[70px] sm:min-w-[140px]">
          {/* Quick save button: icon on mobile, icon + label on sm+ */}
          <button
            type="button"
            onClick={onSaveDraft}
            className="h-[38px] w-[38px] sm:w-auto px-0 sm:px-3.5 rounded-xl text-xs sm:text-sm font-medium text-slate-600 bg-slate-100/80 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/60 transition-colors flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
            title="Lưu bản nháp"
            aria-label="Lưu bản nháp"
          >
            <Save className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span className="hidden sm:inline">Lưu nháp</span>
          </button>

          {/* Next / Submit button */}
          {!isLastStep ? (
            <button
              type="button"
              onClick={onNext}
              className="h-[38px] px-4 sm:px-5 rounded-2xl text-xs sm:text-sm font-semibold text-[#292524] bg-[#F4CD65] hover:bg-[#ebbf4d] active:bg-[#e0b03b] shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
            >
              <span>Tiếp tục</span>
              <ArrowRight className="w-3.5 h-3.5 shrink-0" />
            </button>
          ) : (
            <button
              type="button"
              onClick={onNext}
              disabled={isSubmitting}
              className="h-[38px] px-4 sm:px-5 rounded-2xl text-xs sm:text-sm font-semibold text-[#292524] bg-[#F4CD65] hover:bg-[#ebbf4d] active:bg-[#e0b03b] shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-3.5 h-3.5 shrink-0" />
              <span>Gửi xét duyệt</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
