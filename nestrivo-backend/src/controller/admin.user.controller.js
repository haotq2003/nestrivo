import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma.js";

/**
 * 1. Lấy danh sách tài khoản người dùng cho Admin (kèm phân trang, lọc, tìm kiếm và thống kê)
 * GET /api/admin/users
 */
export async function getAdminUsers(req, res) {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      role,
      status,
      verificationStatus,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit) || 10));
    const skip = (pageNum - 1) * limitNum;

    // Xây dựng điều kiện lọc
    const where = {};

    // Tìm kiếm theo tên, email hoặc số điện thoại
    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { fullName: { contains: q, mode: "insensitive" } },
        { email: { contains: q, mode: "insensitive" } },
        { phoneNumber: { contains: q, mode: "insensitive" } },
      ];
    }

    // Lọc theo vai trò (Role)
    if (role && role !== "ALL") {
      where.roles = { has: role };
    }

    // Lọc theo trạng thái tài khoản (Active / Locked)
    if (status === "ACTIVE") {
      where.isActive = true;
    } else if (status === "LOCKED") {
      where.isActive = false;
    }

    // Lọc theo trạng thái xác minh KYC
    if (verificationStatus && verificationStatus !== "ALL") {
      if (verificationStatus === "VERIFIED") {
        where.OR = [
          ...(where.OR ? [{ AND: [where.OR] }] : []),
          { landlordProfile: { is: { verificationStatus: "VERIFIED" } } },
          { verificationRequests: { some: { status: "VERIFIED" } } },
        ];
      } else if (verificationStatus === "PENDING") {
        where.OR = [
          ...(where.OR ? [{ AND: [where.OR] }] : []),
          { landlordProfile: { is: { verificationStatus: "PENDING" } } },
          { verificationRequests: { some: { status: "PENDING" } } },
        ];
      } else if (verificationStatus === "REJECTED") {
        where.OR = [
          ...(where.OR ? [{ AND: [where.OR] }] : []),
          { landlordProfile: { is: { verificationStatus: "REJECTED" } } },
          { verificationRequests: { some: { status: "REJECTED" } } },
        ];
      } else if (verificationStatus === "NOT_VERIFIED") {
        where.landlordProfile = {
          is: {
            verificationStatus: { in: ["NOT_SUBMITTED", "RESUBMISSION_REQUIRED"] },
          },
        };
      }
    }

    // Thứ tự sắp xếp
    const validSortFields = ["createdAt", "fullName", "email", "updatedAt"];
    const sortField = validSortFields.includes(sortBy) ? sortBy : "createdAt";
    const direction = sortOrder.toLowerCase() === "asc" ? "asc" : "desc";
    const orderBy = { [sortField]: direction };

    // Thực hiện truy vấn danh sách & tổng số items và các số liệu KPI
    const [
      totalItems,
      users,
      totalAllUsers,
      totalLandlords,
      totalRenters,
      totalAdmins,
      totalLockedUsers,
      totalVerifiedUsers,
    ] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        skip,
        take: limitNum,
        orderBy,
        select: {
          id: true,
          email: true,
          fullName: true,
          phoneNumber: true,
          avatarUrl: true,
          roles: true,
          isActive: true,
          lockReason: true,
          lockedAt: true,
          createdAt: true,
          updatedAt: true,
          landlordProfile: {
            select: {
              id: true,
              displayName: true,
              verificationStatus: true,
              averageRating: true,
              reviewCount: true,
            },
          },
          verificationRequests: {
            select: {
              id: true,
              status: true,
              submittedAt: true,
            },
            take: 1,
            orderBy: { submittedAt: "desc" },
          },
          _count: {
            select: {
              listings: true,
              reports: true,
            },
          },
        },
      }),
      // KPI stats
      prisma.user.count(),
      prisma.user.count({ where: { roles: { has: "LANDLORD" } } }),
      prisma.user.count({ where: { roles: { has: "RENTER" } } }),
      prisma.user.count({ where: { roles: { has: "ADMIN" } } }),
      prisma.user.count({ where: { isActive: false } }),
      prisma.user.count({
        where: {
          OR: [
            { landlordProfile: { is: { verificationStatus: "VERIFIED" } } },
            { verificationRequests: { some: { status: "VERIFIED" } } },
          ],
        },
      }),
    ]);

    // Chuẩn hóa dữ liệu trả về cho frontend
    const formattedUsers = users.map((u) => {
      // Xác định trạng thái eKYC chính xác nhất
      const isVerified = Boolean(
        u.landlordProfile?.verificationStatus === "VERIFIED" ||
        u.verificationRequests?.[0]?.status === "VERIFIED"
      );
      const isPending = Boolean(
        u.landlordProfile?.verificationStatus === "PENDING" ||
        u.verificationRequests?.[0]?.status === "PENDING"
      );
      const isRejected = Boolean(
        u.landlordProfile?.verificationStatus === "REJECTED" ||
        u.verificationRequests?.[0]?.status === "REJECTED"
      );

      let effectiveKyc = "NOT_VERIFIED";
      if (isVerified) effectiveKyc = "VERIFIED";
      else if (isPending) effectiveKyc = "PENDING";
      else if (isRejected) effectiveKyc = "REJECTED";

      // Vai trò đại diện chính
      let primaryRole = "RENTER";
      if (u.roles.includes("ADMIN")) primaryRole = "ADMIN";
      else if (u.roles.includes("LANDLORD")) primaryRole = "LANDLORD";

      return {
        id: u.id,
        fullName: u.fullName,
        email: u.email,
        phoneNumber: u.phoneNumber || "",
        avatarUrl: u.avatarUrl,
        roles: u.roles,
        role: primaryRole,
        isActive: u.isActive,
        status: u.isActive ? "ACTIVE" : "LOCKED",
        lockReason: u.lockReason || null,
        lockedAt: u.lockedAt || null,
        createdAt: u.createdAt,
        updatedAt: u.updatedAt,
        verificationStatus: effectiveKyc,
        totalListings: u._count?.listings || 0,
        reportsReceived: u._count?.reports || 0,
        landlordProfile: u.landlordProfile,
      };
    });

    return res.json({
      success: true,
      data: formattedUsers,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalItems,
        totalPages: Math.ceil(totalItems / limitNum) || 1,
      },
      stats: {
        total: totalAllUsers,
        landlords: totalLandlords,
        renters: totalRenters,
        admins: totalAdmins,
        locked: totalLockedUsers,
        verified: totalVerifiedUsers,
      },
    });
  } catch (error) {
    console.error("Lỗi getAdminUsers:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi hệ thống khi tải danh sách người dùng.",
      error: error.message,
    });
  }
}

