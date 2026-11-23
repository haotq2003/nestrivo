"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { useAuth } from "./AuthContext";
import {
  getFavoriteIdsApi,
  getFavoritesApi,
  toggleFavoriteApi,
  clearFavoritesApi,
} from "@/service/favorite.service";
import { ListingItem } from "@/types/listing";

const GUEST_FAVORITES_KEY = "nestrivo_guest_favorite_ids";

interface FavoritesContextType {
  favoriteIds: string[];
  favoritesCount: number;
  isLoading: boolean;
  isFavorite: (id: string) => boolean;
  toggleFavorite: (listingId: string, listingData?: ListingItem) => Promise<boolean>;
  clearFavorites: () => Promise<void>;
  favoritesList: ListingItem[];
  fetchFavoritesList: () => Promise<ListingItem[]>;
  isLoadingList: boolean;
}

const FavoritesContext = createContext<FavoritesContextType>({
  favoriteIds: [],
  favoritesCount: 0,
  isLoading: false,
  isFavorite: () => false,
  toggleFavorite: async () => false,
  clearFavorites: async () => {},
  favoritesList: [],
  fetchFavoritesList: async () => [],
  isLoadingList: false,
});

export const useFavorites = () => useContext(FavoritesContext);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [favoritesList, setFavoritesList] = useState<ListingItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoadingList, setIsLoadingList] = useState<boolean>(false);

  // 1. Tải danh sách ID tin yêu thích khi mount hoặc khi auth thay đổi
  const loadFavoriteIds = useCallback(async () => {
    setIsLoading(true);
    try {
      if (isAuthenticated) {
        const res = await getFavoriteIdsApi();
        if (res.success && Array.isArray(res.favoriteIds)) {
          setFavoriteIds(res.favoriteIds);
        }
      } else {
        // Khách vãng lai: đọc từ localStorage
        if (typeof window !== "undefined") {
          const raw = localStorage.getItem(GUEST_FAVORITES_KEY);
          if (raw) {
            try {
              const parsed = JSON.parse(raw);
              if (Array.isArray(parsed)) {
                setFavoriteIds(parsed);
              }
            } catch {
              setFavoriteIds([]);
            }
          } else {
            setFavoriteIds([]);
          }
        }
      }
    } catch (err) {
      console.warn("Không thể tải danh sách ID tin đã lưu:", err);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    loadFavoriteIds();
  }, [loadFavoriteIds]);

  // 2. Tải toàn bộ danh sách chi tiết (thường dùng ở trang /favorites)
  const fetchFavoritesList = useCallback(async (): Promise<ListingItem[]> => {
    setIsLoadingList(true);
    try {
      if (isAuthenticated) {
        const res = await getFavoritesApi();
        if (res.success && Array.isArray(res.data)) {
          setFavoritesList(res.data);
          // Đồng bộ lại danh sách ID
          setFavoriteIds(res.data.map((l) => l.id));
          return res.data;
        }
      } else {
        // Đối với khách vãng lai nếu chưa có backend sync, chỉ lấy từ local storage
        // Nếu cần lấy chi tiết từ public API cho danh sách IDs
        setFavoritesList([]);
      }
      return [];
    } catch (err) {
      console.error("Lỗi khi tải danh sách tin đã lưu:", err);
      return [];
    } finally {
      setIsLoadingList(false);
    }
  }, [isAuthenticated]);

  // 3. Kiểm tra xem tin có đang được lưu không
  const isFavorite = useCallback(
    (id: string) => {
      return favoriteIds.includes(id);
    },
    [favoriteIds]
  );

  // 4. Bật / tắt lưu tin
  const toggleFavorite = useCallback(
    async (listingId: string, listingData?: ListingItem): Promise<boolean> => {
      const currentlyFavorited = favoriteIds.includes(listingId);
      const nextFavorited = !currentlyFavorited;

      // Cập nhật lạc quan (Optimistic update)
      const nextIds = nextFavorited
        ? [...favoriteIds, listingId]
        : favoriteIds.filter((id) => id !== listingId);
      setFavoriteIds(nextIds);

      // Cập nhật danh sách chi tiết nếu đang có
      if (!nextFavorited) {
        setFavoritesList((prev) => prev.filter((item) => item.id !== listingId));
      } else if (listingData) {
        setFavoritesList((prev) => [{ ...listingData, isFavorited: true }, ...prev]);
      }

      if (isAuthenticated) {
        try {
          const res = await toggleFavoriteApi(listingId);
          if (res.success) {
            // Đồng bộ lại chuẩn xác theo server
            const finalState = res.isFavorited;
            setFavoriteIds((prev) => {
              if (finalState && !prev.includes(listingId)) return [...prev, listingId];
              if (!finalState && prev.includes(listingId)) return prev.filter((id) => id !== listingId);
              return prev;
            });
            return finalState;
          }
        } catch (err) {
          console.error("Lỗi khi toggle favorite với máy chủ:", err);
          // Rollback nếu lỗi
          setFavoriteIds(favoriteIds);
          return currentlyFavorited;
        }
      } else {
        // Lưu local storage cho khách vãng lai
        if (typeof window !== "undefined") {
          localStorage.setItem(GUEST_FAVORITES_KEY, JSON.stringify(nextIds));
        }
      }

      return nextFavorited;
    },
    [favoriteIds, isAuthenticated]
  );

  // 5. Xóa tất cả tin yêu thích
  const clearFavorites = useCallback(async () => {
    if (isAuthenticated) {
      try {
        await clearFavoritesApi();
      } catch (err) {
        console.error("Lỗi khi xóa tất cả tin đã lưu:", err);
      }
    } else {
      if (typeof window !== "undefined") {
        localStorage.removeItem(GUEST_FAVORITES_KEY);
      }
    }
    setFavoriteIds([]);
    setFavoritesList([]);
  }, [isAuthenticated]);

  const favoritesCount = useMemo(() => favoriteIds.length, [favoriteIds]);

  const value = useMemo(
    () => ({
      favoriteIds,
      favoritesCount,
      isLoading,
      isFavorite,
      toggleFavorite,
      clearFavorites,
      favoritesList,
      fetchFavoritesList,
      isLoadingList,
    }),
    [
      favoriteIds,
      favoritesCount,
      isLoading,
      isFavorite,
      toggleFavorite,
      clearFavorites,
      favoritesList,
      fetchFavoritesList,
      isLoadingList,
    ]
  );

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}
