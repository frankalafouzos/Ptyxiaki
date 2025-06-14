import React, { useEffect, useState } from "react";
import { Card, Badge } from "react-bootstrap";

const PendingEditsList = ({ ownerId }) => {
  const [pendingEdits, setPendingEdits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPendingEdits = async () => {
      try {
        // Updated API endpoint to match our new route structure
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/api/pending-edits/owner/${ownerId}`
        );
        if (response.ok) {
          const data = await response.json();
          setPendingEdits(data);
        }
      } catch (error) {
        console.error("Error fetching pending edits:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPendingEdits();
  }, [ownerId]);

  if (loading) return <div>Loading pending edits...</div>;

  return (
    <div>
      <h3>Pending Edit Requests</h3>
      {pendingEdits.length === 0 ? (
        <p>No pending edits</p>
      ) : (
        pendingEdits.map((edit) => (
          <Card key={edit._id} className="mb-3">
            <Card.Header>
              Edit for {edit.restaurantId.name}
              <Badge bg="warning" className="ms-2">
                Pending Approval
              </Badge>
            </Card.Header>
            <Card.Body>
              <h5>Changes:</h5>
              <ul>
                {Object.entries(edit.changes).map(([field, value]) => (
                  <li key={field}>
                    <strong>{field}:</strong>{" "}
                    {field === "images_changes" ? (
                      <span>Image changes</span>
                    ) : (
                      <span>
                        From "{value.old}" to "{value.new}"
                      </span>
                    )}
                  </li>
                ))}
              </ul>
              <small>
                Submitted: {new Date(edit.submittedAt).toLocaleString()}
              </small>
            </Card.Body>
          </Card>
        ))
      )}
    </div>
  );
};

export default PendingEditsList;
