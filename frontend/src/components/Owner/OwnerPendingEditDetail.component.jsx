import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Row, Col, Card, Badge, ListGroup } from "react-bootstrap";
import { toast } from "react-toastify";

const OwnerPendingEditDetail = () => {
  const { id } = useParams();
  const [editDetails, setEditDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEditDetails = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/api/pending-edits/${id}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch edit details");
        }
        const data = await response.json();
        console.log("Edit Details:", data);
        setEditDetails(data);
      } catch (error) {
        console.error("Error fetching edit details:", error);
        toast.error("Could not retrieve edit details");
      } finally {
        setLoading(false);
      }
    };
    console.log("Fetching edit details for ID:", id);
    fetchEditDetails();
  }, [id]);

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

  // Format field name for display
  const formatFieldName = (field) => {
  const fieldMappings = {
    name: "Restaurant Name",
    price: "Price",
    category: "Category",
    location: "Location",
    phone: "Phone Number",
    email: "Email",
    description: "Description",
    Bookingduration: "Booking Duration (min)",
    openHour: "Opening Time",
    closeHour: "Closing Time",
    images_changes: "Image Changes",
    images_order: "Image Order", // Add this line
  };

  return fieldMappings[field] || field;
};

  // Format field value for display
// Format field value for display
const formatFieldValue = (field, value) => {
  if (field === "openHour" || field === "closeHour") {
    const hours = Math.floor(value / 60);
    const minutes = value % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}`;
  }

  if (field === "images_changes") {
    return (
      <div>
        {value.added && value.added.length > 0 && (
          <div className="mb-3">
            <div className="text-success mb-2">
              <strong>Added {value.added.length} image(s):</strong>
            </div>
            <div className="d-flex flex-wrap gap-2">
              {value.added.map((image, index) => (
                <div key={index} className="border rounded p-2" style={{ maxWidth: "150px" }}>
                  <img
                    src={image.s3Url}
                    alt={image.fileName}
                    className="img-fluid rounded mb-1"
                    style={{ maxHeight: "80px", objectFit: "cover" }}
                  />
                  <div className="text-muted small text-center">
                    {image.fileName}
                  </div>
                  <div className="text-muted small text-center">
                    Order: {image.order}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {value.deleted && value.deleted.length > 0 && (
          <div className="mb-3">
            <div className="text-danger mb-2">
              <strong>Deleted {value.deleted.length} image(s):</strong>
            </div>
            <div className="d-flex flex-wrap gap-2">
              {value.deleted.map((image, index) => (
                <div key={index} className="border rounded p-2 position-relative" style={{ maxWidth: "150px" }}>
                  <img
                    src={image.url}
                    alt="Deleted image"
                    className="img-fluid rounded mb-1 opacity-50"
                    style={{ maxHeight: "80px", objectFit: "cover" }}
                  />
                  <div className="position-absolute top-50 start-50 translate-middle">
                    <span className="badge bg-danger">DELETED</span>
                  </div>
                  <div className="text-muted small text-center">
                    ID: {image.id.substring(0, 8)}...
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {(!value.added || value.added.length === 0) && 
         (!value.deleted || value.deleted.length === 0) && (
          <div className="text-muted">No image changes</div>
        )}
      </div>
    );
  }

  if (field === "images_order") {
    const oldCount = value.old ? value.old.length : 0;
    const newCount = value.new ? value.new.length : 0;
    
    if (oldCount === 0 && newCount === 0) {
      return "No order changes";
    }
    
    if (oldCount > 0 && newCount === 0) {
      return "Image order will be reset (all images removed from order)";
    }
    
    if (oldCount === 0 && newCount > 0) {
      return `New image order established (${newCount} images)`;
    }
    
    return `Image order changed (${oldCount} → ${newCount} images)`;
  }

  // If value is an object, JSON.stringify it
  if (typeof value === "object" && value !== null) {
    return JSON.stringify(value);
  }

  return value;
};


  if (loading) {
    return (
      <div className="d-flex justify-content-center pt-5">
        <div className="loader"></div>
      </div>
    );
  }

  if (!editDetails || !editDetails.pendingEdit) {
    return (
      <Container className="py-5">
        <Card>
          <Card.Body className="text-center">
            <Card.Title>Edit Not Found</Card.Title>
            <Card.Text>The requested edit could not be found.</Card.Text>
            <button
              className="btn btn-primary"
              onClick={() => navigate("/owner/pending-edits")}
            >
              Back to Pending Edits
            </button>
          </Card.Body>
        </Card>
      </Container>
    );
  }

  const { pendingEdit, restaurant } = editDetails;

  return (
    <Container className="py-5">
      <Row className="mb-4">
        <Col>
          <h1>
            Edit Details
            <span className="ms-3">{getStatusBadge(pendingEdit.status)}</span>
          </h1>
          <p>Submitted: {formatDate(pendingEdit.submittedAt)}</p>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col md={6}>
          <Card className="h-100">
            <Card.Header>
              <h4>Restaurant Information</h4>
            </Card.Header>
            <Card.Body>
              <ListGroup variant="flush">
                <ListGroup.Item>
                  <strong>Name:</strong> {restaurant.name}
                </ListGroup.Item>
                <ListGroup.Item>
                  <strong>Location:</strong> {restaurant.location}
                </ListGroup.Item>
                <ListGroup.Item>
                  <strong>Category:</strong> {restaurant.category}
                </ListGroup.Item>
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="h-100">
            <Card.Header>
              <h4>Changes Summary</h4>
            </Card.Header>
            <Card.Body>
              <ListGroup variant="flush">
                {Object.entries(pendingEdit.changes).map(([field, change]) => (
                  <ListGroup.Item key={field}>
                    <strong>{formatFieldName(field)}:</strong>
                    {field === "images_changes" ? (
                      <div>{formatFieldValue(field, change)}</div>
                    ) : (
                      <div>
                        <div className="text-danger">
                          <small>
                            From: {formatFieldValue(field, change.old)}
                          </small>
                        </div>
                        <div className="text-success">
                          <small>
                            To: {formatFieldValue(field, change.new)}
                          </small>
                        </div>
                      </div>
                    )}
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <div className="d-flex justify-content-between">
        <button
          className="btn btn-secondary"
          onClick={() => navigate("/owner/pending-edits")}
        >
          Back to Pending Edits
        </button>
      </div>
    </Container>
  );
};

export default OwnerPendingEditDetail;
