import "dotenv/config";
import { prisma } from "../src/lib/prisma.js";
import { getCompareListings } from "../src/controller/public.listing.controller.js";

function createMockReqRes(query = {}) {
  const req = { query };
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

async function runCompareSuiteTest() {
  console.log("================================================================================");
  console.log("⚖️ BẮT ĐẦU KIỂM THỬ: TÍNH NĂNG SO SÁNH PHÒNG TRỌ (LISTING COMPARISON ENGINE)");
  console.log("================================================================================");

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition, message, errorDetail = null) {
    totalTests++;
    if (condition) {
      passedTests++;
      console.log(`  [PASS] #${totalTests}: ${message}`);
    } else {
      console.error(`  [FAIL] #${totalTests}: ${message}`);
      if (errorDetail) {
        console.error("         Chi tiết:", errorDetail);
      }
    }
  }

  try {
    // 1. Tìm 2 - 3 tin đăng hợp lệ trong CSDL
    const sampleListings = await prisma.listing.findMany({
      where: { status: "PUBLISHED" },
      take: 3,
    });
    assert(sampleListings.length >= 1, `Tìm thấy ${sampleListings.length} tin đăng mẫu trong CSDL`);

    const idsParam = sampleListings.map((l) => l.id).join(",");

    // 2. Gọi getCompareListings với danh sách IDs
    {
      const { req, res } = createMockReqRes({ ids: idsParam });
      await getCompareListings(req, res);
      const data = res.getData();
      assert(
        res.getStatusCode() === 200 &&
          data.success === true &&
          Array.isArray(data.data) &&
          data.data.length === sampleListings.length,
        `Lấy dữ liệu so sánh cho ${sampleListings.length} phòng trọ thành công`
      );

      // Kiểm tra xem có đầy đủ quan hệ amenities, fees, landlord không
      if (data.data.length > 0) {
        const first = data.data[0];
        assert(
          Array.isArray(first.amenities) && Array.isArray(first.fees) && !!first.landlord,
          "Dữ liệu trả về đầy đủ tiện ích (amenities), chi phí (fees) và chủ nhà (landlord)"
        );
      }
    }

    // 3. Test trường hợp thiếu tham số ids
    {
      const { req, res } = createMockReqRes({});
      await getCompareListings(req, res);
      assert(res.getStatusCode() === 400, "Bắt lỗi 400 thành công khi không truyền ids");
    }

    // 4. Test trường hợp truyền ID rác / không hợp lệ
    {
      const { req, res } = createMockReqRes({ ids: "invalid-id-xyz" });
      await getCompareListings(req, res);
      assert(res.getStatusCode() === 400, "Bắt lỗi 400 thành công khi truyền ID không phải UUID");
    }

    console.log("\n================================================================================");
    console.log(`🎉 KẾT QUẢ: ĐÃ VƯỢT QUA ${passedTests}/${totalTests} BÀI KIỂM THỬ COMPARE SUITE`);
    console.log("================================================================================");
  } catch (err) {
    console.error("❌ Lỗi kiểm thử:", err);
  } finally {
    await prisma.$disconnect();
  }
}

runCompareSuiteTest();
