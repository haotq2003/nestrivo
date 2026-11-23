import { Router } from "express";
import {
  toggleFavorite,
  getMyFavorites,
  getMyFavoriteIds,
  clearAllFavorites,
} from "../controller/favorite.controller.js";
import { authenticateToken } from "../middleware/auth.middleware.js";

const router = Router();

// Toàn bộ các route yêu cầu đăng nhập tài khoản (Khách thuê hoặc Chủ nhà)
router.use(authenticateToken);

// 1. Lấy danh sách toàn bộ tin đã lưu
router.get("/", getMyFavorites);

// 2. Lấy danh sách mảng ID tin đã lưu
router.get("/ids", getMyFavoriteIds);

// 3. Toggle lưu / bỏ lưu tin
router.post("/toggle/:listingId", toggleFavorite);

// 4. Xóa tất cả tin đã lưu
router.delete("/clear", clearAllFavorites);

export default router;