/**
 * 2. Lấy chi tiết một tài khoản người dùng
 * GET /api/admin/users/:id
 */
export async function getAdminUserDetail(req, res) {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        landlordProfile: true,
        verificationRequests: {
          orderBy: { submittedAt: "desc" },
          include: {
            documents: true,
            reviewedBy: {
              select: { id: true, fullName: true, email: true },
            },
          },
        },
        listings: {
          take: 5,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            title: true,
            price: true,
            status: true,
            propertyType: true,
            createdAt: true,
          },
        },
        _count: {
          select: {
            listings: true,
            reports: true,
            sentInquiries: true,
            receivedInquiries: true,
            reviewsGiven: true,
            reviewsReceived: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy người dùng.",
      });
    }

    const isVerified = Boolean(
      user.landlordProfile?.verificationStatus === "VERIFIED" ||
      user.verificationRequests?.[0]?.status === "VERIFIED"
    );

    let effectiveKyc = "NOT_VERIFIED";
    if (isVerified) effectiveKyc = "VERIFIED";
    else if (user.landlordProfile?.verificationStatus === "PENDING" || user.verificationRequests?.[0]?.status === "PENDING") effectiveKyc = "PENDING";
    else if (user.landlordProfile?.verificationStatus === "REJECTED" || user.verificationRequests?.[0]?.status === "REJECTED") effectiveKyc = "REJECTED";

    let primaryRole = "RENTER";
    if (user.roles.includes("ADMIN")) primaryRole = "ADMIN";
    else if (user.roles.includes("LANDLORD")) primaryRole = "LANDLORD";

    return res.json({
      success: true,
      data: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        avatarUrl: user.avatarUrl,
        roles: user.roles,
        role: primaryRole,
        isActive: user.isActive,
        status: user.isActive ? "ACTIVE" : "LOCKED",
        lockReason: user.lockReason,
        lockedAt: user.lockedAt,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        verificationStatus: effectiveKyc,
        totalListings: user._count.listings,
        reportsReceived: user._count.reports,
        sentInquiriesCount: user._count.sentInquiries,
        receivedInquiriesCount: user._count.receivedInquiries,
        landlordProfile: user.landlordProfile,
        verificationRequests: user.verificationRequests,
        recentListings: user.listings,
      },
    });
  } catch (error) {
    console.error("Lỗi getAdminUserDetail:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi hệ thống khi tải chi tiết người dùng.",
      error: error.message,
    });
  }
}

