import React, { useState, useEffect, useRef } from "react";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
// import { useParams } from "react-router-dom";
import useAuthUser from "react-auth-kit/hooks/useAuthUser";
import { fetchUser, fetchOwner } from "../scripts/fetchUser";
import "../css/Profile.css";
import { Modal } from "react-bootstrap";

const Profile = () => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null); // Initialize user as null
  const authUser = useAuthUser();
  const email = authUser.email;
  const role = JSON.parse(localStorage.getItem("role")).role;
  const [isUser, setIsUser] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (role == "user") {
      fetchUser(email, setLoading, setUser);
      setIsUser(true);
      console.log("User role found");
    } else if (role == "owner") {
      fetchOwner(email, setLoading, setUser);
      setIsOwner(true);
      console.log(isOwner);
    } else if (role == "admin") {
      fetchUser(email, setLoading, setUser);
      setIsAdmin(true);
      console.log("Admin role found");
    } else {
      console.log("Role not found");
    }
  }, [email]);

  const handleShowModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);
  if (loading) {
    return (
      <div className="d-flex justify-content-center pt-5">
        <div className="loader"></div>
      </div>
    );
  }

  // // Check if user is loaded
  if (!user) {
    return <div>User not found</div>;
  }

  const handleTypeChange = () => {
    fetch(process.env.REACT_APP_API_URL + "/admins/changeRole", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: user.email,
      }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to change role");
        }
        return response.json();
      })
      .then((data) => {
        console.log("Role changed successfully:", data);
        localStorage.setItem("role", "user");
        window.location.replace(process.env.REACT_APP_FRONTEND_URL + "/");
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

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
              {isUser ? (
                <div className="d-flex justify-content-between">
                  <Button variant="primary" href="/editProfile">
                    Edit Profile
                  </Button>
                  <Button variant="primary" href="/editPassword">
                    Edit Password
                  </Button>
                </div>
              ) : isOwner ? (
                <div className="d-flex justify-content-between">
                  <Button variant="primary" href="/owner/EditProfile">
                    Edit Profile
                  </Button>
                  <Button variant="primary" href="/owner/EditPassword">
                    Edit Password
                  </Button>
                </div>
              ) : isAdmin ? (
                <>
                  <div className="d-flex justify-content-between">
                    <Button variant="primary" href="/admin/EditProfile">
                      Edit Profile
                    </Button>
                    <Button variant="primary" href="/admin/EditPassword">
                      Edit Password
                    </Button>
                    <Button
                      variant="danger"
                      onClick={handleShowModal}
                      className="hover-button"
                    >
                      Turn to user acccount
                    </Button>
                  </div>
                  <div className="d-flex justify-content-center p-3"></div>
                </>
              ) : (
                <div>
                  <p>Role not found</p>
                </div>
              )}
            </Card.Body>
            <>
              <Modal show={showModal} onHide={handleCloseModal}>
                <Modal.Header closeButton>
                  <Modal.Title>Confirm Type Change</Modal.Title>
                </Modal.Header>
                <Modal.Body
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    flexDirection: "column",
                  }}
                >
                  <p>
                    Are you sure you want to change this Accounts type to User?
                  </p>{" "}
                  <b style={{ fontSize: "150%" }}>This action is permenant!</b>
                </Modal.Body>
                <Modal.Footer>
                  <Button variant="secondary" onClick={handleCloseModal}>
                    Cancel
                  </Button>
                  <Button variant="danger" onClick={handleTypeChange}>
                    Yes, Change Type
                  </Button>
                </Modal.Footer>
              </Modal>
            </>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Profile;
