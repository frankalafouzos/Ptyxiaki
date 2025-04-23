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
    console.log(emailData); // Debugging log

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
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
            background-color: #e0e0e0;
            text-align: center;
            padding: 20px;
        }
        .header img {
            max-width: 150px;
            height: auto;
        }
        .header h4 {
            margin: 10px 0 0;
            color: #333;
            font-weight: normal;
        }
        .content {
            padding: 20px;
        }
        .content h2 {
            margin-bottom: 10px;
        }
        .content ul {
            list-style-type: none;
            padding: 0;
        }
        .content ul li {
            margin-bottom: 5px;
        }
        .content p {
            margin: 10px 0;
        }
        .footer {
            background-color: #f8f8f8;
            text-align: center;
            padding: 15px;
            font-size: 12px;
            color: #555;
        }
        .footer a {
            color: #007bff;
            text-decoration: none;
        }
        .footer p {
            margin: 5px 0;
        }
        .unsubscribe {
            margin-top: 10px;
            font-size: 12px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="https://bookabite.s3.us-east-1.amazonaws.com/1715957731654-Logo.png" alt="Book A Bite Logo" />
            <h4>Your go-to platform for unforgettable dining experiences</h4>
        </div>
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
        <div class="footer">
            <p>&copy; 2025 <strong>Book A Bite</strong>. All rights reserved.</p>
            <p>If you need help, reach us at <a href="mailto:support@bookabite.com">support@bookabite.com</a>.</p>
            <p>123 Foodie Lane, Gourmet City, Culinary World</p>
            <div class="unsubscribe">
                <a href="#">Unsubscribe</a> | <a href="#">Privacy Policy</a>
            </div>
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

const sendOwnerConfirmationMail = async (emailData) => {
    const mailjet = require('node-mailjet').apiConnect(
        process.env.MJ_APIKEY_PUBLIC,
        process.env.MJ_APIKEY_PRIVATE
    );

    const { toName, toEmail, restaurantName, bookingDate, bookingTime, guestCount } = emailData;
    console.log(emailData); // Debugging log

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
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
            background-color: #e0e0e0;
            text-align: center;
            padding: 20px;
        }
        .header img {
            max-width: 150px;
            height: auto;
        }
        .header h4 {
            margin: 10px 0 0;
            color: #333;
            font-weight: normal;
        }
        .content {
            padding: 20px;
        }
        .content h2 {
            margin-bottom: 10px;
        }
        .content ul {
            list-style-type: none;
            padding: 0;
        }
        .content ul li {
            margin-bottom: 5px;
        }
        .content p {
            margin: 10px 0;
        }
        .footer {
            background-color: #f8f8f8;
            text-align: center;
            padding: 15px;
            font-size: 12px;
            color: #555;
        }
        .footer a {
            color: #007bff;
            text-decoration: none;
        }
        .footer p {
            margin: 5px 0;
        }
        .unsubscribe {
            margin-top: 10px;
            font-size: 12px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="https://bookabite.s3.us-east-1.amazonaws.com/1715957731654-Logo.png" alt="Book A Bite Logo" />
            <h4>Your trusted partner for seamless restaurant reservations</h4>
        </div>
        <div class="content">
            <h2>Dear ${toName},</h2>
            <p>A new reservation has been made at <strong>${restaurantName}</strong> through <strong>Book A Bite</strong>. Here are the booking details:</p>
            <ul>
                <li><strong>Date:</strong> ${bookingDate}</li>
                <li><strong>Time:</strong> ${bookingTime}</li>
                <li><strong>Guests:</strong> ${guestCount}</li>
            </ul>
            <p>Please ensure that the necessary arrangements are made for your guests. If you have any questions or need assistance, feel free to contact us at <a href="mailto:support@bookabite.com">support@bookabite.com</a>.</p>
            <p>Thank you for being a valued partner.</p>
        </div>
        <div class="footer">
            <p>&copy; 2025 <strong>Book A Bite</strong>. All rights reserved.</p>
            <p>Need help? Reach us at <a href="mailto:support@bookabite.com">support@bookabite.com</a>.</p>
            <p>123 Foodie Lane, Gourmet City, Culinary World</p>
            <div class="unsubscribe">
                <a href="#">Unsubscribe</a> | <a href="#">Privacy Policy</a>
            </div>
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
                    Subject: "New Booking Confirmation for Your Restaurant",
                    TextPart: `Hello ${toName},\n\nA new reservation has been made at ${restaurantName} through Book A Bite. Here are the details:\nDate: ${bookingDate}\nTime: ${bookingTime}\nGuests: ${guestCount}\n\nPlease ensure the necessary arrangements are in place. For any questions, contact us at support@bookabite.com.`,
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

const sendOwnerSignInConfirmationMail = async (emailData) => {
    const mailjet = require('node-mailjet').apiConnect(
        process.env.MJ_APIKEY_PUBLIC,
        process.env.MJ_APIKEY_PRIVATE
    );

    const { toName, toEmail } = emailData;
    console.log(emailData); // Debugging log

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
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
            background-color: #e0e0e0;
            text-align: center;
            padding: 20px;
        }
        .header img {
            max-width: 150px;
            height: auto;
        }
        .header h4 {
            margin: 10px 0 0;
            color: #333;
            font-weight: normal;
        }
        .content {
            padding: 20px;
        }
        .content h2 {
            margin-bottom: 10px;
        }
        .content p {
            margin: 10px 0;
        }
        .footer {
            background-color: #f8f8f8;
            text-align: center;
            padding: 15px;
            font-size: 12px;
            color: #555;
        }
        .footer a {
            color: #007bff;
            text-decoration: none;
        }
        .footer p {
            margin: 5px 0;
        }
        .unsubscribe {
            margin-top: 10px;
            font-size: 12px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="https://bookabite.s3.us-east-1.amazonaws.com/1715957731654-Logo.png" alt="Book A Bite Logo" />
            <h4>Welcome to Book A Bite</h4>
        </div>
        <div class="content">
            <h2>Dear ${toName},</h2>
            <p>Thank you for signing in as an owner with <strong>Book A Bite</strong>. We are excited to have you on board!</p>
            <p>If you have any questions or need assistance, feel free to contact us at <a href="mailto:support@bookabite.com">support@bookabite.com</a>.</p>
        </div>
        <div class="footer">
            <p>&copy; 2025 <strong>Book A Bite</strong>. All rights reserved.</p>
            <p>If you need help, reach us at <a href="mailto:support@bookabite.com">support@bookabite.com</a>.</p>
            <p>123 Foodie Lane, Gourmet City, Culinary World</p>
            <div class="unsubscribe">
                <a href="#">Unsubscribe</a> | <a href="#">Privacy Policy</a>
            </div>
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
                    Subject: "Owner Sign-In Confirmation",
                    TextPart: `Hello ${toName},\n\nThank you for signing in as an owner with Book A Bite. We are excited to have you on board! If you have any questions, feel free to contact us at support@bookabite.com.`,
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

const sendUserSignInConfirmationMail = async (emailData) => {
    const mailjet = require('node-mailjet').apiConnect(
        process.env.MJ_APIKEY_PUBLIC,
        process.env.MJ_APIKEY_PRIVATE
    );

    const { toName, toEmail } = emailData;
    console.log(emailData); // Debugging log

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
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
            background-color: #e0e0e0;
            text-align: center;
            padding: 20px;
        }
        .header img {
            max-width: 150px;
            height: auto;
        }
        .header h4 {
            margin: 10px 0 0;
            color: #333;
            font-weight: normal;
        }
        .content {
            padding: 20px;
        }
        .content h2 {
            margin-bottom: 10px;
        }
        .content p {
            margin: 10px 0;
        }
        .footer {
            background-color: #f8f8f8;
            text-align: center;
            padding: 15px;
            font-size: 12px;
            color: #555;
        }
        .footer a {
            color: #007bff;
            text-decoration: none;
        }
        .footer p {
            margin: 5px 0;
        }
        .unsubscribe {
            margin-top: 10px;
            font-size: 12px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="https://bookabite.s3.us-east-1.amazonaws.com/1715957731654-Logo.png" alt="Book A Bite Logo" />
            <h4>Welcome to Book A Bite</h4>
        </div>
        <div class="content">
            <h2>Dear ${toName},</h2>
            <p>Thank you for signing in with <strong>Book A Bite</strong>. We are excited to have you on board!</p>
            <p>If you have any questions or need assistance, feel free to contact us at <a href="mailto:support@bookabite.com">support@bookabite.com</a>.</p>
        </div>
        <div class="footer">
            <p>&copy; 2025 <strong>Book A Bite</strong>. All rights reserved.</p>
            <p>If you need help, reach us at <a href="mailto:support@bookabite.com">support@bookabite.com</a>.</p>
            <p>123 Foodie Lane, Gourmet City, Culinary World</p>
            <div class="unsubscribe">
                <a href="#">Unsubscribe</a> | <a href="#">Privacy Policy</a>
            </div>
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
                    Subject: "User Sign-In Confirmation",
                    TextPart: `Hello ${toName},\n\nThank you for signing in with Book A Bite. We are excited to have you on board! If you have any questions, feel free to contact us at support@bookabite.com.`,
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

const sendBookingReminderMail = async (emailData) => {
    const mailjet = require('node-mailjet').apiConnect(
        process.env.MJ_APIKEY_PUBLIC,
        process.env.MJ_APIKEY_PRIVATE
    );

    const { toName, toEmail, restaurantName, bookingDate, bookingTime, guestCount } = emailData;
    console.log(emailData); // Debugging log

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
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
            background-color: #e0e0e0;
            text-align: center;
            padding: 20px;
        }
        .header img {
            max-width: 150px;
            height: auto;
        }
        .header h4 {
            margin: 10px 0 0;
            color: #333;
            font-weight: normal;
        }
        .content {
            padding: 20px;
        }
        .content h2 {
            margin-bottom: 10px;
        }
        .content ul {
            list-style-type: none;
            padding: 0;
        }
        .content ul li {
            margin-bottom: 5px;
        }
        .content p {
            margin: 10px 0;
        }
        .footer {
            background-color: #f8f8f8;
            text-align: center;
            padding: 15px;
            font-size: 12px;
            color: #555;
        }
        .footer a {
            color: #007bff;
            text-decoration: none;
        }
        .footer p {
            margin: 5px 0;
        }
        .unsubscribe {
            margin-top: 10px;
            font-size: 12px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="https://bookabite.s3.us-east-1.amazonaws.com/1715957731654-Logo.png" alt="Book A Bite Logo" />
            <h4>Reminder: Your Booking is Tomorrow</h4>
        </div>
        <div class="content">
            <h2>Dear ${toName},</h2>
            <p>This is a friendly reminder that you have a booking with <strong>Book A Bite</strong> tomorrow. Here are the details of your booking:</p>
            <ul>
                <li><strong>Restaurant:</strong> ${restaurantName}</li>
                <li><strong>Date:</strong> ${bookingDate}</li>
                <li><strong>Time:</strong> ${bookingTime}</li>
                <li><strong>Guests:</strong> ${guestCount}</li>
            </ul>
            <p>We look forward to serving you! If you have any questions, feel free to contact us at <a href="mailto:support@bookabite.com">support@bookabite.com</a>.</p>
        </div>
        <div class="footer">
            <p>&copy; 2025 <strong>Book A Bite</strong>. All rights reserved.</p>
            <p>If you need help, reach us at <a href="mailto:support@bookabite.com">support@bookabite.com</a>.</p>
            <p>123 Foodie Lane, Gourmet City, Culinary World</p>
            <div class="unsubscribe">
                <a href="#">Unsubscribe</a> | <a href="#">Privacy Policy</a>
            </div>
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
                    Subject: "Booking Reminder: Your Reservation is Tomorrow",
                    TextPart: `Hello ${toName},\n\nThis is a friendly reminder that you have a booking with Book A Bite tomorrow. Here are your booking details:\nRestaurant: ${restaurantName}\nDate: ${bookingDate}\nTime: ${bookingTime}\nGuests: ${guestCount}\n\nWe look forward to serving you! If you have any questions, feel free to contact us at support@bookabite.com.`,
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

module.exports = { sendCustomerConfirmationMail, sendOwnerConfirmationMail, sendOwnerSignInConfirmationMail, sendUserSignInConfirmationMail, sendBookingReminderMail };