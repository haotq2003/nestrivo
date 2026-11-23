"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, X } from "lucide-react";
import { useLandlordLayout } from "@/components/landlord/layout/LandlordWorkspaceLayout";
import { ProfileHeader } from "@/components/landlord/profile/ProfileHeader";
import { LandlordProfileForm } from "@/components/landlord/profile/LandlordProfileForm";
import { LandlordProfileData, DEFAULT_LANDLORD_PROFILE } from "@/types/profile";
import { loadStoredProfile, saveStoredProfile } from "@/lib/landlord-profile-helpers";
import { api } from "@/lib/api";

interface AuthUserResponse {
  id?: string;
  email?: string;
  fullName?: string;
  phoneNumber?: string | null;
  avatarUrl?: string | null;
  createdAt?: string;
  landlordProfile?: {
    description?: string | null;
    verificationStatus?: "VERIFIED" | "PENDING" | "REJECTED" | "NOT_VERIFIED";
  } | null;
}

export default function LandlordProfilePage() {
  const { toggleMobileMenu } = useLandlordLayout();

  const [profileData, setProfileData] = useState<LandlordProfileData>(DEFAULT_LANDLORD_PROFILE);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load profile data on mount
  useEffect(() => {
    // 1. Initial load from local storage
    try {
      const stored = loadStoredProfile();
      if (stored) {
        setTimeout(() => {
          setProfileData(stored);
        }, 0);
      }
    } catch {
      // Storage unavailable
    }

    // 2. Attempt remote fetch from /api/auth/me if token exists
    const token = typeof window !== "undefined" ? localStorage.getItem("nestrivo_token") : null;
    if (token) {
      api
        .get("/auth/me")
        .then((res) => {
          if (res && res.user) {
            const u = res.user as unknown as AuthUserResponse;
            setProfileData((prev) => {
              const merged: LandlordProfileData = {
                ...prev,
                id: typeof u.id === "string" ? u.id : prev.id,
                email: typeof u.email === "string" ? u.email : prev.email,
                fullName: typeof u.fullName === "string" ? u.fullName : prev.fullName,
                phoneNumber: typeof u.phoneNumber === "string" ? u.phoneNumber : prev.phoneNumber,
                avatarUrl: typeof u.avatarUrl === "string" ? u.avatarUrl : (u.avatarUrl === null ? null : prev.avatarUrl),
                createdAt: typeof u.createdAt === "string" ? u.createdAt : prev.createdAt,
                introduction:
                  typeof u.landlordProfile?.description === "string"
                    ? u.landlordProfile.description
                    : prev.introduction,
                verificationStatus:
                  u.landlordProfile?.verificationStatus || prev.verificationStatus,
              };
              saveStoredProfile(merged);
              return merged;
            });
          }
        })
        .catch(() => {
          // Fallback to local storage if API is unreachable or offline
        });
    }
  }, []);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage((prev) => (prev === message ? null : prev));
    }, 3500);
  };

  // Save profile changes
  const handleSave = async (updated: LandlordProfileData) => {
    setIsSaving(true);
    try {
      // 1. Persist to local storage
      saveStoredProfile(updated);
      setProfileData(updated);

      // 2. Persist to backend if token exists
      const token = typeof window !== "undefined" ? localStorage.getItem("nestrivo_token") : null;
      if (token) {
        try {
          await api.put("/auth/profile", {
            fullName: updated.fullName,
            phoneNumber: updated.phoneNumber,
            avatarUrl: updated.avatarUrl,
            landlordDisplayName: updated.fullName,
            landlordDescription: updated.introduction,
          });
        } catch {
          // If server fails or is offline, local storage already persisted the update
        }
      }

      showToast("Đã lưu cập nhật hồ sơ chủ nhà thành công!");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      {/* 1. Dedicated Header */}
      <ProfileHeader
        onToggleMobileMenu={toggleMobileMenu}
        verificationStatus={profileData.verificationStatus}
      />

      {/* 2. Main Profile Workspace */}
      <main className="px-4 sm:px-6 lg:px-8 xl:px-10 pt-4 sm:pt-6 lg:pt-8 pb-24 sm:pb-28 lg:pb-32 w-full max-w-4xl mx-auto space-y-6">
        <LandlordProfileForm
          key={`${profileData.id || profileData.email}-${profileData.fullName}-${profileData.phoneNumber}`}
          initialData={profileData}
          onSave={handleSave}
          isSaving={isSaving}
        />
      </main>

      {/* 3. Toast Feedback */}
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
            className="text-slate-400 hover:text-white p-1"
            aria-label="Đóng thông báo"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </>
  );
}
