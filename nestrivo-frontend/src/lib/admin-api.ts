import { AdminListingItem } from "@/types/admin";
import { 
  loadStoredAdminListings, 
  saveStoredAdminListings 
} from "@/lib/admin-mock-data";
import { LandlordListingItem } from "@/types/landlord";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
const LANDLORD_STORAGE_KEY = "nestrivo_landlord_listings_v1";

function getAuthHeader(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const token = localStorage.getItem("nestrivo_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Helper to synchronize local landlord store
function syncToLandlordStorage(listingId: string, status: "PUBLISHED" | "REJECTED" | "HIDDEN", reason?: string | null) {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(LANDLORD_STORAGE_KEY);
    if (!raw) return;
    const list: LandlordListingItem[] = JSON.parse(raw);
    const updated = list.map((item) => {
      if (item.id === listingId) {
        return {
          ...item,
          status,
          rejectionReason: status === "REJECTED" ? (reason || null) : null,
          updatedAt: new Date().toISOString(),
          publishedAt: status === "PUBLISHED" ? new Date().toISOString() : item.publishedAt,
        };
      }
      return item;
    });
    localStorage.setItem(LANDLORD_STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // Ignore error
  }
}

export async function fetchAdminListings(): Promise<AdminListingItem[]> {
  try {
    const headers = getAuthHeader();
    if (headers.Authorization) {
      const res = await fetch(`${API_BASE_URL}/admin/listings?limit=50`, {
        headers: {
          "Content-Type": "application/json",
          ...headers,
        },
      });
      if (res.ok) {
        const json = await res.json();
        if (Array.isArray(json.data)) {
          return json.data;
        }
      }
    }
  } catch {
    // Fallback on network or auth error
  }
  return loadStoredAdminListings();
}

export async function approveListing(id: string): Promise<{ success: boolean; message: string; listing?: AdminListingItem }> {
  try {
    const headers = getAuthHeader();
    if (headers.Authorization) {
      const res = await fetch(`${API_BASE_URL}/admin/listings/${id}/approve`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...headers,
        },
      });
      if (res.ok) {
        const data = await res.json();
        syncToLandlordStorage(id, "PUBLISHED", null);
        return { success: true, message: data.message || "Phê duyệt tin thành công!", listing: data.listing };
      }
    }
  } catch {
    // Fallback to local storage update
  }

  // Local storage update fallback
  const listings = loadStoredAdminListings();
  const index = listings.findIndex((item) => item.id === id);
  if (index === -1) {
    return { success: false, message: "Không tìm thấy tin đăng trong hàng đợi." };
  }

  const updated: AdminListingItem = {
    ...listings[index],
    status: "PUBLISHED",
    publishedAt: new Date().toISOString(),
    rejectionReason: null,
    updatedAt: new Date().toISOString(),
  };

  listings[index] = updated;
  saveStoredAdminListings(listings);
  syncToLandlordStorage(id, "PUBLISHED", null);

  return { success: true, message: "Phê duyệt tin đăng thành công! Tin đã xuất bản.", listing: updated };
}

export async function rejectListing(id: string, reason: string): Promise<{ success: boolean; message: string; listing?: AdminListingItem }> {
  const trimmed = reason.trim();
  if (trimmed.length < 5) {
    return { success: false, message: "Vui lòng nhập lý do từ chối cụ thể (tối thiểu 5 ký tự)." };
  }

  try {
    const headers = getAuthHeader();
    if (headers.Authorization) {
      const res = await fetch(`${API_BASE_URL}/admin/listings/${id}/reject`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...headers,
        },
        body: JSON.stringify({ rejectionReason: trimmed }),
      });
      if (res.ok) {
        const data = await res.json();
        syncToLandlordStorage(id, "REJECTED", trimmed);
        return { success: true, message: data.message || "Đã từ chối tin đăng.", listing: data.listing };
      }
    }
  } catch {
    // Fallback to local storage update
  }

  // Local storage fallback
  const listings = loadStoredAdminListings();
  const index = listings.findIndex((item) => item.id === id);
  if (index === -1) {
    return { success: false, message: "Không tìm thấy tin đăng trong hàng đợi." };
  }

  const updated: AdminListingItem = {
    ...listings[index],
    status: "REJECTED",
    rejectionReason: trimmed,
    updatedAt: new Date().toISOString(),
  };

  listings[index] = updated;
  saveStoredAdminListings(listings);
  syncToLandlordStorage(id, "REJECTED", trimmed);

  return { success: true, message: "Đã từ chối tin đăng và gửi thông báo lý do đến chủ nhà.", listing: updated };
}

export async function hideListing(id: string, reason?: string): Promise<{ success: boolean; message: string; listing?: AdminListingItem }> {
  try {
    const headers = getAuthHeader();
    if (headers.Authorization) {
      const res = await fetch(`${API_BASE_URL}/admin/listings/${id}/hide`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...headers,
        },
        body: JSON.stringify({ reason }),
      });
      if (res.ok) {
        const data = await res.json();
        syncToLandlordStorage(id, "HIDDEN", reason);
        return { success: true, message: data.message || "Đã tạm ẩn tin đăng khỏi sàn.", listing: data.listing };
      }
    }
  } catch {
    // Fallback to local storage update
  }

  const listings = loadStoredAdminListings();
  const index = listings.findIndex((item) => item.id === id);
  if (index === -1) {
    return { success: false, message: "Không tìm thấy tin đăng." };
  }

  const updated: AdminListingItem = {
    ...listings[index],
    status: "HIDDEN",
    updatedAt: new Date().toISOString(),
  };

  listings[index] = updated;
  saveStoredAdminListings(listings);
  syncToLandlordStorage(id, "HIDDEN", reason);

  return { success: true, message: "Đã tạm ẩn tin đăng khỏi sàn.", listing: updated };
}
