import React, { useState } from 'react';
import styles from '../../css/Form.module.css';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const OwnerSignup = () => {
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    email: '',
    password: '',
    location: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/owners/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to sign up');
      }

      // Assuming the backend returns a token on signup
      localStorage.setItem('token', data.token);
      const now = new Date();
        console.log('Inside owner')

        const item = {
          role: 'owner',
          expiry: now.getTime() + 14400000 , // current time + ttl
        };

        localStorage.setItem('role', JSON.stringify(item)); // Store the role in localStorage

      toast.success("Sign up successful", {
        position: "top-center",
        autoClose: 2000,
        onClose: () => window.location.replace('/owner/home') // Redirect to owner home page
      });

    } catch (error) {
      console.error('Signup error:', error);
      toast.error(error.message, {
        position: "top-center",
        autoClose: 2000,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <h1 className={styles.title}>Register as an Owner</h1>
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
      <p className='pt-2'>Already registered? <a href="/owner-signin">Log in</a></p>
    </form>
  );
};

export default OwnerSignup;
