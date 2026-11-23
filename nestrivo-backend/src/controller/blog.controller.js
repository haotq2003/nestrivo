import { prisma } from "../lib/prisma.js";

/**
 * Chuyển đổi tiêu đề tiếng Việt sang slug thân thiện URL
 */
function generateSlug(text) {
  if (!text) return "";
  let slug = text.toLowerCase().trim();
  slug = slug.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  slug = slug.replace(/[đĐ]/g, "d");
  slug = slug.replace(/[^a-z0-9\s-]/g, "");
  slug = slug.replace(/[\s-]+/g, "-");
  slug = slug.replace(/^-+|-+$/g, "");
  return slug;
}

/**
 * 1. Lấy danh sách bài viết blog công khai
 * GET /api/blog
 */
export async function getPublicBlogPosts(req, res) {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 9));
    const skip = (page - 1) * limit;
    const { category, search } = req.query;

    const where = {
      isPublished: true,
    };

    if (category && category !== "Tất cả") {
      where.category = category;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { summary: { contains: search, mode: "insensitive" } },
      ];
    }

    const [totalItems, posts] = await Promise.all([
      prisma.blogPost.count({ where }),
      prisma.blogPost.findMany({
        where,
        skip,
        take: limit,
        orderBy: { publishedAt: "desc" },
        include: {
          author: {
            select: {
              id: true,
              fullName: true,
              avatarUrl: true,
            },
          },
        },
      }),
    ]);

    // Lấy danh sách các danh mục hiện có
    const categoriesGroup = await prisma.blogPost.groupBy({
      by: ["category"],
      where: { isPublished: true },
      _count: { category: true },
    });

    return res.json({
      success: true,
      data: posts,
      categories: categoriesGroup.map((c) => ({
        name: c.category,
        count: c._count.category,
      })),
      pagination: {
        page,
        limit,
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
      },
    });
  } catch (error) {
    console.error("Get public blog posts error:", error);
    return res.status(500).json({ message: "Lỗi máy chủ khi lấy danh sách bài viết." });
  }
}

/**
 * 2. Lấy chi tiết bài viết theo Slug hoặc ID
 * GET /api/blog/:slugOrId
 */
export async function getBlogPostBySlug(req, res) {
  try {
    const { slugOrId } = req.params;

    // Tìm theo slug hoặc theo id UUID
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slugOrId);

    const post = await prisma.blogPost.findFirst({
      where: isUuid ? { OR: [{ id: slugOrId }, { slug: slugOrId }] } : { slug: slugOrId },
      include: {
        author: {
          select: {
            id: true,
            fullName: true,
            avatarUrl: true,
            email: true,
          },
        },
      },
    });

    if (!post) {
      return res.status(404).json({ message: "Không tìm thấy bài viết hoặc bài viết đã bị xóa." });
    }

    // Tăng lượt xem (không chặn phản hồi)
    prisma.blogPost
      .update({
        where: { id: post.id },
        data: { views: { increment: 1 } },
      })
      .catch((err) => console.warn("Lỗi tăng view blog:", err));

    // Lấy bài viết liên quan cùng danh mục
    const relatedPosts = await prisma.blogPost.findMany({
      where: {
        id: { not: post.id },
        category: post.category,
        isPublished: true,
      },
      take: 3,
      orderBy: { publishedAt: "desc" },
      select: {
        id: true,
        title: true,
        slug: true,
        summary: true,
        coverImage: true,
        publishedAt: true,
        category: true,
      },
    });

    return res.json({
      success: true,
      data: post,
      relatedPosts,
    });
  } catch (error) {
    console.error("Get blog post by slug error:", error);
    return res.status(500).json({ message: "Lỗi máy chủ khi lấy chi tiết bài viết." });
  }
}

/**
 * 3. [Admin] Lấy danh sách toàn bộ bài viết (kèm bài nháp)
 * GET /api/blog/admin/all
 */
export async function getAdminBlogPosts(req, res) {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const skip = (page - 1) * limit;
    const { category, search, status } = req.query;

    const where = {};

    if (category && category !== "ALL") {
      where.category = category;
    }

    if (status === "PUBLISHED") {
      where.isPublished = true;
    } else if (status === "DRAFT") {
      where.isPublished = false;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { slug: { contains: search, mode: "insensitive" } },
      ];
    }

    const [totalItems, posts] = await Promise.all([
      prisma.blogPost.count({ where }),
      prisma.blogPost.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          author: {
            select: {
              id: true,
              fullName: true,
              email: true,
              avatarUrl: true,
            },
          },
        },
      }),
    ]);

    return res.json({
      success: true,
      data: posts,
      pagination: {
        page,
        limit,
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
      },
    });
  } catch (error) {
    console.error("Get admin blog posts error:", error);
    return res.status(500).json({ message: "Lỗi máy chủ khi lấy danh sách quản trị blog." });
  }
}

/**
 * 4. [Admin] Tạo bài viết mới
 * POST /api/blog
 */
