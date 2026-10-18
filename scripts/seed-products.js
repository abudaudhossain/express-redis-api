import { faker } from "@faker-js/faker";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const TOTAL_PRODUCTS = Number(process.argv[2] ?? 100_000);
const BATCH_SIZE = 1_000;

async function seedProducts() {
  try {
    console.time("Fake product seeding");

    for (let start = 0; start < TOTAL_PRODUCTS; start += BATCH_SIZE) {
      const batchSize = Math.min(
        BATCH_SIZE,
        TOTAL_PRODUCTS - start
      );

      const values = [];
      const placeholders = [];

      for (let i = 0; i < batchSize; i++) {
        const productNumber = start + i + 1;
        const offset = i * 7;

        const name = faker.commerce.productName();
        const description = faker.commerce.productDescription();
        const price = faker.number.float({
          min: 1,
          max: 10000,
          fractionDigits: 2,
        });
        const stock = faker.number.int({ min: 0, max: 1000 });
        const isActive = faker.datatype.boolean({ probability: 0.85 });
        const createdAt = faker.date.recent({ days: 365 });

        values.push(
          name,
          description,
          price,
          stock,
          isActive,
          createdAt,
          createdAt
        );

        const p = offset + 1;

        placeholders.push(
          `($${p}, $${p + 1}, $${p + 2}, $${p + 3}, ` +
          `$${p + 4}, $${p + 5}, $${p + 6})`
        );
      }

      await pool.query(
        `
          INSERT INTO products (
            name,
            description,
            price,
            stock,
            is_active,
            created_at,
            updated_at
          )
          VALUES ${placeholders.join(", ")}
        `,
        values
      );

      console.log(
        `Inserted ${start + batchSize} / ${TOTAL_PRODUCTS} products`
      );
    }

    console.timeEnd("Fake product seeding");
    console.log(`Successfully seeded ${TOTAL_PRODUCTS} fake products.`);
  } catch (error) {
    console.error("Seeding failed:", error.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

seedProducts();