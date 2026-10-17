const express = require("express");
const { getAllProducts } = require("../services/product.service");

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const result = await getAllProducts();  

    res.set("X-Cache", result.cache);

    console.log("Time: ", new Date - req.time,"ms")
    return res.status(200).json({
      success: true,
      data: result.data,
      cache: result.cache,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;