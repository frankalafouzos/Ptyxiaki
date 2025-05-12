import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import '../../css/ReactDatePicker.css';
import '../../css/Owner/OwnerCreateOffer.css';
import useAuthUser from "react-auth-kit/hooks/useAuthUser";
import { fetchOwner } from "../../scripts/fetchUser"; // Adjust path if needed

const OwnerCreateOffer = () => {
    const authUser = useAuthUser();
    const email = authUser.email;

    const [owner, setOwner] = useState(null);
    const [loading, setLoading] = useState(true);
    const [restaurants, setRestaurants] = useState([]);
    const [offerDetails, setOfferDetails] = useState({
        title: '',
        description: '',
        discountType: 'percentage',
        discountValue: '',
        startDate: null,
        endDate: null,
        restaurantId: '',
    });
    const [message, setMessage] = useState('');

    useEffect(() => {
        // Fetch owner info
        fetchOwner(email, setLoading, setOwner);
    }, [email]);

    useEffect(() => {
        // When owner is loaded, fetch their approved restaurants
        const fetchRestaurants = async () => {
            if (!owner || !owner._id) return;
            try {
                // Fetch all restaurants for this owner, filter for status 'Approved'
                const res = await fetch(`${process.env.REACT_APP_API_URL}/restaurants?owner=${owner._id}`);
                const data = await res.json();
                if (res.ok) {
                    // Filter only active (approved) restaurants on the frontend
                    const activeRestaurants = Array.isArray(data.restaurants)
                        ? data.restaurants.filter(r => r.status === 'Approved')
                        : [];
                    setRestaurants(activeRestaurants);
                    console.log("Fetched active restaurants:", activeRestaurants);
                } else {
                    setRestaurants([]);
                    console.error("Failed to fetch restaurants:", data);
                }
            } catch {
                setRestaurants([]);
            }
        };
        if (owner && owner._id) {
            console.log("Fetching restaurants for owner:", owner._id);
            fetchRestaurants();
        }
    }, [owner]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setOfferDetails({ ...offerDetails, [name]: value });
    };

    const handleDateChange = (date, name) => {
        setOfferDetails({ ...offerDetails, [name]: date });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!owner || !offerDetails.restaurantId) {
            setMessage('Owner and Restaurant must be selected.');
            return;
        }

        const payload = {
            ownerId: owner._id,
            restaurantId: offerDetails.restaurantId,
            title: offerDetails.title,
            description: offerDetails.description,
            discountType: offerDetails.discountType,
            discountValue: Number(offerDetails.discountValue),
            startDate: offerDetails.startDate,
            endDate: offerDetails.endDate,
        };

        try {
            const res = await fetch(process.env.REACT_APP_API_URL + '/offers/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            if (res.ok) {
                setMessage('Offer created successfully!');
                setOfferDetails({
                    title: '',
                    description: '',
                    discountType: 'percentage',
                    discountValue: '',
                    startDate: null,
                    endDate: null,
                    restaurantId: '',
                });
            } else {
                setMessage(data.error || 'Failed to create offer.');
            }
        } catch (err) {
            setMessage('Server error.');
        }
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center pt-5">
                <div className="loader"></div>
            </div>
        );
    }

    if (!owner) {
        return <div>Owner not found</div>;
    }

    return (
        <form className="create-offer-form" onSubmit={handleSubmit}>
            <h1 className="create-offer-title">Create a New Offer</h1>
            <h3 className="create-offer-subtitle">Please add the information of your offer below:</h3>

            {message && <div className="create-offer-message">{message}</div>}

            <div className="create-offer-field">
                <label htmlFor="restaurantId">Restaurant:</label>
                <select
                    className="create-offer-input"
                    id="restaurantId"
                    name="restaurantId"
                    value={offerDetails.restaurantId}
                    onChange={handleChange}
                    required
                >
                    <option value="">Select a restaurant</option>
                    {restaurants.map(r => (
                        <option key={r._id} value={r._id}>{r.name}</option>
                    ))}
                </select>
            </div>

            <div className="create-offer-field">
                <label htmlFor="title">Title:</label>
                <input
                    className="create-offer-input"
                    type="text"
                    id="title"
                    name="title"
                    value={offerDetails.title}
                    onChange={handleChange}
                    required
                />
            </div>

            <div className="create-offer-field">
                <label htmlFor="description">Description:</label>
                <textarea
                    className="create-offer-textarea"
                    id="description"
                    name="description"
                    value={offerDetails.description}
                    onChange={handleChange}
                    required
                />
            </div>

            <div className="create-offer-field">
                <label htmlFor="discountType">Discount Type:</label>
                <select
                    className="create-offer-input"
                    id="discountType"
                    name="discountType"
                    value={offerDetails.discountType}
                    onChange={handleChange}
                    required
                >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (€)</option>
                </select>
            </div>

            <div className="create-offer-field">
                <label htmlFor="discountValue">
                    {offerDetails.discountType === 'percentage' ? 'Discount (%)' : 'Discount (€)'}:
                </label>
                <input
                    className="create-offer-input"
                    type="number"
                    id="discountValue"
                    name="discountValue"
                    value={offerDetails.discountValue}
                    onChange={handleChange}
                    min="1"
                    required
                />
            </div>

            <div className="create-offer-field">
                <label htmlFor="startDate">Start Date:</label>
                <DatePicker
                    selected={offerDetails.startDate}
                    onChange={(date) => handleDateChange(date, 'startDate')}
                    selectsStart
                    startDate={offerDetails.startDate}
                    endDate={offerDetails.endDate}
                    minDate={new Date()}
                    dateFormat="MMMM d, yyyy"
                    className="create-offer-input"
                    placeholderText="Select start date"
                    showMonthDropdown
                    showYearDropdown
                    dropdownMode="select"
                    required
                />
            </div>

            <div className="create-offer-field">
                <label htmlFor="endDate">End Date:</label>
                <DatePicker
                    selected={offerDetails.endDate}
                    onChange={(date) => handleDateChange(date, 'endDate')}
                    selectsEnd
                    startDate={offerDetails.startDate}
                    endDate={offerDetails.endDate}
                    minDate={offerDetails.startDate || new Date()}
                    dateFormat="MMMM d, yyyy"
                    className="create-offer-input"
                    placeholderText="Select end date"
                    showMonthDropdown
                    showYearDropdown
                    dropdownMode="select"
                    required
                />
            </div>

            <button type="submit" className="create-offer-button">Create Offer</button>
        </form>
    );
};

export default OwnerCreateOffer;