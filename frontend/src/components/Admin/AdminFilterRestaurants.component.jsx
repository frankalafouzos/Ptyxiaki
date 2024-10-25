import React, { useState, useEffect } from 'react';

const FilterRestaurants = ({
  categoryFilter,
  setCategoryFilter,
  locationFilter,
  setLocationFilter,
  minPriceFilter,
  setMinPriceFilter,
  maxPriceFilter,
  setMaxPriceFilter,
  statusFilter,
  setStatusFilter,
  visitCounterMin,
  setVisitCounterMin,
  visitCounterMax,
  setVisitCounterMax,
}) => {
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [statuses, setStatus] = useState([]);

  // Fetch categories and locations when the component mounts
  useEffect(() => {
    const fetchCategoriesAndLocations = async () => {
      try {
        const [categoriesResponse, locationsResponse, statusResponse] = await Promise.all([
          fetch('http://localhost:5000/restaurants/categories'),
          fetch('http://localhost:5000/restaurants/locations'),
          fetch('http://localhost:5000/restaurants/status')
        ]);

        const categoriesData = await categoriesResponse.json();
        const locationsData = await locationsResponse.json();
        const statusData = await statusResponse.json();

        setCategories(categoriesData);
        setLocations(locationsData);
        setStatus(statusData);
      } catch (error) {
        console.error('Error fetching categories and locations:', error);
      }
    };

    fetchCategoriesAndLocations();
  }, []);

  return (
    <div className="filter-container">
      {/* Category dropdown */}
      <div className="form-group">
        <label>Category:</label>
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="form-control">
          <option value="">All</option>
          {categories.map((category, index) => (
            <option key={index} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      {/* Location dropdown */}
      <div className="form-group">
        <label>Location:</label>
        <select value={locationFilter} onChange={(e) => setLocationFilter(e.target.value)} className="form-control">
          <option value="">All</option>
          {locations.map((location, index) => (
            <option key={index} value={location}>
              {location}
            </option>
          ))}
        </select>
      </div>

      {/* Min Price */}
      <div className="form-group">
        <label>Min Price:</label>
        <input
          type="number"
          value={minPriceFilter}
          onChange={(e) => setMinPriceFilter(e.target.value)}
          className="form-control"
        />
      </div>

      {/* Max Price */}
      <div className="form-group">
        <label>Max Price:</label>
        <input
          type="number"
          value={maxPriceFilter}
          onChange={(e) => setMaxPriceFilter(e.target.value)}
          className="form-control"
        />
      </div>

      {/* Status dropdown (admin-specific) */}
      <div className="form-group">
        <label>Status:</label>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="form-control">
        <option value="">All</option>
          {statuses.map((status, index) => (
            <option key={index} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>

      {/* Min Visit Counter */}
      <div className="form-group">
        <label>Min Visit Counter:</label>
        <input
          type="number"
          value={visitCounterMin}
          onChange={(e) => setVisitCounterMin(e.target.value)}
          className="form-control"
        />
      </div>

      {/* Max Visit Counter */}
      <div className="form-group">
        <label>Max Visit Counter:</label>
        <input
          type="number"
          value={visitCounterMax}
          onChange={(e) => setVisitCounterMax(e.target.value)}
          className="form-control"
        />
      </div>
    </div>
  );
};

export default FilterRestaurants;