export async function createBlogPost(req, res) {
  try {
    const authorId = req.user.userId;
    const { title, slug, summary, content, coverImage, category, tags, isPublished } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ message: "Vui lòng nhập tiêu đề bài viết." });
    }

    if (!content || !content.trim()) {
      return res.status(400).json({ message: "Vui lòng nhập nội dung bài viết." });
    }

    // Tạo slug chuẩn, nếu người dùng không nhập thì tạo từ tiêu đề
    let finalSlug = slug ? generateSlug(slug) : generateSlug(title);
    if (!finalSlug) {
      finalSlug = `bai-viet-${Date.now()}`;
    }

    // Kiểm tra trùng lặp slug
    const existing = await prisma.blogPost.findUnique({
      where: { slug: finalSlug },
    });
    if (existing) {
      finalSlug = `${finalSlug}-${Date.now().toString().slice(-4)}`;
    }

    const newPost = await prisma.blogPost.create({
      data: {
        authorId,
        title: title.trim(),
        slug: finalSlug,
        summary: summary ? summary.trim() : title.trim(),
        content,
        coverImage: coverImage || null,
        category: category || "Kinh nghiệm thuê phòng",
        tags: Array.isArray(tags) ? tags : [],
        isPublished: isPublished !== undefined ? Boolean(isPublished) : true,
        publishedAt: isPublished ? new Date() : null,
      },
      include: {
        author: {
          select: {
            id: true,
            fullName: true,
            avatarUrl: true,
          },
        },
      },
    });

    return res.status(201).json({
      success: true,
      message: "Tạo bài viết thành công.",
      data: newPost,
    });
  } catch (error) {
    console.error("Create blog post error:", error);
    return res.status(500).json({ message: "Lỗi máy chủ khi tạo bài viết." });
  }
}

/**
 * 5. [Admin] Cập nhật bài viết
 * PUT /api/blog/:id
 */
export async function updateBlogPost(req, res) {
  try {
    const { id } = req.params;
    const { title, slug, summary, content, coverImage, category, tags, isPublished } = req.body;

    const existingPost = await prisma.blogPost.findUnique({
      where: { id },
    });

    if (!existingPost) {
      return res.status(404).json({ message: "Bài viết không tồn tại." });
    }

    const updateData = {};

    if (title !== undefined) updateData.title = title.trim();
    if (summary !== undefined) updateData.summary = summary.trim();
    if (content !== undefined) updateData.content = content;
    if (coverImage !== undefined) updateData.coverImage = coverImage;
    if (category !== undefined) updateData.category = category;
    if (tags !== undefined) updateData.tags = Array.isArray(tags) ? tags : [];

    if (slug !== undefined && slug.trim() !== "") {
      const formattedSlug = generateSlug(slug);
      if (formattedSlug !== existingPost.slug) {
        // Kiểm tra xem slug mới có bị trùng với bài khác không
        const duplicate = await prisma.blogPost.findUnique({
          where: { slug: formattedSlug },
        });
        if (duplicate && duplicate.id !== id) {
          updateData.slug = `${formattedSlug}-${Date.now().toString().slice(-4)}`;
        } else {
          updateData.slug = formattedSlug;
        }
      }
    }

    if (isPublished !== undefined) {
      updateData.isPublished = Boolean(isPublished);
      if (Boolean(isPublished) && !existingPost.publishedAt) {
        updateData.publishedAt = new Date();
      }
    }

    const updated = await prisma.blogPost.update({
      where: { id },
      data: updateData,
      include: {
        author: {
          select: {
            id: true,
            fullName: true,
            avatarUrl: true,
          },
        },
      },
    });

    return res.json({
      success: true,
      message: "Cập nhật bài viết thành công.",
      data: updated,
    });
  } catch (error) {
    console.error("Update blog post error:", error);
    return res.status(500).json({ message: "Lỗi máy chủ khi cập nhật bài viết." });
  }
}

/**
 * 6. [Admin] Xóa bài viết
 * DELETE /api/blog/:id
 */
export async function deleteBlogPost(req, res) {
  try {
    const { id } = req.params;

    const existingPost = await prisma.blogPost.findUnique({
      where: { id },
    });

    if (!existingPost) {
      return res.status(404).json({ message: "Bài viết không tồn tại." });
    }

    await prisma.blogPost.delete({
      where: { id },
    });

    return res.json({
      success: true,
      message: "Đã xóa bài viết thành công.",
    });
  } catch (error) {
    console.error("Delete blog post error:", error);
    return res.status(500).json({ message: "Lỗi máy chủ khi xóa bài viết." });
  }
}

/**
 * 7. [Admin] Chuyển đổi trạng thái xuất bản (Ẩn / Hiện)
 * PATCH /api/blog/:id/status
 */
export async function togglePublishStatus(req, res) {
  try {
    const { id } = req.params;

    const existingPost = await prisma.blogPost.findUnique({
      where: { id },
    });

    if (!existingPost) {
      return res.status(404).json({ message: "Bài viết không tồn tại." });
    }

    const nextState = !existingPost.isPublished;

    const updated = await prisma.blogPost.update({
      where: { id },
      data: {
        isPublished: nextState,
        publishedAt: nextState && !existingPost.publishedAt ? new Date() : existingPost.publishedAt,
      },
    });

    return res.json({
      success: true,
      message: nextState ? "Đã xuất bản bài viết." : "Đã chuyển bài viết về dạng nháp ẩn.",
      isPublished: nextState,
      data: updated,
    });
  } catch (error) {
    console.error("Toggle publish status error:", error);
    return res.status(500).json({ message: "Lỗi máy chủ khi đổi trạng thái bài viết." });
  }
}
