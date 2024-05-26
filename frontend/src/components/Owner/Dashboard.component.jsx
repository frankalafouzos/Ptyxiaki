import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Bar, Line } from 'react-chartjs-2';
import 'chart.js/auto';
import { Container, Row, Col, Card, Spinner, Alert } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

const Dashboard = ({ restaurantId }) => {
    const [restaurant, setRestaurant] = useState(null);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [stats, setStats] = useState({
        totalBookings: 0,
        totalGuests: 0,
        averageGuestsPerBooking: 0,
        busiestHour: 0,
        bookingsPerDay: {},
    });

    useEffect(() => {
        const fetchRestaurantData = async () => {
            try {
                console.log(`Fetching restaurant data for ID: ${restaurantId}`);
                const response = await fetch(`http://localhost:5000/restaurants/${restaurantId}`);
                if (!response.ok) throw new Error(`Restaurant not found: ${response.statusText}`);
                const data = await response.json();
                console.log('Received restaurant data:', data);
                setRestaurant(data.restaurant);
            } catch (error) {
                console.error("Error fetching restaurant data:", error);
                setError(`Error fetching restaurant data: ${error.message}`);
            }
        };

        const fetchBookingData = async () => {
            try {
                console.log(`Fetching bookings for restaurant ID: ${restaurantId}`);
                const response = await fetch(`http://localhost:5000/bookings/getbookings/${restaurantId}`);
                if (!response.ok) throw new Error(`Bookings not found: ${response.statusText}`);
                const data = await response.json();
                console.log('Received bookings data:', data);
                setBookings(data);
                calculateStats(data);
            } catch (error) {
                console.error("Error fetching bookings data:", error);
                setError(`Error fetching bookings data: ${error.message}`);
            }
        };

        const calculateStats = (bookings) => {
            const totalBookings = bookings.length;
            const totalGuests = bookings.reduce((sum, booking) => sum + booking.partySize, 0);
            const averageGuestsPerBooking = totalGuests / totalBookings;
            const bookingsPerDay = bookings.reduce((acc, booking) => {
                const date = new Date(booking.date).toLocaleDateString();
                if (!acc[date]) acc[date] = 0;
                acc[date]++;
                return acc;
            }, {});
            const hours = Array(24).fill(0);
            bookings.forEach(booking => {
                const hour = Math.floor(booking.startingTime / 60);
                hours[hour]++;
            });
            const busiestHour = hours.indexOf(Math.max(...hours));
            setStats({
                totalBookings,
                totalGuests,
                averageGuestsPerBooking,
                busiestHour,
                bookingsPerDay,
            });
        };

        const fetchData = async () => {
            setLoading(true);
            await fetchRestaurantData();
            await fetchBookingData();
            setLoading(false);
        };

        fetchData();
    }, [restaurantId]);

    if (loading) return <Spinner animation="border" />;
    if (error) return <Alert variant="danger">{error}</Alert>;
    if (!restaurant) return <Alert variant="warning">No restaurant data</Alert>;

    const bookingsPerDayData = {
        labels: Object.keys(stats.bookingsPerDay),
        datasets: [{
            label: 'Bookings per Day',
            data: Object.values(stats.bookingsPerDay),
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1
        }]
    };

    const busiestHourData = {
        labels: Array.from({ length: 24 }, (_, i) => `${i}:00`),
        datasets: [{
            label: 'Bookings per Hour',
            data: Array.from({ length: 24 }, (_, i) => stats.bookingsPerDay[i] || 0),
            backgroundColor: 'rgba(153, 102, 255, 0.2)',
            borderColor: 'rgba(153, 102, 255, 1)',
            borderWidth: 1
        }]
    };

    return (
        <Container>
            <h1 className="my-4">Dashboard for {restaurant.name}</h1>
            <Row>
                <Col md={4}>
                    <Card className="mb-4">
                        <Card.Body>
                            <Card.Title>Total Bookings</Card.Title>
                            <Card.Text>{stats.totalBookings}</Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={4}>
                    <Card className="mb-4">
                        <Card.Body>
                            <Card.Title>Total Guests</Card.Title>
                            <Card.Text>{stats.totalGuests}</Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={4}>
                    <Card className="mb-4">
                        <Card.Body>
                            <Card.Title>Average Guests per Booking</Card.Title>
                            <Card.Text>{stats.averageGuestsPerBooking.toFixed(2)}</Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={4}>
                    <Card className="mb-4">
                        <Card.Body>
                            <Card.Title>Busiest Hour</Card.Title>
                            <Card.Text>{stats.busiestHour}:00</Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
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
        </Container>
    );
};

export default Dashboard;
