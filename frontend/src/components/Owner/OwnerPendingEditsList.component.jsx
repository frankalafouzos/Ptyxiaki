import React, { useState, useEffect } from "react";
import { Card, Badge, Button, Container, Row, Col } from "react-bootstrap";
import { Link } from "react-router-dom";
import useAuthUser from "react-auth-kit/hooks/useAuthUser";
import { toast } from "react-toastify";
import "../../css/PendingEdits.css";

const OwnerPendingEditsList = () => {
  const [pendingEdits, setPendingEdits] = useState([]);
  const [loading, setLoading] = useState(true);
  const authUser = useAuthUser();
  const [ownerId, setOwnerId] = useState(null);

  useEffect(() => {
    const getOwnerId = async () => {
      try {
        // Using the existing ownerprofile POST endpoint instead of getowner GET
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/owners/ownerprofile`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: authUser.email,
            }),
          }
        );

        if (!response.ok) throw new Error("Failed to fetch owner details");
        const data = await response.json();
        setOwnerId(data._id);
        return data._id;
      } catch (error) {
        console.error("Error fetching owner ID:", error);
        toast.error("Could not retrieve owner information");
        return null;
      }
    };

    const fetchPendingEdits = async (id) => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/api/pending-edits/owner/${id}`
        );
        if (!response.ok) throw new Error("Failed to fetch pending edits");
        const data = await response.json();
        setPendingEdits(data);
      } catch (error) {
        console.error("Error fetching pending edits:", error);
        toast.error("Could not retrieve pending edits");
      } finally {
        setLoading(false);
      }
    };

    const init = async () => {
      const id = await getOwnerId();
      if (id) fetchPendingEdits(id);
    };

    init();
  }, [authUser.email]);

  // Helper function to display badge based on status
  const getStatusBadge = (status) => {
    switch (status) {
      case "pending approval":
        return <Badge bg="warning">Pending Approval</Badge>;
      case "approved":
        return <Badge bg="success">Approved</Badge>;
      case "rejected":
        return <Badge bg="danger">Rejected</Badge>;
      default:
        return <Badge bg="secondary">{status}</Badge>;
    }
  };

  // Format date nicely
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Summarize changes for display
  const summarizeChanges = (changes) => {
    if (!changes) return "No changes";

    // Filter out image_changes for this summary
    const fieldChanges = Object.entries(changes).filter(
      ([key]) => key !== "images_changes"
    );

    if (fieldChanges.length === 0) {
      return changes.images_changes ? "Image changes only" : "No changes";
    }

    return fieldChanges.map(([field]) => formatFieldName(field)).join(", ");
  };

  // Format field names for display
  const formatFieldName = (field) => {
    switch (field) {
      case "name":
        return "Name";
      case "price":
        return "Price";
      case "category":
        return "Category";
      case "location":
        return "Location";
      case "phone":
        return "Phone";
      case "email":
        return "Email";
      case "description":
        return "Description";
      case "Bookingduration":
        return "Booking Duration";
      case "openHour":
        return "Opening Time";
      case "closeHour":
        return "Closing Time";
      default:
        return field.charAt(0).toUpperCase() + field.slice(1);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center pt-5">
        <div className="loader"></div>
      </div>
    );
  }

  return (
    <Container className="py-5">
      <h1 className="text-center mb-4">My Pending Edits</h1>
      {pendingEdits.length === 0 ? (
        <div className="text-center">
          <p>You don't have any pending edits.</p>
          <Link to="/owner/restaurants" className="btn btn-primary">
            Go to My Restaurants
          </Link>
        </div>
      ) : (
        <Row>
          {pendingEdits.map((edit) => (
            <Col md={6} lg={4} className="mb-4" key={edit._id}>
              <Card className="h-100 pending-edit-card">
                <Card.Header className="d-flex justify-content-between align-items-center">
                  {getStatusBadge(edit.status)}
                  <small>{formatDate(edit.submittedAt)}</small>
                </Card.Header>
                <Card.Body>
                  <Card.Title>
                    {edit.restaurant?.name || "Unknown Restaurant"}
                  </Card.Title>
                  <Card.Text>
                    <strong>Changes:</strong> {summarizeChanges(edit.changes)}
                  </Card.Text>
                </Card.Body>
                <Card.Footer>
                  <Link
                    to={`/owner/pending-edits/${edit._id}`}
                    className="btn btn-outline-primary w-100"
                  >
                    View Details
                  </Link>
                </Card.Footer>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default OwnerPendingEditsList;
