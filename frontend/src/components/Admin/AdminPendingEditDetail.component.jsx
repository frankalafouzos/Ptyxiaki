import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Badge, Button, ListGroup } from 'react-bootstrap';
import { toast } from 'react-toastify';
import CustomModal from "../CustomModal";

const AdminPendingEditDetail = () => {
  const { id } = useParams();
  const [editDetails, setEditDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);

  useEffect(() => {
    const fetchEditDetails = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/pending-edits/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch edit details');
        }
        const data = await response.json();
        setEditDetails(data);
      } catch (error) {
        console.error('Error fetching edit details:', error);
        toast.error('Could not retrieve edit details');
      } finally {
        setLoading(false);
      }
    };

    fetchEditDetails();
  }, [id]);

  const handleApprove = async () => {
    try {
      const response = await fetch(`http://localhost:5000/admins/approve-edit/${id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) throw new Error('Failed to approve edit');
      
      toast.success('Edit approved successfully');
      navigate('/admin/pending-edits');
    } catch (error) {
      console.error('Error approving edit:', error);
      toast.error('Failed to approve edit');
    }
    setShowApproveModal(false);
  };

  const handleReject = async () => {
    try {
      const response = await fetch(`http://localhost:5000/admins/reject-edit/${id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) throw new Error('Failed to reject edit');
      
      toast.success('Edit rejected successfully');
      navigate('/admin/pending-edits');
    } catch (error) {
      console.error('Error rejecting edit:', error);
      toast.error('Failed to reject edit');
    }
    setShowRejectModal(false);
  };

  // Format date nicely
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Format field name for display
  const formatFieldName = (field) => {
    const fieldMappings = {
      name: 'Restaurant Name',
      price: 'Price',
      category: 'Category',
      location: 'Location',
      phone: 'Phone Number',
      email: 'Email',
      description: 'Description',
      Bookingduration: 'Booking Duration (min)',
      openHour: 'Opening Time',
      closeHour: 'Closing Time',
      images_changes: 'Image Changes',
      capacity: 'Capacity',
      closedDays: 'Closed Days'
    };
    
    return fieldMappings[field] || field;
  };

  // Format field value for display
  const formatFieldValue = (field, value) => {
    if (field === 'openHour' || field === 'closeHour') {
      // Convert minutes to hours:minutes
      const hours = Math.floor(value / 60);
      const minutes = value % 60;
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }
    
    // Special handling for objects (capacity, etc.)
    if (typeof value === 'object' && value !== null) {
      if (field === 'capacity') {
        // Format capacity object for display
        if (value.new) {
          return (
            <div>
              <div className="text-danger">
                <small>From: Tables 2: {value.old.tablesForTwo}, Tables 4: {value.old.tablesForFour}, 
                Tables 6: {value.old.tablesForSix}, Tables 8: {value.old.tablesForEight}</small>
              </div>
              <div className="text-success">
                <small>To: Tables 2: {value.new.tablesForTwo}, Tables 4: {value.new.tablesForFour}, 
                Tables 6: {value.new.tablesForSix}, Tables 8: {value.new.tablesForEight}</small>
              </div>
            </div>
          );
        }
        return JSON.stringify(value);
      }
      
      if (field === 'images_changes') {
        // Enhanced image changes display with previews
        const addedCount = value.added?.length || 0;
        const deletedCount = value.deleted?.length || 0;
        
        return (
          <div>
            <p>{addedCount} image(s) added, {deletedCount} image(s) removed</p>
            
            {/* Display images being added */}
            {addedCount > 0 && (
              <div className="mb-3">
                <h6 className="text-success">Images being added:</h6>
                <div className="d-flex flex-wrap gap-2">
                  {value.added.map((img, index) => (
                    <div 
                      key={`added-${index}`} 
                      className="position-relative" 
                      style={{
                        width: '120px',
                        height: '120px',
                        border: '2px solid #28a745',
                        borderRadius: '4px',
                        overflow: 'hidden'
                      }}
                    >
                      {img.url ? (
                        <img 
                          src={img.url} 
                          alt={`New image ${index + 1}`}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                          }}
                        />
                      ) : (
                        <div className="d-flex justify-content-center align-items-center h-100 bg-light">
                          <span className="text-muted small">Pending upload</span>
                        </div>
                      )}
                      <Badge 
                        bg="success" 
                        className="position-absolute" 
                        style={{
                          bottom: '5px',
                          right: '5px'
                        }}
                      >
                        Added
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Display images being deleted */}
            {deletedCount > 0 && (
              <div>
                <h6 className="text-danger">Images being removed:</h6>
                <div className="d-flex flex-wrap gap-2">
                  {value.deleted.map((img, index) => (
                    <div 
                      key={`deleted-${index}`} 
                      className="position-relative" 
                      style={{
                        width: '120px',
                        height: '120px',
                        border: '2px solid #dc3545',
                        borderRadius: '4px',
                        overflow: 'hidden'
                      }}
                    >
                      {img.url ? (
                        <img 
                          src={img.url} 
                          alt={`Deleted image ${index + 1}`}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                          }}
                        />
                      ) : (
                        <div className="d-flex justify-content-center align-items-center h-100 bg-light">
                          <span className="text-muted small">Image unavailable</span>
                        </div>
                      )}
                      <Badge 
                        bg="danger" 
                        className="position-absolute" 
                        style={{
                          bottom: '5px',
                          right: '5px'
                        }}
                      >
                        Removed
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      }
      
      if (field === 'closedDays') {
        // Format closed days changes
        if (value.old && value.new) {
          return (
            <div>
              <div className="text-danger">
                <small>From: {Array.isArray(value.old) ? value.old.join(', ') : value.old}</small>
              </div>
              <div className="text-success">
                <small>To: {Array.isArray(value.new) ? value.new.join(', ') : value.new}</small>
              </div>
            </div>
          );
        }
        return JSON.stringify(value);
      }
      
      // Generic object display
      return JSON.stringify(value);
    }
    
    return value;
  };

  if (loading) {
    return <div className="d-flex justify-content-center pt-5"><div className="loader"></div></div>;
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
              onClick={() => navigate('/admin/pending-edits')}
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
            Edit Request Details
            <Badge bg="warning" className="ms-3">Pending Approval</Badge>
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
              <h4>Requested Changes</h4>
            </Card.Header>
            <Card.Body>
              <ListGroup variant="flush">
                {Object.entries(pendingEdit.changes).map(([field, change]) => (
                  <ListGroup.Item key={field}>
                    <strong>{formatFieldName(field)}:</strong>
                    {field === 'images_changes' || field === 'capacity' || field === 'closedDays' ? (
                      <div>{formatFieldValue(field, change)}</div>
                    ) : (
                      <div>
                        <div className="text-danger">
                          <small>From: {formatFieldValue(field, change.old)}</small>
                        </div>
                        <div className="text-success">
                          <small>To: {formatFieldValue(field, change.new)}</small>
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
          onClick={() => navigate('/admin/pending-edits')}
        >
          Back to List
        </button>
        <div>
          <button 
            className="btn btn-success me-2"
            onClick={() => setShowApproveModal(true)}
          >
            Approve
          </button>
          <button 
            className="btn btn-danger"
            onClick={() => setShowRejectModal(true)}
          >
            Reject
          </button>
        </div>
      </div>

      <CustomModal
        show={showApproveModal}
        handleClose={() => setShowApproveModal(false)}
        handleDelete={handleApprove}
        title="Confirm Approval"
        body="Are you sure you want to approve these restaurant edits?"
        cancelLabel="Cancel"
        confirmLabel="Approve"
        isWarning={false}
        isApprove={true}
      />

      <CustomModal
        show={showRejectModal}
        handleClose={() => setShowRejectModal(false)}
        handleDelete={handleReject}
        title="Confirm Rejection"
        body="Are you sure you want to reject these restaurant edits?"
        cancelLabel="Cancel"
        confirmLabel="Reject"
        isWarning={true}
      />
    </Container>
  );
};

export default AdminPendingEditDetail;
