import app from "./app.js";
import { env } from "./config/env.js";
import { redisClient } from "./infrastructure/redis/redis.client.js";
import { initializeProductCache } from "./modules/products/product-cache.service.js";

let server;

async function startServer() {
  try {
    // Connect to Redis before accepting requests.
    await redisClient.connect();
    await initializeProductCache();
    server = app.listen(env.PORT, () => {
      console.info(`API listening on port ${env.PORT}`);
      console.info(`Environment: ${env.NODE_ENV}`);
    });
  } catch (error) {
    console.error("Application startup failed:", error.message);

    if (redisClient.isOpen) {
      await redisClient.quit().catch(() => { });
    }

    process.exitCode = 1;
  }
}

async function shutdown(signal) {
  console.info(`${signal} received. Shutting down...`);

  if (server) {
    await new Promise((resolve) => {
      server.close(resolve);
    });
  }

  if (redisClient.isOpen) {
    await redisClient.quit().catch((error) => {
      console.error("Redis shutdown error:", error.message);
    });
  }
  
  process.exitCode = 1;
}

process.once("SIGINT", () => {
  void shutdown("SIGINT");
});

process.once("SIGTERM", () => {
  void shutdown("SIGTERM");
});

await startServer();