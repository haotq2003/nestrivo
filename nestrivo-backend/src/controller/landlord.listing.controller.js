import { prisma } from "../lib/prisma.js";

const VALID_PROPERTY_TYPES = [
  "ROOM_SHARE",
  "STUDIO",
  "SERVICE_APARTMENT",
  "WHOLE_HOUSE",
];

const VALID_FEE_TYPES = [
  "ELECTRICITY",
  "WATER",
  "INTERNET",
  "SERVICE",
  "PARKING",
  "OTHER",
];

const VALID_FEE_UNITS = [
  "PER_KWH",
  "PER_M3",
  "PER_MONTH",
  "PER_PERSON",
  "PER_VEHICLE",
  "FIXED",
];

// --- Helper Functions Validate & Parse an toàn ---

function toBoolean(val, defaultValue = false) {
  if (typeof val === "boolean") return val;
  if (typeof val === "string") {
    const normalized = val.trim().toLowerCase();
    if (normalized === "true" || normalized === "1") return true;
    if (normalized === "false" || normalized === "0") return false;
  }
  return defaultValue;
}

function parsePositiveNumber(val) {
  if (val === undefined || val === null || val === "") return null;
  const num = Number(val);
  if (!Number.isFinite(num) || num <= 0) return null;
  return num;
}

function parseNonNegativeNumber(val) {
  if (val === undefined || val === null || val === "") return null;
  const num = Number(val);
  if (!Number.isFinite(num) || num < 0) return null;
  return num;
}

