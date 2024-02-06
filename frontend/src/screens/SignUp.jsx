import React, { useState } from 'react';
import '../css/AuthForm.css';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';



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
    try {
      
      const response = await fetch('http://localhost:5000/users/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstname: formData.firstname,
          lastname: formData.lastname,
          email: formData.email,
          password: formData.password,
          location: formData.location
        })
      });
  
      const data = await response.json();
      
      if (response.status === 400) {
        throw new Error(data.message || 'Failed to sign up');
      }
      toast.success("Sign up successful", {
        position: "top-center",
        autoClose: 2000,
        onClose: () => window.location.replace('http://localhost:3000/')
      })
      
      
    } catch (error) {
      console.error('Signup error:', error);
      toast.error(error.message, {
        position: "top-center",
        autoClose: 2000
        });
    }
  };

  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  return (
    <form onSubmit={handleSubmit} className="auth-form">
      <h1 className='title'>Sign up</h1>
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
      <p className='pt-2'>Already registered? <a  href="/login">Log in</a></p>
    </form>
  );
};

export default SignUp;
