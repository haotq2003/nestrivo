import { ListingItem } from "@/types/listing";
import { FALLBACK_LISTINGS } from "@/lib/fallback-data";

export interface PublicLandlordProfile {
  id: string;
  fullName: string;
  displayName: string;
  avatarUrl: string;
  email: string;
  phoneNumber: string;
  contactAddress: string;
  joinedDate: string;
  createdAt: string;
  introduction: string;
  operatingAreas: string[];
  verificationStatus: "VERIFIED" | "PENDING" | "NOT_VERIFIED";
  responseRate: string;
  responseTime: string;
}

export const KNOWN_PUBLIC_LANDLORDS: Record<string, PublicLandlordProfile> = {
  "landlord-1": {
    id: "landlord-1",
    fullName: "Nguyễn Văn Hùng",
    displayName: "Hùng Apartment",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80",
    email: "hung.apartment@nestrivo.vn",
    phoneNumber: "0901234567",
    contactAddress: "48/12 Điện Biên Phủ, Phường 25, Quận Bình Thạnh, TP. Hồ Chí Minh",
    joinedDate: "Tháng 10, 2026",
    createdAt: "2026-10-15T08:30:00.000Z",
    introduction: "Chủ nhà chuyên quản lý chuỗi phòng studio và căn hộ dịch vụ cao cấp tại TP. Hồ Chí Minh. Cam kết giá niêm yết minh bạch 100%, hợp đồng rõ ràng, không phụ phí ẩn và hỗ trợ kỹ thuật cư dân 24/7.",
    operatingAreas: [
      "Bình Thạnh, TP. Hồ Chí Minh",
      "Quận 7, TP. Hồ Chí Minh",
      "Quận 1, TP. Hồ Chí Minh",
      "Cầu Giấy, Hà Nội",
    ],
    verificationStatus: "VERIFIED",
    responseRate: "99%",
    responseTime: "Dưới 30 phút",
  },
  "landlord-hung-1": {
    id: "landlord-hung-1",
    fullName: "Nguyễn Văn Hùng",
    displayName: "Hùng Apartment",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80",
    email: "hung.apartment@nestrivo.vn",
    phoneNumber: "0901234567",
    contactAddress: "48/12 Điện Biên Phủ, Phường 25, Quận Bình Thạnh, TP. Hồ Chí Minh",
    joinedDate: "Tháng 10, 2026",
    createdAt: "2026-10-15T08:30:00.000Z",
    introduction: "Chủ nhà chuyên quản lý chuỗi phòng studio và căn hộ dịch vụ cao cấp tại TP. Hồ Chí Minh. Cam kết giá niêm yết minh bạch 100%, hợp đồng rõ ràng, không phụ phí ẩn và hỗ trợ kỹ thuật cư dân 24/7.",
    operatingAreas: [
      "Bình Thạnh, TP. Hồ Chí Minh",
      "Quận 7, TP. Hồ Chí Minh",
      "Quận 1, TP. Hồ Chí Minh",
      "Cầu Giấy, Hà Nội",
    ],
    verificationStatus: "VERIFIED",
    responseRate: "99%",
    responseTime: "Dưới 30 phút",
  },
  "landlord-2": {
    id: "landlord-2",
    fullName: "Trần Minh Tâm",
    displayName: "Tâm Landlord",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80",
    email: "service@pmh.vn",
    phoneNumber: "0987654321",
    contactAddress: "Nguyễn Thị Thập, Phường Tân Phú, Quận 7, TP. Hồ Chí Minh",
    joinedDate: "Tháng 09, 2026",
    createdAt: "2026-09-10T09:00:00.000Z",
    introduction: "Quản lý căn hộ dịch vụ cao cấp Phú Mỹ Hưng, chuyên phục vụ chuyên gia, nhân viên văn phòng và người nước ngoài thuê dài hạn. Dịch vụ dọn phòng chuyên nghiệp, an ninh khép kín 24/7.",
    operatingAreas: [
      "Quận 7, TP. Hồ Chí Minh",
      "Quận 4, TP. Hồ Chí Minh",
      "Nhà Bè, TP. Hồ Chí Minh",
    ],
    verificationStatus: "VERIFIED",
    responseRate: "98%",
    responseTime: "Trong vòng 1 giờ",
  },
  "landlord-3": {
    id: "landlord-3",
    fullName: "Lê Hoàng Long",
    displayName: "Long Trọ Sinh Viên",
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80",
    email: "long.tro@nestrivo.vn",
    phoneNumber: "0912888999",
    contactAddress: "Võ Văn Ngân, Phường Linh Chiểu, TP. Thủ Đức, TP. Hồ Chí Minh",
    joinedDate: "Tháng 08, 2026",
    createdAt: "2026-08-01T10:00:00.000Z",
    introduction: "Hệ thống nhà trọ sinh viên gần các trường Đại học Sư Phạm Kỹ Thuật, Ngân Hàng, Nông Lâm. Tiêu chí: Giá rẻ, phòng có gác đúc kiên cố, không tăng giá điện nước bừa bãi.",
    operatingAreas: [
      "TP. Thủ Đức, TP. Hồ Chí Minh",
      "Quận 9, TP. Hồ Chí Minh",
      "Dĩ An, Bình Dương",
    ],
    verificationStatus: "VERIFIED",
    responseRate: "95%",
    responseTime: "Trong vòng 2 giờ",
  },
};

/**
 * Lấy thông tin chủ nhà công khai theo ID
 */
export function getPublicLandlordProfile(id: string): PublicLandlordProfile {
  if (KNOWN_PUBLIC_LANDLORDS[id]) {
    return KNOWN_PUBLIC_LANDLORDS[id];
  }

  // Fallback linh hoạt cho các ID khác
  return {
    id,
    fullName: "Chủ Nhà Nestrivo",
    displayName: "Đối tác cho thuê Nestrivo",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80",
    email: `landlord.${id}@nestrivo.vn`,
    phoneNumber: "0901234567",
    contactAddress: "Hồ Chí Minh, Việt Nam",
    joinedDate: "Tháng 10, 2026",
    createdAt: "2026-10-01T00:00:00.000Z",
    introduction: "Chủ nhà đã tham gia nền tảng Nestrivo, cam kết cung cấp thông tin phòng trọ và chi phí trung thực, minh bạch.",
    operatingAreas: ["Hồ Chí Minh", "Hà Nội", "Đà Nẵng"],
    verificationStatus: "VERIFIED",
    responseRate: "98%",
    responseTime: "Dưới 1 giờ",
  };
}

/**
 * Lấy danh sách tin đăng công khai của một chủ nhà
 */
export function getListingsByLandlordId(landlordId: string): ListingItem[] {
  // Lọc tin mẫu trong FALLBACK_LISTINGS
  const matching = FALLBACK_LISTINGS.filter(
    (item) => item.landlordId === landlordId || item.landlord?.id === landlordId
  );

  // Nếu tìm thấy tin khớp thì trả về, nếu không thì trả về các tin gợi ý của hệ thống để trải nghiệm xem shop luôn phong phú
  if (matching.length > 0) {
    return matching;
  }

  return FALLBACK_LISTINGS.slice(0, 4);
}

