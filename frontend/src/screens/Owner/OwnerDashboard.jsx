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
    const [restaurantIds, setRestaurantIds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchOwner = async (email) => {
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

                let data = await response.json(); // Await the JSON conversion
                console.log("Received owner data:", data);
                setOwner(data);
                setRestaurantIds(data.restaurantsIds);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };



        const fetchInfo = async () => {
            try {
                await fetchOwner(email);
            } catch (error) {
                setError(error.message);
            }
        };

        fetchInfo();
    }, [authUser]);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className='dashboard-container'>
            <h1 className='dashboard-title'>Restaurants Dashboard</h1>
            {restaurantIds.length > 0 ? (
                <Row className="row">
                {restaurantIds.map(id => (
                    <Col key={id} sm={12} md={6} lg={6} xl={6} xxl={6}>
                    <Link 
                        key={id} 
                        to={`http://localhost:3000/restaurant-dashboard/${id}`} 
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
