import { Router } from "express";
import {
  createReview,
  getLandlordReviews,
  getListingReviews,
  checkReviewEligibility,
  replyToReview,
  reportReview,
  getAdminReviewReports,
  resolveReviewReport,
  createRentalConfirmation,
} from "../controller/review.controller.js";
import { authenticateToken, requireAdmin } from "../middleware/auth.middleware.js";

const router = Router();

// Public: Xem đánh giá và thống kê uy tín chủ nhà
router.get("/landlords/:landlordId", getLandlordReviews);

// Public: Xem đánh giá trải nghiệm của tin đăng (Listing Reviews / Viewing Reviews)
router.get("/listings/:listingId", getListingReviews);

// Renter: Kiểm tra quyền đánh giá (có lịch xem phòng hợp lệ không)
router.get("/check-eligibility/:listingId", authenticateToken, checkReviewEligibility);

// Renter: Tạo đánh giá (Cần đăng nhập)
router.post("/", authenticateToken, createReview);

// Landlord: Trả lời đánh giá & Báo cáo đánh giá xấu
router.post("/:id/reply", authenticateToken, replyToReview);
router.post("/:id/report", authenticateToken, reportReview);

// Rental Confirmation: Xác nhận khách thuê phòng
router.post("/rentals/confirm", authenticateToken, createRentalConfirmation);

// Admin: Duyệt báo cáo đánh giá
router.get("/admin/reports", authenticateToken, requireAdmin, getAdminReviewReports);
router.patch("/admin/reports/:id/resolve", authenticateToken, requireAdmin, resolveReviewReport);

export default router;

