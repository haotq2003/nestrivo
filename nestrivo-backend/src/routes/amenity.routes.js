import { Router } from "express";
import { getAllAmenities } from "../controller/amenity.controller.js";
import { cacheResponse } from "../middleware/cache.middleware.js";

const router = Router();

// API công khai không cần token (cache 30 phút vì danh mục tiện ích ít thay đổi)
router.get("/", cacheResponse("amenities", 1800), getAllAmenities);

export default router;
