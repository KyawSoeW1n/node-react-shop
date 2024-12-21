const express = require('express');
const app = express();
const product = require('./data/Products');
const mongoose = require('mongoose');

const dbSeeder = require('./databaseSeeder');

const userRoute = require("./routes/User");

const dotenv = require('dotenv');
const productRoute = require('./routes/Product');



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


app.get('/api/product/:id', (req, res) => {
    const data = product.find((p) => p.id === parseInt(req.params.id));
    res.json(data);
});
app.listen(PORT || 9000, () => {
    console.log(`Server is running onn port ${PORT}`);
});