import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useIsAuthenticated from 'react-auth-kit/hooks/useIsAuthenticated';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function OwnerProtectedRoute({ element }) {
    const isAuthenticated = useIsAuthenticated();
    const location = useLocation();
    const navigate = useNavigate();
    const displayRef = useRef(false); // Use ref to track toast display status
    let role = JSON.parse(localStorage.getItem('role')).role;

    useEffect(() => {
        if (!isAuthenticated() || role !== 'owner') {
            if (!displayRef.current) {
                displayRef.current = true;
                // Show the toast message
                toast.error("You need to be authenticated as an owner to view this page!", {
                    position: "top-center",
                    autoClose: 1000
                });

                // Set a timeout to redirect after showing the message
                setTimeout(() => {
                    navigate('/owner-signin', { state: { from: location }, replace: true });
                }, 2000); // Delay of 2000 milliseconds (2 seconds)
            }

            if( localStorage.getItem('role') === 'owner' ){
                localStorage.getItem('role','user'); 
            }
        }
    }, [isAuthenticated, location, navigate]);

    if (!isAuthenticated() || role !== 'owner') {
        return null;
    }

    return element;
}

export default OwnerProtectedRoute;
