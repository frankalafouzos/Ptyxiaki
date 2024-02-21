import React, { useState } from 'react';

const MakeABooking = () => {
  const [bookingData, setBookingData] = useState({
    name: '',
    date: '',
    time: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBookingData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Add your booking submission logic here
  };

  return (
    <div>
      <h1>Make a Booking</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Name:
          <input
            type="text"
            name="name"
            value={bookingData.name}
            onChange={handleInputChange}
          />
        </label>
        <label>
          Date:
          <input
            type="date"
            name="date"
            value={bookingData.date}
            onChange={handleInputChange}
          />
        </label>
        <label>
          Time:
          <input
            type="time"
            name="time"
            value={bookingData.time}
            onChange={handleInputChange}
          />
        </label>
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default MakeABooking;
