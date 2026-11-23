export type PropertyType = "ROOM_SHARE" | "STUDIO" | "SERVICE_APARTMENT" | "WHOLE_HOUSE";

export type ListingStatus = "DRAFT" | "PENDING_APPROVAL" | "PUBLISHED" | "REJECTED" | "HIDDEN" | "EXPIRED";

export type AvailabilityStatus = "AVAILABLE" | "RENTED" | "UNAVAILABLE";

export interface ListingImage {
  id: string;
  listingId: string;
  imageUrl: string;
  sortOrder: number;
}

export interface Amenity {
  id: string;
  name: string;
  icon?: string | null;
}

export interface ListingAmenity {
  amenityId: string;
  amenity: Amenity;
}

export interface ListingFee {
  id: string;
  type: string;
  name?: string | null;
  amount: number | string;
  unit: string;
}

export interface LandlordSummary {
  id: string;
  email: string;
  fullName: string;
  phoneNumber?: string | null;
  avatarUrl?: string | null;
  landlordProfile?: {
    displayName?: string | null;
    verificationStatus?: "PENDING" | "VERIFIED" | "REJECTED";
  } | null;
}

export interface ListingItem {
  id: string;
  landlordId: string;
  title: string;
  description: string;
  propertyType: PropertyType;
  status: ListingStatus;
  availabilityStatus: AvailabilityStatus;
  price: number | string;
  deposit: number | string;
  area: number | string;
  bedrooms: number;
  bathrooms: number;
  maxOccupants: number;
  address: string;
  ward?: string | null;
  district: string;
  city: string;
  latitude?: number | null;
  longitude?: number | null;
  minimumStayMonths?: number | null;
  allowsPets: boolean;
  hasMezzanine: boolean;
  isFurnished: boolean;
  publishedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  images?: ListingImage[];
  amenities?: ListingAmenity[];
  fees?: ListingFee[];
  landlord?: LandlordSummary;
  isFavorited?: boolean;
  currentTier?: "FREE" | "HOT" | "VIP";
  priority?: number;
  views?: number;
  _count?: {
    favorites?: number;
    inquiries?: number;
  };
}

export interface ListingDetailResponse {
  success: boolean;
  listing: ListingItem;
  similarListings?: ListingItem[];
}

export const PROPERTY_TYPE_LABELS: Record<PropertyType, string> = {
  ROOM_SHARE: "Ở ghép",
  STUDIO: "Phòng Studio",
  SERVICE_APARTMENT: "Căn hộ dịch vụ",
  WHOLE_HOUSE: "Nhà nguyên căn",
};

export const FEE_TYPE_LABELS: Record<string, string> = {
  ELECTRICITY: "Điện",
  WATER: "Nước",
  INTERNET: "Internet / WiFi",
  SERVICE: "Phí dịch vụ chung",
  PARKING: "Gửi xe máy",
  OTHER: "Chi phí khác",
};

export const FEE_UNIT_LABELS: Record<string, string> = {
  PER_KWH: "₫/kWh",
  PER_M3: "₫/m³",
  PER_MONTH: "₫/tháng",
  PER_PERSON: "₫/người",
  PER_VEHICLE: "₫/xe/tháng",
  FIXED: "₫/tháng",
};
