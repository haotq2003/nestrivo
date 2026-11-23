import { describe, it, expect, vi, beforeAll, beforeEach } from "vitest";
import request from "supertest";
import jwt from "jsonwebtoken";

const { mockPrisma } = vi.hoisted(() => ({
  mockPrisma: {
    listing: {
      count: vi.fn(),
      findMany: vi.fn(),
    },
  },
}));

vi.mock("../src/lib/prisma.js", () => ({
  prisma: mockPrisma,
}));

import app from "../src/app.js";

describe("RBAC - Phân quyền Role (RENTER / LANDLORD / ADMIN)", () => {
  const TEST_SECRET = "nestrivo-vitest-secret-key";
  let renterToken;
  let landlordToken;
  let adminToken;
  let expiredToken;

  beforeAll(() => {
    process.env.JWT_SECRET = TEST_SECRET;

    renterToken = jwt.sign({ userId: "renter-1", roles: ["RENTER"] }, TEST_SECRET, {
      expiresIn: "1h",
    });
    landlordToken = jwt.sign(
      { userId: "landlord-1", roles: ["RENTER", "LANDLORD"] },
      TEST_SECRET,
      { expiresIn: "1h" }
    );
    adminToken = jwt.sign({ userId: "admin-1", roles: ["ADMIN"] }, TEST_SECRET, {
      expiresIn: "1h",
    });
    expiredToken = jwt.sign({ userId: "expired-1", roles: ["ADMIN"] }, TEST_SECRET, {
      expiresIn: -10,
    });
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // 1. Không có token / Token không hợp lệ
  it("Chặn 401 khi truy cập API Landlord mà không có token", async () => {
    const res = await request(app).get("/api/landlord/listings");
    expect(res.status).toBe(401);
    expect(res.body.message).toContain("access token");
  });

  it("Chặn 401 khi dùng token hết hạn hoặc chữ ký sai", async () => {
    const resExpired = await request(app)
      .get("/api/admin/listings/pending")
      .set("Authorization", `Bearer ${expiredToken}`);
    expect(resExpired.status).toBe(401);

    const resInvalid = await request(app)
      .get("/api/admin/listings/pending")
      .set("Authorization", "Bearer invalid.jwt.token");
    expect(resInvalid.status).toBe(401);
  });

  // 2. Role RENTER bị chặn khỏi Landlord & Admin APIs
  it("RENTER bị chặn 403 khi gọi API quản lý phòng của LANDLORD", async () => {
    const res = await request(app)
      .get("/api/landlord/listings")
      .set("Authorization", `Bearer ${renterToken}`);

    expect(res.status).toBe(403);
    expect(res.body.message).toContain("không có quyền");
  });

  it("RENTER bị chặn 403 khi gọi API duyệt tin của ADMIN", async () => {
    const res = await request(app)
      .get("/api/admin/listings/pending")
      .set("Authorization", `Bearer ${renterToken}`);

    expect(res.status).toBe(403);
    expect(res.body.message).toContain("không có quyền");
  });

  // 3. Role LANDLORD bị chặn khỏi Admin APIs nhưng được vào Landlord APIs
  it("LANDLORD bị chặn 403 khi gọi API của ADMIN", async () => {
    const res = await request(app)
      .get("/api/admin/listings/pending")
      .set("Authorization", `Bearer ${landlordToken}`);

    expect(res.status).toBe(403);
    expect(res.body.message).toContain("không có quyền");
  });

  it("LANDLORD được phép 200 khi truy cập API của LANDLORD", async () => {
    mockPrisma.listing.count.mockResolvedValueOnce(0);
    mockPrisma.listing.findMany.mockResolvedValueOnce([]);

    const res = await request(app)
      .get("/api/landlord/listings")
      .set("Authorization", `Bearer ${landlordToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
  });

  // 4. Role ADMIN được phép truy cập Admin APIs
  it("ADMIN được phép 200 khi truy cập API duyệt tin chờ của ADMIN", async () => {
    mockPrisma.listing.count.mockResolvedValueOnce(1);
    mockPrisma.listing.findMany.mockResolvedValueOnce([
      {
        id: "listing-pending-1",
        title: "Phòng chờ duyệt",
        status: "PENDING_APPROVAL",
        images: [],
        landlord: {
          id: "landlord-1",
          fullName: "Chủ nhà A",
          landlordProfile: { verificationStatus: "VERIFIED" },
          verificationRequests: [],
        },
      },
    ]);

    const res = await request(app)
      .get("/api/admin/listings/pending")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].id).toBe("listing-pending-1");
  });
});
