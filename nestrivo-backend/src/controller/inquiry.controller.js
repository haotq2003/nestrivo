import { prisma } from "../lib/prisma.js";
import { createNotification } from "./notification.controller.js";

/**
 * 1. Gửi yêu cầu hỏi thuê phòng (Người thuê gửi đến chủ nhà)
 * POST /api/inquiries
 */
export async function createInquiry(req, res) {
  try {
    const renterId = req.user.userId;
    const { listingId, message, moveInDate, occupantsCount, notes } = req.body;

    if (!listingId || !message || !message.trim()) {
      return res.status(400).json({ message: "Vui lòng chọn phòng và nhập lời nhắn hỏi thuê." });
    }

    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
    });

    if (!listing) {
      return res.status(404).json({ message: "Không tìm thấy phòng trọ này." });
    }

    if (listing.landlordId === renterId) {
      return res.status(400).json({ message: "Bạn không thể gửi yêu cầu hỏi thuê phòng của chính mình." });
    }

    let parsedMoveInDate = null;
    if (moveInDate) {
      const d = new Date(moveInDate);
      if (!isNaN(d.getTime())) {
        parsedMoveInDate = d;
      }
    }

    const inquiry = await prisma.inquiry.create({
      data: {
        renterId,
        landlordId: listing.landlordId,
        listingId,
        message: message.trim(),
        moveInDate: parsedMoveInDate,
        occupantsCount: occupantsCount ? parseInt(occupantsCount) : 1,
        notes: notes ? String(notes).trim() : null,
        status: "PENDING",
      },
      include: {
        renter: {
          select: { id: true, fullName: true, phoneNumber: true, email: true },
        },
        listing: {
          select: { id: true, title: true, price: true },
        },
      },
    });

    // Tạo thông báo gửi đến Chủ nhà
    const renterName = inquiry.renter?.fullName || "Khách thuê";
    await createNotification({
      userId: listing.landlordId,
      type: "INQUIRY_RECEIVED",
      title: `📩 Yêu cầu hỏi thuê mới: "${listing.title}"`,
      message: `${renterName} vừa gửi lời nhắn hỏi thuê: "${message.trim().slice(0, 80)}${message.length > 80 ? "..." : ""}"`,
      link: `/landlord/inquiries`,
      metadata: { inquiryId: inquiry.id, listingId, renterId },
    });

    return res.status(201).json({
      message: "Gửi yêu cầu hỏi thuê thành công! Chủ nhà sẽ sớm liên hệ lại với bạn.",
      inquiry,
    });
  } catch (error) {
    console.error("Create inquiry error:", error);
    return res.status(500).json({ message: "Lỗi máy chủ khi gửi yêu cầu hỏi thuê." });
  }
}

/**
 * 2. Lấy danh sách yêu cầu hỏi thuê dành cho chủ nhà
 * GET /api/inquiries/landlord
 */
export async function getLandlordInquiries(req, res) {
  try {
    const landlordId = req.user.userId;
    const { status, listingId, search, dateSort = "newest" } = req.query;

    const where = {
      landlordId,
      ...(status && status !== "ALL" ? { status } : {}),
      ...(listingId && listingId !== "ALL" ? { listingId } : {}),
    };

    if (typeof search === "string" && search.trim()) {
      const q = search.trim();
      where.OR = [
        { renter: { fullName: { contains: q, mode: "insensitive" } } },
        { renter: { phoneNumber: { contains: q, mode: "insensitive" } } },
        { listing: { title: { contains: q, mode: "insensitive" } } },
        { message: { contains: q, mode: "insensitive" } },
      ];
    }

    const orderBy = { createdAt: dateSort === "oldest" ? "asc" : "desc" };

    const rawInquiries = await prisma.inquiry.findMany({
      where,
      orderBy,
      include: {
        renter: {
          select: {
            id: true,
            fullName: true,
            phoneNumber: true,
            email: true,
            avatarUrl: true,
          },
        },
        listing: {
          select: {
            id: true,
            title: true,
            price: true,
            address: true,
            district: true,
            city: true,
            propertyType: true,
            images: {
              orderBy: { sortOrder: "asc" },
              take: 1,
            },
          },
        },
      },
    });

    // Map dữ liệu chuẩn hóa cho giao diện Frontend RentalInquiry
    const inquiries = rawInquiries.map((item) => ({
      id: item.id,
      renterId: item.renterId,
      landlordId: item.landlordId,
      listingId: item.listingId,
      message: item.message,
      moveInDate: item.moveInDate ? item.moveInDate.toISOString() : undefined,
      occupantsCount: item.occupantsCount || 1,
      status: item.status,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
      contactedAt: item.contactedAt ? item.contactedAt.toISOString() : null,
      closedAt: item.closedAt ? item.closedAt.toISOString() : null,
      notes: item.notes || "",
      rejectionReason: item.rejectionReason || null,
      renter: {
        id: item.renter.id,
        name: item.renter.fullName,
        phoneNumber: item.renter.phoneNumber || "Chưa cập nhật SĐT",
        email: item.renter.email,
        avatarUrl: item.renter.avatarUrl,
        occupation: "Khách tìm thuê",
      },
      listing: {
        id: item.listing.id,
        title: item.listing.title,
        price: Number(item.listing.price),
        thumbnailUrl: item.listing.images[0]?.imageUrl || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&auto=format&fit=crop&q=80",
        address: item.listing.address,
        district: item.listing.district,
        city: item.listing.city,
        propertyType: item.listing.propertyType,
      },
    }));

    return res.json({
      data: inquiries,
      totalItems: inquiries.length,
    });
  } catch (error) {
    console.error("Get landlord inquiries error:", error);
    return res.status(500).json({ message: "Lỗi máy chủ khi lấy danh sách yêu cầu hỏi thuê." });
  }
}

