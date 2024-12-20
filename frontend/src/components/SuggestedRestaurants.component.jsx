import React, { useState, useEffect } from "react";
import { fetchUser } from "../scripts/fetchUser";
import useAuthUser from "react-auth-kit/hooks/useAuthUser";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import Restaurant from "./Restaurant.component";

const SuggestedRestaurants = () => {
    const [loading, setLoading] = useState(true);
    const [loadingTopRestaurants, setLoadingTopRestaurants] = useState(true);
    const [loadingSuggestions, setLoadingSuggestions] = useState(true);
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
        }
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
                setTopRestaurants(data || []);
                setLoadingTopRestaurants(false);
            })
            .catch((error) => {
                console.error(error);
                setLoadingTopRestaurants(false);
            });
        // }
    }, [email, role]);

    useEffect(() => {
        if (isUser && user) {
            // Fetch suggestions
            fetch("http://localhost:5000/suggestions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    userId: user._id, // Ensure user._id exists
                }),
            })
                .then((response) => {
                    if (!response.ok) {
                        throw new Error("Failed to fetch restaurant recommendations");
                    }
                    return response.json();
                })
                .then((data) => {
                    console.log("Received suggested restaurants:", data);
                    setSuggestedRestaurants(data.suggestions || []); // Use the `suggestions` array from the API
                    setLoadingSuggestions(false);
                })
                .catch((error) => {
                    console.error(error);
                    setLoadingSuggestions(false);
                });
        }
    }, [isUser, user]);

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
            {restaurants.map((restaurantInfo, index) => {
                const { restaurant, images } = restaurantInfo;
                console.log("Restaurant:", restaurant);
                console.log("Images:", images);

                // Ensure you return the component here
                return <Restaurant restaurant={restaurant} images={images} key={index} />;
            })}
        </Carousel>
    );
    const renderTopCarousel = (restaurants) => {
        return (
            <Carousel responsive={responsive} infinite autoPlay autoPlaySpeed={3000}>
                {restaurants.map((restaurantInfo, index) => {
                    const { restaurant, images } = restaurantInfo;
                    console.log("Restaurant:", restaurant);
                    console.log("Images:", images);

                    // Ensure you return the component here
                    return <Restaurant restaurant={restaurant} images={images} key={index} />;
                })}
            </Carousel>
        );
    };

    return (
        <div>
            {isUser && (
                <>
                    <h2>Suggested Restaurants based on ChatGPT</h2>
                    {loadingSuggestions ? (
                        <div className="loading-spinner">Loading...</div> // Replace with your spinner component or animation
                    ) : suggestedRestaurants.length > 0 ? (
                        renderSuggestedCarousel(suggestedRestaurants)
                    ) : (
                        <p>No suggested restaurants available.</p>
                    )}
                </>
            )}

            <h2>Top Restaurants</h2>
            {loadingTopRestaurants ? (
                <div className="loading-spinner">Loading...</div> // Replace with your spinner component or animation
            ) : topRestaurants.length > 0 ? (
                renderTopCarousel(topRestaurants)
            ) : (
                <p>No top restaurants available.</p>
            )}
        </div>

    );
};

export default SuggestedRestaurants;
