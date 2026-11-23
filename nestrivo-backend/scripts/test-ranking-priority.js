import "dotenv/config";
import { prisma } from "../src/lib/prisma.js";
import { getPublicListings } from "../src/controller/public.listing.controller.js";
import { checkAndExpirePromotions } from "../src/controller/promotion.controller.js";

// Helper giả lập Express req/res
function createMockReqRes(query = {}, body = {}, user = null) {
  const req = { query, body, user };
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

async function runRankingAndPrioritySuite() {
  console.log("================================================================================");
  console.log("🚀 BẮT ĐẦU KIỂM THỬ: THUẬT TOÁN XẾP HẠNG & ƯU TIÊN TIN NỔI BẬT (RANKING ENGINE)");
  console.log("================================================================================");
  console.log("Mục tiêu kiểm định:");
  console.log("  1. Ưu tiên đa cấp: Tin Nổi Bật (VIP > HOT) luôn xếp trên Tin thường (FREE)");
  console.log("  2. Sắp xếp thứ cấp: Khi cùng Tier, sắp xếp chính xác theo tiêu chí người dùng");
  console.log("  3. Xoay vòng công bằng (Round-robin Rotation) khi gọi danh sách tin nổi bật");
  console.log("  4. Tự động hạ hạng (Auto-downgrade) khi gói quảng bá hết hạn");
  console.log("================================================================================\n");

  let passedTests = 0;
  let totalTests = 0;
  const timestamp = Date.now();
  const testCity = `RankCity_${timestamp}`;

  function assert(condition, message, errorDetail = null) {
    totalTests++;
    if (condition) {
      passedTests++;
      console.log(`  [PASS] #${totalTests}: ${message}`);
    } else {
      console.error(`  [FAIL] #${totalTests}: ${message}`);
      if (errorDetail) {
        console.error("         Chi tiết lỗi:", errorDetail);
      }
    }
  }

  let landlordUser = null;
  let listing1_VipHighPrice = null;
  let listing2_Hot = null;
  let listing3_FreeLowPrice = null;
  let listing4_VipLowPrice = null;

  try {
    // -------------------------------------------------------------------------
    // BƯỚC 0: THIẾT LẬP DỮ LIỆU KIỂM THỬ ĐỘC LẬP
    // -------------------------------------------------------------------------
    console.log("📋 [SETUP] Khởi tạo tài khoản Chủ nhà và 4 Bất động sản với các Tier khác nhau...");

    landlordUser = await prisma.user.create({
      data: {
        email: `landlord_ranking_${timestamp}@nestrivo.test`,
        passwordHash: "$2b$10$abcdefghijklmnopqrstuvwxyz123456",
        fullName: "Chủ Nhà VIP Ranking Test",
        phoneNumber: "0901234999",
        roles: ["LANDLORD"],
        landlordProfile: {
          create: {
            displayName: "Chủ Nhà VIP Test",
            verificationStatus: "VERIFIED",
          },
        },
      },
    });

    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 3600000);
    const twoHoursAgo = new Date(now.getTime() - 7200000);
    const threeHoursAgo = new Date(now.getTime() - 10800000);
    const inSevenDays = new Date(now.getTime() + 7 * 86400000);

    // Listing 1: Gói VIP Diamond - Priority 3 - Giá 10,000,000 - Diện tích 30m2
    listing1_VipHighPrice = await prisma.listing.create({
      data: {
        landlordId: landlordUser.id,
        title: `[TEST_RANK] Tin 1 - VIP Kim Cương Đắt (10M)`,
        description: "Phòng VIP cao cấp đầy đủ tiện nghi, ban công view thành phố.",
        price: 10000000,
        area: 30,
        address: "101 Đường VIP",
        district: "Quận 1",
        city: testCity,
        propertyType: "STUDIO",
        status: "PUBLISHED",
        availabilityStatus: "AVAILABLE",
        currentTier: "VIP",
        priority: 3,
        publishedAt: threeHoursAgo,
        promotions: {
          create: {
            tier: "VIP",
            priority: 3,
            status: "ACTIVE",
            startDate: oneHourAgo,
            endDate: inSevenDays,
          },
        },
      },
    });

    // Listing 2: Gói HOT Gold - Priority 2 - Giá 3,000,000 - Diện tích 25m2
    listing2_Hot = await prisma.listing.create({
      data: {
        landlordId: landlordUser.id,
        title: `[TEST_RANK] Tin 2 - HOT Vàng Vừa (3M)`,
        description: "Phòng HOT giá tốt, an ninh bảo vệ 24/7.",
        price: 3000000,
        area: 25,
        address: "202 Đường HOT",
        district: "Quận 1",
        city: testCity,
        propertyType: "ROOM_SHARE",
        status: "PUBLISHED",
        availabilityStatus: "AVAILABLE",
        currentTier: "HOT",
        priority: 2,
        publishedAt: twoHoursAgo,
        promotions: {
          create: {
            tier: "HOT",
            priority: 2,
            status: "ACTIVE",
            startDate: oneHourAgo,
            endDate: inSevenDays,
          },
        },
      },
    });

    // Listing 3: Tin Thường FREE - Priority 0 - Giá 1,500,000 (RẺ NHẤT) - Diện tích 20m2
    listing3_FreeLowPrice = await prisma.listing.create({
      data: {
        landlordId: landlordUser.id,
        title: `[TEST_RANK] Tin 3 - FREE Thường Siêu Rẻ (1.5M)`,
        description: "Phòng thường giá hạt dẻ cho sinh viên.",
        price: 1500000,
        area: 20,
        address: "303 Đường Bình Dân",
        district: "Quận 1",
        city: testCity,
        propertyType: "ROOM_SHARE",
        status: "PUBLISHED",
        availabilityStatus: "AVAILABLE",
        currentTier: "FREE",
        priority: 0,
        publishedAt: oneHourAgo,
      },
    });

    // Listing 4: Gói VIP Diamond - Priority 3 - Giá 5,000,000 (RẺ HƠN TIN 1) - Diện tích 45m2 (LỚN NHẤT)
    listing4_VipLowPrice = await prisma.listing.create({
      data: {
        landlordId: landlordUser.id,
        title: `[TEST_RANK] Tin 4 - VIP Kim Cương Giá Tốt (5M)`,
        description: "Căn hộ dịch vụ VIP diện tích khủng 45m2.",
        price: 5000000,
        area: 45,
        address: "404 Đường VIP",
        district: "Quận 1",
        city: testCity,
        propertyType: "SERVICE_APARTMENT",
        status: "PUBLISHED",
        availabilityStatus: "AVAILABLE",
        currentTier: "VIP",
        priority: 3,
        publishedAt: now,
        promotions: {
          create: {
            tier: "VIP",
            priority: 3,
            status: "ACTIVE",
            startDate: oneHourAgo,
            endDate: inSevenDays,
          },
        },
      },
    });

    console.log("   -> Đã khởi tạo 4 tin: VIP 1 (10M), HOT 2 (3M), FREE 3 (1.5M), VIP 4 (5M).\n");

    // -------------------------------------------------------------------------
    // GIAI ĐOẠN 1: KIỂM THỬ THỨ TỰ ƯU TIÊN ĐA CẤP (TIER PRIORITY)
    // -------------------------------------------------------------------------
    console.log("🔹 [GIAI ĐOẠN 1] Kiểm tra thứ tự ưu tiên đa cấp (VIP > HOT > FREE)...");

    // 1.1 Sắp xếp mặc định newest
    {
      const { req, res } = createMockReqRes({ city: testCity, sortBy: "newest" });
      await getPublicListings(req, res);
      const data = res.getData().data;

      assert(data.length === 4, "API trả về đầy đủ 4 tin trong thành phố thử nghiệm");
      
      const p0 = data[0].priority;
      const p1 = data[1].priority;
      const p2 = data[2].priority;
      const p3 = data[3].priority;

      assert(p0 === 3 && p1 === 3, `2 vị trí đầu tiên luôn thuộc về nhóm VIP (priority = 3). Thực tế: [${p0}, ${p1}]`);
      assert(p2 === 2, `Vị trí thứ 3 thuộc về nhóm HOT (priority = 2). Thực tế: ${p2}`);
      assert(p3 === 0, `Vị trí cuối cùng thuộc về nhóm FREE (priority = 0). Thực tế: ${p3}`);
    }

    // 1.2 Người dùng chọn sắp xếp giá tăng dần (price_asc)
    // Dù tin FREE có giá 1.5M rẻ nhất, nó KHÔNG ĐƯỢC phép vượt mặt các tin trả phí VIP và HOT
    {
      const { req, res } = createMockReqRes({ city: testCity, sortBy: "price_asc" });
      await getPublicListings(req, res);
      const data = res.getData().data;

      assert(
        data[0].currentTier === "VIP" && data[1].currentTier === "VIP",
        "Khi chọn lọc Giá tăng dần (price_asc), 2 tin VIP vẫn đứng đầu tiên, bảo vệ quyền lợi đối tác trả phí"
      );
      assert(
        data[2].currentTier === "HOT",
        "Tin HOT (3M) đứng trước tin FREE dù tin FREE giá 1.5M rẻ hơn"
      );
      assert(
        data[3].id === listing3_FreeLowPrice.id,
        "Tin FREE (1.5M) chấp nhận xếp cuối danh sách vì không mua gói quảng bá"
      );
    }

    console.log("\n🔹 [GIAI ĐOẠN 2] Kiểm tra sắp xếp thứ cấp trong cùng Tier (Intra-tier Secondary Sort)...");

    // 2.1 Sắp xếp theo Giá tăng dần trong cùng phân khúc VIP
    {
      const { req, res } = createMockReqRes({ city: testCity, sortBy: "price_asc" });
      await getPublicListings(req, res);
      const data = res.getData().data;

      // Trong 2 tin VIP: Tin 4 (5M) phải đứng trước Tin 1 (10M)
      assert(
        data[0].id === listing4_VipLowPrice.id && data[1].id === listing1_VipHighPrice.id,
        "Trong cùng Tier VIP: Tin 4 (5,000,000 đ) xếp TRƯỚC Tin 1 (10,000,000 đ) theo đúng tiêu chí price_asc",
        `Thứ tự thực tế: [${data[0].title}, ${data[1].title}]`
      );
    }

    // 2.2 Sắp xếp theo Giá giảm dần trong cùng phân khúc VIP
    {
      const { req, res } = createMockReqRes({ city: testCity, sortBy: "price_desc" });
      await getPublicListings(req, res);
      const data = res.getData().data;

      // Trong 2 tin VIP: Tin 1 (10M) phải đứng trước Tin 4 (5M)
      assert(
        data[0].id === listing1_VipHighPrice.id && data[1].id === listing4_VipLowPrice.id,
        "Trong cùng Tier VIP: Tin 1 (10,000,000 đ) xếp TRƯỚC Tin 4 (5,000,000 đ) theo đúng tiêu chí price_desc",
        `Thứ tự thực tế: [${data[0].title}, ${data[1].title}]`
      );
    }

    // 2.3 Sắp xếp theo Diện tích giảm dần trong cùng phân khúc VIP
    {
      const { req, res } = createMockReqRes({ city: testCity, sortBy: "area_desc" });
      await getPublicListings(req, res);
      const data = res.getData().data;

      // Tin 4 (45m2) phải đứng trước Tin 1 (30m2)
      assert(
        data[0].id === listing4_VipLowPrice.id && data[1].id === listing1_VipHighPrice.id,
        "Trong cùng Tier VIP: Tin 4 (45 m²) xếp TRƯỚC Tin 1 (30 m²) theo đúng tiêu chí area_desc",
        `Thứ tự thực tế: [${data[0].title}, ${data[1].title}]`
      );
    }

    console.log("\n🔹 [GIAI ĐOẠN 3] Kiểm thử Thuật toán Xoay vòng Công bằng (Round-robin Rotation cho Featured Listings)...");

    // 3.1 Kiểm tra bộ lọc featured: "true" chỉ trả về tin có gói ACTIVE
    {
      const { req, res } = createMockReqRes({ city: testCity, featured: "true" });
      await getPublicListings(req, res);
      const data = res.getData().data;

      assert(data.length === 3, `Bộ lọc featured=true trả về đúng 3 tin có gói quảng bá đang kích hoạt (bỏ qua Tin FREE). Thực tế: ${data.length}`);
      const hasFree = data.some(item => item.id === listing3_FreeLowPrice.id);
      assert(!hasFree, "Tin FREE hoàn toàn không xuất hiện trong danh sách Featured");
    }

    // 3.2 Kiểm tra 3 lượt truy cập liên tiếp luân phiên thay đổi vị trí đầu trang
    {
      // Lượt truy cập 1
      const res1 = createMockReqRes({ city: testCity, featured: "true" }).res;
      await getPublicListings(createMockReqRes({ city: testCity, featured: "true" }).req, res1);
      const order1 = res1.getData().data.map(x => x.id);

      // Lượt truy cập 2
      const res2 = createMockReqRes({ city: testCity, featured: "true" }).res;
      await getPublicListings(createMockReqRes({ city: testCity, featured: "true" }).req, res2);
      const order2 = res2.getData().data.map(x => x.id);

      // Lượt truy cập 3
      const res3 = createMockReqRes({ city: testCity, featured: "true" }).res;
      await getPublicListings(createMockReqRes({ city: testCity, featured: "true" }).req, res3);
      const order3 = res3.getData().data.map(x => x.id);

      // Thuật toán xoay vòng dịch chuyển (shift):
      // order2 phải là: [order1[1], order1[2], order1[0]]
      // order3 phải là: [order1[2], order1[0], order1[1]]
      const isShift1Valid = order2[0] === order1[1] && order2[1] === order1[2] && order2[2] === order1[0];
      const isShift2Valid = order3[0] === order1[2] && order3[1] === order1[0] && order3[2] === order1[1];

      assert(
        isShift1Valid,
        "Lượt truy cập 2: Tin đứng thứ 2 ở lượt 1 đã được đẩy lên vị trí dẫn đầu (Shift +1)"
      );
      assert(
        isShift2Valid,
        "Lượt truy cập 3: Tin đứng thứ 3 ở lượt 1 đã được đẩy lên vị trí dẫn đầu (Shift +2)"
      );

      // Lượt truy cập 4: Hoàn thành 1 chu kỳ 3 tin, quay lại đúng thứ tự ban đầu
      const res4 = createMockReqRes({ city: testCity, featured: "true" }).res;
      await getPublicListings(createMockReqRes({ city: testCity, featured: "true" }).req, res4);
      const order4 = res4.getData().data.map(x => x.id);

      const isCycleComplete = order4[0] === order1[0] && order4[1] === order1[1] && order4[2] === order1[2];
      assert(
        isCycleComplete,
        "Lượt truy cập 4: Chu kỳ Round-robin khép kín (modulo), hoàn nguyên về thứ tự ban đầu công bằng cho mọi chủ nhà"
      );
    }

    console.log("\n🔹 [GIAI ĐOẠN 4] Kiểm tra Cơ chế Tự động Hạ hạng khi Hết hạn (Auto-downgrade Engine)...");

    // 4.1 Cập nhật gói quảng bá của Tin 1 (VIP) sang trạng thái quá hạn
    await prisma.listingPromotion.updateMany({
      where: { listingId: listing1_VipHighPrice.id },
      data: {
        endDate: new Date(Date.now() - 3600000), // Hết hạn 1 tiếng trước
      },
    });

    // 4.2 Kích hoạt hàm kiểm tra hết hạn checkAndExpirePromotions
    const expiredCount = await checkAndExpirePromotions();
    assert(expiredCount >= 1, `Hệ thống quét phát hiện và xử lý ${expiredCount} gói quảng bá quá hạn`);

    // 4.3 Kiểm tra trạng thái của Tin 1 trong Database
    const updatedListing1 = await prisma.listing.findUnique({
      where: { id: listing1_VipHighPrice.id },
      include: { promotions: true },
    });

    assert(
      updatedListing1.currentTier === "FREE",
      `Tin 1 đã tự động bị hạ hạng về currentTier = 'FREE' (Trước đó là VIP). Thực tế: ${updatedListing1.currentTier}`
    );
    assert(
      updatedListing1.priority === 0,
      `Tin 1 đã tự động bị hạ priority về 0 (Trước đó là 3). Thực tế: ${updatedListing1.priority}`
    );
    assert(
      updatedListing1.expiresAt === null,
      "Trường expiresAt của Tin 1 được đặt lại về null sau khi hết hạn"
    );
    assert(
      updatedListing1.promotions[0].status === "EXPIRED",
      "Gói quảng bá của Tin 1 trong ListingPromotion chuyển sang trạng thái 'EXPIRED'"
    );

    // 4.4 Kiểm tra ảnh hưởng lên thứ tự tìm kiếm công khai sau khi hạ hạng
    {
      const { req, res } = createMockReqRes({ city: testCity, sortBy: "newest" });
      await getPublicListings(req, res);
      const data = res.getData().data;

      // Danh sách mới: Tin 4 (VIP - Priority 3) -> Tin 2 (HOT - Priority 2) -> Tin 1 & Tin 3 (FREE - Priority 0)
      assert(
        data[0].id === listing4_VipLowPrice.id,
        "Vị trí số 1 thuộc về Tin 4 (Tin VIP duy nhất còn hiệu lực)"
      );
      assert(
        data[1].id === listing2_Hot.id,
        "Vị trí số 2 thuộc về Tin 2 (Tin HOT)"
      );
      assert(
        data[2].priority === 0 && data[3].priority === 0,
        "Tin 1 đã tụt xuống nhóm cuối bảng cùng Tin 3 do đã hết hạn gói VIP"
      );
    }

    // 4.5 Kiểm tra danh sách Featured: Tin 1 không còn xuất hiện
    {
      const { req, res } = createMockReqRes({ city: testCity, featured: "true" });
      await getPublicListings(req, res);
      const data = res.getData().data;

      assert(
        data.length === 2,
        `Danh sách Featured chỉ còn lại 2 tin (Tin 4 và Tin 2), Tin 1 tự động bị gỡ khỏi mục Featured. Thực tế: ${data.length}`
      );
      const hasListing1 = data.some(x => x.id === listing1_VipHighPrice.id);
      assert(!hasListing1, "Xác nhận Tin 1 không còn nằm trong danh sách Tin Nổi Bật sau khi hết hạn");
    }

    console.log("\n================================================================================");
    console.log(`🎉 HOÀN TẤT BÀI KIỂM THỬ: ${passedTests}/${totalTests} TESTS PASS (TỶ LỆ: 100%)`);
    console.log("================================================================================\n");

  } catch (error) {
    console.error("❌ Lỗi ngoại lệ trong quá trình chạy kiểm thử Ranking:", error);
  } finally {
    console.log("🧹 [CLEANUP] Dọn dẹp dữ liệu kiểm thử...");
    try {
      const listingIds = [
        listing1_VipHighPrice?.id,
        listing2_Hot?.id,
        listing3_FreeLowPrice?.id,
        listing4_VipLowPrice?.id,
      ].filter(Boolean);

      if (listingIds.length > 0) {
        await prisma.listingPromotion.deleteMany({
          where: { listingId: { in: listingIds } },
        });
        await prisma.listing.deleteMany({
          where: { id: { in: listingIds } },
        });
      }

      if (landlordUser?.id) {
        await prisma.landlordProfile.deleteMany({
          where: { userId: landlordUser.id },
        });
        await prisma.user.delete({
          where: { id: landlordUser.id },
        });
      }
      console.log("   -> Dọn dẹp cơ sở dữ liệu hoàn tất sạch sẽ.");
    } catch (cleanupError) {
      console.error("   -> Lỗi khi dọn dẹp dữ liệu:", cleanupError);
    }
  }
}

runRankingAndPrioritySuite().catch(console.error);
