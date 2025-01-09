const express = require('express');
const app = express();
const mongoose = require('mongoose');

const dbSeeder = require('./databaseSeeder');

const userRoute = require("./routes/User");

const dotenv = require('dotenv');
const productRoute = require('./routes/Product');
const orderRoute = require('./routes/Order');

const { errorHandler } = require("./middleware/ErrorMiddleware");

const swaggerUI = require("swagger-ui-express");
const swaggerSpec = require("./swagger");

// Serve Swagger documentation
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerSpec));

dotenv.config();
const PORT = process.env.PORT;

mongoose.connect(process.env.DB, {
}).then(() => {
    console.log('Connected to MongoDB');
}).catch((err) => {
    console.log(err);
});

app.use(express.json())

app.use('/api/seed', dbSeeder);
app.use("/api/user", userRoute);
app.use("/api/product", productRoute);
app.use("/api/order", orderRoute);

app.listen(PORT || 9000, () => {
    console.log(`Server is running on port ${PORT}`);
});


app.use(errorHandler);