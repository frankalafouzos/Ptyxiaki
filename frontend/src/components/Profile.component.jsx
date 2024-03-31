import React, { useState, useEffect, useRef } from "react";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
// import { useParams } from "react-router-dom";
import useAuthUser from "react-auth-kit/hooks/useAuthUser";
import { fetchUser } from '../scripts/fetchUser';  // Import the fetchUser function

const Profile = () => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null); // Initialize user as null
  const authUser = useAuthUser();
  const email = authUser.email;

  useEffect(() => {
    fetchUser(email, setLoading, setUser);
  }, [email]);

  if (loading) {
    return <div className="d-flex justify-content-center pt-5"><div className="loader"></div></div>
  }

  // // Check if user is loaded
  if (!user) {
    return <div>User not found</div>;
  }

  return (
    <Container className="my-5">
      <Row className="justify-content-center">
        <Col md={6}>
          <Card>
            <Card.Body>
              <Card.Title style={{ color: "black", fontSize: "2rem" }}>
                Profile
              </Card.Title>
              <Card.Text>
                <strong>First Name:</strong> {user.firstname}
                <br />
                <strong>Last Name:</strong> {user.lastname}
                <br />
                <strong>Email:</strong> {user.email}
                <br />
                <strong>Location:</strong> {user.location}
                <br />
                {user.admin && <span className="badge bg-success">Admin</span>}
              </Card.Text>
              <div className="d-flex justify-content-between">
                <Button variant="primary" href="/editProfile">
                  Edit Profile
                </Button>
                <Button  variant="primary" href="/editPassword">
                  Edit Password
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  ); 
};

export default Profile;
