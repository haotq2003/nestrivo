import { httpClient } from "./api";
import { ListingItem } from "@/types/listing";

export interface CompareListingsResponse {
  success: boolean;
  data: ListingItem[];
  totalItems: number;
  message?: string;
}

/**
 * Lấy chi tiết danh sách phòng trọ cần so sánh (tối đa 4 phòng)
 */
export async function getCompareListingsApi(ids: string[]): Promise<CompareListingsResponse> {
  if (!ids || ids.length === 0) {
    return { success: true, data: [], totalItems: 0 };
  }

  const idsParam = ids.join(",");
  return httpClient.get<CompareListingsResponse>("/listings/compare", { ids: idsParam });
}
