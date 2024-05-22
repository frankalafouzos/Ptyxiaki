import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Logout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Clear localStorage items
    localStorage.removeItem('token');
    localStorage.removeItem('role');

    // Redirect to login page
    navigate('/login');
  }, [navigate]);

  return null;
};

export default Logout;
