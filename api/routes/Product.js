const express = require("express");
const productRoute = express.Router();
const asyncHandler = require("express-async-handler");
const Product = require("../models/Product");

const successHandler = require('../middleware/SuccessHandler');

/**
 * @swagger
 * /api/product:
 *   get:
 *     summary: Get a list of products
 *     description: Retrieve a list of products from the database.
 *     responses:
 *       200:
 *         description: Successful response with a list of products.
 */

productRoute.get(
  "/",
  asyncHandler(async (req, res, next) => {
    const { search, sort, sortBy, offset = 0, limit = 10 } = req.query;

    // Create a filter object for search
    const filter = search ? { name: { $regex: search, $options: 'i' } } : {};

    // Create a sort object
    let sortOption = {};
    if (sort && sortBy) {
      sortOption[sortBy] = sort === 'asc' ? 1 : -1;
    }

    // Calculate pagination values
    const offsetValue = parseInt(offset, 10);
    const limitValue = parseInt(limit, 10);

    const products = await Product.find(filter)
      .sort(sortOption)
      .skip(offsetValue)
      .limit(limitValue);

    res.status(200).json(successHandler(products));
  })
);

productRoute.get(
  "/:id",
  asyncHandler(async (req, res, next) => {
    const product = await Product.findById(req.params.id);
    if (product) {
      res.status(200).json(successHandler(product));
    } else {
      res.status(404);
      next(new Error("Product Not Found"));
    }
  })
);

module.exports = productRoute;