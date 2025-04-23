import React, { useEffect, useState } from 'react';
import Dashboard from '../../components/Owner/Dashboard.component';
import useAuthUser from "react-auth-kit/hooks/useAuthUser";
import { Col, Row } from "react-bootstrap";
import '../../css/Dashboard.css';
import {Link} from 'react-router-dom';

const OwnerDashboard = () => {
    const authUser = useAuthUser();
    const email = authUser.email;
    const [owner, setOwner] = useState(null);
    const [validRestaurants, setValidRestaurants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchOwnerAndRestaurants = async () => {
            try {
                console.log("Fetching user data for email:", email);
                setLoading(true);
                const response = await fetch(
                    `http://localhost:5000/owners/ownerprofile`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({ email: email }),
                    }
                );

                if (!response.ok) {
                    throw new Error("Owner not found");
                }

                let ownerData = await response.json();
                console.log("Received owner data:", ownerData);
                setOwner(ownerData);

                // Create array to store valid restaurant data
                const activeRestaurants = [];
                
                // Process each restaurant ID individually
                for (const id of ownerData.restaurantsIds) {
                    try {
                        const restaurantResponse = await fetch(`http://localhost:5000/restaurants/${id}`);
                        
                        if (!restaurantResponse.ok) {
                            console.warn(`Restaurant ${id} not found or inaccessible`);
                            continue; // Skip to the next restaurant
                        }
                        
                        const data = await restaurantResponse.json();
                        // Skip restaurants with status "deleted"
                        if (data.restaurant && data.restaurant.status !== "Deleted") {
                            activeRestaurants.push(id);
                        }
                    } catch (err) {
                        console.warn(`Error fetching restaurant ${id}:`, err);
                        // Continue with other restaurants
                    }
                }
                
                setValidRestaurants(activeRestaurants);
            } catch (error) {
                console.error(error);
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchOwnerAndRestaurants();
    }, [email]);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className='dashboard-container'>
            <h1 className='dashboard-title'>Restaurants Dashboard</h1>
            {validRestaurants.length > 0 ? (
                <Row className="row">
                {validRestaurants.map(id => (
                    <Col key={id} sm={12} md={6} lg={6} xl={6} xxl={6}>
                    <Link 
                        key={id} 
                        to={`/owner/restaurant-dashboard/${id}`} 
                        style={{ textDecoration: 'none', color: 'inherit' }}
                    >
                        <Dashboard key={id} restaurantId={id} />
                    </Link>
                    </Col>
                ))}
                </Row>
            ) : (
                <div>No restaurants found for this owner.</div>
            )}
        </div>
    );
};

export default OwnerDashboard;