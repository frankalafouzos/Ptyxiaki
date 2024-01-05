import React, { useState } from 'react';
import '../css/AuthForm.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    // Perform the login logic, e.g., sending a request to your backend
    console.log('Logging in with', email, password);
    // Redirect or update UI upon successful login
  };

  return (
    <form onSubmit={handleSubmit} className="auth-form">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
      />
      <button type="submit">Login</button>
      </form>
  );
};

export default Login;
