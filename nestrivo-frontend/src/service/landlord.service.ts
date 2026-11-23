import { httpClient, ApiResponse } from "./api";
import { LandlordListingItem } from "@/types/landlord";

export interface LandlordListingsResponse {
  message?: string;
  data: LandlordListingItem[];
  pagination?: {
    totalItems: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface LandlordListingDetailResponse {
  message?: string;
  listing: LandlordListingItem;
}

export async function getMyLandlordListings(params?: {
  page?: number;
  limit?: number;
  status?: string;
  availabilityStatus?: string;
  search?: string;
}): Promise<LandlordListingsResponse> {
  return httpClient.get<LandlordListingsResponse>("/landlord/listings", params);
}

export async function getMyLandlordListingById(id: string): Promise<LandlordListingDetailResponse> {
  return httpClient.get<LandlordListingDetailResponse>(`/landlord/listings/${id}`);
}

export async function createLandlordListing(data: unknown): Promise<{ message: string; listing: LandlordListingItem }> {
  return httpClient.post<{ message: string; listing: LandlordListingItem }>("/landlord/listings", data);
}

export async function updateLandlordListing(id: string, data: unknown): Promise<{ message: string; listing: LandlordListingItem }> {
  return httpClient.put<{ message: string; listing: LandlordListingItem }>(`/landlord/listings/${id}`, data);
}

export async function submitListingForReview(id: string): Promise<{ message: string; listing: LandlordListingItem }> {
  return httpClient.patch<{ message: string; listing: LandlordListingItem }>(`/landlord/listings/${id}/submit`);
}

export async function updateListingAvailability(
  id: string,
  availabilityStatus: "AVAILABLE" | "RENTED"
): Promise<{ message: string; listing: LandlordListingItem }> {
  return httpClient.patch<{ message: string; listing: LandlordListingItem }>(`/landlord/listings/${id}/availability`, {
    availabilityStatus,
  });
}

export async function toggleListingVisibility(id: string): Promise<{ message: string; listing: LandlordListingItem }> {
  return httpClient.patch<{ message: string; listing: LandlordListingItem }>(`/landlord/listings/${id}/visibility`);
}

export async function deleteLandlordListing(id: string): Promise<{ message: string }> {
  return httpClient.delete<{ message: string }>(`/landlord/listings/${id}`);
}

export interface LandlordReportItem {
  id: string;
  listingId: string;
  listingTitle: string;
  listingPrice?: number | string;
  listingAddress?: string;
  listingStatus?: string;
  listingThumbnailUrl?: string;
  reason: string;
  reasonLabel: string;
  description: string;
  evidenceUrls?: string[];
  status: "PENDING" | "RESOLVED" | "DISMISSED";
  adminNote?: string | null;
  resolutionAction?: "HIDE_LISTING" | "WARN_LANDLORD" | "LOCK_LANDLORD" | "DISMISS" | null;
  createdAt: string;
  resolvedAt?: string | null;
  warningExpiresAt?: string | null;
  isWarningActive?: boolean;
  isFixed?: boolean;
  isExpired?: boolean;
  remainingHours?: number;
  remainingMinutes?: number;
  listingUpdatedAt?: string | null;
}

export interface LandlordListingReportsResponse {
  success: boolean;
  data: LandlordReportItem[];
  stats: {
    total: number;
    warningCount: number;
    hiddenCount: number;
    pendingCount: number;
  };
}

export async function getLandlordListingReports(): Promise<LandlordListingReportsResponse> {
  return httpClient.get<LandlordListingReportsResponse>("/reports/landlord/my-listing-reports");
}

export const landlordService = {
  getMyListings: getMyLandlordListings,
  getListingById: getMyLandlordListingById,
  createListing: createLandlordListing,
  updateListing: updateLandlordListing,
  submitForReview: submitListingForReview,
  updateAvailability: updateListingAvailability,
  toggleVisibility: toggleListingVisibility,
  deleteListing: deleteLandlordListing,
  getListingReports: getLandlordListingReports,
};

