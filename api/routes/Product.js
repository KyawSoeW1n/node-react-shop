const express = require("express");
const productRoute = express.Router();
const asyncHandler = require("express-async-handler");
const Product = require("../models/Product");

const successHandler = require('../middleware/SuccessHandler');

productRoute.get(
  "/",
  asyncHandler(async (req, res, next) => {
    const products = await Product.find({});
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