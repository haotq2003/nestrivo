import { prisma } from "../lib/prisma.js";
import { createNotification } from "./notification.controller.js";

/**
 * Map enum sang nhãn hiển thị tiếng Việt
 */
export const REPORT_REASON_LABELS = {
  FAKE_LISTING: "Tin đăng ảo / Không tồn tại",
  FAKE_IMAGES: "Hình ảnh không giống thực tế",
  WRONG_PRICE: "Giá thuê khác với giá niêm yết",
  INCORRECT_AMENITIES: "Diện tích, tiện ích, nội thất không đúng",
  WRONG_ADDRESS: "Địa chỉ không chính xác",
  ALREADY_RENTED: "Phòng đã cho thuê nhưng vẫn đăng",
  MISLEADING_INFO: "Chủ nhà cung cấp thông tin gây hiểu nhầm",
  SCAM: "Có dấu hiệu lừa đảo / cọc tiền",
  OTHER: "Nội dung vi phạm quy chế khác",
};

/**
 * 1. Người dùng gửi báo cáo tin đăng vi phạm
 * POST /api/reports
 */
export async function createReport(req, res) {
  try {
    const reporterId = req.user?.userId;
    const { listingId, reason, description, evidenceUrls } = req.body;

    if (!listingId || !reason) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng chọn tin đăng và lý do báo cáo.",
      });
    }

    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      include: { landlord: true },
    });

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy tin đăng được báo cáo.",
      });
    }

    // Không cho phép chủ nhà tự báo cáo tin của chính mình
    if (listing.landlordId === reporterId) {
      return res.status(400).json({
        success: false,
        message: "Bạn không thể tự gửi báo cáo vi phạm cho tin đăng của mình.",
      });
    }

    // Kiểm tra xem người dùng đã có báo cáo đang chờ xử lý cho tin này chưa
    const existingPending = await prisma.report.findFirst({
      where: {
        listingId,
        reporterId,
        status: "PENDING",
      },
    });

    if (existingPending) {
      return res.status(400).json({
        success: false,
        message: "Bạn đã gửi báo cáo cho tin đăng này và đang được Ban quản trị xử lý.",
      });
    }

    // Giới hạn chống spam: Tối đa 3 báo cáo trong vòng 24 giờ cho mỗi tài khoản
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const reportsIn24h = await prisma.report.count({
      where: {
        reporterId,
        createdAt: { gte: oneDayAgo },
      },
    });

    if (reportsIn24h >= 3) {
      return res.status(429).json({
        success: false,
        message: "Bạn đã đạt giới hạn tối đa 3 báo cáo vi phạm trong vòng 24 giờ. Vui lòng quay lại sau.",
      });
    }

    const sanitizedEvidence = Array.isArray(evidenceUrls)
      ? evidenceUrls.filter((url) => typeof url === "string" && url.trim().length > 0)
      : [];

    const report = await prisma.report.create({
      data: {
        reporterId,
        listingId,
        reason,
        description: description?.trim() || null,
        evidenceUrls: sanitizedEvidence,
        status: "PENDING",
      },
      include: {
        listing: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    return res.status(201).json({
      success: true,
      message: "Cảm ơn bạn! Báo cáo vi phạm đã được gửi đến Ban quản trị Nestrivo để kiểm tra.",
      data: report,
    });
  } catch (error) {
    console.error("Lỗi createReport:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi hệ thống khi gửi báo cáo vi phạm.",
      error: error.message,
    });
  }
}

/**
 * 2. Lấy danh sách báo cáo do tài khoản hiện tại gửi
 * GET /api/reports/my-reports
 */
export async function getMyReports(req, res) {
  try {
    const reporterId = req.user?.userId;

    const reports = await prisma.report.findMany({
      where: { reporterId },
      orderBy: { createdAt: "desc" },
      include: {
        listing: {
          select: {
            id: true,
            title: true,
            price: true,
            status: true,
            images: { take: 1, orderBy: { sortOrder: "asc" } },
          },
        },
      },
    });

    const formatted = reports.map((r) => ({
      ...r,
      reasonLabel: REPORT_REASON_LABELS[r.reason] || r.reason,
    }));

    return res.json({
      success: true,
      data: formatted,
    });
  } catch (error) {
    console.error("Lỗi getMyReports:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi hệ thống khi tải báo cáo của bạn.",
      error: error.message,
    });
  }
}

