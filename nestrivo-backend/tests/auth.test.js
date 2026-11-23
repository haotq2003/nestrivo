import { describe, it, expect, vi, beforeAll, beforeEach } from "vitest";
import request from "supertest";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const { mockPrisma } = vi.hoisted(() => ({
  mockPrisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    $queryRaw: vi.fn(),
  },
}));

vi.mock("../src/lib/prisma.js", () => ({
  prisma: mockPrisma,
}));

import app from "../src/app.js";

describe("Auth API - Login & Session", () => {
  const TEST_SECRET = "nestrivo-vitest-secret-key";
  let hashedPassword;

  beforeAll(async () => {
    process.env.JWT_SECRET = TEST_SECRET;
    hashedPassword = await bcrypt.hash("Password123!", 10);
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("POST /api/auth/login - Trả về 400 nếu thiếu email hoặc mật khẩu", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "renter@nestrivo.vn" });

    expect(res.status).toBe(400);
    expect(res.body.message).toContain("Vui lòng nhập email và mật khẩu");
  });

  it("POST /api/auth/login - Trả về 401 nếu email không tồn tại", async () => {
    mockPrisma.user.findUnique.mockResolvedValueOnce(null);

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "notfound@nestrivo.vn", password: "Password123!" });

    expect(res.status).toBe(401);
    expect(res.body.message).toContain("Email hoặc mật khẩu không chính xác");
  });

  it("POST /api/auth/login - Trả về 401 nếu sai mật khẩu", async () => {
    mockPrisma.user.findUnique.mockResolvedValueOnce({
      id: "user-1",
      email: "renter@nestrivo.vn",
      fullName: "Nguyen Van A",
      passwordHash: hashedPassword,
      roles: ["RENTER"],
      isActive: true,
      landlordProfile: null,
    });

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "renter@nestrivo.vn", password: "WrongPassword!" });

    expect(res.status).toBe(401);
    expect(res.body.message).toContain("Email hoặc mật khẩu không chính xác");
  });

  it("POST /api/auth/login - Trả về 403 nếu tài khoản bị vô hiệu hóa", async () => {
    mockPrisma.user.findUnique.mockResolvedValueOnce({
      id: "user-locked",
      email: "locked@nestrivo.vn",
      fullName: "Locked User",
      passwordHash: hashedPassword,
      roles: ["RENTER"],
      isActive: false,
      landlordProfile: null,
    });

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "locked@nestrivo.vn", password: "Password123!" });

    expect(res.status).toBe(403);
    expect(res.body.message).toContain("vô hiệu hóa");
  });

  it("POST /api/auth/login - Đăng nhập thành công, trả về JWT hợp lệ và không lộ passwordHash", async () => {
    mockPrisma.user.findUnique.mockResolvedValueOnce({
      id: "user-1",
      email: "landlord@nestrivo.vn",
      fullName: "Chu Nha Demo",
      phoneNumber: "0901234567",
      avatarUrl: null,
      passwordHash: hashedPassword,
      roles: ["RENTER", "LANDLORD"],
      isActive: true,
      landlordProfile: { displayName: "Nhà Trọ Demo", verificationStatus: "VERIFIED" },
    });

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "LANDLORD@nestrivo.vn", password: "Password123!" });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeTypeOf("string");
    expect(res.body.user.email).toBe("landlord@nestrivo.vn");
    expect(res.body.user.roles).toEqual(["RENTER", "LANDLORD"]);
    expect(res.body.user.passwordHash).toBeUndefined();

    // Xác minh JWT payload giải mã đúng userId và roles
    const decoded = jwt.verify(res.body.token, TEST_SECRET);
    expect(decoded.userId).toBe("user-1");
    expect(decoded.roles).toEqual(["RENTER", "LANDLORD"]);
  });

  it("GET /api/auth/me - Trả về 401 nếu không gửi Bearer token", async () => {
    const res = await request(app).get("/api/auth/me");
    expect(res.status).toBe(401);
  });

  it("GET /api/auth/me - Trả về thông tin user khi gửi token hợp lệ", async () => {
    const token = jwt.sign({ userId: "user-1", roles: ["RENTER"] }, TEST_SECRET, {
      expiresIn: "1h",
    });

    mockPrisma.user.findUnique.mockResolvedValueOnce({
      id: "user-1",
      email: "renter@nestrivo.vn",
      fullName: "Nguyen Van A",
      phoneNumber: null,
      avatarUrl: null,
      roles: ["RENTER"],
      isActive: true,
      landlordProfile: null,
    });

    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.user.id).toBe("user-1");
    expect(res.body.user.email).toBe("renter@nestrivo.vn");
  });
});
