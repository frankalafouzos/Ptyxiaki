import React from 'react';
import { useParams } from 'react-router-dom';
import Dashboard from '../../components/Owner/Dashboard.component';

const RestaurantDashboard = () => {
    const { id } = useParams();   
    return (
        <div>
            <Dashboard restaurantId={id} />
        </div>
    );
};

export default RestaurantDashboard;