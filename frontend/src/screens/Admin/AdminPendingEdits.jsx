import React, { useState, useEffect } from "react";
import { Card, Badge, Button, Row, Col, Container } from "react-bootstrap";
import "../../css/Admin/AdminRestaurants.css";

const AdminPendingEdits = () => {
  const [pendingEdits, setPendingEdits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPendingEdits();
  }, []);

  const fetchPendingEdits = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/pending-edits/pending-edits");
      if (!response.ok) {
        throw new Error("Failed to fetch pending edits");
      }
      const data = await response.json();
      setPendingEdits(data);
    } catch (error) {
      console.error("Error fetching pending edits:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (editId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/pending-edits/approve/${editId}`, {
        method: "POST",
      });
      
      if (!response.ok) {
        throw new Error("Failed to approve edit");
      }
      
      fetchPendingEdits(); // Refresh the list
    } catch (error) {
      console.error("Error approving edit:", error);
      alert(`Error: ${error.message}`);
    }
  };

  const handleReject = async (editId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/pending-edits/reject/${editId}`, {
        method: "POST",
      });
      
      if (!response.ok) {
        throw new Error("Failed to reject edit");
      }
      
      fetchPendingEdits(); // Refresh the list
    } catch (error) {
      console.error("Error rejecting edit:", error);
      alert(`Error: ${error.message}`);
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
    <Container className="main-container">
      <h1 className="restaurants-header">Pending Restaurant Edits</h1>
      
      {pendingEdits.length === 0 ? (
        <div className="text-center mt-5">
          <h3>No pending edits found</h3>
        </div>
      ) : (
        <Row>
          {pendingEdits.map((edit) => (
            <Col md={6} lg={4} key={edit._id} className="mb-4">
              <Card className="h-100">
                <Card.Header>
                  <h5>
                    {edit.restaurantId.name}{" "}
                    <Badge bg="warning">Pending Approval</Badge>
                  </h5>
                  <small>
                    Submitted by: {edit.ownerId.firstname} {edit.ownerId.lastname}
                  </small>
                </Card.Header>
                <Card.Body>
                  <h6>Changes:</h6>
                  <ul className="list-group mb-3">
                    {Object.entries(edit.changes).map(([field, value]) => (
                      <li key={field} className="list-group-item">
                        <strong>{field.charAt(0).toUpperCase() + field.slice(1)}:</strong>{" "}
                        {field === "images_changes" ? (
                          <span>
                            {value.added?.length > 0 && (
                              <span>Added: {value.added.length} images. </span>
                            )}
                            {value.deleted?.length > 0 && (
                              <span>Removed: {value.deleted.length} images.</span>
                            )}
                          </span>
                        ) : (
                          <span>
                            <span className="text-danger">{value.old}</span> →{" "}
                            <span className="text-success">{value.new}</span>
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                  <small className="text-muted">
                    Submitted: {new Date(edit.submittedAt).toLocaleString()}
                  </small>
                </Card.Body>
                <Card.Footer className="d-flex justify-content-between">
                  <Button
                    variant="success"
                    onClick={() => handleApprove(edit._id)}
                  >
                    Approve
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => handleReject(edit._id)}
                  >
                    Reject
                  </Button>
                </Card.Footer>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default AdminPendingEdits;
