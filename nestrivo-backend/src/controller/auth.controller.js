import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma.js";

function createToken(user) {
  return jwt.sign(
    {
      userId: user.id,
      roles: user.roles,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    },
  );
}

function publicUser(user) {
  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    phoneNumber: user.phoneNumber,
    avatarUrl: user.avatarUrl,
    roles: user.roles,
    landlordProfile: user.landlordProfile || null,
  };
}

export async function register(req, res) {
  try {
    const {
      email,
      password,
      fullName,
      phoneNumber,
      isLandlord,
      role,
      landlordDisplayName,
      landlordDescription,
    } = req.body;

    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      typeof fullName !== "string" ||
      !email.trim() ||
      !fullName.trim() ||
      password.length < 8 ||
      password.length > 72
    ) {
      return res.status(400).json({
        message:
          "Email, họ tên hợp lệ và mật khẩu từ 8 đến 72 ký tự là bắt buộc.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await prisma.user.findUnique({
      where: {
        email: normalizedEmail,
      },
    });

    if (existingUser) {
      return res.status(400).json({
        message: "Email đã được sử dụng.",
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    // Xác định xem có đăng ký làm Chủ nhà ngay từ đầu không
    const wantsLandlord =
      isLandlord === true ||
      role === "LANDLORD" ||
      (Array.isArray(role) && role.includes("LANDLORD"));

    const roles = wantsLandlord ? ["RENTER", "LANDLORD"] : ["RENTER"];

    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        passwordHash,
        fullName: fullName.trim(),
        phoneNumber:
          typeof phoneNumber === "string" && phoneNumber.trim()
            ? phoneNumber.trim()
            : null,
        roles,
        ...(wantsLandlord
          ? {
              landlordProfile: {
                create: {
                  displayName:
                    typeof landlordDisplayName === "string" &&
                    landlordDisplayName.trim()
                      ? landlordDisplayName.trim()
                      : fullName.trim(),
                  description:
                    typeof landlordDescription === "string" &&
                    landlordDescription.trim()
                      ? landlordDescription.trim()
                      : null,
                },
              },
            }
          : {}),
      },
      include: {
        landlordProfile: true,
      },
    });

    return res.status(201).json({
      message: wantsLandlord
        ? "Đăng ký tài khoản Chủ nhà thành công."
        : "Đăng ký thành công.",
      user: publicUser(user),
      token: createToken(user),
    });
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(409).json({
        message: "Email này đã được đăng ký.",
      });
    }

    console.error("Register error:", error);
    return res.status(500).json({ message: "Lỗi máy chủ." });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        message: "Vui lòng nhập email và mật khẩu.",
      });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
      include: {
        landlordProfile: true,
      },
    });

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({
        message: "Email hoặc mật khẩu không chính xác.",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        message: "Tài khoản đã bị vô hiệu hóa.",
      });
    }

    return res.status(200).json({
      message: "Đăng nhập thành công.",
      user: publicUser(user),
      token: createToken(user),
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Lỗi máy chủ." });
  }
}

export async function getMe(req, res) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        phoneNumber: true,
        avatarUrl: true,
        roles: true,
        isActive: true,
        landlordProfile: true,
      },
    });

    if (!user || !user.isActive) {
      return res.status(401).json({
        message: "Tài khoản không tồn tại hoặc đã bị vô hiệu hóa.",
      });
    }

    return res.json({ user });
  } catch (error) {
    console.error("GetMe error:", error);
    return res.status(500).json({ message: "Lỗi máy chủ." });
  }
}

/**
 * Cập nhật thông tin Profile chung cho User & Landlord.
 * Hỗ trợ nâng cấp trực tiếp từ Renter lên Landlord.
 */
