import PG from "pg";
import { env } from "./env.js";


const {Pool} = PG;

export const pool = new Pool({
    connectionString: env.DATABASE_URL,
    max: 10,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 5_000,
    application_name: "express-redis-api",
})

pool.on("error", (err) => {
    console.error("Unexpected error on idle client", err);
    process.exit(-1);
})