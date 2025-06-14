import React, { useState } from "react";
import { Container, Form, Button } from "react-bootstrap";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ConfirmBooking = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const initialState = {
    restaurantId: location.state?.restaurantId || "",
    date: location.state?.date || "",
    time: location.state?.time || "",
    partySize: location.state?.partySize || "",
    firstname: "",
    lastname: "",
    phone: "",
    email: "",
  };

  const [bookingDetails, setBookingDetails] = useState(initialState);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBookingDetails((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        process.env.REACT_APP_API_URL + "/calendar/add-booking",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(bookingDetails),
        }
      );
      if (response.ok) {
        toast.success("Booking created successfully", {
          position: "top-center",
          autoClose: 2000,
          onClose: () =>
            navigate(
              `/owner/restaurant/${bookingDetails.restaurantId}/calendar`
            ),
        });
      } else {
        toast.error("Failed to create booking", {
          position: "top-center",
          autoClose: 2000,
        });
      }
    } catch (error) {
      console.error("Failed to create booking:", error);
      toast.error("Failed to create booking", {
        position: "top-center",
        autoClose: 2000,
      });
    }
  };

  return (
    <Container
      className="p-4 mt-4 shadow-sm bg-white rounded"
      style={{ maxWidth: "600px" }}
    >
      <h1
        className="text-center mb-4"
        style={{ fontSize: "1.75rem", color: "#333" }}
      >
        Confirm Booking
      </h1>
      <Form onSubmit={handleSubmit} className="w-100">
        <Form.Group className="mb-3">
          <Form.Label htmlFor="firstname" style={{ fontWeight: "bold" }}>
            First Name
          </Form.Label>
          <Form.Control
            type="text"
            id="firstname"
            name="firstname"
            value={bookingDetails.firstname}
            onChange={handleChange}
            placeholder="First Name"
            required
            className="form-control-lg"
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label htmlFor="lastname" style={{ fontWeight: "bold" }}>
            Last Name
          </Form.Label>
          <Form.Control
            type="text"
            id="lastname"
            name="lastname"
            value={bookingDetails.lastname}
            onChange={handleChange}
            placeholder="Last Name"
            required
            className="form-control-lg"
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label htmlFor="phone" style={{ fontWeight: "bold" }}>
            Phone
          </Form.Label>
          <Form.Control
            type="text"
            id="phone"
            name="phone"
            value={bookingDetails.phone}
            onChange={handleChange}
            placeholder="Phone"
            required
            className="form-control-lg"
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label htmlFor="email" style={{ fontWeight: "bold" }}>
            Email
          </Form.Label>
          <Form.Control
            type="email"
            id="email"
            name="email"
            value={bookingDetails.email}
            onChange={handleChange}
            placeholder="Email"
            required
            className="form-control-lg"
          />
        </Form.Group>
        <Button type="submit" variant="primary" className="w-100 btn-lg mt-3">
          Confirm Booking
        </Button>
      </Form>
    </Container>
  );
};

export default ConfirmBooking;
