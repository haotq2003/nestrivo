import express from "express";
import { authenticateToken } from "../middleware/auth.middleware.js";
import {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from "../controller/notification.controller.js";

const router = express.Router();

// Tất cả các route thông báo đều yêu cầu đăng nhập
router.use(authenticateToken);

// GET /api/notifications - Lấy danh sách thông báo
router.get("/", getMyNotifications);

// PATCH /api/notifications/mark-all-read - Đánh dấu tất cả đã đọc
router.patch("/mark-all-read", markAllAsRead);

// PATCH /api/notifications/:id/read - Đánh dấu 1 thông báo đã đọc
router.patch("/:id/read", markAsRead);

// DELETE /api/notifications/:id - Xóa 1 thông báo
router.delete("/:id", deleteNotification);

export default router;
