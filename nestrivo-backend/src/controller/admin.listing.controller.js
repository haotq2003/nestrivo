import { prisma } from "../lib/prisma.js";

/**
 * 1. Lấy danh sách tin đang chờ duyệt trên toàn hệ thống
 * GET /api/admin/listings/pending
 */
export async function getPendingListings(req, res) {
  try {
    const {
      page = 1,
      limit = 10,
      propertyType,
      city,
      district,
      search,
    } = req.query;

    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.max(1, Math.min(50, parseInt(limit) || 10));
    const skip = (pageNum - 1) * limitNum;

    const where = {
      status: "PENDING_APPROVAL",
      ...(propertyType ? { propertyType } : {}),
      ...(city?.trim() ? { city: { contains: city.trim(), mode: "insensitive" } } : {}),
      ...(district?.trim()
        ? { district: { contains: district.trim(), mode: "insensitive" } }
        : {}),
      ...(search?.trim()
        ? {
            OR: [
              { title: { contains: search.trim(), mode: "insensitive" } },
              { address: { contains: search.trim(), mode: "insensitive" } },
              { landlord: { fullName: { contains: search.trim(), mode: "insensitive" } } },
              { landlord: { email: { contains: search.trim(), mode: "insensitive" } } },
            ],
          }
        : {}),
    };

    // Mặc định sắp xếp createdAt: "asc" (tin nào gửi trước thì duyệt trước - FIFO)
    const [totalItems, listings] = await Promise.all([
      prisma.listing.count({ where }),
      prisma.listing.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: "asc" },
        include: {
          landlord: {
            select: {
              id: true,
              email: true,
              fullName: true,
              phoneNumber: true,
              avatarUrl: true,
              landlordProfile: {
                select: {
                  displayName: true,
                  verificationStatus: true,
                },
              },
              verificationRequests: {
                select: {
                  status: true,
                },
                take: 1,
                orderBy: { createdAt: "desc" },
              },
            },
          },
          images: {
            orderBy: { sortOrder: "asc" },
          },
          fees: true,
          amenities: {
            include: { amenity: true },
          },
        },
      }),
    ]);

    const formattedListings = listings.map((l) => {
      const isKycVerified = Boolean(
        l.landlord?.landlordProfile?.verificationStatus === "VERIFIED" ||
        l.landlord?.verificationRequests?.[0]?.status === "VERIFIED"
      );

      const landlord = l.landlord
        ? {
            ...l.landlord,
            landlordProfile: {
              ...l.landlord.landlordProfile,
              verificationStatus: isKycVerified
                ? "VERIFIED"
                : (l.landlord.landlordProfile?.verificationStatus || "PENDING"),
            },
            isKycVerified,
          }
        : null;

      return {
        ...l,
        landlord,
        thumbnailUrl:
          l.images?.[0]?.imageUrl ||
          "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&auto=format&fit=crop&q=80",
        listingThumbnailUrl:
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
    console.error("Get pending listings error:", error);
    return res
      .status(500)
      .json({ message: "Lỗi máy chủ khi lấy danh sách tin chờ duyệt." });
  }
}

/**
 * 2. Xem chi tiết 1 tin đăng bất kỳ để Admin kiểm tra kỹ
 * GET /api/admin/listings/:id
 */
export async function getAdminListingById(req, res) {
  try {
    const { id } = req.params;

    const listing = await prisma.listing.findUnique({
      where: { id },
      include: {
        landlord: {
          select: {
            id: true,
            email: true,
            fullName: true,
            phoneNumber: true,
            avatarUrl: true,
            isActive: true,
            createdAt: true,
            landlordProfile: true,
            verificationRequests: {
              select: {
                status: true,
              },
              take: 1,
              orderBy: { createdAt: "desc" },
            },
          },
        },
        images: { orderBy: { sortOrder: "asc" } },
        amenities: { include: { amenity: true } },
        fees: true,
        _count: {
          select: {
            favorites: true,
            inquiries: true,
            reports: true,
          },
        },
      },
    });

    if (!listing) {
      return res.status(404).json({ message: "Không tìm thấy tin đăng." });
    }

    const isKycVerified = Boolean(
      listing.landlord?.landlordProfile?.verificationStatus === "VERIFIED" ||
      listing.landlord?.verificationRequests?.[0]?.status === "VERIFIED"
    );

    const formattedListing = {
      ...listing,
      landlord: listing.landlord
        ? {
            ...listing.landlord,
            landlordProfile: {
              ...listing.landlord.landlordProfile,
              verificationStatus: isKycVerified
                ? "VERIFIED"
                : (listing.landlord.landlordProfile?.verificationStatus || "PENDING"),
            },
            isKycVerified,
          }
        : null,
      thumbnailUrl:
        listing.images?.[0]?.imageUrl ||
        "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&auto=format&fit=crop&q=80",
    };

    return res.json({ listing: formattedListing });
  } catch (error) {
    console.error("Get admin listing by id error:", error);
    return res
      .status(500)
      .json({ message: "Lỗi máy chủ khi lấy chi tiết tin đăng." });
  }
}

/**
 * 3. Phê duyệt tin đăng
 * PATCH /api/admin/listings/:id/approve
 */
export async function approveListing(req, res) {
  try {
    const adminId = req.user.userId;
    const { id } = req.params;

    const listing = await prisma.listing.findUnique({
      where: { id },
      include: {
        landlord: {
          select: { id: true, email: true, fullName: true },
        },
      },
    });

    if (!listing) {
      return res.status(404).json({ message: "Không tìm thấy tin đăng." });
    }

    if (listing.status === "PUBLISHED") {
      return res.status(400).json({
        message: "Tin đăng này đã được phê duyệt và xuất bản trước đó.",
      });
    }

    // Duyệt tin và ghi AuditLog trong 1 transaction
    const [updatedListing] = await prisma.$transaction([
      prisma.listing.update({
        where: { id },
        data: {
          status: "PUBLISHED",
          publishedAt: new Date(),
          rejectionReason: null,
        },
      }),
      prisma.auditLog.create({
        data: {
          adminId,
          action: "APPROVE_LISTING",
          entityType: "Listing",
          entityId: id,
          details: {
            listingTitle: listing.title,
            landlordId: listing.landlordId,
            previousStatus: listing.status,
          },
        },
      }),
    ]);

    return res.json({
      message: "Phê duyệt tin đăng thành công! Tin đã được xuất bản lên sàn.",
      listing: updatedListing,
    });
  } catch (error) {
    console.error("Approve listing error:", error);
    return res
      .status(500)
      .json({ message: "Lỗi máy chủ khi phê duyệt tin đăng." });
  }
}

/**
 * 4. Từ chối tin đăng kèm lý do
 * PATCH /api/admin/listings/:id/reject
 */
export async function rejectListing(req, res) {
  try {
    const adminId = req.user.userId;
    const { id } = req.params;
    const { rejectionReason } = req.body;

    if (
      typeof rejectionReason !== "string" ||
      !rejectionReason.trim() ||
      rejectionReason.trim().length < 5
    ) {
      return res.status(400).json({
        message: "Vui lòng nhập lý do từ chối cụ thể (tối thiểu 5 ký tự) để chủ nhà biết chỉnh sửa.",
      });
    }

    const listing = await prisma.listing.findUnique({
      where: { id },
    });

    if (!listing) {
      return res.status(404).json({ message: "Không tìm thấy tin đăng." });
    }

    // Từ chối tin và ghi AuditLog
    const [updatedListing] = await prisma.$transaction([
      prisma.listing.update({
        where: { id },
        data: {
          status: "REJECTED",
          rejectionReason: rejectionReason.trim(),
        },
      }),
      prisma.auditLog.create({
        data: {
          adminId,
          action: "REJECT_LISTING",
          entityType: "Listing",
          entityId: id,
          details: {
            listingTitle: listing.title,
            landlordId: listing.landlordId,
            previousStatus: listing.status,
            reason: rejectionReason.trim(),
          },
        },
      }),
    ]);

    return res.json({
      message: "Đã từ chối tin đăng và gửi lý do cho chủ nhà.",
      listing: updatedListing,
    });
  } catch (error) {
    console.error("Reject listing error:", error);
    return res
      .status(500)
      .json({ message: "Lỗi máy chủ khi từ chối tin đăng." });
  }
}

/**
 * 5. Cưỡng chế ẩn tin vi phạm (hoặc khôi phục)
 * PATCH /api/admin/listings/:id/hide
 */
export async function toggleHideListing(req, res) {
  try {
    const adminId = req.user.userId;
    const { id } = req.params;
    const { reason } = req.body;

    const listing = await prisma.listing.findUnique({
      where: { id },
    });

    if (!listing) {
      return res.status(404).json({ message: "Không tìm thấy tin đăng." });
    }

    const isHiding = listing.status !== "HIDDEN";
    const nextStatus = isHiding ? "HIDDEN" : "PUBLISHED";

    const [updatedListing] = await prisma.$transaction([
      prisma.listing.update({
        where: { id },
        data: { status: nextStatus },
      }),
      prisma.auditLog.create({
        data: {
          adminId,
          action: isHiding ? "HIDE_LISTING" : "UNHIDE_LISTING",
          entityType: "Listing",
          entityId: id,
          details: {
            listingTitle: listing.title,
            previousStatus: listing.status,
            reason: typeof reason === "string" ? reason.trim() : null,
          },
        },
      }),
    ]);

    return res.json({
      message: isHiding
        ? "Đã cưỡng chế ẩn tin vi phạm khỏi hệ thống."
        : "Đã khôi phục hiển thị tin đăng.",
      listing: updatedListing,
    });
  } catch (error) {
    console.error("Toggle hide listing error:", error);
    return res
      .status(500)
      .json({ message: "Lỗi máy chủ khi ẩn/hiện tin đăng." });
  }
}

/**
 * 6. Lấy toàn bộ tin trên sàn (dành cho Admin quản lý tổng quát)
 * GET /api/admin/listings
 */
export async function getAllListings(req, res) {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      propertyType,
      city,
      search,
    } = req.query;

    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.max(1, Math.min(50, parseInt(limit) || 10));
    const skip = (pageNum - 1) * limitNum;

    const where = {
      ...(status ? { status } : {}),
      ...(propertyType ? { propertyType } : {}),
      ...(city?.trim() ? { city: { contains: city.trim(), mode: "insensitive" } } : {}),
      ...(search?.trim()
        ? {
            OR: [
              { title: { contains: search.trim(), mode: "insensitive" } },
              { address: { contains: search.trim(), mode: "insensitive" } },
              { landlord: { fullName: { contains: search.trim(), mode: "insensitive" } } },
              { landlord: { email: { contains: search.trim(), mode: "insensitive" } } },
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
          landlord: {
            select: {
              id: true,
              email: true,
              fullName: true,
              phoneNumber: true,
              avatarUrl: true,
              landlordProfile: {
                select: {
                  displayName: true,
                  verificationStatus: true,
                },
              },
              verificationRequests: {
                select: {
                  status: true,
                },
                take: 1,
                orderBy: { createdAt: "desc" },
              },
            },
          },
          images: {
            orderBy: { sortOrder: "asc" },
            take: 1,
          },
        },
      }),
    ]);

    const formattedListings = listings.map((l) => {
      const isKycVerified = Boolean(
        l.landlord?.landlordProfile?.verificationStatus === "VERIFIED" ||
        l.landlord?.verificationRequests?.[0]?.status === "VERIFIED"
      );

      const landlord = l.landlord
        ? {
            ...l.landlord,
            landlordProfile: {
              ...l.landlord.landlordProfile,
              verificationStatus: isKycVerified
                ? "VERIFIED"
                : (l.landlord.landlordProfile?.verificationStatus || "PENDING"),
            },
            isKycVerified,
          }
        : null;

      return {
        ...l,
        landlord,
        thumbnailUrl:
          l.images?.[0]?.imageUrl ||
          "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&auto=format&fit=crop&q=80",
        listingThumbnailUrl:
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
    console.error("Get all listings error:", error);
    return res
      .status(500)
      .json({ message: "Lỗi máy chủ khi lấy danh sách tin." });
  }
}

/**
 * Lấy danh sách hồ sơ xác minh chủ nhà đang chờ duyệt (PENDING)
 * GET /api/admin/listings/verifications
 */
export async function getPendingVerifications(req, res) {
  try {
    const pendingRequests = await prisma.verificationRequest.findMany({
      where: {
        status: "PENDING",
      },
      include: {
        landlord: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phoneNumber: true,
            avatarUrl: true,
            createdAt: true,
            landlordProfile: true,
          },
        },
        documents: true,
      },
      orderBy: { submittedAt: "asc" },
    });

    const result = pendingRequests.map((reqItem) => {
      const frontDoc = reqItem.documents.find((d) => d.type === "CITIZEN_ID_FRONT");
      const backDoc = reqItem.documents.find((d) => d.type === "CITIZEN_ID_BACK");

      return {
        id: reqItem.id,
        requestId: reqItem.id,
        userId: reqItem.landlordId,
        user: reqItem.landlord,
        verificationStatus: reqItem.status,
        submittedAt: reqItem.submittedAt,
        kycDetails: {
          personalInfo: {
            fullName: reqItem.fullName,
            idNumber: reqItem.idNumber,
            dateOfBirth: reqItem.dateOfBirth || "",
            gender: reqItem.gender || "MALE",
            issueDate: reqItem.issueDate || "",
            issuingAuthority: reqItem.issuingAuthority || "",
            permanentAddress: reqItem.permanentAddress || "",
          },
          documents: {
            frontImage: frontDoc?.fileUrl || null,
            frontFileName: frontDoc?.fileName || null,
            frontFileSize: frontDoc?.fileSize || null,
            backImage: backDoc?.fileUrl || null,
            backFileName: backDoc?.fileName || null,
            backFileSize: backDoc?.fileSize || null,
          },
          submittedAt: reqItem.submittedAt,
        },
      };
    });

    return res.json({
      data: result,
      totalItems: result.length,
    });
  } catch (error) {
    console.error("Get pending verifications error:", error);
    return res.status(500).json({ message: "Lỗi máy chủ khi lấy danh sách hồ sơ xác minh." });
  }
}

