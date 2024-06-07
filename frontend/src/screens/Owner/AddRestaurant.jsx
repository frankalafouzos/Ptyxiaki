import React from 'react';
import RestaurantForm from '../../components/Owner/RestaurantForm.component';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AddRestaurant = () => {
  const handleSubmit = async (formData) => {
    try {
      const response = await fetch('http://localhost:5000/restaurants/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to add restaurant');
      }

      toast.success('Restaurant added successfully', {
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

  return <RestaurantForm handleSubmit={handleSubmit} />;
};

export default AddRestaurant;
