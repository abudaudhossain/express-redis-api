import { cacheConfig } from "../config/cash.js";

export function productListCacheKey({ page, limit }) {
  return `${cacheConfig.productListKeyPrefix}:page:${page}:limit:${limit}`;
}