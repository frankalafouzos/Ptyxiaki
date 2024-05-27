import React, { useEffect, useState } from 'react';
import Dashboard from '../../components/Owner/Dashboard.component';
import useAuthUser from "react-auth-kit/hooks/useAuthUser";

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
        <div>
            <h1>Restaurants Dashboard</h1>
            {restaurantIds.length > 0 ? (
                restaurantIds.map(id => (
                    <Dashboard key={id} restaurantId={id} />
                ))
            ) : (
                <div>No restaurants found for this owner.</div>
            )}
        </div>
    );
};

export default OwnerDashboard;
