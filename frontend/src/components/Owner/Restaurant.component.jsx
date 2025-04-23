import React, { useState, useEffect } from 'react';
import { Modal, Button } from 'react-bootstrap';

const Restaurant = () => {
  const [loading, setLoading] = useState(true);
  const [Owner, setOwner] = useState(null);

  useEffect(() => {
    // Fetch owner data or perform other initialization tasks
    setLoading(false);
  }, []);

  return (
    <div>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div>
          <h1>Restaurant Component</h1>
          <p>Owner: {Owner}</p>
        </div>
      )}
    </div>
  );
};

export default Restaurant;