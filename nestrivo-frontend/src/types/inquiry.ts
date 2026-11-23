export type InquiryStatus = "PENDING" | "CONFIRMED" | "REJECTED" | "CONTACTED" | "CLOSED";

export interface RenterProfile {
  id: string;
  name: string;
  phoneNumber: string;
  avatarUrl?: string | null;
  email?: string;
  occupation?: string;
}

export interface InquiryListingSummary {
  id: string;
  title: string;
  price: number;
  thumbnailUrl: string;
  address: string;
  district: string;
  city: string;
  propertyType?: string;
}

export interface RentalInquiry {
  id: string;
  renterId: string;
  landlordId: string;
  listingId: string;
  message: string;
  moveInDate?: string;
  occupantsCount?: number;
  status: InquiryStatus;
  createdAt: string;
  updatedAt: string;
  contactedAt?: string | null;
  closedAt?: string | null;
  renter: RenterProfile;
  listing: InquiryListingSummary;
  notes?: string;
  rejectionReason?: string | null;
}

export interface InquiryStats {
  total: number;
  pending: number;
  confirmed?: number;
  rejected?: number;
  contacted: number;
  closed: number;
}

