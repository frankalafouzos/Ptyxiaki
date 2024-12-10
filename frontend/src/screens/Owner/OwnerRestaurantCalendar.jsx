import React, { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { useParams } from "react-router-dom";
import { Container, Modal, Table, Button, Form } from "react-bootstrap";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../../css/Owner/OwnerRestaurantCalendar.css";

const OwnerRestaurantCalendar = () => {
  const { restaurantId } = useParams();
  const [capacityData, setCapacityData] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [closedDates, setClosedDates] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [capacityResponse, closedDatesResponse] = await Promise.all([
          fetch(`http://localhost:5000/restaurants/restaurant-capacities/${restaurantId}`),
          fetch(`http://localhost:5000/restaurants/${restaurantId}/closedDates`),
        ]);

        if (!capacityResponse.ok || !closedDatesResponse.ok) {
          throw new Error("Failed to fetch data.");
        }

        const capacityData = await capacityResponse.json();
        const closedDatesData = await closedDatesResponse.json();

        setCapacityData(capacityData);
        setClosedDates(closedDatesData);
      } catch (error) {
        toast.error("Failed to load data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [restaurantId]);

  const handleDateClick = async (info) => {
    const date = info.dateStr;
    setSelectedDate(date);

    try {
      const response = await fetch(
        `http://localhost:5000/restaurants/${restaurantId}/bookings/${date}`
      );
      if (!response.ok) throw new Error("Failed to fetch bookings for the selected date.");
      const data = await response.json();
      setBookings(data);
      setShowModal(true);
    } catch (error) {
      toast.error("Failed to fetch bookings for the selected date.");
    }
  };

  const handleCloseForDay = async () => {
    try {
      if (bookings.length > 0) {
        toast.error("Cannot close the day as there are existing bookings.");
        return;
      }

      const response = await fetch(`http://localhost:5000/restaurants/${restaurantId}/close`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: selectedDate }),
      });

      if (!response.ok) throw new Error("Failed to close the day.");
      setClosedDates([...closedDates, selectedDate]);
      toast.success("Day closed successfully.");
      setShowModal(false);
    } catch (error) {
      toast.error("Failed to close the day.");
    }
  };

  const handleRemoveClosedDate = async (date) => {
    try {
      const response = await fetch(`http://localhost:5000/restaurants/${restaurantId}/closedDates`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date }),
      });

      if (!response.ok) throw new Error("Failed to remove closed date.");
      setClosedDates(closedDates.filter((d) => d !== date));
      toast.success("Closed date removed successfully.");
    } catch (error) {
      toast.error("Failed to remove closed date.");
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setBookings([]);
  };

  const events = [
    ...capacityData.map(({ date, capacityPercentage }) => ({
      title: `${capacityPercentage}% Capacity`,
      date,
      backgroundColor: capacityPercentage > 80 ? "#ff5252" : "#4caf50",
      textColor: "white",
    })),
    ...closedDates.map((date) => ({
      title: "Closed",
      date,
      backgroundColor: "#f44336",
      textColor: "white",
    })),
  ];

  return (
    <Container className="calendar-container pb-5">
      <ToastContainer />
      <h2 className="text-center my-4">Restaurant Capacity Calendar</h2>
      {loading ? (
        <div className="text-center">Loading...</div>
      ) : (
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          events={events}
          dateClick={handleDateClick}
          className="m-4 p-4"
        />
      )}

      <Modal show={showModal} onHide={closeModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Bookings for {selectedDate}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {bookings.length > 0 ? (
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Party Size</th>
                  <th>Contact</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking._id}>
                    <td>
                      {`${Math.floor(booking.startingTime / 60)}:${(booking.startingTime % 60)
                        .toString()
                        .padStart(2, "0")}`}
                    </td>
                    <td>{booking.partySize}</td>
                    <td>{booking.phone}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <p>No bookings found for this date.</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeModal}>
            Close
          </Button>
          <Button variant="danger" onClick={handleCloseForDay}>
            Close for the Day
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default OwnerRestaurantCalendar;
