import { prisma } from "../lib/prisma.js";

/**
 * Lấy danh sách tất cả tiện ích hệ thống (công khai cho cả Guest, Renter, Landlord)
 * GET /api/amenities
 */
export async function getAllAmenities(req, res) {
  try {
    const amenities = await prisma.amenity.findMany({
      orderBy: { name: "asc" },
    });

    return res.json({
      success: true,
      data: amenities,
    });
  } catch (error) {
    console.error("Get all amenities error:", error);
    return res
      .status(500)
      .json({ message: "Lỗi máy chủ khi lấy danh sách tiện ích." });
  }
}
