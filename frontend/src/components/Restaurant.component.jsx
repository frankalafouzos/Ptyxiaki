import { Card, Carousel, Modal, Button } from "react-bootstrap";
import React, { useState, useEffect } from 'react';
import { fetchOwner } from '../scripts/fetchUser';
import useAuthUser from "react-auth-kit/hooks/useAuthUser";
import { Link } from "react-router-dom";
import CustomModal from "./CustomModal";
import Logo from "../imgs/Logo.png";

const Restaurant = ({ restaurant, index, images }) => {
  const [showModal, setShowModal] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [showAdminHideModal, setShowAdminHideModal] = useState(false);
  const [showAdminApproveModal, setShowAdminApproveModal] = useState(false);
  const authUser = useAuthUser();
  const email = authUser ? authUser.email : null;
  const [loading, setLoading] = useState(true);
  const [Owner, setOwner] = useState(null);
  let role = JSON.parse(localStorage.getItem('role')).role;
  useEffect(() => {
    if (email && role === "owner") {
      fetchOwner(email, setLoading, setOwner);
    }
  }, [email]);

  const getImagesForRestaurant = (Id) => {
    return images.filter((image) => image.ImageID === Id);
  };

  const handleDelete = async () => {
    try {
      console.log(restaurant._id);
      let id = restaurant._id;
      console.log(id);
      const response = await fetch("http://localhost:5000/restaurants/delete/" + restaurant._id, {
        method: 'DELETE',
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

    setShowModal(false); // Close the modal
  };


  const handleAdminDelete = async () => {
    try {
      const response = await fetch("http://localhost:5000/restaurants/" + restaurant._id, {
        method: 'DELETE',
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

    setShowModal(false); // Close the modal
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


  const handleAdminApprove = async () => {
    try {
      const response = await fetch("http://localhost:5000/admins/approve-restaurant/" + restaurant._id, {
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

  const handleShowModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);


  const handleShowAdminModal = () => setShowAdminModal(true);
  const handleCloseAdminModal = () => setShowAdminModal(false);

  const handleShowAdminHideModal = () => setShowAdminHideModal(true);
  const handleCloseAdminHideModal = () => setShowAdminHideModal(false);

  const handleShowAdminApproveModal = () => setShowAdminApproveModal(true);
  const handleCloseAdminApproveModal = () => setShowAdminApproveModal(false);

  const restaurantImages = getImagesForRestaurant(restaurant.imageID);

  return (
    <Card className="Restaurant rounded">
      <Link to={`/restaurant/${restaurant._id}`}>
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
        <Link className="Link" to={`/restaurant/${restaurant._id}`}>
          <Card.Title as="h3" className="restaurant-title">
            <strong>{restaurant.name}</strong>
          </Card.Title>
        </Link>

        <Card.Text as="h5">Price per person: ${restaurant.price}</Card.Text>
        <Card.Text>Category: {restaurant.category}</Card.Text>
        <Card.Text>Location: {restaurant.location}</Card.Text>
        {role === "admin" && (
          <>
            {restaurant.status === "Approved" && (
              <span className="badge bg-success">{restaurant.status}</span>
            )}
            {restaurant.status === "Hidden" && (
              <span className="badge bg-warning">{restaurant.status}</span>
            )}
            {restaurant.status === "Deleted" && (
              <span className="badge bg-danger">{restaurant.status}</span>
            )}
            {restaurant.status === "Pending Approval" && (
              <span className="badge bg-primary">{restaurant.status}</span>
            )}
          </>
        )}


        <div className="Buttons-container">
          <div className="h-25">
            <Link
              to={`/restaurant/${restaurant._id}`}
              className="h-25 btn btn-primary"
            >
              Go to Restaurant's Page
            </Link>
          </div>
          {role === "user" && (
            <Link to={`/booking/${restaurant._id}`} className="btn btn-success">
              Book a Table
            </Link>
          )}
          {role === "owner" && (
            <div className="w-50 h-100 d-flex justify-content-around">
              <button onClick={handleShowModal} className="h-100 btn btn-danger">
                Delete
              </button>
              <Link to={`/owner/edit-restaurant/${restaurant._id}`} className="h-100 btn btn-warning">
                Edit
              </Link>
              {/* View Calendar Button */}
              <Link
                to={`/owner/restaurant/${restaurant._id}/calendar`}
                className="h-100 btn btn-info"
              >
                View Calendar
              </Link>
            </div>
          )}

          {role === "admin" && (
            <div className="w-50 h-100 d-flex justify-content-around">
              {restaurant.status === "Pending Approval" ? (
                <>
                  {/* Approve button when status is Pending Approval */}
                  <button
                    onClick={handleShowAdminApproveModal}
                    className="h-100 btn btn-success"
                  >
                    Approve
                  </button>
                  {/* Delete button for Pending Approval */}
                  <button
                    onClick={handleShowModal}
                    className="h-100 btn btn-danger"
                  >
                    Delete
                  </button>
                </>
              ) : (
                <>
                  {/* Toggle Hide/Show button when not Pending Approval */}
                  <button
                    onClick={handleShowAdminHideModal}
                    className="h-100 btn btn-warning"
                  >
                    {restaurant.status !== "Hidden" ? "Hide" : "Show"}
                  </button>

                  {/* Delete button if status is not already Deleted */}
                  {restaurant.status !== "Deleted" && (
                    <button
                      onClick={handleShowModal}
                      className="h-100 btn btn-danger"
                    >
                      Delete
                    </button>
                  )}

                  {/* Permanent Remove button if status is Deleted */}
                  {restaurant.status === "Deleted" && (
                    <button
                      onClick={handleShowAdminModal}
                      className="h-100 btn btn-danger"
                    >
                      Remove
                    </button>
                  )}
                </>
              )}
            </div>
          )}


        </div>
      </Card.Body>
      <>

        <CustomModal
          show={showModal}
          handleClose={handleCloseModal}
          handleDelete={handleDelete}
          title="Confirm Delete"
          body="Are you sure you want to delete this Restaurant?"
          cancelLabel="No, Go Back"
          confirmLabel="Yes, Delete"
        />

        <CustomModal
          show={showAdminModal}
          handleClose={handleCloseAdminModal}
          handleDelete={handleAdminDelete}
          title="Confirm Delete"
          body="Are you sure you want to delete This Restaurant?"
          cancelLabel="No, Go Back"
          confirmLabel="Yes, Delete"
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

        <CustomModal
          show={showAdminApproveModal}
          handleClose={handleCloseAdminApproveModal}
          handleDelete={handleAdminApprove}
          title="Confirm Request"
          body="Are you sure you want to approve this restaurant?"
          cancelLabel="No, Go Back"
          confirmLabel="Yes, Approve"
          isWarning={false}
          isApprove={true}
        />







        {/* <CustomModal
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
        confirmLabel="Yes, Hide"
        isWarning={true}
      /> */}
      </>
    </Card>
  );
};

export default Restaurant;
