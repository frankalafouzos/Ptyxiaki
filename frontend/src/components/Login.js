import React, { useState, useContext } from 'react';
import '../css/AuthForm.css';
import AuthContext from '../context/AuthProvider'

const Login = () => {
  const { setAuth } = useContext(AuthContext)
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  

  const handleSubmit = async (event) => {
    event.preventDefault();
    console.log(formData.email, formData.password)
    try {
      
      const response = await fetch('http://localhost:5000/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        })
      });
  
      const data = await response.json();
      
      if (response.status == 400) {
        throw new Error(data.message || 'Failed to Authenticate');
      }

      alert("You have successfully logged in")
      
  
      
    } catch (error) {
      console.error('Log in error:', error.message);
      alert("Not authenticated. Email or password are wrong.")
      window.location.reload(true);
    }
  };

  const handleChange = (e) => {
    const updatedFormData = { ...formData, [e.target.name]: e.target.value };
    console.log(updatedFormData);
    setFormData(updatedFormData)
  };

  return (
    <form onSubmit={handleSubmit} className="auth-form">
      <h1 className='title'>Log in</h1>
      <input
        type="email"
        name="email"
        value={formData.email}
        onChange={handleChange}
        placeholder="Email"
        required
      />
      <input
        type="password"
        name="password"
        value={formData.password}
        onChange={handleChange}
        placeholder="Password"
        required
      />
      <button type="submit">Login</button>
      <p className='pt-2 '>Haven't registered yet? <a href="/signup">Sign up</a></p>
      </form>
  );
};

export default Login;
