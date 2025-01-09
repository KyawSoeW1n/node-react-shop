const express = require("express");
const userRoute = express.Router();
const AsyncHandler = require("express-async-handler");
const User = require("../models/User");
const generateToken = require("../tokenGenerator");
const protect = require("../middleware/Auth");
const successHandler = require('../middleware/SuccessHandler');
const nodeMailer = require('nodemailer');
const randomstring = require('randomstring');
const OTP = require('../models/OTP');
const bcrypt = require('bcryptjs');
const transporter = nodeMailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
        user: 'willis.ferry81@ethereal.email',
        pass: 'NMAJhYRR9pnVfp8By7'
    }
});

// Generate OTP
function generateOTP() {
    return randomstring.generate({
        length: 6,
        charset: 'numeric'
    });
}

/**
 * @swagger
 * /api/user/login:
 *   post:
 *     summary: Login User
 *     description: Login User with email and password.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: The user's email.
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 description: The user's password.
 *                 example: password123
 *     responses:
 *       200:
 *         description: Successful response with user data and token.
 */

userRoute.post(
    "/login",
    AsyncHandler(async (req, res, next) => {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(401);
            next(new Error("Bad request"));
            return;
        }

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

        if (!name || !email || !password) {
            res.status(401);
            next(new Error("Bad request"));
            return;
        }

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

            res.status(200).json(successHandler({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                isAdmin: updatedUser.isAdmin,
            }));
        } else {
            res.status(404);
            next(new Error("User not found"));
        }
    })
);

//user reset passsword
userRoute.post(
    "/forget-password",
    AsyncHandler(async (req, res, next) => {

        const { email } = req.body;
        if (!email) {
            res.status(401);
            next(new Error("Bad request"));
            return;
        }
        const otp = generateOTP(); // Generate a 6-digit OTP


        // Save OTP to the database
        const otpEntry = new OTP({ email, otp });
        await otpEntry.save();

        const mailOptions = {
            from: 'willis.ferry81@ethereal.email',
            to: email,
            subject: 'Your OTP',
            html: `<p>Your OTP is: <strong>${otp}</strong></p>`,
        };

        const info = await transporter.sendMail(mailOptions);

        console.log("Message sent: %s", info.messageId);

        res.status(200).json(successHandler(true, 'OTP sent successfully'));
    })
);

// Function to verify OTP and reset password
userRoute.post(
    "/reset-password",
    AsyncHandler(async (req, res, next) => {
        const { email, otp, newPassword } = req.body;
        // Verify OTP
        const otpEntry = await OTP.findOne({ email, otp });
        if (!otpEntry) {
            res.status(400);
            return next(new Error("Invalid OTP"));
        }
        console.log(otpEntry);
        // Hash the new password (using bcrypt)
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update the user's password in the database (assuming you have a User model)
        await User.updateOne({ email }, { password: hashedPassword });
        console.log('Password Updated');
        // Delete the OTP entry after successful verification
        await OTP.deleteOne({ email, otp });

        res.status(200).json({ success: true, message: 'Password reset successfully' });
    })
);

module.exports = userRoute;