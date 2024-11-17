import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import RatingComponent from "../components/RateBooking.component";
import { Container, Card, Button, Alert } from "react-bootstrap";
import "../css/RateBooking.css";

const RateScreen = () => {
    const { bookingId } = useParams();
    const navigate = useNavigate();
    const [booking, setBooking] = useState(null);
    const [restaurant, setRestaurant] = useState(null); // For restaurant details
    const [rating, setRating] = useState(0);
    const [feedback, setFeedback] = useState("");
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const fetchBooking = async () => {
            try {
                const response = await fetch(`http://localhost:5000/bookings/${bookingId}`);
                if (!response.ok) throw new Error("Failed to fetch booking details");
                const data = await response.json();
                setBooking(data.booking); // Booking details
                setRestaurant(data.restaurant); // Restaurant details
            } catch (error) {
                console.error(error);
                setError("Failed to load booking details. Please try again later.");
            }
        };

        fetchBooking();
    }, [bookingId]);

    const handleSubmit = async () => {
        try {
            const response = await fetch(`http://localhost:5000/bookings/rate/${bookingId}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ rating, feedback }),
            });
            if (!response.ok) throw new Error("Failed to submit rating");
            setSuccess(true);
            setTimeout(() => navigate("/userBookings"), 2000);
        } catch (error) {
            console.error(error);
            setError("Failed to submit rating. Please try again.");
        }
    };

    if (!booking || !restaurant) {
        return (
            <Container className="d-flex justify-content-center align-items-center" style={{ height: "70vh" }}>
                <div className="loader">Loading...</div>
            </Container>
        );
    }

    return (
        <Container className="rate-screen">
            <Card className="rate-card p-4 shadow-lg">
                <h2 className="text-center mb-4" style={{ fontWeight: "600", color: "#2c3e50" }}>Rate Your Experience</h2>
                {error && <Alert variant="danger">{error}</Alert>}
                {success && <Alert variant="success">Thank you for your feedback!</Alert>}

                <div className="booking-details mb-4">
                    <p><strong>Restaurant:</strong> {restaurant.name}</p>
                    <p><strong>Location:</strong> {restaurant.location}</p>
                    <p><strong>Date:</strong> {new Date(booking.date).toLocaleDateString("en-GB")}</p>
                    <p>
                        <strong>Time:</strong>{" "}
                        {booking.formattedStartingTime
                            ? booking.formattedStartingTime
                            : `${Math.floor(booking.startingTime / 60)
                                .toString()
                                .padStart(2, "0")}:${(booking.startingTime % 60)
                                    .toString()
                                    .padStart(2, "0")}`}
                    </p>
                </div>

                <RatingComponent rating={rating} setRating={setRating} />

                <div className="feedback">
                    <label htmlFor="feedback" className="form-label mt-3">Leave Feedback (Optional)</label>
                    <textarea
                        id="feedback"
                        className="form-control"
                        rows="4"
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        placeholder="Write your feedback here..."
                        style={{
                            borderRadius: "5px",
                            borderColor: "#ccc",
                            marginTop: "10px",
                        }}
                    ></textarea>
                </div>

                <Button
                    variant="primary"
                    className="w-100 mt-3"
                    disabled={rating === 0}
                    onClick={handleSubmit}
                    style={{
                        backgroundColor: "#2980b9",
                        borderColor: "#2980b9",
                        fontWeight: "500",
                    }}
                >
                    Submit Rating
                </Button>
            </Card>
        </Container>
    );
};

export default RateScreen;
