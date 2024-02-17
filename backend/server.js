const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose")
const cookieParser = require("cookie-parser");

require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

const uri = process.env.ATLAS_URI;
mongoose.connect(uri, { useNewUrlParser: true});
const connection = mongoose.connection;
connection.once('open', () => {
console.log("MongoDB database connection established successfully");
}) 

app.use(cookieParser());

app.use(cors());
app.use(express.json());

const usersRouter = require('./routes/users');
const restaurantsRouter = require('./routes/restaurant');
const bookingsRouter = require('./routes/bookings');


app.use('/users', usersRouter);
app.use('/restaurants', restaurantsRouter);
app.use('/bookings', bookingsRouter);

app.listen(port, () => {
    console.log(`Server is running on port: ${port}`)
})