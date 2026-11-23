import { httpClient } from "./api";
import { 
  AdminListingItem, 
  AdminUserItem, 
  AdminUsersResponse,
  AdminReportItem,
  AdminReportsResponse,
  AdminDashboardStatsResponse
} from "@/types/admin";

export interface AdminListingsResponse {
  message?: string;
  data: AdminListingItem[];
  pagination?: {
    totalItems: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface AdminKycVerificationItem {
  profileId: string;
  userId: string;
  user: {
    id: string;
    fullName: string;
    email: string;
    phoneNumber?: string | null;
    avatarUrl?: string | null;
    createdAt?: string;
  };
  verificationStatus: "PENDING" | "VERIFIED" | "REJECTED";
  submittedAt: string;
  kycDetails?: {
    personalInfo?: {
      fullName?: string;
      idNumber?: string;
      dateOfBirth?: string;
      gender?: "MALE" | "FEMALE" | "OTHER";
      issueDate?: string;
      issuingAuthority?: string;
      permanentAddress?: string;
    };
    documents?: {
      frontImage?: string | null;
      frontFileName?: string | null;
      frontFileSize?: number | null;
      backImage?: string | null;
      backFileName?: string | null;
      backFileSize?: number | null;
    };
    submittedAt?: string;
  } | null;
}

export interface AdminVerificationsResponse {
  data: AdminKycVerificationItem[];
  totalItems: number;
}

export async function getAdminPendingListings(): Promise<AdminListingsResponse> {
  return httpClient.get<AdminListingsResponse>("/admin/listings/pending");
}

export async function getAdminAllListings(params?: {
  page?: number;
  limit?: number;
  status?: string;
  propertyType?: string;
  city?: string;
  search?: string;
}): Promise<AdminListingsResponse> {
  return httpClient.get<AdminListingsResponse>("/admin/listings", params);
}

export async function getAdminListingById(id: string): Promise<{ message?: string; listing: AdminListingItem }> {
  return httpClient.get<{ message?: string; listing: AdminListingItem }>(`/admin/listings/${id}`);
}

export async function approveListing(id: string): Promise<{ message: string; listing: AdminListingItem }> {
  return httpClient.patch<{ message: string; listing: AdminListingItem }>(`/admin/listings/${id}/approve`);
}

export async function rejectListing(
  id: string,
  rejectionReason: string
): Promise<{ message: string; listing: AdminListingItem }> {
  return httpClient.patch<{ message: string; listing: AdminListingItem }>(`/admin/listings/${id}/reject`, {
    rejectionReason,
  });
}

export async function toggleHideListing(id: string): Promise<{ message: string; listing: AdminListingItem }> {
  return httpClient.patch<{ message: string; listing: AdminListingItem }>(`/admin/listings/${id}/hide`);
}

// Moderation eKYC Chủ Nhà
export async function getAdminPendingVerifications(): Promise<AdminVerificationsResponse> {
  return httpClient.get<AdminVerificationsResponse>("/admin/listings/verifications");
}

export async function approveLandlordVerification(userId: string): Promise<{ message: string }> {
  return httpClient.patch<{ message: string }>(`/admin/listings/verifications/${userId}/approve`);
}

export async function rejectLandlordVerification(
  userId: string,
  reason: string,
  rejectedFields?: string[]
): Promise<{ message: string }> {
  return httpClient.patch<{ message: string }>(`/admin/listings/verifications/${userId}/reject`, {
    reason,
    rejectedFields,
  });
}

// User & Account Management (Admin)
export async function getAdminUsers(params?: {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  status?: string;
  verificationStatus?: string;
  sortBy?: string;
  sortOrder?: string;
}): Promise<AdminUsersResponse> {
  return httpClient.get<AdminUsersResponse>("/admin/users", params);
}

export async function getAdminUserDetail(id: string): Promise<{ success: boolean; data: any }> {
  return httpClient.get<{ success: boolean; data: any }>(`/admin/users/${id}`);
}

export async function toggleUserLock(
  id: string,
  lockReason?: string
): Promise<{ success: boolean; message: string; data: AdminUserItem }> {
  return httpClient.patch<{ success: boolean; message: string; data: AdminUserItem }>(
    `/admin/users/${id}/lock`,
    { lockReason }
  );
}

export async function updateUserRoles(
  id: string,
  roles: string[]
): Promise<{ success: boolean; message: string; data: any }> {
  return httpClient.patch<{ success: boolean; message: string; data: any }>(
    `/admin/users/${id}/roles`,
    { roles }
  );
}

export async function updateUserKyc(
  id: string,
  verificationStatus: string
): Promise<{ success: boolean; message: string }> {
  return httpClient.patch<{ success: boolean; message: string }>(
    `/admin/users/${id}/kyc`,
    { verificationStatus }
  );
}

export async function createAdminUser(payload: {
  fullName: string;
  email: string;
  password: string;
  phoneNumber?: string;
  roles?: string[];
}): Promise<{ success: boolean; message: string; data: any }> {
  return httpClient.post<{ success: boolean; message: string; data: any }>(
    "/admin/users",
    payload
  );
}

export async function updateAdminUser(
  id: string,
  payload: {
    fullName?: string;
    phoneNumber?: string;
    email?: string;
    avatarUrl?: string;
  }
): Promise<{ success: boolean; message: string; data: any }> {
  return httpClient.put<{ success: boolean; message: string; data: any }>(
    `/admin/users/${id}`,
    payload
  );
}

// Listing Reports & Violation Moderation
export async function getAdminReports(params?: {
  page?: number;
  limit?: number;
  status?: string;
  reason?: string;
  search?: string;
}): Promise<AdminReportsResponse> {
  return httpClient.get<AdminReportsResponse>("/reports/admin", params);
}

export async function getAdminReportDetail(id: string): Promise<{ success: boolean; data: any }> {
  return httpClient.get<{ success: boolean; data: any }>(`/reports/admin/${id}`);
}

export async function resolveReport(
  id: string,
  action: string,
  adminNote?: string
): Promise<{ success: boolean; message: string }> {
  return httpClient.patch<{ success: boolean; message: string }>(`/reports/admin/${id}/resolve`, {
    action,
    adminNote,
  });
}

export async function createListingReport(payload: {
  listingId: string;
  reason: string;
  description?: string;
  evidenceUrls?: string[];
}): Promise<{ success: boolean; message: string; data: any }> {
  return httpClient.post<{ success: boolean; message: string; data: any }>("/reports", payload);
}

export async function getMyReports(): Promise<{ success: boolean; data: any[] }> {
  return httpClient.get<{ success: boolean; data: any[] }>("/reports/my-reports");
}

// Viewing Reviews & Listing Reviews
export async function getListingReviews(listingId: string, params?: { page?: number; limit?: number; star?: number }) {
  return httpClient.get<{ success: boolean; data: any[]; pagination: any; stats: any }>(
    `/reviews/listings/${listingId}`,
    params
  );
}

export async function checkReviewEligibility(listingId: string) {
  return httpClient.get<{
    canReview: boolean;
    canReviewViewing?: boolean;
    inquiryId?: string | null;
    canReviewStay?: boolean;
    rentalConfirmationId?: string | null;
    landlordId?: string;
    alreadyReviewed?: boolean;
    reason?: string;
    review?: any;
  }>(`/reviews/check-eligibility/${listingId}`);
}

export async function createViewingReview(payload: {
  landlordId: string;
  listingId: string;
  inquiryId?: string | null;
  rating: number;
  accuracyRating?: number;
  communicationRating?: number;
  supportRating?: number;
  priceAccurate?: boolean;
  amenitiesAccurate?: boolean;
  evidenceUrls?: string[];
  content: string;
}): Promise<{ message: string; review: any }> {
  return httpClient.post<{ message: string; review: any }>("/reviews", payload);
}

export async function getAdminDashboardStats(params?: {
  timeRange?: "7d" | "30d";
}): Promise<AdminDashboardStatsResponse> {
  return httpClient.get<AdminDashboardStatsResponse>("/admin/dashboard/stats", params);
}

export const adminService = {
  getDashboardStats: getAdminDashboardStats,
  getPendingListings: getAdminPendingListings,
  getAllListings: getAdminAllListings,
  getListingById: getAdminListingById,
  approveListing,
  rejectListing,
  toggleHideListing,
  getPendingVerifications: getAdminPendingVerifications,
  approveVerification: approveLandlordVerification,
  rejectVerification: rejectLandlordVerification,
  getUsers: getAdminUsers,
  getUserDetail: getAdminUserDetail,
  toggleLock: toggleUserLock,
  updateRoles: updateUserRoles,
  updateKyc: updateUserKyc,
  createUser: createAdminUser,
  updateUser: updateAdminUser,
  getReports: getAdminReports,
  getReportDetail: getAdminReportDetail,
  resolveReport,
  createReport: createListingReport,
  getMyReports,
  getListingReviews,
  checkReviewEligibility,
  createReview: createViewingReview,
};
