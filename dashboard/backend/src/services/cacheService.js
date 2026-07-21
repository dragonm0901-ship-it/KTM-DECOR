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
      console.log("Connected to Upstash Redis cache successfully.");
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
      console.log("Connected to Redis cache successfully.");
      return;
    } catch (err) {
      console.error("Failed to connect to Redis. Falling back to in-memory cache:", err.message);
      redisClient = null;
    }
  }

  console.log("Using high-performance in-memory cache layer.");
};

/**
 * Retrieve data from the cache.
 */
export const cacheGet = async (key) => {
  // 1. Try Upstash Redis first
  if (upstashRedis) {
    try {
      const val = await upstashRedis.get(key);
      if (val !== null && val !== undefined) {
        return typeof val === "string" ? JSON.parse(val) : val;
      }
      return null;
    } catch (err) {
      console.error(`Upstash get error for key "${key}":`, err.message);
    }
  }

  // 2. Try Standard TCP Redis next
  if (redisClient && redisClient.isOpen) {
    try {
      const val = await redisClient.get(key);
      return val ? JSON.parse(val) : null;
    } catch (err) {
      console.error(`Redis get error for key "${key}":`, err.message);
    }
  }

  // 3. Fallback to In-Memory Cache
  const cachedItem = memoryCache.get(key);
  if (cachedItem) {
    if (Date.now() > cachedItem.expiry) {
      memoryCache.delete(key);
      return null;
    }
    return cachedItem.value;
  }
  return null;
};

/**
 * Store data in the cache with a specified Time-to-Live (TTL) in seconds.
 */
export const cacheSet = async (key, value, ttlSeconds = 3600) => {
  // Always update in-memory cache for fast local reads
  memoryCache.set(key, {
    value,
    expiry: Date.now() + ttlSeconds * 1000,
  });

  // Try Upstash Redis
  if (upstashRedis) {
    try {
      await upstashRedis.set(key, JSON.stringify(value), {
        ex: ttlSeconds,
      });
      return;
    } catch (err) {
      console.error(`Upstash set error for key "${key}":`, err.message);
    }
  }

  // Try Standard TCP Redis
  if (redisClient && redisClient.isOpen) {
    try {
      await redisClient.set(key, JSON.stringify(value), {
        EX: ttlSeconds,
      });
      return;
    } catch (err) {
      console.error(`Redis set error for key "${key}":`, err.message);
    }
  }
};

/**
 * Delete a specific key from the cache.
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
 */
export const cacheDeletePattern = async (pattern) => {
  // 1. Invalidate in-memory cache matching pattern
  const regex = new RegExp("^" + pattern.replace(/\*/g, ".*") + "$");
  let memoryCount = 0;
  for (const key of memoryCache.keys()) {
    if (regex.test(key)) {
      memoryCache.delete(key);
      memoryCount++;
    }
  }

  // 2. Invalidate Upstash Redis matching pattern
  if (upstashRedis) {
    try {
      const keys = await upstashRedis.keys(pattern);
      if (Array.isArray(keys) && keys.length > 0) {
        await upstashRedis.del(...keys);
        console.log(`Cleared ${keys.length} cached keys matching pattern "${pattern}" from Upstash Redis.`);
      }
    } catch (err) {
      console.error(`Upstash delete pattern error for "${pattern}":`, err.message);
    }
  }

  // 3. Invalidate Standard Redis matching pattern
  if (redisClient && redisClient.isOpen) {
    try {
      const keys = await redisClient.keys(pattern);
      if (Array.isArray(keys) && keys.length > 0) {
        await redisClient.del(keys);
        console.log(`Cleared ${keys.length} cached keys matching pattern "${pattern}" from TCP Redis.`);
      }
    } catch (err) {
      console.error(`Redis delete pattern error for "${pattern}":`, err.message);
    }
  }
};
