export interface LandlordProfileData {
  id?: string;
  avatarUrl: string | null;
  fullName: string;
  displayName?: string | null;
  email: string;
  phoneNumber: string;
  contactAddress: string;
  createdAt: string; // ISO 8601 creation timestamp
  introduction: string; // Personal introduction, max 300 chars
  operatingAreas: string[]; // List of areas where landlord operates
  verificationStatus: "VERIFIED" | "PENDING" | "REJECTED" | "NOT_VERIFIED";
}

export const DEFAULT_LANDLORD_PROFILE: LandlordProfileData = {
  id: "landlord-hung-1",
  avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80",
  fullName: "Nguyễn Văn Hùng",
  displayName: "Hùng Apartment",
  email: "hung.apartment@nestrivo.vn",
  phoneNumber: "0901234567",
  contactAddress: "48/12 Điện Biên Phủ, Phường 25, Quận Bình Thạnh, TP. Hồ Chí Minh",
  createdAt: "2026-10-15T08:30:00.000Z",
  introduction: "Chủ nhà chuyên quản lý chuỗi phòng studio và căn hộ dịch vụ cao cấp tại TP. Hồ Chí Minh. Cam kết thông tin minh bạch, hợp đồng pháp lý rõ ràng và hỗ trợ kỹ thuật cư dân 24/7.",
  operatingAreas: [
    "Bình Thạnh, TP. Hồ Chí Minh",
    "Quận 7, TP. Hồ Chí Minh",
    "Quận 1, TP. Hồ Chí Minh",
  ],
  verificationStatus: "VERIFIED",
};

