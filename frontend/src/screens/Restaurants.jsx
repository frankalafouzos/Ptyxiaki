import React, { useState, useEffect } from 'react';
import Restaurant from '../components/Restaurant';
import { Col, Row } from "react-bootstrap";

const Restaurants = () => {
    const [restaurants, setRestaurants] = useState([]);
    const [images, setImages] = useState([]);

    useEffect(() => {
        fetch('http://localhost:5000/restaurants')
            .then(response => response.json())
            .then(data => {
                setRestaurants(data.restaurants);
                setImages(data.images);
            })
            .catch(error => {
                console.error('Error:', error);
            });
    }, []);

    // Function to get images for a specific restaurant
    

    return (
        <div className="home-container">
            <h1 className="home-header">Our Restaurants:</h1>
            <Row>
            <Col className="wrapped d-flex align-center justify-content-around flex-wrap m-4">
                {restaurants.map((restaurant, index) => (
                <Restaurant restaurant={restaurant} index={index} images={images} sm={12} md={6} lg={6} xl={6}/>


                ))}
            </Col>
            </Row>
        </div>
    );
};

export default Restaurants;
