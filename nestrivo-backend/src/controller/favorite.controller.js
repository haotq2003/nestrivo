import { prisma } from "../lib/prisma.js";

/**
 * 1. Toggle lưu / bỏ lưu tin đăng
 * POST /api/favorites/toggle/:listingId
 */
export async function toggleFavorite(req, res) {
  try {
    const userId = req.user.userId;
    const { listingId } = req.params;

    if (!listingId) {
      return res.status(400).json({ message: "Vui lòng cung cấp mã tin đăng (listingId)." });
    }

    // Kiểm tra tin đăng có tồn tại không
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      select: { id: true, title: true, status: true },
    });

    if (!listing) {
      return res.status(404).json({ message: "Tin đăng không tồn tại hoặc đã bị xóa." });
    }

    // Kiểm tra xem người dùng đã lưu tin này chưa
    const existing = await prisma.favorite.findUnique({
      where: {
        userId_listingId: {
          userId,
          listingId,
        },
      },
    });

    if (existing) {
      // Đã lưu -> Bỏ lưu
      await prisma.favorite.delete({
        where: {
          userId_listingId: {
            userId,
            listingId,
          },
        },
      });

      return res.json({
        success: true,
        isFavorited: false,
        listingId,
        message: "Đã xóa khỏi danh sách tin đã lưu.",
      });
    } else {
      // Chưa lưu -> Tạo mới
      await prisma.favorite.create({
        data: {
          userId,
          listingId,
        },
      });

      return res.json({
        success: true,
        isFavorited: true,
        listingId,
        message: "Đã lưu tin vào danh sách yêu thích thành công.",
      });
    }
  } catch (error) {
    console.error("Toggle favorite error:", error);
    return res.status(500).json({ message: "Lỗi máy chủ khi thao tác lưu tin." });
  }
}

/**
 * 2. Lấy danh sách toàn bộ tin đã lưu của người dùng hiện tại
 * GET /api/favorites
 */
export async function getMyFavorites(req, res) {
  try {
    const userId = req.user.userId;

    const favorites = await prisma.favorite.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        listing: {
          include: {
            images: {
              orderBy: { sortOrder: "asc" },
            },
            landlord: {
              select: {
                id: true,
                fullName: true,
                avatarUrl: true,
                phoneNumber: true,
                landlordProfile: {
                  select: {
                    displayName: true,
                    verificationStatus: true,
                  },
                },
              },
            },
            amenities: {
              include: { amenity: true },
            },
            fees: true,
            _count: {
              select: {
                favorites: true,
                inquiries: true,
              },
            },
          },
        },
      },
    });

    const listings = favorites
      .filter((fav) => fav.listing) // Chỉ lấy các tin còn tồn tại
      .map((fav) => ({
        ...fav.listing,
        isFavorited: true,
        favoritedAt: fav.createdAt,
      }));

    return res.json({
      success: true,
      data: listings,
      totalItems: listings.length,
    });
  } catch (error) {
    console.error("Get my favorites error:", error);
    return res.status(500).json({ message: "Lỗi máy chủ khi lấy danh sách tin đã lưu." });
  }
}

/**
 * 3. Lấy mảng danh sách ID các tin đã lưu (phục vụ hiển thị icon tim đỏ nhanh)
 * GET /api/favorites/ids
 */
export async function getMyFavoriteIds(req, res) {
  try {
    const userId = req.user.userId;

    const favorites = await prisma.favorite.findMany({
      where: { userId },
      select: { listingId: true },
    });

    const ids = favorites.map((f) => f.listingId);

    return res.json({
      success: true,
      favoriteIds: ids,
    });
  } catch (error) {
    console.error("Get favorite ids error:", error);
    return res.status(500).json({ message: "Lỗi máy chủ khi lấy danh sách ID tin đã lưu." });
  }
}

/**
 * 4. Xóa tất cả tin đã lưu
 * DELETE /api/favorites/clear
 */
export async function clearAllFavorites(req, res) {
  try {
    const userId = req.user.userId;

    const result = await prisma.favorite.deleteMany({
      where: { userId },
    });

    return res.json({
      success: true,
      message: `Đã xóa ${result.count} tin khỏi danh sách yêu thích.`,
      deletedCount: result.count,
    });
  } catch (error) {
    console.error("Clear all favorites error:", error);
    return res.status(500).json({ message: "Lỗi máy chủ khi xóa danh sách tin đã lưu." });
  }
}
