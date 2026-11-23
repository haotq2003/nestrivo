import Redis from "ioredis";

const REDIS_URL = process.env.REDIS_URL || "redis://127.0.0.1:6379";
const IS_TEST_ENV =
  process.env.NODE_ENV === "test" || Boolean(process.env.VITEST);

let isConnected = false;
let hasLoggedWarning = false;

export const redis = new Redis(REDIS_URL, {
  lazyConnect: true,
  maxRetriesPerRequest: 1,
  enableOfflineQueue: false,
  connectTimeout: 2000,
  retryStrategy: (times) => {
    // Trong dev nếu chưa bật Redis local thì dừng retry sau 2 lần để không spam log
    if (IS_TEST_ENV || times > 2) return null;
    return Math.min(times * 500, 2000);
  },
});

redis.on("ready", () => {
  isConnected = true;
  hasLoggedWarning = false;
  console.log("✅ [Redis] Connected and ready");
});

redis.on("close", () => {
  isConnected = false;
});

redis.on("error", () => {
  isConnected = false;
  if (!hasLoggedWarning && !IS_TEST_ENV) {
    hasLoggedWarning = true;
    console.warn(
      "⚠️ [Redis] Unavailable — falling back to PostgreSQL directly (set REDIS_URL or start Redis to enable caching)."
    );
  }
});

// Tự động kết nối nền khi chạy server (không kết nối trong unit test)
if (!IS_TEST_ENV) {
  redis.connect().catch(() => {
    // Đã xử lý ở event 'error'
  });
}

export function isRedisReady() {
  return isConnected && redis.status === "ready";
}

export async function getCache(key) {
  if (!isRedisReady()) return null;
  try {
    const raw = await redis.get(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export async function setCache(key, value, ttlSeconds = 300) {
  if (!isRedisReady()) return false;
  try {
    await redis.setex(key, ttlSeconds, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

/**
 * Xóa toàn bộ cache theo prefix dùng SCAN (an toàn trên production, không block Redis như KEYS)
 */
export async function invalidateCacheByPrefix(prefix) {
  if (!isRedisReady()) return 0;
  try {
    const pattern = `nestrivo:${prefix}:*`;
    let cursor = "0";
    let deletedCount = 0;

    do {
      const [nextCursor, keys] = await redis.scan(
        cursor,
        "MATCH",
        pattern,
        "COUNT",
        100
      );
      cursor = nextCursor;
      if (keys.length > 0) {
        await redis.del(...keys);
        deletedCount += keys.length;
      }
    } while (cursor !== "0");

    return deletedCount;
  } catch {
    return 0;
  }
}
