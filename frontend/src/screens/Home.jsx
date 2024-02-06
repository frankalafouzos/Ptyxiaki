import React from "react";

import "../css/Home.css";
import SearchBar from "../components/SearchBar";

// In your Home component, comment out the styles to test:
const Home = () => {
  return (
    <div>
      <SearchBar />
      <div className="home-container">
        <h1 className="home-header">Welcome to Our Application!</h1>
        <p className="home-paragraph">
          Explore the features of our amazing app.
        </p>
      </div>
    </div>
  );
};

export default Home;