function parsePositiveInteger(val) {
  if (val === undefined || val === null || val === "") return null;
  const num = Number(val);
  if (!Number.isInteger(num) || num <= 0) return null;
  return num;
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const KNOWN_AMENITY_SLUGS = {
  "air-con": { name: "Điều hòa nhiệt độ", icon: "air-conditioner" },
  "air-conditioner": { name: "Điều hòa nhiệt độ", icon: "air-conditioner" },
  "water-heater": { name: "Bình nóng lạnh", icon: "water-heater" },
  "fridge": { name: "Tủ lạnh", icon: "refrigerator" },
  "refrigerator": { name: "Tủ lạnh", icon: "refrigerator" },
  "washer": { name: "Máy giặt chung / riêng", icon: "washing-machine" },
  "washing-machine": { name: "Máy giặt chung / riêng", icon: "washing-machine" },
  "wifi": { name: "WiFi tốc độ cao", icon: "wifi" },
  "fingerprint": { name: "Khóa vân tay / Thẻ từ", icon: "fingerprint" },
  "balcony": { name: "Ban công / Cửa sổ thoáng", icon: "balcony" },
  "elevator": { name: "Thang máy", icon: "elevator" },
  "parking": { name: "Bãi để xe máy", icon: "parking" },
  "kitchen": { name: "Kệ bếp / Bếp nấu ăn", icon: "kitchen" },
  "free-hours": { name: "Giờ giấc tự do", icon: "clock" },
  "clock": { name: "Giờ giấc tự do", icon: "clock" },
  "security": { name: "Camera an ninh 24/7", icon: "cctv" },
  "cctv": { name: "Camera an ninh 24/7", icon: "cctv" },
  "bed": { name: "Giường & Nệm sẵn", icon: "bed" },
  "wardrobe": { name: "Tủ quần áo", icon: "wardrobe" },
  "pet": { name: "Cho phép nuôi thú cưng", icon: "pet" },
};

/**
 * Phân giải danh sách amenity (UUID hoặc slug frontend như wardrobe, wifi, air-con...)
 * thành UUID hợp lệ tương ứng trong bảng Amenity của PostgreSQL
 */
async function resolveAmenityUuids(rawAmenityIds) {
  if (!Array.isArray(rawAmenityIds) || rawAmenityIds.length === 0) return [];

  const existingAmenities = await prisma.amenity.findMany();
  const resolvedIds = new Set();

  for (const raw of rawAmenityIds) {
    if (!raw || typeof raw !== "string") continue;
    const trimmed = raw.trim();
    if (!trimmed) continue;

    // 1. Nếu là UUID hợp lệ, kiểm tra xem có tồn tại trong bảng Amenity không
    if (UUID_REGEX.test(trimmed)) {
      const found = existingAmenities.find((a) => a.id.toLowerCase() === trimmed.toLowerCase());
      if (found) {
        resolvedIds.add(found.id);
        continue;
      }
    }

    // 2. Tìm theo icon hoặc name đã có trong DB
    let match = existingAmenities.find(
      (a) =>
        (a.icon && a.icon.toLowerCase() === trimmed.toLowerCase()) ||
        a.name.toLowerCase() === trimmed.toLowerCase()
    );

    // 3. Tra trong từ điển slug chuẩn
    const known = KNOWN_AMENITY_SLUGS[trimmed.toLowerCase()];
    if (!match && known) {
      match = existingAmenities.find(
        (a) =>
          a.name.toLowerCase() === known.name.toLowerCase() ||
          (a.icon && a.icon.toLowerCase() === known.icon.toLowerCase())
      );

      // Nếu trong DB chưa có tiện ích này (ví dụ: Tủ quần áo, Thang máy), tự động tạo mới
      if (!match) {
        try {
          match = await prisma.amenity.upsert({
            where: { name: known.name },
            update: { icon: known.icon },
            create: { name: known.name, icon: known.icon },
          });
          existingAmenities.push(match);
        } catch {
          // Bỏ qua nếu có xung đột đồng thời
        }
      }
    }

    if (match) {
      resolvedIds.add(match.id);
    }
  }

  return Array.from(resolvedIds);
}

/**
 * 1. Tạo tin đăng mới cho Chủ nhà
 * POST /api/landlord/listings
 */
export async function createListing(req, res) {
  try {
    const landlordId = req.user.userId;
    const {
      title,
      description,
      propertyType,
      price,
      deposit,
      area,
      bedrooms,
      bathrooms,
      maxOccupants,
      address,
      ward,
      district,
      city,
      latitude,
      longitude,
      minimumStayMonths,
      allowsPets,
      hasMezzanine,
      isFurnished,
      submitForReview,
      images,
      amenityIds,
      fees,
    } = req.body;

    // Validate chuỗi bắt buộc
    if (
      typeof title !== "string" ||
      !title.trim() ||
      typeof description !== "string" ||
      !description.trim() ||
      typeof address !== "string" ||
      !address.trim() ||
      typeof district !== "string" ||
      !district.trim() ||
      typeof city !== "string" ||
      !city.trim()
    ) {
      return res.status(400).json({
        message:
          "Tiêu đề, mô tả, địa chỉ, quận/huyện và tỉnh/thành phố không được để trống.",
      });
    }

    // Validate propertyType
    if (!VALID_PROPERTY_TYPES.includes(propertyType)) {
      return res.status(400).json({
        message: `Loại hình bất động sản không hợp lệ. Chọn một trong: ${VALID_PROPERTY_TYPES.join(", ")}`,
      });
    }

    // Validate số dương: price, area
    const parsedPrice = parsePositiveNumber(price);
    if (parsedPrice === null) {
      return res.status(400).json({
        message: "Giá thuê phòng phải là số lớn hơn 0.",
      });
    }

    const parsedArea = parsePositiveNumber(area);
    if (parsedArea === null) {
      return res.status(400).json({
        message: "Diện tích phòng phải là số lớn hơn 0 (m2).",
      });
    }

    // Tiền cọc: số không âm (>= 0)
    const parsedDeposit = deposit !== undefined ? parseNonNegativeNumber(deposit) : 0;
    if (parsedDeposit === null) {
      return res.status(400).json({
        message: "Tiền đặt cọc không được là số âm.",
      });
    }

    // Validate số nguyên dương nếu có
    const parsedBedrooms = bedrooms !== undefined ? parsePositiveInteger(bedrooms) : 1;
    const parsedBathrooms = bathrooms !== undefined ? parsePositiveInteger(bathrooms) : 1;
    const parsedMaxOccupants = maxOccupants !== undefined ? parsePositiveInteger(maxOccupants) : 2;
    const parsedMinimumStay = minimumStayMonths !== undefined && minimumStayMonths !== null
      ? parsePositiveInteger(minimumStayMonths)
      : null;

    if (bedrooms !== undefined && parsedBedrooms === null) {
      return res.status(400).json({ message: "Số phòng ngủ phải là số nguyên lớn hơn 0." });
    }
    if (bathrooms !== undefined && parsedBathrooms === null) {
      return res.status(400).json({ message: "Số phòng tắm phải là số nguyên lớn hơn 0." });
    }
    if (maxOccupants !== undefined && parsedMaxOccupants === null) {
      return res.status(400).json({ message: "Số người ở tối đa phải là số nguyên lớn hơn 0." });
    }
    if (minimumStayMonths !== undefined && minimumStayMonths !== null && parsedMinimumStay === null) {
      return res.status(400).json({ message: "Thời hạn thuê tối thiểu phải là số tháng nguyên dương." });
    }

    // Tọa độ latitude / longitude nếu có
    let parsedLat = null;
    let parsedLng = null;
    if (latitude !== undefined && latitude !== null && latitude !== "") {
      const lat = Number(latitude);
      if (!Number.isFinite(lat) || lat < -90 || lat > 90) {
        return res.status(400).json({ message: "Vĩ độ (latitude) không hợp lệ (-90 đến 90)." });
      }
      parsedLat = lat;
    }
    if (longitude !== undefined && longitude !== null && longitude !== "") {
      const lng = Number(longitude);
      if (!Number.isFinite(lng) || lng < -180 || lng > 180) {
        return res.status(400).json({ message: "Kinh độ (longitude) không hợp lệ (-180 đến 180)." });
      }
      parsedLng = lng;
    }

    // Trạng thái tin ban đầu (Prisma enum: DRAFT | PENDING_APPROVAL)
    const status = toBoolean(submitForReview) ? "PENDING_APPROVAL" : "DRAFT";

    // Format danh sách ảnh an toàn
    const formattedImages = Array.isArray(images)
      ? images
          .map((img, index) => {
            if (typeof img === "string" && img.trim()) {
              return { imageUrl: img.trim(), sortOrder: index };
            }
            if (img && typeof img === "object" && typeof img.imageUrl === "string" && img.imageUrl.trim()) {
              return {
                imageUrl: img.imageUrl.trim(),
                sortOrder: typeof img.sortOrder === "number" ? img.sortOrder : index,
              };
            }
            return null;
          })
          .filter(Boolean)
      : [];

    // Format danh sách tiện ích an toàn (tự động phân giải UUID hoặc slug: wardrobe, wifi, air-con...)
    const resolvedAmenityUuids = await resolveAmenityUuids(amenityIds);
    const formattedAmenities = resolvedAmenityUuids.map((uuid) => ({
      amenity: { connect: { id: uuid } },
    }));

    // Format danh sách chi phí dịch vụ an toàn
    let formattedFees = [];
    if (Array.isArray(fees)) {
      for (const f of fees) {
        if (!f || !VALID_FEE_TYPES.includes(f.type)) {
          return res.status(400).json({
            message: `Loại chi phí không hợp lệ. Chọn một trong: ${VALID_FEE_TYPES.join(", ")}`,
          });
        }
        const feeAmount = parseNonNegativeNumber(f.amount);
        if (feeAmount === null) {
          return res.status(400).json({
            message: `Số tiền của chi phí '${f.type}' không hợp lệ (phải >= 0).`,
          });
        }
        const unit = f.unit && VALID_FEE_UNITS.includes(f.unit) ? f.unit : "FIXED";
        formattedFees.push({
          type: f.type,
          name: typeof f.name === "string" && f.name.trim() ? f.name.trim() : null,
          amount: feeAmount,
          unit,
        });
      }
    }

    const newListing = await prisma.listing.create({
      data: {
        landlordId,
        title: title.trim(),
        description: description.trim(),
        propertyType,
        status,
        price: parsedPrice,
        deposit: parsedDeposit,
        area: parsedArea,
        bedrooms: parsedBedrooms,
        bathrooms: parsedBathrooms,
        maxOccupants: parsedMaxOccupants,
        address: address.trim(),
        ward: typeof ward === "string" && ward.trim() ? ward.trim() : null,
        district: district.trim(),
        city: city.trim(),
        latitude: parsedLat,
        longitude: parsedLng,
        minimumStayMonths: parsedMinimumStay,
        allowsPets: toBoolean(allowsPets, false),
        hasMezzanine: toBoolean(hasMezzanine, false),
        isFurnished: toBoolean(isFurnished, false),
        images: formattedImages.length ? { create: formattedImages } : undefined,
        amenities: formattedAmenities.length ? { create: formattedAmenities } : undefined,
        fees: formattedFees.length ? { create: formattedFees } : undefined,
      },
      include: {
        images: { orderBy: { sortOrder: "asc" } },
        amenities: { include: { amenity: true } },
        fees: true,
      },
    });

    return res.status(201).json({
      message:
        status === "PENDING_APPROVAL"
          ? "Đăng tin thành công! Tin đang chờ Admin kiểm duyệt."
          : "Lưu bản nháp tin đăng thành công.",
      listing: {
        ...newListing,
        thumbnailUrl:
          newListing.images?.[0]?.imageUrl ||
          "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&auto=format&fit=crop&q=80",
      },
    });
  } catch (error) {
    console.error("Create listing error:", error);
    return res.status(500).json({ message: "Lỗi máy chủ khi tạo tin cho thuê." });
  }
}

/**
 * 2. Lấy danh sách tin của chính Chủ nhà
 * GET /api/landlord/listings
 */
export async function getMyListings(req, res) {
  try {
    const landlordId = req.user.userId;
    const {
      page = 1,
      limit = 10,
      status,
      availabilityStatus,
      search,
    } = req.query;

    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.max(1, Math.min(50, parseInt(limit) || 10));
    const skip = (pageNum - 1) * limitNum;

    const where = {
      landlordId,
      ...(status ? { status } : {}),
      ...(availabilityStatus ? { availabilityStatus } : {}),
      ...(typeof search === "string" && search.trim()
        ? {
            OR: [
              { title: { contains: search.trim(), mode: "insensitive" } },
              { address: { contains: search.trim(), mode: "insensitive" } },
            ],
          }
        : {}),
    };

    const [totalItems, listings] = await Promise.all([
      prisma.listing.count({ where }),
      prisma.listing.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: "desc" },
        include: {
          images: {
            orderBy: { sortOrder: "asc" },
            take: 1,
          },
          promotions: {
            where: {
              status: "ACTIVE",
              endDate: { gte: new Date() },
            },
            orderBy: { endDate: "desc" },
            take: 1,
            select: {
              id: true,
              startDate: true,
              endDate: true,
              tier: true,
              priority: true,
              status: true,
            },
          },
          _count: {
            select: {
              favorites: true,
              inquiries: true,
            },
          },
        },
      }),
    ]);

    const now = new Date();
    const formattedListings = listings.map((l) => {
      const activePromo = l.promotions?.[0];
      let promotionRemainingDays = 0;
      let promotionEndDate = l.expiresAt || null;

      if (activePromo) {
        promotionEndDate = activePromo.endDate;
        const end = new Date(activePromo.endDate);
        const diffMs = end.getTime() - now.getTime();
        if (diffMs > 0) {
          promotionRemainingDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
        }
      } else if (l.expiresAt) {
        const end = new Date(l.expiresAt);
        const diffMs = end.getTime() - now.getTime();
        if (diffMs > 0) {
          promotionRemainingDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
        }
      }

      return {
        ...l,
        promotionRemainingDays,
        promotionEndDate,
        activePromotion: activePromo || null,
        thumbnailUrl:
          l.images?.[0]?.imageUrl ||
          "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&auto=format&fit=crop&q=80",
      };
    });

    return res.json({
      data: formattedListings,
      pagination: {
        totalItems,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(totalItems / limitNum),
      },
    });
  } catch (error) {
    console.error("Get my listings error:", error);
    return res.status(500).json({ message: "Lỗi máy chủ khi lấy danh sách tin." });
  }
}

