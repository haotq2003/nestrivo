import { prisma } from "../lib/prisma.js";
import { createMoMoPayment, verifyMoMoIpnSignature } from "../lib/momo.js";

/**
 * 1. Lấy danh sách các gói quảng bá đang mở bán
 * GET /api/promotions/plans
 */
export async function getPromotionPlans(req, res) {
  try {
    let plans = await prisma.promotionPlan.findMany({
      where: { isActive: true },
      orderBy: { durationDays: "asc" },
    });

    // Nếu chưa có gói nào trong DB, tự động seed 3 gói chuẩn Tin Nổi Bật (Tuần, Tháng, Năm)
    if (plans.length === 0) {
      await prisma.promotionPlan.createMany({
        data: [
          {
            code: "PROMO_7D",
            tier: "VIP",
            name: "Gói Tin Nổi Bật 1 Tuần",
            description: "Đẩy tin lên vị trí Nổi Bật Trang Chủ và ưu tiên hàng đầu tìm kiếm suốt 7 ngày.",
            durationDays: 7,
            price: 70000,
            priority: 1,
            badgeColor: "#F4CD65",
          },
          {
            code: "PROMO_30D",
            tier: "VIP",
            name: "Gói Tin Nổi Bật 1 Tháng (Tiết kiệm 20%)",
            description: "Xuất hiện liên tục 30 ngày ở mục Phòng Nổi Bật Trang Chủ. Tiếp cận tối đa người thuê.",
            durationDays: 30,
            price: 240000,
            priority: 2,
            badgeColor: "#F4CD65",
          },
          {
            code: "PROMO_365D",
            tier: "VIP",
            name: "Gói Tin Nổi Bật 1 Năm (Tiết kiệm 50%)",
            description: "Gói dài hạn dành cho căn hộ/tòa nhà chuyên nghiệp. Giữ vị trí nổi bật suốt 1 năm.",
            durationDays: 365,
            price: 1800000,
            priority: 3,
            badgeColor: "#F4CD65",
          },
        ],
      });

      plans = await prisma.promotionPlan.findMany({
        where: { isActive: true },
        orderBy: { durationDays: "asc" },
      });
    }

    return res.json({ data: plans });
  } catch (error) {
    console.error("Get promotion plans error:", error);
    return res.status(500).json({ message: "Lỗi máy chủ khi lấy danh sách gói quảng bá." });
  }
}

/**
 * 2. Tạo đơn mua gói quảng bá tin đăng
 * POST /api/promotions/orders
 */
export async function createPromotionOrder(req, res) {
  try {
    const landlordId = req.user.userId;
    const { listingId, planId } = req.body;

    if (!listingId || !planId) {
      return res.status(400).json({ message: "Vui lòng chọn tin đăng và gói quảng bá." });
    }

    // Kiểm tra tin đăng thuộc về chủ nhà
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
    });

    if (!listing || listing.landlordId !== landlordId) {
      return res.status(403).json({ message: "Tin đăng không tồn tại hoặc không thuộc quyền quản lý của bạn." });
    }

    if (listing.status !== "PUBLISHED") {
      return res.status(400).json({
        message: "Chỉ tin đăng đã được duyệt và đang hiển thị (PUBLISHED) mới có thể mua gói đẩy tin.",
      });
    }

    // Kiểm tra chủ nhà đã hoàn tất xác minh danh tính (KYC) chưa
    const landlordProfile = await prisma.landlordProfile.findUnique({
      where: { userId: landlordId },
    });

    if (!landlordProfile || landlordProfile.verificationStatus !== "VERIFIED") {
      return res.status(403).json({
        message: "Chỉ chủ nhà đã hoàn tất xác minh danh tính (KYC) mới có thể mua gói đẩy tin nổi bật. Vui lòng gửi yêu cầu xác minh danh tính trước.",
      });
    }

    const plan = await prisma.promotionPlan.findUnique({
      where: { id: planId },
    });

    if (!plan || !plan.isActive) {
      return res.status(404).json({ message: "Gói quảng bá không tồn tại hoặc đã tạm dừng cung cấp." });
    }

    // Sinh mã đơn hàng duy nhất
    const orderCode = `PROMO-${Date.now().toString().slice(-8)}-${Math.floor(100 + Math.random() * 900)}`;

    const order = await prisma.promotionOrder.create({
      data: {
        orderCode,
        landlordId,
        listingId,
        planId,
        amount: plan.price,
        status: "PENDING_PAYMENT",
      },
      include: {
        listing: {
          select: { id: true, title: true, address: true },
        },
        plan: true,
      },
    });

    return res.status(201).json({
      message: "Tạo đơn hàng mua gói quảng bá thành công.",
      order,
    });
  } catch (error) {
    console.error("Create promotion order error:", error);
    return res.status(500).json({ message: "Lỗi máy chủ khi tạo đơn mua gói." });
  }
}

