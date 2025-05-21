import React, { useEffect, useState } from "react";
import "../css/UserBookings.css";
import useAuthUser from "react-auth-kit/hooks/useAuthUser";
import ViewOfferButton from "./DisplayOfferModal.component"; 

const UserBookings = ({ display }) => {
  const [bookings, setBookings] = useState([]);
  const authUser = useAuthUser();
  const email = authUser.email;

  useEffect(() => {
    // Fetch bookings from the backend and update the state
    const fetchBookings = async () => {
      try {
        const response = await fetch(
          process.env.REACT_APP_API_URL + "/bookings/userbookings",
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
    if (!window.confirm("Are you sure you want to delete this booking?")) {
      return;
    }

    fetch(`${process.env.REACT_APP_API_URL}/bookings/deleteone/${bookingId}`, {
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
        alert(data.message);
        window.location.reload();
      })
      .catch((error) => {
        console.error("Error:", error);
        alert("Error deleting booking");
      });
  }

  function cancelBooking(bookingId, bookingDate) {
    const today = new Date();
    if (!window.confirm("Are you sure you want to cancel this booking?")) {
      return;
    } else if (bookingDate - today < 24 * 60 * 60 * 1000) {
      alert("Cannot cancel booking within 24 hours");
      return;
    }

    fetch(`${process.env.REACT_APP_API_URL}/bookings/deleteone/${bookingId}`, {
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
        alert("Booking cancelled successfully");
        window.location.reload();
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
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th></th>
                <th>Location</th>
                <th>Duration (min)</th>
                <th>Date</th>
                <th>Time</th>
                <th>Applied Offer</th>
                <th></th>
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
                  bookingDate.setHours(
                    Math.floor(booking.startingTime / 60),
                    booking.startingTime % 60,
                    0,
                    0
                  );
                  const isAfterToday = bookingDate >= today;

                  return (
                    <tr key={booking._id}>
                      <td></td>
                      <td>{booking.restaurantName}</td>
                      <td>{booking.duration}</td>
                      <td>{bookingDate.toLocaleDateString("en-GB")}</td>
                      <td>{booking.formattedStartingTime}</td>
                      <td>
                        {booking.offerId ? (
                          <ViewOfferButton offerId={booking.offerId} />
                        ) : (
                          <span style={{ color: "#888" }}>—</span>
                        )}
                      </td>
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
                        <td>
                          <button
                            className="btn btn-danger"
                            onClick={() =>
                              cancelBooking(booking._id, bookingDate)
                            }
                            id="cancelButton"
                          >
                            Cancel
                          </button>
                        </td>
                      )}

                      {!isAfterToday && (
                        <td>
                          <button
                            className="btn btn-warning"
                            onClick={() => deleteBooking(booking._id)}
                            id="deleteButton"
                          >
                            Delete
                          </button>
                        </td>
                      )}

                      <td>
                        {!isAfterToday && (
                          <button
                            className="btn btn-primary"
                            onClick={() =>
                              (window.location = `/ratebooking/${booking._id}`)
                            }
                            id="rateButton"
                          >
                            Rate
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
                  <td></td>
                  <td></td>
                  <td>
                    <button
                      className="view-all"
                      onClick={() => (window.location = "/userBookings")}
                    >
                      <div>View All</div>
                    </button>
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      ) : (
        <p>No bookings found. {email}</p>
      )}
    </div>
  );
};

export default UserBookings;
