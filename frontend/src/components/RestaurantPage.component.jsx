import React, { useState, useEffect , useRef } from 'react';
import { Container, Row, Col, Carousel, Button } from 'react-bootstrap';
import { useParams } from 'react-router-dom'; 
import '../css/RestaurantPage.css';


const Restaurant = () => {
  const [restaurant, setRestaurant] = useState([]);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = useParams();
  const [maxImageHeight, setMaxImageHeight] = useState(0);
  const imageRefs = useRef([]);

  useEffect(() => {
    console.log('Fetching restaurant data for ID:', id);
    
    fetch(`http://localhost:5000/restaurants/${id}`)
      .then(response => {
        if (!response.ok) {
            console.log(response)
          throw new Error('Restaurant not found');
        }
        return response.json();
      })
      .then(data => {
        console.log('Received restaurant data:', data);
        setRestaurant(data.restaurant);
        setLoading(false);
        setImages(data.images)
      })
      .catch(error => {
        console.error('Error fetching restaurant data:', error);
        setError(error.message);
        setLoading(false);
      });
  }, [id]);

  useEffect(() => {
    // Ensure the images array is not empty
    if (images.length === 0) return;

    // Calculate the tallest image height
    const imageHeights = imageRefs.current.map(ref => ref?.offsetHeight || 0);
    const tallestImageHeight = Math.max(...imageHeights);
    setMaxImageHeight(tallestImageHeight);
  }, [images]); // Dependency on 'images'

  
  const [activeImage, setActiveImage] = useState(0);

  const nextImage = () => {
    setActiveImage((prevIndex) => (prevIndex + 1) % images.length);
  };

  const prevImage = () => {
    setActiveImage((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  };
  

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!restaurant) return <div>No restaurant data</div>;

  // JSX code to display restaurant details
  return (
    <Container className="restaurant-container">
      <Row className="content-layout">
        <Col className="carousel-container">
          <Carousel activeIndex={activeImage} onSelect={(selectedIndex) => setActiveImage(selectedIndex)}>
            {images.map((img, idx) => (
              <Carousel.Item key={idx}>
                <img
                  className={`d-block w-100 ${idx === activeImage ? 'active' : ''}`}
                  src={require(`../imgs/${img.link.split('/').pop()}`)}
                  alt={`Restaurant ${idx}`}
                />
              </Carousel.Item>
            ))}
          </Carousel>
          <button className="carousel-control prev" onClick={prevImage}>&lt;</button>
          <button className="carousel-control next" onClick={nextImage}>&gt;</button>
        </Col>

        <Col className="info-container" md={6}>
          <div className='info-top'>
            <h1 id="name">{restaurant.name}</h1>
            <h2 className="info">Average price per person: {restaurant.price}</h2>
            <h3 className="info">About us: {restaurant.description}</h3>
            <h4 className="info">Category: {restaurant.category}</h4>
            <h4 className="info">Location: {restaurant.location}</h4>
            <h4 className="info">Phone number: 
              <a className="text-decoration-none text-info" href={`tel:+${restaurant.phone}`}>
                {restaurant.phone}
              </a>
            </h4>
            <h4 className="info">Email:
              <a className="text-decoration-none text-info" href={`mailto:${restaurant.email}`}>
                {restaurant.email}
              </a>
            </h4>
          </div>
          <div className='booking-button'>
            <Button variant="outline-success">Book a table</Button>
          </div>
        </Col>
      </Row>
    </Container>
  )
};

export default Restaurant;





// old code

// const RestaurantPage = () => {
//   const [restaurant, setRestaurant] = useState([]);
//   const [images, setImages] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const { id } = useParams();
//   const [maxImageHeight, setMaxImageHeight] = useState(0);
//   const imageRefs = useRef([]);

//   useEffect(() => {
//     console.log('Fetching restaurant data for ID:', id);
    
//     fetch(`http://localhost:5000/restaurants/${id}`)
//       .then(response => {
//         if (!response.ok) {
//             console.log(response)
//           throw new Error('Restaurant not found');
//         }
//         return response.json();
//       })
//       .then(data => {
//         console.log('Received restaurant data:', data);
//         setRestaurant(data.restaurant);
//         setLoading(false);
//         setImages(data.images)
//       })
//       .catch(error => {
//         console.error('Error fetching restaurant data:', error);
//         setError(error.message);
//         setLoading(false);
//       });
//   }, [id]);

//   useEffect(() => {
//     // Ensure the images array is not empty
//     if (images.length === 0) return;

//     // Calculate the tallest image height
//     const imageHeights = imageRefs.current.map(ref => ref?.offsetHeight || 0);
//     const tallestImageHeight = Math.max(...imageHeights);
//     setMaxImageHeight(tallestImageHeight);
//   }, [images]); // Dependency on 'images'

  
//   const [activeImage, setActiveImage] = useState(0);

//   const nextImage = () => {
//     setActiveImage((prevIndex) => (prevIndex + 1) % images.length);
//   };

//   const prevImage = () => {
//     setActiveImage((prevIndex) => (prevIndex - 1 + images.length) % images.length);
//   };
  

//   if (loading) return <div>Loading...</div>;
//   if (error) return <div>Error: {error}</div>;
//   if (!restaurant) return <div>No restaurant data</div>;

//   // JSX code to display restaurant details
//   return (
//     <div className="restaurant-container">
//       <div className="content-layout">
//         <div className="carousel-container">
//           <div className="image-wrapper">
//             {images.map((img, idx) => (
//               <img
//                 key={idx}
//                 className={`carousel-image ${idx === activeImage ? 'active' : ''}`}
//                 src={require(`../imgs/${img.link.split('/').pop()}`)}
//                 alt={`Restaurant ${idx}`}
//               />
//             ))}
//           </div>
//           <button className="carousel-control prev" onClick={prevImage}>&lt;</button>
//           <button className="carousel-control next" onClick={nextImage}>&gt;</button>
//         </div>

//         <div className="info-container">
//           <div className='info-top'>
//             <h1 id="name">{restaurant.name}</h1>
//             <h2 className="info">Average price per person: {restaurant.price}</h2>
//             <h3 className="info">About us: {restaurant.description}</h3>
//             <h4 className="info">Category: {restaurant.category}</h4>
//             <h4 className="info">Location: {restaurant.location}</h4>
//             <h4 className="info">Phone number: 
//               <a className="text-decoration-none text-info" href={`tel:+${restaurant.phone}`}>
//                 {restaurant.phone}
//               </a>
//             </h4>
//             <h4 className="info">Email:
//               <a className="text-decoration-none text-info" href={`mailto:${restaurant.email}`}>
//                 {restaurant.email}
//               </a>
//             </h4>
//           </div>
//           <div className='booking-button'>
//               <button className='btn btn-outline-success '>Book a table</button>
//           </div>
//         </div>
        
//       </div>
//     </div>
//   );
// };

