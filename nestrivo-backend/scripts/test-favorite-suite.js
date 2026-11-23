import "dotenv/config";
import { prisma } from "../src/lib/prisma.js";
import {
  toggleFavorite,
  getMyFavorites,
  getMyFavoriteIds,
  clearAllFavorites,
} from "../src/controller/favorite.controller.js";

function createMockReqRes(params = {}, body = {}, user = null) {
  const req = { params, body, user };
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

async function runFavoriteSuiteTest() {
  console.log("================================================================================");
  console.log("💖 BẮT ĐẦU KIỂM THỬ: TÍNH NĂNG LƯU TIN YÊU THÍCH (FAVORITES SUITE)");
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
    // Tìm 1 user để test (ưu tiên RENTER)
    let testUser = await prisma.user.findFirst({
      where: { roles: { has: "RENTER" } },
    });
    if (!testUser) {
      testUser = await prisma.user.findFirst();
    }
    assert(!!testUser, "Tìm thấy user kiểm thử trong CSDL: " + testUser?.email);

    // Tìm 1 tin đăng hợp lệ (PUBLISHED)
    const testListing = await prisma.listing.findFirst({
      where: { status: "PUBLISHED" },
    });
    assert(!!testListing, "Tìm thấy tin đăng PUBLISHED trong CSDL: " + testListing?.title);

    const userCtx = { userId: testUser.id, role: testUser.role };

    // Bước 1: Clear sạch favorite trước khi test
    {
      const { req, res } = createMockReqRes({}, {}, userCtx);
      await clearAllFavorites(req, res);
      assert(res.getStatusCode() === 200, "Xóa sạch danh sách yêu thích ban đầu thành công");
    }

    // Bước 2: Kiểm tra getMyFavoriteIds rỗng
    {
      const { req, res } = createMockReqRes({}, {}, userCtx);
      await getMyFavoriteIds(req, res);
      const data = res.getData();
      assert(
        res.getStatusCode() === 200 && Array.isArray(data.favoriteIds) && !data.favoriteIds.includes(testListing.id),
        "getMyFavoriteIds trả về danh sách không chứa tin đăng test"
      );
    }

    // Bước 3: Toggle lần 1 -> Đã lưu (isFavorited: true)
    {
      const { req, res } = createMockReqRes({ listingId: testListing.id }, {}, userCtx);
      await toggleFavorite(req, res);
      const data = res.getData();
      assert(
        res.getStatusCode() === 200 && data.success === true && data.isFavorited === true,
        "Toggle lưu tin lần 1 thành công (isFavorited = true)"
      );
    }

    // Bước 4: Kiểm tra getMyFavoriteIds phải chứa testListing.id
    {
      const { req, res } = createMockReqRes({}, {}, userCtx);
      await getMyFavoriteIds(req, res);
      const data = res.getData();
      assert(
        data.favoriteIds.includes(testListing.id),
        "getMyFavoriteIds chứa đúng listingId vừa lưu"
      );
    }

    // Bước 5: Kiểm tra getMyFavorites trả về thông tin chi tiết listing
    {
      const { req, res } = createMockReqRes({}, {}, userCtx);
      await getMyFavorites(req, res);
      const data = res.getData();
      assert(
        data.success === true &&
        Array.isArray(data.data) &&
        data.data.some((l) => l.id === testListing.id && l.isFavorited === true),
        "getMyFavorites trả về listing chi tiết kèm cờ isFavorited: true"
      );
    }

    // Bước 6: Toggle lần 2 -> Bỏ lưu (isFavorited: false)
    {
      const { req, res } = createMockReqRes({ listingId: testListing.id }, {}, userCtx);
      await toggleFavorite(req, res);
      const data = res.getData();
      assert(
        res.getStatusCode() === 200 && data.success === true && data.isFavorited === false,
        "Toggle tin lần 2 thành công (isFavorited = false - Bỏ lưu)"
      );
    }

    // Bước 7: Kiểm tra getMyFavoriteIds sau khi bỏ lưu
    {
      const { req, res } = createMockReqRes({}, {}, userCtx);
      await getMyFavoriteIds(req, res);
      const data = res.getData();
      assert(
        !data.favoriteIds.includes(testListing.id),
        "getMyFavoriteIds không còn chứa listingId sau khi bỏ lưu"
      );
    }

    // Bước 8: Test bắt lỗi listingId không tồn tại
    {
      const { req, res } = createMockReqRes({ listingId: "00000000-0000-0000-0000-000000000000" }, {}, userCtx);
      await toggleFavorite(req, res);
      assert(
        res.getStatusCode() === 404,
        "Trả về HTTP 404 khi listingId không tồn tại"
      );
    }

    console.log("\n================================================================================");
    console.log(`🎉 KẾT QUẢ: ĐÃ VƯỢT QUA ${passedTests}/${totalTests} BÀI KIỂM THỬ FAVORITES SUITE`);
    console.log("================================================================================");
  } catch (err) {
    console.error("❌ Lỗi kiểm thử:", err);
  } finally {
    await prisma.$disconnect();
  }
}

runFavoriteSuiteTest();
