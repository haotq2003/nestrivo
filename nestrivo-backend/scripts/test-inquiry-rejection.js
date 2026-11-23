import "dotenv/config";
import { prisma } from "../src/lib/prisma.js";
import {
  createInquiry,
  updateInquiryStatus,
  getLandlordInquiries,
  getRenterInquiries,
} from "../src/controller/inquiry.controller.js";

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

async function runRejectionTests() {
  console.log("================================================================================");
  console.log("🚫 BẮT ĐẦU KIỂM THỬ: TÍNH NĂNG CHỦ NHÀ TỪ CHỐI HẸN KÈM LÝ DO CỤ THỂ");
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

  // 1. Tạo User & Listing
  console.log("📦 Khởi tạo dữ liệu mẫu (Landlord, Renter, Listing)...");
  const landlord = await prisma.user.create({
    data: {
      email: `landlord_rej_${Date.now()}@test.vn`,
      passwordHash: "hash123",
      fullName: "Chủ nhà Anh Tuấn",
      roles: ["LANDLORD", "RENTER"],
    },
  });

  const renter = await prisma.user.create({
    data: {
      email: `renter_rej_${Date.now()}@test.vn`,
      passwordHash: "hash123",
      fullName: "Khách thuê Hoàng Oanh",
      roles: ["RENTER"],
    },
  });

  const listing = await prisma.listing.create({
    data: {
      landlordId: landlord.id,
      title: "Căn hộ Duplex Ban Công Thoáng Mát",
      description: "Phòng full nội thất",
      propertyType: "STUDIO",
      status: "PUBLISHED",
      price: 5200000,
      deposit: 5200000,
      area: 35,
      address: "45/2 Điện Biên Phủ",
      district: "Bình Thạnh",
      city: "Hồ Chí Minh",
    },
  });

  try {
    // -------------------------------------------------------------------------
    // TEST 1: Khách gửi hỏi thuê
    // -------------------------------------------------------------------------
    console.log("🧪 TEST 1: Khách gửi yêu cầu hẹn xem phòng");
    const { req: reqInq, res: resInq } = createMockReqRes(
      { userId: renter.id, fullName: renter.fullName },
      { listingId: listing.id, message: "Em muốn qua xem phòng lúc 18h tối nay được không ạ?" }
    );
    await createInquiry(reqInq, resInq);
    assert(resInq.getStatusCode() === 201, "Gửi yêu cầu hẹn xem phòng thành công");
    const inquiryId = resInq.getData()?.inquiry?.id;

    // -------------------------------------------------------------------------
    // TEST 2: Chủ nhà từ chối hẹn kèm lý do preset
    // -------------------------------------------------------------------------
    console.log("\n🧪 TEST 2: Chủ nhà từ chối hẹn kèm lý do: 'Phòng đã có khách cọc / đã cho thuê'");
    const rejectionReasonText = "Phòng đã có khách cọc / đã cho thuê. Ghi chú: Có bạn cọc sáng nay rồi ạ, hẹn bạn phòng khác nhé!";
    const { req: reqRej, res: resRej } = createMockReqRes(
      { userId: landlord.id, roles: ["LANDLORD"] },
      { status: "REJECTED", rejectionReason: rejectionReasonText },
      { id: inquiryId }
    );
    await updateInquiryStatus(reqRej, resRej);
    assert(resRej.getStatusCode() === 200, "API cập nhật trạng thái REJECTED thành công");

    // Kiểm tra Database
    const savedInquiry = await prisma.inquiry.findUnique({
      where: { id: inquiryId },
    });
    assert(savedInquiry.status === "REJECTED", "Trạng thái trong DB là REJECTED");
    assert(savedInquiry.rejectionReason === rejectionReasonText, "Lý do từ chối đã được lưu chính xác vào DB");

    // -------------------------------------------------------------------------
    // TEST 3: Kiểm tra thông báo gửi đến Khách thuê
    // -------------------------------------------------------------------------
    console.log("\n🧪 TEST 3: Kiểm tra quả chuông thông báo gửi đến Khách thuê");
    const renterNotif = await prisma.notification.findFirst({
      where: { userId: renter.id, type: "INQUIRY_REJECTED" },
    });
    assert(renterNotif !== null, "Khách thuê nhận được thông báo loại INQUIRY_REJECTED");
    assert(
      renterNotif?.message?.includes("Phòng đã có khách cọc"),
      "Nội dung thông báo hiển thị đúng lý do chủ nhà đã chọn"
    );

    // -------------------------------------------------------------------------
    // TEST 4: API Lấy danh sách hỏi thuê của Chủ nhà trả về rejectionReason
    // -------------------------------------------------------------------------
    console.log("\n🧪 TEST 4: API GET /api/inquiries/landlord đồng bộ dữ liệu rejectionReason");
    const { req: reqLandlordInq, res: resLandlordInq } = createMockReqRes(
      { userId: landlord.id },
      {},
      {},
      { status: "ALL" }
    );
    await getLandlordInquiries(reqLandlordInq, resLandlordInq);
    const landlordList = resLandlordInq.getData()?.data || [];
    const rejItem = landlordList.find((i) => i.id === inquiryId);
    assert(
      rejItem?.rejectionReason === rejectionReasonText,
      "Dữ liệu trả về cho Chủ nhà chứa đầy đủ rejectionReason"
    );

    // -------------------------------------------------------------------------
    // TEST 5: Khi Chủ nhà mở lại yêu cầu (PENDING) -> rejectionReason được dọn sạch
    // -------------------------------------------------------------------------
    console.log("\n🧪 TEST 5: Mở lại yêu cầu (PENDING) -> Tự động xóa rejectionReason cũ");
    const { req: reqReopen, res: resReopen } = createMockReqRes(
      { userId: landlord.id, roles: ["LANDLORD"] },
      { status: "PENDING" },
      { id: inquiryId }
    );
    await updateInquiryStatus(reqReopen, resReopen);
    const reopenedInquiry = await prisma.inquiry.findUnique({ where: { id: inquiryId } });
    assert(reopenedInquiry.status === "PENDING", "Trạng thái đã chuyển về PENDING");
    assert(reopenedInquiry.rejectionReason === null, "Lý do từ chối cũ đã được reset về null");

  } finally {
    console.log("\n🧹 Dọn dẹp dữ liệu thử nghiệm...");
    await prisma.notification.deleteMany({
      where: { userId: { in: [landlord.id, renter.id] } },
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
  console.log(`🏁 KẾT QUẢ KIỂM THỬ: ${passedTests}/${totalTests} TESTS PASSED (100% THÀNH CÔNG)`);
  console.log("================================================================================\n");
}

runRejectionTests().catch((err) => {
  console.error("Lỗi kịch bản kiểm thử:", err);
  process.exit(1);
});