export async function updateProfile(req, res) {
  try {
    const userId = req.user.userId;
    const {
      fullName,
      phoneNumber,
      avatarUrl,
      isLandlord,
      landlordDisplayName,
      landlordDescription,
    } = req.body;

    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      include: { landlordProfile: true },
    });

    if (!currentUser || !currentUser.isActive) {
      return res.status(404).json({ message: "Tài khoản không tồn tại hoặc đã bị khóa." });
    }

    const updateData = {};
    if (typeof fullName === "string" && fullName.trim()) {
      updateData.fullName = fullName.trim();
    }
    if (phoneNumber !== undefined) {
      updateData.phoneNumber =
        typeof phoneNumber === "string" && phoneNumber.trim()
          ? phoneNumber.trim()
          : null;
    }
    if (avatarUrl !== undefined) {
      updateData.avatarUrl =
        typeof avatarUrl === "string" && avatarUrl.trim()
          ? avatarUrl.trim()
          : null;
    }

    // Kiểm tra yêu cầu trở thành hoặc cập nhật thông tin chủ nhà
    const wantsLandlord =
      isLandlord === true ||
      landlordDisplayName !== undefined ||
      landlordDescription !== undefined;

    let rolesChanged = false;
    let newRoles = [...currentUser.roles];

    if (wantsLandlord && !newRoles.includes("LANDLORD")) {
      newRoles.push("LANDLORD");
      updateData.roles = newRoles;
      rolesChanged = true;
    }

    // Xử lý cập nhật LandlordProfile
    if (wantsLandlord || currentUser.landlordProfile) {
      const displayNameToSet =
        typeof landlordDisplayName === "string" && landlordDisplayName.trim()
          ? landlordDisplayName.trim()
          : currentUser.landlordProfile?.displayName || updateData.fullName || currentUser.fullName;

      const descriptionToSet =
        landlordDescription !== undefined
          ? typeof landlordDescription === "string" && landlordDescription.trim()
            ? landlordDescription.trim()
            : null
          : currentUser.landlordProfile?.description;

      updateData.landlordProfile = {
        upsert: {
          create: {
            displayName: displayNameToSet,
            description: descriptionToSet,
          },
          update: {
            ...(landlordDisplayName !== undefined ? { displayName: displayNameToSet } : {}),
            ...(landlordDescription !== undefined ? { description: descriptionToSet } : {}),
          },
        },
      };
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      include: {
        landlordProfile: true,
      },
    });

    return res.json({
      message: "Cập nhật thông tin thành công.",
      user: publicUser(updatedUser),
      // Nếu role thay đổi (vừa nâng cấp lên Landlord), cấp token mới kèm role mới
      ...(rolesChanged ? { token: createToken(updatedUser) } : {}),
    });
  } catch (error) {
    console.error("Update profile error:", error);
    return res.status(500).json({ message: "Lỗi máy chủ khi cập nhật thông tin." });
  }
}

/**
 * Nộp hồ sơ xác minh danh tính chủ nhà (eKYC)
 * POST /api/auth/verification
 */
export async function submitKycVerification(req, res) {
  try {
    const userId = req.user.userId;
    const { personalInfo, documents } = req.body;

    if (!personalInfo || typeof personalInfo !== "object") {
      return res.status(400).json({ message: "Vui lòng cung cấp đầy đủ thông tin cá nhân." });
    }

    const { fullName, idNumber, dateOfBirth, gender, issueDate, issuingAuthority, permanentAddress } = personalInfo;

    if (!fullName || !fullName.trim()) {
      return res.status(400).json({ message: "Họ và tên không được để trống." });
    }

    if (!idNumber || !/^\d{12}$/.test(String(idNumber).trim())) {
      return res.status(400).json({ message: "Số Căn cước công dân phải bao gồm đúng 12 chữ số." });
    }

    if (!documents || !documents.frontImage || !documents.backImage) {
      return res.status(400).json({ message: "Vui lòng tải lên đầy đủ ảnh mặt trước và mặt sau CCCD." });
    }

    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      include: { landlordProfile: true },
    });

    if (!currentUser || !currentUser.isActive) {
      return res.status(404).json({ message: "Tài khoản không tồn tại hoặc đã bị khóa." });
    }

    // Đảm bảo user có role LANDLORD
    const newRoles = [...currentUser.roles];
    if (!newRoles.includes("LANDLORD")) {
      newRoles.push("LANDLORD");
    }

    // Cập nhật User & Upsert LandlordProfile sang trạng thái PENDING
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        roles: newRoles,
        landlordProfile: {
          upsert: {
            create: {
              displayName: fullName.trim(),
              verificationStatus: "PENDING",
            },
            update: {
              verificationStatus: "PENDING",
              displayName: currentUser.landlordProfile?.displayName || fullName.trim(),
            },
          },
        },
      },
      include: { landlordProfile: true },
    });

    const nowIso = new Date().toISOString();

    // 1. Tạo VerificationRequest và VerificationDocument trong Database thật
    const verificationRequest = await prisma.verificationRequest.create({
      data: {
        landlordId: userId,
        fullName: fullName.trim(),
        idNumber: String(idNumber).trim(),
        dateOfBirth: dateOfBirth || null,
        gender: gender || "MALE",
        issueDate: issueDate || null,
        issuingAuthority: issuingAuthority || "Cục Cảnh sát Quản lý hành chính về trật tự xã hội",
        permanentAddress: permanentAddress || "",
        status: "PENDING",
        documents: {
          create: [
            {
              type: "CITIZEN_ID_FRONT",
              fileUrl: documents.frontImage,
              fileName: documents.frontFileName || null,
              fileSize: documents.frontFileSize || null,
            },
            {
              type: "CITIZEN_ID_BACK",
              fileUrl: documents.backImage,
              fileName: documents.backFileName || null,
              fileSize: documents.backFileSize || null,
            },
          ],
        },
        histories: {
          create: {
            oldStatus: currentUser.landlordProfile?.verificationStatus || "NOT_SUBMITTED",
            newStatus: "PENDING",
            note: "Chủ nhà nộp hồ sơ eKYC trực tuyến",
          },
        },
      },
      include: {
        documents: true,
      },
    });

    // 2. Ghi nhận lịch sử nộp hồ sơ eKYC vào AuditLog
    await prisma.auditLog.create({
      data: {
        adminId: userId,
        action: "KYC_SUBMITTED",
        entityType: "VerificationRequest",
        entityId: verificationRequest.id,
        details: {
          requestId: verificationRequest.id,
          personalInfo: {
            fullName: fullName.trim(),
            idNumber: String(idNumber).trim(),
            dateOfBirth: dateOfBirth || null,
            gender: gender || "MALE",
            issueDate: issueDate || null,
            issuingAuthority: issuingAuthority || "Cục Cảnh sát Quản lý hành chính về trật tự xã hội",
            permanentAddress: permanentAddress || "",
          },
          documents: {
            frontImage: documents.frontImage,
            backImage: documents.backImage,
          },
          submittedAt: nowIso,
        },
      },
    });

    return res.status(200).json({
      message: "Nộp hồ sơ xác minh danh tính thành công! Hồ sơ đang chờ quản trị viên phê duyệt.",
      kyc: {
        id: verificationRequest.id,
        status: "PENDING",
        personalInfo: {
          fullName: fullName.trim(),
          idNumber: String(idNumber).trim(),
          dateOfBirth: dateOfBirth || "",
          gender: gender || "MALE",
          issueDate: issueDate || "",
          issuingAuthority: issuingAuthority || "",
          permanentAddress: permanentAddress || "",
        },
        documents: {
          frontImage: documents.frontImage,
          backImage: documents.backImage,
        },
        submittedAt: nowIso,
        confirmedTerms: true,
      },
      user: publicUser(updatedUser),
    });
  } catch (error) {
    console.error("Submit KYC error:", error);
    return res.status(500).json({ message: "Lỗi máy chủ khi nộp hồ sơ xác minh." });
  }
}

