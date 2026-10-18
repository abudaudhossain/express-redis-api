import { cacheConfig } from "../../config/cash.js";
import { redisClient } from "../../infrastructure/redis/redis.client.js";
import { productListCacheKey } from "../../utils/cache-keys.js";
import {
    countActiveProducts,
    findActiveProducts,
} from "./product.repository.js";


export async function getProducts({ page, limit }) {

    const cacheKey = productListCacheKey({ page, limit });

    if (redisClient.isReady) {
        try {
            const cachedValue = await redisClient.get(cacheKey);
            console.info(`Cache key: ${cacheKey}, Cached value: ${cachedValue}`);
            if (cachedValue !== null) {
                try {
                    const cachedResponse = JSON.parse(cachedValue);

                    if (
                        cachedResponse &&
                        Array.isArray(cachedResponse.data) &&
                        cachedResponse.pagination
                    ) {
                        return cachedResponse;
                    }

                    // Invalid cache data: discard and fetch fresh data.
                    await redisClient.del(cacheKey).catch(() => { });
                } catch {
                    await redisClient.del(cacheKey).catch(() => { });
                }
            }
        } catch (error) {
            console.error("Redis cache read failed:", error.message);
        }
    }

    const offset = (page - 1) * limit;

    const [products, total] = await Promise.all([
        findActiveProducts({ limit, offset }),
        countActiveProducts(),
    ]);

    const response = {
        data: products,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(Number(total) / limit),
        },
    };

    if (redisClient.isReady) {
        try {
            await redisClient.set(cacheKey, JSON.stringify(response), {
                EX: cacheConfig.productListTtlSeconds,
            });
        } catch (error) {
            console.error("Redis cache write failed:", error.message);
        }
    }

    return response;
}