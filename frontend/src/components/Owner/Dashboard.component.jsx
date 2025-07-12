import React, { useEffect, useState } from "react";
import { Bar, Line } from "react-chartjs-2";
import "chart.js/auto";
import { Container, Row, Col, Card, Alert } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import LoadingSpinner from "../../components/LoadingSpinner.component";

const Dashboard = ({ restaurantId, year = new Date().getFullYear(), from }) => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        console.log(`Fetching analytics for restaurant ID: ${restaurantId}, year: ${year}`);
        
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/restaurants/${restaurantId}/analytics?year=${year}`
        );
        
        if (!response.ok) {
          throw new Error(`Analytics not found: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log("Received analytics data:", data);
        setAnalytics(data);
      } catch (error) {
        console.error("Error fetching analytics:", error);
        setError(`Error fetching analytics: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [restaurantId, year]);

  if (loading) {
    return <LoadingSpinner message="Loading analytics..." />;
  }

  if (error) return <Alert variant="danger">{error}</Alert>;
  if (!analytics) return <Alert variant="warning">No analytics data</Alert>;
  if (analytics.restaurant.status === "Deleted") return null;

  const { restaurant, stats } = analytics;

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
              <Card.Text>{stats.averageGuestsPerBooking}</Card.Text>
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

      {from === "restaurant-dashboard" && (
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