import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Container, Modal, Table, Button } from 'react-bootstrap';
import '../../css/Owner/OwnerRestaurantCalendar.css';

const OwnerRestaurantCalendar = ({ restaurantId }) => {
  const [capacityData, setCapacityData] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchCapacityData = async () => {
      try {
        const response = await fetch(`http://localhost:5000/restaurants/${restaurantId}/capacity`);
        if (!response.ok) {
          throw new Error('Failed to fetch capacity data');
        }
        const data = await response.json();
        setCapacityData(data);
      } catch (error) {
        console.error('Error fetching capacity data:', error);
      }
    };

    fetchCapacityData();
  }, [restaurantId]);

  const handleDateClick = async (info) => {
    const date = info.dateStr;
    setSelectedDate(date);

    try {
      const response = await fetch(`http://localhost:5000/restaurants/${restaurantId}/bookings/${date}`);
      if (!response.ok) {
        throw new Error('Failed to fetch bookings for the selected date');
      }
      const data = await response.json();
      setBookings(data);
      setShowModal(true);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  const closeModal = () => setShowModal(false);

  // Convert capacity data into events for FullCalendar
  const events = capacityData.map(({ date, capacityPercentage }) => ({
    title: `${capacityPercentage}% Capacity`,
    date,
    backgroundColor: capacityPercentage > 80 ? 'red' : 'green',
    textColor: 'white',
  }));

  return (
    <Container className="calendar-container">
      <h2 className="text-center my-4">Restaurant Capacity Calendar</h2>
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        events={events}
        dateClick={handleDateClick}
      />

      <Modal show={showModal} onHide={closeModal}>
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
                    <td>{`${Math.floor(booking.startingTime / 60)}:${(booking.startingTime % 60).toString().padStart(2, '0')}`}</td>
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
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default OwnerRestaurantCalendar;
