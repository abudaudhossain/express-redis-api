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

export async function findProductById(id) {
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
    WHERE id = $1
  `;
    const { rows } = await pool.query(query, [id]);
    return rows[0];
}

export async function createProduct({ name, description, price, stock }) {
    const query = `
    INSERT INTO products (name, description, price, stock, is_active)
    VALUES ($1, $2, $3, $4, TRUE)
    RETURNING *
  `;
    const { rows } = await pool.query(query, [name, description, price, stock]);
    return rows[0];
}

export async function updateProduct(id, { name, description, price, stock }) {
    const query = `
    UPDATE products
    SET name = $1,
        description = $2,
        price = $3,
        stock = $4,
        updated_at = NOW()
    WHERE id = $5
    RETURNING *
  `;
    const { rows } = await pool.query(query, [name, description, price, stock, id]);
    return rows[0];
}

export async function deleteProduct(id) {
    const query = `
    DELETE FROM products
    WHERE id = $1
  `;
    await pool.query(query, [id]);
}