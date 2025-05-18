import React, { useState, useEffect } from "react";
import Form from "react-bootstrap/Form";
import { Button, Container, Row, Col, Alert } from "react-bootstrap";
import DateInputComponent from "../components/DatePicker.component";
import { useNavigate } from 'react-router-dom';
import "../css/MakeABooking.css";

const MakeABooking = () => {
  const [bookingData, setBookingData] = useState({
    partySize: 1,
    date: new Date().toISOString().split("T")[0],
  });
  const [loading, setLoading] = useState(false);
  const [availability, setAvailability] = useState([]);
  const [claimedOffer, setClaimedOffer] = useState(null);
  const [offerExpired, setOfferExpired] = useState(false);

  const [closedMessage, setClosedMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const claimed = sessionStorage.getItem("claimedOffer");
    if (claimed) {
      const { offer, expiry } = JSON.parse(claimed);
      if (Date.now() > expiry) {
        setOfferExpired(true);
        sessionStorage.removeItem("claimedOffer");
      } else {
        setClaimedOffer(offer);
        setBookingData(prev => ({
          ...prev,
          offerClaimed: offer,
        }));
      }
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBookingData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleDateChange = (newDate) => {
    setBookingData((prevState) => ({
      ...prevState,
      date: newDate,
    }));
  };

  const handleRemoveOffer = () => {
    setClaimedOffer(null);
    sessionStorage.removeItem("claimedOffer");
    setOfferExpired(false);
    setBookingData(prev => {
      const { offerClaimed, ...rest } = prev;
      return rest;
    });
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setClosedMessage(""); // Reset message
    const restaurantId = window.location.pathname.split("/").pop();
    const queryParams = new URLSearchParams({
      date: bookingData.date,
      partyNumber: bookingData.partySize,
    }).toString();

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/bookings/availability/${restaurantId}?${queryParams}`, {
        method: "GET",
        headers: { Accept: "application/json" },
      });
      const data = await response.json();
      if (data.message) {
        setClosedMessage(data.message);
        setAvailability([]); // Clear slots
      } else {
        setClosedMessage("");
        setAvailability(data);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching availability:", error);
      setLoading(false);
    }
  };

  const handleTimeSelect = (time) => {
    const restaurantId = window.location.pathname.split("/").pop();
    navigate(`/restaurant/${restaurantId}/confirmBooking`, {
      state: {
        date: bookingData.date,
        time,
        partySize: bookingData.partySize,
        restaurantId,
        offer: claimedOffer || null,
      },
    });
  };

  // Check if the selected date is outside the offer window
  const isOutOfOfferWindow =
    claimedOffer &&
    bookingData.date &&
    (
      new Date(bookingData.date) < new Date(claimedOffer.startDate) ||
      new Date(bookingData.date) > new Date(claimedOffer.endDate)
    );

    
  return (
    <Container className="booking-container">
      {claimedOffer && !offerExpired && (
        <Alert variant={isOutOfOfferWindow ? "danger" : "success"} className="mb-3">
          <div>
            <strong>Offer Applied:</strong> {claimedOffer.title}
            <br />
            <span>{claimedOffer.description}</span>
            <br />
            <strong>Discount:</strong>{" "}
            {claimedOffer.discountType === "percentage"
              ? `${claimedOffer.discountValue}%`
              : `€${claimedOffer.discountValue}`}
            {isOutOfOfferWindow && (
              <div className="mt-2">
                <strong>
                  The selected booking date is outside the offer's valid window (
                  {new Date(claimedOffer.startDate).toLocaleDateString()} -{" "}
                  {new Date(claimedOffer.endDate).toLocaleDateString()}
                  ). The offer will not be applied.
                </strong>
              </div>
            )}
            <Button
              variant="outline-danger"
              size="sm"
              className="ms-3"
              onClick={handleRemoveOffer}
            >
              Remove Offer
            </Button>
          </div>
        </Alert>
      )}
      {offerExpired && (
        <Alert variant="warning" className="mb-3">
          The offer you claimed has expired.
          <Button
            variant="outline-danger"
            size="sm"
            className="ms-3"
            onClick={handleRemoveOffer}
          >
            Dismiss
          </Button>
        </Alert>
      )}
      <Form className="booking-form" onSubmit={handleSubmit}>
        <h1 className="booking-title">Make a Booking</h1>
        <Form.Group controlId="date" className="mb-3">
          <DateInputComponent onDateChange={handleDateChange} widthofInput="100%" />
        </Form.Group>
        <Form.Group controlId="partySize" className="mb-3">
          <Form.Label>Party Size:</Form.Label>
          <Form.Control
            type="number"
            name="partySize"
            min={1}
            max={8}
            placeholder="Party Size"
            value={bookingData.partySize}
            onChange={handleInputChange}
            required
          />
          <Form.Text className="text-muted">
            Note: We can only make reservations for up to 8 people. Contact the restaurant/coffee shop if your party is larger.
          </Form.Text>
        </Form.Group>
        <Button type="submit" variant="primary" className="w-100">Search for available hours</Button>
      </Form>
      {closedMessage && (
        <Alert variant="danger" className="mt-3">
          {closedMessage}
        </Alert>
      )}
      <div className="availability-container">
        {loading ? (
          <div className={`global-spinner`}>
            <div className="spinner"></div>
          </div>
        ) : (
          availability.length > 0 && (
            <>
              <h2 className="availability-title">Available Times</h2>
              <Row className="time-slots">
                {availability.filter(slot => slot.available).map((slot, index) => (
                  <Col key={index} xs={6} sm={4} md={3} lg={2} className="time-slot-col">
                    <Button
                      onClick={() => handleTimeSelect(slot.time)}
                      variant="success"
                      className="time-slot-btn"
                    >
                      {slot.time}
                    </Button>
                  </Col>
                ))}
              </Row>
            </>
          )
        )}

      </div>
    </Container>
  );
};

export default MakeABooking;