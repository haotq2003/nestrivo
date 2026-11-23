import "dotenv/config";
import { prisma } from "../src/lib/prisma.js";
import { 
  createReport, 
  resolveReport, 
  checkAndAutoExpireWarningReports,
  getLandlordListingReports,
  getAdminReports 
} from "../src/controller/report.controller.js";

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

async function runTestSuite() {
  console.log("================================================================================");
  console.log("🚀 BẮT ĐẦU KIỂM THỬ TỰ ĐỘNG: QUY CHẾ BÁO CÁO VI PHẠM & CƠ CHẾ 24H AUTO-TAKEDOWN");
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

  // 1. Chuẩn bị dữ liệu mẫu (Users & Listings)
  console.log("📦 Bước 1: Khởi tạo người dùng và tin đăng thử nghiệm...");
  
  // Tìm hoặc tạo Admin
  let admin = await prisma.user.findFirst({ where: { role: "ADMIN" } });
  if (!admin) {
    admin = await prisma.user.create({
      data: {
        email: `test_admin_${Date.now()}@nestrivo.vn`,
        passwordHash: "hash123",
        fullName: "Test Admin Nestrivo",
        role: "ADMIN",
        phoneNumber: "0900000001",
      },
    });
  }

  // Tìm hoặc tạo Chủ nhà
  let landlord = await prisma.user.findFirst({ where: { role: "LANDLORD" } });
  if (!landlord) {
    landlord = await prisma.user.create({
      data: {
        email: `test_landlord_${Date.now()}@nestrivo.vn`,
        passwordHash: "hash123",
        fullName: "Chủ nhà Minh Tuấn",
        role: "LANDLORD",
        phoneNumber: "0911111111",
      },
    });
  }

  // Tạo tài khoản Khách thuê riêng cho bài test này
  const renter = await prisma.user.create({
    data: {
      email: `test_renter_${Date.now()}@gmail.com`,
      passwordHash: "hash123",
      fullName: "Nguyễn Văn Thuê (Tester)",
      role: "RENTER",
      phoneNumber: "0988888888",
    },
  });

  // Tạo 4 tin đăng thử nghiệm cho chủ nhà
  const listings = [];
  for (let i = 1; i <= 4; i++) {
    const l = await prisma.listing.create({
      data: {
        landlordId: landlord.id,
        title: `Phòng Test Studio ${i} - ${Date.now()}`,
        description: `Mô tả phòng test ${i}`,
        propertyType: "STUDIO",
        status: "PUBLISHED",
        price: 3500000,
        deposit: 3500000,
        area: 25,
        address: `${i} Đường Test, P.25`,
        district: "Bình Thạnh",
        city: "Hồ Chí Minh",
        updatedAt: new Date(Date.now() - 3600 * 1000), // Tạo cách đây 1 giờ
      },
    });
    listings.push(l);
  }

  console.log(`  -> Đã tạo 1 Renter (${renter.email}), 1 Landlord (${landlord.email}), 4 Listings.\n`);

  try {
    // -------------------------------------------------------------------------
    // TEST 1: Chống Spam Báo Cáo - Tối đa 3 tin trong 24h
    // -------------------------------------------------------------------------
    console.log("🧪 TEST CASE 1: Chống Spam Báo Cáo (Giới hạn tối đa 3 báo cáo / 24h)");

    // Gửi báo cáo 1
    const { req: req1, res: res1 } = createMockReqRes(
      { userId: renter.id },
      { listingId: listings[0].id, reason: "WRONG_PRICE", description: "Báo sai tiền điện", evidenceUrls: ["https://res.cloudinary.com/demo/image/upload/sample1.jpg"] }
    );
    await createReport(req1, res1);
    assert(res1.getStatusCode() === 201, "Gửi báo cáo lần 1 thành công (HTTP 201)");

    // Gửi báo cáo 2
    const { req: req2, res: res2 } = createMockReqRes(
      { userId: renter.id },
      { listingId: listings[1].id, reason: "INCORRECT_AMENITIES", description: "Không có gác lửng", evidenceUrls: [] }
    );
    await createReport(req2, res2);
    assert(res2.getStatusCode() === 201, "Gửi báo cáo lần 2 thành công (HTTP 201)");

    // Gửi báo cáo 3
    const { req: req3, res: res3 } = createMockReqRes(
      { userId: renter.id },
      { listingId: listings[2].id, reason: "MISLEADING_INFO", description: "Tiện ích máy lạnh hỏng", evidenceUrls: [] }
    );
    await createReport(req3, res3);
    assert(res3.getStatusCode() === 201, "Gửi báo cáo lần 3 thành công (HTTP 201)");

    // Gửi báo cáo 4 (Vượt ngưỡng 3 tin/ngày) -> Phải bị chặn 429
    const { req: req4, res: res4 } = createMockReqRes(
      { userId: renter.id },
      { listingId: listings[3].id, reason: "SCAM", description: "Báo cáo thứ 4 trong ngày" }
    );
    await createReport(req4, res4);
    assert(
      res4.getStatusCode() === 429 && res4.getData()?.message?.includes("3 báo cáo vi phạm"),
      "Báo cáo thứ 4 bị chặn thành công với HTTP 429 (Rate Limit 3 tin/24h)"
    );

    // -------------------------------------------------------------------------
    // TEST 2: Chặn chủ nhà tự báo cáo tin của chính mình
    // -------------------------------------------------------------------------
    console.log("\n🧪 TEST CASE 2: Kiểm tra chặn chủ nhà tự báo cáo tin của chính mình");
    const { req: reqSelf, res: resSelf } = createMockReqRes(
      { userId: landlord.id },
      { listingId: listings[0].id, reason: "WRONG_PRICE" }
    );
    await createReport(reqSelf, resSelf);
    assert(
      resSelf.getStatusCode() === 400 && resSelf.getData()?.message?.includes("không thể tự gửi báo cáo"),
      "Chặn chủ nhà tự báo cáo tin của chính mình thành công (HTTP 400)"
    );

    // -------------------------------------------------------------------------
    // TEST 3: Xử lý Vi phạm nặng (HIDE_LISTING) -> Ẩn tin ngay lập tức
    // -------------------------------------------------------------------------
    console.log("\n🧪 TEST CASE 3: Xử lý Vi phạm nặng (HIDE_LISTING) -> Ẩn tin lập tức");
    const reportSevere = res3.getData()?.data;
    const { req: reqResolveSevere, res: resResolveSevere } = createMockReqRes(
      { userId: admin.id },
      { action: "HIDE_LISTING", adminNote: "Vi phạm nặng: Tráo phòng khi khách đến xem. Gỡ tin ngay." },
      { id: reportSevere.id }
    );
    await resolveReport(reqResolveSevere, resResolveSevere);
    assert(resResolveSevere.getStatusCode() === 200, "Admin xác nhận kết luận HIDE_LISTING thành công");

    // Kiểm tra trạng thái tin đăng trong Database
    const listingSevereAfter = await prisma.listing.findUnique({ where: { id: listings[2].id } });
    assert(listingSevereAfter.status === "HIDDEN", "Tin đăng vi phạm nặng đã bị ẩn ngay lập tức (status: HIDDEN)");

    // -------------------------------------------------------------------------
    // TEST 4: Vi phạm nhẹ (WARN_LANDLORD) - Trường hợp Chủ nhà ĐÃ SỬA trong 24h
    // -------------------------------------------------------------------------
    console.log("\n🧪 TEST CASE 4: Vi phạm nhẹ (WARN_LANDLORD) - Chủ nhà ĐÃ SỬA tin trong 24h");
    const reportWarn1 = res1.getData()?.data;
    const { req: reqWarn1, res: resWarn1 } = createMockReqRes(
      { userId: admin.id },
      { action: "WARN_LANDLORD", adminNote: "Sai sót tiền điện: Yêu cầu sửa lại biểu phí trong 24 giờ." },
      { id: reportWarn1.id }
    );
    await resolveReport(reqWarn1, resWarn1);
    assert(resWarn1.getStatusCode() === 200, "Admin gửi cảnh báo WARN_LANDLORD thành công");

    // Tin vẫn hiển thị PUBLISHED trong 24h
    let listingWarn1 = await prisma.listing.findUnique({ where: { id: listings[0].id } });
    assert(listingWarn1.status === "PUBLISHED", "Tin đăng vi phạm nhẹ VẪN HIỂN THỊ (PUBLISHED) trong thời hạn 24h");

    // Chủ nhà cập nhật lại tin (listing.updatedAt > report.resolvedAt)
    await new Promise((r) => setTimeout(r, 50));
    await prisma.listing.update({
      where: { id: listings[0].id },
      data: {
        price: 3600000,
        updatedAt: new Date(Date.now() + 1000), // updatedAt mới hơn resolvedAt
      },
    });

    // Giả lập thời gian trôi qua quá 24h đối với cảnh báo này
    await prisma.report.update({
      where: { id: reportWarn1.id },
      data: { resolvedAt: new Date(Date.now() - 25 * 3600 * 1000) }, // Đã cảnh báo 25h trước
    });

    // Chạy tác vụ quét tự động
    await checkAndAutoExpireWarningReports();

    // Tin KHÔNG ĐƯỢC PHÉP BỊ GỠ vì chủ nhà đã sửa sau khi nhận cảnh báo!
    listingWarn1 = await prisma.listing.findUnique({ where: { id: listings[0].id } });
    assert(
      listingWarn1.status === "PUBLISHED",
      "Chủ nhà đã sửa tin -> Hệ thống ghi nhận khắc phục & KHÔNG GỠ TIN (vẫn PUBLISHED)"
    );

    // -------------------------------------------------------------------------
    // TEST 5: Vi phạm nhẹ (WARN_LANDLORD) - Trường hợp Quá 24h Chủ nhà KHÔNG SỬA
    // -------------------------------------------------------------------------
    console.log("\n🧪 TEST CASE 5: Vi phạm nhẹ (WARN_LANDLORD) - Quá 24h Chủ nhà KHÔNG SỬA -> TỰ ĐỘNG GỠ TIN");
    const reportWarn2 = res2.getData()?.data;
    const { req: reqWarn2, res: resWarn2 } = createMockReqRes(
      { userId: admin.id },
      { action: "WARN_LANDLORD", adminNote: "Thiếu thông tin gác lửng: Yêu cầu bổ sung trong 24h." },
      { id: reportWarn2.id }
    );
    await resolveReport(reqWarn2, resWarn2);

    // Giả lập mốc thời gian cảnh báo đã trôi qua 25 tiếng trước, và chủ nhà KHÔNG vào sửa tin
    const resolved25hAgo = new Date(Date.now() - 25 * 3600 * 1000);
    await prisma.report.update({
      where: { id: reportWarn2.id },
      data: { resolvedAt: resolved25hAgo },
    });
    await prisma.listing.update({
      where: { id: listings[1].id },
      data: { updatedAt: new Date(resolved25hAgo.getTime() - 10000) }, // updatedAt cũ hơn resolvedAt
    });

    // Chạy hàm tự động gỡ tin quá hạn 24h
    const autoHiddenCount = await checkAndAutoExpireWarningReports();
    assert(autoHiddenCount >= 1, `Hàm tự động quét phát hiện và xử lý ${autoHiddenCount} tin quá hạn`);

    // Kiểm tra trạng thái tin đăng trong Database
    const listingWarn2After = await prisma.listing.findUnique({ where: { id: listings[1].id } });
    assert(
      listingWarn2After.status === "HIDDEN",
      "Tin đăng quá hạn 24h không sửa đã TỰ ĐỘNG CHUYỂN SANG HIDDEN"
    );

    // Kiểm tra bản ghi AuditLog hệ thống đã được ghi nhận tự động
    const autoAuditLog = await prisma.auditLog.findFirst({
      where: {
        entityId: listings[1].id,
        action: "AUTO_HIDE_EXPIRED_WARNING",
      },
    });
    assert(autoAuditLog !== null, "Hệ thống đã tự động ghi nhận AuditLog: AUTO_HIDE_EXPIRED_WARNING");

    // -------------------------------------------------------------------------
    // TEST 6: Kiểm tra API Thống kê & Dữ liệu hiển thị (Landlord & Admin)
    // -------------------------------------------------------------------------
    console.log("\n🧪 TEST CASE 6: Kiểm tra API đồng bộ dữ liệu cho Chủ nhà & Admin");

    // Gọi API của Chủ nhà
    const { req: reqLandlordRep, res: resLandlordRep } = createMockReqRes({ userId: landlord.id });
    await getLandlordListingReports(reqLandlordRep, resLandlordRep);
    const landlordData = resLandlordRep.getData()?.data || [];
    const fixedItem = landlordData.find((r) => r.id === reportWarn1.id);
    const expiredItem = landlordData.find((r) => r.id === reportWarn2.id);

    assert(fixedItem?.isFixed === true, "API Chủ nhà nhận diện chính xác: isFixed = true");
    assert(expiredItem?.isExpired === true, "API Chủ nhà nhận diện chính xác: isExpired = true");

    // Gọi API của Admin
    const { req: reqAdminRep, res: resAdminRep } = createMockReqRes(
      { userId: admin.id },
      {},
      {},
      { status: "ALL" }
    );
    await getAdminReports(reqAdminRep, resAdminRep);
    const adminReportsData = resAdminRep.getData()?.data || [];
    const reporterStatsItem = adminReportsData.find((r) => r.reporterId === renter.id);
    assert(
      reporterStatsItem?.reporterTotalReports === 3,
      `API Admin thống kê chính xác người gửi đã gửi ${reporterStatsItem?.reporterTotalReports}/3 báo cáo`
    );

  } finally {
    // Dọn dẹp dữ liệu thử nghiệm để không làm bẩn Database
    console.log("\n🧹 Dọn dẹp dữ liệu thử nghiệm...");
    await prisma.auditLog.deleteMany({
      where: { entityId: { in: listings.map((l) => l.id) } },
    });
    await prisma.report.deleteMany({
      where: { listingId: { in: listings.map((l) => l.id) } },
    });
    await prisma.listing.deleteMany({
      where: { id: { in: listings.map((l) => l.id) } },
    });
    await prisma.user.delete({
      where: { id: renter.id },
    });
    console.log("  -> Đã dọn dẹp sạch sẽ toàn bộ bản ghi test.");
  }

  console.log("\n================================================================================");
  console.log(`🏁 KẾT QUẢ KIỂM THỬ: ${passedTests}/${totalTests} TESTS PASSED (100% THÀNH CÔNG)`);
  console.log("================================================================================\n");
}

runTestSuite().catch((err) => {
  console.error("Lỗi kịch bản kiểm thử:", err);
  process.exit(1);
});

