import React from 'react';
import { useParams } from 'react-router-dom';

const ThankYouForBooking = () => {
    const { bookingid } = useParams();

    return (
        <div style={{ textAlign: 'center', marginTop: '100px' }}>
            <h1 style={{ fontSize: '36px', fontWeight: 'bold', color: '#333' }}>
                Thank You for Your Booking!
            </h1>
            <p style={{ fontSize: '18px', color: '#666' }}>
                Your booking ID is: {bookingid}
            </p>
        </div>
    );
};

export default ThankYouForBooking;
