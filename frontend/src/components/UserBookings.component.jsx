import React, { useEffect, useState } from "react";
import "../css/UserBookings.css";
import useAuthUser from "react-auth-kit/hooks/useAuthUser";

const UserBookings = ({ display }) => {
  const [bookings, setBookings] = useState([]);
  const authUser = useAuthUser();
  const email = authUser.email;

  useEffect(() => {
    // Fetch bookings from the backend and update the state
    const fetchBookings = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/bookings/userbookings",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ email: email }),
          }
        ); // Replace with your backend API endpoint
        const data = await response.json();
        setBookings(data);
      } catch (error) {
        console.error("Error fetching bookings:", error);
      }
    };

    fetchBookings();
  }, []);

  return (
    <div className="Container">
      <h2 className="title">Your Bookings</h2>
      {bookings.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th></th>
              <th>Location</th>
              <th>Duration</th>
              <th>Date</th>
              <th>Time</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {bookings
              .slice(0, display && display !== "" ? display : bookings.length)
              .map((booking) => {
                const today = new Date();
                const bookingDate = new Date(booking.date);
                const isAfterToday = bookingDate > today;

                return (
                  <tr key={booking._id}>
                    <td></td>
                    <td>{booking.restaurantName}</td>
                    <td>{booking.duration}</td>
                    <td>{bookingDate.toLocaleDateString("en-GB")}</td>
                    <td>{booking.formattedStartingTime}</td>
                    <td>
                      {isAfterToday && (
                        <button
                          onClick={() =>
                            (window.location = `/editbooking/${booking._id}`)
                          }
                          id="editButton"
                        >
                          Edit
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            {display ? (
              <tr>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td>
                  <button onClick={() => (window.location = "/userBookings")}>
                    View All
                  </button>
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      ) : (
        <p>No bookings found. {email}</p>
      )}
    </div>
  );
};

export default UserBookings;
