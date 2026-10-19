import { cacheConfig } from "../../config/cash.js";
import { redisClient } from "../../infrastructure/redis/redis.client.js";
import { productListCacheKey } from "../../utils/cache-keys.js";


const INITIAL_VERSION = 1;

export async function initializeProductCache() {
    await redisClient.set(cacheConfig.productListVersionKey, INITIAL_VERSION, { NX: true });
}

export async function getProductListCacheVersion() {
    const version = await redisClient.get(
        cacheConfig.productListVersionKey,
    );

    if (version === null) {
        throw new Error(
            "Product cache version is missing; initialize it before serving requests",
        );
    }
 
    return version;
}


export async function readProductListCache({ page, limit }) {
    if (!redisClient.isReady) {
        return null;
    }

    try {
        const version = await getProductListCacheVersion();
        const key = productListCacheKey({ page, limit, version });
        const value = await redisClient.get(key);

        if (value === null) {
            return null;
        }

        try {
            const parsed = JSON.parse(value);

            if (
                parsed &&
                Array.isArray(parsed.data) &&
                parsed.pagination
            ) {
                return parsed;
            }
        } catch {
            // Invalid JSON is treated as a cache miss.
        }

        await redisClient.del(key).catch(() => { });
        return null;
    } catch (error) {
        console.error("Product cache read failed:", error.message);
        return null;
    }
}

export async function writeProductListCache(
  { page, limit },
  response,
) {
  if (!redisClient.isReady) {
    return;
  }

  try {
    const version = await getProductListCacheVersion();
    const key = productListCacheKey({ page, limit, version });

    await redisClient.set(key, JSON.stringify(response), {
      EX: cacheConfig.productListTtlSeconds,
    });
  } catch (error) {
    console.error("Product cache write failed:", error.message);
  }
}


// Called only after the database mutation succeeds.
export async function invalidateProductListCache() {
  if (!redisClient.isReady) {
    console.error(
      "Product cache invalidation skipped: Redis is unavailable",
    );
    return false;
  }

  try {
    await redisClient.incr(cacheConfig.productListVersionKey);
    return true;
  } catch (error) {
    console.error(
      "Product cache invalidation failed:",
      error.message,
    );
    return false;
  }
}