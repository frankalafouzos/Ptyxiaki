import { Card, Carousel } from "react-bootstrap";
import { Link } from "react-router-dom";
import Logo from "../imgs/Logo.png";

const Restaurant = ({ restaurant, index, images, showEditButton, fromOwnerDashboard }) => {
  const getImagesForRestaurant = (restaurantId) => {
    return images.filter((image) => image.ImageID === restaurantId);
  };

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
          <Link
            to={`/restaurant/${restaurant._id}${fromOwnerDashboard ? '?fromOwnerDashboard=true' : ''}`}
            className="btn btn-primary"
          >
            Go to Restaurant's Page
          </Link>
          {!fromOwnerDashboard && (
            <Link to={`/booking/${restaurant._id}`} className="btn btn-success">
              Book a Table
            </Link>
          )}
          {showEditButton && (
            <Link to={`/edit-restaurant/${restaurant._id}`} className="btn btn-warning">
              Edit
            </Link>
          )}
        </div>
      </Card.Body>
    </Card>
  );
};

export default Restaurant;
