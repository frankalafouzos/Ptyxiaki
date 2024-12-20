import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import './Carousel.css';

const Carousel = ({ items, autoPlay, autoPlaySpeed }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % items.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? items.length - 1 : prevIndex - 1
    );
  };

  useEffect(() => {
    if (autoPlay) {
      const interval = setInterval(nextSlide, autoPlaySpeed);
      return () => clearInterval(interval);
    }
  }, [autoPlay, autoPlaySpeed]);

  return (
    <div className="carousel">
      <button className="carousel-button prev" onClick={prevSlide}>
        &#10094;
      </button>
      <div className="carousel-content">
        {items.map((item, index) => (
          <div
            key={index}
            className={`carousel-item ${
              index === currentIndex ? 'active' : ''
            }`}
          >
            {item}
          </div>
        ))}
      </div>
      <button className="carousel-button next" onClick={nextSlide}>
        &#10095;
      </button>
    </div>
  );
};

Carousel.propTypes = {
  items: PropTypes.arrayOf(PropTypes.node).isRequired,
  autoPlay: PropTypes.bool,
  autoPlaySpeed: PropTypes.number,
};

Carousel.defaultProps = {
  autoPlay: true,
  autoPlaySpeed: 3000,
};

export default Carousel;