/**
 * 3. Thanh toán đơn hàng & Kích hoạt gói quảng bá
 * POST /api/promotions/orders/:orderId/pay
 */
export async function payPromotionOrder(req, res) {
  try {
    const { orderId } = req.params;
    const landlordId = req.user.userId;
    const { paymentMethod = "BANK_TRANSFER", transactionCode } = req.body;

    const order = await prisma.promotionOrder.findUnique({
      where: { id: orderId },
      include: { plan: true, listing: true },
    });

    if (!order) {
      return res.status(404).json({ message: "Không tìm thấy đơn hàng." });
    }

    if (order.landlordId !== landlordId && !req.user.roles?.includes("ADMIN")) {
      return res.status(403).json({ message: "Bạn không có quyền thanh toán đơn hàng này." });
    }

    if (order.status === "PAID") {
      return res.status(400).json({ message: "Đơn hàng này đã được thanh toán trước đó." });
    }

    const startDate = new Date();
    const endDate = new Date(startDate.getTime() + order.plan.durationDays * 24 * 60 * 60 * 1000);

    // Kích hoạt giao dịch thanh toán và cập nhật tin đăng sang Priority mới
    const [updatedOrder, payment, listingPromotion] = await prisma.$transaction([
      // 1. Cập nhật Order sang PAID
      prisma.promotionOrder.update({
        where: { id: orderId },
        data: { status: "PAID" },
      }),
      // 2. Tạo bản ghi PromotionPayment
      prisma.promotionPayment.create({
        data: {
          orderId,
          paymentMethod,
          transactionCode: transactionCode?.trim() || `TXN-${Date.now()}`,
          amount: order.amount,
          status: "SUCCESS",
          paidAt: new Date(),
        },
      }),
      // 3. Tạo thời gian hiệu lực quảng bá ListingPromotion
      prisma.listingPromotion.create({
        data: {
          listingId: order.listingId,
          orderId,
          tier: order.plan.tier,
          priority: order.plan.priority,
          startDate,
          endDate,
          status: "ACTIVE",
        },
      }),
      // 4. Cập nhật tin đăng sang Tier & Priority mới và hạn hiển thị
      prisma.listing.update({
        where: { id: order.listingId },
        data: {
          currentTier: order.plan.tier,
          priority: order.plan.priority,
          expiresAt: endDate,
        },
      }),
      // 5. Ghi nhận AuditLog
      prisma.auditLog.create({
        data: {
          adminId: landlordId,
          action: "PROMOTION_ACTIVATED",
          entityType: "ListingPromotion",
          entityId: order.listingId,
          details: {
            orderCode: order.orderCode,
            tier: order.plan.tier,
            durationDays: order.plan.durationDays,
            amount: Number(order.amount),
            startDate,
            endDate,
          },
        },
      }),
    ]);

    return res.json({
      message: `Thanh toán thành công! Gói ${order.plan.name} đã được kích hoạt cho tin đăng đến ngày ${endDate.toLocaleDateString("vi-VN")}.`,
      order: updatedOrder,
      promotion: listingPromotion,
    });
  } catch (error) {
    console.error("Pay promotion order error:", error);
    return res.status(500).json({ message: "Lỗi máy chủ khi xử lý thanh toán đơn hàng." });
  }
}

