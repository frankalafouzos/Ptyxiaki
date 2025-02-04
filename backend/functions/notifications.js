const router = require("express").Router();
let Booking = require("../models/booking.model");
let BookingRating = require("../models/bookingRating.model");
let RestaurantCapacity = require("../models/restaurantCapacity.model");
let Restaurant = require("../models/restaurant.model");
let User = require("../models/users.model");

const sendCustomerConfirmationMail = async (emailData) => {
    const mailjet = require('node-mailjet').apiConnect(
        process.env.MJ_APIKEY_PUBLIC,
        process.env.MJ_APIKEY_PRIVATE
    );

    const { toName, toEmail, restaurantName, bookingDate, bookingTime, guestCount } = emailData;

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 20px auto; background-color: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); }
        .header { text-align: center; }
        .header img { max-width: 150px; height: auto; }
        .footer { text-align: center; font-size: 12px; color: #555; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="https://bookabite.s3.us-east-1.amazonaws.com/1715957731654-Logo.png" alt="Book A Bite Logo" />
            <h4>Your go-to platform for unforgettable dining experiences</h4>
        </div>
        <div>
            <h2>Dear ${toName},</h2>
            <p>Thank you for booking with <strong>Book A Bite</strong>. Here are the details of your booking:</p>
            <ul>
                <li><strong>Restaurant:</strong> ${restaurantName}</li>
                <li><strong>Date:</strong> ${bookingDate}</li>
                <li><strong>Time:</strong> ${bookingTime}</li>
                <li><strong>Guests:</strong> ${guestCount}</li>
            </ul>
            <p>If you have any questions, contact us at <a href="mailto:support@bookabite.com">support@bookabite.com</a>.</p>
        </div>
        <div class="footer">
            <p>&copy; 2025 Book A Bite. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
    `;

    try {
        const request = mailjet.post("send", { version: 'v3.1' }).request({
            Messages: [
                {
                    From: { Email: "info.bookabite@gmail.com", Name: "Book A Bite" },
                    To: [{ Email: toEmail, Name: toName }],
                    Subject: "Your Booking Confirmation",
                    TextPart: `Hello ${toName},\n\nThank you for choosing Book A Bite. Here are your booking details:\nRestaurant: ${restaurantName}\nDate: ${bookingDate}\nTime: ${bookingTime}\nGuests: ${guestCount}`,
                    HTMLPart: htmlContent,
                }
            ]
        });

        const result = await request;
        console.log(result.body); // Debugging log
        return { success: true, message: "Email sent successfully", data: result.body };
    } catch (err) {
        console.error(err); // Debugging log
        return { success: false, message: "Failed to send email", error: err.message };
    }
};

module.exports = { sendCustomerConfirmationMail};