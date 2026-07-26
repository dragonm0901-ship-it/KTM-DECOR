import { createClient } from "redis";
import { Redis } from "@upstash/redis";

let redisClient = null;
let upstashRedis = null;
const memoryCache = new Map();

/**
 * Initialize cache connection (Upstash Redis, standard Redis, or fallback to In-Memory).
 */
export const initCache = async () => {
  const upstashUrl = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;

  if (upstashUrl && upstashToken) {
    try {
      upstashRedis = new Redis({
        url: upstashUrl,
        token: upstashToken,
      });
      // Verification ping/get
      await upstashRedis.get("__healthcheck__").catch(() => null);
      console.log("⚡ Connected to Upstash Redis cache successfully.");
      return;
    } catch (err) {
      console.error("Failed to connect to Upstash Redis:", err.message);
      upstashRedis = null;
    }
  }

  if (process.env.REDIS_URL) {
    try {
      redisClient = createClient({
        url: process.env.REDIS_URL,
        socket: {
          reconnectStrategy: (retries) => {
            if (retries > 5) {
              console.warn("Redis connection retry limit reached. Continuing with memory cache.");
              return new Error("Retry limit reached");
            }
            return Math.min(retries * 500, 2000);
          }
        }
      });
      redisClient.on("error", (err) => console.error("Redis Client Error:", err.message));
      await redisClient.connect();
      console.log("⚡ Connected to TCP Redis cache successfully.");
      return;
    } catch (err) {
      console.error("Failed to connect to Redis. Falling back to in-memory cache:", err.message);
      redisClient = null;
    }
  }

  console.log("⚡ Using high-performance in-memory cache layer.");
};

/**
 * Retrieve data from cache.
 * Uses a 5-second local memory cache TTL to allow fast burst reads while ensuring 
 * Upstash/Redis invalidation takes effect immediately across all instances.
 */
export const cacheGet = async (key) => {
  // 1. Check ultra-fast local Memory Cache (5-second burst window)
  const cachedItem = memoryCache.get(key);
  if (cachedItem && Date.now() <= cachedItem.expiry) {
    return cachedItem.value;
  }

  // 2. Try Upstash Redis next
  if (upstashRedis) {
    try {
      const val = await upstashRedis.get(key);
      if (val !== null && val !== undefined) {
        const parsed = typeof val === "string" ? JSON.parse(val) : val;
        // Store in short-lived local memory cache (5 seconds)
        memoryCache.set(key, {
          value: parsed,
          expiry: Date.now() + 5000,
        });
        return parsed;
      }
      // If Upstash returned null (cache miss / invalidated), clear memory cache as well
      memoryCache.delete(key);
      return null;
    } catch (err) {
      console.error(`Upstash get error for key "${key}":`, err.message);
    }
  }

  // 3. Try Standard TCP Redis
  if (redisClient && redisClient.isOpen) {
    try {
      const val = await redisClient.get(key);
      if (val) {
        const parsed = JSON.parse(val);
        memoryCache.set(key, {
          value: parsed,
          expiry: Date.now() + 5000,
        });
        return parsed;
      }
      memoryCache.delete(key);
      return null;
    } catch (err) {
      console.error(`Redis get error for key "${key}":`, err.message);
    }
  }

  return null;
};

/**
 * Store data in cache with TTL (default 1 hour).
 */
export const cacheSet = async (key, value, ttlSeconds = 3600) => {
  // Always update local memory cache
  memoryCache.set(key, {
    value,
    expiry: Date.now() + 5000,
  });

  // Store in Upstash Redis
  if (upstashRedis) {
    try {
      await upstashRedis.set(key, JSON.stringify(value), {
        ex: ttlSeconds,
      });
    } catch (err) {
      console.error(`Upstash set error for key "${key}":`, err.message);
    }
  }

  // Store in Standard TCP Redis
  if (redisClient && redisClient.isOpen) {
    try {
      await redisClient.set(key, JSON.stringify(value), {
        EX: ttlSeconds,
      });
    } catch (err) {
      console.error(`Redis set error for key "${key}":`, err.message);
    }
  }
};

/**
 * Delete a specific key from cache.
 */
export const cacheDelete = async (key) => {
  memoryCache.delete(key);

  if (upstashRedis) {
    try {
      await upstashRedis.del(key);
    } catch (err) {
      console.error(`Upstash delete error for key "${key}":`, err.message);
    }
  }

  if (redisClient && redisClient.isOpen) {
    try {
      await redisClient.del(key);
    } catch (err) {
      console.error(`Redis delete error for key "${key}":`, err.message);
    }
  }
};

/**
 * Delete keys matching a wildcard pattern (e.g. "bootstrap:*").
 * Uses SCAN to reliably delete keys from Upstash Redis, TCP Redis, and Memory Cache.
 */
export const cacheDeletePattern = async (pattern) => {
  // 1. Clear local memory cache matching pattern
  const prefix = pattern.replace(/\*/g, "");
  for (const key of memoryCache.keys()) {
    if (key.startsWith(prefix) || key.includes(prefix)) {
      memoryCache.delete(key);
    }
  }

  // 2. Clear Upstash Redis using SCAN iterator (100% supported by Upstash REST API)
  if (upstashRedis) {
    try {
      let cursor = 0;
      let deletedCount = 0;
      do {
        const res = await upstashRedis.scan(cursor, { match: pattern, count: 100 }).catch(() => null);
        if (!res) break;

        const nextCursor = Array.isArray(res) ? res[0] : res.cursor;
        const keys = Array.isArray(res) ? res[1] : res.keys;

        cursor = Number(nextCursor) || 0;

        if (Array.isArray(keys) && keys.length > 0) {
          await upstashRedis.del(...keys).catch(() => null);
          deletedCount += keys.length;
        }
      } while (cursor !== 0);

      if (deletedCount > 0) {
        console.log(`⚡ Cleared ${deletedCount} cached keys matching pattern "${pattern}" from Upstash Redis.`);
      }
    } catch (err) {
      console.error(`Upstash scan delete error for "${pattern}":`, err.message);
    }
  }

  // 3. Clear Standard TCP Redis using scanIterator
  if (redisClient && redisClient.isOpen) {
    try {
      let deletedCount = 0;
      const keysToDelete = [];
      for await (const key of redisClient.scanIterator({ MATCH: pattern, COUNT: 100 })) {
        keysToDelete.push(key);
      }
      if (keysToDelete.length > 0) {
        await redisClient.del(keysToDelete);
        deletedCount = keysToDelete.length;
        console.log(`⚡ Cleared ${deletedCount} cached keys matching pattern "${pattern}" from TCP Redis.`);
      }
    } catch (err) {
      console.error(`Redis scan delete error for "${pattern}":`, err.message);
    }
  }
};
