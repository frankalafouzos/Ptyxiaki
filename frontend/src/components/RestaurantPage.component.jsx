
import CustomModal from "./CustomModal";
import React, { useState, useEffect, useRef } from "react";
// import { Container, Row, Col, Modal, Button } from "react-bootstrap";
import { Link, useLocation } from "react-router-dom";
import { useParams } from "react-router-dom";
import "../css/RestaurantPage.css";

const RestaurantPage = () => {
  const [restaurant, setRestaurant] = useState([]);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = useParams();
  const location = useLocation();
  let role = JSON.parse(localStorage.getItem("role"));
  const [maxImageHeight, setMaxImageHeight] = useState(0);
  const imageRefs = useRef([]);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [showAdminHideModal, setShowAdminHideModal] = useState(false);

  useEffect(() => {
    console.log("Fetching restaurant data for ID:", id);

    fetch(`http://localhost:5000/restaurants/${id}`)
      .then((response) => {
        if (!response.ok) {
          console.log(response);
          throw new Error("Restaurant not found");
        }
        return response.json();
      })
      .then((data) => {
        console.log("Received restaurant data:", data);
        setRestaurant(data.restaurant);
        setLoading(false);
        setImages(data.images);
      })
      .catch((error) => {
        console.error("Error fetching restaurant data:", error);
        setError(error.message);
        setLoading(false);
      });
  }, [id]);
  
  useEffect(() => {
    
    if (role.role !== "admin") {
      console.log("Increementing visit counter for restaurant ID:", id);
      fetch(`http://localhost:5000/restaurants/increnmentVisitCounter/${id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((response) => {
          if (!response.ok) {
            console.log(response);
            throw new Error("Error incrementing visit counter");
          }
        })
        .catch((error) => {
          console.error("Error incrementing visit counter:", error);
        });
    }
  }, []);

  useEffect(() => {
    // Send the request to increment visitCounter
    if (role.role === "user") {
      const incrementVisitCounter = async () => {
        try {
          const response = await fetch(`http://localhost:5000/restaurants/${restaurant._id}/incrementVisitCounter`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
          });
          if (!response.ok) {
            console.error('Error incrementing visit counter');
          }
        } catch (error) {
          console.error('Error:', error);
        }
      };

      // Call the function to increment the visit counter when the restaurant is rendered
      incrementVisitCounter();
    }
  }, [restaurant._id]);

  useEffect(() => {
    if (images.length === 0) return;

    const imageHeights = imageRefs.current.map((ref) => ref?.offsetHeight || 0);
    const tallestImageHeight = Math.max(...imageHeights);
    setMaxImageHeight(tallestImageHeight);
  }, [images]);

  const [activeImage, setActiveImage] = useState(0);

  const nextImage = () => {
    setActiveImage((prevIndex) => (prevIndex + 1) % images.length);
  };

  const prevImage = () => {
    setActiveImage(
      (prevIndex) => (prevIndex - 1 + images.length) % images.length
    );
  };


  const handleAdminDelete = async () => {
    try {
      const response = await fetch("http://localhost:5000/owners/delete/" + restaurant._id, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
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

    setShowAdminModal(false); // Close the modal
  };


  const handleAdminHide = async () => {
    try {
      const response = await fetch("http://localhost:5000/admins/hide-restaurant/" + restaurant._id, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        console.log('Restaurant hidden!');
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

    setShowAdminHideModal(false); // Close the modal
  };


  const handleShowAdminModal = () => setShowAdminModal(true);
  const handleCloseAdminModal = () => setShowAdminModal(false);

  const handleShowAdminHideModal = () => setShowAdminHideModal(true);
  const handleCloseAdminHideModal = () => setShowAdminHideModal(false);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!restaurant) return <div>No restaurant data</div>;

  return (
    <>
    {restaurant.status === "Deleted" ? (
      <div className="restaurant-container">
        <div className="not-found-container">
          <h1>404 - Restaurant Not Found</h1>
          <p>This restaurant has been deleted or does not exist.</p>
          <Link to="/" className="btn btn-primary">
            Go Back to Home
          </Link>
        </div>
      </div>
    ) : (
      <div className="restaurant-container">
        <div className="content-layout">

          <div className="carousel-container">
            <div className="image-wrapper">
              {images.map((img, idx) => (
                <img
                  key={idx}
                  className={`carousel-image ${idx === activeImage ? "active" : ""
                    }`}
                  src={img.link}
                  alt={`Restaurant ${idx}`}
                />
              ))}
              <div className="button-wrapper">
                <button className="carousel-control prev" onClick={prevImage}>
                  &lt;
                </button>
                <button className="carousel-control next" onClick={nextImage}>
                  &gt;
                </button>
              </div>
            </div>

          </div>

          <div className="info-container">
            <div className="info-top">
              <h2>{restaurant.name}</h2>
              <h5 className="info">
                Average price per person: {restaurant.price}
              </h5><br />
              <h6 className="info">About us: {restaurant.description}</h6><br />
              <h7 className="info">Category: {restaurant.category}</h7><br />
              <h7 className="info">Location: {restaurant.location}</h7><br />
              <h7 className="info">
                Phone number:
                <a
                  className="text-decoration-none text-info"
                  href={`tel:+${restaurant.phone}`}
                >
                  {restaurant.phone}
                </a>
              </h7><br />
              <h7 className="info">
                Email:
                <a
                  className="text-decoration-none text-info"
                  href={`mailto:${restaurant.email}`}
                >
                  {restaurant.email}
                </a>
              </h7><br /><br /><br />
            </div>
            <div className="booking-button">
              {role.role === "user" && (
                <Link
                  to={`/booking/${restaurant._id}`}
                  className="btn btn-outline-success "
                >
                  Book a Table
                </Link>
              )}
              {role.role === "owner" && (
                <Link
                  to={`/owner/edit-restaurant/${restaurant._id}`}
                  className="btn btn-outline-warning "
                >
                  Edit
                </Link>
              )}
              {role.role === "admin" && (
                <div className="" style={{ display: "flex", flexDirection: "column", overflow: "hidden", height: "auto" }}>
                  <button
                    onClick={handleShowAdminHideModal}
                    className="btn btn-outline-warning mt-4"
                  >
                    {restaurant.status === "Hidden" ? "Show" : "Hide"}
                  </button>
                  <button
                    onClick={handleShowAdminModal}
                    className="btn btn-outline-danger mt-4"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
   )}

      <CustomModal
        show={showAdminModal}
        handleClose={handleCloseAdminModal}
        handleDelete={handleAdminDelete}
        title="Remove User"
        body="Are you sure you want to delete this restaurant from the system?"
        cancelLabel="No, Go Back"
        confirmLabel="Delete Restaurant"
      />


      <CustomModal
        show={showAdminHideModal}
        handleClose={handleCloseAdminHideModal}
        handleDelete={handleAdminHide}
        title="Confirm Request"
        body="Are you sure you want to hide this restaurant?"
        cancelLabel="No, Go Back"
        confirmLabel={restaurant.status === "Hidden" ? "Yes, Show" : "Yes, Hide"}
        isWarning={true}
      />


      {/* <Modal show={showAdminHideModal} onHide={handleCloseAdminHideModal}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Request</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to hide this restaurant?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseAdminHideModal}>
            Cancel
          </Button>
          <Button variant="warning" onClick={handleAdminHide}>
            Yes, Hide
          </Button>
        </Modal.Footer>
      </Modal> */}
    </>

  );
};
export default RestaurantPage;
