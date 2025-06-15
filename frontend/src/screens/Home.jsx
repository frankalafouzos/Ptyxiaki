import React, { useEffect, useState } from "react";
import "../css/Home.css";
import SuggestedRestaurants from "../components/SuggestedRestaurants.component";

const Home = () => {
  useEffect(() => {
    const handleScroll = () => {
      const content = document.querySelector('.content-section');
      if (content) {
        const position = content.getBoundingClientRect().top;
        const windowHeight = window.innerHeight;

        if (position < windowHeight - 100) {
          content.classList.add('show');
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className="home-container">
      {/* Hero Section with Background Image and Text Overlay */}
      <div className="hero-section">
        <div className="hero-text">
          <h1>Welcome to Book a Bite</h1>
          <p>Discover the best restaurants near you with a seamless booking experience.</p>
        </div>
      </div>

      {/* Content Section with Scrolling Animation */}
      <div className="content-section">
        <div className="suggested-restaurants">
          <SuggestedRestaurants />
        </div>
      </div>
    </div>
  );
};

export default Home;