import { prisma } from "../lib/prisma.js";

/**
 * 1. Viết đánh giá cho chủ nhà & tin đăng
 * POST /api/reviews
 */
export async function createReview(req, res) {
  try {
    const renterId = req.user.userId;
    const {
      landlordId,
      listingId,
      rating,
      accuracyRating,
      communicationRating,
      supportRating,
      content,
      rentalConfirmationId,
      inquiryId,
      priceAccurate,
      amenitiesAccurate,
      evidenceUrls,
    } = req.body;

    if (!landlordId || !listingId || !rating || !content) {
      return res.status(400).json({
        message: "Vui lòng cung cấp đầy đủ thông tin: chủ nhà, tin đăng, số sao đánh giá và nội dung.",
      });
    }

    const ratingNum = parseInt(rating);
    if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      return res.status(400).json({ message: "Số sao đánh giá phải từ 1 đến 5 sao." });
    }

    if (renterId === landlordId) {
      return res.status(400).json({ message: "Chủ nhà không thể tự đánh giá chính mình." });
    }

    // Kiểm tra chủ nhà có tồn tại
    const landlord = await prisma.user.findUnique({
      where: { id: landlordId },
      include: { landlordProfile: true },
    });

    if (!landlord) {
      return res.status(404).json({ message: "Không tìm thấy thông tin chủ nhà." });
    }

    // Kiểm tra tin đăng có thuộc về chủ nhà này không
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
    });

    if (!listing || listing.landlordId !== landlordId) {
      return res.status(400).json({ message: "Tin đăng không hợp lệ hoặc không thuộc về chủ nhà này." });
    }

    // Kiểm tra xem đã từng đánh giá tin đăng này của chủ nhà chưa
    const existingReview = await prisma.landlordReview.findFirst({
      where: {
        renterId,
        landlordId,
        listingId,
      },
    });

    if (existingReview) {
      return res.status(400).json({
        message: "Bạn đã gửi đánh giá cho tin đăng này rồi. Mỗi người thuê chỉ được đánh giá 1 lần cho mỗi phòng.",
      });
    }

    // Kiểm tra xác thực thuê phòng thực tế (RentalConfirmation nếu có)
    let isVerifiedStay = false;
    if (rentalConfirmationId) {
      const rental = await prisma.rentalConfirmation.findUnique({
        where: { id: rentalConfirmationId },
      });
      if (rental && rental.renterId === renterId && rental.landlordId === landlordId) {
        isVerifiedStay = true;
      }
    }

    // Kiểm tra xác thực lịch xem phòng thực tế (Inquiry)
    let isVerifiedViewing = false;
    let validInquiryId = inquiryId || null;

    if (inquiryId) {
      const inq = await prisma.inquiry.findUnique({
        where: { id: inquiryId },
      });
      if (
        inq &&
        inq.renterId === renterId &&
        inq.listingId === listingId &&
        ["CONFIRMED", "CONTACTED", "CLOSED"].includes(inq.status)
      ) {
        isVerifiedViewing = true;
      }
    } else {
      // Tự động tìm xem người thuê có lịch xem phòng đã xác nhận/hoàn thành cho tin này không
      const autoInq = await prisma.inquiry.findFirst({
        where: {
          renterId,
          listingId,
          status: { in: ["CONFIRMED", "CONTACTED", "CLOSED"] },
        },
        orderBy: { createdAt: "desc" },
      });
      if (autoInq) {
        isVerifiedViewing = true;
        validInquiryId = autoInq.id;
      }
    }

    const sanitizedEvidence = Array.isArray(evidenceUrls)
      ? evidenceUrls.filter((url) => typeof url === "string" && url.trim().length > 0)
      : [];

    // Tạo review
    const review = await prisma.landlordReview.create({
      data: {
        renterId,
        landlordId,
        listingId,
        rentalConfirmationId: rentalConfirmationId || null,
        inquiryId: validInquiryId,
        rating: ratingNum,
        accuracyRating: accuracyRating ? parseInt(accuracyRating) : null,
        communicationRating: communicationRating ? parseInt(communicationRating) : null,
        supportRating: supportRating ? parseInt(supportRating) : null,
        priceAccurate: priceAccurate === undefined ? true : Boolean(priceAccurate),
        amenitiesAccurate: amenitiesAccurate === undefined ? true : Boolean(amenitiesAccurate),
        evidenceUrls: sanitizedEvidence,
        content: content.trim(),
        isVerifiedStay,
        isVerifiedViewing,
        status: "PUBLISHED",
      },
      include: {
        renter: {
          select: { id: true, fullName: true, avatarUrl: true },
        },
        listing: {
          select: { id: true, title: true },
        },
      },
    });

    // Cập nhật điểm trung bình (averageRating) & tổng số review (reviewCount) của LandlordProfile
    const reviewsAggregate = await prisma.landlordReview.aggregate({
      where: {
        landlordId,
        status: "PUBLISHED",
      },
      _avg: { rating: true },
      _count: { id: true },
    });

    const newAvg = reviewsAggregate._avg.rating || ratingNum;
    const newCount = reviewsAggregate._count.id || 1;

    await prisma.landlordProfile.upsert({
      where: { userId: landlordId },
      create: {
        userId: landlordId,
        averageRating: newAvg,
        reviewCount: newCount,
      },
      update: {
        averageRating: newAvg,
        reviewCount: newCount,
      },
    });

    // Ghi nhận AuditLog
    await prisma.auditLog.create({
      data: {
        adminId: renterId,
        action: "REVIEW_CREATED",
        entityType: "LandlordReview",
        entityId: review.id,
        details: {
          landlordId,
          listingId,
          rating: ratingNum,
          newAverage: Number(newAvg.toFixed(2)),
          newCount,
        },
      },
    });

    return res.status(201).json({
      message: "Gửi đánh giá thành công! Đánh giá đã được đăng công khai.",
      review,
    });
  } catch (error) {
    console.error("Create review error:", error);
    return res.status(500).json({ message: "Lỗi máy chủ khi tạo đánh giá." });
  }
}

