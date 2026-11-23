import { Router } from "express";
import {
  getPublicListings,
  getPublicListingById,
  getCompareListings,
} from "../controller/public.listing.controller.js";
import { cacheResponse } from "../middleware/cache.middleware.js";

const router = Router();

// Toàn bộ các route dưới đây là CÔNG KHAI (Guest & Renter không cần đăng nhập)
router.get("/compare", cacheResponse("listings", 180), getCompareListings);
router.get("/", cacheResponse("listings", 180), getPublicListings);
router.get("/:id", cacheResponse("listings", 300), getPublicListingById);

export default router;
