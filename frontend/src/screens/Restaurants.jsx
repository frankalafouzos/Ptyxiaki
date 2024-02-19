import React, { useState, useEffect } from "react";
import Restaurant from "../components/Restaurant.component";
import PaginationComponent from "../components/Pagination.component";
import FilterRestaurants from "../components/FilterRestaurants.component";
import SortForm from "../components/SortRestaurants.component";
import { Col, Row } from "react-bootstrap";
import "../css/Restaurants.css";

const Restaurants = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [images, setImages] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState(
    localStorage.getItem("categoryFilter") || ""
  );
  const [locationFilter, setLocationFilter] = useState(
    localStorage.getItem("locationFilter") || ""
  );
  const [Sort, setSort] = useState(localStorage.getItem("Sort") || "");
  const [minPriceFilter, setMinPriceFilter] = useState(
    Number(localStorage.getItem("minPriceFilter")) || ""
  );
  const [maxPriceFilter, setMaxPriceFilter] = useState(
    Number(localStorage.getItem("maxPriceFilter")) || ""
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);

  useEffect(() => {
    localStorage.setItem("categoryFilter", categoryFilter);
    localStorage.setItem("locationFilter", locationFilter);
    localStorage.setItem("minPriceFilter", minPriceFilter);
    localStorage.setItem("maxPriceFilter", maxPriceFilter);
    localStorage.setItem("Sort", Sort);
  }, [categoryFilter, locationFilter, minPriceFilter, maxPriceFilter, Sort]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentPage]);

  useEffect(() => {
    fetch("http://localhost:5000/restaurants")
      .then((response) => response.json())
      .then((data) => {
        setRestaurants(data.restaurants);
        setImages(data.images);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }, []);

  // Filter restaurants based on selected criteria
  const filteredRestaurants = restaurants.filter((restaurant) => {
    const priceAsNumber = parseFloat(
      restaurant.price.replace(/[^0-9.-]+/g, "")
    );
    return (
      (categoryFilter ? restaurant.category === categoryFilter : true) &&
      (locationFilter ? restaurant.location === locationFilter : true) &&
      (minPriceFilter ? priceAsNumber >= minPriceFilter : true) &&
      (maxPriceFilter ? priceAsNumber <= maxPriceFilter : true)
    );
  });

  // Pagination calculations
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredRestaurants.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredRestaurants.length / itemsPerPage);

  //Sorting the restaurants
  const sortRestaurants = (e) => {
    const sortType = e.target.value;
    if (sortType === "price") {
      filteredRestaurants.sort((a, b) => {
        return (
          parseFloat(a.price.replace(/[^0-9.-]+/g, "")) -
          parseFloat(b.price.replace(/[^0-9.-]+/g, ""))
        );
      });
    } else if (sortType === "location") {
      filteredRestaurants.sort((a, b) => {
        return b.location - a.location;
      });
    } else if (sortType === "category") {
      filteredRestaurants.sort((a, b) => {
        return a.location - b.location;
      });
    }
  };

  return (
    <div className="main-container">
      <h1 className="restaurants-header">Our Restaurants:</h1>
      <div className="Subconteiner">
        {/* Filter UI */}
        <FilterRestaurants
          categoryFilter={categoryFilter}
          setCategoryFilter={setCategoryFilter}
          locationFilter={locationFilter}
          setLocationFilter={setLocationFilter}
          maxPriceFilter={maxPriceFilter}
          setMaxPriceFilter={setMaxPriceFilter}
          minPriceFilter={minPriceFilter}
          setMinPriceFilter={setMinPriceFilter}
        />

        {/* Sort UI */}
        <SortForm Sort={Sort} setSort={setSort} />
      </div>

      {/* Pagination */}
      <PaginationComponent
        totalPages={totalPages}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
      />

      {/* Restaurants */}
      <div className="restaurants-container">
        <Row className="row">
          {currentItems.map((restaurant, index) => (
            <Col sm={12} md={6} lg={6} xl={4} xxl={4}>
              <Restaurant
                restaurant={restaurant}
                index={index}
                images={images}
              />
            </Col>
          ))}
        </Row>
      </div>

      {/* Pagination */}
      <PaginationComponent
        totalPages={totalPages}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
      />
    </div>
  );
};

export default Restaurants;