/**
 * 3. Xem chi tiết 1 tin của Chủ nhà
 * GET /api/landlord/listings/:id
 */
export async function getMyListingById(req, res) {
  try {
    const landlordId = req.user.userId;
    const { id } = req.params;

    const listing = await prisma.listing.findFirst({
      where: {
        id,
        landlordId,
      },
      include: {
        images: { orderBy: { sortOrder: "asc" } },
        amenities: { include: { amenity: true } },
        fees: true,
        promotions: {
          where: {
            status: "ACTIVE",
            endDate: { gte: new Date() },
          },
          orderBy: { endDate: "desc" },
          take: 1,
          select: {
            id: true,
            startDate: true,
            endDate: true,
            tier: true,
            priority: true,
            status: true,
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
      return res
        .status(404)
        .json({ message: "Không tìm thấy tin đăng hoặc bạn không có quyền truy cập." });
    }

    const activePromo = listing.promotions?.[0];
    const now = new Date();
    let promotionRemainingDays = 0;
    let promotionEndDate = listing.expiresAt || null;

    if (activePromo) {
      promotionEndDate = activePromo.endDate;
      const end = new Date(activePromo.endDate);
      const diffMs = end.getTime() - now.getTime();
      if (diffMs > 0) {
        promotionRemainingDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      }
    } else if (listing.expiresAt) {
      const end = new Date(listing.expiresAt);
      const diffMs = end.getTime() - now.getTime();
      if (diffMs > 0) {
        promotionRemainingDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      }
    }

    return res.json({
      listing: {
        ...listing,
        promotionRemainingDays,
        promotionEndDate,
        activePromotion: activePromo || null,
        thumbnailUrl:
          listing.images?.[0]?.imageUrl ||
          "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&auto=format&fit=crop&q=80",
      },
    });
  } catch (error) {
    console.error("Get my listing by id error:", error);
    return res.status(500).json({ message: "Lỗi máy chủ khi xem chi tiết tin." });
  }
}

/**
 * 4. Chỉnh sửa tin đăng
 * PUT /api/landlord/listings/:id
 */
export async function updateListing(req, res) {
  try {
    const landlordId = req.user.userId;
    const { id } = req.params;

    const existingListing = await prisma.listing.findFirst({
      where: { id, landlordId },
    });

    if (!existingListing) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy tin đăng hoặc bạn không có quyền sửa." });
    }

    const {
      title,
      description,
      propertyType,
      price,
      deposit,
      area,
      bedrooms,
      bathrooms,
      maxOccupants,
      address,
      ward,
      district,
      city,
      latitude,
      longitude,
      minimumStayMonths,
      allowsPets,
      hasMezzanine,
      isFurnished,
      submitForReview,
      images,
      amenityIds,
      fees,
    } = req.body;

    const updateData = {};

    // Validate string fields nếu có truyền
    if (title !== undefined) {
      if (typeof title !== "string" || !title.trim()) {
        return res.status(400).json({ message: "Tiêu đề không được để trống." });
      }
      updateData.title = title.trim();
    }

    if (description !== undefined) {
      if (typeof description !== "string" || !description.trim()) {
        return res.status(400).json({ message: "Mô tả không được để trống." });
      }
      updateData.description = description.trim();
    }

    if (address !== undefined) {
      if (typeof address !== "string" || !address.trim()) {
        return res.status(400).json({ message: "Địa chỉ không được để trống." });
      }
      updateData.address = address.trim();
    }

    if (district !== undefined) {
      if (typeof district !== "string" || !district.trim()) {
        return res.status(400).json({ message: "Quận/Huyện không được để trống." });
      }
      updateData.district = district.trim();
    }

    if (city !== undefined) {
      if (typeof city !== "string" || !city.trim()) {
        return res.status(400).json({ message: "Tỉnh/Thành phố không được để trống." });
      }
      updateData.city = city.trim();
    }

    if (ward !== undefined) {
      updateData.ward = typeof ward === "string" && ward.trim() ? ward.trim() : null;
    }

    // Validate propertyType nếu có truyền
    if (propertyType !== undefined) {
      if (!VALID_PROPERTY_TYPES.includes(propertyType)) {
        return res.status(400).json({
          message: `Loại hình bất động sản không hợp lệ. Chọn một trong: ${VALID_PROPERTY_TYPES.join(", ")}`,
        });
      }
      updateData.propertyType = propertyType;
    }

    // Validate numeric fields nếu có truyền
    if (price !== undefined) {
      const parsedPrice = parsePositiveNumber(price);
      if (parsedPrice === null) {
        return res.status(400).json({ message: "Giá thuê phòng phải là số lớn hơn 0." });
      }
      updateData.price = parsedPrice;
    }

    if (area !== undefined) {
      const parsedArea = parsePositiveNumber(area);
      if (parsedArea === null) {
        return res.status(400).json({ message: "Diện tích phòng phải là số lớn hơn 0." });
      }
      updateData.area = parsedArea;
    }

    if (deposit !== undefined) {
      const parsedDeposit = parseNonNegativeNumber(deposit);
      if (parsedDeposit === null) {
        return res.status(400).json({ message: "Tiền cọc không được là số âm." });
      }
      updateData.deposit = parsedDeposit;
    }

    if (bedrooms !== undefined) {
      const parsedBedrooms = parsePositiveInteger(bedrooms);
      if (parsedBedrooms === null) {
        return res.status(400).json({ message: "Số phòng ngủ phải là số nguyên lớn hơn 0." });
      }
      updateData.bedrooms = parsedBedrooms;
    }

    if (bathrooms !== undefined) {
      const parsedBathrooms = parsePositiveInteger(bathrooms);
      if (parsedBathrooms === null) {
        return res.status(400).json({ message: "Số phòng tắm phải là số nguyên lớn hơn 0." });
      }
      updateData.bathrooms = parsedBathrooms;
    }

    if (maxOccupants !== undefined) {
      const parsedMaxOccupants = parsePositiveInteger(maxOccupants);
      if (parsedMaxOccupants === null) {
        return res.status(400).json({ message: "Số người ở tối đa phải là số nguyên lớn hơn 0." });
      }
      updateData.maxOccupants = parsedMaxOccupants;
    }

    if (minimumStayMonths !== undefined) {
      if (minimumStayMonths === null || minimumStayMonths === "") {
        updateData.minimumStayMonths = null;
      } else {
        const parsedMinStay = parsePositiveInteger(minimumStayMonths);
        if (parsedMinStay === null) {
          return res.status(400).json({ message: "Thời hạn thuê tối thiểu phải là số tháng nguyên dương." });
        }
        updateData.minimumStayMonths = parsedMinStay;
      }
    }

    if (latitude !== undefined) {
      if (latitude === null || latitude === "") {
        updateData.latitude = null;
      } else {
        const lat = Number(latitude);
        if (!Number.isFinite(lat) || lat < -90 || lat > 90) {
          return res.status(400).json({ message: "Vĩ độ (latitude) không hợp lệ (-90 đến 90)." });
        }
        updateData.latitude = lat;
      }
    }

    if (longitude !== undefined) {
      if (longitude === null || longitude === "") {
        updateData.longitude = null;
      } else {
        const lng = Number(longitude);
        if (!Number.isFinite(lng) || lng < -180 || lng > 180) {
          return res.status(400).json({ message: "Kinh độ (longitude) không hợp lệ (-180 đến 180)." });
        }
        updateData.longitude = lng;
      }
    }

    // Validate boolean fields nếu có truyền
    if (allowsPets !== undefined) updateData.allowsPets = toBoolean(allowsPets, false);
    if (hasMezzanine !== undefined) updateData.hasMezzanine = toBoolean(hasMezzanine, false);
    if (isFurnished !== undefined) updateData.isFurnished = toBoolean(isFurnished, false);

    // Xử lý gửi duyệt
    if (submitForReview !== undefined && toBoolean(submitForReview) === true) {
      updateData.status = "PENDING_APPROVAL";
      updateData.rejectionReason = null;
    }

    // Dùng transaction để đồng bộ an toàn
    const updatedListing = await prisma.$transaction(async (tx) => {
      // 1. Cập nhật ảnh
      if (Array.isArray(images)) {
        await tx.listingImage.deleteMany({ where: { listingId: id } });
        const formattedImages = images
          .map((img, index) => {
            if (typeof img === "string" && img.trim()) {
              return { listingId: id, imageUrl: img.trim(), sortOrder: index };
            }
            if (img && typeof img === "object" && typeof img.imageUrl === "string" && img.imageUrl.trim()) {
              return {
                listingId: id,
                imageUrl: img.imageUrl.trim(),
                sortOrder: typeof img.sortOrder === "number" ? img.sortOrder : index,
              };
            }
            return null;
          })
          .filter(Boolean);

        if (formattedImages.length) {
          await tx.listingImage.createMany({ data: formattedImages });
        }
      }

      // 2. Cập nhật tiện ích (tự động phân giải UUID hoặc slug an toàn)
      if (Array.isArray(amenityIds)) {
        await tx.listingAmenity.deleteMany({ where: { listingId: id } });
        const resolvedAmenityUuids = await resolveAmenityUuids(amenityIds);
        if (resolvedAmenityUuids.length) {
          await tx.listingAmenity.createMany({
            data: resolvedAmenityUuids.map((amenityId) => ({
              listingId: id,
              amenityId,
            })),
          });
        }
      }

      // 3. Cập nhật chi phí phát sinh
      if (Array.isArray(fees)) {
        await tx.listingFee.deleteMany({ where: { listingId: id } });
        const feeRecords = [];
        for (const f of fees) {
          if (f && VALID_FEE_TYPES.includes(f.type)) {
            const feeAmount = parseNonNegativeNumber(f.amount);
            if (feeAmount !== null) {
              feeRecords.push({
                listingId: id,
                type: f.type,
                name: typeof f.name === "string" && f.name.trim() ? f.name.trim() : null,
                amount: feeAmount,
                unit: f.unit && VALID_FEE_UNITS.includes(f.unit) ? f.unit : "FIXED",
              });
            }
          }
        }
        if (feeRecords.length) {
          await tx.listingFee.createMany({ data: feeRecords });
        }
      }

      // 4. Update thông tin chính
      return tx.listing.update({
        where: { id },
        data: updateData,
        include: {
          images: { orderBy: { sortOrder: "asc" } },
          amenities: { include: { amenity: true } },
          fees: true,
        },
      });
    });

    return res.json({
      message: "Cập nhật tin đăng thành công.",
      listing: {
        ...updatedListing,
        thumbnailUrl:
          updatedListing.images?.[0]?.imageUrl ||
          "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&auto=format&fit=crop&q=80",
      },
    });
  } catch (error) {
    console.error("Update listing error:", error);
    return res.status(500).json({ message: "Lỗi máy chủ khi cập nhật tin cho thuê." });
  }
}

/**
 * 5. Gửi duyệt tin đăng (từ DRAFT hoặc REJECTED -> PENDING_APPROVAL)
 * PATCH /api/landlord/listings/:id/submit
 */
export async function submitForReview(req, res) {
  try {
    const landlordId = req.user.userId;
    const { id } = req.params;

    const listing = await prisma.listing.findFirst({
      where: { id, landlordId },
    });

    if (!listing) {
      return res.status(404).json({ message: "Không tìm thấy tin đăng." });
    }

    if (listing.status === "PENDING_APPROVAL") {
      return res
        .status(400)
        .json({ message: "Tin đăng này đang trong hàng đợi chờ duyệt." });
    }

    if (listing.status === "PUBLISHED") {
      return res.status(400).json({
        message: "Tin đăng này đã được duyệt và đang hiển thị trên sàn.",
      });
    }

    const updated = await prisma.listing.update({
      where: { id },
      data: {
        status: "PENDING_APPROVAL",
        rejectionReason: null,
      },
    });

    return res.json({
      message: "Đã gửi tin đăng lên hệ thống để Admin kiểm duyệt.",
      listing: updated,
    });
  } catch (error) {
    console.error("Submit listing error:", error);
    return res.status(500).json({ message: "Lỗi máy chủ khi gửi duyệt tin." });
  }
}

/**
 * 6. Bật/tắt tình trạng phòng (AVAILABLE <-> RENTED)
 * PATCH /api/landlord/listings/:id/availability
 */
export async function updateAvailability(req, res) {
  try {
    const landlordId = req.user.userId;
    const { id } = req.params;
    const { availabilityStatus } = req.body;

    const validStatuses = ["AVAILABLE", "RENTED", "UNAVAILABLE"];
    if (!validStatuses.includes(availabilityStatus)) {
      return res.status(400).json({
        message: `Trạng thái không hợp lệ. Chọn một trong: ${validStatuses.join(", ")}`,
      });
    }

    const listing = await prisma.listing.findFirst({
      where: { id, landlordId },
    });

    if (!listing) {
      return res.status(404).json({ message: "Không tìm thấy tin đăng." });
    }

    const updated = await prisma.listing.update({
      where: { id },
      data: { availabilityStatus },
    });

    return res.json({
      message: `Đã cập nhật tình trạng phòng: ${availabilityStatus === "RENTED" ? "Đã cho thuê" : "Còn phòng trống"}.`,
      listing: updated,
    });
  } catch (error) {
    console.error("Update availability error:", error);
    return res
      .status(500)
      .json({ message: "Lỗi máy chủ khi cập nhật tình trạng phòng." });
  }
}

/**
 * 7. Ẩn / Hiện tin đăng đã duyệt (HIDDEN <-> PUBLISHED)
 * PATCH /api/landlord/listings/:id/visibility
 */
export async function toggleVisibility(req, res) {
  try {
    const landlordId = req.user.userId;
    const { id } = req.params;

    const listing = await prisma.listing.findFirst({
      where: { id, landlordId },
    });

    if (!listing) {
      return res.status(404).json({ message: "Không tìm thấy tin đăng." });
    }

    if (listing.status !== "PUBLISHED" && listing.status !== "HIDDEN") {
      return res.status(400).json({
        message:
          "Chỉ có thể ẩn/hiện tin đã được phê duyệt (trạng thái PUBLISHED hoặc HIDDEN).",
      });
    }

    const nextStatus = listing.status === "PUBLISHED" ? "HIDDEN" : "PUBLISHED";

    const updated = await prisma.listing.update({
      where: { id },
      data: { status: nextStatus },
    });

    return res.json({
      message:
        nextStatus === "HIDDEN"
          ? "Đã tạm ẩn tin đăng."
          : "Đã bật hiển thị lại tin đăng trên sàn.",
      listing: updated,
    });
  } catch (error) {
    console.error("Toggle visibility error:", error);
    return res
      .status(500)
      .json({ message: "Lỗi máy chủ khi đổi trạng thái hiển thị tin." });
  }
}

/**
 * 8. Xóa tin đăng (Dùng Allowlist: CHỈ CHO XÓA KHI LÀ DRAFT HOẶC REJECTED)
 * DELETE /api/landlord/listings/:id
 */
export async function deleteListing(req, res) {
  try {
    const landlordId = req.user.userId;
    const { id } = req.params;

    const listing = await prisma.listing.findFirst({
      where: { id, landlordId },
    });

    if (!listing) {
      return res.status(404).json({ message: "Không tìm thấy tin đăng." });
    }

    // Fix lỗi 4: Allowlist chuẩn xác theo đúng nghiệp vụ
    const DELETABLE_STATUSES = ["DRAFT", "REJECTED"];
    if (!DELETABLE_STATUSES.includes(listing.status)) {
      return res.status(400).json({
        message:
          "Chỉ được phép xóa tin ở trạng thái Bản nháp (DRAFT) hoặc Bị từ chối (REJECTED). Với tin đang duyệt, đã xuất bản hoặc tạm ẩn, bạn không thể xóa trực tiếp để bảo toàn dữ liệu liên hệ.",
      });
    }

    await prisma.listing.delete({ where: { id } });

    return res.json({ message: "Đã xóa tin đăng thành công." });
  } catch (error) {
    console.error("Delete listing error:", error);
    return res.status(500).json({ message: "Lỗi máy chủ khi xóa tin." });
  }
}
