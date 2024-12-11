import React, { useState, useEffect } from "react";
import { fetchUser } from "../scripts/fetchUser";
import useAuthUser from "react-auth-kit/hooks/useAuthUser";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";

const SuggestedRestaurants = () => {
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null); // Initialize user as null
    const [suggestedRestaurants, setSuggestedRestaurants] = useState([]); // State for suggestions
    const [topRestaurants, setTopRestaurants] = useState([]); // State for top restaurants
    const authUser = useAuthUser();
    const email = authUser?.email || null; // Safely access email
    const role = JSON.parse(localStorage.getItem("role"))?.role || null;
    const [isUser, setIsUser] = useState(false);

    useEffect(() => {
        if (email && role === "user") {
            fetchUser(email, setLoading, setUser);
            setIsUser(true);
            console.log("User role found");
        } else {
            console.log("Role not found or email is null");
            fetch("http://localhost:5000/restaurants/top-restaurants", {
                method: "GET",
            }) // Fetch top restaurants if user is not logged in
                .then((response) => {
                    if (!response.ok) {
                        throw new Error("Failed to fetch top restaurants");
                    }
                    return response.json();
                })
                .then((data) => {
                    console.log("Received top restaurants:", data);
                    setTopRestaurants(data.restaurants || []);
                    setLoading(false);
                })
                .catch((error) => {
                    console.error(error);
                    setLoading(false);
                });
        }
    }, [email, role]);

    // useEffect(() => {
    //     if (isUser && user) {
    //         // Fetch suggestions
    //         fetch("http://localhost:5000/suggestions", {
    //             method: "POST",
    //             headers: {
    //                 "Content-Type": "application/json",
    //             },
    //             body: JSON.stringify({
    //                 userId: user._id, // Ensure user._id exists
    //             }),
    //         })
    //             .then((response) => {
    //                 if (!response.ok) {
    //                     throw new Error("Failed to fetch restaurant recommendations");
    //                 }
    //                 return response.json();
    //             })
    //             .then((data) => {
    //                 console.log("Received suggested restaurants:", data);
    //                 setSuggestedRestaurants(data.suggestions || []); // Use the `suggestions` array from the API
    //                 setLoading(false);
    //             })
    //             .catch((error) => {
    //                 console.error(error);
    //                 setLoading(false);
    //             });
    //     }
    // }, [isUser, user]);

    const responsive = {
        desktop: {
            breakpoint: { max: 3000, min: 1024 },
            items: 3,
        },
        tablet: {
            breakpoint: { max: 1024, min: 464 },
            items: 2,
        },
        mobile: {
            breakpoint: { max: 464, min: 0 },
            items: 1,
        },
    };

    const renderSuggestedCarousel = (restaurants) => (
        <Carousel responsive={responsive} infinite autoPlay autoPlaySpeed={3000}>
            {restaurants.map((entry, index) => {
                const { restaurant, images } = entry; // Destructure `restaurant` and `images`
                const imageUrl = images?.[0]?.link || "/placeholder.jpg"; // Default image if none available
                return (
                    <div key={index} className="card">
                        <img
                            src={imageUrl}
                            alt={restaurant.name}
                            className="card-img-top"
                        />
                        <div className="card-body">
                            <h5 className="card-title">{restaurant.name}</h5>
                            <p className="card-text">{restaurant.description}</p>
                            <p className="card-text">Location: {restaurant.location}</p>
                            <p className="card-text">Price: {restaurant.price}</p>
                        </div>
                    </div>
                );
            })}
        </Carousel>
    );
    const renderTopCarousel = (restaurants) => (
        <Carousel responsive={responsive} infinite autoPlay autoPlaySpeed={3000}>
            {restaurants.map((entry, index) => {
                const restaurant = entry.restaurant || entry; // Handle nested `restaurant` or flat structure
                const images = entry.images || [];
                const imageUrl = images?.[0]?.link || "/placeholder.jpg"; // Default image if none available
                return (
                    <div key={index} className="card">
                        <img
                            src={imageUrl}
                            alt={restaurant.name}
                            className="card-img-top"
                            style={{ maxHeight: "200px", objectFit: "cover" }}
                        />
                        <div className="card-body">
                            <h5 className="card-title">{restaurant.name}</h5>
                            <p className="card-text">{restaurant.description}</p>
                            <p className="card-text">Location: {restaurant.location}</p>
                            <p className="card-text">Category: {restaurant.category}</p>
                            <p className="card-text">Price: {restaurant.price}</p>
                        </div>
                    </div>
                );
            })}
        </Carousel>
    );
    

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <h2>Top Restaurants</h2>
            {renderTopCarousel(topRestaurants)}
            {topRestaurants.length > 0 ? (
                renderTopCarousel(topRestaurants)
            ) : (
                <p>No top restaurants available.</p>
            )}
            {isUser && (
                <>
                    <h2>Suggested Restaurants</h2>
                    {suggestedRestaurants.length > 0 ? (
                        renderSuggestedCarousel(suggestedRestaurants)
                    ) : (
                        <p>No suggested restaurants available.</p>
                    )}
                </>
            )}
        </div>
    );
};

export default SuggestedRestaurants;
