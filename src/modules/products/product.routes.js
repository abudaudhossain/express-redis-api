import { Router } from "express";
import { listProducts } from "./product.controller.js";

const router = Router();

router.get("/", listProducts);

export default router;