/**
 * 4. Lấy danh sách đơn hàng & lịch sử gói quảng bá của chủ nhà
 * GET /api/promotions/orders/my
 */
export async function getMyPromotionOrders(req, res) {
  try {
    const landlordId = req.user.userId;

    const orders = await prisma.promotionOrder.findMany({
      where: { landlordId },
      orderBy: { createdAt: "desc" },
      include: {
        plan: true,
        listing: {
          select: { id: true, title: true, address: true, currentTier: true },
        },
        payment: true,
        listingPromotion: true,
      },
    });

    return res.json({
      data: orders,
      totalItems: orders.length,
    });
  } catch (error) {
    console.error("Get my promotion orders error:", error);
    return res.status(500).json({ message: "Lỗi máy chủ khi lấy danh sách đơn mua gói." });
  }
}

/**
 * 5. Admin: Xem toàn bộ đơn hàng quảng bá & Doanh thu sàn
 * GET /api/admin/promotions/orders
 */
export async function getAdminPromotionOrders(req, res) {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.max(1, Math.min(50, parseInt(limit) || 10));
    const skip = (pageNum - 1) * limitNum;

    const where = status ? { status } : {};

    const [totalItems, orders, revenueStats] = await Promise.all([
      prisma.promotionOrder.count({ where }),
      prisma.promotionOrder.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: "desc" },
        include: {
          landlord: {
            select: { id: true, fullName: true, email: true },
          },
          plan: true,
          listing: {
            select: { id: true, title: true },
          },
          payment: true,
          listingPromotion: true,
        },
      }),
      // Tổng doanh thu từ các đơn hàng PAID
      prisma.promotionOrder.aggregate({
        where: { status: "PAID" },
        _sum: { amount: true },
        _count: { id: true },
      }),
    ]);

    return res.json({
      data: orders,
      stats: {
        totalRevenue: revenueStats._sum.amount || 0,
        paidOrdersCount: revenueStats._count.id || 0,
      },
      pagination: {
        totalItems,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(totalItems / limitNum),
      },
    });
  } catch (error) {
    console.error("Get admin promotion orders error:", error);
    return res.status(500).json({ message: "Lỗi máy chủ khi lấy danh sách đơn hàng admin." });
  }
}

/**
 * 6. Khởi tạo thanh toán MoMo cho đơn hàng
 * POST /api/promotions/orders/:orderId/momo
 */