/**
 * 3. Thống kê tổng số lượng yêu cầu hỏi thuê của chủ nhà
 * GET /api/inquiries/landlord/stats
 */
export async function getLandlordInquiryStats(req, res) {
  try {
    const landlordId = req.user.userId;

    const [total, pending, confirmed, rejected, contacted, closed] = await Promise.all([
      prisma.inquiry.count({ where: { landlordId } }),
      prisma.inquiry.count({ where: { landlordId, status: "PENDING" } }),
      prisma.inquiry.count({ where: { landlordId, status: "CONFIRMED" } }),
      prisma.inquiry.count({ where: { landlordId, status: "REJECTED" } }),
      prisma.inquiry.count({ where: { landlordId, status: "CONTACTED" } }),
      prisma.inquiry.count({ where: { landlordId, status: "CLOSED" } }),
    ]);

    return res.json({
      total,
      pending,
      confirmed,
      rejected,
      contacted,
      closed,
    });
  } catch (error) {
    console.error("Get inquiry stats error:", error);
    return res.status(500).json({ message: "Lỗi máy chủ khi lấy thống kê yêu cầu hỏi thuê." });
  }
}

/**
 * 4. Cập nhật trạng thái yêu cầu hỏi thuê (CHỜ LIÊN HỆ -> ĐÃ LIÊN HỆ -> ĐÃ ĐÓNG)
 * PATCH /api/inquiries/:id/status
 */
