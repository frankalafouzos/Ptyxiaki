import React from 'react';
import Dashboard from '../../components/Owner/Dashboard.component';

const OwnerDashboard = () => {
    // Replace these with the actual restaurant IDs the owner has
    const restaurantIds = ["65f5e0bdcae164a47210aa30"];

    return (
        <div>
            <h1>Restaurants Dashboard</h1>
            {restaurantIds.map(id => (
                <Dashboard key={id} restaurantId={id} />
            ))}
        </div>
    );
};

export default OwnerDashboard;
