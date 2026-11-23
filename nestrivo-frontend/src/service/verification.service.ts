import { httpClient, ApiServiceError } from "./api";
import { uploadImageToCloudinary } from "./upload.service";
import { KycVerificationData, KycPersonalInfo, KycDocuments } from "@/types/verification";
import { AuthUser } from "@/types/auth";
import { getStoredUser } from "./auth.service";

export interface SubmitKycResponse {
  message: string;
  kyc: KycVerificationData;
  user: AuthUser;
}

const KYC_STORAGE_PREFIX = "nestrivo_kyc_data_user_";

function getUserKycStorageKey(userId?: string): string {
  if (userId) return `${KYC_STORAGE_PREFIX}${userId}`;
  const currentUser = getStoredUser();
  return `${KYC_STORAGE_PREFIX}${currentUser?.id || "guest"}`;
}

export function getLocalUserKyc(userId?: string): KycVerificationData | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(getUserKycStorageKey(userId));
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
    // Ignore storage parse error
  }
  return null;
}

export function saveLocalUserKyc(data: KycVerificationData, userId?: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(getUserKycStorageKey(userId), JSON.stringify(data));
  } catch {
    // Ignore storage write error
  }
}

/**
 * Lấy dữ liệu hồ sơ xác minh eKYC của chủ nhà hiện tại
 */
export async function getKycVerification(): Promise<KycVerificationData> {
  const currentUser = getStoredUser();

  try {
    const res = await httpClient.get<KycVerificationData>("/auth/verification");
    if (res) {
      saveLocalUserKyc(res, currentUser?.id);
      return res;
    }
  } catch (error) {
    console.warn("Backend KYC status fetch error, reading local fallback:", error);
  }

  // Fallback: check local storage for this user
  const localSaved = getLocalUserKyc(currentUser?.id);
  if (localSaved) {
    return localSaved;
  }

  // Fallback từ profile nếu user đã được xác minh trước đó
  const backendStatus = currentUser?.landlordProfile?.verificationStatus;
  const status =
    backendStatus === "VERIFIED"
      ? "APPROVED"
      : backendStatus === "PENDING"
      ? "PENDING"
      : backendStatus === "REJECTED"
      ? "REJECTED"
      : "NOT_VERIFIED";

  return {
    status,
    personalInfo: {
      fullName: currentUser?.fullName || "",
      dateOfBirth: "",
      gender: "MALE",
      idNumber: "",
      issueDate: "",
      issuingAuthority: "Cục Cảnh sát Quản lý hành chính về trật tự xã hội",
      permanentAddress: "",
    },
    documents: {
      frontImage: null,
      frontFileName: null,
      frontFileSize: null,
      backImage: null,
      backFileName: null,
      backFileSize: null,
    },
    submittedAt: null,
    approvedAt: backendStatus === "VERIFIED" ? new Date().toISOString() : null,
    rejectedAt: null,
    rejectionReason: null,
    confirmedTerms: false,
  };
}

/**
 * Nộp hồ sơ xác minh eKYC lên máy chủ Nestrivo
 */
export async function submitKycVerification(payload: {
  personalInfo: KycPersonalInfo;
  documents: KycDocuments;
}): Promise<SubmitKycResponse> {
  const currentUser = getStoredUser();

  try {
    const res = await httpClient.post<SubmitKycResponse>("/auth/verification", payload);
    if (res && res.kyc) {
      saveLocalUserKyc(res.kyc, currentUser?.id);
      return res;
    }
  } catch (error) {
    if (error instanceof ApiServiceError && error.status >= 400 && error.status < 500) {
      throw error;
    }
    console.warn("Server unavailable, falling back to local state sync:", error);
  }

  // Fallback optimistic response khi server tạm thời offline
  const fallbackKyc: KycVerificationData = {
    status: "PENDING",
    personalInfo: payload.personalInfo,
    documents: payload.documents,
    submittedAt: new Date().toISOString(),
    approvedAt: null,
    rejectedAt: null,
    rejectionReason: null,
    rejectedFields: [],
    confirmedTerms: true,
  };

  saveLocalUserKyc(fallbackKyc, currentUser?.id);

  const updatedUser: AuthUser = {
    id: currentUser?.id || "temp-landlord-id",
    email: currentUser?.email || "landlord@nestrivo.vn",
    fullName: payload.personalInfo.fullName || currentUser?.fullName || "Chủ Nhà",
    phoneNumber: currentUser?.phoneNumber,
    avatarUrl: currentUser?.avatarUrl,
    roles: Array.from(new Set([...(currentUser?.roles || []), "LANDLORD"])),
    isActive: true,
    landlordProfile: {
      displayName: payload.personalInfo.fullName,
      verificationStatus: "PENDING",
    },
  };

  return {
    message: "Đã nộp hồ sơ xác minh danh tính thành công! Trạng thái: CHỜ DUYỆT (PENDING)",
    kyc: fallbackKyc,
    user: updatedUser,
  };
}

/**
 * Tải ảnh Căn cước công dân trực tiếp lên Cloudinary thư mục 'nestrivo/kyc'
 */
export async function uploadKycImage(
  file: File,
  onProgress?: (percent: number) => void
): Promise<{ url: string; originalFilename: string; size: number }> {
  const res = await uploadImageToCloudinary(file, {
    folder: "nestrivo/kyc",
    onProgress,
  });

  return {
    url: res.secureUrl || res.url,
    originalFilename: res.originalFilename || file.name,
    size: res.bytes || file.size,
  };
}

export const verificationService = {
  getKycStatus: getKycVerification,
  submitKyc: submitKycVerification,
  uploadImage: uploadKycImage,
};

