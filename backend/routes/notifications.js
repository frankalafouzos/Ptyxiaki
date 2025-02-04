const router = require("express").Router();
let Booking = require("../models/booking.model");
let BookingRating = require("../models/bookingRating.model");
let RestaurantCapacity = require("../models/restaurantCapacity.model");
let Restaurant = require("../models/restaurant.model");
let User = require("../models/users.model");


router.route("/mail").post((req, res) => {
    const mailjet = require('node-mailjet').apiConnect(
        process.env.MJ_APIKEY_PUBLIC,
        process.env.MJ_APIKEY_PRIVATE
    );

    const { toName, toEmail,  restaurantName, bookingDate, bookingTime, guestCount } = req.body;

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 0;
            color: #333;
            background-color: #f4f4f4; /* Subtle background for the email body */
        }

        .container {
            max-width: 600px;
            margin: 20px auto;
            background-color: #fff;
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }

        .header {
            background-color: #d0cece; /* Matches your header background */
            padding: 20px;
            text-align: center;
            color: #333;
        }

        .header img {
            max-width: 150px; /* Adjust logo size */
            height: auto;
        }

        .header h1 {
            margin: 10px 0 0;
            font-size: 24px;
            font-weight: bold;
        }

        .header p {
            margin: 0;
            font-size: 16px;
            color: #555;
        }

        .content {
            padding: 20px;
        }

        .content h2 {
            font-size: 18px;
            margin-bottom: 10px;
            color: #4a4a4a;
        }

        .content p {
            margin: 10px 0;
            color: #4a4a4a;
        }

        .content ul {
            list-style: none;
            padding: 0;
            margin: 10px 0;
        }

        .content ul li {
            margin: 5px 0;
            color: #4a4a4a;
        }

        .content ul li strong {
            color: #000;
        }

        .footer {
            text-align: center;
            padding: 15px;
            font-size: 12px;
            color: #555;
            background-color: #f4f4f4; /* Subtle footer background */
            border-top: 1px solid #ddd;
        }

        .footer a {
            color: #4a90e2;
            text-decoration: none;
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <img src="https://bookabite.s3.us-east-1.amazonaws.com/1715957731654-Logo.png" alt="Book A Bite Logo" />
            <h4>Your go-to platform for unforgettable dining experiences</h4>
        </div>

        <!-- Main Content -->
        <div class="content">
            <h2>Dear ${toName},</h2>
            <p>Thank you for booking with <strong>Book A Bite</strong>. Here are the details of your booking:</p>
            <ul>
                <li><strong>Restaurant:</strong> ${restaurantName}</li>
                <li><strong>Date:</strong> ${bookingDate}</li>
                <li><strong>Time:</strong> ${bookingTime}</li>
                <li><strong>Guests:</strong> ${guestCount}</li>
            </ul>
            <p>We look forward to serving you! If you have any questions, feel free to contact us at <a href="mailto:support@bookabite.com">support@bookabite.com</a>.</p>
        </div>

        <!-- Footer -->
        <div class="footer">
            <p>&copy; 2025 Book A Bite. All rights reserved.</p>
            <p>If you need help, reach us at <a href="mailto:support@bookabite.com">support@bookabite.com</a>.</p>
            <p>123 Foodie Lane, Gourmet City, Culinary World</p>
            <p>
                <a href="#">Unsubscribe</a> | <a href="#">Privacy Policy</a>
            </p>
        </div>
    </div>
</body>
</html>


                        `;

    const request = mailjet
        .post("send", { 'version': 'v3.1' })
        .request({
            "Messages": [
                {
                    "From": {
                        "Email": "info.bookabite@gmail.com",
                        "Name": "Book A Bite"
                    },
                    "To": [
                        {
                            "Email": toEmail,
                            "Name": toName
                        }
                    ],
                    "Subject": "Your Booking Confirmation",
                    "TextPart": "Hello Fragkiskos Alafouzos,\n\nThank you for choosing Book A Bite. Here are your booking details:\nRestaurant: XYZ\nDate: 2025-01-12\nTime: 7:00 PM\nGuests: 4\n\nWe look forward to serving you!\n\nBest regards,\nThe Book A Bite Team",
                    "HTMLPart": htmlContent

                }
            ]
        })

    request
        .then((result) => {
            console.log(result.body); // Log the result for debugging
            res.status(200).json({ success: true, message: "Email sent successfully", data: result.body });
        })
        .catch((err) => {
            console.error(err); // Log the error for debugging
            res.status(500).json({ success: false, message: "Failed to send email", error: err.message });
        });
});


module.exports = router;