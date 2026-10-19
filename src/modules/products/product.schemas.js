const { z } = require("zod");

const productFields = {
    name: z.string().trim().min(1).max(200),
    description: z.string().trim().max(10_000).nullable(),
    price: z.coerce.number().finite().min(0).max(9999999999.99),
    stock: z.number().int().min(0).max(2147483647),
}

export const createProductSchema = z.object({
    name: productFields.name,
    description: productFields.description.optional(),
    price: productFields.price,
    stock: productFields.stock.optional().default(0),
});


export const updateProductSchema = z.object({
  name: productFields.name.optional(),
  description: productFields.description.optional(),
  price: productFields.price.optional(),
  stock: productFields.stock.optional(),
}).strict().refine(
  (value) => Object.keys(value).length > 0,
  { message: "At least one field must be provided" },
);

export const productIdSchema = z.string().regex(
  /^[1-9]\d*$/,
  "Product ID must be a positive integer",
);