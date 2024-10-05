import React from 'react';

const AdminHome = () => {
  return (
    <div className='Container p-5'>
      <h1>Welcome to your Home page!</h1>
      {/* Add more owner-specific content here */}
      <p>This is the home page for Admins. In this environment you can edit the available restaurants, approve the pending ones and delete duplicate or not needed restaurants (Those restaurants are added in a folder called Deleted so the information won't disappear.).</p>
    </div>
  );
};

export default AdminHome;
