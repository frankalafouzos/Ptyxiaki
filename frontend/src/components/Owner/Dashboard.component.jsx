import React, { useEffect, useState } from "react";
import { Bar, Line } from "react-chartjs-2";
import "chart.js/auto";
import { Container, Row, Col, Card, Spinner, Alert } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

const Dashboard = ({ restaurantId, year = new Date().getFullYear(), from }) => {
  const [restaurant, setRestaurant] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalBookings: 0,
    totalGuests: 0,
    averageGuestsPerBooking: 0,
    busiestHour: null,
    bookingsPerDay: {},
    bookingsPerHour: Array(24).fill(0), // Initialize bookings per hour
  });

  useEffect(() => {
    const fetchRestaurantData = async () => {
      try {
        console.log(`Fetching restaurant data for ID: ${restaurantId}`);
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/restaurants/${restaurantId}`
        );
        if (!response.ok)
          throw new Error(`Restaurant not found: ${response.statusText}`);
        const data = await response.json();
        console.log("Received restaurant data:", data);
        setRestaurant(data.restaurant);
      } catch (error) {
        console.error("Error fetching restaurant data:", error);
        setError(`Error fetching restaurant data: ${error.message}`);
      }
    };

    const fetchBookingData = async () => {
      try {
        console.log(`Fetching bookings for restaurant ID: ${restaurantId}`);
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/bookings/getbookings/${restaurantId}`
        );
        if (!response.ok)
          throw new Error(`Bookings not found: ${response.statusText}`);
        const data = await response.json();
        console.log("Received bookings data:", data);
        setBookings(data);
      } catch (error) {
        console.error("Error fetching bookings data:", error);
        setError(`Error fetching bookings data: ${error.message}`);
      }
    };

    const fetchData = async () => {
      setLoading(true);
      await fetchRestaurantData();
      await fetchBookingData();
      console.log("Stats:", stats);
      setLoading(false);
    };

    fetchData();
  }, [restaurantId]);

  const calculateStats = async (bookings) => {
    const filteredBookings = bookings.filter((booking) => {
      const bookingYear = new Date(booking.date).getFullYear();
      return bookingYear === year;
    });

    const totalBookings = bookings.length;
    const totalBookingsThisYear = filteredBookings.length;
    const totalGuests = await bookings.reduce(
      (sum, booking) => sum + (booking.partySize || 0),
      0
    );
    const totalGuestsThisYear = await filteredBookings.reduce(
      (sum, booking) => sum + (booking.partySize || 0),
      0
    );
    const averageGuestsPerBooking = await Math.round(
      totalBookingsThisYear ? totalGuestsThisYear / totalBookingsThisYear : 0
    );
    const bookingsPerDay = await filteredBookings.reduce((acc, booking) => {
      const date = new Date(booking.date).toLocaleDateString();
      if (!acc[date]) acc[date] = 0;
      acc[date]++;
      return acc;
    }, {});
    const hours = await Array(24).fill(0);
    await bookings.forEach((booking) => {
      const hour = Math.floor(booking.startingTime / 60);
      if (hour >= 0 && hour < 24) {
        hours[hour]++;
      }
    });

    console.log("Bookings per hour:", hours);

    const maxBookings = Math.max(...hours);
    const busiestHour = maxBookings > 0 ? hours.indexOf(maxBookings) : null;

    setStats({
      totalBookings,
      totalGuests,
      averageGuestsPerBooking,
      busiestHour,
      bookingsPerDay,
      bookingsPerHour: hours, // Store bookings per hour in state
    });
  };

  useEffect(() => {
    if (bookings.length > 0) {
      calculateStats(bookings);
    }
  }, [bookings]);

  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "100vh" }}
      >
        <Spinner animation="border" />
      </div>
    );
  }

  if (error) return <Alert variant="danger">{error}</Alert>;
  if (!restaurant) return <Alert variant="warning">No restaurant data</Alert>;
  if (restaurant.status === "Deleted") return null;

  const bookingsPerDayData = {
    labels: Object.keys(stats.bookingsPerDay).sort((a, b) => {
      // Convert 'DD/MM/YYYY' to 'YYYY/MM/DD' for correct sorting
      const [aDay, aMonth, aYear] = a.split("/");
      const [bDay, bMonth, bYear] = b.split("/");
      return (
        new Date(`${aYear}-${aMonth}-${aDay}`) -
        new Date(`${bYear}-${bMonth}-${bDay}`)
      );
    }),
    datasets: [
      {
        label: "Bookings per Day",
        data: Object.values(stats.bookingsPerDay),
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  };

  const busiestHourData = {
    labels: Array.from({ length: 24 }, (_, i) => `${i}:00`),
    datasets: [
      {
        label: "Bookings per Hour",
        data: stats.bookingsPerHour,
        backgroundColor: "rgba(153, 102, 255, 0.2)",
        borderColor: "rgba(153, 102, 255, 1)",
        borderWidth: 1,
      },
    ],
  };

  console.log("Busiest Hour:", stats.busiestHour);
  console.log("Busiest Hour Data:", busiestHourData);

  return (
    <Container style={{ backgroundColor: "#F5F5DC" }} className="Container">
      <h1 className="my-4">Dashboard for {restaurant.name}</h1>
      <Row>
        <Col md={6}>
          <Card className="mb-4">
            <Card.Body>
              <Card.Title>Total Bookings</Card.Title>
              <Card.Text>{stats.totalBookings}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="mb-4">
            <Card.Body>
              <Card.Title>Total Guests</Card.Title>
              <Card.Text>{stats.totalGuests}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="mb-4">
            <Card.Body>
              <Card.Title>Average Guests per Booking</Card.Title>
              <Card.Text>{stats.averageGuestsPerBooking.toFixed(0)}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="mb-4">
            <Card.Body>
              <Card.Title>Busiest Hour</Card.Title>
              <Card.Text>
                {stats.busiestHour !== null ? `${stats.busiestHour}:00` : "N/A"}
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {from == "restaurant-dashboard" && (
        <Row>
          <Col md={6} className="mb-4">
            <h3>Bookings per Day</h3>
            <Bar data={bookingsPerDayData} />
          </Col>
          <Col md={6} className="mb-4">
            <h3>Bookings per Hour</h3>
            <Line data={busiestHourData} />
          </Col>
        </Row>
      )}
    </Container>
  );
};

export default Dashboard;
