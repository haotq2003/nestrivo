import "dotenv/config";
import { prisma } from "../src/lib/prisma.js";
import {
  getPublicBlogPosts,
  getBlogPostBySlug,
  getAdminBlogPosts,
  createBlogPost,
  updateBlogPost,
  deleteBlogPost,
  togglePublishStatus,
} from "../src/controller/blog.controller.js";

function createMockReqRes(params = {}, query = {}, body = {}, user = null) {
  const req = { params, query, body, user };
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

async function runBlogSuiteTest() {
  console.log("================================================================================");
  console.log("📝 BẮT ĐẦU KIỂM THỬ: BLOG & CONTENT ENGINE SUITE");
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
    let admin = await prisma.user.findFirst({
      where: { roles: { has: "ADMIN" } },
    });
    if (!admin) {
      admin = await prisma.user.findFirst();
    }
    const adminCtx = { userId: admin.id, roles: ["ADMIN"] };

    // 1. Kiểm thử lấy danh sách public blog
    console.log("\n🔹 [TEST 1] Gọi getPublicBlogPosts...");
    {
      const { req, res } = createMockReqRes({}, { page: 1, limit: 10 });
      await getPublicBlogPosts(req, res);
      const data = res.getData();
      assert(
        res.getStatusCode() === 200 && data.success === true && Array.isArray(data.data) && data.data.length > 0,
        `Lấy danh sách bài viết công khai thành công (${data.data?.length} bài)`
      );
    }

    // 2. Lấy chi tiết bài viết qua slug
    console.log("\n🔹 [TEST 2] Gọi getBlogPostBySlug...");
    let firstPostSlug = "";
    {
      const first = await prisma.blogPost.findFirst({ where: { isPublished: true } });
      firstPostSlug = first.slug;
      const { req, res } = createMockReqRes({ slugOrId: firstPostSlug });
      await getBlogPostBySlug(req, res);
      const data = res.getData();
      assert(
        res.getStatusCode() === 200 && data.success === true && data.data.slug === firstPostSlug,
        `Lấy chi tiết bài viết '${data.data?.title}' thành công`
      );
    }

    // 3. Admin tạo bài viết mới
    console.log("\n🔹 [TEST 3] Admin tạo bài viết mới (createBlogPost)...");
    let createdPostId = null;
    {
      const newPostPayload = {
        title: "Kinh nghiệm thương lượng giá thuê phòng trọ mùa cao điểm",
        summary: "Bí quyết giúp bạn đàm phán giảm từ 200k - 500k tiền thuê nhà mỗi tháng.",
        content: "Nội dung bài viết chi tiết về cách thương lượng giá thuê với chủ nhà...",
        category: "Kinh nghiệm thuê phòng",
        tags: ["đàm phán", "giá rẻ"],
        isPublished: true,
      };
      const { req, res } = createMockReqRes({}, {}, newPostPayload, adminCtx);
      await createBlogPost(req, res);
      const data = res.getData();
      createdPostId = data?.data?.id;
      assert(
        res.getStatusCode() === 201 && data.success === true && !!createdPostId,
        `Admin tạo bài viết mới thành công (ID: ${createdPostId}, slug: ${data?.data?.slug})`
      );
    }

    // 4. Admin cập nhật bài viết
    console.log("\n🔹 [TEST 4] Admin cập nhật bài viết (updateBlogPost)...");
    {
      const updatePayload = {
        title: "Kinh nghiệm thương lượng giá thuê phòng trọ mùa cao điểm (Đã cập nhật)",
        summary: "Bí quyết đàm phán giảm tiền phòng trọ cập nhật mới nhất.",
      };
      const { req, res } = createMockReqRes({ id: createdPostId }, {}, updatePayload, adminCtx);
      await updateBlogPost(req, res);
      const data = res.getData();
      assert(
        res.getStatusCode() === 200 && data.success === true && data.data.title.includes("Đã cập nhật"),
        "Admin cập nhật tiêu đề bài viết thành công"
      );
    }

    // 5. Admin chuyển đổi trạng thái xuất bản
    console.log("\n🔹 [TEST 5] Admin toggle trạng thái xuất bản (togglePublishStatus)...");
    {
      const { req, res } = createMockReqRes({ id: createdPostId }, {}, {}, adminCtx);
      await togglePublishStatus(req, res);
      const data = res.getData();
      assert(
        res.getStatusCode() === 200 && data.success === true && data.isPublished === false,
        "Đổi trạng thái bài viết sang DRAFT (ẩn) thành công"
      );
    }

    // 6. Admin xóa bài viết
    console.log("\n🔹 [TEST 6] Admin xóa bài viết (deleteBlogPost)...");
    {
      const { req, res } = createMockReqRes({ id: createdPostId }, {}, {}, adminCtx);
      await deleteBlogPost(req, res);
      const data = res.getData();
      assert(
        res.getStatusCode() === 200 && data.success === true,
        "Admin xóa bài viết thành công"
      );
    }

    console.log("\n================================================================================");
    console.log(`🎉 KẾT QUẢ: ĐÃ VƯỢT QUA ${passedTests}/${totalTests} BÀI KIỂM THỬ BLOG SUITE`);
    console.log("================================================================================");
  } catch (err) {
    console.error("❌ Lỗi kiểm thử:", err);
  } finally {
    await prisma.$disconnect();
  }
}

runBlogSuiteTest();
