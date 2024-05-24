import React, { createContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({
    isAuthenticated: false,
    role: 'user', // default role
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role') || 'user';
    if (token) {
      setAuth({ isAuthenticated: true, role });
    }
  }, []);

  const signIn = (role) => {
    setAuth({ isAuthenticated: true, role });
    localStorage.setItem('role', role);
  };

  const signOut = () => {
    setAuth({ isAuthenticated: false, role: 'user' });
    localStorage.removeItem('token');
    localStorage.setItem('role', 'user');
  };

  return (
    <AuthContext.Provider value={{ auth, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