/**
 * 2. Lấy danh sách review & thống kê uy tín của một chủ nhà
 * GET /api/reviews/landlords/:landlordId
 */
export async function getLandlordReviews(req, res) {
  try {
    const { landlordId } = req.params;
    const { page = 1, limit = 10, star } = req.query;

    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.max(1, Math.min(50, parseInt(limit) || 10));
    const skip = (pageNum - 1) * limitNum;

    const where = {
      landlordId,
      status: "PUBLISHED",
      ...(star ? { rating: parseInt(star) } : {}),
    };

    // Lấy thông tin chủ nhà & thống kê tổng thể
    const [landlord, totalItems, reviews, starStats, criteriaStats] = await Promise.all([
      prisma.user.findUnique({
        where: { id: landlordId },
        select: {
          id: true,
          fullName: true,
          avatarUrl: true,
          createdAt: true,
          landlordProfile: true,
        },
      }),
      prisma.landlordReview.count({ where }),
      prisma.landlordReview.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: "desc" },
        include: {
          renter: {
            select: { id: true, fullName: true, avatarUrl: true },
          },
          listing: {
            select: { id: true, title: true, address: true },
          },
        },
      }),
      // Phân bổ sao (1-5 sao)
      prisma.landlordReview.groupBy({
        by: ["rating"],
        where: { landlordId, status: "PUBLISHED" },
        _count: { id: true },
      }),
      // Điểm trung bình các tiêu chí phụ
      prisma.landlordReview.aggregate({
        where: { landlordId, status: "PUBLISHED" },
        _avg: {
          rating: true,
          accuracyRating: true,
          communicationRating: true,
          supportRating: true,
        },
      }),
    ]);

    if (!landlord) {
      return res.status(404).json({ message: "Không tìm thấy thông tin chủ nhà." });
    }

    // Format phân bổ sao: { 5: count, 4: count, 3: count, 2: count, 1: count }
    const ratingBreakdown = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    for (const item of starStats) {
      if (ratingBreakdown[item.rating] !== undefined) {
        ratingBreakdown[item.rating] = item._count.id;
      }
    }

    const totalAllReviews = Object.values(ratingBreakdown).reduce((a, b) => a + b, 0);

    return res.json({
      landlord: {
        id: landlord.id,
        fullName: landlord.fullName,
        avatarUrl: landlord.avatarUrl,
        verificationStatus: landlord.landlordProfile?.verificationStatus || "NOT_SUBMITTED",
        isVerified: landlord.landlordProfile?.verificationStatus === "VERIFIED",
        responseRate: landlord.landlordProfile?.responseRate || 95,
      },
      stats: {
        averageRating: criteriaStats._avg.rating ? Number(criteriaStats._avg.rating.toFixed(1)) : 0,
        totalReviews: totalAllReviews,
        ratingBreakdown,
        criteriaAverage: {
          accuracy: criteriaStats._avg.accuracyRating ? Number(criteriaStats._avg.accuracyRating.toFixed(1)) : null,
          communication: criteriaStats._avg.communicationRating ? Number(criteriaStats._avg.communicationRating.toFixed(1)) : null,
          support: criteriaStats._avg.supportRating ? Number(criteriaStats._avg.supportRating.toFixed(1)) : null,
        },
      },
      data: reviews,
      pagination: {
        totalItems,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(totalItems / limitNum),
      },
    });
  } catch (error) {
    console.error("Get landlord reviews error:", error);
    return res.status(500).json({ message: "Lỗi máy chủ khi lấy danh sách đánh giá." });
  }
}

