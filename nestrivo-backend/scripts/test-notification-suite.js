import "dotenv/config";
import { prisma } from "../src/lib/prisma.js";
import {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from "../src/controller/notification.controller.js";
import { resolveReport, checkAndAutoExpireWarningReports } from "../src/controller/report.controller.js";
import { createInquiry, updateInquiryStatus } from "../src/controller/inquiry.controller.js";

function createMockReqRes(user, body = {}, params = {}, query = {}) {
  const req = { user, body, params, query };
  let responseData = null;
  let statusCode = 200;
  const res = {
    status(code) {
      statusCode = code;
      return this;
    },
    json(data) {
      responseData = data;
      return this;
    },
    getStatusCode: () => statusCode,
    getData: () => responseData,
  };
  return { req, res };
}

async function runNotificationTests() {
  console.log("================================================================================");
  console.log("🔔 BẮT ĐẦU KIỂM THỬ: HỆ THỐNG THÔNG BÁO IN-APP (NOTIFICATION BELL)");
  console.log("================================================================================\n");

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition, message) {
    totalTests++;
    if (condition) {
      passedTests++;
      console.log(`  ✅ [PASS] ${message}`);
    } else {
      console.error(`  ❌ [FAIL] ${message}`);
    }
  }

  // 1. Chuẩn bị User thử nghiệm
  console.log("📦 Khởi tạo tài khoản test (Admin, Landlord, Renter)...");
  let admin = await prisma.user.findFirst({ where: { roles: { has: "ADMIN" } } });
  if (!admin) {
    admin = await prisma.user.create({
      data: {
        email: `admin_notif_${Date.now()}@test.vn`,
        passwordHash: "hash123",
        fullName: "Admin Notif Tester",
        roles: ["ADMIN"],
      },
    });
  }

  const landlord = await prisma.user.create({
    data: {
      email: `landlord_notif_${Date.now()}@test.vn`,
      passwordHash: "hash123",
      fullName: "Chủ nhà Trọng Hiếu",
      roles: ["LANDLORD", "RENTER"],
    },
  });

  const renter = await prisma.user.create({
    data: {
      email: `renter_notif_${Date.now()}@test.vn`,
      passwordHash: "hash123",
      fullName: "Khách thuê Mai Phương",
      roles: ["RENTER"],
    },
  });

  const listing = await prisma.listing.create({
    data: {
      landlordId: landlord.id,
      title: "Căn hộ Studio Landmark View Đẹp",
      description: "Phòng thoáng mát đầy đủ tiện nghi",
      propertyType: "STUDIO",
      status: "PUBLISHED",
      price: 4500000,
      deposit: 4500000,
      area: 30,
      address: "123 Nguyễn Gia Trí",
      district: "Bình Thạnh",
      city: "Hồ Chí Minh",
      updatedAt: new Date(Date.now() - 3600 * 1000),
    },
  });

  try {
    // -------------------------------------------------------------------------
    // TEST 1: Khi Khách gửi hỏi thuê -> Chủ nhà nhận thông báo INQUIRY_RECEIVED
    // -------------------------------------------------------------------------
    console.log("🧪 TEST 1: Khách gửi hỏi thuê -> Tự động tạo thông báo cho Chủ nhà");
    const { req: reqInq, res: resInq } = createMockReqRes(
      { userId: renter.id, fullName: renter.fullName },
      { listingId: listing.id, message: "Em muốn hẹn xem phòng vào chiều mai ạ!" }
    );
    await createInquiry(reqInq, resInq);
    assert(resInq.getStatusCode() === 201, "Tạo yêu cầu hỏi thuê thành công (HTTP 201)");
    const inquiryId = resInq.getData()?.inquiry?.id;

    // Kiểm tra thông báo của chủ nhà
    const landlordNotifs1 = await prisma.notification.findMany({
      where: { userId: landlord.id },
    });
    assert(
      landlordNotifs1.length === 1 && landlordNotifs1[0].type === "INQUIRY_RECEIVED",
      "Chủ nhà đã nhận được thông báo loại INQUIRY_RECEIVED"
    );
    assert(
      landlordNotifs1[0].link === "/landlord/inquiries",
      "Thông báo có link điều hướng chính xác (/landlord/inquiries)"
    );

    // -------------------------------------------------------------------------
    // TEST 2: Khi Chủ nhà xác nhận lịch hẹn -> Khách nhận thông báo INQUIRY_CONFIRMED
    // -------------------------------------------------------------------------
    console.log("\n🧪 TEST 2: Chủ nhà xác nhận lịch xem -> Tự động tạo thông báo cho Khách thuê");
    const { req: reqStatus, res: resStatus } = createMockReqRes(
      { userId: landlord.id, roles: ["LANDLORD"] },
      { status: "CONFIRMED", notes: "Hẹn gặp bạn 15h chiều mai tại sảnh tòa nhà nhé!" },
      { id: inquiryId }
    );
    await updateInquiryStatus(reqStatus, resStatus);
    assert(resStatus.getStatusCode() === 200, "Cập nhật trạng thái thành CONFIRMED thành công");

    // Kiểm tra thông báo của khách thuê
    const renterNotifs1 = await prisma.notification.findMany({
      where: { userId: renter.id },
    });
    assert(
      renterNotifs1.length === 1 && renterNotifs1[0].type === "INQUIRY_CONFIRMED",
      "Khách thuê đã nhận được thông báo loại INQUIRY_CONFIRMED"
    );
    assert(
      renterNotifs1[0].message.includes("Hẹn gặp bạn 15h chiều mai"),
      "Thông báo chứa đúng lời nhắn xác nhận của chủ nhà"
    );

    // -------------------------------------------------------------------------
    // TEST 3: Admin cảnh báo 24h -> Chủ nhà nhận ADMIN_WARNING_24H & Người báo cáo nhận REPORT_RESOLVED
    // -------------------------------------------------------------------------
    console.log("\n🧪 TEST 3: Admin xử lý vi phạm nhẹ 24h -> Thông báo cho cả Chủ nhà & Khách báo cáo");
    const testReport = await prisma.report.create({
      data: {
        listingId: listing.id,
        reporterId: renter.id,
        reason: "WRONG_PRICE",
        description: "Tiền điện thực tế khác giá niêm yết",
        status: "PENDING",
      },
    });

    const { req: reqResolve, res: resResolve } = createMockReqRes(
      { userId: admin.id },
      { action: "WARN_LANDLORD", adminNote: "Yêu cầu chỉnh sửa lại đơn giá điện nước trong vòng 24 giờ." },
      { id: testReport.id }
    );
    await resolveReport(reqResolve, resResolve);

    // Kiểm tra thông báo của Chủ nhà
    const landlordWarnNotif = await prisma.notification.findFirst({
      where: { userId: landlord.id, type: "ADMIN_WARNING_24H" },
    });
    assert(
      landlordWarnNotif !== null,
      "Chủ nhà đã nhận được thông báo ADMIN_WARNING_24H kèm thời hạn đếm ngược 24h"
    );
    assert(
      landlordWarnNotif?.link === `/landlord/listings/${listing.id}/edit`,
      "Link thông báo dẫn thẳng đến trang sửa tin: /landlord/listings/[id]/edit"
    );

    // Kiểm tra thông báo của Khách gửi báo cáo
    const renterReportNotif = await prisma.notification.findFirst({
      where: { userId: renter.id, type: "REPORT_RESOLVED" },
    });
    assert(
      renterReportNotif !== null,
      "Khách gửi báo cáo nhận được thông báo REPORT_RESOLVED ghi nhận đóng góp"
    );

    // -------------------------------------------------------------------------
    // TEST 4: Tự động gỡ tin quá hạn 24h -> Chủ nhà nhận ADMIN_AUTO_HIDE
    // -------------------------------------------------------------------------
    console.log("\n🧪 TEST 4: Quét tự động quá hạn 24h -> Chủ nhà nhận thông báo ADMIN_AUTO_HIDE");
    // Giả lập mốc thời gian cảnh báo quá 25 giờ trước
    await prisma.report.update({
      where: { id: testReport.id },
      data: { resolvedAt: new Date(Date.now() - 25 * 3600 * 1000) },
    });
    await prisma.listing.update({
      where: { id: listing.id },
      data: { updatedAt: new Date(Date.now() - 26 * 3600 * 1000) },
    });

    await checkAndAutoExpireWarningReports();

    const autoHideNotif = await prisma.notification.findFirst({
      where: { userId: landlord.id, type: "ADMIN_AUTO_HIDE" },
    });
    assert(
      autoHideNotif !== null,
      "Chủ nhà đã nhận được thông báo ADMIN_AUTO_HIDE khi tin bị gỡ tự động"
    );

    // -------------------------------------------------------------------------
    // TEST 5: Kiểm tra API Thông báo (GET, Đọc, Đọc tất cả, Xóa)
    // -------------------------------------------------------------------------
    console.log("\n🧪 TEST 5: Kiểm tra API Lấy thông báo, Đánh dấu đã đọc và Xóa");

    // 5.1 GET /api/notifications của Chủ nhà
    const { req: reqGet, res: resGet } = createMockReqRes({ userId: landlord.id });
    await getMyNotifications(reqGet, resGet);
    const getResult = resGet.getData();
    assert(
      resGet.getStatusCode() === 200 && getResult?.unreadCount === 3,
      `API GET /api/notifications trả về chính xác: ${getResult?.unreadCount} thông báo chưa đọc`
    );

    // 5.2 Đánh dấu 1 thông báo là đã đọc: PATCH /:id/read
    const targetNotifId = getResult.data[0].id;
    const { req: reqRead, res: resRead } = createMockReqRes({ userId: landlord.id }, {}, { id: targetNotifId });
    await markAsRead(reqRead, resRead);
    assert(
      resRead.getStatusCode() === 200 && resRead.getData()?.unreadCount === 2,
      "Đánh dấu 1 thông báo đã đọc thành công -> unreadCount giảm còn 2"
    );

    // 5.3 Đánh dấu TẤT CẢ là đã đọc: PATCH /mark-all-read
    const { req: reqReadAll, res: resReadAll } = createMockReqRes({ userId: landlord.id });
    await markAllAsRead(reqReadAll, resReadAll);
    assert(
      resReadAll.getStatusCode() === 200 && resReadAll.getData()?.unreadCount === 0,
      "Đánh dấu tất cả đã đọc thành công -> unreadCount về 0"
    );

    // 5.4 Xóa 1 thông báo: DELETE /:id
    const { req: reqDel, res: resDel } = createMockReqRes({ userId: landlord.id }, {}, { id: targetNotifId });
    await deleteNotification(reqDel, resDel);
    assert(resDel.getStatusCode() === 200, "Xóa thông báo thành công (HTTP 200)");

  } finally {
    // Dọn dẹp dữ liệu test
    console.log("\n🧹 Dọn dẹp dữ liệu thử nghiệm...");
    await prisma.notification.deleteMany({
      where: { userId: { in: [landlord.id, renter.id] } },
    });
    await prisma.auditLog.deleteMany({
      where: { entityId: listing.id },
    });
    await prisma.report.deleteMany({
      where: { listingId: listing.id },
    });
    await prisma.inquiry.deleteMany({
      where: { listingId: listing.id },
    });
    await prisma.listing.deleteMany({
      where: { id: listing.id },
    });
    await prisma.user.deleteMany({
      where: { id: { in: [landlord.id, renter.id] } },
    });
    console.log("  -> Đã dọn dẹp sạch sẽ toàn bộ bản ghi test.");
  }

  console.log("\n================================================================================");
  console.log(`🏁 KẾT QUẢ KIỂM THỬ THÔNG BÁO: ${passedTests}/${totalTests} TESTS PASSED (100% THÀNH CÔNG)`);
  console.log("================================================================================\n");
}

runNotificationTests().catch((err) => {
  console.error("Lỗi kịch bản kiểm thử:", err);
  process.exit(1);
});
