import { prisma } from "../lib/prisma.js";

const VI_DAYS = ["Chủ nhật", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];

const REPORT_REASON_LABELS = {
  FAKE_LISTING: "Tin đăng ảo / Không có thật",
  FAKE_IMAGES: "Hình ảnh giả mạo / Cắt ghép",
  WRONG_PRICE: "Giá thuê thực tế sai lệch",
  INCORRECT_AMENITIES: "Tiện ích không đúng thực tế",
  WRONG_ADDRESS: "Địa chỉ phòng sai lệch",
  ALREADY_RENTED: "Phòng đã cho thuê nhưng không gỡ",
  MISLEADING_INFO: "Thông tin mô tả đánh lừa",
  SCAM: "Hành vi lừa đảo / Đòi cọc ảo",
  OTHER: "Lý do khác",
};

const PROPERTY_TYPE_LABELS = {
  STUDIO: "Phòng Studio",
  SERVICE_APARTMENT: "Căn hộ dịch vụ",
  ROOM_SHARE: "Ở ghép / KTX",
  WHOLE_HOUSE: "Nhà nguyên căn",
};

/**
 * Lấy toàn bộ số liệu thống kê & dữ liệu biểu đồ cho Admin Dashboard
 * GET /api/admin/dashboard/stats?timeRange=7d (hoặc 30d)
 */
