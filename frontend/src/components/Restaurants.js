import React, { useState, useEffect } from 'react';

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
    const getImagesForRestaurant = (restaurantId) => {
        return images.filter(image => image.ImageID === restaurantId);
    };

    return (
        <div className="home-container">
            <h1 className="home-header">Our Restaurants:</h1>
            <div className="wrapped d-flex align-center justify-content-around flex-wrap m-4">
                {restaurants.map((restaurant, index) => {
                    const restaurantImages = getImagesForRestaurant(restaurant.imageID);
                    return (
                        <div key={index} className="card m-5 d-flex justify-content-between" style={{ width: '40rem', borderRadius: '10%' }}>
                            {/* Carousel for Restaurant Images */}
                            <div id={`Restaurant${index}`} className="carousel slide" data-ride="carousel">
                                <ol className="carousel-indicators">
                                    {restaurantImages.map((img, idx) => (
                                        <li key={idx} data-target={`#Restaurant${index}`} data-slide-to={idx} className={idx === 0 ? 'active' : ''}></li>
                                    ))}
                                </ol>
                                <div className="carousel-inner">
                                    {restaurantImages.map((img, idx) => (
                                        <div key={idx} className={`carousel-item ${idx === 0 ? 'active' : ''}`}>
                                            <img 
                                                style={{ width: 'auto', height: '30rem', borderRadius: '10% 10% 0% 0%' }} 
                                                className="card-img-top d-block w-100 images" 
                                                src={require(`../imgs/${img.link.split('/').pop()}`)} // Adjust path as necessary
                                                alt={`Slide ${idx}`} 
                                            />
                                        </div>
                                    ))}
                                </div>
                                {/* Carousel Controls */}
                                <a className="carousel-control-prev" href={`#Restaurant${index}`} role="button" data-slide="prev">
                                    <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                                    <span className="sr-only">Previous</span>
                                </a>
                                <a className="carousel-control-next" href={`#Restaurant${index}`} role="button" data-slide="next">
                                    <span className="carousel-control-next-icon" aria-hidden="true"></span>
                                    <span className="sr-only">Next</span>
                                </a>
                            </div>

                            {/* Restaurant Details */}
                            <div className="card-body">
                                <h4 className="card-title" style={{ color: 'rgb(12, 103, 183)' }}>
                                    {restaurant.name}
                                </h4>
                                <h5 className="card-subtitle mb-2 text-muted">ID: {restaurant._id}</h5>
                                <h5 className="card-subtitle mb-2 text-muted">Price per person: {restaurant.price}</h5>
                                <p className="card-text" style={{ fontSize: '1.25rem' }}>Category: {restaurant.category}</p>
                                <p className="card-text" style={{ fontSize: '1.25rem' }}>Location: {restaurant.location}</p>
                                <div className="d-flex justify-content-between">
                                    <form action={`/restaurant/${restaurant._id}`} method="get">
                                        <button id="GoToRest" className="btn">Go to the Restaurants page</button>
                                    </form>
                                    <form className="d-flex pb-2 pr-3 justify-content-end" style={{ bottom: 0 }}>
                                        <button type="submit" className="btn btn-success">Book a table now!</button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Restaurants;
