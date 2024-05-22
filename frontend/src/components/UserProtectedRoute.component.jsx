import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useIsAuthenticated from 'react-auth-kit/hooks/useIsAuthenticated';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function UserProtectedRoute({ element }) {
    const isAuthenticated = useIsAuthenticated();
    const location = useLocation();
    const [shouldRedirect, setShouldRedirect] = useState(false);
    const role = localStorage.getItem('role');

    useEffect(() => {
        if (!isAuthenticated() || role !== 'user') {
            // Show the toast message
            toast.error("You need to be authenticated as a user to view this page!", {
                position: "top-center",
                autoClose: 1000
            });

            // Set a timeout to redirect after showing the message
            const timer = setTimeout(() => {
                setShouldRedirect(true);
            }, 2000); // Delay of 2000 milliseconds (2 seconds)

            // Clear the timer if the component unmounts
            return () => clearTimeout(timer);
        }
    }, [isAuthenticated, role]);

    return isAuthenticated() && role === 'user' ? element : (shouldRedirect && <Navigate to="/login" state={{ from: location }} replace />);
}

export default UserProtectedRoute;
