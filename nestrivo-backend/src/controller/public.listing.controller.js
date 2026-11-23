import { prisma } from "../lib/prisma.js";
import { checkAndExpirePromotions } from "./promotion.controller.js";

// Biến đếm xoay vòng thứ tự tin nổi bật công bằng (Round-robin Rotation theo lượt truy cập)
let featuredRotationCounter = 0;

// Helper chuyển đổi giá trị boolean an toàn từ query params
function toBoolean(val) {
  if (val === undefined || val === null) return undefined;
  const str = String(val).trim().toLowerCase();
  if (str === "true" || str === "1") return true;
  if (str === "false" || str === "0") return false;
  return undefined;
}

/**
 * 1. Danh sách tìm kiếm & lọc bất động sản công khai
 * GET /api/listings
 */
export async function getPublicListings(req, res) {
  try {
    // Tự động kiểm tra và hạ hạng các tin có gói quảng bá đã hết hạn
    await checkAndExpirePromotions();

    const {
      page = 1,
      limit = 12,
      search,
      city,
      district,
      ward,
      propertyType,
      minPrice,
      maxPrice,
      minArea,
      maxArea,
      bedrooms,
      bathrooms,
      allowsPets,
      hasMezzanine,
      isFurnished,
      amenityIds, // danh sách id cách nhau bởi dấu phẩy, ví dụ: "id1,id2"
      featured, // chỉ lấy tin có gói quảng bá VIP/HOT đang kích hoạt
      minFavorites, // lọc tin có tối thiểu N lượt lưu thích
      minInquiries, // lọc tin có tối thiểu N lượt hỏi thuê
      sortBy = "newest",
    } = req.query;

    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.max(1, Math.min(50, parseInt(limit) || 12));
    const skip = (pageNum - 1) * limitNum;

    // Điều kiện tiên quyết: Chỉ lấy tin đã duyệt (PUBLISHED) và còn phòng (AVAILABLE)
    const where = {
      status: "PUBLISHED",
      availabilityStatus: "AVAILABLE",
    };

    // 1. Tìm kiếm từ khóa theo nhiều trường
    if (typeof search === "string" && search.trim()) {
      const keyword = search.trim();
      where.OR = [
        { title: { contains: keyword, mode: "insensitive" } },
        { description: { contains: keyword, mode: "insensitive" } },
        { address: { contains: keyword, mode: "insensitive" } },
        { ward: { contains: keyword, mode: "insensitive" } },
        { district: { contains: keyword, mode: "insensitive" } },
        { city: { contains: keyword, mode: "insensitive" } },
      ];
    }

    // 2. Lọc vị trí địa lý
    if (typeof city === "string" && city.trim()) {
      where.city = { contains: city.trim(), mode: "insensitive" };
    }
    if (typeof district === "string" && district.trim()) {
      where.district = { contains: district.trim(), mode: "insensitive" };
    }
    if (typeof ward === "string" && ward.trim()) {
      where.ward = { contains: ward.trim(), mode: "insensitive" };
    }

    // 3. Lọc loại hình BĐS
    if (typeof propertyType === "string" && propertyType.trim()) {
      where.propertyType = propertyType.trim();
    }

    // 4. Lọc khoảng giá thuê
    const parsedMinPrice = minPrice !== undefined ? Number(minPrice) : null;
    const parsedMaxPrice = maxPrice !== undefined ? Number(maxPrice) : null;
    if (Number.isFinite(parsedMinPrice) || Number.isFinite(parsedMaxPrice)) {
      where.price = {};
      if (Number.isFinite(parsedMinPrice) && parsedMinPrice >= 0) {
        where.price.gte = parsedMinPrice;
      }
      if (Number.isFinite(parsedMaxPrice) && parsedMaxPrice > 0) {
        where.price.lte = parsedMaxPrice;
      }
    }

    // 5. Lọc khoảng diện tích
    const parsedMinArea = minArea !== undefined ? Number(minArea) : null;
    const parsedMaxArea = maxArea !== undefined ? Number(maxArea) : null;
    if (Number.isFinite(parsedMinArea) || Number.isFinite(parsedMaxArea)) {
      where.area = {};
      if (Number.isFinite(parsedMinArea) && parsedMinArea >= 0) {
        where.area.gte = parsedMinArea;
      }
      if (Number.isFinite(parsedMaxArea) && parsedMaxArea > 0) {
        where.area.lte = parsedMaxArea;
      }
    }

    // 6. Lọc số phòng ngủ / phòng tắm
    if (bedrooms !== undefined && !isNaN(parseInt(bedrooms))) {
      where.bedrooms = { gte: parseInt(bedrooms) };
    }
    if (bathrooms !== undefined && !isNaN(parseInt(bathrooms))) {
      where.bathrooms = { gte: parseInt(bathrooms) };
    }

    // 7. Lọc đặc điểm tiện ích bổ sung
    const parsedAllowsPets = toBoolean(allowsPets);
    if (parsedAllowsPets !== undefined) where.allowsPets = parsedAllowsPets;

    const parsedHasMezzanine = toBoolean(hasMezzanine);
    if (parsedHasMezzanine !== undefined) where.hasMezzanine = parsedHasMezzanine;

    const parsedIsFurnished = toBoolean(isFurnished);
    if (parsedIsFurnished !== undefined) where.isFurnished = parsedIsFurnished;

    // 8. Lọc theo danh sách tiện ích cụ thể (amenities)
    if (typeof amenityIds === "string" && amenityIds.trim()) {
      const ids = amenityIds
        .split(",")
        .map((id) => id.trim())
        .filter(Boolean);

      if (ids.length > 0) {
        // Phòng phải có chứa các tiện ích được chọn
        where.amenities = {
          some: {
            amenityId: { in: ids },
          },
        };
      }
    }

    // 8b. Lọc tin nổi bật có gói quảng bá trả phí đang còn hiệu lực
    const parsedFeatured = toBoolean(featured);
    if (parsedFeatured === true) {
      const now = new Date();
      where.promotions = {
        some: {
          status: "ACTIVE",
          startDate: { lte: now },
          endDate: { gte: now },
        },
      };
    }

    // 8c. Lọc theo số lượt tương tác thực tế (không chế số ảo)
    if (minFavorites !== undefined && parseInt(minFavorites) > 0) {
      where.favorites = { some: {} };
    }
    if (minInquiries !== undefined && parseInt(minInquiries) > 0) {
      where.inquiries = { some: {} };
    }

    // 9. Xác định thứ tự sắp xếp: Luôn ưu tiên các gói quảng bá (VIP > HOT > FREE), sau đó mới đến tiêu chí của người dùng
    let secondarySort = { publishedAt: "desc" };
    switch (sortBy) {
      case "price_asc":
        secondarySort = { price: "asc" };
        break;
      case "price_desc":
        secondarySort = { price: "desc" };
        break;
      case "area_desc":
        secondarySort = { area: "desc" };
        break;
      case "area_asc":
        secondarySort = { area: "asc" };
        break;
      case "favorites":
        secondarySort = { favorites: { _count: "desc" } };
        break;
      case "trending":
        secondarySort = { inquiries: { _count: "desc" } };
        break;
      case "oldest":
        secondarySort = { publishedAt: "asc" };
        break;
      case "newest":
      default:
        secondarySort = { publishedAt: "desc" };
        break;
    }

    const orderBy = [{ priority: "desc" }, secondarySort];

    const listingIncludes = {
      images: {
        orderBy: { sortOrder: "asc" },
        take: 3, // Lấy 3 ảnh đầu để hiển thị preview mượt mà
      },
      amenities: {
        include: { amenity: true },
        take: 5,
      },
      landlord: {
        select: {
          id: true,
          fullName: true,
          avatarUrl: true,
          landlordProfile: {
            select: {
              displayName: true,
              verificationStatus: true,
            },
          },
        },
      },
      _count: {
        select: {
          favorites: true,
          inquiries: true,
        },
      },
    };

    let totalItems = 0;
    let listings = [];

    // NẾU LỌC TIN NỔI BẬT: Áp dụng thuật toán Rotation xoay vòng công bằng theo lượt truy cập
    // Ví dụ 3 tin A, B, C:
    // Khách 1: A -> B -> C
    // Khách 2: B -> C -> A
    // Khách 3: C -> A -> B
    if (parsedFeatured === true) {
      const allFeatured = await prisma.listing.findMany({
        where,
        orderBy: { publishedAt: "desc" },
        include: listingIncludes,
      });

      totalItems = allFeatured.length;

      if (allFeatured.length > 1) {
        const shift = featuredRotationCounter % allFeatured.length;
        featuredRotationCounter = (featuredRotationCounter + 1) % 1000000;
        const rotated = [...allFeatured.slice(shift), ...allFeatured.slice(0, shift)];
        listings = rotated.slice(skip, skip + limitNum);
      } else {
        listings = allFeatured.slice(skip, skip + limitNum);
      }
    } else {
      [totalItems, listings] = await Promise.all([
        prisma.listing.count({ where }),
        prisma.listing.findMany({
          where,
          skip,
          take: limitNum,
          orderBy,
          include: listingIncludes,
        }),
      ]);
    }

    return res.json({
      success: true,
      data: listings,
      pagination: {
        totalItems,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(totalItems / limitNum),
      },
    });
  } catch (error) {
    console.error("Get public listings error:", error);
    return res
      .status(500)
      .json({ message: "Lỗi máy chủ khi tìm kiếm bất động sản." });
  }
}