/**
 * 3. Khóa hoặc Mở khóa tài khoản người dùng
 * PATCH /api/admin/users/:id/lock
 */
export async function toggleUserLock(req, res) {
  try {
    const { id } = req.params;
    const { lockReason } = req.body;
    const adminId = req.user?.userId;

    const targetUser = await prisma.user.findUnique({
      where: { id },
      include: { landlordProfile: true },
    });

    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy người dùng.",
      });
    }

    // Không cho phép khóa Admin
    if (targetUser.roles.includes("ADMIN")) {
      return res.status(400).json({
        success: false,
        message: "Không thể khóa tài khoản Quản trị viên hệ thống.",
      });
    }

    const nextIsActive = !targetUser.isActive;
    const reason = nextIsActive
      ? null
      : (lockReason?.trim() || "Vi phạm quy chế minh bạch của sàn Nestrivo");
    const lockedAt = nextIsActive ? null : new Date();

    const [updatedUser] = await prisma.$transaction([
      prisma.user.update({
        where: { id },
        data: {
          isActive: nextIsActive,
          lockReason: reason,
          lockedAt,
        },
        include: {
          landlordProfile: true,
          _count: {
            select: { listings: true, reports: true },
          },
        },
      }),
      prisma.auditLog.create({
        data: {
          adminId,
          action: nextIsActive ? "UNLOCK_USER" : "LOCK_USER",
          entityType: "USER",
          entityId: id,
          details: {
            targetUserEmail: targetUser.email,
            reason: reason || "Được quản trị viên mở khóa",
          },
        },
      }),
    ]);

    const message = nextIsActive
      ? `Đã mở khóa tài khoản "${updatedUser.fullName}".`
      : `Đã khóa tài khoản "${updatedUser.fullName}".`;

    return res.json({
      success: true,
      message,
      data: {
        id: updatedUser.id,
        fullName: updatedUser.fullName,
        email: updatedUser.email,
        phoneNumber: updatedUser.phoneNumber,
        avatarUrl: updatedUser.avatarUrl,
        roles: updatedUser.roles,
        role: updatedUser.roles.includes("ADMIN") ? "ADMIN" : updatedUser.roles.includes("LANDLORD") ? "LANDLORD" : "RENTER",
        isActive: updatedUser.isActive,
        status: updatedUser.isActive ? "ACTIVE" : "LOCKED",
        lockReason: updatedUser.lockReason,
        lockedAt: updatedUser.lockedAt,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt,
        verificationStatus: updatedUser.landlordProfile?.verificationStatus === "VERIFIED" ? "VERIFIED" : "NOT_VERIFIED",
        totalListings: updatedUser._count?.listings || 0,
        reportsReceived: updatedUser._count?.reports || 0,
        landlordProfile: updatedUser.landlordProfile,
      },
    });
  } catch (error) {
    console.error("Lỗi toggleUserLock:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi hệ thống khi cập nhật trạng thái khóa tài khoản.",
      error: error.message,
    });
  }
}

