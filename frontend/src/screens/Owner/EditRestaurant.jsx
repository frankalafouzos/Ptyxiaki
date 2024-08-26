import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import RestaurantForm from '../../components/Owner/RestaurantForm.component';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const EditRestaurant = () => {
  const { id } = useParams();
  const [restaurantData, setRestaurantData] = useState(null);
  const [capacities, setCapacities] = useState(null);
  const [images, setImages] = useState(null);

  useEffect(() => {
    const fetchRestaurant = async () => {
      try {
        const response = await fetch(`http://localhost:5000/restaurants/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch restaurant');
        }
        const data = await response.json();
        const capacitiesResponse = await fetch(`http://localhost:5000/restaurants/restaurant-capacities/${id}`);
        if (!capacitiesResponse.ok) {
          throw new Error('Failed to fetch restaurant capacities');
        }
        const capacitiyData = await capacitiesResponse.json();
        setRestaurantData(data.restaurant);
        setCapacities(capacitiyData);
        setImages(data.images)
      } catch (error) {
        toast.error(error.message, {
          position: 'top-center',
          autoClose: 2000,
        });
      }
    };
    fetchRestaurant();
  }, [id]);

  const handleSubmit = async (formData) => {
    try {
      const response = await fetch(`http://localhost:5000/restaurants/edit/${id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to edit restaurant');
      }

      toast.success('Restaurant edited successfully', {
        position: 'top-center',
        autoClose: 2000,
      });

    } catch (error) {
      toast.error(error.message, {
        position: 'top-center',
        autoClose: 2000,
      });
    }
  };

  return restaurantData ? <RestaurantForm restaurantData={restaurantData} capacities={capacities} handleSubmit={handleSubmit} images={images}/> : <div>Loading...</div>;
};

export default EditRestaurant;
