import React from 'react';
import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import useAuthUser from "react-auth-kit/hooks/useAuthUser";
import 'bootstrap/dist/css/bootstrap.min.css';

const OfferCard = ({ id, offer, restaurantId, onOfferDeleted }) => {
    const authUser = useAuthUser();
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState(null);
    
    const {
        title,
        description,
        discountType,
        discountValue,
        startDate,
        endDate,
        conditions,
        isActive,
        ownerId,
        _id
    } = offer;

    const formatDate = (date) => new Date(date).toLocaleDateString();

    const getRestaurantName = async (restaurantId) => {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/restaurants/${restaurantId}`);
            if (!response.ok) {
                throw new Error('Failed to fetch restaurant data');
            }
            const data = await response.json();
            return data.name;
        } catch (error) {
            console.error(error);
            return 'Unknown Restaurant';
        }
    };
    const [restaurantName, setRestaurantName] = useState('');
    useEffect(() => {
        const fetchRestaurantName = async () => {
            const name = await getRestaurantName(restaurantId);
            setRestaurantName(name);
        };
        fetchRestaurantName();
    }, [restaurantId]);

    const handleDeleteOffer = async () => {
        if (!window.confirm("Are you sure you want to delete this offer?")) {
            return;
        }
        
        setIsDeleting(true);
        setError(null);
        
        try {
            const response = await fetch(
                `${process.env.REACT_APP_API_URL}/offers/delete/${_id}`,
                {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ ownerId: ownerId })
                }
            );
            
            const data = await response.json();
            
            if (response.ok) {
                if (data.status === 'hidden') {
                    alert("This offer is currently in use by customers and has been hidden instead of deleted.");
                } else {
                    alert("Offer successfully deleted.");
                }
                
                // Call the callback to refresh the parent component
                if (onOfferDeleted) {
                    onOfferDeleted(_id);
                }
            } else {
                setError(data.error || 'Failed to delete offer');
                alert(`Error: ${data.error || 'Failed to delete offer'}`);
            }
        } catch (err) {
            console.error('Error deleting offer:', err);
            setError('Failed to delete offer: ' + err.message);
            alert('Failed to delete offer: ' + err.message);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="card mb-3">
            <div className="card-header">
                <h5 className="card-title">{restaurantName}</h5>
            </div>
            <div className={`card-header ${isActive ? 'bg-success text-white' : 'bg-secondary text-white'}`}>
                {title} {isActive ? '(Active)' : '(Inactive)'}
            </div>
            <div className="card-body">
                <h5 className="card-title">{description}</h5>
                <p className="card-text">
                    <strong>Discount:</strong> {discountType === 'percentage' ? `${discountValue}%` : `$${discountValue}`}
                </p>
                <p className="card-text">
                    <strong>Valid From:</strong> {formatDate(startDate)} <strong>To:</strong> {formatDate(endDate)}
                </p>
                {conditions && (
                    <p className="card-text">
                        <strong>Conditions:</strong> {conditions}
                    </p>
                )}
                <div className="text-end">
                    <button 
                        className="btn btn-danger" 
                        onClick={handleDeleteOffer}
                        disabled={isDeleting}
                    >
                        {isDeleting ? 'Deleting...' : 'Delete Offer'}
                    </button>
                </div>
                {error && <div className="text-danger mt-2">{error}</div>}
            </div>
        </div>
    );
};

OfferCard.propTypes = {
    offer: PropTypes.shape({
        title: PropTypes.string.isRequired,
        description: PropTypes.string.isRequired,
        discountType: PropTypes.oneOf(['percentage', 'fixed']).isRequired,
        discountValue: PropTypes.number.isRequired,
        startDate: PropTypes.string.isRequired,
        endDate: PropTypes.string.isRequired,
        conditions: PropTypes.string,
        isActive: PropTypes.bool.isRequired,
        ownerId: PropTypes.string.isRequired,
        _id: PropTypes.string.isRequired,
    }).isRequired,
    restaurantId: PropTypes.string.isRequired,
    onOfferDeleted: PropTypes.func,
};

export default OfferCard;