import React from "react";
import { FaStar } from "react-icons/fa";

const RatingComponent = ({ rating, setRating }) => {
  return (
    <div className="rating-component d-flex justify-content-center mb-3">
      {[1, 2, 3, 4, 5].map((star) => (
        <FaStar
          key={star}
          size={30}
          className="star"
          color={star <= rating ? "#ffc107" : "#e4e5e9"}
          onClick={() => setRating(star)}
          style={{ cursor: "pointer", margin: "0 5px" }}
        />
      ))}
    </div>
  );
};

export default RatingComponent;
