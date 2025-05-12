import React, { useEffect, useState } from 'react';
import useAuthUser from "react-auth-kit/hooks/useAuthUser";
import OfferCard from '../../components/OfferCard.component.jsx';
import { useNavigate } from 'react-router-dom'; // Add this import
import '../../css/Spinner.css';

const OwnersOffers = () => {
    const authUser = useAuthUser();
    const email = authUser.email;
    // const [ownerId, setOwnerId] = useState(null);
    const [offers, setOffers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate(); // Initialize useNavigate


    useEffect(() => {
        const fetchOwnerAndOffers = async () => {
            try {
                console.log("Fetching owner data for email:", email);

                // First, get the owner ID from the email
                const ownerResponse = await fetch(
                    `${process.env.REACT_APP_API_URL}/owners/ownerprofile`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({ email: email }),
                    }
                );

                if (!ownerResponse.ok) {
                    throw new Error("Owner not found");
                }

                const ownerData = await ownerResponse.json();
                console.log("Received owner data:", ownerData);
                // setOwnerId(ownerData._id);

                // Then fetch offers using the owner ID
                const offersResponse = await fetch(`${process.env.REACT_APP_API_URL}/offers/${ownerData._id}`);
                if (!offersResponse.ok) {
                    throw new Error("Failed to fetch offers");
                }

                const offersData = await offersResponse.json();
                setOffers(offersData);
            } catch (err) {
                console.error(err);
                setError('Failed to fetch offers: ' + err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchOwnerAndOffers();
    }, [email]);

    const handleOfferDeleted = (offerId) => {
        // Remove the offer from the state without having to refetch from server
        setOffers(prevOffers => {
            return prevOffers.map(group => ({
                ...group,
                offers: group.offers.filter(offer => offer._id !== offerId)
            })).filter(group => group.offers.length > 0); // Remove empty restaurant groups
        });
    };

        // Add this function to handle navigation
    const handleCreateOffer = () => {
        navigate('/owner/offers/create');
    };

    if (loading) return (
        <div className={`global-spinner`}>
            <div className="spinner"></div>
        </div>
    );

    if (error) return <p>{error}</p>;

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
            <h1>My Offers</h1>
            <button 
                className="btn btn-primary" 
                onClick={handleCreateOffer}
            >
                <i className="bi bi-plus-circle me-2"></i> Create New Offer
            </button>
        </div>
            
            {offers.length > 0 ? (
                offers.map((restaurantGroup) => (
                    <div key={restaurantGroup.restaurantId} className="restaurant-group mb-4">
                        <div className="offers-container">
                            {restaurantGroup.offers.map((offer) => (
                                <OfferCard
                                    key={offer._id}
                                    offer={offer}
                                    restaurantId={restaurantGroup.restaurantId}
                                    id={offer._id}
                                    onOfferDeleted={handleOfferDeleted}
                                />
                            ))}
                        </div>
                    </div>
                ))
            ) : (
                <p>No offers found. Create some offers to attract more customers!</p>
            )}
        </div>
    );
};

export default OwnersOffers;