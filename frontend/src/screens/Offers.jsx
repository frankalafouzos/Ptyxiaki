import React, { useEffect, useState } from "react";
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

        // Group offers by restaurantId._id
        const grouped = {};
        data.forEach(offer => {
          const rid = offer.restaurantId?._id || offer.restaurantId;
          const rname = offer.restaurantId?.name || "Unknown Restaurant";
          if (!grouped[rid]) grouped[rid] = { restaurantName: rname, offers: [] };
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
    // Save offer to sessionStorage with quick expiry (e.g., 10 minutes)
    const expiry = Date.now() + 10 * 60 * 1000;
    sessionStorage.setItem(
        "claimedOffer",
        JSON.stringify({ offer, expiry })
    );
    // console.log("Claimed offer:", offer);
    // Redirect to booking page
    window.location.href = "/booking/"+offer.restaurantId._id;
};

  if (loading) return <div className="text-center mt-5">Loading offers...</div>;
  if (error) return <div className="text-danger mt-5 text-center">{error}</div>;

  return (
    <div className="offers-container">
      <h1 className="mb-4">Current Offers</h1>
      {offers.length === 0 ? (
        <p>No offers available right now. Please check back soon!</p>
      ) : (
        offers.map(group => (
          <div key={group.restaurantName} className="mb-5">
            <div className="restaurant-group-title">{group.restaurantName}</div>
            <div className="row">
              {group.offers.map(offer => (
                <div className="col-md-6 col-lg-4 mb-4" key={offer._id}>
                  <div className="offer-card">
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
                    <div className="offer-actions">
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
  );
};

export default Offers;