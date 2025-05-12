import React, { useState, useEffect } from "react";
import { Container, Form, Button, Row, Col } from "react-bootstrap";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import DateInputComponent from "../../components/DatePicker.component";

const AddBooking = () => {
  const { restaurantId } = useParams();
  const location = useLocation();
  const [partySize, setPartySize] = useState(1);
  const [date, setDate] = useState(
    location.state?.selectedDate || new Date().toISOString().split("T")[0]
  );
  const [availability, setAvailability] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    console.log("Selected date from state:", location.state?.selectedDate); // Debugging log
    if (location.state?.selectedDate) {
      setDate(location.state.selectedDate);
    }
  }, [location.state]);

  const handlePartySizeChange = (e) => {
    setPartySize(e.target.value);
  };

  const handleDateChange = (newDate) => {
    setDate(newDate);
  };

  const handleSearchAvailability = async (e) => {
    e.preventDefault();
    setLoading(true);
    const queryParams = new URLSearchParams({
      date,
      partyNumber: partySize,
    }).toString();

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/bookings/availability/${restaurantId}?${queryParams}`,
        {
          method: "GET",
          headers: { Accept: "application/json" },
        }
      );
      const data = await response.json();
      setAvailability(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching availability:", error);
      setLoading(false);
    }
  };

  const handleTimeSelect = (time) => {
    navigate(`/owner/confirm-booking`, {
      state: { date, time, partySize, restaurantId },
    });
  };

  return (
    <Container className="booking-container">
      <Form className="booking-form" onSubmit={handleSearchAvailability}>
        <h1 className="booking-title">Add a Booking</h1>
        <Form.Group controlId="date" className="mb-3">
          <DateInputComponent
            onDateChange={handleDateChange}
            widthofInput="100%"
            value={date}
          />
        </Form.Group>
        <Form.Group controlId="partySize" className="mb-3">
          <Form.Label>Party Size:</Form.Label>
          <Form.Control
            type="number"
            name="partySize"
            min={1}
            max={8}
            placeholder="Party Size"
            value={partySize}
            onChange={handlePartySizeChange}
            required
          />
          <Form.Text className="text-muted">
            Note: We can only make reservations for up to 8 people. Contact the
            restaurant/coffee shop if your party is larger.
          </Form.Text>
        </Form.Group>
        <Button type="submit" variant="primary" className="w-100">
          Search for available hours
        </Button>
      </Form>
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
                {availability
                  .filter((slot) => slot.available)
                  .map((slot, index) => (
                    <Col
                      key={index}
                      xs={6}
                      sm={4}
                      md={3}
                      lg={2}
                      className="time-slot-col"
                    >
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

export default AddBooking;
