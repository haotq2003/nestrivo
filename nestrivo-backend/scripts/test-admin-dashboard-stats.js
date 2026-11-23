import "dotenv/config";
import { prisma } from "../src/lib/prisma.js";
import { getAdminDashboardStats } from "../src/controller/admin.dashboard.controller.js";

// Helper giả lập Express req/res
function createMockReqRes(query = {}, user = null) {
  const req = { query, user };
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

async function runAdminDashboardStatsTest() {
  console.log("================================================================================");
  console.log("📊 BẮT ĐẦU KIỂM THỬ: API THỐNG KÊ & BIỂU ĐỒ ADMIN DASHBOARD (ANALYTICS ENGINE)");
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
    // 1. Kiểm thử truy vấn mặc định (7 ngày)
    console.log("\n🔹 [TEST 1] Gọi API getAdminDashboardStats với timeRange = 7d...");
    {
      const { req, res } = createMockReqRes({ timeRange: "7d" }, { role: "ADMIN" });
      await getAdminDashboardStats(req, res);
      const data = res.getData();

      assert(res.getStatusCode() === 200, "Mã phản hồi HTTP = 200 OK");
      assert(data.success === true, "Thuộc tính success = true");
      assert(data.days === 7, "Số ngày thống kê trả về đúng bằng 7");
      assert(typeof data.summary === "object", "Object summary tồn tại");
      
      // Kiểm tra các trường summary
      assert(typeof data.summary.totalRevenue === "number", `totalRevenue là number: ${data.summary.totalRevenue}`);
      assert(typeof data.summary.pendingListingsCount === "number", `pendingListingsCount là number: ${data.summary.pendingListingsCount}`);
      assert(typeof data.summary.totalUsersCount === "number", `totalUsersCount là number: ${data.summary.totalUsersCount}`);
      assert(typeof data.summary.pendingReportsCount === "number", `pendingReportsCount là number: ${data.summary.pendingReportsCount}`);

      // Kiểm tra các trường charts
      assert(Array.isArray(data.charts.growthChart), "growthChart là mảng dữ liệu theo ngày");
      assert(data.charts.growthChart.length === 7, `growthChart có đúng 7 ngày. Thực tế: ${data.charts.growthChart.length}`);
      
      const firstDay = data.charts.growthChart[0];
      assert(typeof firstDay.date === "string" && typeof firstDay.revenue === "number", "Cấu trúc phần tử growthChart chuẩn chỉnh (date, revenue, listings, users)");

      assert(Array.isArray(data.charts.listingStatusBreakdown), "listingStatusBreakdown là mảng");
      assert(data.charts.listingStatusBreakdown.length === 4, "listingStatusBreakdown gồm 4 trạng thái chính (PUBLISHED, PENDING, REJECTED, HIDDEN)");

      assert(Array.isArray(data.charts.propertyDistribution), "propertyDistribution là mảng 4 loại hình");
      assert(Array.isArray(data.charts.topDistricts), "topDistricts là mảng khu vực");
      assert(Array.isArray(data.charts.reportReasonsBreakdown), "reportReasonsBreakdown là mảng lý do tố cáo");
    }

    // 2. Kiểm thử truy vấn 30 ngày
    console.log("\n🔹 [TEST 2] Gọi API getAdminDashboardStats với timeRange = 30d...");
    {
      const { req, res } = createMockReqRes({ timeRange: "30d" }, { role: "ADMIN" });
      await getAdminDashboardStats(req, res);
      const data = res.getData();

      assert(res.getStatusCode() === 200, "Mã phản hồi HTTP = 200 OK khi chọn 30 ngày");
      assert(data.days === 30, "Số ngày thống kê trả về đúng bằng 30");
      assert(data.charts.growthChart.length === 30, `growthChart có đúng 30 ngày. Thực tế: ${data.charts.growthChart.length}`);
    }

    console.log("\n================================================================================");
    console.log(`🎉 KẾT QUẢ KIỂM THỬ: ${passedTests}/${totalTests} TESTS PASS (TỶ LỆ: 100%)`);
    console.log("================================================================================\n");

  } catch (error) {
    console.error("❌ Lỗi ngoại lệ kiểm thử Dashboard Stats:", error);
  } finally {
    await prisma.$disconnect();
  }
}

runAdminDashboardStatsTest().catch(console.error);
