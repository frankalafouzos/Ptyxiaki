import React, { useState, useEffect } from "react";
import useAuthUser from "react-auth-kit/hooks/useAuthUser";
import { useLocation } from "react-router-dom";
import { fetchUser } from "../scripts/fetchUser";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const formatTime = (time) => {
  // Assuming time is something like "1:00" or "9:30", convert it to "01:00" or "09:30"
  if (!time) return "";
  const [hours, minutes] = time.split(":");
  return `${hours.padStart(2, "0")}:${minutes}`;
};

// Use formatTime when setting the initial time state

const ConfirmBooking = () => {
  const location = useLocation();
  const authUser = useAuthUser();
  const email = authUser.email; // Make sure this correctly calls the function

  // Initial state setup based on passed state or default values
  const initialState = {
    userid: "",
    restaurantId: location.state?.restaurantId || "",
    name: "",
    date: location.state?.date || "",
    time: formatTime(location.state?.time),
    partySize: location.state?.partySize || "",
    phone: "",
  };

  const [reservation, setReservation] = useState(initialState);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState({
    firstname: "",
    lastname: "",
  });

  // Fetch user data
  useEffect(() => {
    const fetchData = async () => {
      if (email) {
        try {
          await fetchUser(email, setLoading, setUser); // Assuming fetchUser correctly fetches the user data
        //   setReservation((prevState) => ({
        //     ...prevState,
        //     userid: user._id,
        //     name: `${user.firstname} ${user.lastname}`,
        //   }));
        } catch (error) {
          console.error("Failed to fetch user data:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchData();
  }, [email]);

  // Set user name once user data is fetched
  useEffect(() => {
    if (user) {
      setReservation((prevState) => ({
        ...prevState,
        userid: user._id,
        name: `${user.firstname} ${user.lastname}`,
      }));
    }
  }, [user]); // Depend on user state

  const handleChange = (e) => {
    const { name, value } = e.target;
    setReservation((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Submitting reservation:", reservation);
    try {
      const response = await fetch("http://localhost:5000/bookings/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(reservation),
      });
      if (response.ok) {
        const responseData = await response.json();
        console.log(`Reservation created successfully ${responseData.id}`);
        toast.success("Reservation created successfully", {
          position: "top-center",
          autoClose: 2000,
          onClose: () => window.location.replace(`http://localhost:3000/bookingThankYou/${responseData.id}`)
        })
        // Handle success case here
      } else {
        const responseData = await response.json();
        console.error("Failed to create reservation"+response.status+response.message);
        toast.error("Failed to create reservation", {
          position: "top-center",
          autoClose: 2000,
          onClose: () => window.location.replace(`http://localhost:3000/restaurant/${reservation.restaurantId}`)
          });
      }
    } catch (error) {
      console.error("Failed to create reservation:", error);
      toast.error("Failed to create reservation", {
        position: "top-center",
        autoClose: 2000,
        onClose: () => window.location.replace(`http://localhost:3000/restaurant/${reservation.restaurantId}`)
        });
    }
  };
  

  if (loading) return <div>Loading user data...</div>;

  return (
    <form className="form" onSubmit={handleSubmit}>
      <h1 className="title" >Confirm Your Reservation</h1>
      <label htmlFor="name">Name</label>
      <input
        type="text"
        id="name"
        name="name"
        value={reservation.name}
        onChange={handleChange}
        placeholder="Name"
        disabled
      />
      <label htmlFor="date">Date</label>
      <input
        type="date"
        id="date"
        name="date"
        value={reservation.date}
        onChange={handleChange}
        disabled
      />
      <label htmlFor="time">Time</label>
      <input
        type="time"
        id="time"
        name="time"
        value={reservation.time}
        onChange={handleChange}
        disabled
      />
      <label htmlFor="partySize">Party Size</label>
      <input
        type="number"
        id="partySize"
        name="partySize"
        value={reservation.partySize}
        onChange={handleChange}
        placeholder="Party Size"
        disabled
      />
      <label htmlFor="phone">Contact Phone</label>
      <input
        type="phone"
        id="phone"
        name="phone"
        value={reservation.phone}
        onChange={handleChange}
        placeholder="Contact Phone"
        required
      />
      <button type="submit">Confirm Your Reservation</button>
    </form>
  );
};

export default ConfirmBooking;
