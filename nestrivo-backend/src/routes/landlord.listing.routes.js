import { Router } from "express";
import {
  createListing,
  getMyListings,
  getMyListingById,
  updateListing,
  submitForReview,
  updateAvailability,
  toggleVisibility,
  deleteListing,
} from "../controller/landlord.listing.controller.js";
import {
  authenticateToken,
  authorizeRoles,
} from "../middleware/auth.middleware.js";
import { invalidateCacheOnSuccess } from "../middleware/cache.middleware.js";

const router = Router();

// Toàn bộ các route dưới đây yêu cầu phải Đăng nhập và có quyền LANDLORD
router.use(authenticateToken);
router.use(authorizeRoles("LANDLORD"));

// 1. Tạo tin đăng mới (Nháp hoặc gửi duyệt)
router.post("/", invalidateCacheOnSuccess("listings", "amenities"), createListing);

// 2. Lấy danh sách tin của chính mình (phân trang, lọc theo status)
router.get("/", getMyListings);

// 3. Xem chi tiết 1 tin của mình (để xem hoặc sửa)
router.get("/:id", getMyListingById);

// 4. Chỉnh sửa nội dung tin đăng
router.put("/:id", invalidateCacheOnSuccess("listings", "amenities"), updateListing);

// 5. Gửi duyệt tin (DRAFT / REJECTED -> PENDING_APPROVAL)
router.patch("/:id/submit", invalidateCacheOnSuccess("listings"), submitForReview);

// 6. Cập nhật tình trạng phòng (AVAILABLE <-> RENTED)
router.patch("/:id/availability", invalidateCacheOnSuccess("listings"), updateAvailability);

// 7. Ẩn / Hiện tin đăng (PUBLISHED <-> HIDDEN)
router.patch("/:id/visibility", invalidateCacheOnSuccess("listings"), toggleVisibility);

// 8. Xóa tin đăng (DRAFT hoặc REJECTED)
router.delete("/:id", invalidateCacheOnSuccess("listings"), deleteListing);

export default router;
