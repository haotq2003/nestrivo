import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { apiClient } from "@/lib/axios";
import {
  PublicListingFilterParams,
  PublicListingsResponse,
  PublicListingDetailResponse,
} from "@/service/listing.service";

export const LISTING_QUERY_KEYS = {
  all: ["listings"] as const,
  lists: () => [...LISTING_QUERY_KEYS.all, "list"] as const,
  list: (params?: PublicListingFilterParams) =>
    [...LISTING_QUERY_KEYS.lists(), params] as const,
  details: () => [...LISTING_QUERY_KEYS.all, "detail"] as const,
  detail: (id: string) => [...LISTING_QUERY_KEYS.details(), id] as const,
};

/**
 * Hook fetch danh sách phòng trọ công khai với TanStack Query
 */
export function useListingsQuery(
  params?: PublicListingFilterParams,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: LISTING_QUERY_KEYS.list(params),
    queryFn: async (): Promise<PublicListingsResponse> => {
      const response = await apiClient.get<PublicListingsResponse>("/listings", {
        params,
      });
      return response.data;
    },
    enabled: options?.enabled ?? true,
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 3, // Dữ liệu danh sách tươi mới trong 3 phút
  });
}

/**
 * Hook fetch chi tiết 1 phòng trọ theo ID
 */
export function useListingDetailQuery(id: string) {
  return useQuery({
    queryKey: LISTING_QUERY_KEYS.detail(id),
    queryFn: async (): Promise<PublicListingDetailResponse> => {
      const response = await apiClient.get<PublicListingDetailResponse>(
        `/listings/${id}`
      );
      return response.data;
    },
    enabled: Boolean(id),
    staleTime: 1000 * 60 * 5, // Chi tiết phòng cache 5 phút
  });
}
