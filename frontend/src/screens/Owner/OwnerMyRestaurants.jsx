import React, { useEffect, useState } from "react";
import { Row, Col } from "react-bootstrap";
import Restaurant from "../../components/Restaurant.component";
import useAuthUser from "react-auth-kit/hooks/useAuthUser";
import LoadingSpinner from "../../components/LoadingSpinner.component";

const OwnerMyRestaurants = () => {
  const authUser = useAuthUser();
  const email = authUser.email;
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOwnerAndRestaurants = async () => {
      try {
        console.log("Fetching user data for email:", email);
        setLoading(true);
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/owners/ownerprofile`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ email: email }),
          }
        );

        if (!response.ok) {
          throw new Error("Owner not found");
        }

        const ownerData = await response.json();
        console.log("Received owner data:", ownerData);

        // Create an array to hold valid restaurant data
        const validRestaurants = [];

        // Process each restaurant ID individually to avoid one failure affecting all
        for (const id of ownerData.restaurantsIds) {
          try {
            const response = await fetch(
              `${process.env.REACT_APP_API_URL}/restaurants/${id}`
            );

            if (!response.ok) {
              console.warn(`Restaurant ${id} not found or inaccessible`);
              continue; // Skip to the next restaurant
            }

            const data = await response.json();
            // Skip restaurants with status "deleted"
            if (data.restaurant && data.restaurant.status !== "Deleted") {
              validRestaurants.push({
                ...data.restaurant,
                images: data.images,
              });
            }
          } catch (err) {
            console.warn(`Error fetching restaurant ${id}:`, err);
            // Continue with other restaurants
          }
        }

        setRestaurants(validRestaurants);
      } catch (error) {
        console.error(error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOwnerAndRestaurants();
  }, [email]);

  if (loading) return <LoadingSpinner message="Loading your restaurants..." />;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">My Restaurants</h1>
      {restaurants.length > 0 ? (
        <Row className="row justify-content-center">
          {restaurants.map((restaurant, index) => (
            <Col key={restaurant._id} sm={12} md={6} lg={6} xl={4} xxl={4}>
              <Restaurant
                restaurant={restaurant}
                index={index}
                images={restaurant.images}
                showEditButton={true}
                fromOwnerDashboard={true}
              />
            </Col>
          ))}
        </Row>
      ) : (
        <div>No restaurants found for this owner.</div>
      )}
    </div>
  );
};

export default OwnerMyRestaurants;