export async function createMoMoPaymentForOrder(req, res) {
  try {
    const { orderId } = req.params;
    const { requestType = "payWithATM" } = req.body || {};
    const landlordId = req.user.userId;

    const order = await prisma.promotionOrder.findUnique({
      where: { id: orderId },
      include: { plan: true, listing: true },
    });

    if (!order) {
      return res.status(404).json({ message: "Không tìm thấy đơn hàng." });
    }

    if (order.landlordId !== landlordId && !req.user.roles?.includes("ADMIN")) {
      return res.status(403).json({ message: "Bạn không có quyền thanh toán đơn hàng này." });
    }

    if (order.status === "PAID") {
      return res.status(400).json({ message: "Đơn hàng này đã được thanh toán thành công." });
    }

    // Tự động nhận URL trả về cho cả Local (localhost:3000) và Production (Vercel / Render)
    const requestOrigin = req.headers.origin;
    const dynamicRedirectUrl =
      process.env.MOMO_REDIRECT_URL ||
      (requestOrigin
        ? `${requestOrigin.replace(/\/+$/, "")}/landlord/dashboard`
        : "http://localhost:3000/landlord/dashboard");

    const forwardedProto = req.headers["x-forwarded-proto"] || req.protocol || "https";
    const dynamicIpnUrl =
      process.env.MOMO_IPN_URL ||
      `${forwardedProto}://${req.get("host")}/api/promotions/momo-ipn`;

    // Gọi MoMo API tạo giao dịch (mặc định payWithATM cho phép nhập thẻ test Agribank)
    const momoResult = await createMoMoPayment({
      orderId: order.orderCode,
      amount: Number(order.amount),
      orderInfo: `Thanh toan don hang ${order.orderCode} - ${order.plan.name}`,
      redirectUrl: dynamicRedirectUrl,
      ipnUrl: dynamicIpnUrl,
      requestType,
    });

    // Cập nhật hoặc lưu trước thông tin payment nếu chưa có
    await prisma.promotionPayment.upsert({
      where: { orderId: order.id },
      create: {
        orderId: order.id,
        paymentMethod: "MOMO",
        amount: order.amount,
        status: "PENDING",
        transactionCode: momoResult.requestId,
      },
      update: {
        paymentMethod: "MOMO",
        transactionCode: momoResult.requestId,
      },
    });

    return res.json({
      success: true,
      data: {
        orderCode: order.orderCode,
        amount: Number(order.amount),
        payUrl: momoResult.payUrl,
        qrCodeUrl: momoResult.qrCodeUrl,
        deeplink: momoResult.deeplink,
      },
    });
  } catch (error) {
    console.error("Create MoMo payment error:", error);
    return res.status(500).json({ message: error.message || "Lỗi máy chủ khi tạo cổng MoMo." });
  }
}

/**
 * 7. Kiểm tra trạng thái thanh toán của đơn hàng (cho frontend polling)
 * GET /api/promotions/orders/:orderId/status
 */
export async function getPromotionOrderStatus(req, res) {
  try {
    const { orderId } = req.params;

    // Tìm theo id hoặc orderCode
    const order = await prisma.promotionOrder.findFirst({
      where: {
        OR: [{ id: orderId }, { orderCode: orderId }],
      },
      include: {
        plan: true,
        listing: {
          select: { id: true, title: true, currentTier: true },
        },
        payment: true,
        listingPromotion: true,
      },
    });

    if (!order) {
      return res.status(404).json({ message: "Không tìm thấy đơn hàng." });
    }

    return res.json({
      success: true,
      data: {
        orderId: order.id,
        orderCode: order.orderCode,
        status: order.status,
        isPaid: order.status === "PAID",
        payment: order.payment,
        plan: order.plan,
        listing: order.listing,
        listingPromotion: order.listingPromotion,
      },
    });
  } catch (error) {
    console.error("Get order status error:", error);
    return res.status(500).json({ message: "Lỗi máy chủ khi kiểm tra đơn hàng." });
  }
}

/**
 * 8. Webhook IPN nhận kết quả thanh toán từ MoMo
 * POST /api/promotions/momo-ipn
 */
