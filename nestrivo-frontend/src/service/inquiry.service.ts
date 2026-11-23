import { httpClient } from "./api";
import { RentalInquiry, InquiryStatus, InquiryStats } from "@/types/inquiry";

export interface LandlordInquiriesFilterParams {
  status?: string;
  listingId?: string;
  search?: string;
  dateSort?: "newest" | "oldest";
}

export async function fetchLandlordInquiries(
  params?: LandlordInquiriesFilterParams
): Promise<RentalInquiry[]> {
  try {
    const res = await httpClient.get<{ data: RentalInquiry[]; totalItems: number }>(
      "/inquiries/landlord",
      params as Record<string, string | number | boolean | undefined>
    );
    return res.data || [];
  } catch (error) {
    console.warn("fetchLandlordInquiries error, returning empty list:", error);
    return [];
  }
}

export async function fetchLandlordInquiryStats(): Promise<InquiryStats> {
  try {
    const res = await httpClient.get<InquiryStats>("/inquiries/landlord/stats");
    return res;
  } catch (error) {
    console.warn("fetchLandlordInquiryStats error, returning default stats:", error);
    return { total: 0, pending: 0, contacted: 0, closed: 0 };
  }
}

export async function updateInquiryStatusApi(
  id: string,
  status: InquiryStatus,
  notes?: string,
  rejectionReason?: string
): Promise<boolean> {
  try {
    await httpClient.patch(`/inquiries/${id}/status`, { status, notes, rejectionReason });
    return true;
  } catch (error) {
    console.error("updateInquiryStatusApi error:", error);
    throw error;
  }
}

export function calculateInquiryStats(inquiries: RentalInquiry[]): InquiryStats {
  return {
    total: inquiries.length,
    pending: inquiries.filter((i) => i.status === "PENDING").length,
    confirmed: inquiries.filter((i) => i.status === "CONFIRMED").length,
    rejected: inquiries.filter((i) => i.status === "REJECTED").length,
    contacted: inquiries.filter((i) => i.status === "CONTACTED").length,
    closed: inquiries.filter((i) => i.status === "CLOSED").length,
  };
}

export interface RenterInquiryItem {
  id: string;
  renterId: string;
  landlordId: string;
  listingId: string;
  message: string;
  moveInDate?: string | null;
  occupantsCount?: number;
  status: InquiryStatus;
  createdAt: string;
  updatedAt: string;
  contactedAt?: string | null;
  closedAt?: string | null;
  notes?: string;
  landlord: {
    id: string;
    name: string;
    phoneNumber: string;
    email: string;
    avatarUrl?: string | null;
  };
  listing: {
    id: string;
    title: string;
    price: number;
    thumbnailUrl: string;
    address: string;
    district: string;
    city: string;
    propertyType?: string;
  };
}

export async function fetchRenterInquiries(status?: string): Promise<RenterInquiryItem[]> {
  try {
    const res = await httpClient.get<{ data: RenterInquiryItem[]; totalItems: number }>(
      "/inquiries/renter",
      status && status !== "ALL" ? { status } : undefined
    );
    return res.data || [];
  } catch (error) {
    console.warn("fetchRenterInquiries error, returning empty list:", error);
    return [];
  }
}

export interface CreateInquiryPayload {
  listingId: string;
  message: string;
  moveInDate?: string | null;
  occupantsCount?: number;
  notes?: string;
}

export async function createInquiryApi(payload: CreateInquiryPayload): Promise<{ message: string; inquiry: any }> {
  return httpClient.post<{ message: string; inquiry: any }>("/inquiries", payload);
}

export const inquiryService = {
  create: createInquiryApi,
  getInquiries: fetchLandlordInquiries,
  getRenterInquiries: fetchRenterInquiries,
  getStats: fetchLandlordInquiryStats,
  updateStatus: updateInquiryStatusApi,
  calculateStats: calculateInquiryStats,
};
