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
  const [sortedAndFilteredRestaurants, setSortedAndFilteredRestaurants] =
    useState([]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentPage]);

  useEffect(() => {
    fetch("http://localhost:5000/restaurants")
      .then((response) => response.json())
      .then((data) => {
        setRestaurants(data.restaurants);
        setImages(data.images);
        setSortedAndFilteredRestaurants(data.restaurants);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }, []);

  useEffect(() => {
    const updateRestaurants = () => {
      let updatedRestaurants = restaurants;
      if (Sort !== "Default") {
        switch (Sort) {
          case "Price Asc":
            // console.log(updatedRestaurants);
            // updatedRestaurants.price = parseFloat(updatedRestaurants.price)
            // updatedRestaurants.sort();
            updatedRestaurants = updatedRestaurants.sort(
              (a, b) =>
                parseFloat(a.price.replace(/[^0-9.-]+/g, "")) -
                parseFloat(b.price.replace(/[^0-9.-]+/g, ""))
            );
            break;
          case "Price Dsc":
            console.log("Price Dsc");
            updatedRestaurants = updatedRestaurants.sort(
              (a, b) =>
                parseFloat(b.price.replace(/[^0-9.-]+/g, "")) -
                parseFloat(a.price.replace(/[^0-9.-]+/g, ""))
            );
            break;
          case "Location Asc":
            console.log("Location Asc");
            updatedRestaurants = updatedRestaurants.sort((a, b) =>
              a.location.localeCompare(b.location)
            );
            break;
          case "Location Dsc":
            console.log("Location Dsc");
            updatedRestaurants = updatedRestaurants.sort((a, b) =>
              b.location.localeCompare(a.location)
            );
            break;
          case "Category Asc":
            console.log("Category Asc");
            updatedRestaurants = updatedRestaurants.sort((a, b) =>
              a.category.localeCompare(b.category)
            );
            break;
          case "Category Dsc":
            console.log("Category Dsc");
            updatedRestaurants = updatedRestaurants.sort((a, b) =>
              b.category.localeCompare(a.category)
            );
            break;
          case "A-Z":
            console.log("A-Z");
            updatedRestaurants = updatedRestaurants.sort((a, b) => a.name.localeCompare(b.name));
            break;
          case "Z-A":
            console.log("Z-A");
            updatedRestaurants = updatedRestaurants.sort((a, b) => b.name.localeCompare(a.name));
            break;
          default:
            console.log("Default");
            // No sorting or default sorting logic
            break;
        }
        updatedRestaurants = updatedRestaurants.filter((restaurant) => {
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
        // console.log(updatedRestaurants)

        return updatedRestaurants;
      }
    };
    setSortedAndFilteredRestaurants(updateRestaurants());
  }, [
    Sort,
    restaurants,
    categoryFilter,
    locationFilter,
    minPriceFilter,
    maxPriceFilter,
  ]);

  // Pagination calculations
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedAndFilteredRestaurants.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(
    sortedAndFilteredRestaurants.length / itemsPerPage
  );

  // // Sorting the restaurants
  // const sortRestaurants = (e) => {
  //   const sortType = e;
  //   console.log(sortType);
  //   switch (sortType) {
  //     case "Price Asc":
  //       filteredRestaurants.sort(
  //         (a, b) =>
  //           parseFloat(a.price.replace(/[^0-9.-]+/g, "")) -
  //           parseFloat(b.price.replace(/[^0-9.-]+/g, ""))
  //       );
  //       break;
  //     case "Price Dsc":
  //       filteredRestaurants.sort(
  //         (a, b) =>
  //           parseFloat(b.price.replace(/[^0-9.-]+/g, "")) -
  //           parseFloat(a.price.replace(/[^0-9.-]+/g, ""))
  //       );
  //       break;
  //     case "Location Asc":
  //       filteredRestaurants.sort((a, b) =>
  //         a.location.localeCompare(b.location)
  //       );
  //       break;
  //     case "Location Dsc":
  //       filteredRestaurants.sort((a, b) =>
  //         b.location.localeCompare(a.location)
  //       );
  //       break;
  //     case "Category Asc":
  //       filteredRestaurants.sort((a, b) =>
  //         a.category.localeCompare(b.category)
  //       );
  //       break;
  //     case "Category Dsc":
  //       filteredRestaurants.sort((a, b) =>
  //         b.category.localeCompare(a.category)
  //       );
  //       break;
  //     case "A-Z":
  //       filteredRestaurants.sort((a, b) => a.name.localeCompare(b.name));
  //       break;
  //     case "Z-A":
  //       filteredRestaurants.sort((a, b) => b.name.localeCompare(a.name));
  //       break;
  //     default:
  //       // No sorting or default sorting logic
  //       break;
  //   }
  // };

  // Sort && sortRestaurants(Sort);

  // Ensure you use 'restaurants' state in your render method, not 'filteredRestaurants'

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
