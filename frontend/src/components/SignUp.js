import React, { useState } from 'react';
import '../css/AuthForm.css';


const SignUp = () => {
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    email: '',
    password: '',
    location: '',
  });

  const handleSubmit = async (event) => {
    event.preventDefault();
    // Perform the sign-up logic
    console.log('Signing up with', formData);
    // Redirect or update UI upon successful sign-up
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <form onSubmit={handleSubmit} className="auth-form">
      <input
        name="firstname"
        value={formData.firstname}
        onChange={handleChange}
        placeholder="First Name"
        required
      />
      <input
        name="lastname"
        value={formData.lastname}
        onChange={handleChange}
        placeholder="Last Name"
        required
      />
      <input
        name="email"
        type="email"
        value={formData.email}
        onChange={handleChange}
        placeholder="Email"
        required
      />
      <input
        name="password"
        type="password"
        value={formData.password}
        onChange={handleChange}
        placeholder="Password"
        required
      />
      <input
        name="location"
        value={formData.location}
        onChange={handleChange}
        placeholder="Location"
      />
      <button type="submit">Sign Up</button>
    </form>
  );
};

export default SignUp;
