// FilterForm.js
import React, { useState, useEffect } from "react";
import { Form } from "react-bootstrap";

const FilterForm = ({
  categoryFilter,
  setCategoryFilter,
  locationFilter,
  setLocationFilter,
  maxPrice,
  setMaxPriceFilter,
  minPrice,
  setMinPriceFilter,
  Sort,
  setSort,
}) => {

    const [categories, setCategories] = useState([]);
    const [locations, setLocations] = useState([]);

    useEffect(() => {
      const fetchCategoriesAndLocations = async () => {
        try {
          const [categoriesResponse, locationsResponse] =
            await Promise.all([
              fetch(process.env.REACT_APP_API_URL + "/restaurants/categories"),
              fetch(process.env.REACT_APP_API_URL + "/restaurants/locations"),
            ]);
  
          const categoriesData = await categoriesResponse.json();
          const locationsData = await locationsResponse.json();
  
          setCategories(categoriesData);
          setLocations(locationsData);
        } catch (error) {
          console.error("Error fetching categories and locations:", error);
        }
      };
  
      fetchCategoriesAndLocations();
    }, []);



  return (
    <>
    <Form className="filters">
      <Form.Group className="form-group">
        <Form.Label>Category</Form.Label>
        <Form.Control
          className="categories"
          as="select"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >          
          <option value="">All</option>
          {categories.map((category, index) => (
            <option key={index} value={category}>
              {category}
            </option>
          ))}
        </Form.Control>
      </Form.Group>
      <Form.Group className="form-group">
        <Form.Label>Location</Form.Label>
        <Form.Control
          className="locations"
          as="select"
          value={locationFilter}
          onChange={(e) => setLocationFilter(e.target.value)}
        >
          <option value="">All Locations</option>
          {locations.map((location, index) => (
            <option key={index} value={location}>
              {location}
            </option>
          ))}
        </Form.Control>
      </Form.Group>
      <Form.Group className="form-group">
        <Form.Label>Min Price</Form.Label>
        <Form.Control
          className="minPrice"
          type="number"
          value={minPrice}
          onChange={(e) => setMinPriceFilter(e.target.value)}
        />
      </Form.Group>
      <Form.Group className="form-group">
        <Form.Label>Max Price</Form.Label>
        <Form.Control
          className="maxPrice"
          type="number"
          value={maxPrice}
          onChange={(e) => setMaxPriceFilter(e.target.value)}
        />
      </Form.Group>

    </Form>
        </>
  );
};

export default FilterForm;
