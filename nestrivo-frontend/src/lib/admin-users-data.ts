import { AdminUserItem } from "@/types/admin";

export const ADMIN_USERS_STORAGE_KEY = "nestrivo_admin_users_v1";

export const INITIAL_ADMIN_USERS: AdminUserItem[] = [
  {
    id: "usr-admin-1",
    fullName: "Quản Trị Viên Hệ Thống",
    email: "admin@nestrivo.vn",
    phoneNumber: "0900000001",
    role: "ADMIN",
    status: "ACTIVE",
    verificationStatus: "VERIFIED",
    createdAt: "2026-08-01T08:00:00.000Z",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
    totalListings: 0,
    reportsReceived: 0,
  },
  {
    id: "landlord-1",
    fullName: "Nguyễn Văn Hùng",
    email: "hung.apartment@nestrivo.vn",
    phoneNumber: "0901234567",
    role: "LANDLORD",
    status: "ACTIVE",
    verificationStatus: "VERIFIED",
    createdAt: "2026-10-15T08:30:00.000Z",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
    totalListings: 4,
    reportsReceived: 0,
  },
  {
    id: "landlord-2",
    fullName: "Trần Minh Tâm",
    email: "service@pmh.vn",
    phoneNumber: "0987654321",
    role: "LANDLORD",
    status: "ACTIVE",
    verificationStatus: "VERIFIED",
    createdAt: "2026-09-10T09:00:00.000Z",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
    totalListings: 3,
    reportsReceived: 1,
  },
  {
    id: "landlord-3",
    fullName: "Lê Hoàng Long",
    email: "long.tro@nestrivo.vn",
    phoneNumber: "0912888999",
    role: "LANDLORD",
    status: "ACTIVE",
    verificationStatus: "VERIFIED",
    createdAt: "2026-08-01T10:00:00.000Z",
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80",
    totalListings: 2,
    reportsReceived: 0,
  },
  {
    id: "landlord-bad-1",
    fullName: "Hoàng Văn Nam",
    email: "nam.fake@gmail.com",
    phoneNumber: "0987111222",
    role: "LANDLORD",
    status: "LOCKED",
    verificationStatus: "REJECTED",
    createdAt: "2026-10-20T11:00:00.000Z",
    avatarUrl: null,
    totalListings: 1,
    reportsReceived: 4,
    lockReason: "Cố tình niêm yết giá ảo và thu tiền cọc trước khi dẫn khách xem phòng.",
    lockedAt: "2026-11-02T14:30:00.000Z",
  },
  {
    id: "renter-1",
    fullName: "Lê Minh Tuấn",
    email: "renter.leminh@nestrivo.vn",
    phoneNumber: "0933444555",
    role: "RENTER",
    status: "ACTIVE",
    verificationStatus: "VERIFIED",
    createdAt: "2026-10-25T14:00:00.000Z",
    avatarUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80",
    totalListings: 0,
    reportsReceived: 0,
  },
  {
    id: "renter-2",
    fullName: "Nguyễn Thị Mai Hoa",
    email: "hoa.nguyen22@gmail.com",
    phoneNumber: "0918777888",
    role: "RENTER",
    status: "ACTIVE",
    verificationStatus: "NOT_VERIFIED",
    createdAt: "2026-11-01T09:15:00.000Z",
    avatarUrl: null,
    totalListings: 0,
    reportsReceived: 0,
  },
  {
    id: "renter-3",
    fullName: "Phạm Quốc Bảo",
    email: "bao.pham@techcorp.vn",
    phoneNumber: "0944556677",
    role: "RENTER",
    status: "ACTIVE",
    verificationStatus: "VERIFIED",
    createdAt: "2026-10-18T16:45:00.000Z",
    avatarUrl: null,
    totalListings: 0,
    reportsReceived: 0,
  },
];

export function getStoredAdminUsers(): AdminUserItem[] {
  if (typeof window === "undefined") return INITIAL_ADMIN_USERS;
  try {
    const raw = localStorage.getItem(ADMIN_USERS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(ADMIN_USERS_STORAGE_KEY, JSON.stringify(INITIAL_ADMIN_USERS));
      return INITIAL_ADMIN_USERS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_ADMIN_USERS;
  } catch {
    return INITIAL_ADMIN_USERS;
  }
}

export function saveStoredAdminUsers(users: AdminUserItem[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(ADMIN_USERS_STORAGE_KEY, JSON.stringify(users));
  } catch {
    // Ignore quota error
  }
}

export function toggleUserLock(userId: string, reason?: string): { success: boolean; message: string; user?: AdminUserItem } {
  const users = getStoredAdminUsers();
  const index = users.findIndex((u) => u.id === userId);
  if (index === -1) {
    return { success: false, message: "Không tìm thấy người dùng." };
  }

  const currentUser = users[index];
  if (currentUser.role === "ADMIN") {
    return { success: false, message: "Không thể khóa tài khoản Quản trị viên hệ thống." };
  }

  const nextStatus = currentUser.status === "ACTIVE" ? "LOCKED" : "ACTIVE";
  const updated: AdminUserItem = {
    ...currentUser,
    status: nextStatus,
    lockReason: nextStatus === "LOCKED" ? (reason || "Vi phạm quy chế minh bạch của sàn Nestrivo") : null,
    lockedAt: nextStatus === "LOCKED" ? new Date().toISOString() : null,
  };

  users[index] = updated;
  saveStoredAdminUsers(users);

  return {
    success: true,
    message: nextStatus === "LOCKED" 
      ? `Đã khóa tài khoản "${currentUser.fullName}".` 
      : `Đã mở khóa tài khoản "${currentUser.fullName}".`,
    user: updated,
  };
}

