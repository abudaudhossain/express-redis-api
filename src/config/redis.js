const Redis = require('ioredis')


const redis = new Redis({
    host:process.env.REDIS_HOST || "127.0.0.1",
    port: Number(process.env.REDIS_PORT || 6379),

    retryStrategy(times){
        return Math.min(times*200, 2000)
    },

    maxRetriesPerRequest: 1,
    lazyConnect: true
})

redis.on('connect',()=>{
    console.info("[Redis] Connected")
})

redis.on("ready", () => {
  console.info("[Redis] Ready");
});

redis.on("error", (error) => {
  console.error("[Redis] Connection error:", error.message);
});

module.exports = redis;