import React, { useState, useEffect, useRef } from "react";
// import { Container, Row, Col, Carousel, Button } from "react-bootstrap";
// import { useParams } from "react-router-dom";
import useAuthUser from "react-auth-kit/hooks/useAuthUser";
import Restaurant from "./Restaurant";

const Profile = () => {
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null); // Initialize user as null
    const authUser = useAuthUser();
    const email = authUser.email;
  
    useEffect(() => {
      const fetchUser = async () => {
        console.log("Fetching user data for email:", email);
  
        try {
          const response = await fetch(`http://localhost:5000/users/userprofile`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ email: email }),
          });
  
          if (!response.ok) {
            throw new Error("User not found");
          }
  
          let data = await response.json(); // Await the JSON conversion
          console.log("Received user data:", data);
          setUser(data.user);
        } catch (error) {
          console.error(error);
        } finally {
          setLoading(false);
        }
      };
      fetchUser();
    }, [email]);
  
    if (loading) {
      return <div>Loading...</div>;
    }
  
    // Check if user is loaded
    if (!user) {
      return <div>No user data</div>;
    }
  
    return <div>{user.firstname}</div>; // Now safely accessing user.name
  };
  
  export default Profile;
  