/**
 * 4. Cập nhật phân quyền vai trò (Roles) cho tài khoản
 * PATCH /api/admin/users/:id/roles
 */
export async function updateUserRoles(req, res) {
  try {
    const { id } = req.params;
    const { roles } = req.body;
    const adminId = req.user?.userId;

    if (!Array.isArray(roles) || roles.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Danh sách vai trò không hợp lệ.",
      });
    }

    const validRoles = ["RENTER", "LANDLORD", "ADMIN"];
    const sanitizedRoles = Array.from(new Set(roles.filter((r) => validRoles.includes(r))));

    if (sanitizedRoles.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Cần ít nhất một vai trò hợp lệ (RENTER, LANDLORD, ADMIN).",
      });
    }

    const user = await prisma.user.findUnique({
      where: { id },
      include: { landlordProfile: true },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy người dùng.",
      });
    }

    // Nếu thêm vai trò LANDLORD nhưng chưa có LandlordProfile thì tự động tạo
    const needsLandlordProfile = sanitizedRoles.includes("LANDLORD") && !user.landlordProfile;

    const [updatedUser] = await prisma.$transaction([
      prisma.user.update({
        where: { id },
        data: {
          roles: sanitizedRoles,
          ...(needsLandlordProfile
            ? {
                landlordProfile: {
                  create: {
                    displayName: user.fullName,
                    verificationStatus: "NOT_SUBMITTED",
                  },
                },
              }
            : {}),
        },
        include: {
          landlordProfile: true,
          _count: { select: { listings: true, reports: true } },
        },
      }),
      prisma.auditLog.create({
        data: {
          adminId,
          action: "UPDATE_USER_ROLES",
          entityType: "USER",
          entityId: id,
          details: {
            oldRoles: user.roles,
            newRoles: sanitizedRoles,
          },
        },
      }),
    ]);

    return res.json({
      success: true,
      message: `Đã cập nhật vai trò cho người dùng "${updatedUser.fullName}".`,
      data: updatedUser,
    });
  } catch (error) {
    console.error("Lỗi updateUserRoles:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi hệ thống khi cập nhật vai trò.",
      error: error.message,
    });
  }
}

/**
 * 5. Cập nhật trực tiếp trạng thái xác thực eKYC
 * PATCH /api/admin/users/:id/kyc
 */
export async function updateUserKyc(req, res) {
  try {
    const { id } = req.params;
    const { verificationStatus } = req.body;
    const adminId = req.user?.userId;

    const validStatuses = ["VERIFIED", "PENDING", "REJECTED", "NOT_SUBMITTED"];
    if (!validStatuses.includes(verificationStatus)) {
      return res.status(400).json({
        success: false,
        message: "Trạng thái xác thực không hợp lệ.",
      });
    }

    const user = await prisma.user.findUnique({
      where: { id },
      include: { landlordProfile: true },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy người dùng.",
      });
    }

    // Cập nhật hoặc tạo landlordProfile nếu chưa có
    if (!user.landlordProfile) {
      await prisma.landlordProfile.create({
        data: {
          userId: id,
          displayName: user.fullName,
          verificationStatus,
        },
      });
    } else {
      await prisma.landlordProfile.update({
        where: { userId: id },
        data: { verificationStatus },
      });
    }

    // Đồng bộ vào VerificationRequest gần nhất nếu có
    const latestRequest = await prisma.verificationRequest.findFirst({
      where: { landlordId: id },
      orderBy: { submittedAt: "desc" },
    });

    if (latestRequest) {
      await prisma.verificationRequest.update({
        where: { id: latestRequest.id },
        data: {
          status: verificationStatus,
          reviewedAt: new Date(),
          reviewedById: adminId,
        },
      });
    } else if (verificationStatus === "VERIFIED") {
      // Tạo một bản ghi xác thực đã duyệt trực tiếp bởi admin
      await prisma.verificationRequest.create({
        data: {
          landlordId: id,
          status: "VERIFIED",
          reviewedAt: new Date(),
          reviewedById: adminId,
          adminNotes: "Xác thực trực tiếp bởi Quản trị viên trong trang Quản lý tài khoản.",
        },
      });
    }

    // Ghi audit log
    await prisma.auditLog.create({
      data: {
        adminId,
        action: "UPDATE_USER_KYC",
        entityType: "USER",
        entityId: id,
        details: {
          targetUserEmail: user.email,
          newStatus: verificationStatus,
        },
      },
    });

    return res.json({
      success: true,
      message: `Đã cập nhật trạng thái KYC thành "${verificationStatus}".`,
    });
  } catch (error) {
    console.error("Lỗi updateUserKyc:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi hệ thống khi cập nhật trạng thái xác thực eKYC.",
      error: error.message,
    });
  }
}

