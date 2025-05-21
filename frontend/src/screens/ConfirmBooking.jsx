import React, { useState, useEffect } from "react";
import useAuthUser from "react-auth-kit/hooks/useAuthUser";
import { Form, Button, Container, Alert } from "react-bootstrap";
import { useLocation } from "react-router-dom";
import { fetchUser } from "../scripts/fetchUser";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const formatTime = (time) => {
  if (!time) return "";
  const [hours, minutes] = time.split(":");
  return `${hours.padStart(2, "0")}:${minutes}`;
};

const ConfirmBooking = () => {
  const location = useLocation();
  const authUser = useAuthUser();
  const email = authUser.email;

  // Get offer from navigation state
  const offer = location.state?.offer;

  // Initial state setup based on passed state or default values
  const initialState = {
    userid: "",
    restaurantId: location.state?.restaurantId || "",
    name: "",
    date: location.state?.date || "",
    time: formatTime(location.state?.time),
    partySize: location.state?.partySize || "",
    phone: "",
    offerId: offer?._id || null, // Pass offerId if present
  };

  const [reservation, setReservation] = useState(initialState);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState({
    firstname: "",
    lastname: "",
  });

  // Fetch user data
  useEffect(() => {
    const fetchData = async () => {
      if (email) {
        try {
          await fetchUser(email, setLoading, setUser);
        } catch (error) {
          console.error("Failed to fetch user data:", error);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchData();
  }, [email]);

  // Set user name once user data is fetched
  useEffect(() => {
    if (user) {
      setReservation((prevState) => ({
        ...prevState,
        userid: user._id,
        name: `${user.firstname} ${user.lastname}`,
      }));
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setReservation((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        process.env.REACT_APP_API_URL + "/bookings/create",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(reservation),
        }
      );
      if (response.ok) {
        const responseData = await response.json();
        toast.success("Reservation created successfully", {
          position: "top-center",
          autoClose: 2000,
          onClose: () =>
            // window.location.reload(),
            window.location.replace(
              `${process.env.REACT_APP_API_URL}/bookingThankYou/${responseData.id}`
            ),
        });
      } else {
        const responseData = await response.json();
        toast.error("Failed to create reservation", {
          position: "top-center",
          autoClose: 2000,
          onClose: () =>
            window.location.replace(
              `/restaurant/${reservation.restaurantId}`
            ),
        });
      }
    } catch (error) {
      toast.error("Failed to create reservation", {
        position: "top-center",
        autoClose: 2000,
        onClose: () =>
          window.location.replace(
            `/restaurant/${reservation.restaurantId}`
          ),
      });
    }
  };

  if (loading) return <div>Loading user data...</div>;

  return (
    <Container
      className="p-4 mt-4 shadow-sm bg-white rounded"
      style={{ maxWidth: "600px" }}
    >
      <h1
        className="text-center mb-4"
        style={{ fontSize: "1.75rem", color: "#333" }}
      >
        Confirm Your Reservation
      </h1>

      {/* Show offer details if present */}
      {offer && (
        <Alert variant="info" className="mb-4">
          <div>
            <strong>Offer Applied:</strong> {offer.title}
            <br />
            <span>{offer.description}</span>
            <br />
            <strong>Discount:</strong>{" "}
            {offer.discountType === "percentage"
              ? `${offer.discountValue}%`
              : `€${offer.discountValue}`}
            <br />
            <strong>Valid:</strong>{" "}
            {new Date(offer.startDate).toLocaleDateString()} -{" "}
            {new Date(offer.endDate).toLocaleDateString()}
          </div>
        </Alert>
      )}

      <Form onSubmit={handleSubmit} className="w-100">
        <Form.Group className="mb-3">
          <Form.Label htmlFor="name" style={{ fontWeight: "bold" }}>
            Name
          </Form.Label>
          <Form.Control
            type="text"
            id="name"
            name="name"
            value={reservation.name}
            onChange={handleChange}
            placeholder="Name"
            disabled
            className="form-control-lg"
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label htmlFor="date" style={{ fontWeight: "bold" }}>
            Date
          </Form.Label>
          <Form.Control
            type="date"
            id="date"
            name="date"
            value={reservation.date}
            onChange={handleChange}
            disabled
            className="form-control-lg"
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label htmlFor="time" style={{ fontWeight: "bold" }}>
            Time
          </Form.Label>
          <Form.Control
            type="time"
            id="time"
            name="time"
            value={reservation.time}
            onChange={handleChange}
            disabled
            className="form-control-lg"
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label htmlFor="partySize" style={{ fontWeight: "bold" }}>
            Party Size
          </Form.Label>
          <Form.Control
            type="number"
            id="partySize"
            name="partySize"
            value={reservation.partySize}
            onChange={handleChange}
            placeholder="Party Size"
            disabled
            className="form-control-lg"
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label htmlFor="phone" style={{ fontWeight: "bold" }}>
            Contact Phone
          </Form.Label>
          <Form.Control
            type="phone"
            id="phone"
            name="phone"
            value={reservation.phone}
            onChange={handleChange}
            placeholder="Contact Phone"
            required
            className="form-control-lg"
          />
        </Form.Group>

        <Button type="submit" variant="primary" className="w-100 btn-lg mt-3">
          Confirm Your Reservation
        </Button>
      </Form>
    </Container>
  );
};

export default ConfirmBooking;