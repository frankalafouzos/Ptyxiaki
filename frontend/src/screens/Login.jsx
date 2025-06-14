import React, { useState } from 'react';
import styles from '../css/Form.module.css';
import useSignIn from 'react-auth-kit/hooks/useSignIn';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Login = () => {
  const signIn = useSignIn();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await fetch(process.env.REACT_APP_API_URL+'/users/login', {
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
        console.log(data.isAdmin)
        // Check if the user is an admin
        if (data.isAdmin) {
          const now = new Date();
          console.log('Inside admin')
          // `ttl` is the time to live in milliseconds
          const item = {
              role: 'admin',
              expiry: now.getTime() + 14400000 , // current time + ttl
          };
          localStorage.setItem('role', JSON.stringify(item)); // Store the role in localStorage
          toast.success("Sign in successful", {
            position: "top-center",
            autoClose: 2000,
            onClose: () => window.location.replace('/admin') // Redirect to admin page
          });
        } else {
          const now = new Date();
          console.log('Inside user')
          // `ttl` is the time to live in milliseconds
          const item = {
              role: 'user',
              expiry: now.getTime() + 14400000, // current time + ttl
          };
          localStorage.setItem('role', JSON.stringify(item)); // Store the role in localStorage
          toast.success("Sign in successful", {
            position: "top-center",
            autoClose: 2000,
            onClose: () => window.location.replace('/')
          });
        }
      } else {
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
    <form onSubmit={handleSubmit} className={styles.form}>
      <h1 className={styles.title}>Sign in</h1>
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
      <p className='pt-2'>Haven't registered yet? <a href="/signup">Sign up</a></p>
      <p className='pt-2'>Are you an owner? <a href="/owner-signin">Owner Login</a></p> {/* Added link for owner login */}
    </form>
  );
};

export default Login;
