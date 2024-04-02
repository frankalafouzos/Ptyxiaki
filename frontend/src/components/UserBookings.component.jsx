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

  function deleteBooking(bookingId) {
    // Confirm before deleting
    if (!window.confirm("Are you sure you want to delete this booking?")) {
      return;
    }

    // Make the DELETE request
    fetch(`http://localhost:5000/bookings/deleteone/${bookingId}`, {
      method: "DELETE",
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to delete booking");
        }
        return response.json();
      })
      .then((data) => {
        console.log(data.message);
        // Optionally, you can refresh the data on the page or redirect
        alert(data.message);
        window.location.reload(); // Reload the page to update the list
      })
      .catch((error) => {
        console.error("Error:", error);
        alert("Error deleting booking");
      });
  }

  function cancelBooking(bookingId, bookingDate) {
    // Confirm before deleting
    const today = new Date();
    if (!window.confirm("Are you sure you want to cancel this booking?")) {
      return;
    } else if (bookingDate - today < 24 * 60 * 60 * 1000) {
      alert("Cannot cancel booking within 24 hours");
      return;
    }

    // Make the Cancel request
    fetch(`http://localhost:5000/bookings/deleteone/${bookingId}`, {
      method: "DELETE",
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to delete booking");
        }
        return response.json();
      })
      .then((data) => {
        console.log("Booking cancelled successfully");
        // Optionally, you can refresh the data on the page or redirect
        alert("Booking cancelled successfully");
        window.location.reload(); // Reload the page to update the list
      })
      .catch((error) => {
        console.error("Error:", error);
        alert("Error deleting booking");
      });
  }

  return (
    <div className="Container">
      <h2 className="title">Your Bookings</h2>
      {bookings.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th></th>
              <th>Location</th>
              <th>Duration (min)</th>
              <th>Date</th>
              <th>Time</th>
              <th></th>
              <th></th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {bookings
              .slice(0, display && display !== "" ? display : bookings.length)
              .map((booking) => {
                const today = new Date();
                const bookingDate = new Date(booking.date);
                bookingDate.setHours(Math.floor(booking.startingTime / 60), booking.startingTime % 60, 0, 0);
                const isAfterToday = bookingDate >= today;

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
                      {!isAfterToday && <span>Cannot edit</span>}
                    </td>

                    {isAfterToday && (
                      <>
                        <td>
                          <button
                            className="btn btn-danger"
                            onClick={() => alert(`Today's Date: ${today}, Booking Date: ${bookingDate}, isAfterToday: ${isAfterToday}`)}
                            id="cancelButton"
                          >
                            Cancel
                          </button>
                        </td>
                      </>
                    )}

                    {!isAfterToday && (
                      <td>
                        <button
                          className="btn btn-warning"
                          onClick={() => alert(`Today's Date: ${today}, Booking Date: ${bookingDate}, isAfterToday: ${isAfterToday}`)}
                          id="deleteButton"
                        >
                          Delete
                        </button>
                      </td>
                    )}
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
