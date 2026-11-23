import { AuthUser } from "@/types/auth";

export interface DemoAccountItem {
  roleLabel: string;
  email: string;
  password: string;
  badgeColor: string;
  user: AuthUser;
}

/**
 * Danh sách tài khoản mẫu (Demo Accounts) phục vụ kiểm thử nhanh
 */
export const DEMO_ACCOUNTS: DemoAccountItem[] = [
  {
    roleLabel: "Quản trị viên (Admin)",
    email: "admin@nestrivo.vn",
    password: "Admin@123456",
    badgeColor: "bg-slate-900 text-white",
    user: {
      id: "admin-super-1",
      email: "admin@nestrivo.vn",
      fullName: "Quản Trị Viên Hệ Thống",
      phoneNumber: "0900000000",
      avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80",
      roles: ["ADMIN"],
      isActive: true,
      landlordProfile: null,
    },
  },
  {
    roleLabel: "Chủ nhà (Landlord)",
    email: "hung.apartment@nestrivo.vn",
    password: "Landlord@123",
    badgeColor: "bg-[#F4CD65] text-[#373523]",
    user: {
      id: "landlord-hung-1",
      email: "hung.apartment@nestrivo.vn",
      fullName: "Nguyễn Văn Hùng",
      phoneNumber: "0901234567",
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
      roles: ["RENTER", "LANDLORD"],
      isActive: true,
      landlordProfile: {
        id: "lp-1",
        displayName: "Hùng Apartment",
        description: "Chủ nhà chuyên quản lý căn hộ dịch vụ và studio",
        verificationStatus: "VERIFIED",
      },
    },
  },
  {
    roleLabel: "Khách thuê (Renter)",
    email: "renter.leminh@nestrivo.vn",
    password: "Renter@123",
    badgeColor: "bg-blue-600 text-white",
    user: {
      id: "renter-leminh-1",
      email: "renter.leminh@nestrivo.vn",
      fullName: "Lê Minh Tuấn",
      phoneNumber: "0987654321",
      avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80",
      roles: ["RENTER"],
      isActive: true,
      landlordProfile: null,
    },
  },
];