/**
 * 6. Tạo mới tài khoản người dùng từ Admin
 * POST /api/admin/users
 */
export async function createAdminUser(req, res) {
  try {
    const { fullName, email, password, phoneNumber, roles } = req.body;
    const adminId = req.user?.userId;

    if (!fullName?.trim() || !email?.trim() || !password || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Họ tên, email hợp lệ và mật khẩu tối thiểu 6 ký tự là bắt buộc.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Email này đã tồn tại trong hệ thống.",
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const assignedRoles = Array.isArray(roles) && roles.length > 0 ? roles : ["RENTER"];

    const isLandlord = assignedRoles.includes("LANDLORD");

    const newUser = await prisma.user.create({
      data: {
        fullName: fullName.trim(),
        email: normalizedEmail,
        passwordHash,
        phoneNumber: phoneNumber?.trim() || null,
        roles: assignedRoles,
        isActive: true,
        ...(isLandlord
          ? {
              landlordProfile: {
                create: {
                  displayName: fullName.trim(),
                  verificationStatus: "NOT_SUBMITTED",
                },
              },
            }
          : {}),
      },
      include: { landlordProfile: true },
    });

    // Audit Log
    await prisma.auditLog.create({
      data: {
        adminId,
        action: "CREATE_USER_BY_ADMIN",
        entityType: "USER",
        entityId: newUser.id,
        details: { email: newUser.email, roles: newUser.roles },
      },
    });

    return res.status(201).json({
      success: true,
      message: "Tạo tài khoản thành công.",
      data: newUser,
    });
  } catch (error) {
    console.error("Lỗi createAdminUser:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi hệ thống khi tạo người dùng.",
      error: error.message,
    });
  }
}

/**
 * 7. Cập nhật thông tin cơ bản của tài khoản
 * PUT /api/admin/users/:id
 */
export async function updateAdminUser(req, res) {
  try {
    const { id } = req.params;
    const { fullName, phoneNumber, avatarUrl, email } = req.body;
    const adminId = req.user?.userId;

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy người dùng.",
      });
    }

    const dataToUpdate = {};
    if (fullName && fullName.trim()) dataToUpdate.fullName = fullName.trim();
    if (phoneNumber !== undefined) dataToUpdate.phoneNumber = phoneNumber?.trim() || null;
    if (avatarUrl !== undefined) dataToUpdate.avatarUrl = avatarUrl;

    if (email && email.trim() && email.trim().toLowerCase() !== user.email) {
      const normalizedEmail = email.trim().toLowerCase();
      const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: "Email này đã được sử dụng bởi tài khoản khác.",
        });
      }
      dataToUpdate.email = normalizedEmail;
    }

    const updated = await prisma.user.update({
      where: { id },
      data: dataToUpdate,
      include: { landlordProfile: true },
    });

    await prisma.auditLog.create({
      data: {
        adminId,
        action: "UPDATE_USER_INFO",
        entityType: "USER",
        entityId: id,
        details: dataToUpdate,
      },
    });

    return res.json({
      success: true,
      message: "Cập nhật thông tin thành công.",
      data: updated,
    });
  } catch (error) {
    console.error("Lỗi updateAdminUser:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi hệ thống khi cập nhật thông tin người dùng.",
      error: error.message,
    });
  }
}
