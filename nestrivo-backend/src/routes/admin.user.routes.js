import express from "express";
import {
  authenticateToken,
  requireAdmin,
} from "../middleware/auth.middleware.js";
import {
  getAdminUsers,
  getAdminUserDetail,
  toggleUserLock,
  updateUserRoles,
  updateUserKyc,
  createAdminUser,
  updateAdminUser,
} from "../controller/admin.user.controller.js";

const router = express.Router();

// Tất cả các route quản lý tài khoản đều yêu cầu quyền Admin
router.use(authenticateToken, requireAdmin);

// 1. Danh sách người dùng (tìm kiếm, lọc, phân trang, thống kê KPI)
router.get("/", getAdminUsers);

// 2. Tạo mới tài khoản người dùng
router.post("/", createAdminUser);

// 3. Chi tiết tài khoản
router.get("/:id", getAdminUserDetail);

// 4. Cập nhật thông tin cơ bản
router.put("/:id", updateAdminUser);

// 5. Khóa hoặc Mở khóa tài khoản
router.patch("/:id/lock", toggleUserLock);

// 6. Cập nhật vai trò (roles)
router.patch("/:id/roles", updateUserRoles);

// 7. Cập nhật trạng thái KYC
router.patch("/:id/kyc", updateUserKyc);

export default router;
