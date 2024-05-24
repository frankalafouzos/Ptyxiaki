import React from 'react';

const Dashboard = (restaurantid) => {
    const [restaurant, setRestaurant] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        console.log("Fetching restaurant data for ID:", restaurantid);
        fetch(`http://localhost:5000/restaurants/${restaurantid}`)
            .then((response) => {
                if (!response.ok) {
                    console.log(response);
                    throw new Error("Restaurant not found");
                }
                return response.json();
            })
            .then((data) => {
                console.log("Received restaurant data:", data);
                setRestaurant(data.restaurant);
                setLoading(false);
            })
            .catch((error) => {
                console.error("Error fetching restaurant data:", error);
                setError(error.message);
                setLoading(false);
            });
    }, [restaurantid]);

    useEffect(() => {
        console.log("Fetching restaurant data for ID:", restaurantid);
        fetch(`http://localhost:5000/bookings/getbookings/${restaurantid}`)
            .then((response) => {
                if (!response.ok) {
                    console.log(response);
                    throw new Error("Bookings not found");
                }
                return response.json();
            })
            .then((data) => {
                console.log("Received restaurant bookings:", data);
                setBookings(data.restaurant);
                setLoading(false);
            })
            .catch((error) => {
                console.error("Error fetching restaurant bookings:", error);
                setError(error.message);
                setLoading(false);
            });
    }, [restaurantid]);









    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;
    if (!restaurant) return <div>No restaurant data</div>;

    return (
        <div>
            <h1>Dashboard</h1>
        </div>
    );
};

export default Dashboard;