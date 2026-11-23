import { httpClient, ApiResponse } from "./api";
import { ListingItem } from "@/types/listing";

export interface PublicListingFilterParams {
  page?: number;
  limit?: number;
  search?: string;
  city?: string;
  district?: string;
  ward?: string;
  propertyType?: string;
  minPrice?: number;
  maxPrice?: number;
  minArea?: number;
  maxArea?: number;
  bedrooms?: number;
  bathrooms?: number;
  allowsPets?: boolean;
  hasMezzanine?: boolean;
  isFurnished?: boolean;
  amenityIds?: string;
  sortBy?: string;
  featured?: boolean;
  minFavorites?: number;
  minInquiries?: number;
}

export interface PublicListingsResponse {
  success: boolean;
  data: ListingItem[];
  pagination: {
    totalItems: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface PublicListingDetailResponse {
  success: boolean;
  listing: ListingItem;
  similarListings: ListingItem[];
}

export async function getPublicListings(
  params?: PublicListingFilterParams
): Promise<PublicListingsResponse> {
  const queryParams: Record<string, string | number | boolean | undefined> = {};
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        queryParams[key] = value;
      }
    });
  }

  return httpClient.get<PublicListingsResponse>("/listings", queryParams);
}

export async function getPublicListingById(
  id: string
): Promise<PublicListingDetailResponse> {
  return httpClient.get<PublicListingDetailResponse>(`/listings/${id}`);
}

export const listingService = {
  getListings: getPublicListings,
  getListingById: getPublicListingById,
};

