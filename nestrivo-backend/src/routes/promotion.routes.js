import { Router } from "express";
import {
  getPromotionPlans,
  createPromotionOrder,
  payPromotionOrder,
  getMyPromotionOrders,
  getAdminPromotionOrders,
  createMoMoPaymentForOrder,
  getPromotionOrderStatus,
  handleMoMoIpn,
  handleMoMoReturn,
  getAdminPromotionPlans,
  createAdminPromotionPlan,
  updateAdminPromotionPlan,
  toggleAdminPromotionPlanStatus,
  deleteAdminPromotionPlan,
} from "../controller/promotion.controller.js";
import { authenticateToken, requireAdmin } from "../middleware/auth.middleware.js";

const router = Router();

// Public: Xem danh sách gói quảng bá
router.get("/plans", getPromotionPlans);

// Landlord: Đặt mua & thanh toán gói quảng bá
router.post("/orders", authenticateToken, createPromotionOrder);
router.post("/orders/:orderId/pay", authenticateToken, payPromotionOrder);
router.post("/orders/:orderId/momo", authenticateToken, createMoMoPaymentForOrder);
router.get("/orders/:orderId/status", authenticateToken, getPromotionOrderStatus);
router.get("/orders/my", authenticateToken, getMyPromotionOrders);

// MoMo Webhook IPN & Return Redirect
router.post("/momo-ipn", handleMoMoIpn);
router.post("/momo-return", handleMoMoReturn);

// Admin: Quản lý đơn hàng & Báo cáo doanh thu
router.get("/admin/orders", authenticateToken, requireAdmin, getAdminPromotionOrders);

// Admin: CRUD Cấu hình các Gói tin quảng bá
router.get("/admin/plans", authenticateToken, requireAdmin, getAdminPromotionPlans);
router.post("/admin/plans", authenticateToken, requireAdmin, createAdminPromotionPlan);
router.put("/admin/plans/:id", authenticateToken, requireAdmin, updateAdminPromotionPlan);
router.patch("/admin/plans/:id/toggle", authenticateToken, requireAdmin, toggleAdminPromotionPlanStatus);
router.delete("/admin/plans/:id", authenticateToken, requireAdmin, deleteAdminPromotionPlan);

export default router;

