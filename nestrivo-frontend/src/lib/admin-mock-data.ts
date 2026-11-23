import { AdminListingItem } from "@/types/admin";

export const ADMIN_STORAGE_KEY = "nestrivo_admin_moderation_listings_v1";

/**
 * Danh sách tin kiểm duyệt ban đầu (Đã dọn dẹp để kết nối trực tiếp với Database API)
 */
export const INITIAL_ADMIN_LISTINGS: AdminListingItem[] = [];

export const PRESET_REJECTION_REASONS: string[] = [
  "Hình ảnh phòng mờ, chất lượng thấp hoặc chứa hình ảnh minh họa không đúng thực tế.",
  "Giá thuê hoặc các khoản chi phí dịch vụ (điện, nước, internet...) chưa rõ ràng, minh bạch.",
  "Địa chỉ phòng trọ không tồn tại hoặc sai lệch so với vị trí thực tế.",
  "Nội dung mô tả chứa thông tin sai lệch, chèn link quảng cáo ngoài hoặc vi phạm chính sách.",
  "Chủ nhà chưa hoàn tất xác minh danh tính (KYC) hoặc giấy tờ tùy thân chưa hợp lệ.",
];

export const REJECTION_QUICK_REASONS = PRESET_REJECTION_REASONS;

export function loadStoredAdminListings(): AdminListingItem[] {
  if (typeof window === "undefined") {
    return [];
  }
  try {
    const raw = localStorage.getItem(ADMIN_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch {
    // Ignore parse error
  }
  return [];
}

export function saveStoredAdminListings(listings: AdminListingItem[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(listings));
  } catch {
    // Ignore storage quota
  }
}
