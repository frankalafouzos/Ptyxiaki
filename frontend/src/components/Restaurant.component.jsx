import { Card, Carousel } from "react-bootstrap";
import { Link } from "react-router-dom";
// import Rating from './Rating';
import Logo from"../imgs/Logo.png";

const Restaurant = ({ restaurant, index, images }) => {
  const getImagesForRestaurant = (restaurantId) => {
    return images.filter((image) => image.ImageID === restaurantId);
  };

  const restaurantImages = getImagesForRestaurant(restaurant.imageID);

  return (
    <Card className="my-3 p-3 rounded" style={{ width: "20rem", borderRadius: "10%" }}>
      <Link to={`/restaurant/${restaurant._id}`}>
        <Carousel variant="top" style={{ height: '250px' }}>
          {restaurantImages.length > 0 ? (
            restaurantImages.map((img, idx) => (
              <Carousel.Item key={idx} style={{ height: '250px' }}>
                <img
                  className="d-block w-100"
                  src={require(`../imgs/${img.link.split('/').pop()}`)}
                  alt={`Slide ${idx}`}
                  style={{ objectFit: 'cover', height: '250px',width:'100%' }}
                />
              </Carousel.Item>
            ))
          ) : (
            <Carousel.Item style={{ height: '250px' }}>
              <img
                className="d-block w-100"
                src={Logo}
                alt="Placeholder image"
                style={{ objectFit: 'cover', height: '250px' }}
              />
            </Carousel.Item>
          )}
        </Carousel>
      </Link>

      <Card.Body>
        <Link to={`/restaurant/${restaurant._id}`}>
          <Card.Title as="div" className="restaurant-title">
            <strong>{restaurant.name}</strong>
          </Card.Title>
        </Link>

        <Card.Text as="h3">Price per person: ${restaurant.price}</Card.Text>
        <Card.Text>Category: {restaurant.category}</Card.Text>
        <Card.Text>Location: {restaurant.location}</Card.Text>

        {/* Additional buttons or links can be added here */}
        <Link to={`/restaurant/${restaurant._id}`} className="btn btn-primary">
          Go to Restaurant's Page
        </Link>
        <button type="button" className="btn btn-success">
          Book a Table
        </button>
      </Card.Body>
    </Card>
  );
};



// old code

// const Restaurants = ({ restaurant, images, index }) => {
//   const getImagesForRestaurant = (restaurantId) => {
//     return images.filter((image) => image.ImageID === restaurantId);
//   };

//   const restaurantImages = getImagesForRestaurant(restaurant.imageID);

//   return (
//     <div
//       key={index}
//       className="card m-5 d-flex justify-content-between"
//       style={{ width: "40rem", borderRadius: "10%" }}
//     >
//       {/* Carousel for Restaurant Images */}
//       <div
//         id={`Restaurant${index}`}
//         className="carousel slide"
//         data-ride="carousel"
//       >
//         <ol className="carousel-indicators">
//           {restaurantImages.map((idx) => (
//             <li
//               key={idx}
//               data-target={`#Restaurant${index}`}
//               data-slide-to={idx}
//               className={idx === 0 ? "active" : ""}
//             ></li>
//           ))}
//         </ol>
//         <div className="carousel-inner">
//           {restaurantImages.map((img, idx) => (
//             <div
//               key={idx}
//               className={`carousel-item ${idx === 0 ? "active" : ""}`}
//             >
//               <img
//                 style={{
//                   width: "auto",
//                   height: "30rem",
//                   borderRadius: "10% 10% 0% 0%",
//                 }}
//                 className="card-img-top d-block w-100 images"
//                 src={require(`../imgs/${img.link.split("/").pop()}`)} // Adjust path as necessary
//                 alt={`Slide ${idx}`}
//               />
//             </div>
//           ))}
//         </div>
//         {/* Carousel Controls */}
//         <a
//           className="carousel-control-prev"
//           href={`#Restaurant${index}`}
//           role="button"
//           data-slide="prev"
//         >
//           <span
//             className="carousel-control-prev-icon"
//             aria-hidden="true"
//           ></span>
//           <span className="sr-only">Previous</span>
//         </a>
//         <a
//           className="carousel-control-next"
//           href={`#Restaurant${index}`}
//           role="button"
//           data-slide="next"
//         >
//           <span
//             className="carousel-control-next-icon"
//             aria-hidden="true"
//           ></span>
//           <span className="sr-only">Next</span>
//         </a>
//       </div>

//       {/* Restaurant Details */}
//       <div className="card-body">
//         <h4 className="card-title" style={{ color: "rgb(12, 103, 183)" }}>
//           {restaurant.name}
//         </h4>
//         <h5 className="card-subtitle mb-2 text-muted">ID: {restaurant._id}</h5>
//         <h5 className="card-subtitle mb-2 text-muted">
//           Price per person: {restaurant.price}
//         </h5>
//         <p className="card-text" style={{ fontSize: "1.25rem" }}>
//           Category: {restaurant.category}
//         </p>
//         <p className="card-text" style={{ fontSize: "1.25rem" }}>
//           Location: {restaurant.location}
//         </p>
//         <div className="d-flex justify-content-between">
//           <form action={`/restaurant/${restaurant._id}`} method="get">
//             <button id="GoToRest" className="btn">
//               Go to the Restaurants page
//             </button>
//           </form>
//           <form
//             className="d-flex pb-2 pr-3 justify-content-end"
//             style={{ bottom: 0 }}
//           >
//             <button type="submit" className="btn btn-success">
//               Book a table now!
//             </button>
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// };

export default Restaurant;
