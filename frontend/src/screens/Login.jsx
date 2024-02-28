import React, { useState } from 'react';
// import { useContext } from 'react';
import '../css/Form.css';
// import AuthProvider from '../context/AuthProvider'
import useSignIn from 'react-auth-kit/hooks/useSignIn';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Login = () => {
  // const { setAuth } = useContext(AuthContext)
  const signIn = useSignIn();
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
      console.log(formData.email)
      console.log(data.token)
      if (response.status === 200) {
        signIn(
          {
            auth : {
              token: data.token,
              type: 'Bearer'
            },
            userState: {
              email: formData.email
            }
          }
        );
        toast.success("Sign in successful", {
          position: "top-center",
          autoClose: 2000,
          onClose: () => window.location.replace('http://localhost:3000/')
        })
      } else {
        // Handle errors
        throw new Error(data.message || 'Failed to Authenticate');
      }
      
      
  
      
    } catch (error) {
      console.error('Log in error:', error.message);
      toast.error("Not authenticated. Email or password are wrong.", {
        position: "top-center",
        autoClose: 2000
        });
      window.location.reload(true);
    }
  };

  const handleChange = (e) => {
    const updatedFormData = { ...formData, [e.target.name]: e.target.value };
    // console.log(updatedFormData);
    setFormData(updatedFormData)
  };

  return (
    <form onSubmit={handleSubmit} className="form">
      <h1 className='title'>Sign in</h1>
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
