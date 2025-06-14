const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose")
const cookieParser = require("cookie-parser");
const path = require("path");


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

app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? true // Allow same origin in production
    : ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));

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
const restaurantRatingsRouter = require('./routes/restaurantRatings');

app.use('/api/restaurants', restaurantsRouter);
app.use('/api/users', usersRouter);
app.use('/api/pendingRestaurants', pendingRestaurantsRouter);
app.use('/api/bookings', bookingsRouter);
app.use('/api/images', imagesRouter);
app.use('/api/owners', ownersRouter);
app.use('/api/admins', adminsRouter);
app.use('/api/search', searchRouter);
app.use('/api/locations', locationsRouter);
app.use('/api/suggestions', suggestionsRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/calendar', calendarRouter);
app.use('/api/api/pending-edits', pendingEditsRoutes);
app.use('/api/offers', offersRouter);
app.use('/api/restaurantRatings', restaurantRatingsRouter);

// Serve static files από το frontend build
app.use(express.static(path.join(__dirname, '../frontend/build')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
});


app.listen(port, () => {
    console.log(`Server is running on port: ${port}`)
})