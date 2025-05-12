import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import RestaurantForm from "../../components/Owner/NewRestaurantForm.component";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const EditRestaurant = () => {
  const { id } = useParams();
  const [restaurantData, setRestaurantData] = useState(null);
  const [capacities, setCapacities] = useState(null);
  const [images, setImages] = useState(null);
  const [defaultClosedDays, setDefaultClosedDays] = useState(null);

  useEffect(() => {
    const fetchRestaurant = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/restaurants/${id}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch restaurant");
        }
        const data = await response.json();
        const capacitiesResponse = await fetch(
          `${process.env.REACT_APP_API_URL}/restaurants/restaurant-capacities/${id}`
        );
        if (!capacitiesResponse.ok) {
          throw new Error("Failed to fetch restaurant capacities");
        }

        const defaultClosedDatesResponse = await fetch(
          `${process.env.REACT_APP_API_URL}/restaurants/${id}/default-closed-days`
        );
        if (!defaultClosedDatesResponse) {
          throw new Error("Failed to fetch restaurant closed dates");
        }
        const defaultClosedDatesData = await defaultClosedDatesResponse.json();
        console.log("Defauly Closed Dates:" + defaultClosedDatesData);

        const capacityData = await capacitiesResponse.json();
        setRestaurantData(data.restaurant);
        setCapacities(capacityData);
        setImages(data.images);
        setDefaultClosedDays(defaultClosedDatesData);
      } catch (error) {
        toast.error(error.message, {
          position: "top-center",
          autoClose: 2000,
        });
      }
    };
    fetchRestaurant();
  }, [id]);

  const handleSubmit = async (formData) => {
    try {
      // We don't need this direct edit anymore as we're using the pending edits flow
      // that's now integrated into the RestaurantForm component

      // NOTE: The actual submission logic is now handled in the RestaurantForm's onSubmitEdit function,
      // which detects changes and sends them through the pending edits system

      // This function is still needed as it's passed as a prop to RestaurantForm,
      // but we can just leave it as a no-op or use it to handle any post-submission actions

      toast.success("Changes submitted for approval", {
        position: "top-center",
        autoClose: 2000,
      });
    } catch (error) {
      toast.error(error.message, {
        position: "top-center",
        autoClose: 2000,
      });
    }
  };

  return restaurantData ? (
    <RestaurantForm
      restaurantData={restaurantData}
      capacities={capacities}
      DefaultClosedDays={defaultClosedDays}
      handleSubmit={handleSubmit}
      images={images}
      screenType="edit" // Add this prop to indicate edit mode
    />
  ) : (
    <div>Loading...</div>
  );
};

export default EditRestaurant;
