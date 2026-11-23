import { LandlordListingItem } from "@/types/landlord";

/**
 * Danh sách tin ban đầu của chủ nhà (Đã dọn dẹp để kết nối trực tiếp với Database API)
 */
export const INITIAL_LANDLORD_LISTINGS: LandlordListingItem[] = [];

export const MOCK_LANDLORD_PROFILE = {
  fullName: "Chủ Nhà",
  displayName: "Hồ Sơ Chủ Nhà",
  email: "landlord@nestrivo.vn",
  phoneNumber: "0900000000",
  verificationStatus: "VERIFIED" as const,
  joinedDate: "2026",
};
