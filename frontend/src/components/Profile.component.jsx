import React, { useState, useEffect, useRef } from "react";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
// import { useParams } from "react-router-dom";
import useAuthUser from "react-auth-kit/hooks/useAuthUser";

const Profile = () => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null); // Initialize user as null
  const authUser = useAuthUser();
  const email = authUser.email;

  useEffect(() => {
    const fetchUser = async () => {
      console.log("Fetching user data for email:", email);
      setLoading(true);
      try {
        const response = await fetch(
          `http://localhost:5000/users/userprofile`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ email: email }),
          }
        );

        if (!response.ok) {
          throw new Error("User not found");
        }

        let data = await response.json(); // Await the JSON conversion
        console.log("Received user data:", data);

        setUser(data);
        console.log(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [email]);

  if (loading) {
    return <div>Loading...</div>;
  }

  // // Check if user is loaded
  // if (!user) {
  //   return <div>User not found</div>;
  // }

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
  ); // Now safely accessing user.name
};

export default Profile;
