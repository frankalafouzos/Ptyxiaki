import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Container, Modal, Table, Button, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import '../../css/Owner/OwnerRestaurantCalendar.css';

const OwnerRestaurantCalendar = ({ restaurantId }) => {
  const [events, setEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const startDate = new Date(new Date().setFullYear(new Date().getFullYear() - 2)).toISOString();
        const endDate = new Date(new Date().setMonth(new Date().getMonth() + 5)).toISOString();

        const response = await fetch(`http://localhost:5000/calendar/${restaurantId}?startDate=${startDate}&endDate=${endDate}`);

        if (!response.ok) {
          throw new Error("Failed to fetch data.");
        }

        const data = await response.json();
        console.log("Fetched data:", data); // Debugging log

        const formattedEvents = data.map(day => {
          const backgroundColor = day.closed ? '#f44336' : day.percentageBooked > 80 ? '#ff5252' : day.percentageBooked > 50 ? '#ff9800' : day.percentageBooked > 0 ? '#ffeb3b' : '#4caf50';

          return {
            title: day.closed ? "Closed" : `${day.bookingsCount} bookings`,
            start: new Date(day.date),
            end: new Date(day.date),
            allDay: true,
            backgroundColor,
            textColor: 'white',
          };
        });

        console.log("Formatted events:", formattedEvents); // Debugging log

        setEvents(formattedEvents);
      } catch (error) {
        console.error("Failed to load data:", error);
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
      const response = await fetch(`http://localhost:5000/calendar/${restaurantId}/bookings/${date}`);
      if (!response.ok) throw new Error("Failed to fetch bookings for the selected date.");
      const data = await response.json();
      console.log("Fetched bookings for date:", date, data); // Debugging log
      setBookings(data.sort((a, b) => a.startingTime - b.startingTime));
      setShowModal(true);
    } catch (error) {
      console.error("Failed to fetch bookings for the selected date:", error);
    }
  };

  const handleRemoveBooking = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/calendar/remove-booking/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to remove booking.");
      setBookings(bookings.filter(booking => booking._id !== id));
    } catch (error) {
      console.error("Failed to remove booking:", error);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setBookings([]);
  };

  const categorizeBookings = (bookings) => {
    const morning = bookings.filter(booking => booking.startingTime < 720);
    const afternoon = bookings.filter(booking => booking.startingTime >= 720 && booking.startingTime < 1080);
    const evening = bookings.filter(booking => booking.startingTime >= 1080);
    return { morning, afternoon, evening };
  };

  const { morning, afternoon, evening } = categorizeBookings(bookings);

  const handleAddBookingClick = () => {
    console.log("Navigating to add booking with selected date:", selectedDate); // Debugging log
    navigate(`/owner/add-booking/${restaurantId}`, { state: { selectedDate } });
  };

  const isFutureDate = (date, time) => {
    const today = new Date();
    const selected = new Date(date);
    if (selected > today) {
      return true;
    } else if (selected.toDateString() === today.toDateString()) {
      const [hours, minutes] = time.split(":").map(Number);
      const selectedTime = hours * 60 + minutes;
      const currentTime = today.getHours() * 60 + today.getMinutes();
      return selectedTime > currentTime;
    }
    return false;
  };

  return (
    <Container className="calendar-container pb-5">
      <style>
        {`
          .fc-daygrid-day-number {
            text-decoration: none;
          }
          .fc .fc-daygrid-day-frame {
            height: 100%;
          }
        `}
      </style>
      <h2 className="text-center my-4">Restaurant Capacity Calendar</h2>
      {loading ? (
        <div className="text-center">Loading...</div>
      ) : (
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          events={events}
          dateClick={handleDateClick}
          eventContent={(eventInfo) => (
            <div style={{ backgroundColor: eventInfo.event.backgroundColor, color: eventInfo.event.textColor }}>
              <b>{eventInfo.timeText}</b>
              <i>{eventInfo.event.title}</i>
            </div>
          )}
          height="auto"
          className="m-4 p-4"
        />
      )}

      <Modal show={showModal} onHide={closeModal} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Bookings for {selectedDate}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {bookings.length > 0 ? (
            <>
              <h5 className="mt-3">Morning</h5>
              <Table striped bordered hover className="mb-4">
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>Party Size</th>
                    <th>Contact</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {morning.map((booking) => (
                    <tr key={booking._id}>
                      <td>{`${Math.floor(booking.startingTime / 60)}:${(booking.startingTime % 60).toString().padStart(2, "0")}`}</td>
                      <td>{booking.partySize}</td>
                      <td>{booking.phone}</td>
                      <td>
                        {isFutureDate(selectedDate, `${Math.floor(booking.startingTime / 60)}:${(booking.startingTime % 60).toString().padStart(2, "0")}`) && (
                          <Button variant="danger" onClick={() => handleRemoveBooking(booking._id)}>Remove</Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
              <h5 className="mt-3">Afternoon</h5>
              <Table striped bordered hover className="mb-4">
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>Party Size</th>
                    <th>Contact</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {afternoon.map((booking) => (
                    <tr key={booking._id}>
                      <td>{`${Math.floor(booking.startingTime / 60)}:${(booking.startingTime % 60).toString().padStart(2, "0")}`}</td>
                      <td>{booking.partySize}</td>
                      <td>{booking.phone}</td>
                      <td>
                        {isFutureDate(selectedDate, `${Math.floor(booking.startingTime / 60)}:${(booking.startingTime % 60).toString().padStart(2, "0")}`) && (
                          <Button variant="danger" onClick={() => handleRemoveBooking(booking._id)}>Remove</Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
              <h5 className="mt-3">Evening</h5>
              <Table striped bordered hover className="mb-4">
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>Party Size</th>
                    <th>Contact</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {evening.map((booking) => (
                    <tr key={booking._id}>
                      <td>{`${Math.floor(booking.startingTime / 60)}:${(booking.startingTime % 60).toString().padStart(2, "0")}`}</td>
                      <td>{booking.partySize}</td>
                      <td>{booking.phone}</td>
                      <td>
                        {isFutureDate(selectedDate, `${Math.floor(booking.startingTime / 60)}:${(booking.startingTime % 60).toString().padStart(2, "0")}`) && (
                          <Button variant="danger" onClick={() => handleRemoveBooking(booking._id)}>Remove</Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </>
          ) : (
            <p>No bookings found for this date.</p>
          )}
          {isFutureDate(selectedDate, "23:59") && (
            <Button variant="primary" onClick={handleAddBookingClick}>
              Add a Booking
            </Button>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default OwnerRestaurantCalendar;
