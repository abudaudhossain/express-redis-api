import { createClient } from "redis";
import { env } from "../../config/env.js";

export const redisClient = createClient({
    url: env.REDIS_URL,

    socket:{
        connectTimeout: 5000,
        reconnectStrategy(retries){
            if(retries > 5){
                return new Error("Redis reconnect limit exceeded");
            }
            return Math.min(retries * 200, 1000)
        }
    }
})


redisClient.on("error", (error) => {
  console.error("Redis client error:", error.message);
});

redisClient.on("connect", () => {
  console.info("Redis socket connected");
});

redisClient.on("ready", () => {
  console.info("Redis client ready");
});

redisClient.on("reconnecting", () => {
  console.warn("Redis reconnecting...");
});

redisClient.on("end", () => {
  console.info("Redis connection closed");
});