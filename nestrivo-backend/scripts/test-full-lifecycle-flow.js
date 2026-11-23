import "dotenv/config";
import { prisma } from "../src/lib/prisma.js";
import { register, submitKycVerification } from "../src/controller/auth.controller.js";
import { 
  approveLandlordVerification, 
  approveListing 
} from "../src/controller/admin.listing.controller.js";
import { 
  createListing, 
  updateListing 
} from "../src/controller/landlord.listing.controller.js";
import { 
  getPromotionPlans, 
  createPromotionOrder, 
  payPromotionOrder 
} from "../src/controller/promotion.controller.js";
import { 
  createInquiry, 
  updateInquiryStatus 
} from "../src/controller/inquiry.controller.js";
import { createReview } from "../src/controller/review.controller.js";
import { 
  createReport, 
  resolveReport 
} from "../src/controller/report.controller.js";
import { getMyNotifications } from "../src/controller/notification.controller.js";

// Helper giả lập Request / Response Express
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

async function runFullLifecycleTest() {
  console.log("================================================================================");
  console.log("🌟 BẮT ĐẦU KIỂM THỬ E2E TOÀN DIỆN: VÒNG ĐỜI TRẢI NGHIỆM ĐA TÀI KHOẢN (FULL LIFECYCLE)");
  console.log("================================================================================");
  console.log("Các giai đoạn kiểm thử:");
  console.log("  1. Tạo tài khoản Chủ nhà mới (Registration)");
  console.log("  2. Xác thực danh tính eKYC & Admin duyệt (eKYC Verification)");
  console.log("  3. Đăng tin phòng trọ & Mua gói Tin Nổi Bật VIP (Listing & Promotion)");
  console.log("  4. Khách thuê xem tin & Đặt lịch hẹn xem phòng (Viewing Inquiry)");
  console.log("  5. Khách thuê Đánh giá sau khi xem phòng (Verified Viewing Review)");
  console.log("  6. Khách thuê Tố cáo vi phạm nghiêm trọng (Listing Report)");
  console.log("  7. Admin xem xét & Xử phạt gỡ tin lập tức (Admin Moderation - HIDE_LISTING)");
  console.log("  8. Chủ nhà nhận cảnh báo & Vào chỉnh sửa tin khắc phục (Landlord Rectification)");
  console.log("================================================================================\n");

  let passedTests = 0;
  let totalTests = 0;
  const timestamp = Date.now();

  function assert(condition, message, errorDetail = null) {
    totalTests++;
    if (condition) {
      passedTests++;
      console.log(`    ✅ [PASS] ${message}`);
    } else {
      console.error(`    ❌ [FAIL] ${message}`);
      if (errorDetail) console.error("    -> Chi tiết lỗi:", errorDetail);
      throw new Error(`Kiểm thử thất bại tại bước: ${message}`);
    }
  }

  // Quản lý các ID tạo trong test để dọn dẹp sạch sẽ
  let adminUser = null;
  let landlordUser = null;
  let renterUser = null;
  let createdListingId = null;
  let createdOrderId = null;
  let createdInquiryId = null;
  let createdReviewId = null;
  let createdReportId = null;

  try {
    // -------------------------------------------------------------------------
    // BƯỚC 0: Tìm hoặc khởi tạo Quản trị viên (Admin)
    // -------------------------------------------------------------------------
    console.log("👑 BƯỚC 0: Chuẩn bị tài khoản Quản trị viên (Admin)...");
    adminUser = await prisma.user.findFirst({ where: { roles: { has: "ADMIN" } } });
    if (!adminUser) {
      adminUser = await prisma.user.create({
        data: {
          email: `admin_system_${timestamp}@nestrivo.vn`,
          passwordHash: "$2a$12$eInFkZkGgHjYlG3zQ5bOe.7jQxV7mB5hM2/3Y.o7m2H9",
          fullName: "Admin Hệ Thống Nestrivo",
          roles: ["ADMIN"],
          phoneNumber: "0909000001",
        },
      });
      console.log(`  -> Đã tạo tài khoản Admin test: ${adminUser.email}`);
    } else {
      console.log(`  -> Sử dụng tài khoản Admin hiện hữu: ${adminUser.email}`);
    }

    // -------------------------------------------------------------------------
    // GIAI ĐOẠN 1: Tạo tài khoản Chủ nhà mới
    // -------------------------------------------------------------------------
    console.log("\n🏢 GIAI ĐOẠN 1: Tạo tài khoản Chủ nhà mới (Landlord Registration)");
    const landlordEmail = `landlord_flow_${timestamp}@nestrivo.vn`;
    const { req: reqReg, res: resReg } = createMockReqRes(
      null,
      {
        email: landlordEmail,
        password: "Password@123456",
        fullName: "Lê Hoàng Nam (Chủ Trọ Bình Thạnh)",
        phoneNumber: "0912345678",
        isLandlord: true,
        landlordDisplayName: "Căn Hộ Dịch Vụ Hoàng Nam",
      }
    );
    await register(reqReg, resReg);
    assert(resReg.getStatusCode() === 201, "Đăng ký tài khoản Chủ nhà mới thành công (HTTP 201)");
    
    landlordUser = resReg.getData()?.user;
    assert(landlordUser && landlordUser.id, "Tài khoản có ID hợp lệ và thông tin ban đầu");
    assert(landlordUser.roles?.includes("LANDLORD"), "Tài khoản được gán đúng phân quyền LANDLORD");

    // -------------------------------------------------------------------------
    // GIAI ĐOẠN 2: Xác thực danh tính eKYC & Admin duyệt
    // -------------------------------------------------------------------------
    console.log("\n🪪 GIAI ĐOẠN 2: Nộp hồ sơ xác thực eKYC & Admin phê duyệt");
    
    // 2.1 Chủ nhà gửi hồ sơ eKYC
    const { req: reqKyc, res: resKyc } = createMockReqRes(
      { userId: landlordUser.id, roles: landlordUser.roles },
      {
        personalInfo: {
          fullName: "Lê Hoàng Nam",
          idNumber: "079090123456",
          dateOfBirth: "1990-05-15",
          gender: "MALE",
          issueDate: "2021-08-20",
          issuingAuthority: "Cục Cảnh sát QLHC về TTXH",
          permanentAddress: "123/4 Nguyễn Gia Trí, Phường 25, Bình Thạnh, TP.HCM",
        },
        documents: {
          frontImage: "https://res.cloudinary.com/demo/image/upload/sample_cccd_front.jpg",
          backImage: "https://res.cloudinary.com/demo/image/upload/sample_cccd_back.jpg",
        },
      }
    );
    await submitKycVerification(reqKyc, resKyc);
    assert(resKyc.getStatusCode() === 200, "Chủ nhà nộp hồ sơ eKYC thành công (HTTP 200)");

    // Kiểm tra DB: Hồ sơ ở trạng thái PENDING
    const kycReqPending = await prisma.verificationRequest.findFirst({
      where: { landlordId: landlordUser.id, status: "PENDING" },
    });
    assert(kycReqPending !== null, "Hồ sơ xác minh đã được ghi nhận trong DB ở trạng thái PENDING");

    // 2.2 Admin duyệt hồ sơ eKYC
    const { req: reqApproveKyc, res: resApproveKyc } = createMockReqRes(
      { userId: adminUser.id, roles: ["ADMIN"] },
      {},
      { userId: landlordUser.id }
    );
    await approveLandlordVerification(reqApproveKyc, resApproveKyc);
    assert(resApproveKyc.getStatusCode() === 200, "Admin phê duyệt hồ sơ eKYC thành công (HTTP 200)");

    // Kiểm tra DB: LandlordProfile cập nhật VERIFIED
    const updatedProfile = await prisma.landlordProfile.findUnique({
      where: { userId: landlordUser.id },
    });
    assert(updatedProfile?.verificationStatus === "VERIFIED", "Trạng thái eKYC của chủ nhà chuyển thành VERIFIED");

    // -------------------------------------------------------------------------
    // GIAI ĐOẠN 3: Đăng tin phòng trọ & Mua gói Tin Nổi Bật (Promotion)
    // -------------------------------------------------------------------------
    console.log("\n🏠 GIAI ĐOẠN 3: Đăng tin phòng trọ & Mua gói Tin Nổi Bật VIP");

    // 3.1 Chủ nhà đăng tin mới
    const { req: reqCreateListing, res: resCreateListing } = createMockReqRes(
      { userId: landlordUser.id, roles: ["LANDLORD"] },
      {
        title: "Phòng Studio Ban Công View Landmark Siêu Đẹp",
        description: "Phòng thoáng mát, đầy đủ tiện nghi điều hòa, tủ lạnh, giường nệm cao cấp.",
        propertyType: "STUDIO",
        price: 4500000,
        deposit: 4500000,
        area: 32,
        bedrooms: 1,
        bathrooms: 1,
        maxOccupants: 2,
        address: "78 Võ Oanh",
        district: "Bình Thạnh",
        city: "Hồ Chí Minh",
        submitForReview: true,
        images: [
          { imageUrl: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800", sortOrder: 0 },
          { imageUrl: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800", sortOrder: 1 },
        ],
        fees: [
          { type: "ELECTRICITY", name: "Tiền điện", amount: 3500, unit: "PER_KWH" },
          { type: "WATER", name: "Tiền nước", amount: 100000, unit: "PER_PERSON" },
        ],
      }
    );
    await createListing(reqCreateListing, resCreateListing);
    assert(
      resCreateListing.getStatusCode() === 201, 
      "Tạo tin đăng phòng trọ thành công (HTTP 201)", 
      resCreateListing.getData()
    );
    const createdListing = resCreateListing.getData()?.listing;
    createdListingId = createdListing.id;

    // 3.2 Admin duyệt xuất bản tin
    const { req: reqApproveListing, res: resApproveListing } = createMockReqRes(
      { userId: adminUser.id, roles: ["ADMIN"] },
      {},
      { id: createdListingId }
    );
    await approveListing(reqApproveListing, resApproveListing);
    assert(resApproveListing.getStatusCode() === 200, "Admin duyệt tin đăng chuyển sang PUBLISHED", resApproveListing.getData());

    // 3.3 Lấy danh sách gói quảng bá
    const { req: reqPlans, res: resPlans } = createMockReqRes({ userId: landlordUser.id });
    await getPromotionPlans(reqPlans, resPlans);
    const plans = resPlans.getData()?.data || [];
    assert(plans.length > 0, "Hệ thống có sẵn các gói Tin Nổi Bật (PROMOTION_PLANS)", resPlans.getData());
    const chosenPlan = plans[0]; // Gói VIP đầu tiên

    // 3.4 Tạo đơn mua gói quảng bá
    const { req: reqOrder, res: resOrder } = createMockReqRes(
      { userId: landlordUser.id, roles: ["LANDLORD"] },
      { listingId: createdListingId, planId: chosenPlan.id }
    );
    await createPromotionOrder(reqOrder, resOrder);
    assert(resOrder.getStatusCode() === 201, "Tạo đơn mua gói quảng bá thành công (HTTP 201)");
    const orderData = resOrder.getData()?.order;
    createdOrderId = orderData.id;

    // 3.5 Thanh toán đơn hàng & Kích hoạt gói đẩy tin
    const { req: reqPay, res: resPay } = createMockReqRes(
      { userId: landlordUser.id, roles: ["LANDLORD"] },
      { paymentMethod: "MOMO", transactionCode: `MOMO_E2E_${timestamp}` },
      { orderId: createdOrderId }
    );
    await payPromotionOrder(reqPay, resPay);
    assert(resPay.getStatusCode() === 200, "Thanh toán gói đẩy tin thành công (HTTP 200)");

    // Kiểm tra tin đăng trong Database đã lên VIP
    const promotedListing = await prisma.listing.findUnique({
      where: { id: createdListingId },
      include: { promotions: true },
    });
    assert(promotedListing.currentTier === chosenPlan.tier, `Tin đăng đã nâng cấp thành công lên Tier: ${chosenPlan.tier}`);
    assert(promotedListing.priority >= chosenPlan.priority, `Tin có mức ưu tiên hiển thị cao (priority: ${promotedListing.priority})`);

    // -------------------------------------------------------------------------
    // GIAI ĐOẠN 4: Khách thuê vào xem tin & Đặt lịch hẹn xem phòng
    // -------------------------------------------------------------------------
    console.log("\n📅 GIAI ĐOẠN 4: Khách thuê xem phòng & Đặt lịch hẹn xem phòng");

    // 4.1 Tạo tài khoản Khách thuê (Renter)
    const renterEmail = `renter_flow_${timestamp}@gmail.com`;
    renterUser = await prisma.user.create({
      data: {
        email: renterEmail,
        passwordHash: "$2a$12$eInFkZkGgHjYlG3zQ5bOe.7jQxV7mB5hM2/3Y.o7m2H9",
        fullName: "Trần Thị Mai Phương",
        phoneNumber: "0988776655",
        roles: ["RENTER"],
      },
    });
    assert(renterUser && renterUser.id, "Tạo tài khoản Khách thuê (Renter) thành công");

    // 4.2 Khách thuê gửi yêu cầu đặt lịch xem phòng
    const { req: reqInq, res: resInq } = createMockReqRes(
      { userId: renterUser.id, fullName: renterUser.fullName },
      {
        listingId: createdListingId,
        message: "Chào anh Nam, em muốn qua xem phòng trực tiếp vào 17h30 chiều mai được không ạ?",
        moveInDate: "2026-12-01",
        occupantsCount: 2,
        notes: "Lịch hẹn xem phòng: 17h30 ngày mai",
      }
    );
    await createInquiry(reqInq, resInq);
    assert(resInq.getStatusCode() === 201, "Khách thuê gửi yêu cầu hẹn xem phòng thành công (HTTP 201)");
    const createdInquiry = resInq.getData()?.inquiry;
    createdInquiryId = createdInquiry.id;

    // Kiểm tra Chủ nhà nhận thông báo có khách hỏi thuê
    const { req: reqNotifLandlord, res: resNotifLandlord } = createMockReqRes({ userId: landlordUser.id });
    await getMyNotifications(reqNotifLandlord, resNotifLandlord);
    const landlordNotifs = resNotifLandlord.getData()?.data || [];
    const inqNotif = landlordNotifs.find((n) => n.type === "INQUIRY_RECEIVED");
    assert(inqNotif !== undefined, "Chủ nhà đã nhận quả chuông thông báo loại INQUIRY_RECEIVED");

    // 4.3 Chủ nhà duyệt lịch hẹn xem phòng
    const { req: reqConfirmInq, res: resConfirmInq } = createMockReqRes(
      { userId: landlordUser.id, roles: ["LANDLORD"] },
      { status: "CONFIRMED", notes: "Anh xác nhận lịch hẹn 17h30 mai nhé, đến nơi alo anh!" },
      { id: createdInquiryId }
    );
    await updateInquiryStatus(reqConfirmInq, resConfirmInq);
    assert(resConfirmInq.getStatusCode() === 200, "Chủ nhà xác nhận lịch hẹn xem phòng thành công");

    // Khách thuê nhận thông báo duyệt lịch
    const { req: reqNotifRenter, res: resNotifRenter } = createMockReqRes({ userId: renterUser.id });
    await getMyNotifications(reqNotifRenter, resNotifRenter);
    const renterNotifs = resNotifRenter.getData()?.data || [];
    const confirmNotif = renterNotifs.find((n) => n.type === "INQUIRY_CONFIRMED");
    assert(confirmNotif !== undefined, "Khách thuê đã nhận quả chuông thông báo duyệt lịch hẹn (INQUIRY_CONFIRMED)");

    // -------------------------------------------------------------------------
    // GIAI ĐOẠN 5: Khách thuê Đánh giá sau khi đi xem phòng (Viewing Review)
    // -------------------------------------------------------------------------
    console.log("\n⭐ GIAI ĐOẠN 5: Khách thuê viết đánh giá thực tế sau buổi xem phòng");
    
    const { req: reqReview, res: resReview } = createMockReqRes(
      { userId: renterUser.id },
      {
        landlordId: landlordUser.id,
        listingId: createdListingId,
        inquiryId: createdInquiryId,
        rating: 2, // Đánh giá thấp vì thực tế không giống ảnh
        accuracyRating: 1,
        communicationRating: 4,
        supportRating: 2,
        content: "Phòng bên ngoài rất bí và tối, không hề có ban công view đẹp như trên tin đăng. Tiền điện thực tế báo 5.000đ/kWh thay vì 3.500đ.",
        priceAccurate: false,
        amenitiesAccurate: false,
      }
    );
    await createReview(reqReview, resReview);
    assert(resReview.getStatusCode() === 201, "Gửi đánh giá trải nghiệm xem phòng thành công (HTTP 201)");
    const createdReview = resReview.getData()?.review;
    createdReviewId = createdReview.id;
    assert(createdReview.isVerifiedViewing === true, "Hệ thống xác thực huy hiệu: 'Đã xem phòng thực tế' (isVerifiedViewing = true)");

    // -------------------------------------------------------------------------
    // GIAI ĐOẠN 6: Khách thuê Tố cáo vi phạm nghiêm trọng (Listing Report)
    // -------------------------------------------------------------------------
    console.log("\n🚨 GIAI ĐOẠN 6: Khách thuê gửi tố cáo vi phạm nghiêm trọng (Trẻo đầu dê bán thịt chó)");
    
    const { req: reqReport, res: resReport } = createMockReqRes(
      { userId: renterUser.id },
      {
        listingId: createdListingId,
        reason: "MISLEADING_INFO",
        description: "Chủ nhà đăng hình căn hộ cao cấp để câu khách xem phòng, nhưng khi đến nơi thì dẫn vào căn phòng tối tăm ở tầng trệt và đòi nâng tiền điện lên 5.000đ/số.",
        evidenceUrls: [
          "https://res.cloudinary.com/demo/image/upload/sample_evidence_fake_room.jpg",
          "https://res.cloudinary.com/demo/image/upload/sample_evidence_bill.jpg",
        ],
      }
    );
    await createReport(reqReport, resReport);
    assert(resReport.getStatusCode() === 201, "Gửi báo cáo vi phạm thành công (HTTP 201)");
    const reportData = resReport.getData()?.data;
    createdReportId = reportData.id;

    // -------------------------------------------------------------------------
    // GIAI ĐOẠN 7: Admin xem xét & Xử phạt gỡ tin lập tức (HIDE_LISTING)
    // -------------------------------------------------------------------------
    console.log("\n⚖️ GIAI ĐOẠN 7: Admin kiểm tra bằng chứng & Quyết định xử phạt nặng (Gỡ tin ngay)");
    
    const adminActionNote = "Vi phạm nghiêm trọng: Quảng cáo sai sự thật, tráo đổi cấu trúc phòng và đội biểu phí điện nước so với thực tế. Áp dụng gỡ bỏ tin ngay lập tức theo Quy chế Nestrivo.";
    const { req: reqResolve, res: resResolve } = createMockReqRes(
      { userId: adminUser.id },
      {
        action: "HIDE_LISTING",
        adminNote: adminActionNote,
      },
      { id: createdReportId }
    );
    await resolveReport(reqResolve, resResolve);
    assert(resResolve.getStatusCode() === 200, "Admin xác nhận kết luận HIDE_LISTING thành công (HTTP 200)");

    // Kiểm tra trạng thái tin đăng trong Database lập tức chuyển sang HIDDEN
    const listingAfterModeration = await prisma.listing.findUnique({
      where: { id: createdListingId },
    });
    assert(listingAfterModeration.status === "HIDDEN", "Tin đăng vi phạm nặng đã BỊ GỠ LẬP TỨC KHỎI SÀN (status: HIDDEN)");

    // Kiểm tra thông báo gửi đến Chủ nhà
    const { req: reqNotifLandlord2, res: resNotifLandlord2 } = createMockReqRes({ userId: landlordUser.id });
    await getMyNotifications(reqNotifLandlord2, resNotifLandlord2);
    const landlordNotifsAfter = resNotifLandlord2.getData()?.data || [];
    const hideNotif = landlordNotifsAfter.find((n) => n.type === "ADMIN_HIDE_LISTING");
    assert(hideNotif !== undefined, "Chủ nhà nhận được thông báo quả chuông: 'ADMIN_HIDE_LISTING' thông báo lý do gỡ tin");

    // Kiểm tra thông báo phản hồi gửi đến Khách thuê
    const { req: reqNotifRenter2, res: resNotifRenter2 } = createMockReqRes({ userId: renterUser.id });
    await getMyNotifications(reqNotifRenter2, resNotifRenter2);
    const renterNotifsAfter = resNotifRenter2.getData()?.data || [];
    const reportResolvedNotif = renterNotifsAfter.find((n) => n.type === "REPORT_RESOLVED");
    assert(reportResolvedNotif !== undefined, "Khách thuê nhận được thông báo: 'REPORT_RESOLVED' ghi nhận đã xử lý gỡ tin");

    // -------------------------------------------------------------------------
    // GIAI ĐOẠN 8: Chủ nhà vào chỉnh sửa khắc phục thông tin tin đăng
    // -------------------------------------------------------------------------
    console.log("\n🛠️ GIAI ĐOẠN 8: Chủ nhà khắc phục: Chỉnh sửa lại thông số trung thực");
    
    // Đợi 50ms để mốc thời gian cập nhật mới hơn thời điểm xử phạt
    await new Promise((r) => setTimeout(r, 50));

    const { req: reqEdit, res: resEdit } = createMockReqRes(
      { userId: landlordUser.id, roles: ["LANDLORD"] },
      {
        title: "Phòng Trọ Tiện Nghi Đường Võ Oanh - Đã Chuẩn Hóa Thông Tin Thực Tế",
        description: "Phòng thực tế tầng trệt, có cửa sổ giếng trời thông thoáng, giá điện đúng chuẩn nhà nước 3.500đ/kWh, nước 100.000đ/người.",
        propertyType: "STUDIO",
        price: 4000000, // Điều chỉnh giảm giá đúng thực tế
        deposit: 4000000,
        area: 28,
        bedrooms: 1,
        bathrooms: 1,
        maxOccupants: 2,
        address: "78 Võ Oanh",
        district: "Bình Thạnh",
        city: "Hồ Chí Minh",
        fees: [
          { type: "ELECTRICITY", name: "Tiền điện sinh hoạt", amount: 3500, unit: "PER_KWH" },
          { type: "WATER", name: "Tiền nước máy", amount: 100000, unit: "PER_PERSON" },
        ],
      },
      { id: createdListingId }
    );
    await updateListing(reqEdit, resEdit);
    assert(resEdit.getStatusCode() === 200, "Chủ nhà cập nhật thông tin chỉnh sửa thành công (HTTP 200)", resEdit.getData());

    // Kiểm tra Database: Tin đăng đã nhận thông số mới và updatedAt được làm mới
    const rectifiedListing = await prisma.listing.findUnique({
      where: { id: createdListingId },
    });
    assert(Number(rectifiedListing.price) === 4000000, "Giá phòng đã được cập nhật chính xác (4.000.000đ)");
    assert(
      rectifiedListing.title.includes("Đã Chuẩn Hóa Thông Tin"),
      "Tiêu đề và nội dung mới đã được lưu thành công vào Database"
    );
    assert(
      new Date(rectifiedListing.updatedAt).getTime() > new Date(listingAfterModeration.updatedAt).getTime(),
      "Thời điểm updatedAt đã được cập nhật mới hơn mốc xử phạt"
    );

  } finally {
    // -------------------------------------------------------------------------
    // DỌN DẸP DỮ LIỆU THỬ NGHIỆM (CLEANUP)
    // -------------------------------------------------------------------------
    console.log("\n🧹 Dọn dẹp dữ liệu thử nghiệm...");
    
    if (createdListingId) {
      await prisma.auditLog.deleteMany({
        where: {
          OR: [
            { entityId: createdListingId },
            { entityId: createdReportId ? createdReportId : undefined },
          ],
        },
      }).catch(() => {});

      await prisma.landlordReview.deleteMany({
        where: { listingId: createdListingId },
      }).catch(() => {});

      await prisma.report.deleteMany({
        where: { listingId: createdListingId },
      }).catch(() => {});

      await prisma.listingPromotion.deleteMany({
        where: { listingId: createdListingId },
      }).catch(() => {});

      await prisma.promotionPayment.deleteMany({
        where: { order: { listingId: createdListingId } },
      }).catch(() => {});

      await prisma.promotionOrder.deleteMany({
        where: { listingId: createdListingId },
      }).catch(() => {});

      await prisma.inquiry.deleteMany({
        where: { listingId: createdListingId },
      }).catch(() => {});

      await prisma.listingFee.deleteMany({
        where: { listingId: createdListingId },
      }).catch(() => {});

      await prisma.listingImage.deleteMany({
        where: { listingId: createdListingId },
      }).catch(() => {});

      await prisma.listingAmenity.deleteMany({
        where: { listingId: createdListingId },
      }).catch(() => {});

      await prisma.listing.delete({
        where: { id: createdListingId },
      }).catch(() => {});
    }

    const testUserIds = [landlordUser?.id, renterUser?.id].filter(Boolean);
    if (testUserIds.length > 0) {
      await prisma.notification.deleteMany({
        where: { userId: { in: testUserIds } },
      }).catch(() => {});

      await prisma.verificationHistory.deleteMany({
        where: { request: { landlordId: { in: testUserIds } } },
      }).catch(() => {});

      await prisma.verificationDocument.deleteMany({
        where: { request: { landlordId: { in: testUserIds } } },
      }).catch(() => {});

      await prisma.verificationRequest.deleteMany({
        where: { landlordId: { in: testUserIds } },
      }).catch(() => {});

      await prisma.landlordProfile.deleteMany({
        where: { userId: { in: testUserIds } },
      }).catch(() => {});

      await prisma.user.deleteMany({
        where: { id: { in: testUserIds } },
      }).catch(() => {});
    }

    console.log("  -> Đã dọn dẹp sạch sẽ toàn bộ bản ghi test trong Database.");
  }

  console.log("\n================================================================================");
  console.log(`🎉 TỔNG KẾT: ${passedTests}/${totalTests} BƯỚC KIỂM THỬ THÀNH CÔNG RỰC RỠ (100% PASS)`);
  console.log("================================================================================\n");
}

runFullLifecycleTest().catch((err) => {
  console.error("\n❌ LỖI TRONG QUÁ TRÌNH KIỂM THỬ:", err);
  process.exit(1);
});
