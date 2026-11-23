import { Router } from "express";
import {
  createDispute,
  getMyDisputes,
  getDisputeDetail,
  sendDisputeMessage,
  getAdminDisputes,
  updateDisputeStatus,
} from "../controller/dispute.controller.js";
import { authenticateToken, requireAdmin } from "../middleware/auth.middleware.js";

const router = Router();

// User Routes (Cả Renter & Landlord)
router.post("/", authenticateToken, createDispute);
router.get("/my", authenticateToken, getMyDisputes);
router.get("/:id", authenticateToken, getDisputeDetail);
router.post("/:id/messages", authenticateToken, sendDisputeMessage);

// Admin Moderation Routes
router.get("/admin/queue", authenticateToken, requireAdmin, getAdminDisputes);
router.patch("/admin/:id/status", authenticateToken, requireAdmin, updateDisputeStatus);

export default router;

