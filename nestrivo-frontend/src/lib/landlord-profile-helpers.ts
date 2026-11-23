import { LandlordProfileData, DEFAULT_LANDLORD_PROFILE } from "@/types/profile";

export const PROFILE_STORAGE_KEY = "nestrivo_landlord_profile_v1";

export const POPULAR_OPERATING_AREAS = [
  "Bình Thạnh, TP. Hồ Chí Minh",
  "Quận 1, TP. Hồ Chí Minh",
  "Quận 3, TP. Hồ Chí Minh",
  "Quận 7, TP. Hồ Chí Minh",
  "TP. Thủ Đức, TP. Hồ Chí Minh",
  "Phú Nhuận, TP. Hồ Chí Minh",
  "Cầu Giấy, Hà Nội",
  "Đống Đa, Hà Nội",
  "Thanh Xuân, Hà Nội",
  "Hải Châu, Đà Nẵng",
];

export function loadStoredProfile(): LandlordProfileData {
  if (typeof window === "undefined") {
    return DEFAULT_LANDLORD_PROFILE;
  }
  try {
    const raw = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.email) {
        return {
          ...DEFAULT_LANDLORD_PROFILE,
          ...parsed,
        };
      }
    }
  } catch {
    // Ignore JSON error
  }
  return DEFAULT_LANDLORD_PROFILE;
}

export function saveStoredProfile(profile: LandlordProfileData): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
  } catch {
    // Ignore quota error
  }
}

export function formatAccountCreatedDate(isoString?: string): string {
  if (!isoString) return "Chưa xác định";
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return "Chưa xác định";
    const day = d.getDate().toString().padStart(2, "0");
    const month = (d.getMonth() + 1).toString().padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return "Chưa xác định";
  }
}

