import React from 'react';
import { Link } from 'react-router-dom';

const PendingRestaurant = () => {
  return (
    <div>
      <h1>Pending Restaurant</h1>
      <p>Your restaurant is currently pending approval.</p>
      <Link to="/dashboard">Go to Dashboard</Link>
    </div>
  );
};

export default PendingRestaurant;