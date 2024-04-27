import React, { useState } from "react";
import "../css/Form.css";
import Form from "react-bootstrap/Form";
import DateInputComponent from "../components/DatePicker.component";
import { Button } from "react-bootstrap";
import "../css/MakeABooking.css";
import { useNavigate } from 'react-router-dom';

const MakeABooking = () => {
  const [bookingData, setBookingData] = useState({
    partySize: 0, // Initialize partySize in your state
    date: new Date().toISOString().split("T")[0], // Initialize date in your state with today's date in YYYY-MM-DD format
  });
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const [availability, setAvailability] = useState([]); // New state for storing availability data

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




  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // Start loading
    const urlSegments = window.location.pathname.split("/");
    const restaurantId = urlSegments[urlSegments.length - 1];

    // Convert data to query parameters
    const queryParams = new URLSearchParams({
      date: bookingData.date,
      partyNumber: bookingData.partySize,
    }).toString();

    const requestUrl = `http://localhost:3000/bookings/availability/${restaurantId}?${queryParams}`;

    try {
      const response = await fetch(requestUrl, {
        method: "GET", // GET requests should not have a body
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();   
      setAvailability(data); // Update the availability state with the fetched data
      setLoading(false);
    } catch (error) {
      console.error("Error fetching availability:", error);
    }
  };


  const handleTimeSelect = (time) => {
    const urlSegments = window.location.pathname.split("/");
    const restaurantId = urlSegments[urlSegments.length - 1];
    navigate(`/restaurant/${restaurantId}/confirmBooking`, {
      state: {
        date: bookingData.date,
        time: time,
        partySize: bookingData.partySize,
        restaurantId: restaurantId,
      }
    });
  };

  return (
    <div>
      <form className="form" onSubmit={handleSubmit}>
        <h1 className="title">Make a Booking</h1>
        <DateInputComponent onDateChange={handleDateChange} />
        <input
          type="number"
          id="partySize"
          placeholder="Party Size"
          name="partySize"
          onChange={handleInputChange}
          value={bookingData.partySize}
        />
         <p className="note">Note: We can only make reservations for up to 8 people. Contact the restaurant/coffee shop if your party is larger.</p>
        <button type="submit">Search for available hours</button>
      </form>
      {/* Render available times */}
      <div className="availability-container">
        {loading ? (
          <div className="loader"></div>
        ) : (
          availability.filter((slot) => slot.available).length > 0 && (
            <>
              <h2>Available Times</h2>
              <ul className="time-slots">
                {availability
                  .filter((slot) => slot.available)
                  .map((slot, index) => (
                    <li key={index} className="time-slot">
                      <button onClick={() => handleTimeSelect(slot.time)}>
                        {slot.time}
                      </button>
                    </li>
                  ))}
              </ul>
            </>
          )
        )}
      </div>
    </div>
  );
};

export default MakeABooking;
