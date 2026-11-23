import { Router } from "express";
import {
  createInquiry,
  getLandlordInquiries,
  getLandlordInquiryStats,
  updateInquiryStatus,
  getRenterInquiries,
} from "../controller/inquiry.controller.js";
import { authenticateToken } from "../middleware/auth.middleware.js";

const router = Router();

// Renter gửi yêu cầu & xem danh sách yêu cầu đã gửi
router.post("/", authenticateToken, createInquiry);
router.get("/renter", authenticateToken, getRenterInquiries);

// Landlord quản lý yêu cầu hỏi thuê
router.get("/landlord", authenticateToken, getLandlordInquiries);
router.get("/landlord/stats", authenticateToken, getLandlordInquiryStats);
router.patch("/:id/status", authenticateToken, updateInquiryStatus);

export default router;

