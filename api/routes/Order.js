const express = require("express");
const orderRoute = express.Router();
const protect = require("../middleware/Auth");
const asyncHandler = require("express-async-handler");
const Order = require("../models/Order");
const mongoose = require('mongoose');

const successHandler = require('../middleware/SuccessHandler');
orderRoute.post(
    "/",
    protect,
    asyncHandler(async (req, res, next) => {
        const {
            orderItems,
            shippingAddress,
            paymentMethods,
            shippingPrice,
            taxPrice,
            totalPrice,
            price,
        } = req.body;

        if (!req.body.orderItems) {
            res.status(400);
            next(new Error("Invalid request"));
            return;
        }

        if (orderItems && orderItems.length === 0) {
            res.status(400);
            next(new Error("No order items found"));
        } else {
            const order = new Order({
                orderItems,
                shippingAddress,
                paymentMethods,
                shippingPrice,
                taxPrice,
                totalPrice,
                price,
                user: req.user._id,
            });

            const createdOrder = await order.save();
            res.status(201).json(successHandler(createdOrder));
        }
    })
);

//Order Detail
orderRoute.get(
    "/:id",
    protect,
    asyncHandler(async (req, res, next) => {

        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            res.status(404);
            next(new Error("Order Not Found"));
            return;
        };
        const order = await Order.findById(req.params.id).populate(
            "user",
            "name email"
        );


        if (order) {

            const responseData = {
                order_id: order._id,
                shipping_address: order.shippingAddress,
                payment_result: order.paymentResult,
                order_items: order.orderItems,
                payment_method: order.paymentMethod,
                tax_price: order.taxPrice,
                shipping_price: order.shippingPrice,
                total_price: order.totalPrice,
                is_paid: order.isPaid,
                is_delivered: order.isDelivered,
                createdAt: order.createdAt,
                updatedAt: order.updatedAt,
                paidAt: order.paidAt,
            }

            res.status(200).json(successHandler(responseData));
        } else {
            res.status(404);
            next(new Error("Order Not Found"));
        }
    })
);

//order lists
orderRoute.get(
    "/",
    protect,
    asyncHandler(async (req, res, next) => {

        const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
        if (orders) {
            res.status(200).json(successHandler(orders));
        } else {
            res.status(404);
            next(new Error("Order List Error"));
        }
    })
);

orderRoute.put(
    "/:id/payment",
    protect,
    asyncHandler(async (req, res, next) => {
        const order = await Order.findById(req.params.id);
        if (order) {
            order.isPaid = true;
            order.paidAt = Date.now();

            order.paymentResult = {
                id: req.body.id,
                status: "Completed",
                update_time: Date.now(),
            };
            const updatedOrder = await order.save();

            res.status(200).json(updatedOrder);
        } else {
            res.status(404);
            next(new Error("Order Not Found"));
        }
    })
);
module.exports = orderRoute;