/**
 * 2b. [Chủ nhà] Lấy danh sách các báo cáo vi phạm và kết luận của Admin liên quan đến tin đăng của mình
 * GET /api/reports/landlord/my-listing-reports
 */
export async function getLandlordListingReports(req, res) {
  try {
    const landlordId = req.user?.userId;

    // Tự động kiểm tra và gỡ các tin quá 24h cảnh báo chưa được sửa
    await checkAndAutoExpireWarningReports();

    const reports = await prisma.report.findMany({
      where: {
        listing: {
          landlordId,
        },
      },
      orderBy: { createdAt: "desc" },
      include: {
        listing: {
          select: {
            id: true,
            title: true,
            price: true,
            address: true,
            district: true,
            city: true,
            status: true,
            updatedAt: true,
            images: { take: 1, orderBy: { sortOrder: "asc" } },
          },
        },
      },
    });

    const now = Date.now();
    const formatted = reports.map((r) => {
      const isWarnAction = r.status === "RESOLVED" && r.resolutionAction === "WARN_LANDLORD";
      let warningExpiresAt = null;
      let isFixed = false;
      let isExpired = false;
      let remainingHours = 0;
      let remainingMinutes = 0;

      if (isWarnAction && r.resolvedAt) {
        const resolvedTime = new Date(r.resolvedAt).getTime();
        const expiresTime = resolvedTime + 24 * 60 * 60 * 1000;
        warningExpiresAt = new Date(expiresTime).toISOString();

        // Kiểm tra xem chủ nhà đã cập nhật lại tin sau thời điểm cảnh báo hay chưa
        if (r.listing?.updatedAt && new Date(r.listing.updatedAt).getTime() > resolvedTime) {
          isFixed = true;
        }

        if (now >= expiresTime) {
          isExpired = true;
        } else {
          const diffMs = Math.max(0, expiresTime - now);
          remainingHours = Math.floor(diffMs / (1000 * 60 * 60));
          remainingMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        }
      }

      return {
        id: r.id,
        listingId: r.listingId,
        listingTitle: r.listing?.title || "Tin đăng",
        listingPrice: r.listing?.price,
        listingAddress: r.listing ? `${r.listing.address}, ${r.listing.district}, ${r.listing.city}` : "",
        listingStatus: r.listing?.status,
        listingUpdatedAt: r.listing?.updatedAt || null,
        listingThumbnailUrl: r.listing?.images?.[0]?.imageUrl || r.listing?.images?.[0]?.url || null,
        reason: r.reason,
        reasonLabel: REPORT_REASON_LABELS[r.reason] || r.reason,
        description: r.description || "",
        evidenceUrls: r.evidenceUrls || [],
        status: r.status,
        adminNote: r.adminNote,
        resolutionAction: r.resolutionAction,
        createdAt: r.createdAt,
        resolvedAt: r.resolvedAt,
        warningExpiresAt,
        isWarningActive: isWarnAction && !isFixed && !isExpired,
        isFixed,
        isExpired,
        remainingHours,
        remainingMinutes,
      };
    });

    const warningCount = formatted.filter(
      (r) => r.status === "RESOLVED" && r.resolutionAction === "WARN_LANDLORD" && !r.isFixed
    ).length;

    const hiddenCount = formatted.filter(
      (r) => r.status === "RESOLVED" && (r.resolutionAction === "HIDE_LISTING" || r.listingStatus === "HIDDEN")
    ).length;

    const pendingCount = formatted.filter((r) => r.status === "PENDING").length;

    return res.json({
      success: true,
      data: formatted,
      stats: {
        total: formatted.length,
        warningCount,
        hiddenCount,
        pendingCount,
      },
    });
  } catch (error) {
    console.error("Lỗi getLandlordListingReports:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi hệ thống khi tải báo cáo vi phạm của chủ nhà.",
      error: error.message,
    });
  }
}

/**
 * 3. [Admin] Lấy danh sách báo cáo tin đăng (phân trang, lọc, thống kê)
 * GET /api/admin/reports
 */
