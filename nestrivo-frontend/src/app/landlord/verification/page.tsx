"use client";

import { useState, useEffect, useCallback } from "react";
import { CheckCircle2, X, RefreshCw } from "lucide-react";
import { useLandlordLayout } from "@/components/landlord/layout/LandlordWorkspaceLayout";
import { VerificationHeader } from "@/components/landlord/verification/VerificationHeader";
import { VerificationOverview } from "@/components/landlord/verification/VerificationOverview";
import { VerificationStatusCard } from "@/components/landlord/verification/VerificationStatusCard";
import { VerificationWizard } from "@/components/landlord/verification/VerificationWizard";
import { KycVerificationData } from "@/types/verification";
import { DEFAULT_INITIAL_KYC } from "@/lib/verification-mock-data";
import { verificationService } from "@/service/verification.service";
import { useAuth } from "@/context/AuthContext";

export default function LandlordVerificationPage() {
  const { toggleMobileMenu } = useLandlordLayout();
  const { user, refreshUser } = useAuth();

  // Core KYC State loaded from Database / Backend API
  const [kycData, setKycData] = useState<KycVerificationData>(DEFAULT_INITIAL_KYC);
  const [isWizardMode, setIsWizardMode] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage((prev) => (prev === message ? null : prev));
    }, 4000);
  };

  const loadVerificationState = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await verificationService.getKycStatus();
      if (data) {
        // Pre-fill user fullName if not set
        if (!data.personalInfo.fullName && user?.fullName) {
          data.personalInfo.fullName = user.fullName;
        }
        setKycData(data);
      }
    } catch (error) {
      console.warn("Failed to fetch verification status:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.fullName]);

  useEffect(() => {
    loadVerificationState();
  }, [loadVerificationState]);

  // Handle successful submission from the wizard
  const handleWizardSubmit = async (submittedData: KycVerificationData) => {
    setKycData(submittedData);
    setIsWizardMode(false);
    await refreshUser();
    showToast("Đã nộp hồ sơ xác minh danh tính thành công! Trạng thái: CHỜ DUYỆT (PENDING)");
  };

  return (
    <>
      {/* 1. Dedicated Landlord Verification Header */}
      <VerificationHeader
        status={kycData.status}
        onToggleMobileMenu={toggleMobileMenu}
      />

      {/* 2. Main Content Container */}
      <main className="px-4 sm:px-6 lg:px-8 xl:px-10 pt-4 sm:pt-6 lg:pt-8 pb-24 sm:pb-28 lg:pb-32 space-y-6 w-full max-w-[1920px] mx-auto">
        {isLoading ? (
          <div className="bg-white rounded-3xl border border-slate-200/90 p-12 text-center flex flex-col items-center justify-center space-y-3 shadow-2xs">
            <RefreshCw className="w-8 h-8 text-[#805B10] animate-spin" />
            <p className="text-sm font-semibold text-slate-600">
              Đang tải thông tin hồ sơ định danh...
            </p>
          </div>
        ) : isWizardMode ? (
          <VerificationWizard
            initialData={kycData}
            onSubmit={handleWizardSubmit}
            onCancel={() => setIsWizardMode(false)}
          />
        ) : kycData.status === "NOT_VERIFIED" ? (
          <VerificationOverview
            onStartVerification={() => setIsWizardMode(true)}
          />
        ) : (
          <VerificationStatusCard
            data={kycData}
            onStartResubmit={() => setIsWizardMode(true)}
          />
        )}
      </main>

      {/* 3. Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-200 border border-slate-700/80">
          <div className="w-7 h-7 rounded-lg bg-[#F4CD65] text-[#373523] flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <p className="text-xs sm:text-sm font-medium leading-snug flex-1">
            {toastMessage}
          </p>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white p-1 cursor-pointer"
            aria-label="Đóng thông báo"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </>
  );
}
