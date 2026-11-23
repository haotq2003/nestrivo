import { describe, it, expect, vi, beforeEach } from "vitest";
import express from "express";
import request from "supertest";

const { mockRedisLib } = vi.hoisted(() => ({
  mockRedisLib: {
    getCache: vi.fn(),
    setCache: vi.fn(),
    invalidateCacheByPrefix: vi.fn(),
  },
}));

vi.mock("../src/lib/redis.js", () => mockRedisLib);

import {
  cacheResponse,
  invalidateCacheOnSuccess,
} from "../src/middleware/cache.middleware.js";

describe("Redis Cache Middleware", () => {
  let testApp;
  let dbQueryMock;

  beforeEach(() => {
    vi.clearAllMocks();
    dbQueryMock = vi.fn().mockResolvedValue({ success: true, data: [{ id: "room-1" }] });

    testApp = express();
    testApp.use(express.json());

    testApp.get("/api/listings", cacheResponse("listings", 180), async (req, res) => {
      const result = await dbQueryMock();
      return res.status(200).json(result);
    });

    testApp.post("/api/landlord/listings", invalidateCacheOnSuccess("listings"), (req, res) => {
      if (!req.body.title) {
        return res.status(400).json({ message: "Thiếu tiêu đề" });
      }
      return res.status(201).json({ success: true, title: req.body.title });
    });
  });

  it("Cache MISS - Gọi DB, lưu kết quả vào Redis và trả header X-Cache: MISS", async () => {
    mockRedisLib.getCache.mockResolvedValueOnce(null);
    mockRedisLib.setCache.mockResolvedValueOnce(true);

    const res = await request(testApp).get("/api/listings?city=HCM");

    expect(res.status).toBe(200);
    expect(res.headers["x-cache"]).toBe("MISS");
    expect(res.body.data).toEqual([{ id: "room-1" }]);
    expect(dbQueryMock).toHaveBeenCalledTimes(1);
    expect(mockRedisLib.setCache).toHaveBeenCalledWith(
      "nestrivo:listings:/api/listings?city=HCM",
      { success: true, data: [{ id: "room-1" }] },
      180
    );
  });

  it("Cache HIT - Trả thẳng dữ liệu từ Redis, không query DB và trả header X-Cache: HIT", async () => {
    mockRedisLib.getCache.mockResolvedValueOnce({
      success: true,
      data: [{ id: "room-cached" }],
    });

    const res = await request(testApp).get("/api/listings?city=HCM");

    expect(res.status).toBe(200);
    expect(res.headers["x-cache"]).toBe("HIT");
    expect(res.body.data).toEqual([{ id: "room-cached" }]);
    expect(dbQueryMock).not.toHaveBeenCalled();
  });

  it("Graceful Fallback - Nếu Redis lỗi vẫn chạy thẳng xuống DB bình thường", async () => {
    mockRedisLib.getCache.mockRejectedValueOnce(new Error("Redis connection refused"));
    mockRedisLib.setCache.mockRejectedValueOnce(new Error("Redis connection refused"));

    const res = await request(testApp).get("/api/listings");

    expect(res.status).toBe(200);
    expect(res.headers["x-cache"]).toBe("MISS");
    expect(dbQueryMock).toHaveBeenCalledTimes(1);
  });

  it("Cache Invalidation - Tự động xóa cache khi tạo/sửa phòng thành công (201)", async () => {
    mockRedisLib.invalidateCacheByPrefix.mockResolvedValueOnce(3);

    const res = await request(testApp)
      .post("/api/landlord/listings")
      .send({ title: "Phòng mới" });

    expect(res.status).toBe(201);
    expect(mockRedisLib.invalidateCacheByPrefix).toHaveBeenCalledWith("listings");
  });

  it("Cache Invalidation - Không xóa cache nếu request mutation lỗi (400)", async () => {
    const res = await request(testApp).post("/api/landlord/listings").send({});

    expect(res.status).toBe(400);
    expect(mockRedisLib.invalidateCacheByPrefix).not.toHaveBeenCalled();
  });
});
