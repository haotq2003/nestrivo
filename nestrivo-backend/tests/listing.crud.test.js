import { describe, it, expect, vi, beforeAll, beforeEach } from "vitest";
import request from "supertest";
import jwt from "jsonwebtoken";

const { mockPrisma } = vi.hoisted(() => ({
  mockPrisma: {
    listing: {
      create: vi.fn(),
      count: vi.fn(),
      findMany: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    amenity: {
      findMany: vi.fn(),
      upsert: vi.fn(),
    },
    listingImage: {
      deleteMany: vi.fn(),
      createMany: vi.fn(),
    },
    listingAmenity: {
      deleteMany: vi.fn(),
      createMany: vi.fn(),
    },
    listingFee: {
      deleteMany: vi.fn(),
      createMany: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

vi.mock("../src/lib/prisma.js", () => ({
  prisma: mockPrisma,
}));

import app from "../src/app.js";

describe("Landlord Listing CRUD API", () => {
  const TEST_SECRET = "nestrivo-vitest-secret-key";
  let landlordToken;

  const validPayload = {
    title: "Phòng Studio Full Nội Thất Quận 7",
    description: "Phòng mới xây, ban công thoáng mát, gần đại học Tôn Đức Thắng.",
    propertyType: "STUDIO",
    price: 4500000,
    deposit: 4500000,
    area: 28,
    bedrooms: 1,
    bathrooms: 1,
    maxOccupants: 2,
    address: "123 Nguyễn Hữu Thọ",
    ward: "Tân Phong",
    district: "Quận 7",
    city: "Hồ Chí Minh",
    submitForReview: false,
    images: ["https://example.com/room-1.jpg"],
    amenityIds: [],
    fees: [
      { type: "ELECTRICITY", amount: 3800, unit: "PER_KWH" },
      { type: "WATER", amount: 100000, unit: "PER_PERSON" },
    ],
  };

  beforeAll(() => {
    process.env.JWT_SECRET = TEST_SECRET;
    landlordToken = jwt.sign(
      { userId: "landlord-1", roles: ["RENTER", "LANDLORD"] },
      TEST_SECRET,
      { expiresIn: "1h" }
    );
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // 1. CREATE
  it("POST /api/landlord/listings - Báo lỗi 400 nếu thiếu trường bắt buộc", async () => {
    const res = await request(app)
      .post("/api/landlord/listings")
      .set("Authorization", `Bearer ${landlordToken}`)
      .send({ title: "Chỉ có tiêu đề" });

    expect(res.status).toBe(400);
    expect(res.body.message).toContain("không được để trống");
  });

  it("POST /api/landlord/listings - Báo lỗi 400 nếu giá thuê <= 0", async () => {
    const res = await request(app)
      .post("/api/landlord/listings")
      .set("Authorization", `Bearer ${landlordToken}`)
      .send({ ...validPayload, price: -100000 });

    expect(res.status).toBe(400);
    expect(res.body.message).toContain("Giá thuê phòng phải là số lớn hơn 0");
  });

  it("POST /api/landlord/listings - Tạo tin nháp (DRAFT) thành công trả về 201", async () => {
    const createdMock = {
      id: "listing-new-1",
      landlordId: "landlord-1",
      title: validPayload.title,
      propertyType: "STUDIO",
      price: 4500000,
      area: 28,
      status: "DRAFT",
      images: [{ imageUrl: "https://example.com/room-1.jpg", sortOrder: 0 }],
      amenities: [],
      fees: validPayload.fees,
    };

    mockPrisma.listing.create.mockResolvedValueOnce(createdMock);

    const res = await request(app)
      .post("/api/landlord/listings")
      .set("Authorization", `Bearer ${landlordToken}`)
      .send(validPayload);

    expect(res.status).toBe(201);
    expect(res.body.listing.id).toBe("listing-new-1");
    expect(res.body.listing.status).toBe("DRAFT");
    expect(res.body.listing.thumbnailUrl).toBe("https://example.com/room-1.jpg");
    expect(mockPrisma.listing.create).toHaveBeenCalledTimes(1);
  });

  // 2. READ
  it("GET /api/landlord/listings - Lấy danh sách phòng của chủ nhà thành công", async () => {
    mockPrisma.listing.count.mockResolvedValueOnce(1);
    mockPrisma.listing.findMany.mockResolvedValueOnce([
      {
        id: "listing-1",
        landlordId: "landlord-1",
        title: "Phòng Studio Quận 7",
        price: 4500000,
        status: "PUBLISHED",
        images: [{ imageUrl: "https://example.com/room-1.jpg" }],
        promotions: [],
        _count: { favorites: 3, inquiries: 2 },
      },
    ]);

    const res = await request(app)
      .get("/api/landlord/listings?page=1&limit=10")
      .set("Authorization", `Bearer ${landlordToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].id).toBe("listing-1");
    expect(res.body.pagination.totalItems).toBe(1);
  });

  // 3. UPDATE
  it("PUT /api/landlord/listings/:id - Trả về 404 nếu phòng không tồn tại hoặc không thuộc chủ nhà", async () => {
    mockPrisma.listing.findFirst.mockResolvedValueOnce(null);

    const res = await request(app)
      .put("/api/landlord/listings/listing-not-owned")
      .set("Authorization", `Bearer ${landlordToken}`)
      .send({ title: "Tiêu đề cập nhật mới" });

    expect(res.status).toBe(404);
    expect(res.body.message).toContain("Không tìm thấy tin đăng");
  });

  it("PUT /api/landlord/listings/:id - Cập nhật tiêu đề và giá phòng thành công", async () => {
    mockPrisma.listing.findFirst.mockResolvedValueOnce({
      id: "listing-1",
      landlordId: "landlord-1",
      status: "DRAFT",
    });

    const updatedMock = {
      id: "listing-1",
      landlordId: "landlord-1",
      title: "Phòng Studio Quận 7 (Đã giảm giá)",
      price: 4200000,
      status: "DRAFT",
      images: [],
      amenities: [],
      fees: [],
    };

    mockPrisma.$transaction.mockImplementationOnce(async (callback) => {
      mockPrisma.listing.update.mockResolvedValueOnce(updatedMock);
      return callback(mockPrisma);
    });

    const res = await request(app)
      .put("/api/landlord/listings/listing-1")
      .set("Authorization", `Bearer ${landlordToken}`)
      .send({ title: "Phòng Studio Quận 7 (Đã giảm giá)", price: 4200000 });

    expect(res.status).toBe(200);
    expect(res.body.listing.title).toBe("Phòng Studio Quận 7 (Đã giảm giá)");
    expect(res.body.listing.price).toBe(4200000);
  });

  // 4. DELETE
  it("DELETE /api/landlord/listings/:id - Xóa tin nháp (DRAFT) thành công", async () => {
    mockPrisma.listing.findFirst.mockResolvedValueOnce({
      id: "listing-draft-1",
      landlordId: "landlord-1",
      status: "DRAFT",
    });
    mockPrisma.listing.delete.mockResolvedValueOnce({ id: "listing-draft-1" });

    const res = await request(app)
      .delete("/api/landlord/listings/listing-draft-1")
      .set("Authorization", `Bearer ${landlordToken}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toContain("Đã xóa tin đăng thành công");
    expect(mockPrisma.listing.delete).toHaveBeenCalledWith({
      where: { id: "listing-draft-1" },
    });
  });

  it("DELETE /api/landlord/listings/:id - Chặn xóa (400) nếu tin đang ở trạng thái PUBLISHED", async () => {
    mockPrisma.listing.findFirst.mockResolvedValueOnce({
      id: "listing-pub-1",
      landlordId: "landlord-1",
      status: "PUBLISHED",
    });

    const res = await request(app)
      .delete("/api/landlord/listings/listing-pub-1")
      .set("Authorization", `Bearer ${landlordToken}`);

    expect(res.status).toBe(400);
    expect(res.body.message).toContain("Chỉ được phép xóa tin ở trạng thái Bản nháp");
    expect(mockPrisma.listing.delete).not.toHaveBeenCalled();
  });
});