export async function getAdminReports(req, res) {
  try {
    // Tự động kiểm tra và gỡ các tin quá 24h cảnh báo chưa được sửa
    await checkAndAutoExpireWarningReports();

    const {
      page = 1,
      limit = 10,
      status,
      reason,
      search,
    } = req.query;

    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit) || 10));
    const skip = (pageNum - 1) * limitNum;

    const where = {};

    if (status && status !== "ALL") {
      where.status = status;
    }

    if (reason && reason !== "ALL") {
      where.reason = reason;
    }

    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { listing: { title: { contains: q, mode: "insensitive" } } },
        { listing: { landlord: { fullName: { contains: q, mode: "insensitive" } } } },
        { reporter: { fullName: { contains: q, mode: "insensitive" } } },
        { description: { contains: q, mode: "insensitive" } },
      ];
    }

    const [
      totalItems,
      reports,
      totalPending,
      totalResolved,
      totalDismissed,
      totalAll,
    ] = await Promise.all([
      prisma.report.count({ where }),
      prisma.report.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: "desc" },
        include: {
          reporter: {
            select: {
              id: true,
              fullName: true,
              email: true,
              phoneNumber: true,
              avatarUrl: true,
            },
          },
          listing: {
            select: {
              id: true,
              title: true,
              price: true,
              status: true,
              updatedAt: true,
              address: true,
              district: true,
              city: true,
              images: { take: 1, orderBy: { sortOrder: "asc" } },
              landlord: {
                select: {
                  id: true,
                  fullName: true,
                  email: true,
                  phoneNumber: true,
                  avatarUrl: true,
                  isActive: true,
                },
              },
            },
          },
        },
      }),
      prisma.report.count({ where: { status: "PENDING" } }),
      prisma.report.count({ where: { status: "RESOLVED" } }),
      prisma.report.count({ where: { status: "DISMISSED" } }),
      prisma.report.count(),
    ]);

    // Thống kê lịch sử gửi báo cáo của từng người báo cáo (để Admin nhận biết spammer / đối thủ)
    const reporterIds = [...new Set(reports.map((r) => r.reporterId).filter(Boolean))];
    const reporterStatsRaw = reporterIds.length > 0
      ? await prisma.report.groupBy({
          by: ["reporterId", "status"],
          where: { reporterId: { in: reporterIds } },
          _count: { id: true },
        })
      : [];

    const reporterStatsMap = {};
    for (const row of reporterStatsRaw) {
      if (!reporterStatsMap[row.reporterId]) {
        reporterStatsMap[row.reporterId] = { total: 0, pending: 0, resolved: 0, dismissed: 0 };
      }
      reporterStatsMap[row.reporterId].total += row._count.id;
      if (row.status === "PENDING") reporterStatsMap[row.reporterId].pending += row._count.id;
      if (row.status === "RESOLVED") reporterStatsMap[row.reporterId].resolved += row._count.id;
      if (row.status === "DISMISSED") reporterStatsMap[row.reporterId].dismissed += row._count.id;
    }

    const now = Date.now();
    const formattedReports = reports.map((r) => {
      const stats = reporterStatsMap[r.reporterId] || { total: 1, pending: 1, resolved: 0, dismissed: 0 };
      const isWarnAction = r.status === "RESOLVED" && r.resolutionAction === "WARN_LANDLORD";
      let warningExpiresAt = null;
      let isFixed = false;
      let isExpired = false;
      let remainingHours = 0;
      let remainingMinutes = 0;

      if (isWarnAction && r.resolvedAt) {
        const resolvedTime = new Date(r.resolvedAt).getTime();
        const expiresTime = resolvedTime + 24 * 60 * 60 * 1000;
        warningExpiresAt = new Date(expiresTime).toISOString();

        if (r.listing?.updatedAt && new Date(r.listing.updatedAt).getTime() > resolvedTime) {
          isFixed = true;
        }

        if (now >= expiresTime) {
          isExpired = true;
        } else {
          const diffMs = Math.max(0, expiresTime - now);
          remainingHours = Math.floor(diffMs / (1000 * 60 * 60));
          remainingMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        }
      }

      return {
        id: r.id,
        listingId: r.listingId,
        listingTitle: r.listing?.title || "Tin đăng đã bị xóa",
        listingPrice: r.listing?.price,
        listingAddress: r.listing ? `${r.listing.address}, ${r.listing.district}, ${r.listing.city}` : "",
        listingStatus: r.listing?.status,
        listingUpdatedAt: r.listing?.updatedAt || null,
        listingThumbnailUrl: r.listing?.images?.[0]?.imageUrl || r.listing?.images?.[0]?.url || null,
        landlordId: r.listing?.landlord?.id,
        landlordName: r.listing?.landlord?.fullName || "Chủ nhà",
        landlordPhone: r.listing?.landlord?.phoneNumber || "Không có SĐT",
        landlordEmail: r.listing?.landlord?.email || "",
        landlordIsActive: r.listing?.landlord?.isActive ?? true,
        reporterId: r.reporterId,
        reporterName: r.reporter?.fullName || "Người dùng ẩn danh",
        reporterPhone: r.reporter?.phoneNumber || "Không có SĐT",
        reporterEmail: r.reporter?.email || "",
        reporterStats: stats,
        reporterTotalReports: stats.total,
        reporterDismissedReports: stats.dismissed,
        reason: r.reason,
        reasonLabel: REPORT_REASON_LABELS[r.reason] || r.reason,
        description: r.description || "Không có mô tả chi tiết.",
        evidenceUrls: r.evidenceUrls || [],
        status: r.status,
        adminNote: r.adminNote,
        resolutionAction: r.resolutionAction,
        resolutionNotes: r.adminNote,
        createdAt: r.createdAt,
        resolvedAt: r.resolvedAt,
        warningExpiresAt,
        isWarningActive: isWarnAction && !isFixed && !isExpired,
        isFixed,
        isExpired,
        remainingHours,
        remainingMinutes,
      };
    });

    return res.json({
      success: true,
      data: formattedReports,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalItems,
        totalPages: Math.ceil(totalItems / limitNum) || 1,
      },
      stats: {
        pending: totalPending,
        resolved: totalResolved,
        dismissed: totalDismissed,
        total: totalAll,
      },
    });
  } catch (error) {
    console.error("Lỗi getAdminReports:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi hệ thống khi tải danh sách báo cáo vi phạm.",
      error: error.message,
    });
  }
}

