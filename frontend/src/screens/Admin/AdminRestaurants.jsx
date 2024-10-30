import React, { useState, useEffect } from "react";
import Restaurant from "../../components/Restaurant.component";
import PaginationComponent from "../../components/Pagination.component";
import FilterRestaurants from "../../components/Admin/AdminFilterRestaurants.component";
import SortForm from "../../components/Admin/AdminSortRestaurants.component";
import { Col, Row } from "react-bootstrap";
import "../../css/Admin/AdminRestaurants.css";
import { FaFilter, FaCircleXmark, FaFilterCircleXmark, FaX } from "react-icons/fa6"; // Import icons

const AdminRestaurants = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [restaurants, setRestaurants] = useState([]);
  const [images, setImages] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState(localStorage.getItem("categoryFilter") || "");
  const [locationFilter, setLocationFilter] = useState(localStorage.getItem("locationFilter") || "");
  const [searchQuery, setSearchQuery] = useState("");
  const [sort, setSort] = useState(localStorage.getItem("Sort") || "Default");
  const [isFilterOpen, setIsFilterOpen] = useState(false); // For toggling filters visibility
  const [minPriceFilter, setMinPriceFilter] = useState(localStorage.getItem("minPriceFilter") || "");
  const [maxPriceFilter, setMaxPriceFilter] = useState(localStorage.getItem("maxPriceFilter") || "");
  const [statusFilter, setStatusFilter] = useState(""); // Admin-specific status filter
  const [visitCounterMin, setVisitCounterMin] = useState(""); // Admin-specific visit counter filter
  const [visitCounterMax, setVisitCounterMax] = useState(""); // Admin-specific visit counter filter
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [totalPages, setTotalPages] = useState(0);

  // Toggle filter visibility
  const toggleFilters = () => {
    setIsFilterOpen(!isFilterOpen);
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentPage]);

  // Handle resetting filters
  const resetFilters = () => {
    setSort("Default");
    setSearchQuery('');  // Clear search input
    setCategoryFilter('');
    setLocationFilter('');
    setMinPriceFilter('');
    setMaxPriceFilter('');
    setStatusFilter('');
    setVisitCounterMin('');
    setVisitCounterMax('');
    localStorage.removeItem('categoryFilter');
    localStorage.removeItem('locationFilter');
    localStorage.removeItem('minPriceFilter');
    localStorage.removeItem('maxPriceFilter');
    localStorage.removeItem('Sort');
  };

  // Determine if any filters are applied
  const areFiltersApplied = () => {
    return (
      searchQuery ||
      minPriceFilter ||
      maxPriceFilter ||
      statusFilter ||
      categoryFilter ||
      locationFilter ||
      visitCounterMin ||
      visitCounterMax || sort !== "Default"
    );
  };

  useEffect(() => {
    localStorage.setItem("categoryFilter", categoryFilter);
    localStorage.setItem("locationFilter", locationFilter);
    localStorage.setItem("minPriceFilter", minPriceFilter);
    localStorage.setItem("maxPriceFilter", maxPriceFilter);
    localStorage.setItem("Sort", sort);
  }, [categoryFilter, locationFilter, minPriceFilter, maxPriceFilter, sort]);

  useEffect(() => {
    const fetchRestaurants = async () => {
      const body = {
        page: currentPage,
        itemsPerPage: itemsPerPage,
        sortField: sort === "Default" ? undefined : sort.split(" ")[0].toLowerCase(),
        sortOrder: sort.includes("Asc") ? "asc" : "desc",
        categoryFilter: categoryFilter,
        locationFilter: locationFilter,
        searchQuery, // Search query included
        minPrice: minPriceFilter,
        maxPrice: maxPriceFilter,
        status: statusFilter, // Admin-specific status filter
        visitCounterMin: visitCounterMin,
        visitCounterMax: visitCounterMax,
      };

      try {
        const response = await fetch(`http://localhost:5000/admins/filter`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        });

        const data = await response.json();
        setRestaurants(data.restaurants);
        setImages(data.images);
        setTotalPages(data.totalPages);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching restaurants:", error);
      }
    };

    fetchRestaurants();
  }, [
    currentPage,
    itemsPerPage,
    sort,
    categoryFilter,
    locationFilter,
    searchQuery,
    minPriceFilter,
    maxPriceFilter,
    statusFilter,
    visitCounterMin,
    visitCounterMax,
  ]);

  if (loading) {
    return <div className="d-flex justify-content-center pt-5"><div className="loader"></div></div>
  }

  return (
    <div className="main-container">
      <h1 className="restaurants-header">Restaurants:</h1>

      {/* Container for Search, Filters, and Sort */}
      <div className="controls-container">
        {/* Filter Button & Filters */}
        <div className={`filters-wrapper ${isFilterOpen ? "open" : ""}`}>
          <div className={`filters-wrapper ${isFilterOpen ? "open" : ""}`}>
            <button className="filter-toggle-btn" onClick={toggleFilters}>
              <FaFilter />
              <span>{isFilterOpen ? "Hide Filters" : "Show Filters"}</span>
            </button>

            
          </div>
          

          {/* Filters Container */}
          <FilterRestaurants
            categoryFilter={categoryFilter}
            setCategoryFilter={setCategoryFilter}
            locationFilter={locationFilter}
            setLocationFilter={setLocationFilter}
            maxPriceFilter={maxPriceFilter}
            setMaxPriceFilter={setMaxPriceFilter}
            minPriceFilter={minPriceFilter}
            setMinPriceFilter={setMinPriceFilter}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            visitCounterMin={visitCounterMin}
            setVisitCounterMin={setVisitCounterMin}
            visitCounterMax={visitCounterMax}
            setVisitCounterMax={setVisitCounterMax}
          />

        </div>

        {/* Search Field */}
        <div className="search-wrapper">
          <div className="search-container">
            <input
              type="text"
              placeholder="Search by name, category, location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button className="clear-search" onClick={() => setSearchQuery('')}>
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
      <div className="reset-button-container">
      {areFiltersApplied() && (
              <button className="reset-filters-btn" onClick={resetFilters}>
                <FaX />
                <span>Reset Filters</span>
              </button>
            )}
      </div>
      <PaginationComponent
        totalPages={totalPages}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
      />
      {(restaurants.length === 0 && loading===false) ? (
        <div className="error"><h2>No restaurants found</h2></div>
  ) :(
      <div className="restaurants-container">
        <Row className="row">
          {restaurants.map((restaurant, index) => (
            <Col key={restaurant._id} sm={12} md={6} lg={6} xl={4} xxl={4}>
              <Restaurant
                restaurant={restaurant}
                index={index}
                images={images}
                fromAdminDashboard={true}
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

export default AdminRestaurants;
