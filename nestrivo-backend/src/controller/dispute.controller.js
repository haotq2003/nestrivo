import { prisma } from "../lib/prisma.js";

/**
 * 1. Tạo khiếu nại mới (Cả Renter và Landlord đều có quyền)
 * POST /api/disputes
 */
export async function createDispute(req, res) {
  try {
    const creatorId = req.user.userId;
    const { respondentId, listingId, category, title, description, evidences } = req.body;

    if (!respondentId || !category || !title || !description) {
      return res.status(400).json({
        message: "Vui lòng cung cấp đầy đủ thông tin: đối tượng bị khiếu nại, phân loại, tiêu đề và mô tả chi tiết.",
      });
    }

    if (creatorId === respondentId) {
      return res.status(400).json({ message: "Bạn không thể tự gửi khiếu nại chính mình." });
    }

    const respondent = await prisma.user.findUnique({
      where: { id: respondentId },
    });

    if (!respondent) {
      return res.status(404).json({ message: "Không tìm thấy người dùng bị khiếu nại." });
    }

    const dispute = await prisma.dispute.create({
      data: {
        creatorId,
        respondentId,
        listingId: listingId || null,
        category,
        title: title.trim(),
        description: description.trim(),
        status: "OPEN",
        evidences: Array.isArray(evidences) && evidences.length > 0
          ? {
              create: evidences.map((ev) => ({
                uploaderId: creatorId,
                fileUrl: ev.fileUrl,
                caption: ev.caption || null,
              })),
            }
          : undefined,
      },
      include: {
        evidences: true,
        creator: {
          select: { id: true, fullName: true, email: true },
        },
        respondent: {
          select: { id: true, fullName: true, email: true },
        },
      },
    });

    // Ghi nhận AuditLog
    await prisma.auditLog.create({
      data: {
        adminId: creatorId,
        action: "DISPUTE_OPENED",
        entityType: "Dispute",
        entityId: dispute.id,
        details: {
          category,
          title: dispute.title,
          respondentId,
          listingId: listingId || null,
        },
      },
    });

    return res.status(201).json({
      message: "Gửi khiếu nại thành công! Ban quản trị Nestrivo sẽ tiếp nhận và xử lý.",
      dispute,
    });
  } catch (error) {
    console.error("Create dispute error:", error);
    return res.status(500).json({ message: "Lỗi máy chủ khi tạo khiếu nại." });
  }
}

/**
 * 2. Lấy danh sách khiếu nại của cá nhân (Người gửi hoặc Người bị khiếu nại)
 * GET /api/disputes/my
 */
export async function getMyDisputes(req, res) {
  try {
    const userId = req.user.userId;

    const disputes = await prisma.dispute.findMany({
      where: {
        OR: [{ creatorId: userId }, { respondentId: userId }],
      },
      orderBy: { createdAt: "desc" },
      include: {
        creator: {
          select: { id: true, fullName: true, email: true, avatarUrl: true },
        },
        respondent: {
          select: { id: true, fullName: true, email: true, avatarUrl: true },
        },
        listing: {
          select: { id: true, title: true, address: true },
        },
        _count: {
          select: { evidences: true, messages: true },
        },
      },
    });

    return res.json({
      data: disputes,
      totalItems: disputes.length,
    });
  } catch (error) {
    console.error("Get my disputes error:", error);
    return res.status(500).json({ message: "Lỗi máy chủ khi lấy danh sách khiếu nại." });
  }
}

/**
 * 3. Xem chi tiết một vụ khiếu nại kèm bằng chứng và lịch sử trao đổi
 * GET /api/disputes/:id
 */
export async function getDisputeDetail(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const isAdmin = req.user.roles?.includes("ADMIN");

    const dispute = await prisma.dispute.findUnique({
      where: { id },
      include: {
        creator: {
          select: { id: true, fullName: true, email: true, phoneNumber: true, avatarUrl: true },
        },
        respondent: {
          select: { id: true, fullName: true, email: true, phoneNumber: true, avatarUrl: true },
        },
        listing: {
          select: { id: true, title: true, address: true, price: true },
        },
        admin: {
          select: { id: true, fullName: true, email: true },
        },
        evidences: {
          orderBy: { createdAt: "asc" },
        },
        messages: {
          orderBy: { createdAt: "asc" },
          include: {
            sender: {
              select: { id: true, fullName: true, avatarUrl: true, roles: true },
            },
          },
        },
      },
    });

    if (!dispute) {
      return res.status(404).json({ message: "Không tìm thấy vụ khiếu nại." });
    }

    // Kiểm tra quyền truy cập: Chỉ Creator, Respondent hoặc Admin mới được xem
    if (!isAdmin && dispute.creatorId !== userId && dispute.respondentId !== userId) {
      return res.status(403).json({ message: "Bạn không có quyền xem khiếu nại này." });
    }

    return res.json({ dispute });
  } catch (error) {
    console.error("Get dispute detail error:", error);
    return res.status(500).json({ message: "Lỗi máy chủ khi lấy chi tiết khiếu nại." });
  }
}

