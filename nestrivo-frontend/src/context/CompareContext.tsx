"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { ListingItem } from "@/types/listing";

const STORAGE_KEY = "nestrivo_compare_items";
const MAX_COMPARE_LIMIT = 4;

export interface CompareItemSummary {
  id: string;
  title: string;
  price: number | string;
  images?: { imageUrl: string }[];
  city: string;
  district?: string;
  propertyType?: string;
  area?: number | string;
}

interface CompareContextType {
  compareItems: CompareItemSummary[];
  compareCount: number;
  compareIds: string[];
  isInCompare: (id: string) => boolean;
  addToCompare: (item: ListingItem | CompareItemSummary) => { success: boolean; message: string };
  removeFromCompare: (id: string) => void;
  toggleCompare: (item: ListingItem | CompareItemSummary) => { success: boolean; message: string; isAdded: boolean };
  clearCompare: () => void;
  maxLimit: number;
}

const CompareContext = createContext<CompareContextType>({
  compareItems: [],
  compareCount: 0,
  compareIds: [],
  isInCompare: () => false,
  addToCompare: () => ({ success: false, message: "" }),
  removeFromCompare: () => {},
  toggleCompare: () => ({ success: false, message: "", isAdded: false }),
  clearCompare: () => {},
  maxLimit: MAX_COMPARE_LIMIT,
});

export const useCompare = () => useContext(CompareContext);

export function CompareProvider({ children }: { children: React.ReactNode }) {
  const [compareItems, setCompareItems] = useState<CompareItemSummary[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  // Khởi tạo từ localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setCompareItems(parsed.slice(0, MAX_COMPARE_LIMIT));
        }
      }
    } catch (e) {
      console.warn("Không thể đọc danh sách so sánh từ localStorage:", e);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  // Lưu vào localStorage khi có thay đổi
  const saveToStorage = useCallback((items: CompareItemSummary[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.warn("Không thể lưu danh sách so sánh vào localStorage:", e);
    }
  }, []);

  const isInCompare = useCallback(
    (id: string) => {
      return compareItems.some((item) => item.id === id);
    },
    [compareItems]
  );

  const addToCompare = useCallback(
    (item: ListingItem | CompareItemSummary) => {
      if (isInCompare(item.id)) {
        return { success: false, message: "Phòng trọ này đã có trong danh sách so sánh." };
      }

      if (compareItems.length >= MAX_COMPARE_LIMIT) {
        return {
          success: false,
          message: `Bạn chỉ có thể so sánh tối đa ${MAX_COMPARE_LIMIT} phòng trọ cùng lúc.`,
        };
      }

      const summary: CompareItemSummary = {
        id: item.id,
        title: item.title,
        price: item.price,
        images: item.images ? [{ imageUrl: item.images[0]?.imageUrl || "" }] : [],
        city: item.city,
        district: item.district,
        propertyType: item.propertyType,
        area: item.area,
      };

      const updated = [...compareItems, summary];
      setCompareItems(updated);
      saveToStorage(updated);
      return { success: true, message: `Đã thêm vào danh sách so sánh (${updated.length}/${MAX_COMPARE_LIMIT}).` };
    },
    [compareItems, isInCompare, saveToStorage]
  );

  const removeFromCompare = useCallback(
    (id: string) => {
      const updated = compareItems.filter((item) => item.id !== id);
      setCompareItems(updated);
      saveToStorage(updated);
    },
    [compareItems, saveToStorage]
  );

  const toggleCompare = useCallback(
    (item: ListingItem | CompareItemSummary) => {
      if (isInCompare(item.id)) {
        removeFromCompare(item.id);
        return { success: true, message: "Đã xóa khỏi danh sách so sánh.", isAdded: false };
      } else {
        const res = addToCompare(item);
        return { success: res.success, message: res.message, isAdded: res.success };
      }
    },
    [addToCompare, isInCompare, removeFromCompare]
  );

  const clearCompare = useCallback(() => {
    setCompareItems([]);
    saveToStorage([]);
  }, [saveToStorage]);

  const compareCount = compareItems.length;
  const compareIds = useMemo(() => compareItems.map((i) => i.id), [compareItems]);

  const value = useMemo(
    () => ({
      compareItems,
      compareCount,
      compareIds,
      isInCompare,
      addToCompare,
      removeFromCompare,
      toggleCompare,
      clearCompare,
      maxLimit: MAX_COMPARE_LIMIT,
    }),
    [
      compareItems,
      compareCount,
      compareIds,
      isInCompare,
      addToCompare,
      removeFromCompare,
      toggleCompare,
      clearCompare,
    ]
  );

  return <CompareContext.Provider value={value}>{children}</CompareContext.Provider>;
}
