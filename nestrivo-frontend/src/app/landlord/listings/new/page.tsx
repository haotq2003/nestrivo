"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Info } from "lucide-react";
import { useLandlordLayout } from "@/components/landlord/layout/LandlordWorkspaceLayout";
import {
  WizardHeader,
  WizardProgressStepper,
  WizardNavigationFooter,
  ExitConfirmModal,
  DraftNoticeBanner,
  Step1PropertyTypeAddress,
  Step2PropertyDetails,
  Step3PricingFees,
  Step4ImageUpload,
  Step5TitleDescription,
  Step6ReviewSubmit,
  useWizardDraft,
} from "@/components/landlord/wizard";

export default function NewListingWizardPage() {
  const router = useRouter();
  const { toggleMobileMenu } = useLandlordLayout();

  // Custom hook containing all wizard form state, validation, and auto-save
  const {
    formData,
    currentStep,
    highestStepReached,
    errors,
    isSaving,
    lastSavedText,
    toastMessage,
    showExitConfirm,
    setShowExitConfirm,
    hasDraftNotice,
    setHasDraftNotice,
    handleFieldChange,
    handleManualSave,
    handleResetWizard,
    handleNext,
    handlePrev,
    handleStepClick,
  } = useWizardDraft();

  // Redirect to dedicated edit page if ?edit=<id> was provided
  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        const urlParams = new URLSearchParams(window.location.search);
        const editId = urlParams.get("edit");
        if (editId) {
          router.replace(`/landlord/listings/${editId}/edit`);
        }
      }
    } catch {}
  }, [router]);

  return (
    <>
      {/* 1. Header */}
      <WizardHeader
        lastSavedText={lastSavedText}
        isSaving={isSaving}
        onManualSave={handleManualSave}
        onCancelClick={() => setShowExitConfirm(true)}
        onToggleMobileMenu={toggleMobileMenu}
      />

      {/* 2. Stepper */}
      <WizardProgressStepper
        currentStep={currentStep}
        highestStepReached={highestStepReached}
        onStepClick={handleStepClick}
      />

      {/* 3. Main content */}
      <main className="px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 lg:pt-8 pb-48 sm:pb-56 lg:pb-60 max-w-5xl w-full mx-auto space-y-6">
        <DraftNoticeBanner
          isOpen={hasDraftNotice}
          onReset={handleResetWizard}
          onDismiss={() => setHasDraftNotice(false)}
        />

        <div className="p-3.5 rounded-2xl bg-white border border-[#EDE5D5] text-xs shadow-xs flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2 text-[#77715F] font-medium">
            <Info className="w-4 h-4 text-[#DCA936] shrink-0" />
            <span>
              Quy trình đăng tin 6 bước chuẩn PropTech · Dữ liệu được lưu trữ trên trình duyệt của bạn (Local Demo).
            </span>
          </div>
          <span className="text-[11px] font-bold text-[#805B10] bg-[#FFF1CC] px-2 py-0.5 rounded-md border border-[#F4CD65]/40">
            Chế độ Thử nghiệm Giao diện
          </span>
        </div>

        {/* Form steps */}
        <div className="bg-white rounded-3xl border border-[#EDE5D5] p-5 sm:p-8 shadow-xs">
          {currentStep === 1 && (
            <Step1PropertyTypeAddress
              propertyType={formData.propertyType}
              city={formData.city}
              district={formData.district}
              ward={formData.ward}
              address={formData.address}
              errors={errors}
              onChange={handleFieldChange}
            />
          )}

          {currentStep === 2 && (
            <Step2PropertyDetails
              area={formData.area}
              bedrooms={formData.bedrooms}
              bathrooms={formData.bathrooms}
              maxOccupants={formData.maxOccupants}
              hasMezzanine={formData.hasMezzanine}
              allowsPets={formData.allowsPets}
              isFurnished={formData.isFurnished}
              minimumStayMonths={formData.minimumStayMonths}
              amenities={formData.amenities}
              errors={errors}
              onChange={handleFieldChange}
            />
          )}

          {currentStep === 3 && (
            <Step3PricingFees
              price={formData.price}
              deposit={formData.deposit}
              fees={formData.fees}
              errors={errors}
              onChange={handleFieldChange}
            />
          )}

          {currentStep === 4 && (
            <Step4ImageUpload
              images={formData.images}
              errors={errors}
              onChange={handleFieldChange}
            />
          )}

          {currentStep === 5 && (
            <Step5TitleDescription
              formData={formData}
              errors={errors}
              onChange={handleFieldChange}
            />
          )}

          {currentStep === 6 && (
            <Step6ReviewSubmit
              formData={formData}
              onEditStep={handleStepClick}
              onSaveDraft={handleManualSave}
              onResetWizard={handleResetWizard}
            />
          )}
        </div>

        <div className="h-10 sm:h-12 w-full pointer-events-none" aria-hidden="true" />
      </main>

      {/* 4. Navigation footer */}
      <WizardNavigationFooter
        currentStep={currentStep}
        totalSteps={6}
        hasErrors={Object.keys(errors).length > 0}
        onPrev={handlePrev}
        onNext={handleNext}
        onSaveDraft={handleManualSave}
      />

      {/* 5. Exit Confirm Modal */}
      <ExitConfirmModal
        isOpen={showExitConfirm}
        onClose={() => setShowExitConfirm(false)}
      />

      {/* 6. Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-20 right-6 z-50 max-w-md bg-slate-900 text-white text-xs sm:text-sm font-medium px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-slate-800 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <CheckCircle2 className="w-4 h-4 text-[#F4CD65] shrink-0" />
          <span className="flex-1 leading-snug">{toastMessage}</span>
        </div>
      )}
    </>
  );
}
