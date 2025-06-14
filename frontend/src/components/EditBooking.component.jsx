import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Form, Button, Container, Row, Col, Alert } from "react-bootstrap";
import DateInputComponent from "./DatePicker.component";
import "../css/MakeABooking.css";

const EditBooking = () => {
  const bookingID = useParams().id;
  const navigate = useNavigate();
  const [bookingData, setBookingData] = useState({
    partySize: 1,
    date: new Date().toISOString().split("T")[0],
    phone: "",
  });
  const [userData, setUserData] = useState({});
  const [originalBooking, setOriginalBooking] = useState({});
  const [loading, setLoading] = useState(true);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [availability, setAvailability] = useState([]);
  const [closedMessage, setClosedMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Fetch booking data on component mount
  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/bookings/getonebyid?id=${bookingID}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        const data = await response.json();
        
        // Format the date to YYYY-MM-DD
        const formattedDate = data.date 
          ? new Date(data.date).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0];
          
        // Convert startingTime (minutes from midnight) to HH:MM format
        const hours = Math.floor(data.startingTime / 60);
        const minutes = data.startingTime % 60;
        const formattedTime = `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
          
        const formattedData = {
          ...data,
          date: formattedDate,
          partySize: data.partySize || 1,
          time: formattedTime,
          restaurantId: data.restaurantid || data.restaurantId,
          phone: data.phone || "",
          duration: data.duration || 120,
        };
        
        setBookingData(formattedData);
        setOriginalBooking(formattedData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching booking:", error);
        setErrorMessage("Unable to fetch booking details. Please try again.");
        setLoading(false);
      }
    };
    
    fetchBooking();
  }, [bookingID]);

  // Fetch user data when booking data is available
  useEffect(() => {
    const fetchUser = async (userId) => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/users/getuserbyid?id=${userId}`,
          {
            method: "GET",
          }
        );
        const data = await response.json();
        setUserData(data);
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };
    
    if (bookingData.userid && !userData.firstname) {
      fetchUser(bookingData.userid);
    }
  }, [bookingData, userData.firstname]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBookingData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
    
    // Clear availability when inputs change
    setAvailability([]);
  };

  const handleDateChange = (newDate) => {
    setBookingData((prevState) => ({
      ...prevState,
      date: newDate,
    }));
    
    // Clear availability when date changes
    setAvailability([]);
  };

  // Check availability for the selected date and party size
  const checkAvailability = async (e) => {
    e.preventDefault();
    setUpdateLoading(true);
    setClosedMessage("");
    setErrorMessage("");
    
    const restaurantId = bookingData.restaurantid || bookingData.restaurantId;
    const queryParams = new URLSearchParams({
      date: bookingData.date,
      partyNumber: bookingData.partySize,
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
      
      if (data.message) {
        setClosedMessage(data.message);
        setAvailability([]);
      } else {
        setClosedMessage("");
        
        // Mark the original time slot as selected if it's for the same date
        if (bookingData.date === originalBooking.date) {
          const updatedAvailability = data.map(slot => ({
            ...slot,
            isOriginalTime: slot.time === originalBooking.time
          }));
          setAvailability(updatedAvailability);
        } else {
          setAvailability(data);
        }
      }
      
      setUpdateLoading(false);
    } catch (error) {
      console.error("Error fetching availability:", error);
      setErrorMessage("Unable to check availability. Please try again.");
      setUpdateLoading(false);
    }
  };

  // Handle time selection and booking update
  const handleTimeSelect = async (time) => {
    setUpdateLoading(true);
    setErrorMessage("");
    
    // Calculate table capacity based on party size
    let tableCapacity = 2;
    if (bookingData.partySize > 2 && bookingData.partySize <= 4) {
      tableCapacity = 4;
    } else if (bookingData.partySize > 4 && bookingData.partySize <= 6) {
      tableCapacity = 6;
    } else if (bookingData.partySize > 6) {
      tableCapacity = 8;
    }
    
    // Convert time (HH:MM) to minutes from midnight
    const [hours, minutes] = time.split(":").map(Number);
    const startingTime = hours * 60 + minutes;
    
    // Calculate ending time based on duration
    const endingTime = startingTime + (originalBooking.duration || 120);
    
    // Prepare updated booking data
    const updatedBooking = {
      userid: originalBooking.userid,
      restaurantid: originalBooking.restaurantid,
      date: new Date(bookingData.date),
      startingTime: startingTime,
      endingTime: endingTime,
      partySize: parseInt(bookingData.partySize),
      tableCapacity: tableCapacity,
      phone: bookingData.phone || originalBooking.phone,
      duration: originalBooking.duration || 120,
    };
    
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/bookings/edit/${bookingID}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedBooking),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setSuccessMessage("Booking updated successfully!");
        setTimeout(() => {
          navigate(-1); // Go back after successful update
        }, 1500);
      } else {
        setErrorMessage(data.message || "Failed to update booking. Please try again.");
      }
      
      setUpdateLoading(false);
    } catch (error) {
      console.error("Error updating booking:", error);
      setErrorMessage("An error occurred while updating your booking. Please try again.");
      setUpdateLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="global-spinner">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <Container className="booking-container">
      {successMessage && (
        <Alert variant="success" className="mb-3">
          {successMessage}
        </Alert>
      )}
      
      {errorMessage && (
        <Alert variant="danger" className="mb-3">
          {errorMessage}
        </Alert>
      )}
      
      <Form className="booking-form" onSubmit={checkAvailability}>
        <h1 className="booking-title">Edit Booking</h1>
        
        {userData.firstname && (
          <Alert variant="info" className="mb-3">
            Booking for: {userData.firstname} {userData.lastname}
          </Alert>
        )}
        
        <Form.Group controlId="date" className="mb-3">
          <Form.Label>Date:</Form.Label>
          <DateInputComponent 
            onDateChange={handleDateChange} 
            widthofInput="100%" 
            initialValue={bookingData.date}
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
            value={bookingData.partySize}
            onChange={handleInputChange}
            required
          />
          <Form.Text className="text-muted">
            Note: We can only make reservations for up to 8 people.
          </Form.Text>
        </Form.Group>
        
        <Form.Group controlId="phone" className="mb-3">
          <Form.Label>Phone Number:</Form.Label>
          <Form.Control
            type="tel"
            name="phone"
            placeholder="Phone Number"
            value={bookingData.phone}
            onChange={handleInputChange}
            required
          />
        </Form.Group>
        
        <Form.Group controlId="currentBooking" className="mb-3">
          <Form.Label>Current Booking:</Form.Label>
          <div className="current-booking-details">
            <strong>Date:</strong> {new Date(originalBooking.date).toLocaleDateString()}<br />
            <strong>Time:</strong> {originalBooking.time}<br />
            <strong>Party Size:</strong> {originalBooking.partySize}
          </div>
        </Form.Group>
        
        <Button 
          type="submit" 
          variant="primary" 
          className="w-100"
          disabled={updateLoading}
        >
          {updateLoading ? 'Checking...' : 'Check Availability'}
        </Button>
      </Form>
      
      {closedMessage && (
        <Alert variant="danger" className="mt-3">
          {closedMessage}
        </Alert>
      )}
      
      <div className="availability-container">
        {updateLoading ? (
          <div className="global-spinner">
            <div className="spinner"></div>
          </div>
        ) : (
          availability.length > 0 && (
            <>
              <h2 className="availability-title">Available Times</h2>
              <Row className="time-slots">
                {availability.filter(slot => slot.available || slot.isOriginalTime).map((slot, index) => (
                  <Col key={index} xs={6} sm={4} md={3} lg={2} className="time-slot-col">
                    <Button
                      onClick={() => handleTimeSelect(slot.time)}
                      variant={slot.isOriginalTime ? "info" : "success"}
                      className={`time-slot-btn ${slot.isOriginalTime ? 'current-time' : ''}`}
                    >
                      {slot.time} {slot.isOriginalTime ? '(current)' : ''}
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

export default EditBooking;