import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const OwnerHome = () => {
  const navigate = useNavigate();

  return (
    <Container className="my-5">
      <div className="d-flex justify-content-center align-items-center mt-5">
        <div className="container text-center p-5">
          <h1 className="mb-4 text-primary">Welcome to the Owner Dashboard</h1>
          <p className="lead">
            This is the home page for restaurant owners. Here you can manage your restaurant, view bookings, and more.
          </p>
        </div>
      </div>
      <Row className="gy-4">
        <Col md={12} lg={6}>
          <Card className="h-100">
            <Card.Body>
              <Card.Title>Dashboard</Card.Title>
              <Card.Text>
                Access analytics and insights about your restaurants, including bookings and popularity per hour.
              </Card.Text>
              <Button variant="primary" onClick={() => navigate('/owner/dashboard')}>
                Go to Dashboard
              </Button>
            </Card.Body>
          </Card>
        </Col>
        <Col md={12} lg={6}>
          <Card className="h-100">
            <Card.Body>
              <Card.Title>My Restaurants</Card.Title>
              <Card.Text>
                View and manage all the restaurants you own. You can edit details, view bookings, and more.
              </Card.Text>
              <Button variant="primary" onClick={() => navigate('/owner/restaurants')}>
                Go to My Restaurants
              </Button>
            </Card.Body>
          </Card>
        </Col>
        <Col md={12} lg={6}>
          <Card className="h-100">
            <Card.Body>
              <Card.Title>Profile</Card.Title>
              <Card.Text>
                Edit your profile details, including your name, email, and location.
              </Card.Text>
              <Button variant="primary" onClick={() => navigate('/owner/profile')}>
                Edit Profile
              </Button>
            </Card.Body>
          </Card>
        </Col>
        <Col md={12} lg={6}>
          <Card className="h-100">
            <Card.Body>
              <Card.Title>Add a Restaurant</Card.Title>
              <Card.Text>
                Add a new restaurant to your portfolio. Provide details like name, location, and capacity.
              </Card.Text>
              <Button variant="primary" onClick={() => navigate('/owner/add-restaurant')}>
                Add a Restaurant
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default OwnerHome;