/**
 * Phê duyệt hồ sơ xác minh chủ nhà (VERIFIED)
 * PATCH /api/admin/listings/verifications/:userId/approve
 */
export async function approveLandlordVerification(req, res) {
  try {
    const { userId } = req.params;
    const adminId = req.user.userId;

    const latestRequest = await prisma.verificationRequest.findFirst({
      where: {
        landlordId: userId,
        status: "PENDING",
      },
      orderBy: { submittedAt: "desc" },
    });

    // Cập nhật LandlordProfile
    const updatedProfile = await prisma.landlordProfile.upsert({
      where: { userId },
      create: {
        userId,
        verificationStatus: "VERIFIED",
      },
      update: {
        verificationStatus: "VERIFIED",
      },
      include: {
        user: {
          select: { id: true, fullName: true, email: true },
        },
      },
    });

    if (latestRequest) {
      // Cập nhật VerificationRequest và thêm VerificationHistory
      await prisma.$transaction([
        prisma.verificationRequest.update({
          where: { id: latestRequest.id },
          data: {
            status: "VERIFIED",
            adminId,
            reviewedAt: new Date(),
          },
        }),
        prisma.verificationHistory.create({
          data: {
            requestId: latestRequest.id,
            adminId,
            oldStatus: "PENDING",
            newStatus: "VERIFIED",
            note: "Admin phê duyệt hồ sơ eKYC hợp lệ",
          },
        }),
      ]);
    }

    // Ghi nhận AuditLog
    await prisma.auditLog.create({
      data: {
        adminId,
        action: "KYC_APPROVED",
        entityType: "VerificationRequest",
        entityId: latestRequest?.id || userId,
        details: {
          landlordId: userId,
          approvedAt: new Date().toISOString(),
          adminEmail: req.user.email,
        },
      },
    });

    return res.json({
      message: `Đã phê duyệt thành công hồ sơ xác minh cho chủ nhà ${updatedProfile.user?.fullName || "thành công"}.`,
      profile: updatedProfile,
    });
  } catch (error) {
    console.error("Approve verification error:", error);
    return res.status(500).json({ message: "Lỗi máy chủ khi phê duyệt hồ sơ." });
  }
}