export async function getAdminDashboardStats(req, res) {
  try {
    const { timeRange = "7d" } = req.query;
    const days = timeRange === "30d" ? 30 : 7;

    const now = new Date();
    const startDate = new Date();
    startDate.setDate(now.getDate() - (days - 1));
    startDate.setHours(0, 0, 0, 0);

    // 1. KPI TỔNG QUAN HỆ THỐNG
    const [
      pendingListingsCount,
      totalListingsCount,
      publishedListingsCount,
      rejectedListingsCount,
      hiddenListingsCount,
      totalUsersCount,
      landlordsCount,
      rentersCount,
      lockedUsersCount,
      pendingKycCount,
      pendingReportsCount,
      resolvedReportsCount,
      totalReportsCount,
      revenueResult,
      paidOrdersCount,
      activePromosCount,
    ] = await Promise.all([
      prisma.listing.count({ where: { status: "PENDING_APPROVAL" } }),
      prisma.listing.count(),
      prisma.listing.count({ where: { status: "PUBLISHED" } }),
      prisma.listing.count({ where: { status: "REJECTED" } }),
      prisma.listing.count({ where: { status: "HIDDEN" } }),
      prisma.user.count(),
      prisma.user.count({ where: { roles: { has: "LANDLORD" } } }),
      prisma.user.count({ where: { roles: { has: "RENTER" } } }),
      prisma.user.count({ where: { isActive: false } }),
      prisma.verificationRequest.count({ where: { status: "PENDING" } }),
      prisma.report.count({ where: { status: "PENDING" } }),
      prisma.report.count({ where: { status: "RESOLVED" } }),
      prisma.report.count(),
      prisma.promotionPayment.aggregate({
        where: { status: "SUCCESS" },
        _sum: { amount: true },
      }),
      prisma.promotionOrder.count({ where: { status: "PAID" } }),
      prisma.listingPromotion.count({
        where: {
          status: "ACTIVE",
          endDate: { gte: now },
        },
      }),
    ]);

    const totalRevenue = Number(revenueResult._sum.amount || 0);

    // 2. BIỂU ĐỒ 1 & 2: DỮ LIỆU THEO NGÀY (DOANH THU & TĂNG TRƯỞNG TIN/NGƯỜI DÙNG)
    const [rangePayments, rangeListings, rangeUsers] = await Promise.all([
      prisma.promotionPayment.findMany({
        where: {
          status: "SUCCESS",
          paidAt: { gte: startDate },
        },
        select: {
          amount: true,
          paidAt: true,
          createdAt: true,
        },
      }),
      prisma.listing.findMany({
        where: {
          createdAt: { gte: startDate },
        },
        select: {
          createdAt: true,
          status: true,
        },
      }),
      prisma.user.findMany({
        where: {
          createdAt: { gte: startDate },
        },
        select: {
          createdAt: true,
        },
      }),
    ]);

    // Chuẩn bị mảng các ngày trong khoảng thời gian đã chọn
    const dailyMap = {};
    for (let i = 0; i < days; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      const dateKey = d.toISOString().split("T")[0]; // YYYY-MM-DD
      const dayOfWeek = VI_DAYS[d.getDay()];
      const shortDate = `${d.getDate()}/${d.getMonth() + 1}`;

      dailyMap[dateKey] = {
        date: dateKey,
        day: days <= 7 ? dayOfWeek : shortDate,
        label: `${dayOfWeek} (${shortDate})`,
        revenue: 0,
        orders: 0,
        listings: 0,
        users: 0,
      };
    }

    // Điền doanh thu vào từng ngày
    for (const p of rangePayments) {
      const pDate = p.paidAt || p.createdAt;
      const key = pDate.toISOString().split("T")[0];
      if (dailyMap[key]) {
        dailyMap[key].revenue += Number(p.amount);
        dailyMap[key].orders += 1;
      }
    }

    // Điền số tin đăng vào từng ngày
    for (const l of rangeListings) {
      const key = l.createdAt.toISOString().split("T")[0];
      if (dailyMap[key]) {
        dailyMap[key].listings += 1;
      }
    }

    // Điền số người dùng vào từng ngày
    for (const u of rangeUsers) {
      const key = u.createdAt.toISOString().split("T")[0];
      if (dailyMap[key]) {
        dailyMap[key].users += 1;
      }
    }

    const timelineData = Object.values(dailyMap);

    // Tính toán chiều cao tương đối % cho biểu đồ UI mượt mà
    const maxListings = Math.max(...timelineData.map((x) => x.listings), 1);
    const maxRevenue = Math.max(...timelineData.map((x) => x.revenue), 100000);
    const maxUsers = Math.max(...timelineData.map((x) => x.users), 1);

    const growthChart = timelineData.map((item) => ({
      ...item,
      listingsHeight: `${Math.max(12, Math.round((item.listings / maxListings) * 100))}%`,
      usersHeight: `${Math.max(12, Math.round((item.users / maxUsers) * 100))}%`,
      revenueHeight: `${Math.max(12, Math.round((item.revenue / maxRevenue) * 100))}%`,
    }));

    // 3. BIỂU ĐỒ 3: PHỄU TRẠNG THÁI KIỂM DUYỆT TIN ĐĂNG (LISTING MODERATION FUNNEL)
    const validTotalListings = Math.max(totalListingsCount, 1);
    const listingStatusBreakdown = [
      {
        status: "PUBLISHED",
        label: "Đang hiển thị",
        count: publishedListingsCount,
        percent: Math.round((publishedListingsCount / validTotalListings) * 100),
        color: "#10B981", // Emerald green
        badgeColor: "bg-emerald-500",
      },
      {
        status: "PENDING_APPROVAL",
        label: "Chờ phê duyệt",
        count: pendingListingsCount,
        percent: Math.round((pendingListingsCount / validTotalListings) * 100),
        color: "#F59E0B", // Amber yellow
        badgeColor: "bg-amber-500",
      },
      {
        status: "REJECTED",
        label: "Bị từ chối",
        count: rejectedListingsCount,
        percent: Math.round((rejectedListingsCount / validTotalListings) * 100),
        color: "#EF4444", // Rose red
        badgeColor: "bg-rose-500",
      },
      {
        status: "HIDDEN",
        label: "Bị gỡ vi phạm",
        count: hiddenListingsCount,
        percent: Math.round((hiddenListingsCount / validTotalListings) * 100),
        color: "#6B7280", // Gray
        badgeColor: "bg-gray-500",
      },
    ];

    // 4. BIỂU ĐỒ 4: PHÂN BỔ LOẠI HÌNH BẤT ĐỘNG SẢN (PROPERTY TYPES BREAKDOWN)
    const rawTypeCounts = await prisma.listing.groupBy({
      by: ["propertyType"],
      _count: { id: true },
    });

    const colors = ["bg-[#F4CD65]", "bg-[#DCA936]", "bg-[#805B10]", "bg-[#373523]"];
    const hexColors = ["#F4CD65", "#DCA936", "#805B10", "#373523"];
    const propertyDistribution = ["STUDIO", "SERVICE_APARTMENT", "ROOM_SHARE", "WHOLE_HOUSE"].map(
      (type, idx) => {
        const found = rawTypeCounts.find((x) => x.propertyType === type);
        const count = found ? found._count.id : 0;
        const percent = Math.round((count / validTotalListings) * 100);
        return {
          type,
          label: PROPERTY_TYPE_LABELS[type] || type,
          count,
          percent,
          color: colors[idx % colors.length],
          hexColor: hexColors[idx % hexColors.length],
        };
      }
    );

    // 5. BIỂU ĐỒ 5: TOP KHU VỰC / QUẬN HUYỆN SÔI ĐỘNG NHẤT
    const rawDistrictCounts = await prisma.listing.groupBy({
      by: ["district"],
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 5,
    });

    const topDistricts = rawDistrictCounts.map((d) => ({
      district: d.district || "Khác",
      count: d._count.id,
      percent: Math.round((d._count.id / validTotalListings) * 100),
    }));

    // 6. BIỂU ĐỒ 6: PHÂN TÍCH LÝ DO TỐ CÁO VI PHẠM (REPORT REASONS)
    const rawReportReasons = await prisma.report.groupBy({
      by: ["reason"],
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 6,
    });

    const validTotalReports = Math.max(totalReportsCount, 1);
    const reportReasonsBreakdown = rawReportReasons.map((r) => ({
      reason: r.reason,
      label: REPORT_REASON_LABELS[r.reason] || r.reason,
      count: r._count.id,
      percent: Math.round((r._count.id / validTotalReports) * 100),
    }));

    // 7. GÓI QUẢNG BÁ ĐANG HOẠT ĐỘNG
    const rawTierStats = await prisma.listingPromotion.groupBy({
      by: ["tier"],
      where: {
        status: "ACTIVE",
        endDate: { gte: now },
      },
      _count: { id: true },
    });

    const activePromosByTier = {
      VIP: rawTierStats.find((x) => x.tier === "VIP")?._count.id || 0,
      HOT: rawTierStats.find((x) => x.tier === "HOT")?._count.id || 0,
    };

    return res.json({
      success: true,
      timeRange,
      days,
      summary: {
        pendingListingsCount,
        totalListingsCount,
        publishedListingsCount,
        rejectedListingsCount,
        hiddenListingsCount,
        totalUsersCount,
        landlordsCount,
        rentersCount,
        lockedUsersCount,
        pendingKycCount,
        pendingReportsCount,
        resolvedReportsCount,
        totalReportsCount,
        totalRevenue,
        paidOrdersCount,
        activePromosCount,
        activePromosByTier,
      },
      charts: {
        growthChart,
        listingStatusBreakdown,
        propertyDistribution,
        topDistricts,
        reportReasonsBreakdown,
      },
    });
  } catch (error) {
    console.error("Get admin dashboard stats error:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi máy chủ khi lấy số liệu thống kê Dashboard Admin.",
      error: error.message,
    });
  }
}
