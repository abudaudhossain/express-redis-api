import { pool } from "../../config/database.js";

export async function findActiveProducts({ limit, offset }) {
    const query = `
    SELECT
      id,
      name,
      description,
      price::text AS price,
      stock,
      is_active,
      created_at,
      updated_at
    FROM products
    WHERE is_active = TRUE
    ORDER BY created_at DESC, id DESC
    LIMIT $1 OFFSET $2
  `;
    const startTime = Date.now();
    const { rows } = await pool.query(query, [limit, offset]);
    const duration = Date.now() - startTime;
    console.info(`Executed query in ${duration}ms: ${query}`);
    console.log("==================================")

    return rows;
}

export async function countActiveProducts() {
    const query = `
    SELECT COUNT(*)::text AS total
    FROM products
    WHERE is_active = TRUE
  `;

    const { rows } = await pool.query(query);

    return rows[0].total;
}