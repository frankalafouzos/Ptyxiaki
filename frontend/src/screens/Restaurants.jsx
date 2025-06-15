import React, { useState, useEffect } from "react";
import Restaurant from "../components/Restaurant.component";
import PaginationComponent from "../components/Pagination.component";
import FilterRestaurants from "../components/FilterRestaurants.component";
import SortForm from "../components/SortRestaurants.component";
import { Col, Row } from "react-bootstrap";
import "../css/Restaurants.css";
import { 
  FaCircleXmark, 
  FaFilter, 
  FaFilterCircleXmark,
  FaX
} from "react-icons/fa6";

const Restaurants = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState(
    localStorage.getItem("categoryFilter") || ""
  );
  const [locationFilter, setLocationFilter] = useState(
    localStorage.getItem("locationFilter") || ""
  );
  const [sort, setSort] = useState(localStorage.getItem("Sort") || "Default");
  const [minPriceFilter, setMinPriceFilter] = useState(
    localStorage.getItem("minPriceFilter") || ""
  );
  const [maxPriceFilter, setMaxPriceFilter] = useState(
    localStorage.getItem("maxPriceFilter") || ""
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [totalPages, setTotalPages] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Toggle filter visibility
  const toggleFilters = () => {
    setIsFilterOpen(!isFilterOpen);
  };

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
        sortField:
          sort === "Default" ? undefined : sort.split(" ")[0].toLowerCase(),
        sortOrder: sort.includes("Asc") ? "asc" : "dsc",
        categoryFilter: categoryFilter,
        locationFilter: locationFilter,
        minPrice: minPriceFilter,
        maxPrice: maxPriceFilter,
        searchQuery: searchQuery,
      }).toString();

      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/restaurants?${queryParams}`
        );
        const data = await response.json();
        setRestaurants(data.restaurants);
        setImages(data.images);
        setTotalPages(data.totalPages);
        setLoading(false);
      } catch (error) {
        console.error("Error:", error);
      }
    };

    fetchRestaurants();
  }, [
    currentPage,
    itemsPerPage,
    sort,
    categoryFilter,
    locationFilter,
    minPriceFilter,
    maxPriceFilter,
    searchQuery,
  ]);

  // Handle resetting filters
  const resetFilters = () => {
    setSort("Default");
    setSearchQuery("");
    setCategoryFilter("");
    setLocationFilter("");
    setMinPriceFilter("");
    setMaxPriceFilter("");
    setCurrentPage(1);
    localStorage.removeItem("categoryFilter");
    localStorage.removeItem("locationFilter");
    localStorage.removeItem("minPriceFilter");
    localStorage.removeItem("maxPriceFilter");
    localStorage.removeItem("Sort");
  };

  // Determine if any filters are applied
  const areFiltersApplied = () => {
    return (
      searchQuery ||
      minPriceFilter ||
      maxPriceFilter ||
      categoryFilter ||
      locationFilter ||
      sort !== "Default"
    );
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center pt-5">
        <div className="loader"></div>
      </div>
    );
  }

  return (
    <div className="main-container">
      <h1 className="restaurants-header">Our Restaurants:</h1>
      
      {/* Container for Filters, Search, and Sort */}
      <div className="controls-container">
        {/* Filter Button & Filters */}
        <div className={`filters-wrapper ${isFilterOpen ? "open" : ""}`}>
          <button className="filter-toggle-btn" onClick={toggleFilters}>
            <FaFilter />
            <span>{isFilterOpen ? "Hide Filters" : "Show Filters"}</span>
          </button>

          {/* Filters Container - Only show when isFilterOpen is true */}
          {isFilterOpen && (
            <div className="filter-container">
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
            </div>
          )}
        </div>

        {/* Search Field */}
        <div className="search-wrapper">
          <div className="search-container">
            <input
              type="text"
              placeholder="Search by name, category, location..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
            />
            {searchQuery && (
              <button
                className="clear-search"
                onClick={() => {
                  setSearchQuery("");
                  setCurrentPage(1);
                }}
                type="button"
                aria-label="Clear search"
              >
                <FaCircleXmark />
              </button>
            )}
          </div>
        </div>

        {/* Sort Form */}
        <div className="sort-wrapper">
          <SortForm Sort={sort} setSort={setSort} />
        </div>
      </div>

      {/* Reset button container */}
      {areFiltersApplied() && (
        <div className="reset-button-container">
          <button className="reset-filters-btn" onClick={resetFilters}>
            <FaX />
            <span>Reset Filters</span>
          </button>
        </div>
      )}

      <PaginationComponent
        totalPages={totalPages}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
      />

      {restaurants.length === 0 ? (
        <div className="error">
          <h2>No restaurants found</h2>
        </div>
      ) : (
        <div className="restaurants-container">
          <Row className="row">
            {restaurants.map((restaurant, index) => (
              <Col key={restaurant._id} xs={12} sm={12} md={6} lg={6} xl={4} xxl={4}>
                <Restaurant
                  restaurant={restaurant}
                  index={index}
                  images={images}
                  fromUsersDashboard={true}
                />
              </Col>
            ))}
          </Row>
        </div>
      )}

      <PaginationComponent
        totalPages={totalPages}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
      />
    </div>
  );
};

export default Restaurants;