import { prisma } from "../lib/prisma.js";

/**
 * Helper nội bộ: Tạo thông báo mới cho người dùng
 */
export async function createNotification({
  userId,
  type,
  title,
  message,
  link = null,
  metadata = null,
}) {
  try {
    if (!userId) return null;

    return await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        link,
        metadata: metadata ? metadata : undefined,
      },
    });
  } catch (error) {
    console.error("[Notification] Lỗi khi tạo thông báo:", error);
    return null;
  }
}

/**
 * 1. Lấy danh sách thông báo của người dùng hiện tại
 * GET /api/notifications
 */
export async function getMyNotifications(req, res) {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Vui lòng đăng nhập." });
    }

    const { limit = 20, page = 1, unreadOnly = "false" } = req.query;
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 50);
    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (pageNum - 1) * limitNum;

    const where = {
      userId,
      ...(unreadOnly === "true" ? { isRead: false } : {}),
    };

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        take: limitNum,
        skip,
        orderBy: { createdAt: "desc" },
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({
        where: { userId, isRead: false },
      }),
    ]);

    return res.json({
      success: true,
      data: notifications,
      unreadCount,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum) || 1,
      },
    });
  } catch (error) {
    console.error("Lỗi getMyNotifications:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi hệ thống khi tải thông báo.",
      error: error.message,
    });
  }
}

/**
 * 2. Đánh dấu một thông báo đã đọc
 * PATCH /api/notifications/:id/read
 */
export async function markAsRead(req, res) {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    const notification = await prisma.notification.findFirst({
      where: { id, userId },
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy thông báo.",
      });
    }

    const updated = await prisma.notification.update({
      where: { id },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    const unreadCount = await prisma.notification.count({
      where: { userId, isRead: false },
    });

    return res.json({
      success: true,
      data: updated,
      unreadCount,
    });
  } catch (error) {
    console.error("Lỗi markAsRead:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi khi cập nhật trạng thái đã đọc.",
      error: error.message,
    });
  }
}

/**
 * 3. Đánh dấu tất cả thông báo là đã đọc
 * PATCH /api/notifications/mark-all-read
 */
export async function markAllAsRead(req, res) {
  try {
    const userId = req.user?.userId;

    await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    return res.json({
      success: true,
      message: "Đã đánh dấu tất cả thông báo là đã đọc.",
      unreadCount: 0,
    });
  } catch (error) {
    console.error("Lỗi markAllAsRead:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi khi cập nhật trạng thái thông báo.",
      error: error.message,
    });
  }
}

/**
 * 4. Xóa một thông báo
 * DELETE /api/notifications/:id
 */
export async function deleteNotification(req, res) {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    const notification = await prisma.notification.findFirst({
      where: { id, userId },
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy thông báo cần xóa.",
      });
    }

    await prisma.notification.delete({
      where: { id },
    });

    const unreadCount = await prisma.notification.count({
      where: { userId, isRead: false },
    });

    return res.json({
      success: true,
      message: "Đã xóa thông báo.",
      unreadCount,
    });
  } catch (error) {
    console.error("Lỗi deleteNotification:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi khi xóa thông báo.",
      error: error.message,
    });
  }
}
