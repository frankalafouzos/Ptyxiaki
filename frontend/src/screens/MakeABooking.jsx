import React, { useState } from "react";
import "../css/Form.css";
import Form from "react-bootstrap/Form";
import DateInputComponent from "../components/DatePicker.component";

const MakeABooking = () => {
  const [bookingData, setBookingData] = useState({
    name: "",
    date: "",
    time: "",
  });

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

  const handleSubmit = (e) => {
    e.preventDefault();
    // Add your booking submission logic here
  };

  return (
    <div>
      <form className="form" onSubmit={handleSubmit}>
        <h1 className="title">Make a Booking</h1>

        <input
          type="text"
          name="name"
          placeholder="Name"
          value={bookingData.name}
          onChange={handleInputChange}
        />
        <DateInputComponent onDateChange={handleDateChange} />
        <Form.Select
          name="time"
          value={bookingData.time}
          onChange={handleInputChange}
        >
          <option value="09:00">09:00 AM</option>
          <option value="09:30">09:30 AM</option>
          {/* Add more options as needed */}
          <option value="17:30">05:30 PM</option>
          <option value="18:00">06:00 PM</option>
        </Form.Select>
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default MakeABooking;
