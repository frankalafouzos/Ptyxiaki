import React, { useState } from 'react';
import '../../css/Form.css';
import useSignIn from 'react-auth-kit/hooks/useSignIn';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const OwnerSignIn = () => {
  const signIn = useSignIn();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/owners/login', { // Correct endpoint for owner login
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

      if (response.status === 200) {
        signIn({
          auth: {
            token: data.token,
            type: 'Bearer',
            expires: 4 * 60 * 60 * 1000 // 4 hours in milliseconds
          },
          userState: {
            email: formData.email
          }
        });
        toast.success("Sign in successful", {
          position: "top-center",
          autoClose: 2000,
          onClose: () => window.location.replace('http://localhost:3000/')
        });
      } else {
        // Handle errors
        throw new Error(data.message || 'Failed to Authenticate');
      }
    } catch (error) {
      console.error('Log in error:', error.message);
      toast.error("Not authenticated. Email or password are wrong.", {
        position: "top-center",
        autoClose: 2000,
        onClose: () => window.location.reload(true)
      });
    }
  };

  const handleChange = (e) => {
    const updatedFormData = { ...formData, [e.target.name]: e.target.value };
    setFormData(updatedFormData);
  };

  return (
    <form onSubmit={handleSubmit} className="form">
      <h1 className='title'>Owner Sign In</h1>
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
      <button type="submit">Sign In</button>
      <p className='pt-2'>Haven't registered yet? <a href="/owner-signup">Sign up</a></p>
    </form>
  );
};

export default OwnerSignIn;
