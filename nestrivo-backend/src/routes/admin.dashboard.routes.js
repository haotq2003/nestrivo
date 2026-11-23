import { Router } from "express";
import { getAdminDashboardStats } from "../controller/admin.dashboard.controller.js";
import {
  authenticateToken,
  authorizeRoles,
} from "../middleware/auth.middleware.js";

const router = Router();

// Yêu cầu xác thực tài khoản và quyền Quản trị viên (ADMIN)
router.use(authenticateToken);
router.use(authorizeRoles("ADMIN"));

// GET /api/admin/dashboard/stats
router.get("/stats", getAdminDashboardStats);

export default router;
