import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/axios";
import { CompareListingsResponse } from "@/service/compare.service";

export const COMPARE_QUERY_KEYS = {
  compare: (ids: string[]) => ["compare-listings", ids.slice().sort()] as const,
};

/**
 * Hook fetch dữ liệu so sánh phòng trọ
 */
export function useCompareListingsQuery(ids: string[]) {
  return useQuery({
    queryKey: COMPARE_QUERY_KEYS.compare(ids),
    queryFn: async (): Promise<CompareListingsResponse> => {
      if (!ids || ids.length === 0) {
        return { success: true, data: [], totalItems: 0 };
      }
      const response = await apiClient.get<CompareListingsResponse>(
        "/listings/compare",
        {
          params: { ids: ids.join(",") },
        }
      );
      return response.data;
    },
    enabled: ids.length > 0,
    staleTime: 1000 * 60 * 5,
  });
}
