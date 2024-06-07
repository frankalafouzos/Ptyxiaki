import React, { useEffect, useState } from 'react';
import { Row, Col } from 'react-bootstrap';
import Restaurant from '../../components/Restaurant.component'; // Adjust the import path as necessary
import useAuthUser from "react-auth-kit/hooks/useAuthUser";

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
          `http://localhost:5000/owners/ownerprofile`,
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

        // Fetch details for each restaurant
        const restaurantPromises = ownerData.restaurantsIds.map(id =>
          fetch(`http://localhost:5000/restaurants/${id}`)
            .then(response => {
              if (!response.ok) {
                throw new Error(`Restaurant ${id} not found`);
              }
              return response.json();
            })
        );

        const restaurantDataArray = await Promise.all(restaurantPromises);

        // Combine restaurant data and their images
        const restaurantsWithImages = restaurantDataArray.map(data => ({
          ...data.restaurant,
          images: data.images
        }));

        setRestaurants(restaurantsWithImages);

      } catch (error) {
        console.error(error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOwnerAndRestaurants();
  }, [email]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className='dashboard-container'>
      <h1 className='dashboard-title'>My Restaurants</h1>
      {restaurants.length > 0 ? (
        <Row className="row">
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
