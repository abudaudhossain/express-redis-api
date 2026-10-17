require('dotenv').config();

const express = require('express')
const redis = require('./config/redis')
const productRoutes = require("./routes/product.routes");


const app = express()

app.use((req, res,next)=>{
    req.time = new Date();
    next()
})


app.get('/health', (req, res)=>{
    res.status(200).json({
        status: "ok"
    })
})

app.use("/api/products", productRoutes);

app.use((err, req, res, next) => {
  console.error("[HTTP Error]", err.message);

  if (res.headersSent) {
    return next(err);
  }

  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
});

let server;

async function startServer() {
  await redis.connect();

  server = app.listen(process.env.PORT || 3000, () => {
    console.info("[Express] Server started");
  });
}

async function shutdown(signal) {
  console.info(`[App] Received ${signal}; shutting down`);

  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }

  if (redis.status === "ready") {
    await redis.quit();
  } else {
    redis.disconnect();
  }

  process.exit(0);
}

process.once("SIGTERM", () => shutdown("SIGTERM"));
process.once("SIGINT", () => shutdown("SIGINT"));

startServer().catch((error) => {
  console.error("[App] Startup failed:", error.message);
  process.exit(1);
});