/**
 * 4. Gửi tin nhắn / phản hồi trong vụ khiếu nại
 * POST /api/disputes/:id/messages
 */
export async function sendDisputeMessage(req, res) {
  try {
    const { id } = req.params;
    const senderId = req.user.userId;
    const isAdmin = req.user.roles?.includes("ADMIN");
    const { message, isAdminNote = false } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ message: "Nội dung phản hồi không được để trống." });
    }

    const dispute = await prisma.dispute.findUnique({
      where: { id },
    });

    if (!dispute) {
      return res.status(404).json({ message: "Không tìm thấy vụ khiếu nại." });
    }

    if (dispute.status === "CLOSED") {
      return res.status(400).json({ message: "Khiếu nại này đã đóng, không thể gửi thêm phản hồi." });
    }

    if (!isAdmin && dispute.creatorId !== senderId && dispute.respondentId !== senderId) {
      return res.status(403).json({ message: "Bạn không có quyền tham gia phản hồi vụ khiếu nại này." });
    }

    const newMessage = await prisma.disputeMessage.create({
      data: {
        disputeId: id,
        senderId,
        message: message.trim(),
        isAdminNote: isAdmin && !!isAdminNote,
      },
      include: {
        sender: {
          select: { id: true, fullName: true, avatarUrl: true, roles: true },
        },
      },
    });

    return res.status(201).json({
      message: "Gửi phản hồi thành công.",
      data: newMessage,
    });
  } catch (error) {
    console.error("Send dispute message error:", error);
    return res.status(500).json({ message: "Lỗi máy chủ khi gửi phản hồi." });
  }
}

/**
 * 5. Admin: Lấy danh sách toàn bộ khiếu nại
 * GET /api/admin/disputes
 */
export async function getAdminDisputes(req, res) {
  try {
    const { status, category, page = 1, limit = 10 } = req.query;

    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.max(1, Math.min(50, parseInt(limit) || 10));
    const skip = (pageNum - 1) * limitNum;

    const where = {
      ...(status ? { status } : {}),
      ...(category ? { category } : {}),
    };

    const [totalItems, disputes] = await Promise.all([
      prisma.dispute.count({ where }),
      prisma.dispute.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: "desc" },
        include: {
          creator: {
            select: { id: true, fullName: true, email: true },
          },
          respondent: {
            select: { id: true, fullName: true, email: true },
          },
          listing: {
            select: { id: true, title: true },
          },
          admin: {
            select: { id: true, fullName: true },
          },
        },
      }),
    ]);

    return res.json({
      data: disputes,
      pagination: {
        totalItems,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(totalItems / limitNum),
      },
    });
  } catch (error) {
    console.error("Admin get disputes error:", error);
    return res.status(500).json({ message: "Lỗi máy chủ khi lấy danh sách khiếu nại admin." });
  }
}

/**
 * 6. Admin: Cập nhật trạng thái xử lý khiếu nại
 * PATCH /api/admin/disputes/:id/status
 */
export async function updateDisputeStatus(req, res) {
  try {
    const { id } = req.params;
    const adminId = req.user.userId;
    const { status, resolutionNote } = req.body;

    const validStatuses = [
      "OPEN",
      "UNDER_REVIEW",
      "WAITING_FOR_RESPONSE",
      "RESOLVED",
      "REJECTED",
      "CLOSED",
    ];

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ message: "Trạng thái khiếu nại không hợp lệ." });
    }

    const dispute = await prisma.dispute.findUnique({
      where: { id },
    });

    if (!dispute) {
      return res.status(404).json({ message: "Không tìm thấy vụ khiếu nại." });
    }

    const updateData = {
      status,
      adminId,
      ...(resolutionNote ? { resolutionNote: resolutionNote.trim() } : {}),
      ...(status === "RESOLVED" ? { resolvedAt: new Date() } : {}),
      ...(status === "CLOSED" ? { closedAt: new Date() } : {}),
    };

    const updatedDispute = await prisma.dispute.update({
      where: { id },
      data: updateData,
    });

    // Ghi nhận AuditLog
    await prisma.auditLog.create({
      data: {
        adminId,
        action: "DISPUTE_STATUS_UPDATED",
        entityType: "Dispute",
        entityId: id,
        details: {
          previousStatus: dispute.status,
          nextStatus: status,
          resolutionNote: resolutionNote || null,
        },
      },
    });

    return res.json({
      message: `Đã cập nhật trạng thái khiếu nại thành ${status}.`,
      dispute: updatedDispute,
    });
  } catch (error) {
    console.error("Update dispute status error:", error);
    return res.status(500).json({ message: "Lỗi máy chủ khi cập nhật khiếu nại." });
  }
}