/**
 * 3. Chủ nhà gửi phản hồi cho một review
 * POST /api/reviews/:id/reply
 */
export async function replyToReview(req, res) {
  try {
    const { id } = req.params;
    const landlordId = req.user.userId;
    const { replyMessage } = req.body;

    if (!replyMessage || !replyMessage.trim()) {
      return res.status(400).json({ message: "Nội dung phản hồi không được để trống." });
    }

    const review = await prisma.landlordReview.findUnique({
      where: { id },
    });

    if (!review) {
      return res.status(404).json({ message: "Không tìm thấy đánh giá này." });
    }

    if (review.landlordId !== landlordId && !req.user.roles?.includes("ADMIN")) {
      return res.status(403).json({ message: "Bạn chỉ có thể phản hồi đánh giá viết cho chính mình." });
    }

    const updatedReview = await prisma.landlordReview.update({
      where: { id },
      data: {
        landlordReply: replyMessage.trim(),
        repliedAt: new Date(),
      },
    });

    return res.json({
      message: "Phản hồi đánh giá thành công.",
      review: updatedReview,
    });
  } catch (error) {
    console.error("Reply to review error:", error);
    return res.status(500).json({ message: "Lỗi máy chủ khi phản hồi đánh giá." });
  }
}

/**
 * 4. Báo cáo đánh giá không phù hợp (Chủ nhà báo cáo review bôi nhọ, sai sự thật)
 * POST /api/reviews/:id/report
 */
export async function reportReview(req, res) {
  try {
    const { id } = req.params;
    const reporterId = req.user.userId;
    const { reason, description } = req.body;

    const validReasons = [
      "OFFENSIVE_LANGUAGE",
      "FALSE_INFORMATION",
      "BLACKMAIL_OR_EXTORTION",
      "SPAM",
      "OTHER",
    ];

    if (!reason || !validReasons.includes(reason)) {
      return res.status(400).json({ message: "Lý do báo cáo không hợp lệ." });
    }

    const review = await prisma.landlordReview.findUnique({
      where: { id },
    });

    if (!review) {
      return res.status(404).json({ message: "Không tìm thấy đánh giá cần báo cáo." });
    }

    const report = await prisma.reviewReport.create({
      data: {
        reviewId: id,
        reporterId,
        reason,
        description: description?.trim() || null,
        status: "PENDING",
      },
    });

    // Cập nhật trạng thái review sang FLAGGED
    await prisma.landlordReview.update({
      where: { id },
      data: { status: "FLAGGED" },
    });

    return res.status(201).json({
      message: "Gửi báo cáo đánh giá thành công! Quản trị viên sẽ kiểm duyệt trong 24h.",
      report,
    });
  } catch (error) {
    console.error("Report review error:", error);
    return res.status(500).json({ message: "Lỗi máy chủ khi báo cáo đánh giá." });
  }
}

/**
 * 5. Admin: Lấy danh sách các đánh giá bị báo cáo
 * GET /api/admin/reviews/reports
 */
export async function getAdminReviewReports(req, res) {
  try {
    const { status = "PENDING", page = 1, limit = 10 } = req.query;

    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.max(1, Math.min(50, parseInt(limit) || 10));
    const skip = (pageNum - 1) * limitNum;

    const where = status ? { status } : {};

    const [totalItems, reports] = await Promise.all([
      prisma.reviewReport.count({ where }),
      prisma.reviewReport.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: "desc" },
        include: {
          reporter: {
            select: { id: true, fullName: true, email: true },
          },
          review: {
            include: {
              renter: {
                select: { id: true, fullName: true, email: true },
              },
              landlord: {
                select: { id: true, fullName: true, email: true },
              },
              listing: {
                select: { id: true, title: true },
              },
            },
          },
        },
      }),
    ]);

    return res.json({
      data: reports,
      pagination: {
        totalItems,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(totalItems / limitNum),
      },
    });
  } catch (error) {
    console.error("Get admin review reports error:", error);
    return res.status(500).json({ message: "Lỗi máy chủ khi lấy danh sách báo cáo đánh giá." });
  }
}

