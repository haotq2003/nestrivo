import "dotenv/config";
import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import { prisma } from "./lib/prisma.js";
import { isRedisReady } from "./lib/redis.js";
import authRoutes from "./routes/auth.routes.js";
import landlordListingRoutes from "./routes/landlord.listing.routes.js";
import adminListingRoutes from "./routes/admin.listing.routes.js";
import adminUserRoutes from "./routes/admin.user.routes.js";
import adminDashboardRoutes from "./routes/admin.dashboard.routes.js";
import publicListingRoutes from "./routes/public.listing.routes.js";
import amenityRoutes from "./routes/amenity.routes.js";
import disputeRoutes from "./routes/dispute.routes.js";
import reviewRoutes from "./routes/review.routes.js";
import promotionRoutes from "./routes/promotion.routes.js";
import inquiryRoutes from "./routes/inquiry.routes.js";
import reportRoutes from "./routes/report.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import favoriteRoutes from "./routes/favorite.routes.js";
import blogRoutes from "./routes/blog.routes.js";
import { swaggerDocument } from "./config/swagger.js";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// API Documentation (Swagger UI)
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get("/api/health", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;

    res.json({
      success: true,
      message: "Nestrivo API is running",
      database: "connected",
      redis: isRedisReady() ? "connected" : "fallback",
      docs: `http://localhost:${PORT}/api-docs`,
    });
  } catch (error) {
    console.error("Database connection failed:", error);

    res.status(500).json({
      success: false,
      message: "Database connection failed",
    });
  }
});

// Authentication & Profile
app.use("/api/auth", authRoutes);

// Public Amenities Master Data
app.use("/api/amenities", amenityRoutes);

// Public Listings & Search Engine
app.use("/api/listings", publicListingRoutes);

// Landlord Listings
app.use("/api/landlord/listings", landlordListingRoutes);

// Admin Dashboard & Business Intelligence Analytics
app.use("/api/admin/dashboard", adminDashboardRoutes);

// Admin Listings & Moderation
app.use("/api/admin/listings", adminListingRoutes);

// Admin Users & Account Management
app.use("/api/admin/users", adminUserRoutes);

// Disputes & User Support (Module 3)
app.use("/api/disputes", disputeRoutes);

// Landlord Reputation & Reviews (Module 2)
app.use("/api/reviews", reviewRoutes);

// Listing Promotion & Monetization (Module 4)
app.use("/api/promotions", promotionRoutes);

// Inquiries & Lead Management (Yêu cầu hỏi thuê)
app.use("/api/inquiries", inquiryRoutes);

// Listing Reports & Violation Moderation (Báo cáo tin đăng)
app.use("/api/reports", reportRoutes);

// In-App Notifications (Thông báo quả chuông)
app.use("/api/notifications", notificationRoutes);

// Customer Saved Favorites (Lưu tin yêu thích)
app.use("/api/favorites", favoriteRoutes);

// Blog & Rental Knowledge Base
app.use("/api/blog", blogRoutes);

export default app;
