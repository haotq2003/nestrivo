import { Router } from "express";
import {
  getPendingListings,
  getAdminListingById,
  approveListing,
  rejectListing,
  toggleHideListing,
  getAllListings,
  getPendingVerifications,
  approveLandlordVerification,
  rejectLandlordVerification,
} from "../controller/admin.listing.controller.js";
import {
  authenticateToken,
  authorizeRoles,
} from "../middleware/auth.middleware.js";
import { invalidateCacheOnSuccess } from "../middleware/cache.middleware.js";

const router = Router();

// Toàn bộ các route dưới đây yêu cầu phải Đăng nhập và có quyền ADMIN
router.use(authenticateToken);
router.use(authorizeRoles("ADMIN"));

// --- Moderation: Hồ sơ xác minh chủ nhà (eKYC) ---
router.get("/verifications", getPendingVerifications);
router.patch("/verifications/:userId/approve", invalidateCacheOnSuccess("listings"), approveLandlordVerification);
router.patch("/verifications/:userId/reject", invalidateCacheOnSuccess("listings"), rejectLandlordVerification);

// --- Moderation: Tin đăng phòng trọ ---
// 1. Lấy danh sách tin đang chờ duyệt trên toàn hệ thống
router.get("/pending", getPendingListings);

// 2. Lấy toàn bộ danh sách tin trên hệ thống (lọc theo status, propertyType, city...)
router.get("/", getAllListings);

// 3. Xem chi tiết 1 tin đăng bất kỳ để Admin kiểm tra
router.get("/:id", getAdminListingById);

// 4. Phê duyệt tin đăng (PUBLISHED)
router.patch("/:id/approve", invalidateCacheOnSuccess("listings"), approveListing);

// 5. Từ chối tin đăng kèm lý do (REJECTED)
router.patch("/:id/reject", invalidateCacheOnSuccess("listings"), rejectListing);

// 6. Cưỡng chế ẩn tin vi phạm hoặc khôi phục (HIDDEN <-> PUBLISHED)
router.patch("/:id/hide", invalidateCacheOnSuccess("listings"), toggleHideListing);

export default router;
