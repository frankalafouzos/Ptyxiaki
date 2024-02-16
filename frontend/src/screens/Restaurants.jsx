import React, { useState, useEffect } from "react";
import Restaurant from "../components/Restaurant.component";
import PaginationComponent from "../components/Pagination.component";
import FilterRestaurants from "../components/FilterRestaurants.component";
import { Col, Row, Form, Pagination } from "react-bootstrap";
import "../css/Restaurants.css";

const Restaurants = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [images, setImages] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [priceFilter, setPriceFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);

  useEffect(() => {
    console.log(
      `Category: ${categoryFilter}, Location: ${locationFilter}, Price: ${priceFilter}`
    );
  }, [categoryFilter, locationFilter, priceFilter]);

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
      (priceFilter ? priceAsNumber <= priceFilter : true)
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

  return (
    <div className="main-container">
      <h1 className="restaurants-header">Our Restaurants:</h1>

      {/* Filter UI */}
      <FilterRestaurants
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
        locationFilter={locationFilter}
        setLocationFilter={setLocationFilter}
        priceFilter={priceFilter}
        setPriceFilter={setPriceFilter}
      />
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
