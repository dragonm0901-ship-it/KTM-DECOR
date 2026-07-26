import { createClient } from "redis";
import { Redis } from "@upstash/redis";

let redisClient = null;
let upstashRedis = null;
const memoryCache = new Map();
const trackedKeys = new Set(); // Registry to track keys without using disabled Redis KEYS command

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
 * Retrieve data from cache (Memory first -> Redis second -> null).
 */
export const cacheGet = async (key) => {
  // 1. Check ultra-fast local Memory Cache first (0ms latency)
  const cachedItem = memoryCache.get(key);
  if (cachedItem) {
    if (Date.now() <= cachedItem.expiry) {
      return cachedItem.value;
    }
    memoryCache.delete(key);
    trackedKeys.delete(key);
  }

  // 2. Try Upstash Redis next
  if (upstashRedis) {
    try {
      const val = await upstashRedis.get(key);
      if (val !== null && val !== undefined) {
        const parsed = typeof val === "string" ? JSON.parse(val) : val;
        // Populate local memory cache for instant subsequent reads
        memoryCache.set(key, {
          value: parsed,
          expiry: Date.now() + 300 * 1000, // 5 mins local TTL
        });
        trackedKeys.add(key);
        return parsed;
      }
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
          expiry: Date.now() + 300 * 1000,
        });
        trackedKeys.add(key);
        return parsed;
      }
    } catch (err) {
      console.error(`Redis get error for key "${key}":`, err.message);
    }
  }

  return null;
};

/**
 * Store data in cache with TTL.
 */
export const cacheSet = async (key, value, ttlSeconds = 3600) => {
  // 1. Always update local memory cache
  memoryCache.set(key, {
    value,
    expiry: Date.now() + ttlSeconds * 1000,
  });
  trackedKeys.add(key);

  // 2. Store in Upstash Redis if available
  if (upstashRedis) {
    try {
      await upstashRedis.set(key, JSON.stringify(value), {
        ex: ttlSeconds,
      });
      // Store in Upstash registry set for pattern invalidation without KEYS command
      await upstashRedis.sadd("ktm_cache_keys_registry", key).catch(() => null);
    } catch (err) {
      console.error(`Upstash set error for key "${key}":`, err.message);
    }
  }

  // 3. Store in Standard TCP Redis if available
  if (redisClient && redisClient.isOpen) {
    try {
      await redisClient.set(key, JSON.stringify(value), {
        EX: ttlSeconds,
      });
      await redisClient.sAdd("ktm_cache_keys_registry", key).catch(() => null);
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
  trackedKeys.delete(key);

  if (upstashRedis) {
    try {
      await upstashRedis.del(key);
      await upstashRedis.srem("ktm_cache_keys_registry", key).catch(() => null);
    } catch (err) {
      console.error(`Upstash delete error for key "${key}":`, err.message);
    }
  }

  if (redisClient && redisClient.isOpen) {
    try {
      await redisClient.del(key);
      await redisClient.sRem("ktm_cache_keys_registry", key).catch(() => null);
    } catch (err) {
      console.error(`Redis delete error for key "${key}":`, err.message);
    }
  }
};

/**
 * Delete keys matching a wildcard pattern (e.g. "bootstrap:*").
 * Uses tracked keys registry to prevent "KEYS command disabled" errors in Upstash.
 */
export const cacheDeletePattern = async (pattern) => {
  const regex = new RegExp("^" + pattern.replace(/\*/g, ".*") + "$");

  // 1. Clear local memory cache matching pattern
  const matchedKeys = new Set();
  for (const key of trackedKeys) {
    if (regex.test(key)) {
      matchedKeys.add(key);
    }
  }
  for (const key of memoryCache.keys()) {
    if (regex.test(key)) {
      matchedKeys.add(key);
    }
  }

  matchedKeys.forEach((key) => {
    memoryCache.delete(key);
    trackedKeys.delete(key);
  });

  // 2. Clear Upstash Redis matching pattern via tracked registry
  if (upstashRedis) {
    try {
      const registeredKeys = await upstashRedis.smembers("ktm_cache_keys_registry").catch(() => []);
      const keysToDelete = (registeredKeys || []).filter((k) => regex.test(k));
      if (keysToDelete.length > 0) {
        await upstashRedis.del(...keysToDelete);
        await upstashRedis.srem("ktm_cache_keys_registry", ...keysToDelete);
        console.log(`⚡ Cleared ${keysToDelete.length} cached keys matching pattern "${pattern}" from Upstash Redis.`);
      }
    } catch (err) {
      console.error(`Upstash delete pattern error for "${pattern}":`, err.message);
    }
  }

  // 3. Clear Standard TCP Redis matching pattern via tracked registry
  if (redisClient && redisClient.isOpen) {
    try {
      const registeredKeys = await redisClient.sMembers("ktm_cache_keys_registry").catch(() => []);
      const keysToDelete = (registeredKeys || []).filter((k) => regex.test(k));
      if (keysToDelete.length > 0) {
        await redisClient.del(keysToDelete);
        await redisClient.sRem("ktm_cache_keys_registry", keysToDelete);
        console.log(`⚡ Cleared ${keysToDelete.length} cached keys matching pattern "${pattern}" from TCP Redis.`);
      }
    } catch (err) {
      console.error(`Redis delete pattern error for "${pattern}":`, err.message);
    }
  }
};