/**
 * 6. Admin: Phân xử báo cáo review (Ẩn review hoặc Giữ nguyên)
 * PATCH /api/admin/reviews/reports/:id/resolve
 */
export async function resolveReviewReport(req, res) {
  try {
    const { id } = req.params;
    const { action, adminNote } = req.body; // action: "HIDE_REVIEW" | "DISMISS"

    if (action !== "HIDE_REVIEW" && action !== "DISMISS") {
      return res.status(400).json({ message: "Hành động xử lý không hợp lệ (HIDE_REVIEW hoặc DISMISS)." });
    }

    const report = await prisma.reviewReport.findUnique({
      where: { id },
      include: { review: true },
    });

    if (!report) {
      return res.status(404).json({ message: "Không tìm thấy báo cáo." });
    }

    const isHiding = action === "HIDE_REVIEW";

    await prisma.$transaction([
      prisma.reviewReport.update({
        where: { id },
        data: {
          status: isHiding ? "RESOLVED_HIDDEN" : "DISMISSED",
          adminNote: adminNote?.trim() || null,
          resolvedAt: new Date(),
        },
      }),
      prisma.landlordReview.update({
        where: { id: report.reviewId },
        data: {
          status: isHiding ? "HIDDEN" : "PUBLISHED",
        },
      }),
    ]);

    // Nếu ẩn review, tính toán lại averageRating cho chủ nhà
    if (isHiding) {
      const landlordId = report.review.landlordId;
      const reviewsAggregate = await prisma.landlordReview.aggregate({
        where: {
          landlordId,
          status: "PUBLISHED",
        },
        _avg: { rating: true },
        _count: { id: true },
      });

      await prisma.landlordProfile.update({
        where: { userId: landlordId },
        data: {
          averageRating: reviewsAggregate._avg.rating || 0,
          reviewCount: reviewsAggregate._count.id || 0,
        },
      });
    }

    return res.json({
      message: isHiding
        ? "Đã chấp thuận báo cáo và ẩn đánh giá vi phạm."
        : "Đã bác bỏ báo cáo và khôi phục hiển thị đánh giá.",
    });
  } catch (error) {
    console.error("Resolve review report error:", error);
    return res.status(500).json({ message: "Lỗi máy chủ khi xử lý báo cáo review." });
  }
}

/**
 * 7. Xác nhận giao dịch thuê phòng (Rental Confirmation)
 * POST /api/rentals/confirm
 */
export async function createRentalConfirmation(req, res) {
  try {
    const landlordId = req.user.userId;
    const { renterId, listingId, moveInDate, monthlyRent, deposit } = req.body;

    if (!renterId || !listingId) {
      return res.status(400).json({ message: "Vui lòng cung cấp người thuê và tin đăng." });
    }

    const confirmation = await prisma.rentalConfirmation.create({
      data: {
        renterId,
        landlordId,
        listingId,
        moveInDate: moveInDate ? new Date(moveInDate) : null,
        monthlyRent: monthlyRent ? parseFloat(monthlyRent) : null,
        deposit: deposit ? parseFloat(deposit) : null,
        status: "CONFIRMED",
        confirmedAt: new Date(),
      },
      include: {
        renter: {
          select: { id: true, fullName: true, email: true },
        },
        listing: {
          select: { id: true, title: true },
        },
      },
    });

    return res.status(201).json({
      message: "Xác nhận khách thuê thành công! Khách thuê đã được mở quyền viết đánh giá uy tín.",
      confirmation,
    });
  } catch (error) {
    console.error("Create rental confirmation error:", error);
    return res.status(500).json({ message: "Lỗi máy chủ khi xác nhận thuê phòng." });
  }
}

/**
 * 8. Lấy danh sách đánh giá của một tin đăng cụ thể (bao gồm đánh giá xem phòng)
 * GET /api/reviews/listings/:listingId
 */
