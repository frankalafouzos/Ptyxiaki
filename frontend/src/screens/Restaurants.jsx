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
  const [categoryFilter, setCategoryFilter] = useState(localStorage.getItem("categoryFilter") || "");
  const [locationFilter, setLocationFilter] = useState(localStorage.getItem("locationFilter") || "");
  const [sort, setSort] = useState(localStorage.getItem("Sort") || "Default");
  const [minPriceFilter, setMinPriceFilter] = useState(localStorage.getItem("minPriceFilter") || "");
  const [maxPriceFilter, setMaxPriceFilter] = useState(localStorage.getItem("maxPriceFilter") || "");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentPage]);

  useEffect(() => {
    localStorage.setItem("categoryFilter", categoryFilter);
    localStorage.setItem("locationFilter", locationFilter);
    localStorage.setItem("minPriceFilter", minPriceFilter);
    localStorage.setItem("maxPriceFilter", maxPriceFilter);
    localStorage.setItem("Sort", sort);
  }, [categoryFilter, locationFilter, minPriceFilter, maxPriceFilter, sort]);

  useEffect(() => {
    const fetchRestaurants = async () => {
      const queryParams = new URLSearchParams({
        page: currentPage,
        itemsPerPage: itemsPerPage,
        sortField: sort === "Default" ? undefined : sort.split(" ")[0].toLowerCase(),
        sortOrder: sort.includes("Asc") ? "asc" : "dsc",
        categoryFilter: categoryFilter,
        locationFilter: locationFilter,
        minPrice: minPriceFilter,
        maxPrice: maxPriceFilter,
      }).toString();

      try {
        const response = await fetch(`http://localhost:5000/restaurants?${queryParams}`);
        const data = await response.json();
        setRestaurants(data.restaurants);
        setImages(data.images);
        setTotalPages(data.totalPages);
      } catch (error) {
        console.error("Error:", error);
      }
    };

    fetchRestaurants();
  }, [currentPage, itemsPerPage, sort, categoryFilter, locationFilter, minPriceFilter, maxPriceFilter]);

  return (
    <div className="main-container">
      <h1 className="restaurants-header">Our Restaurants:</h1>
      <div className="Subconteiner">
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

        <SortForm Sort={sort} setSort={setSort} />
      </div>

      <PaginationComponent
        totalPages={totalPages}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
      />

      <div className="restaurants-container">
        <Row className="row">
          {restaurants.map((restaurant, index) => (
            <Col key={restaurant._id} sm={12} md={6} lg={6} xl={4} xxl={4}>
              <Restaurant
                restaurant={restaurant}
                index={index}
                images={images}
              />
            </Col>
          ))}
        </Row>
      </div>

      <PaginationComponent
        totalPages={totalPages}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
      />
    </div>
  );
};

export default Restaurants;
