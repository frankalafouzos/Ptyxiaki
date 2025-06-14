import React, { useEffect, useState } from 'react';
import '../css/RestaurantRatings.css';

const RestaurantRatings = ({ restaurantId }) => {
    const [ratingsData, setRatingsData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!restaurantId) return;
        setLoading(true);
        setError(null);

        fetch(`${process.env.REACT_APP_API_URL}/restaurantRatings/${restaurantId}/ratings`)
            .then((res) => {
                if (!res.ok) throw new Error('Failed to fetch ratings');
                return res.json();
            })
            .then((data) => {
                setRatingsData(data);
                setLoading(false);
            })
            .catch((err) => {
                setError(err.message);
                setLoading(false);
            });
    }, [restaurantId]);

    if (!restaurantId) {
        return <div>Please select a restaurant.</div>;
    }

    if (loading) {
        return <div>Loading ratings...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    if (!ratingsData || !ratingsData.ratings || ratingsData.ratings.length === 0) {
        return (
            <div className="restaurant-ratings-empty-centered">
                <div className="empty-star-bounce" aria-label="No ratings">
                    ⭐
                </div>
                <div style={{ fontWeight: 700, fontSize: 22, marginBottom: 8 }}>
                    No ratings yet!
                </div>
                <div style={{ color: "#888", marginBottom: 12, fontSize: 16 }}>
                    Be the first to share your experience after you visit this establishment and help others!
                </div>
            </div>
        );
    }

    return (
        <div className="restaurant-ratings-container">
            <h2 className="restaurant-ratings-title">Customer Ratings</h2>
            <div className="restaurant-ratings-summary">
                <span className="restaurant-ratings-stars">
                    {ratingsData.average ? '⭐'.repeat(Math.round(ratingsData.average)) : 'N/A'}
                </span>
                <span style={{ fontWeight: 600, fontSize: 18 }}>
                    {ratingsData.average ? ratingsData.average.toFixed(2) : "N/A"} / 5
                </span>
                <span style={{ color: "#888", marginLeft: 10 }}>
                    ({ratingsData.count || ratingsData.ratings.length} reviews)
                </span>
            </div>
            <ul className="restaurant-ratings-list">
                {ratingsData.ratings.map((rating, idx) => (
                    <li className="restaurant-rating-item" key={rating._id || idx}>
                        <div>
                            <span className="restaurant-rating-user">
                                {rating.userId?.firstname || "Anonymous"}
                            </span>
                            <span className="restaurant-ratings-stars" style={{ marginLeft: 8 }}>
                                {Array(rating.rating).fill("★").join("")}
                                {Array(5 - rating.rating).fill("☆").join("")}
                            </span>
                            <span className="restaurant-rating-score">
                                ({rating.rating} / 5)
                            </span>
                        </div>
                        {rating.feedback && (
                            <span className="restaurant-rating-feedback">
                                "{rating.feedback}"
                            </span>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default RestaurantRatings;