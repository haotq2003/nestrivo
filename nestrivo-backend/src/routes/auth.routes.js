import { Router } from "express";
import {
  register,
  login,
  getMe,
  updateProfile,
  submitKycVerification,
  getKycStatus,
} from "../controller/auth.controller.js";
import { authenticateToken } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", authenticateToken, getMe);
router.put("/profile", authenticateToken, updateProfile);

// Landlord eKYC Verification
router.post("/verification", authenticateToken, submitKycVerification);
router.get("/verification", authenticateToken, getKycStatus);

export default router;
