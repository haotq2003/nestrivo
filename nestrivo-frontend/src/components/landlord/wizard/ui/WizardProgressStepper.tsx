"use client";

import { Check, Circle } from "lucide-react";

interface WizardProgressStepperProps {
  currentStep: number;
  highestStepReached: number;
  onStepClick: (step: number) => void;
}

export const WIZARD_STEPS = [
  { step: 1, title: "Loại hình & Vị trí", desc: "Loại phòng & Địa chỉ" },
  { step: 2, title: "Chi tiết phòng", desc: "Diện tích & Tiện nghi" },
  { step: 3, title: "Giá thuê & Phụ phí", desc: "Tiền thuê, cọc & phí" },
  { step: 4, title: "Hình ảnh", desc: "Ảnh thực tế & Bìa" },
  { step: 5, title: "Tiêu đề & Mô tả", desc: "Nội dung & Xem trước" },
  { step: 6, title: "Xác nhận & Nộp duyệt", desc: "Kiểm tra & Gửi Admin" },
];

export function WizardProgressStepper({
  currentStep,
  highestStepReached,
  onStepClick,
}: WizardProgressStepperProps) {
  const progressPercent = Math.round((currentStep / WIZARD_STEPS.length) * 100);
  const currentStepData = WIZARD_STEPS.find((s) => s.step === currentStep) || WIZARD_STEPS[0];

  return (
    <div className="w-full bg-white border-b border-[#EDE5D5] py-4 px-4 sm:px-6 lg:px-8 shadow-xs">
      <div className="max-w-5xl mx-auto space-y-3">
        {/* Mobile View (< 768px): Compact Step Indicator */}
        <div className="md:hidden space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-[#805B10] uppercase tracking-wider">
              Bước {currentStep} / {WIZARD_STEPS.length}
            </span>
            <span className="text-[#77715F] font-semibold">{progressPercent}% hoàn thành</span>
          </div>

          <div className="flex items-center justify-between gap-2">
            <h2 className="text-base font-semibold text-[#292524] line-clamp-1">
              {currentStepData.title}
            </h2>
            <span className="text-xs text-[#57534E] shrink-0 font-normal">
              {currentStepData.desc}
            </span>
          </div>

          {/* Mobile Progress Bar */}
          <div
            className="w-full bg-[#FFF7E5] rounded-full h-2 overflow-hidden border border-[#EDE5D5]"
            role="progressbar"
            aria-valuenow={progressPercent}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className="bg-[#F4CD65] h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Quick step pills on mobile */}
          <div className="flex items-center justify-between gap-1 pt-1">
            {WIZARD_STEPS.map((s) => {
              const isPassed = s.step < currentStep;
              const isCurrent = s.step === currentStep;
              const isClickable = s.step <= highestStepReached;

              return (
                <button
                  key={s.step}
                  type="button"
                  disabled={!isClickable}
                  onClick={() => onStepClick(s.step)}
                  className={`flex-1 h-1.5 rounded-full transition-all ${
                    isCurrent
                      ? "bg-[#F4CD65] ring-2 ring-[#F4CD65]/40"
                      : isPassed
                      ? "bg-[#F4CD65]"
                      : "bg-[#EDE5D5]"
                  } ${isClickable ? "cursor-pointer" : "cursor-not-allowed opacity-60"}`}
                  title={`Bước ${s.step}: ${s.title}`}
                  aria-label={`Chuyển đến Bước ${s.step}: ${s.title}`}
                />
              );
            })}
          </div>
        </div>

        {/* Desktop View (>= 768px): Full 6-Step Rail */}
        <div className="hidden md:block">
          <nav aria-label="Tiến trình đăng tin">
            <ol className="flex items-center justify-between relative">
              {/* Connecting background line */}
              <div
                className="absolute top-5 left-6 right-6 h-0.5 bg-[#EDE5D5] -z-0"
                aria-hidden="true"
              />
              {/* Active progress fill line */}
              <div
                className="absolute top-5 left-6 h-0.5 bg-[#F4CD65] -z-0 transition-all duration-300"
                style={{
                  width: `${((Math.min(currentStep, WIZARD_STEPS.length) - 1) / (WIZARD_STEPS.length - 1)) * 100}%`,
                }}
                aria-hidden="true"
              />

              {WIZARD_STEPS.map((s) => {
                const isPassed = s.step < currentStep;
                const isCurrent = s.step === currentStep;
                const isClickable = s.step <= highestStepReached;

                return (
                  <li key={s.step} className="relative z-10 flex flex-col items-center">
                    <button
                      type="button"
                      disabled={!isClickable}
                      onClick={() => onStepClick(s.step)}
                      className={`group flex flex-col items-center focus:outline-none transition-all ${
                        isClickable ? "cursor-pointer" : "cursor-not-allowed opacity-60"
                      }`}
                      aria-current={isCurrent ? "step" : undefined}
                    >
                      {/* Step Circle Indicator */}
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-xs transition-all duration-200 ${
                          isCurrent
                            ? "bg-[#F4CD65] text-[#292524] ring-4 ring-[#F4CD65]/40 shadow-xs"
                            : isPassed
                            ? "bg-emerald-500 text-white shadow-2xs"
                            : "bg-white text-[#A8A29E] border-2 border-[#EDE5D5] group-hover:border-[#DCA936]"
                        }`}
                      >
                        {isPassed ? (
                          <Check className="w-5 h-5 stroke-[2.5]" />
                        ) : (
                          <span>{s.step}</span>
                        )}
                      </div>

                      {/* Step Title & Subtitle */}
                      <div className="mt-2 text-center max-w-[120px]">
                        <p
                          className={`text-xs transition-colors line-clamp-1 ${
                            isCurrent
                              ? "text-[#292524] font-semibold"
                              : isPassed
                              ? "text-[#292524] font-medium"
                              : "text-[#78716C] font-normal"
                          }`}
                        >
                          {s.title}
                        </p>
                        <p className="text-[11px] text-[#77715F] line-clamp-1 mt-0.5 font-medium">
                          {s.desc}
                        </p>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ol>
          </nav>
        </div>
      </div>
    </div>
  );
}
