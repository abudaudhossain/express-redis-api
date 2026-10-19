import { cacheConfig } from "../../config/cash.js";
import { redisClient } from "../../infrastructure/redis/redis.client.js";
import { readProductListCache , writeProductListCache, invalidateProductListCache} from "./product-cache.service.js";
import {
    countActiveProducts,
    findActiveProducts,
    createProduct
} from "./product.repository.js";


export async function getProducts({ page, limit }) {

   const cashed = await readProductListCache({ page, limit });

   if( cashed !== null) {
    return cashed;
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

   await writeProductListCache({ page, limit }, response);

    return response;
}

export async function addProduct(input){
    const product = await createProduct(input);

    await invalidateProductListCache();
    return product;
}