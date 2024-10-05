import { Card, Carousel, Modal, Button } from "react-bootstrap";
import React, { useState, useEffect } from 'react';
import { fetchOwner } from '../scripts/fetchUser'; 
import useAuthUser from "react-auth-kit/hooks/useAuthUser";
import { Link } from "react-router-dom";
import Logo from "../imgs/Logo.png";

const Restaurant = ({ restaurant, index, images, showEditButton, fromOwnerDashboard }) => {
  const [showModal, setShowModal] = useState(false);
  const authUser = useAuthUser();
  const email = authUser ? authUser.email : null;
  const [loading, setLoading] = useState(true);
  const [Owner, setOwner] = useState(null);

  useEffect(() => {
    if (email) {
      fetchOwner(email, setLoading, setOwner);
    }
  }, [email]);

  const getImagesForRestaurant = (Id) => {
    return images.filter((image) => image.ImageID === Id);
  };

  const handleDelete = async () => {
    try {
      const response = await fetch("http://localhost:5000/restaurants/deleteAll/" + restaurant._id, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ownerId: Owner._id,
        })
      });

      if (response.ok) {
        console.log('Delete successful');
        window.location.reload();
        // Handle successful deletion (e.g., refresh data, show a message)
      } else {
        console.log('Delete failed');
        // Handle deletion failure
      }
    } catch (error) {
      console.error('An error occurred:', error);
      // Handle error
    }

    setShowModal(false); // Close the modal
  };

  const handleShowModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

  const restaurantImages = getImagesForRestaurant(restaurant.imageID);

  return (
    <Card className="Restaurant rounded">
      <Link to={`/restaurant/${restaurant._id}${fromOwnerDashboard ? '?fromOwnerDashboard=true' : ''}`}>
        <Carousel fade variant="top" style={{ height: "25rem" }}>
          {restaurantImages.length > 0 ? (
            restaurantImages.map((img, idx) => (
              <Carousel.Item key={idx} style={{ height: "25rem" }}>
                <img
                  className="d-block w-100 rounded"
                  src={img.link}
                  alt={`Slide ${idx}`}
                  style={{ objectFit: "cover", height: "25rem", width: "100%" }}
                />
              </Carousel.Item>
            ))
          ) : (
            <Carousel.Item style={{ height: "25rem" }}>
              <img
                className="d-block w-100 rounded"
                src={Logo}
                alt="Not Available"
                style={{ objectFit: "cover", height: "25rem" }}
              />
            </Carousel.Item>
          )}
        </Carousel>
      </Link>

      <Card.Body>
        <Link className="Link" to={`/restaurant/${restaurant._id}${fromOwnerDashboard ? '?fromOwnerDashboard=true' : ''}`}>
          <Card.Title as="h3" className="restaurant-title">
            <strong>{restaurant.name}</strong>
          </Card.Title>
        </Link>

        <Card.Text as="h5">Price per person: ${restaurant.price}</Card.Text>
        <Card.Text>Category: {restaurant.category}</Card.Text>
        <Card.Text>Location: {restaurant.location}</Card.Text>

        <div className="Buttons-container">
          <div className="h-25">
            <Link
              to={`/restaurant/${restaurant._id}${fromOwnerDashboard ? '?fromOwnerDashboard=true' : ''}`}
              className="h-25 btn btn-primary"
            >
              Go to Restaurant's Page
            </Link>
          </div>
          {!fromOwnerDashboard && (
            <Link to={`/booking/${restaurant._id}`} className="btn btn-success">
              Book a Table
            </Link>
          )}
          {showEditButton && (
            <div className="w-50 h-100 d-flex justify-content-around">
              <button onClick={handleShowModal} className="h-100 btn btn-danger">
                Delete
              </button>
              <Link to={`/edit-restaurant/${restaurant._id}`} className="h-100 btn btn-warning">
                Edit
              </Link>
            </div>
          )}
        </div>
      </Card.Body>
      <>

      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to delete this item?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Yes, Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </>
    </Card>
  );
};

export default Restaurant;
