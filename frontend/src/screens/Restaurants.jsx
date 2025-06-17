import React, { useState, useEffect, useCallback } from "react";
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
  const [fadeOut, setFadeOut] = useState(false);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterLoading, setFilterLoading] = useState(false);
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
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(""); // Debounced search query
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Toggle filter visibility
  const toggleFilters = () => {
    setIsFilterOpen(!isFilterOpen);
  };

  // Debounce effect for search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500); // 500ms delay

    return () => clearTimeout(timer);
  }, [searchQuery]);

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
      // Show filter loading if it's not the initial load
      if (!loading) {
        setFilterLoading(true);
      }
      
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
        searchQuery: debouncedSearchQuery, // Use debounced search query
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
        setFilterLoading(false);
        setFadeOut(true);     
      } catch (error) {
        console.error("Error:", error);
        setLoading(false);
        setFilterLoading(false);
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
    debouncedSearchQuery, // Use debounced search query in dependency array
  ]);

  // Handle resetting filters
  const resetFilters = () => {
    setSort("Default");
    setSearchQuery("");
    setDebouncedSearchQuery(""); // Reset debounced search too
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
      debouncedSearchQuery || // Use debounced search query for filter check
      minPriceFilter ||
      maxPriceFilter ||
      categoryFilter ||
      locationFilter ||
      sort !== "Default"
    );
  };

  // Show only minimal loading spinner until all data is loaded
  if (loading) {
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
          <div className={`search-container ${searchQuery !== debouncedSearchQuery ? 'search-loading' : ''}`}>
            <input
              type="text"
              placeholder="Search by name, category, location..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
            />
            
            {/* Search Loading Spinner */}
            {searchQuery !== debouncedSearchQuery && (
              <div className="search-loading-spinner"></div>
            )}
            
            {/* Clear Search Button */}
            {searchQuery && (
              <button
                className="clear-search"
                onClick={() => {
                  setSearchQuery("");
                  setDebouncedSearchQuery("");
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

      {/* Show loading spinner when filtering, otherwise show content */}
      {filterLoading ? (
        <div className="filter-loading-container">
          <div className="filter-loading-spinner">
            <div className="spinner"></div>
          </div>
          <p className="loading-text">Updating results...</p>
        </div>
      ) : (
        <div>
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
      )}
    </div>
  );
};

export default Restaurants;