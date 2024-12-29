const express = require("express");
const userRoute = express.Router();
const AsyncHandler = require("express-async-handler");
const User = require("../models/User");
const generateToken = require("../tokenGenerator");
const protect = require("../middleware/Auth");
const successHandler = require('../middleware/SuccessHandler');
userRoute.post(
    "/login",
    AsyncHandler(async (req, res, next) => {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (user && (await user.matchPassword(password))) {
            res.status(200).json(successHandler({
                user_id: user.id,
                name: user.name,
                email: user.email,
                is_admin: user.isAdmin,
                token: generateToken(user._id),
                createdAt: user.createdAt,
            }));
        } else {
            res.status(401);
            next(new Error("Invalid Credentials"));
        }
    })
);





//register route
userRoute.post(
    "/",
    AsyncHandler(async (req, res, next) => {
        const { name, email, password } = req.body;
        const existUser = await User.findOne({ email });
        if (existUser) {
            res.status(400);
            next(new Error("Email Already exist"));
        } else {
            const user = await User.create({
                name,
                email,
                password,
            });

            if (user) {
                res.status(201).json(successHandler({
                    user_id: user._id,
                    name: user.name,
                    email: user.email,
                    isAdmin: user.isAdmin,
                    createdAt: user.createdAt,
                }));
            } else {
                res.status(400);
                next(new Error("Invalid User Data"));
            }
        }
    })
);



//get auth profile data
userRoute.get(
    "/",
    protect,
    AsyncHandler(async (req, res) => {
        const user = await User.findById(req.user._id);
        if (user) {
            res.status(200).json(successHandler({
                _id: user._id,
                name: user.name,
                email: user.email,
                isAdmin: user.isAdmin,
                createdAt: user.createdAt,
            }));
        } else {
            res.status(404);
            next(new Error("User Not Found"));
        }
    })
);


//user profile update
userRoute.put(
    "/",
    protect,
    AsyncHandler(async (req, res) => {
        const user = await User.findById(req.user._id);
        if (user) {
            user.name = req.body.name || user.name;
            user.email = req.body.email || user.email;
            if (req.body.password) {
                user.password = req.body.password
            }
            const updatedUser = await user.save();
            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                isAdmin: updatedUser.isAdmin,
            });

        } else {
            res.status(404);
            throw new Error("USER NOT FOUND");
        }
    })
);

module.exports = userRoute;