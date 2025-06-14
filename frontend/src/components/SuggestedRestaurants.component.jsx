import React, { useState, useEffect } from "react";
import { fetchUser } from "../scripts/fetchUser";
import useAuthUser from "react-auth-kit/hooks/useAuthUser";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import Restaurant from "./Restaurant.component";

const SuggestedRestaurants = () => {
  const [loadingSuggestions, setLoadingSuggestions] = useState(true);
  const [loadingTopRestaurants, setLoadingTopRestaurants] = useState(true);
  const [showSpinner, setShowSpinner] = useState(true);
  const [fadeOut, setFadeOut] = useState(false); // Fade-out effect
  const [user, setUser] = useState(null);
  const [suggestedRestaurants, setSuggestedRestaurants] = useState([]);
  const [topRestaurants, setTopRestaurants] = useState([]);
  const authUser = useAuthUser();
  const email = authUser?.email || null;
  const role = JSON.parse(localStorage.getItem("role"))?.role || null;
  const [isUser, setIsUser] = useState(false);

  // Hide spinner once both loading states are false
  useEffect(() => {
    if (!loadingTopRestaurants && (!isUser || !loadingSuggestions)) {
      const fadeOutTimeout = setTimeout(() => setFadeOut(true), 500);
      const spinnerTimeout = setTimeout(() => setShowSpinner(false), 1000);
      return () => {
        clearTimeout(fadeOutTimeout);
        clearTimeout(spinnerTimeout);
      };
    }
  }, [loadingTopRestaurants, loadingSuggestions, isUser]);

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
  }, [email, role]);

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

  return (
    <div>
      <style>
        {`
                    .global-spinner {
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        position: fixed;
                        width: 100%;
                        top: 0;
                        left: 0;
                        z-index: 9999;
                        transition: opacity 0.5s ease-in-out;
                    }

                    .spinner {
                        width: 50px;
                        height: 50px;
                        border: 5px solid rgba(0, 0, 0, 0.1);
                        border-top: 5px solid #241ee2;
                        border-radius: 50%;
                        animation: spin 1s linear infinite;
                    }

                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }

                    .loading-spinner {
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        font-size: 16px;
                        font-weight: bold;
                        color: #ff5733;
                        padding: 10px;
                        margin-top: 10px;
                    }

                    .fade-out {
                        opacity: 0;
                        transition: opacity 0.5s ease-in-out;
                    }
                `}
      </style>
      {showSpinner ? (
        <div className={`global-spinner ${fadeOut ? "fade-out" : ""}`}>
          <div className="spinner"></div>
        </div>
      ) : (
        <>
          {isUser && (
            <>
              <h2>Suggested Restaurants based on ChatGPT</h2>
              {loadingSuggestions ? (
                <>
                  <div className="loading-spinner">
                    ⏳ Finding the best options...
                  </div>
                  {topRestaurants.length > 0 &&
                    renderTopCarousel(topRestaurants)}
                </>
              ) : suggestedRestaurants.length > 0 ? (
                renderSuggestedCarousel(suggestedRestaurants)
              ) : (
                <p>No suggested restaurants available.</p>
              )}
            </>
          )}

          <h2>Top Restaurants</h2>
          {loadingTopRestaurants ? (
            <div className="loading-spinner">⏳ Loading top restaurants...</div>
          ) : topRestaurants.length > 0 ? (
            renderTopCarousel(topRestaurants)
          ) : (
            <p>No top restaurants available.</p>
          )}
        </>
      )}
    </div>
  );
};

export default SuggestedRestaurants;