/**
 * Lấy trạng thái xác minh KYC của người dùng hiện tại
 * GET /api/auth/verification
 */
export async function getKycStatus(req, res) {
  try {
    const userId = req.user.userId;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { landlordProfile: true },
    });

    if (!user) {
      return res.status(404).json({ message: "Người dùng không tồn tại." });
    }

    // Tìm yêu cầu xác minh mới nhất trong bảng VerificationRequest
    const latestRequest = await prisma.verificationRequest.findFirst({
      where: { landlordId: userId },
      orderBy: { submittedAt: "desc" },
      include: {
        documents: true,
      },
    });

    if (!latestRequest) {
      const backendStatus = user.landlordProfile?.verificationStatus || "NOT_SUBMITTED";
      return res.json({
        status: backendStatus === "VERIFIED" ? "APPROVED" : "NOT_VERIFIED",
        personalInfo: {
          fullName: user.fullName || "",
          dateOfBirth: "",
          gender: "MALE",
          idNumber: "",
          issueDate: "",
          issuingAuthority: "Cục Cảnh sát Quản lý hành chính về trật tự xã hội",
          permanentAddress: "",
        },
        documents: {
          frontImage: null,
          backImage: null,
        },
        submittedAt: null,
        approvedAt: backendStatus === "VERIFIED" ? user.landlordProfile?.updatedAt : null,
        rejectedAt: null,
        rejectionReason: null,
      });
    }

    const frontDoc = latestRequest.documents.find((d) => d.type === "CITIZEN_ID_FRONT");
    const backDoc = latestRequest.documents.find((d) => d.type === "CITIZEN_ID_BACK");

    const uiStatus =
      latestRequest.status === "VERIFIED"
        ? "APPROVED"
        : latestRequest.status === "REJECTED"
        ? "REJECTED"
        : latestRequest.status === "RESUBMISSION_REQUIRED"
        ? "REJECTED"
        : latestRequest.status === "NOT_SUBMITTED"
        ? "NOT_VERIFIED"
        : "PENDING";

    return res.json({
      id: latestRequest.id,
      status: uiStatus,
      personalInfo: {
        fullName: latestRequest.fullName,
        dateOfBirth: latestRequest.dateOfBirth || "",
        gender: latestRequest.gender || "MALE",
        idNumber: latestRequest.idNumber,
        issueDate: latestRequest.issueDate || "",
        issuingAuthority: latestRequest.issuingAuthority || "",
        permanentAddress: latestRequest.permanentAddress || "",
      },
      documents: {
        frontImage: frontDoc?.fileUrl || null,
        backImage: backDoc?.fileUrl || null,
      },
      submittedAt: latestRequest.submittedAt,
      approvedAt: latestRequest.status === "VERIFIED" ? latestRequest.reviewedAt : null,
      rejectedAt: latestRequest.status === "REJECTED" ? latestRequest.reviewedAt : null,
      rejectionReason: latestRequest.rejectionReason,
      rejectedFields: latestRequest.rejectedFields,
      confirmedTerms: true,
    });
  } catch (error) {
    console.error("Get KYC status error:", error);
    return res.status(500).json({ message: "Lỗi máy chủ khi lấy trạng thái xác minh." });
  }
}

