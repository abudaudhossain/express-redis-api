const redis = require('../config/redis');
const productRepository = require('../repositories/product.repositories');

const CACHE_KEY="products:list:1";
const CACHE_TTL = Number(process.env.CACHE_TTL_SECONDS || 60)

async function getAllProducts() {
  // 1. Try reading the cache.
  try {
    const cachedData = await redis.get(CACHE_KEY);

    if (cachedData !== null) {
      return {
        data: JSON.parse(cachedData),
        cache: "HIT",
      };
    }
  } catch (error) {
    // Cache failure should not prevent the database read.
    console.error("[Cache] Read failed:", error.message);
  }

  // 2. Cache miss (or Redis read failure): query the database.
  const products = await productRepository.findAll();

  // 3. Save the result in Redis with a TTL.
  try {
    await redis.set(
      CACHE_KEY,
      JSON.stringify(products),
      "EX",
      CACHE_TTL
    );
  } catch (error) {
    console.error("[Cache] Write failed:", error.message);
  }

  return {
    data: products,
    cache: "MISS",
  };
}

module.exports = {
  getAllProducts,
};