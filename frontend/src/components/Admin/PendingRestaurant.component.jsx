import { Card, Carousel } from "react-bootstrap";
import React, { useState } from "react";
import { Link } from "react-router-dom";
import CustomModal from "../CustomModal";
import Logo from "../../imgs/Logo.png";

const Restaurant = ({ restaurant, images }) => {
    const [showModal, setShowModal] = useState(false);
    const [showAdminHideModal, setShowAdminHideModal] = useState(false);
    const [showAdminApproveModal, setShowAdminApproveModal] = useState(false);

    const getImagesForRestaurant = (Id) => {
        return images.filter((image) => image.ImageID === Id);
    };

    const handleDelete = async () => {
        try {
            const response = await fetch(
                `http://localhost:5000/pendingRestaurants/${restaurant._id}`,
                {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            if (response.ok) {
                console.log("Delete successful");
                window.location.reload();
            } else {
                console.log("Delete failed");
            }
        } catch (error) {
            console.error("An error occurred:", error);
        }

        setShowModal(false);
    };

    const handleAdminHide = async () => {
        try {
            const response = await fetch(
                `http://localhost:5000/admins/hide-restaurant/${restaurant._id}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            if (response.ok) {
                console.log("Restaurant hidden!");
                window.location.reload();
            } else {
                console.log("Action failed");
            }
        } catch (error) {
            console.error("An error occurred:", error);
        }

        setShowAdminHideModal(false);
    };

    const handleAdminApprove = async () => {
        try {
            const response = await fetch(
                `http://localhost:5000/admins/approve-restaurant/${restaurant._id}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            if (response.ok) {
                console.log("Restaurant approved!");
                window.location.reload();
            } else {
                console.log("Action failed");
            }
        } catch (error) {
            console.error("An error occurred:", error);
        }

        setShowAdminApproveModal(false);
    };

    const handleShowModal = () => setShowModal(true);
    const handleCloseModal = () => setShowModal(false);

    const handleShowAdminHideModal = () => setShowAdminHideModal(true);
    const handleCloseAdminHideModal = () => setShowAdminHideModal(false);

    const handleShowAdminApproveModal = () => setShowAdminApproveModal(true);
    const handleCloseAdminApproveModal = () => setShowAdminApproveModal(false);

    const restaurantImages = getImagesForRestaurant(restaurant.imageID);

    return (
        <Card className="Restaurant rounded">
            
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
            

            <Card.Body>

                <Card.Title as="h3" className="restaurant-title">
                    <strong>{restaurant.name}</strong>
                </Card.Title>


                <Card.Text as="h5">Price per person: ${restaurant.price}</Card.Text>
                <Card.Text>Category: {restaurant.category}</Card.Text>
                <Card.Text>Location: {restaurant.location}</Card.Text>

                <div className="Buttons-container">
                    

                    <div className="w-50 h-100 d-flex justify-content-around">
                        <button onClick={handleShowModal} className="h-100 btn btn-danger">
                            Delete
                        </button>
                        <button
                            onClick={handleShowAdminHideModal}
                            className="h-100 btn btn-warning"
                        >
                            {restaurant.status !== "Hidden" ? "Hide" : "Show"}
                        </button>
                        <button
                            onClick={handleShowAdminApproveModal}
                            className="h-100 btn btn-success"
                        >
                            Approve
                        </button>
                    </div>
                </div>
            </Card.Body>

            <CustomModal
                show={showModal}
                handleClose={handleCloseModal}
                handleDelete={handleDelete}
                title="Confirm Delete"
                body="Are you sure you want to delete this restaurant?"
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
            />

            <CustomModal
                show={showAdminApproveModal}
                handleClose={handleCloseAdminApproveModal}
                handleDelete={handleAdminApprove}
                title="Confirm Request"
                body="Are you sure you want to approve this restaurant?"
                cancelLabel="No, Go Back"
                confirmLabel="Yes, Approve"
            />
        </Card>
    );
};

export default Restaurant;
