import React, { createContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({
    isAuthenticated: false,
    role: 'user', // default role
  });

  useEffect(() => {
    let role = 'user';
    let isAuthenticated = false;
    
    // Check for role data and parse it if exists
    const roleData = localStorage.getItem('role');
    if (roleData) {
      try {
        const parsedRole = JSON.parse(roleData);
        
        // Check if role has expiry and is not expired
        if (parsedRole && parsedRole.expiry) {
          const now = new Date().getTime();
          
          if (now < parsedRole.expiry) {
            // Not expired, use the role
            role = parsedRole.role;
            isAuthenticated = true; // Set authenticated if role exists and not expired
          } else {
            // Expired, reset role in localStorage
            console.log("Role expired");
            localStorage.setItem('role', JSON.stringify({ role: 'user', expiry: 0 }));
          }
        } else if (parsedRole && parsedRole.role) {
          // No expiry but has role property
          role = parsedRole.role;
          isAuthenticated = true; // Set authenticated if role exists
        }
      } catch (e) {
        console.error("Error parsing role data", e);
      }
    }
    
    // Set auth state based ONLY on role existence and validity
    setAuth({ isAuthenticated, role });
  }, []);

  const signIn = (role) => {
    // Add expiry when setting the role (4 hours from now)
    const now = new Date();
    const item = {
      role: role,
      expiry: now.getTime() + 4 * 60 * 60 * 1000,
    };
    
    setAuth({ isAuthenticated: true, role });
    localStorage.setItem('role', JSON.stringify(item));
  };

  const signOut = () => {
    setAuth({ isAuthenticated: false, role: 'user' });
    localStorage.setItem('role', JSON.stringify({ role: 'user', expiry: 0 }));
  };

  return (
    <AuthContext.Provider value={{ auth, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;