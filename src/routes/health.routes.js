import { Router } from "express";
import { redisClient } from "../infrastructure/redis/redis.client.js";

const router = Router();

router.get("/live", (_req, res) => {
  res.status(200).json({
    status: "ok",
    service: "express-redis-api",
  });
});

router.get("/ready", (_req, res) => {
  const redisReady = redisClient.isReady;

  const status = redisReady ? 200 : 503;

  res.status(status).json({
    status: redisReady ? "ready" : "not_ready",
    dependencies: {
      redis: redisReady ? "connected" : "unavailable",
    },
  });
});

export default router;