export async function handleMoMoIpn(req, res) {
  try {
    const body = req.body;
    console.log("MoMo IPN received:", body);

    const isValidSignature = verifyMoMoIpnSignature(body);
    if (!isValidSignature) {
      console.warn("Invalid MoMo IPN signature!");
      return res.status(400).json({ message: "Invalid signature" });
    }

    const { orderId, resultCode, transId } = body;

    // Tìm đơn hàng theo orderCode
    const order = await prisma.promotionOrder.findUnique({
      where: { orderCode: orderId },
      include: { plan: true },
    });

    if (!order) {
      console.warn(`Order not found for code: ${orderId}`);
      return res.status(404).json({ message: "Order not found" });
    }

    // Nếu MoMo báo thành công (resultCode === 0) và đơn chưa được kích hoạt
    if (resultCode === 0 && order.status !== "PAID") {
      const startDate = new Date();
      const endDate = new Date(startDate.getTime() + order.plan.durationDays * 24 * 60 * 60 * 1000);

      await prisma.$transaction([
        prisma.promotionOrder.update({
          where: { id: order.id },
          data: { status: "PAID" },
        }),
        prisma.promotionPayment.upsert({
          where: { orderId: order.id },
          create: {
            orderId: order.id,
            paymentMethod: "MOMO",
            transactionCode: String(transId),
            amount: order.amount,
            status: "SUCCESS",
            paidAt: new Date(),
          },
          update: {
            paymentMethod: "MOMO",
            transactionCode: String(transId),
            status: "SUCCESS",
            paidAt: new Date(),
          },
        }),
        prisma.listingPromotion.upsert({
          where: { orderId: order.id },
          create: {
            listingId: order.listingId,
            orderId: order.id,
            tier: order.plan.tier,
            priority: order.plan.priority,
            startDate,
            endDate,
            status: "ACTIVE",
          },
          update: {
            tier: order.plan.tier,
            priority: order.plan.priority,
            startDate,
            endDate,
            status: "ACTIVE",
          },
        }),
        prisma.listing.update({
          where: { id: order.listingId },
          data: {
            currentTier: order.plan.tier,
            priority: order.plan.priority,
            expiresAt: endDate,
          },
        }),
        prisma.auditLog.create({
          data: {
            adminId: order.landlordId,
            action: "PROMOTION_ACTIVATED_MOMO",
            entityType: "ListingPromotion",
            entityId: order.listingId,
            details: {
              orderCode: order.orderCode,
              transId,
              tier: order.plan.tier,
              durationDays: order.plan.durationDays,
              amount: Number(order.amount),
            },
          },
        }),
      ]);

      console.log(`Successfully activated promotion for listing ${order.listingId} via MoMo!`);
    }

    // MoMo expects 204 No Content response
    return res.status(204).send();
  } catch (error) {
    console.error("Handle MoMo IPN error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

/**
 * 9. Xử lý khi người dùng hoàn tất thanh toán MoMo và quay lại Dashboard
 * POST /api/promotions/momo-return
 */
export async function handleMoMoReturn(req, res) {
  try {
    const { orderCode, resultCode, transId } = req.body;

    if (!orderCode) {
      return res.status(400).json({ message: "Thiếu mã đơn hàng orderCode." });
    }

    const order = await prisma.promotionOrder.findUnique({
      where: { orderCode },
      include: { plan: true, listing: true },
    });

    if (!order) {
      return res.status(404).json({ message: "Không tìm thấy đơn hàng." });
    }

    // Nếu đơn hàng đã được đánh dấu PAID trước đó (ví dụ do MoMo IPN đã xử lý xong hoặc gọi lặp)
    if (order.status === "PAID") {
      return res.json({
        success: true,
        message: "Đơn hàng đã được thanh toán thành công và kích hoạt trước đó.",
        order,
      });
    }

    // Nếu MoMo báo thành công (resultCode == 0 hoặc "0")
    if (String(resultCode) === "0") {
      const startDate = new Date();
      const endDate = new Date(startDate.getTime() + order.plan.durationDays * 24 * 60 * 60 * 1000);

      const [updatedOrder] = await prisma.$transaction([
        prisma.promotionOrder.update({
          where: { id: order.id },
          data: { status: "PAID" },
        }),
        prisma.promotionPayment.upsert({
          where: { orderId: order.id },
          create: {
            orderId: order.id,
            paymentMethod: "MOMO",
            transactionCode: String(transId || `MOMO-${Date.now()}`),
            amount: order.amount,
            status: "SUCCESS",
            paidAt: new Date(),
          },
          update: {
            paymentMethod: "MOMO",
            transactionCode: String(transId || `MOMO-${Date.now()}`),
            status: "SUCCESS",
            paidAt: new Date(),
          },
        }),
        prisma.listingPromotion.upsert({
          where: { orderId: order.id },
          create: {
            listingId: order.listingId,
            orderId: order.id,
            tier: order.plan.tier,
            priority: order.plan.priority,
            startDate,
            endDate,
            status: "ACTIVE",
          },
          update: {
            tier: order.plan.tier,
            priority: order.plan.priority,
            startDate,
            endDate,
            status: "ACTIVE",
          },
        }),
        prisma.listing.update({
          where: { id: order.listingId },
          data: {
            currentTier: order.plan.tier,
            priority: order.plan.priority,
            expiresAt: endDate,
          },
        }),
      ]);

      return res.json({
        success: true,
        message: "Xác nhận thanh toán MoMo thành công! Gói Tin Nổi Bật đã được kích hoạt.",
        order: updatedOrder,
      });
    }

    return res.json({
      success: order.status === "PAID",
      message: order.status === "PAID" ? "Đơn hàng đã được thanh toán trước đó." : "Thanh toán chưa hoàn tất.",
      order,
    });
  } catch (error) {
    console.error("MoMo return error:", error);
    return res.status(500).json({ message: "Lỗi máy chủ khi xác nhận thanh toán MoMo." });
  }
}

/**
 * 10. Admin: Lấy danh sách tất cả các gói quảng bá (cả đang bán và tạm ẩn)
 * GET /api/promotions/admin/plans
 */
export async function getAdminPromotionPlans(req, res) {
  try {
    let plans = await prisma.promotionPlan.findMany({
      orderBy: { durationDays: "asc" },
      include: {
        _count: {
          select: { orders: true },
        },
      },
    });

    // Nếu rỗng, tự động seed 3 gói chuẩn
    if (plans.length === 0) {
      await prisma.promotionPlan.createMany({
        data: [
          {
            code: "PROMO_7D",
            tier: "VIP",
            name: "Gói Tin Nổi Bật 1 Tuần",
            description: "Đẩy tin lên vị trí Nổi Bật Trang Chủ và ưu tiên hàng đầu tìm kiếm suốt 7 ngày.",
            durationDays: 7,
            price: 70000,
            priority: 1,
            badgeColor: "#F4CD65",
            isActive: true,
          },
          {
            code: "PROMO_30D",
            tier: "VIP",
            name: "Gói Tin Nổi Bật 1 Tháng (Tiết kiệm 20%)",
            description: "Xuất hiện liên tục 30 ngày ở mục Phòng Nổi Bật Trang Chủ. Tiếp cận tối đa người thuê.",
            durationDays: 30,
            price: 240000,
            priority: 2,
            badgeColor: "#F4CD65",
            isActive: true,
          },
          {
            code: "PROMO_365D",
            tier: "VIP",
            name: "Gói Tin Nổi Bật 1 Năm (Tiết kiệm 50%)",
            description: "Gói dài hạn dành cho căn hộ/tòa nhà chuyên nghiệp. Giữ vị trí nổi bật suốt 1 năm.",
            durationDays: 365,
            price: 1800000,
            priority: 3,
            badgeColor: "#F4CD65",
            isActive: true,
          },
        ],
      });

      plans = await prisma.promotionPlan.findMany({
        orderBy: { durationDays: "asc" },
        include: {
          _count: {
            select: { orders: true },
          },
        },
      });
    }

    return res.json({ data: plans });
  } catch (error) {
    console.error("Get admin promotion plans error:", error);
    return res.status(500).json({ message: "Lỗi máy chủ khi lấy danh sách gói quảng bá cho admin." });
  }
}

/**
 * 11. Admin: Tạo gói quảng bá mới
 * POST /api/promotions/admin/plans
 */
export async function createAdminPromotionPlan(req, res) {
  try {
    const {
      name,
      code,
      tier = "VIP",
      description = "",
      durationDays,
      price,
      priority = 1,
      badgeColor = "#F4CD65",
      isActive = true,
    } = req.body;

    if (!name || !durationDays || price === undefined) {
      return res.status(400).json({ message: "Vui lòng nhập tên gói, số ngày hiệu lực và giá bán." });
    }

    const durationNum = parseInt(durationDays, 10);
    const priceNum = parseFloat(price);

    if (isNaN(durationNum) || durationNum <= 0) {
      return res.status(400).json({ message: "Số ngày hiệu lực phải là số nguyên dương lớn hơn 0." });
    }

    if (isNaN(priceNum) || priceNum < 0) {
      return res.status(400).json({ message: "Giá bán không hợp lệ." });
    }

    // Auto-generate code if not provided
    let finalCode = (code || `PROMO_${durationNum}D_${Date.now().toString().slice(-4)}`).toUpperCase().trim();

    // Check duplicate code
    const existing = await prisma.promotionPlan.findUnique({
      where: { code: finalCode },
    });

    if (existing) {
      finalCode = `${finalCode}_${Date.now().toString().slice(-4)}`;
    }

    const validTiers = ["FREE", "HOT", "VIP"];
    const finalTier = validTiers.includes(tier) ? tier : "VIP";

    const newPlan = await prisma.promotionPlan.create({
      data: {
        code: finalCode,
        name: name.trim(),
        tier: finalTier,
        description: description ? description.trim() : null,
        durationDays: durationNum,
        price: priceNum,
        priority: parseInt(priority, 10) || 1,
        badgeColor: badgeColor || "#F4CD65",
        isActive: Boolean(isActive),
      },
    });

    return res.status(201).json({
      message: "Tạo gói tin quảng bá thành công.",
      plan: newPlan,
    });
  } catch (error) {
    console.error("Create admin promotion plan error:", error);
    return res.status(500).json({ message: "Lỗi máy chủ khi tạo gói quảng bá." });
  }
}

/**
 * 12. Admin: Cập nhật gói quảng bá
 * PUT /api/promotions/admin/plans/:id
 */
export async function updateAdminPromotionPlan(req, res) {
  try {
    const { id } = req.params;
    const {
      name,
      code,
      tier,
      description,
      durationDays,
      price,
      priority,
      badgeColor,
      isActive,
    } = req.body;

    const existing = await prisma.promotionPlan.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({ message: "Không tìm thấy gói quảng bá cần cập nhật." });
    }

    const updateData = {};

    if (name !== undefined) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description ? description.trim() : null;
    if (badgeColor !== undefined) updateData.badgeColor = badgeColor;
    if (isActive !== undefined) updateData.isActive = Boolean(isActive);

    if (durationDays !== undefined) {
      const dNum = parseInt(durationDays, 10);
      if (isNaN(dNum) || dNum <= 0) {
        return res.status(400).json({ message: "Số ngày hiệu lực phải lớn hơn 0." });
      }
      updateData.durationDays = dNum;
    }

    if (price !== undefined) {
      const pNum = parseFloat(price);
      if (isNaN(pNum) || pNum < 0) {
        return res.status(400).json({ message: "Giá bán không hợp lệ." });
      }
      updateData.price = pNum;
    }

    if (priority !== undefined) {
      updateData.priority = parseInt(priority, 10) || 1;
    }

    if (tier !== undefined) {
      const validTiers = ["FREE", "HOT", "VIP"];
      if (validTiers.includes(tier)) {
        updateData.tier = tier;
      }
    }

    if (code !== undefined) {
      const newCode = code.toUpperCase().trim();
      if (newCode !== existing.code) {
        const codeDup = await prisma.promotionPlan.findUnique({
          where: { code: newCode },
        });
        if (codeDup && codeDup.id !== id) {
          return res.status(400).json({ message: "Mã gói tin này đã được sử dụng." });
        }
        updateData.code = newCode;
      }
    }

    const updated = await prisma.promotionPlan.update({
      where: { id },
      data: updateData,
    });

    return res.json({
      message: "Cập nhật gói tin quảng bá thành công.",
      plan: updated,
    });
  } catch (error) {
    console.error("Update admin promotion plan error:", error);
    return res.status(500).json({ message: "Lỗi máy chủ khi cập nhật gói quảng bá." });
  }
}

/**
 * 13. Admin: Bật / Tắt trạng thái mở bán gói
 * PATCH /api/promotions/admin/plans/:id/toggle
 */
export async function toggleAdminPromotionPlanStatus(req, res) {
  try {
    const { id } = req.params;

    const existing = await prisma.promotionPlan.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({ message: "Không tìm thấy gói quảng bá." });
    }

    const updated = await prisma.promotionPlan.update({
      where: { id },
      data: {
        isActive: !existing.isActive,
      },
    });

    return res.json({
      message: `Đã ${updated.isActive ? "kích hoạt mở bán" : "tạm ẩn"} gói tin ${updated.name}.`,
      plan: updated,
    });
  } catch (error) {
    console.error("Toggle admin promotion plan error:", error);
    return res.status(500).json({ message: "Lỗi máy chủ khi thay đổi trạng thái gói quảng bá." });
  }
}

/**
 * 14. Admin: Xóa gói quảng bá
 * DELETE /api/promotions/admin/plans/:id
 */
export async function deleteAdminPromotionPlan(req, res) {
  try {
    const { id } = req.params;

    const existing = await prisma.promotionPlan.findUnique({
      where: { id },
      include: {
        _count: {
          select: { orders: true },
        },
      },
    });

    if (!existing) {
      return res.status(404).json({ message: "Không tìm thấy gói quảng bá cần xóa." });
    }

    // Nếu đã có đơn hàng liên kết (onDelete: Restrict), chuyển sang tạm ẩn để tránh lỗi DB
    if (existing._count.orders > 0) {
      await prisma.promotionPlan.update({
        where: { id },
        data: { isActive: false },
      });
      return res.json({
        message: `Gói tin này đã có ${existing._count.orders} đơn hàng trong lịch sử giao dịch. Hệ thống đã tự động chuyển sang trạng thái "Tạm ẩn" để bảo toàn dữ liệu.`,
        deactivated: true,
      });
    }

    await prisma.promotionPlan.delete({
      where: { id },
    });

    return res.json({
      message: "Đã xóa vĩnh viễn gói tin quảng bá thành công.",
      deleted: true,
    });
  } catch (error) {
    console.error("Delete admin promotion plan error:", error);
    return res.status(500).json({ message: "Lỗi máy chủ khi xóa gói quảng bá." });
  }
}

/**
 * 15. Tự động quét và hạ hạng các tin quảng bá đã hết hạn
 * Chuyển ListingPromotion sang EXPIRED, reset priority về 0 và currentTier về FREE
 */
export async function checkAndExpirePromotions() {
  try {
    const now = new Date();
    const expiredPromos = await prisma.listingPromotion.findMany({
      where: {
        status: "ACTIVE",
        endDate: { lt: now },
      },
      include: { listing: true },
    });

    if (expiredPromos.length === 0) return 0;

    let expiredCount = 0;
    for (const promo of expiredPromos) {
      // Kiểm tra xem tin này còn gói quảng bá nào khác đang còn hiệu lực không
      const otherActivePromo = await prisma.listingPromotion.findFirst({
        where: {
          listingId: promo.listingId,
          status: "ACTIVE",
          endDate: { gte: now },
          id: { not: promo.id },
        },
        orderBy: { priority: "desc" },
      });

      const operations = [
        prisma.listingPromotion.update({
          where: { id: promo.id },
          data: { status: "EXPIRED" },
        }),
      ];

      if (otherActivePromo) {
        operations.push(
          prisma.listing.update({
            where: { id: promo.listingId },
            data: {
              currentTier: otherActivePromo.tier,
              priority: otherActivePromo.priority,
              expiresAt: otherActivePromo.endDate,
            },
          })
        );
      } else {
        operations.push(
          prisma.listing.update({
            where: { id: promo.listingId },
            data: {
              currentTier: "FREE",
              priority: 0,
              expiresAt: null,
            },
          })
        );
      }

      await prisma.$transaction(operations);
      expiredCount++;
    }

    return expiredCount;
  } catch (error) {
    console.error("Lỗi checkAndExpirePromotions:", error);
    return 0;
  }
}


