import React from "react";
import { useParams } from "react-router-dom";
import OwnerRestaurantCalendarComponent from "../../components/Owner/OwnerRestaurantCalendar.component";

const OwnerRestaurantCalendar = () => {
  const { restaurantId } = useParams();

  return <OwnerRestaurantCalendarComponent restaurantId={restaurantId} />;
};

export default OwnerRestaurantCalendar;
