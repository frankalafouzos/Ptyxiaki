import React, { useState, useEffect } from "react";
import { fetchUser } from "../scripts/fetchUser";
import useAuthUser from "react-auth-kit/hooks/useAuthUser";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import Restaurant from "./Restaurant.component";

const SuggestedRestaurants = ({ onDataLoaded }) => {
  const [loadingSuggestions, setLoadingSuggestions] = useState(true);
  const [loadingTopRestaurants, setLoadingTopRestaurants] = useState(true);
  const [showSpinner, setShowSpinner] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);
  const [user, setUser] = useState(null);
  const [suggestedRestaurants, setSuggestedRestaurants] = useState([]);
  const [topRestaurants, setTopRestaurants] = useState([]);
  const authUser = useAuthUser();
  const email = authUser?.email || null;
  const role = JSON.parse(localStorage.getItem("role"))?.role || null;
  const [isUser, setIsUser] = useState(false);

  // Check if all data is loaded
  const isDataLoaded = !loadingTopRestaurants && (!isUser || !loadingSuggestions);

  // Hide spinner once both loading states are false
  useEffect(() => {
    if (isDataLoaded) {
      const fadeOutTimeout = setTimeout(() => setFadeOut(true), 500);
      const spinnerTimeout = setTimeout(() => {
        setShowSpinner(false);
        if (onDataLoaded) {
          onDataLoaded();
        }
      }, 1000);
      return () => {
        clearTimeout(fadeOutTimeout);
        clearTimeout(spinnerTimeout);
      };
    }
  }, [isDataLoaded, onDataLoaded]);

  useEffect(() => {
    if (email && role === "user") {
      fetchUser(email, () => {}, setUser);
      setIsUser(true);
    }

    fetch(process.env.REACT_APP_API_URL + "/restaurants/top-restaurants", {
      method: "GET",
    })
      .then((response) => {
        if (!response.ok) throw new Error("Failed to fetch top restaurants");
        return response.json();
      })
      .then((data) => {
        setTopRestaurants(data || []);
        setLoadingTopRestaurants(false);
      })
      .catch((error) => {
        console.error(error);
        setLoadingTopRestaurants(false);
      });
  }, []);

  useEffect(() => {
    if (isUser && user) {
      fetch(process.env.REACT_APP_API_URL + "/suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user._id }),
      })
        .then((response) => {
          if (!response.ok)
            throw new Error("Failed to fetch restaurant recommendations");
          return response.json();
        })
        .then((data) => {
          setSuggestedRestaurants(data.suggestions || []);
          setLoadingSuggestions(false);
        })
        .catch((error) => {
          console.error(error);
          setLoadingSuggestions(false);
        });
    }
  }, [isUser, user]);

  const responsive = {
    desktop: { breakpoint: { max: 3000, min: 1024 }, items: 3 },
    tablet: { breakpoint: { max: 1024, min: 464 }, items: 2 },
    mobile: { breakpoint: { max: 464, min: 0 }, items: 1 },
  };

  const renderSuggestedCarousel = (restaurants) => (
    <Carousel responsive={responsive} infinite autoPlay autoPlaySpeed={3000}>
      {restaurants.map((restaurantInfo, index) => {
        const { restaurant, images } = restaurantInfo;
        return (
          <Restaurant restaurant={restaurant} images={images} key={index} />
        );
      })}
    </Carousel>
  );

  const renderTopCarousel = (restaurants) => (
    <Carousel responsive={responsive} infinite autoPlay autoPlaySpeed={3000}>
      {restaurants.map((restaurantInfo, index) => {
        const { restaurant, images } = restaurantInfo;
        return (
          <Restaurant restaurant={restaurant} images={images} key={index} />
        );
      })}
    </Carousel>
  );

  // Show only minimal loading spinner until all data is loaded
  if (showSpinner) {
    return (
      <div>
        <style>
          {`
            .loading-container {
              display: flex;
              flex-direction: column;
              justify-content: center;
              align-items: center;
              padding: 2rem 0;
              background: transparent;
              transition: opacity 0.5s ease-in-out;
            }

            .spinner {
              width: 40px;
              height: 40px;
              border: 3px solid rgba(36, 30, 226, 0.2);
              border-top: 3px solid #241ee2;
              border-radius: 50%;
              animation: spin 1s linear infinite;
              margin-bottom: 1rem;
            }

            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }

            .loading-text {
              font-size: 16px;
              font-weight: 500;
              color: #333;
              text-align: center;
              margin: 0;
            }

            .fade-out {
              opacity: 0;
              transition: opacity 0.5s ease-in-out;
            }
          `}
        </style>
        <div className={`loading-container ${fadeOut ? "fade-out" : ""}`}>
          <div className="spinner"></div>
          <p className="loading-text">Loading restaurants...</p>
        </div>
      </div>
    );
  }

  // Show content only after all data is loaded
  return (
    <div>
      <style>
        {`
          .restaurant-section {
            margin-bottom: 4rem;
            animation: fadeInUp 0.8s ease-out forwards;
            opacity: 0;
            transform: translateY(30px);
          }

          .restaurant-section h2 {
            margin-bottom: 2rem;
            text-align: center;
            font-size: 2rem;
            color: #333;
          }

          @keyframes fadeInUp {
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          .restaurant-section:nth-child(2) {
            animation-delay: 0.3s;
          }

          .no-restaurants {
            text-align: center;
            font-size: 18px;
            color: #666;
            padding: 2rem 0;
            margin: 2rem 0;
          }
        `}
      </style>
      
      {isUser && suggestedRestaurants.length > 0 && (
        <div className="restaurant-section">
          <h2>Suggested Restaurants based on ChatGPT</h2>
          {renderSuggestedCarousel(suggestedRestaurants)}
        </div>
      )}

      {topRestaurants.length > 0 && (
        <div className="restaurant-section">
          <h2>Top Restaurants</h2>
          {renderTopCarousel(topRestaurants)}
        </div>
      )}
      
      {/* Show message if no content */}
      {(!isUser || suggestedRestaurants.length === 0) && topRestaurants.length === 0 && (
        <div className="no-restaurants">
          No restaurants available at the moment.
        </div>
      )}
    </div>
  );
};

export default SuggestedRestaurants;