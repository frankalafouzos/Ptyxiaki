import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom'; 


const RestaurantPage = ({ restaurantId }) => {
  const [restaurant, setRestaurant] = useState([]);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = useParams();

  useEffect(() => {
    console.log('Fetching restaurant data for ID:', id);
    
    fetch(`http://localhost:5000/restaurants/${id}`)
      .then(response => {
        if (!response.ok) {
            console.log(response)
          throw new Error('Restaurant not found');
        }
        return response.json();
      })
      .then(data => {
        console.log('Received restaurant data:', data);
        setRestaurant(data.restaurant);
        setLoading(false);
        setImages(data.images)
      })
      .catch(error => {
        console.error('Error fetching restaurant data:', error);
        setError(error.message);
        setLoading(false);
      });
  }, [id]);
  

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!restaurant) return <div>No restaurant data</div>;

  // JSX code to display restaurant details
  return (
    <div className="home-container ">
      
      <h1 className=""id="name">{restaurant.name}</h1>
      <h2 className="info">Average price per person: {restaurant.price}</h2>
      <h3 className="info">About us: {restaurant.description}</h3>
      <h4 className="info">Category: {restaurant.category}</h4>
      <h4 className="info">Location: {restaurant.location}</h4>
      <h4 className="info">Phone number: 
        <a className="text-decoration-none text-info" href={`tel:+${restaurant.phone}`}>
          {restaurant.phone}
        </a>
      </h4>
      <h4 className="info">Email:
        <a className="text-decoration-none text-info" href={`mailto:${restaurant.email}`}>
          {restaurant.email}
        </a>
      </h4>
      {images.map((img, idx) => (
          <div key={idx} className={`carousel-item ${idx === 0 ? 'active' : ''}`}>
              <img 
                  
                  src={require(`../imgs/${img.link.split('/').pop()}`)} // Adjust path as necessary
                  alt={`Slide ${idx}`} 
              />
          </div>
      ))}
    </div>
  );
};

export default RestaurantPage;