/**
 * 2. Xem chi tiết 1 bất động sản + gợi ý các phòng tương tự
 * GET /api/listings/:id
 */
export async function getPublicListingById(req, res) {
  try {
    const { id } = req.params;

    const listing = await prisma.listing.findFirst({
      where: {
        id,
        status: "PUBLISHED", // Chỉ hiển thị tin đã kiểm duyệt
      },
      include: {
        images: { orderBy: { sortOrder: "asc" } },
        amenities: { include: { amenity: true } },
        fees: true,
        landlord: {
          select: {
            id: true,
            fullName: true,
            phoneNumber: true, // Hiển thị số điện thoại để người thuê liên hệ
            avatarUrl: true,
            createdAt: true,
            landlordProfile: {
              select: {
                displayName: true,
                description: true,
                verificationStatus: true,
              },
            },
          },
        },
        _count: {
          select: {
            favorites: true,
            inquiries: true,
          },
        },
      },
    });

    if (!listing) {
      return res.status(404).json({
        message: "Không tìm thấy phòng trọ này hoặc tin đăng đã hết hạn/tạm ẩn.",
      });
    }

    // Tự động tăng lượt xem tin đăng ngầm (fire-and-forget, không làm chậm response)
    prisma.listing
      .update({
        where: { id },
        data: { views: { increment: 1 } },
      })
      .catch((err) => console.error("Auto increment listing views error:", err));

    listing.views = (listing.views || 0) + 1;

    // Gợi ý 4 phòng trọ tương tự (cùng thành phố và quận/huyện hoặc cùng loại hình)
    const similarListings = await prisma.listing.findMany({
      where: {
        id: { not: id },
        status: "PUBLISHED",
        availabilityStatus: "AVAILABLE",
        city: listing.city,
        OR: [
          { district: listing.district },
          { propertyType: listing.propertyType },
        ],
      },
      take: 4,
      orderBy: { publishedAt: "desc" },
      include: {
        images: {
          orderBy: { sortOrder: "asc" },
          take: 1,
        },
        landlord: {
          select: {
            fullName: true,
            landlordProfile: {
              select: { displayName: true },
            },
          },
        },
      },
    });

    return res.json({
      success: true,
      listing,
      similarListings,
    });
  } catch (error) {
    console.error("Get public listing by id error:", error);
    return res
      .status(500)
      .json({ message: "Lỗi máy chủ khi xem chi tiết bất động sản." });
  }
}

