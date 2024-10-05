import React from 'react';
import RestaurantForm from '../../components/Owner/RestaurantForm.component';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../../css/RestaurantAdd-Edit.css';

const AddRestaurant = () => {

  return <RestaurantForm screenType="add" />;
};

export default AddRestaurant;
