import { httpClient } from "./api";
import { ListingItem } from "@/types/listing";

export interface FavoritesListResponse {
  success: boolean;
  data: ListingItem[];
  totalItems: number;
  message?: string;
}

export interface FavoriteIdsResponse {
  success: boolean;
  favoriteIds: string[];
  message?: string;
}

export interface ToggleFavoriteResponse {
  success: boolean;
  isFavorited: boolean;
  listingId: string;
  message?: string;
}

export interface ClearFavoritesResponse {
  success: boolean;
  deletedCount: number;
  message?: string;
}

/**
 * 1. Lấy danh sách toàn bộ tin đã lưu của tài khoản
 */
export async function getFavoritesApi(): Promise<FavoritesListResponse> {
  return httpClient.get<FavoritesListResponse>("/favorites");
}

/**
 * 2. Lấy danh sách ID các tin đã lưu để hiển thị nhanh icon trái tim
 */
export async function getFavoriteIdsApi(): Promise<FavoriteIdsResponse> {
  return httpClient.get<FavoriteIdsResponse>("/favorites/ids");
}

/**
 * 3. Bật/tắt lưu tin yêu thích
 */
export async function toggleFavoriteApi(listingId: string): Promise<ToggleFavoriteResponse> {
  return httpClient.post<ToggleFavoriteResponse>(`/favorites/toggle/${listingId}`);
}

/**
 * 4. Xóa toàn bộ danh sách tin đã lưu
 */
export async function clearFavoritesApi(): Promise<ClearFavoritesResponse> {
  return httpClient.delete<ClearFavoritesResponse>("/favorites/clear");
}
