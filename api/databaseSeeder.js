const router = require("express").Router();
const User = require("./models/User");
const users = require("./data/Users");
const Product = require("./models/Product");
const products = require("./data/Products");
const AsynHandler = require("express-async-handler");

const successHandler = require("./middleware/SuccessHandler");
router.post(
  "/users",
  AsynHandler(async (req, res) => {
    await User.deleteMany({});
    const UserSeeder = await User.insertMany(users);
    res.send({ UserSeeder });
  })
);

router.get(
  "/products",
  AsynHandler(async (req, res) => {
    await Product.deleteMany({});
    const ProductSeeder = await Product.insertMany(products);
    res.send({ ProductSeeder });
  })
);


router.post(
  "/product",
  AsynHandler(async (req, res) => {
    const { name, image, description, price, countInStock } = req.body;
    console.log(req.body);
    const product = await Product.create({
      name,
      image,
      description,
      price,
      countInStock,
      rating: 0,
      numReview: 0,
    });

    if (product) {
      res.status(201).json(successHandler(product));
    } else {
      res.status(400);
      next(new Error("Invalid User Data"));
    }
  })
);


module.exports = router;