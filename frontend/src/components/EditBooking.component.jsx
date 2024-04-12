import { Component } from 'react';
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import DateInputComponent from "../components/DatePicker.component";

const EditBooking = () => {
    
    const bookingID = useParams().id;
    const [bookingData, setBookingData] = useState({});
    const [userData, setUserData] = useState({});
  
    // Fetch booking data on component mount
    useEffect(() => {
      const fetchBooking = async () => {
        try {
          const response = await fetch(
            "http://localhost:5000/bookings/getonebyid?id=" + bookingID,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
              },
            }
          );
          const data = await response.json();
          setBookingData(data);
        } catch (error) {
          console.error("Error fetching booking:", error);
        }
      };
      if (!bookingData.phone) {
        fetchBooking();
      }
    }, []); 
  
    useEffect(() => {
      const fetchUser = async (userId) => {
        try {
          const response = await fetch(
            `http://localhost:5000/users/getuserbyid?id=` + userId, // Assuming your API can accept userId as a path parameter
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
        console.log("The user id id" + bookingData.userid);
        fetchUser(bookingData.userid); // Pass the userid to fetchUser
      }
    }, [bookingData]); // Only re-run when bookingID changes
  
    // Handle form submission
    const handleSubmit = (e) => {
      e.preventDefault();
      // Handle form submission logic here
    };

    const handleDateChange = (newDate) => {
      setBookingData((prevState) => ({
        ...prevState,
        date: newDate,
      }));
    };
  
  
    return (
      <div>
        
  
        {/* Render form here */}
        <form className="form" onSubmit={handleSubmit}>
          <h1 className="title">Edit Booking</h1>
          <div style={{ display:"flex", flexDirection: "column", width:"50%", justifyContent:"center"}}>
            <label htmlFor="partySize">Party Size</label>
            <input style={{  width:"100%"}} placeholder='Party Size' type="number" name="partySize" id="partySize" value={bookingData.partySize} />
          </div>
          <div style={{ display:"flex", flexDirection: "column", width:"50%", justifyContent:"center"}}>
            <label htmlFor="partySize">Party Size</label>
            <DateInputComponent onDateChange={handleDateChange} widthofInput="100%" />
          </div>
          <button type="submit">Check availability</button>
        </form>
      </div>
    );
    
}

export default EditBooking;