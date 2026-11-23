import { ListingStatus, AvailabilityStatus, PropertyType, ListingFee, ListingImage, ListingAmenity } from "./listing";

export interface LandlordListingItem {
  id: string;
  landlordId: string;
  title: string;
  description: string;
  propertyType: PropertyType;
  status: ListingStatus;
  availabilityStatus: AvailabilityStatus;
  price: number;
  deposit: number;
  area: number;
  bedrooms: number;
  bathrooms: number;
  maxOccupants: number;
  address: string;
  ward?: string | null;
  district: string;
  city: string;
  thumbnailUrl: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string | null;
  rejectionReason?: string | null;
  currentTier?: "FREE" | "HOT" | "VIP";
  priority?: number;
  views?: number;
  expiresAt?: string | null;
  promotionRemainingDays?: number;
  promotionEndDate?: string | null;
  activePromotion?: {
    id: string;
    startDate: string;
    endDate: string;
    tier: string;
    status: string;
  } | null;
  fees?: ListingFee[];
  images?: ListingImage[];
  amenities?: ListingAmenity[];
  allowsPets?: boolean;
  hasMezzanine?: boolean;
  isFurnished?: boolean;
  minimumStayMonths?: number | null;
  latitude?: number | null;
  longitude?: number | null;
  _count: {
    favorites: number;
    inquiries: number;
  };
}

export interface LandlordStats {
  totalListings: number;
  publishedCount: number;
  availableCount: number;
  rentedCount: number;
  pendingCount: number;
  rejectedCount: number;
  draftCount: number;
  hiddenCount: number;
  totalInquiries: number;
  totalFavorites: number;
}
