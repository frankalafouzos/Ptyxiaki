import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import LoadingSpinner from "../components/LoadingSpinner.component";
import '../css/Offers.css';

const Offers = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [claimed, setClaimed] = useState(null);

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/offers/active`);
        if (!res.ok) throw new Error("Failed to fetch offers");
        const data = await res.json();

        // Group offers by restaurantId._id (or restaurantId if not populated)
        const grouped = {};
        data.forEach(offer => {
          // restaurantId may be an object or string, depending on backend
          const restaurant = offer.restaurantId;
          const rid = restaurant?._id || restaurant || offer.restaurantName;
          if (!grouped[rid]) {
            grouped[rid] = {
              restaurant: {
                ...restaurant,
                name: offer.restaurantName,
                restaurantImage: offer.restaurantImage,
              },
              offers: [],
            };
          }
          grouped[rid].offers.push(offer);
        });
        setOffers(Object.values(grouped));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchOffers();
  }, []);

  const handleClaim = (offer) => {
    const expiry = Date.now() + 10 * 60 * 1000;
    setClaimed(offer._id);
    sessionStorage.setItem(
      "claimedOffer",
      JSON.stringify({ offer, expiry })
    );
    window.location.href = "/booking/" + (offer.restaurantId?._id || offer.restaurantId);
  };

  if (loading) return <LoadingSpinner message="Loading offers..." />;
  if (error) return <div className="text-danger mt-5 text-center">{error}</div>;

  return (
    <div className="offers-bg">
      <div className="offers-container">
        <h1 className="mb-4 text-center">Current Offers</h1>
        {offers.length === 0 ? (
          <p>No offers available right now. Please check back soon!</p>
        ) : (
          offers.map(group => (
            <div key={group.restaurant?._id || group.restaurant.name} className="mb-5">
              <div className="restaurant-info-card mb-4 p-4 d-flex align-items-center shadow-sm rounded">
                {group.restaurant?.restaurantImage && (
                  <img
                    src={group.restaurant.restaurantImage}
                    alt={group.restaurant.name}
                    className="restaurant-logo me-3"
                    style={{ width: 70, height: 70, objectFit: "cover", borderRadius: "50%" }}
                  />
                )}
                <div className="flex-grow-1">
                  <h3 className="mb-1">
                    <Link to={`/restaurant/${group.restaurant._id}`} className="restaurant-link">
                      {group.restaurant?.name || "Unknown Restaurant"}
                    </Link>
                  </h3>
                  <div className="text-muted" style={{ fontSize: "1rem" }}>
                    {group.restaurant?.category && <span>{group.restaurant.category} | </span>}
                    {group.restaurant?.location && <span>{group.restaurant.location}</span>}
                  </div>
                  {group.restaurant?.phone && (
                    <div className="text-muted" style={{ fontSize: "0.95rem" }}>
                      <strong>Phone:</strong> {group.restaurant.phone}
                    </div>
                  )}
                </div>
                <Link
                  to={`/restaurant/${group.restaurant._id}`}
                  className="btn btn-outline-primary ms-3"
                  style={{ whiteSpace: "nowrap" }}
                >
                  View Restaurant
                </Link>
              </div>
              <div className="row g-4">
                {group.offers.map(offer => (
                  <div className="col-md-6 col-lg-4" key={offer._id}>
                    <div className="offer-card shadow-sm rounded h-100 d-flex flex-column">
                      <div>
                        <div className="offer-title">{offer.title}</div>
                        <div className="mb-2">{offer.description}</div>
                        <div>
                          <strong>Discount:</strong>{" "}
                          {offer.discountType === "percentage"
                            ? `${offer.discountValue}%`
                            : `€${offer.discountValue}`}
                        </div>
                        <div>
                          <strong>Valid:</strong>{" "}
                          {new Date(offer.startDate).toLocaleDateString()} -{" "}
                          {new Date(offer.endDate).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="offer-actions mt-auto">
                        <button
                          className="btn-claim"
                          onClick={() => handleClaim(offer)}
                          disabled={claimed === offer._id}
                        >
                          {claimed === offer._id ? "Claimed!" : "Claim Offer"}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Offers;