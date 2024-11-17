import React from 'react';
import { useParams } from 'react-router-dom';
import { Container, Button } from 'react-bootstrap';
import "../css/ThankYouForBooking.css";

const ThankYouForBooking = () => {
    const { bookingid } = useParams();

    return (
        <Container className="thank-you-container">
            <div className="thank-you-content">
                <h1>Thank You for Your Booking!</h1>
                <p className="subheading">We’re excited to have you dine with us!</p>
                <p className="booking-id">
                    Your Booking ID: <span>{bookingid}</span>
                </p>
                <Button 
                    variant="primary" 
                    href="/restaurants"
                    className="view-restaurants-button"
                >
                    View Restaurants
                </Button>
            </div>
        </Container>
    );
};

export default ThankYouForBooking;