export async function getListingReviews(req, res) {
  try {
    const { listingId } = req.params;
    const { page = 1, limit = 10, star } = req.query;

    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.max(1, Math.min(50, parseInt(limit) || 10));
    const skip = (pageNum - 1) * limitNum;

    const where = {
      listingId,
      status: "PUBLISHED",
      ...(star ? { rating: parseInt(star) } : {}),
    };

    const [totalItems, reviews, aggregateStats, priceStats, viewingCount] = await Promise.all([
      prisma.landlordReview.count({ where }),
      prisma.landlordReview.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: "desc" },
        include: {
          renter: {
            select: { id: true, fullName: true, avatarUrl: true },
          },
        },
      }),
      prisma.landlordReview.aggregate({
        where: { listingId, status: "PUBLISHED" },
        _avg: {
          rating: true,
          accuracyRating: true,
          communicationRating: true,
          supportRating: true,
        },
        _count: { id: true },
      }),
      // Thống kê độ chính xác giá & tiện ích
      prisma.landlordReview.count({
        where: { listingId, status: "PUBLISHED", priceAccurate: true },
      }),
      prisma.landlordReview.count({
        where: { listingId, status: "PUBLISHED", isVerifiedViewing: true },
      }),
    ]);

    const totalAllReviews = aggregateStats._count.id || 0;
    const priceAccuracyPercent = totalAllReviews > 0
      ? Math.round((priceStats / totalAllReviews) * 100)
      : 100;

    return res.json({
      success: true,
      data: reviews,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalItems,
        totalPages: Math.ceil(totalItems / limitNum) || 1,
      },
      stats: {
        totalReviews: totalAllReviews,
        averageRating: Number((aggregateStats._avg.rating || 0).toFixed(1)),
        accuracyAvg: Number((aggregateStats._avg.accuracyRating || 0).toFixed(1)),
        communicationAvg: Number((aggregateStats._avg.communicationRating || 0).toFixed(1)),
        supportAvg: Number((aggregateStats._avg.supportRating || 0).toFixed(1)),
        priceAccuracyPercent,
        verifiedViewingCount: viewingCount,
      },
    });
  } catch (error) {
    console.error("Get listing reviews error:", error);
    return res.status(500).json({ message: "Lỗi máy chủ khi tải đánh giá tin đăng." });
  }
}

/**
 * 9. Kiểm tra xem người dùng hiện tại có đủ điều kiện đánh giá xem phòng không
 * GET /api/reviews/check-eligibility/:listingId
 */
export async function checkReviewEligibility(req, res) {
  try {
    const renterId = req.user?.userId;
    const { listingId } = req.params;

    if (!renterId) {
      return res.json({ canReview: false, reason: "NOT_LOGGED_IN" });
    }

    // Kiểm tra tin đăng
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      select: { landlordId: true },
    });

    if (!listing) {
      return res.status(404).json({ canReview: false, message: "Không tìm thấy tin đăng." });
    }

    if (listing.landlordId === renterId) {
      return res.json({ canReview: false, reason: "IS_LANDLORD" });
    }

    // Kiểm tra xem đã review chưa
    const existingReview = await prisma.landlordReview.findFirst({
      where: { renterId, listingId },
    });

    if (existingReview) {
      return res.json({
        canReview: false,
        alreadyReviewed: true,
        review: existingReview,
      });
    }

    // Kiểm tra có lịch xem phòng hợp lệ (Inquiry) đã xác nhận hoặc hoàn thành không
    const inquiry = await prisma.inquiry.findFirst({
      where: {
        renterId,
        listingId,
        status: { in: ["CONFIRMED", "CONTACTED", "CLOSED"] },
      },
      orderBy: { createdAt: "desc" },
    });

    // Kiểm tra có xác nhận thuê phòng (RentalConfirmation) không
    const rental = await prisma.rentalConfirmation.findFirst({
      where: {
        renterId,
        listingId,
        status: "CONFIRMED",
      },
    });

    const canReview = Boolean(inquiry || rental);

    return res.json({
      canReview,
      canReviewViewing: Boolean(inquiry),
      inquiryId: inquiry ? inquiry.id : null,
      canReviewStay: Boolean(rental),
      rentalConfirmationId: rental ? rental.id : null,
      landlordId: listing.landlordId,
    });
  } catch (error) {
    console.error("Check review eligibility error:", error);
    return res.status(500).json({ message: "Lỗi khi kiểm tra quyền đánh giá." });
  }
}