/**
 * 4. [Admin] Xem chi tiết một báo cáo
 * GET /api/admin/reports/:id
 */
export async function getAdminReportDetail(req, res) {
  try {
    const { id } = req.params;

    const report = await prisma.report.findUnique({
      where: { id },
      include: {
        reporter: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phoneNumber: true,
            avatarUrl: true,
            createdAt: true,
          },
        },
        listing: {
          include: {
            images: { orderBy: { sortOrder: "asc" } },
            landlord: {
              select: {
                id: true,
                fullName: true,
                email: true,
                phoneNumber: true,
                avatarUrl: true,
                isActive: true,
                landlordProfile: true,
              },
            },
          },
        },
      },
    });

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy báo cáo.",
      });
    }

    return res.json({
      success: true,
      data: {
        ...report,
        reasonLabel: REPORT_REASON_LABELS[report.reason] || report.reason,
      },
    });
  } catch (error) {
    console.error("Lỗi getAdminReportDetail:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi hệ thống khi tải chi tiết báo cáo.",
      error: error.message,
    });
  }
}

/**
 * 5. [Admin] Xử lý kết luận báo cáo vi phạm
 * PATCH /api/admin/reports/:id/resolve
 */
export async function resolveReport(req, res) {
  try {
    const { id } = req.params;
    const { action, adminNote } = req.body;
    const adminId = req.user?.userId;

    const report = await prisma.report.findUnique({
      where: { id },
      include: {
        listing: {
          include: { landlord: true },
        },
      },
    });

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy báo cáo vi phạm.",
      });
    }

    const note = adminNote?.trim() || "Đã kiểm tra và xử lý bởi Quản trị viên";
    const nextStatus = action === "DISMISS" ? "DISMISSED" : "RESOLVED";

    const operations = [
      prisma.report.update({
        where: { id },
        data: {
          status: nextStatus,
          adminNote: note,
          resolutionAction: action,
          resolvedAt: new Date(),
        },
      }),
      prisma.auditLog.create({
        data: {
          adminId,
          action: action === "DISMISS" ? "DISMISS_REPORT" : "RESOLVE_REPORT",
          entityType: "REPORT",
          entityId: id,
          details: {
            action,
            adminNote: note,
            listingId: report.listingId,
            landlordId: report.listing?.landlordId,
          },
        },
      }),
    ];

    // Thực hiện hành động can thiệp tương ứng
    if (action === "HIDE_LISTING" && report.listingId) {
      operations.push(
        prisma.listing.update({
          where: { id: report.listingId },
          data: { status: "HIDDEN" },
        })
      );
    } else if (action === "LOCK_LANDLORD" && report.listing?.landlordId) {
      operations.push(
        prisma.user.update({
          where: { id: report.listing.landlordId },
          data: {
            isActive: false,
            lockReason: `Bị khóa do vi phạm báo cáo nghiêm trọng: ${note}`,
            lockedAt: new Date(),
          },
        })
      );
      // Đồng thời ẩn tin vi phạm
      operations.push(
        prisma.listing.update({
          where: { id: report.listingId },
          data: { status: "HIDDEN" },
        })
      );
    }

    await prisma.$transaction(operations);

    // 1. Tạo thông báo cho Chủ nhà
    if (report.listing?.landlordId) {
      if (action === "WARN_LANDLORD") {
        await createNotification({
          userId: report.listing.landlordId,
          type: "ADMIN_WARNING_24H",
          title: `⚠️ Cảnh báo vi phạm 24h: "${report.listing.title}"`,
          message: `Ban quản trị yêu cầu bạn cập nhật lại thông tin phòng trong vòng 24 giờ. Lý do: "${note}". Sau 24h nếu không sửa, tin sẽ tự động bị ẩn khỏi sàn.`,
          link: `/landlord/listings/${report.listingId}/edit`,
          metadata: { listingId: report.listingId, reportId: id, action },
        });
      } else if (action === "HIDE_LISTING") {
        await createNotification({
          userId: report.listing.landlordId,
          type: "ADMIN_HIDE_LISTING",
          title: `🚫 Tin đăng đã bị gỡ: "${report.listing.title}"`,
          message: `Tin đăng của bạn đã bị gỡ khỏi sàn Nestrivo do vi phạm quy chế: "${note}".`,
          link: `/landlord/listings/${report.listingId}`,
          metadata: { listingId: report.listingId, reportId: id, action },
        });
      } else if (action === "LOCK_LANDLORD") {
        await createNotification({
          userId: report.listing.landlordId,
          type: "SYSTEM_ANNOUNCEMENT",
          title: `🔒 Tài khoản của bạn đã bị khóa`,
          message: `Tài khoản của bạn đã bị khóa do vi phạm quy chế nghiêm trọng: "${note}". Vui lòng liên hệ hỗ trợ để được giải quyết.`,
          metadata: { reportId: id, action },
        });
      }
    }

    // 2. Tạo thông báo cho Người gửi báo cáo (Khách thuê)
    if (report.reporterId) {
      if (action === "DISMISS") {
        await createNotification({
          userId: report.reporterId,
          type: "REPORT_DISMISSED",
          title: `Báo cáo tin đăng đã được xem xét`,
          message: `Báo cáo của bạn về tin "${report.listing?.title || "Phòng trọ"}" đã được BQT xem xét và bác bỏ (Lý do: ${note}). Cảm ơn bạn đã luôn đồng hành cùng Nestrivo.`,
          link: report.listingId ? `/rooms/${report.listingId}` : "/",
          metadata: { listingId: report.listingId, reportId: id, action },
        });
      } else {
        await createNotification({
          userId: report.reporterId,
          type: "REPORT_RESOLVED",
          title: `Báo cáo vi phạm đã được xử lý`,
          message: `Cảm ơn bạn đã đóng góp! Báo cáo của bạn cho tin "${report.listing?.title || "Phòng trọ"}" đã được BQT xử lý (${action === "WARN_LANDLORD" ? "Đã gửi cảnh báo 24h yêu cầu chủ nhà sửa thông số" : "Đã gỡ bỏ tin vi phạm khỏi sàn"}).`,
          link: report.listingId ? `/rooms/${report.listingId}` : "/",
          metadata: { listingId: report.listingId, reportId: id, action },
        });
      }
    }

    let resultMsg = "Đã xử lý báo cáo thành công.";
    if (action === "HIDE_LISTING") resultMsg = "Đã ẩn tin đăng vi phạm khỏi sàn Nestrivo.";
    else if (action === "WARN_LANDLORD") resultMsg = "Đã gửi cảnh báo và yêu cầu chủ nhà giải trình/chỉnh sửa.";
    else if (action === "LOCK_LANDLORD") resultMsg = "Đã khóa tài khoản chủ nhà và gỡ tin đăng vi phạm.";
    else if (action === "DISMISS") resultMsg = "Đã bác bỏ báo cáo do không đủ cơ sở vi phạm.";

    return res.json({
      success: true,
      message: resultMsg,
    });
  } catch (error) {
    console.error("Lỗi resolveReport:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi hệ thống khi xử lý báo cáo.",
      error: error.message,
    });
  }
}

