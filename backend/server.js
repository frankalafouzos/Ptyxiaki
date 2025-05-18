const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose")
const cookieParser = require("cookie-parser");


require("dotenv").config();

const app = express();
const port = process.env.PORT || 5001;

const uri = process.env.ATLAS_URI;
mongoose.connect(uri, { useNewUrlParser: true });
const connection = mongoose.connection;
connection.once('open', () => {
    console.log("MongoDB database connection established successfully");
    require('./agenda/expireOffers');
})

app.use(cookieParser());

app.use(cors());
app.use(express.json());

const usersRouter = require('./routes/users');
const restaurantsRouter = require('./routes/restaurant');
const pendingRestaurantsRouter = require('./routes/pendingApprovalRestaurants');
const bookingsRouter = require('./routes/bookings');
const imagesRouter = require('./routes/images');
const ownersRouter = require('./routes/owners');
const adminsRouter = require('./routes/admin');
const searchRouter = require('./routes/search');
const locationsRouter = require('./routes/locations');
const suggestionsRouter = require('./routes/suggestions');
const notificationsRouter = require('./routes/notifications');
const calendarRouter = require('./routes/calendar');
const pendingEditsRoutes = require('./routes/pendingEditsRoutes');
const offersRouter = require('./routes/offers');

app.use('/users', usersRouter);
app.use('/restaurants', restaurantsRouter);
app.use('/pendingRestaurants', pendingRestaurantsRouter);
app.use('/bookings', bookingsRouter);
app.use('/images', imagesRouter);
app.use('/owners', ownersRouter);
app.use('/admins', adminsRouter);
app.use('/search', searchRouter);
app.use('/locations', locationsRouter);
app.use('/suggestions', suggestionsRouter);
app.use('/notifications', notificationsRouter);
app.use('/calendar', calendarRouter);
app.use('/api/pending-edits', pendingEditsRoutes);
app.use('/offers', offersRouter);


app.listen(port, () => {
    console.log(`Server is running on port: ${port}`)
})