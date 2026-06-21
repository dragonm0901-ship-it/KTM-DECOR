import { createClient } from "redis";

let redisClient = null;
const memoryCache = new Map();

/**
 * Initialize cache connection (Redis if REDIS_URL is present, otherwise fallback to In-Memory).
 */
export const initCache = async () => {
  if (process.env.REDIS_URL) {
    try {
      redisClient = createClient({
        url: process.env.REDIS_URL,
        // Auto-reconnect configuration for production stability
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
    } catch (err) {
      console.error("Failed to connect to Redis. Falling back to in-memory cache:", err.message);
      redisClient = null;
    }
  } else {
    console.log("No REDIS_URL environment variable found. Using in-memory cache.");
  }
};

/**
 * Retrieve data from the cache.
 */
export const cacheGet = async (key) => {
  // Try Redis first
  if (redisClient && redisClient.isOpen) {
    try {
      const val = await redisClient.get(key);
      return val ? JSON.parse(val) : null;
    } catch (err) {
      console.error(`Redis get error for key "${key}":`, err.message);
    }
  }

  // Fallback to In-Memory Cache
  const cachedItem = memoryCache.get(key);
  if (cachedItem) {
    // Check if the cached item has expired
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
  // Try Redis first
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

  // Fallback to In-Memory Cache
  memoryCache.set(key, {
    value,
    expiry: Date.now() + ttlSeconds * 1000,
  });
};

/**
 * Delete a specific key from the cache.
 */
export const cacheDelete = async (key) => {
  if (redisClient && redisClient.isOpen) {
    try {
      await redisClient.del(key);
      return;
    } catch (err) {
      console.error(`Redis delete error for key "${key}":`, err.message);
    }
  }

  memoryCache.delete(key);
};

/**
 * Delete keys matching a wildcard pattern (e.g. "bootstrap:*").
 */
export const cacheDeletePattern = async (pattern) => {
  if (redisClient && redisClient.isOpen) {
    try {
      const keys = await redisClient.keys(pattern);
      if (keys.length > 0) {
        await redisClient.del(keys);
        console.log(`Cleared ${keys.length} cached keys matching pattern "${pattern}" from Redis.`);
      }
      return;
    } catch (err) {
      console.error(`Redis delete pattern error for "${pattern}":`, err.message);
    }
  }

  // Fallback to In-Memory Cache wildcard pattern matching
  // Convert standard wildcard pattern (e.g. "bootstrap:*") to regular expression
  const regex = new RegExp("^" + pattern.replace(/\*/g, ".*") + "$");
  let count = 0;
  for (const key of memoryCache.keys()) {
    if (regex.test(key)) {
      memoryCache.delete(key);
      count++;
    }
  }
  if (count > 0) {
    console.log(`Cleared ${count} cached keys matching pattern "${pattern}" from in-memory cache.`);
  }
};