/**
 * 3. Lấy thông tin so sánh chi tiết giữa nhiều phòng trọ (tối đa 4 phòng)
 * GET /api/listings/compare?ids=uuid1,uuid2,uuid3
 */
export async function getCompareListings(req, res) {
  try {
    const { ids } = req.query;

    if (!ids || typeof ids !== "string") {
      return res.status(400).json({
        success: false,
        message: "Vui lòng cung cấp danh sách mã tin đăng cần so sánh (ids).",
      });
    }

    // Tách và chuẩn hóa danh sách ID, giới hạn tối đa 4 ID
    const rawIds = ids
      .split(",")
      .map((id) => id.trim())
      .filter((id) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id))
      .slice(0, 4);

    if (rawIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Không tìm thấy mã tin đăng hợp lệ.",
      });
    }

    const listings = await prisma.listing.findMany({
      where: {
        id: { in: rawIds },
        status: "PUBLISHED",
      },
      include: {
        images: { orderBy: { sortOrder: "asc" } },
        amenities: { include: { amenity: true } },
        fees: true,
        landlord: {
          select: {
            id: true,
            fullName: true,
            phoneNumber: true,
            avatarUrl: true,
            landlordProfile: {
              select: {
                displayName: true,
                verificationStatus: true,
              },
            },
          },
        },
        _count: {
          select: {
            favorites: true,
            inquiries: true,
          },
        },
      },
    });

    // Giữ nguyên thứ tự ID theo danh sách người dùng yêu cầu
    const orderedListings = rawIds
      .map((id) => listings.find((l) => l.id === id))
      .filter(Boolean);

    return res.json({
      success: true,
      data: orderedListings,
      totalItems: orderedListings.length,
    });
  } catch (error) {
    console.error("Get compare listings error:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi máy chủ khi lấy dữ liệu so sánh phòng trọ.",
    });
  }
}
