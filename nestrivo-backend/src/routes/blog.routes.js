import { Router } from "express";
import {
  getPublicBlogPosts,
  getBlogPostBySlug,
  getAdminBlogPosts,
  createBlogPost,
  updateBlogPost,
  deleteBlogPost,
  togglePublishStatus,
} from "../controller/blog.controller.js";
import { authenticateToken, requireAdmin } from "../middleware/auth.middleware.js";
import { cacheResponse, invalidateCacheOnSuccess } from "../middleware/cache.middleware.js";

const router = Router();

// ==========================================
// 1. PUBLIC ROUTES (Dành cho khách truy cập)
// ==========================================
// Danh sách bài viết công khai (cache 10 phút)
router.get("/", cacheResponse("blog", 600), getPublicBlogPosts);

// Chi tiết bài viết theo Slug hoặc ID (cache 10 phút)
router.get("/:slugOrId", cacheResponse("blog", 600), getBlogPostBySlug);

// ==========================================
// 2. ADMIN PROTECTED ROUTES (Quản trị viên)
// ==========================================
// Toàn bộ các route phía dưới yêu cầu đăng nhập ADMIN
router.use(authenticateToken);
router.use(requireAdmin);

// Lấy toàn bộ bài viết (kèm nháp)
router.get("/admin/all", getAdminBlogPosts);

// Tạo bài viết mới
router.post("/", invalidateCacheOnSuccess("blog"), createBlogPost);

// Cập nhật bài viết
router.put("/:id", invalidateCacheOnSuccess("blog"), updateBlogPost);

// Xóa bài viết
router.delete("/:id", invalidateCacheOnSuccess("blog"), deleteBlogPost);

// Chuyển đổi trạng thái xuất bản
router.patch("/:id/status", invalidateCacheOnSuccess("blog"), togglePublishStatus);

export default router;