/**
 * 6. Tự động kiểm tra và gỡ các tin đăng vi phạm nhẹ (WARN_LANDLORD)
 * đã quá thời hạn 24 giờ mà chủ nhà không vào chỉnh sửa tin (listing.updatedAt <= report.resolvedAt)
 */
export async function checkAndAutoExpireWarningReports() {
  try {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // Tìm các báo cáo WARN_LANDLORD đã được xử lý từ hơn 24 giờ trước
    const expiredWarningReports = await prisma.report.findMany({
      where: {
        status: "RESOLVED",
        resolutionAction: "WARN_LANDLORD",
        resolvedAt: { lte: oneDayAgo },
      },
      include: {
        listing: {
          select: {
            id: true,
            title: true,
            status: true,
            updatedAt: true,
            landlordId: true,
          },
        },
      },
    });

    if (!expiredWarningReports.length) return 0;

    // Tìm một tài khoản ADMIN hợp lệ để ghi nhận AuditLog hệ thống
    const systemAdmin = await prisma.user.findFirst({
      where: { roles: { has: "ADMIN" } },
      select: { id: true },
    });

    let autoHiddenCount = 0;

    for (const report of expiredWarningReports) {
      const listing = report.listing;
      if (!listing) continue;

      // Điều kiện tự động gỡ:
      // 1. Tin hiện vẫn đang ở trạng thái PUBLISHED
      // 2. Chủ nhà CHƯA sửa tin sau mốc thời gian Admin cảnh báo (listing.updatedAt <= report.resolvedAt)
      if (
        listing.status === "PUBLISHED" &&
        report.resolvedAt &&
        new Date(listing.updatedAt).getTime() <= new Date(report.resolvedAt).getTime()
      ) {
        const operations = [
          prisma.listing.update({
            where: { id: listing.id },
            data: { status: "HIDDEN" },
          }),
        ];

        if (systemAdmin?.id) {
          operations.push(
            prisma.auditLog.create({
              data: {
                adminId: systemAdmin.id,
                action: "AUTO_HIDE_EXPIRED_WARNING",
                entityType: "LISTING",
                entityId: listing.id,
                details: {
                  reason: "Tự động gỡ tin: Quá hạn 24 giờ mà chủ nhà không chỉnh sửa tin theo cảnh báo của BQT.",
                  reportId: report.id,
                  resolvedAt: report.resolvedAt,
                  autoHiddenAt: new Date(),
                },
              },
            })
          );
        }

        await prisma.$transaction(operations);
        autoHiddenCount++;
        console.log(`[AutoModeration] Tin đăng "${listing.title}" (${listing.id}) đã tự động bị gỡ khỏi sàn do quá hạn 24h.`);

        if (listing.landlordId) {
          await createNotification({
            userId: listing.landlordId,
            type: "ADMIN_AUTO_HIDE",
            title: `⏰ Tin đăng đã tự động bị gỡ: "${listing.title}"`,
            message: `Quá hạn 24 giờ mà thông tin chưa được cập nhật theo yêu cầu của BQT, tin đăng đã tự động bị gỡ khỏi sàn. Bạn có thể vào chỉnh sửa lại thông tin để mở lại tin.`,
            link: `/landlord/listings/${listing.id}/edit`,
            metadata: { listingId: listing.id, reportId: report.id },
          });
        }
      }
    }

    return autoHiddenCount;
  } catch (error) {
    console.error("Lỗi checkAndAutoExpireWarningReports:", error);
    return 0;
  }
}
