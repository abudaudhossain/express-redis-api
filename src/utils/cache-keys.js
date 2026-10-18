import { cacheConfig } from "../config/cash.js";

export function productListCacheKey({ page, limit, version }) {
  return `${cacheConfig.productListKeyPrefix}:v:${version}:page:${page}:limit:${limit}`;
}
