import express from "express";
import {
  authenticateToken,
  requireAdmin,
} from "../middleware/auth.middleware.js";
import {
  createReport,
  getMyReports,
  getLandlordListingReports,
  getAdminReports,
  getAdminReportDetail,
  resolveReport,
} from "../controller/report.controller.js";

const router = express.Router();

// 1. Người dùng gửi báo cáo (Cần đăng nhập)
router.post("/", authenticateToken, createReport);

// 2. Lấy danh sách báo cáo của chính mình (Người thuê xem báo cáo mình đã gửi)
router.get("/my-reports", authenticateToken, getMyReports);

// 2b. [Chủ nhà] Xem các báo cáo & kết luận xử lý từ Admin đối với tin đăng của mình
router.get("/landlord/my-listing-reports", authenticateToken, getLandlordListingReports);

// 3. [Admin] Quản lý & xử lý các báo cáo vi phạm
router.get("/admin", authenticateToken, requireAdmin, getAdminReports);
router.get("/admin/:id", authenticateToken, requireAdmin, getAdminReportDetail);
router.patch("/admin/:id/resolve", authenticateToken, requireAdmin, resolveReport);

export default router;
