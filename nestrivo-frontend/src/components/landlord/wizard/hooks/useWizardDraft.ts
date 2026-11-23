import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  WizardFormData,
  INITIAL_WIZARD_FORM_DATA,
  getListingDraftKey,
  clearListingDraft,
} from "@/types/wizard";

export function useWizardDraft() {
  const { user } = useAuth();
  const draftKey = getListingDraftKey(user?.id);

  // Form State
  const [formData, setFormData] = useState<WizardFormData>(INITIAL_WIZARD_FORM_DATA);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [highestStepReached, setHighestStepReached] = useState<number>(1);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Autosave & UI Notification State
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [lastSavedText, setLastSavedText] = useState<string>("Đã lưu tự động");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showExitConfirm, setShowExitConfirm] = useState<boolean>(false);
  const [hasDraftNotice, setHasDraftNotice] = useState<boolean>(false);

  // Load draft on mount / user change
  useEffect(() => {
    try {
      localStorage.removeItem("nestrivo_new_listing_draft_v1");

      const saved = localStorage.getItem(draftKey);
      if (saved) {
        const parsed: WizardFormData = JSON.parse(saved);
        if (parsed && parsed.propertyType) {
          if (Array.isArray(parsed.images)) {
            parsed.images = parsed.images.filter(
              (img) => img.id !== "img-default-1" && img.id !== "img-default-2"
            );
          }
          setTimeout(() => {
            setFormData(parsed);
            if (parsed.currentStep && parsed.currentStep > 1) {
              setCurrentStep(parsed.currentStep);
              setHighestStepReached(parsed.currentStep);
              setHasDraftNotice(true);
            }
          }, 0);
          return;
        }
      }

      setFormData(INITIAL_WIZARD_FORM_DATA);
      setCurrentStep(1);
      setHighestStepReached(1);
      setHasDraftNotice(false);
    } catch {
      // Storage error fallback
    }
  }, [user?.id, draftKey]);

  // Save to storage
  const saveToStorage = useCallback(
    (data: WizardFormData, step: number) => {
      setIsSaving(true);
      try {
        const toSave: WizardFormData = {
          ...data,
          currentStep: step,
          lastSavedAt: new Date().toISOString(),
        };
        localStorage.setItem(draftKey, JSON.stringify(toSave));

        const now = new Date();
        const timeStr = `${now.getHours().toString().padStart(2, "0")}:${now
          .getMinutes()
          .toString()
          .padStart(2, "0")}`;
        setLastSavedText(`Đã lưu lúc ${timeStr}`);
      } catch {
        // Fallback
      } finally {
        setTimeout(() => setIsSaving(false), 300);
      }
    },
    [draftKey]
  );

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const handleFieldChange = (field: string, value: unknown) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };
      saveToStorage(updated, currentStep);
      return updated;
    });

    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleManualSave = () => {
    saveToStorage(formData, currentStep);
    showToast("Đã lưu bản nháp thành công trên trình duyệt này.");
  };

  const handleResetWizard = () => {
    clearListingDraft(user?.id);
    setFormData(INITIAL_WIZARD_FORM_DATA);
    setCurrentStep(1);
    setHighestStepReached(1);
    setErrors({});
    setHasDraftNotice(false);
    showToast("Đã làm mới thông tin đăng tin.");
  };

  const validateStep = (step: number): boolean => {
    const errs: Record<string, string> = {};

    if (step === 1) {
      if (!formData.propertyType) {
        errs.propertyType = "Vui lòng chọn loại hình bất động sản.";
      }
      if (!formData.city.trim()) {
        errs.city = "Vui lòng chọn Tỉnh/Thành phố.";
      }
      if (!formData.district.trim()) {
        errs.district = "Vui lòng chọn Quận/Huyện.";
      }
      if (!formData.address.trim() || formData.address.trim().length < 5) {
        errs.address = "Vui lòng nhập số nhà, tên đường cụ thể (tối thiểu 5 ký tự).";
      }
    } else if (step === 2) {
      if (!formData.area || formData.area <= 0) {
        errs.area = "Diện tích phòng phải lớn hơn 0 m².";
      }
      if (!formData.bedrooms || formData.bedrooms < 1) {
        errs.bedrooms = "Số phòng ngủ tối thiểu là 1.";
      }
      if (!formData.bathrooms || formData.bathrooms < 1) {
        errs.bathrooms = "Số phòng tắm tối thiểu là 1.";
      }
      if (!formData.maxOccupants || formData.maxOccupants < 1) {
        errs.maxOccupants = "Sức chứa tối thiểu là 1 người.";
      }
    } else if (step === 3) {
      if (!formData.price || formData.price < 500000) {
        errs.price = "Giá thuê niêm yết tối thiểu từ 500.000 ₫/tháng.";
      }
    } else if (step === 4) {
      if (!formData.images || formData.images.length === 0) {
        errs.images = "Vui lòng tải lên hoặc chọn ít nhất 1 hình ảnh phòng thực tế.";
      }
    } else if (step === 5) {
      if (!formData.title.trim() || formData.title.trim().length < 15) {
        errs.title = "Tiêu đề quá ngắn (tối thiểu 15 ký tự).";
      } else if (formData.title.trim().length > 100) {
        errs.title = "Tiêu đề không được vượt quá 100 ký tự.";
      }

      if (!formData.description.trim() || formData.description.trim().length < 30) {
        errs.description = "Mô tả chi tiết quá ngắn (tối thiểu 30 ký tự để Admin duyệt).";
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < 6) {
        const nextStep = currentStep + 1;
        setCurrentStep(nextStep);
        setHighestStepReached((prev) => Math.max(prev, nextStep));
        saveToStorage(formData, nextStep);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } else {
      window.scrollTo({ top: 120, behavior: "smooth" });
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      saveToStorage(formData, prevStep);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleStepClick = (targetStep: number) => {
    if (targetStep <= highestStepReached) {
      setCurrentStep(targetStep);
      saveToStorage(formData, targetStep);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return {
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
  };
}