/**
 * Từ chối hồ sơ xác minh chủ nhà kèm lý do
 * PATCH /api/admin/listings/verifications/:userId/reject
 */
export async function rejectLandlordVerification(req, res) {
  try {
    const { userId } = req.params;
    const adminId = req.user.userId;
    const { reason, rejectedFields } = req.body;

    if (!reason || !reason.trim()) {
      return res.status(400).json({ message: "Vui lòng nhập lý do từ chối hồ sơ." });
    }

    const latestRequest = await prisma.verificationRequest.findFirst({
      where: {
        landlordId: userId,
        status: "PENDING",
      },
      orderBy: { submittedAt: "desc" },
    });

    // Cập nhật LandlordProfile
    const updatedProfile = await prisma.landlordProfile.upsert({
      where: { userId },
      create: {
        userId,
        verificationStatus: "REJECTED",
      },
      update: {
        verificationStatus: "REJECTED",
      },
      include: {
        user: {
          select: { id: true, fullName: true, email: true },
        },
      },
    });

    if (latestRequest) {
      await prisma.$transaction([
        prisma.verificationRequest.update({
          where: { id: latestRequest.id },
          data: {
            status: "REJECTED",
            rejectionReason: reason.trim(),
            rejectedFields: Array.isArray(rejectedFields) ? rejectedFields : [],
            adminId,
            reviewedAt: new Date(),
          },
        }),
        prisma.verificationHistory.create({
          data: {
            requestId: latestRequest.id,
            adminId,
            oldStatus: "PENDING",
            newStatus: "REJECTED",
            note: reason.trim(),
          },
        }),
      ]);
    }

    // Ghi nhận AuditLog
    await prisma.auditLog.create({
      data: {
        adminId,
        action: "KYC_REJECTED",
        entityType: "VerificationRequest",
        entityId: latestRequest?.id || userId,
        details: {
          landlordId: userId,
          reason: reason.trim(),
          rejectedFields: Array.isArray(rejectedFields) ? rejectedFields : [],
          rejectedAt: new Date().toISOString(),
          adminEmail: req.user.email,
        },
      },
    });

    return res.json({
      message: `Đã từ chối hồ sơ xác minh của chủ nhà ${updatedProfile.user?.fullName || "thành công"}.`,
      profile: updatedProfile,
    });
  } catch (error) {
    console.error("Reject verification error:", error);
    return res.status(500).json({ message: "Lỗi máy chủ khi từ chối hồ sơ." });
  }
}

