const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const User = require("../models/User");

const protect = asyncHandler(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Extract the token
      token = req.headers.authorization.split(" ")[1];
      console.log("Token received:", token);
      if (!token) {
        throw new Error('Not Authorized!');
      }
      // Verify the token
      const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
      

      console.log("Decoded token:", decodedToken);
      req.user = await User.findById(decodedToken.id).select("-password");
      next();
    } catch (err) {
      console.log(err);
      res.status(401);
      throw new Error("Not Authorized");
    }
  }
  if (!token) {
    res.status(401);
    throw new Error("Not Authorized");
  }
});

module.exports = protect;