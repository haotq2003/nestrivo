import {
  getCache,
  setCache,
  invalidateCacheByPrefix,
} from "../lib/redis.js";

/**
 * Middleware cache JSON response cho các GET API public
 * - Trả header X-Cache: HIT | MISS
 * - Tự động fallback về DB nếu Redis không khả dụng
 */
export function cacheResponse(prefix, ttlSeconds = 300) {
  return async (req, res, next) => {
    if (req.method !== "GET") return next();

    const cacheKey = `nestrivo:${prefix}:${req.originalUrl}`;

    try {
      const cached = await getCache(cacheKey);
      if (cached !== null) {
        res.set("X-Cache", "HIT");
        return res.status(200).json(cached);
      }
    } catch {
      // Fallback an toàn xuống DB
    }

    res.set("X-Cache", "MISS");

    const originalJson = res.json.bind(res);
    res.json = (body) => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        setCache(cacheKey, body, ttlSeconds).catch(() => {});
      }
      return originalJson(body);
    };

    return next();
  };
}

/**
 * Middleware tự động xóa cache theo prefix sau khi mutation (POST/PUT/PATCH/DELETE) thành công (2xx)
 */
export function invalidateCacheOnSuccess(...prefixes) {
  return (req, res, next) => {
    res.on("finish", () => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        Promise.all(
          prefixes.map((prefix) => invalidateCacheByPrefix(prefix))
        ).catch(() => {});
      }
    });
    return next();
  };
}