export async function updateInquiryStatus(req, res) {
  try {
    const { id } = req.params;
    const landlordId = req.user.userId;
    const { status, notes, rejectionReason } = req.body;

    const validStatuses = ["PENDING", "CONFIRMED", "REJECTED", "CONTACTED", "CLOSED"];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ message: "Trạng thái cập nhật không hợp lệ." });
    }

    const inquiry = await prisma.inquiry.findUnique({
      where: { id },
      include: {
        listing: { select: { id: true, title: true } },
      },
    });

    if (!inquiry) {
      return res.status(404).json({ message: "Không tìm thấy yêu cầu hỏi thuê." });
    }

    if (inquiry.landlordId !== landlordId && !req.user.roles?.includes("ADMIN")) {
      return res.status(403).json({ message: "Bạn không có quyền quản lý yêu cầu hỏi thuê này." });
    }

    const updateData = {
      status,
      ...(notes !== undefined ? { notes: notes.trim() } : {}),
      ...(rejectionReason !== undefined ? { rejectionReason: rejectionReason?.trim() || null } : {}),
      ...(status === "CONTACTED" || status === "CONFIRMED" ? { contactedAt: new Date() } : {}),
      ...(status === "CLOSED" || status === "REJECTED" ? { closedAt: new Date() } : {}),
    };

    // Khi mở lại yêu cầu (PENDING/CONFIRMED) mà không gửi rejectionReason, xóa lý do từ chối cũ
    if (status !== "REJECTED" && rejectionReason === undefined) {
      updateData.rejectionReason = null;
    }

    const updated = await prisma.inquiry.update({
      where: { id },
      data: updateData,
    });

    // Tạo thông báo cho Khách thuê khi Chủ nhà phản hồi
    if (inquiry.renterId) {
      let statusDesc = "đã cập nhật trạng thái yêu cầu của bạn";
      let notifType = "SYSTEM_ANNOUNCEMENT";
      if (status === "CONFIRMED") {
        statusDesc = "đã xác nhận lịch hẹn xem phòng";
        notifType = "INQUIRY_CONFIRMED";
      } else if (status === "CONTACTED") {
        statusDesc = "đã liên hệ trao đổi về yêu cầu của bạn";
        notifType = "INQUIRY_CONFIRMED";
      } else if (status === "REJECTED") {
        const reasonText = rejectionReason?.trim() || notes?.trim();
        statusDesc = `tạm thời chưa thể tiếp nhận lịch hẹn xem phòng${reasonText ? `. Lý do: "${reasonText}"` : ""}`;
        notifType = "INQUIRY_REJECTED";
      }

      await createNotification({
        userId: inquiry.renterId,
        type: notifType,
        title: `Phản hồi hỏi thuê: "${inquiry.listing?.title || "Phòng trọ"}"`,
        message: `Chủ nhà ${statusDesc}.${notes && status !== "REJECTED" ? ` Lời nhắn: "${notes}"` : ""}`,
        link: inquiry.listing?.id ? `/rooms/${inquiry.listing.id}` : "/profile",
        metadata: { inquiryId: id, status, rejectionReason: updateData.rejectionReason },
      });
    }

    return res.json({
      message: `Đã cập nhật trạng thái yêu cầu thành ${status}.`,
      inquiry: updated,
    });
  } catch (error) {
    console.error("Update inquiry status error:", error);
    return res.status(500).json({ message: "Lỗi máy chủ khi cập nhật trạng thái yêu cầu." });
  }
}

/**
 * 5. Lấy danh sách yêu cầu hỏi thuê mà người thuê (Customer / Renter) đã gửi
 * GET /api/inquiries/renter
 */
export async function getRenterInquiries(req, res) {
  try {
    const renterId = req.user.userId;
    const { status } = req.query;

    const where = {
      renterId,
      ...(status && status !== "ALL" ? { status } : {}),
    };

    const rawInquiries = await prisma.inquiry.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        landlord: {
          select: {
            id: true,
            fullName: true,
            phoneNumber: true,
            email: true,
            avatarUrl: true,
          },
        },
        listing: {
          select: {
            id: true,
            title: true,
            price: true,
            address: true,
            district: true,
            city: true,
            propertyType: true,
            images: {
              orderBy: { sortOrder: "asc" },
              take: 1,
            },
          },
        },
      },
    });

    const inquiries = rawInquiries.map((item) => ({
      id: item.id,
      renterId: item.renterId,
      landlordId: item.landlordId,
      listingId: item.listingId,
      message: item.message,
      moveInDate: item.moveInDate ? item.moveInDate.toISOString() : null,
      occupantsCount: item.occupantsCount,
      status: item.status,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
      contactedAt: item.contactedAt ? item.contactedAt.toISOString() : null,
      closedAt: item.closedAt ? item.closedAt.toISOString() : null,
      notes: item.notes,
      rejectionReason: item.rejectionReason || null,
      landlord: {
        id: item.landlord.id,
        name: item.landlord.fullName,
        phoneNumber: item.landlord.phoneNumber || "Chưa cập nhật",
        email: item.landlord.email,
        avatarUrl: item.landlord.avatarUrl,
      },
      listing: {
        id: item.listing.id,
        title: item.listing.title,
        price: item.listing.price,
        thumbnailUrl:
          item.listing.images?.[0]?.imageUrl ||
          "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&auto=format&fit=crop&q=80",
        address: item.listing.address,
        district: item.listing.district,
        city: item.listing.city,
        propertyType: item.listing.propertyType,
      },
    }));

    return res.json({
      data: inquiries,
      totalItems: inquiries.length,
    });
  } catch (error) {
    console.error("Get renter inquiries error:", error);
    return res.status(500).json({ message: "Lỗi máy chủ khi lấy danh sách yêu cầu thuê đã gửi." });
  }
}
