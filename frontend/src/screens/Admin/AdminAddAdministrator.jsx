import React, { useState } from 'react';
import { Form, Button, Card, Alert } from 'react-bootstrap';
import { useEffect } from 'react';
import { FaUserPlus } from 'react-icons/fa';

const AdminAdministrator = () => {
    const [firstname, setFirstname] = useState('');
    const [lastname, setLastname] = useState('');
    const [email, setEmail] = useState('');
    const [location, setLocation] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [locations, setLocations] = useState([]);

    useEffect(() => {
        const fetchLocations = async () => {
            try {
                const response = await fetch('http://localhost:5000/locations');
                const data = await response.json();
                setLocations(data);
                console.log("Locations:", data);
            } catch (err) {
                console.error("Error fetching locations:", err);
            }
        }
        fetchLocations();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate password confirmation
        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        try {
            // Create an object with the new admin details
            const newAdmin = { firstname, lastname, email, location, password };

            // Make the API call to add a new admin
            const response = await fetch('http://localhost:5000/admins/addAdmin', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newAdmin),
            });

            // Check the response and update the UI accordingly
            if (response.ok) {
                setSuccess("Administrator added successfully.");
                setError('');
                // Clear the form fields
                setFirstname('');
                setLastname('');
                setEmail('');
                setLocation('');
                setPassword('');
                setConfirmPassword('');
            } else {
                const errorData = await response.json();
                setError(errorData.message || "Failed to add administrator.");
                setSuccess('');
            }
        } catch (err) {
            console.error("Error adding administrator:", err);
            setError("An error occurred while adding the administrator.");
            setSuccess('');
        }
    };

    return (
        <Card className="p-4 mx-auto my-3 shadow-sm" style={{ maxWidth: '500px' }}>
            <Card.Body>
                <h4 className="text-center mb-4">
                    <FaUserPlus /> Add New Administrator
                </h4>

                {error && <Alert variant="danger">{error}</Alert>}
                {success && <Alert variant="success">{success}</Alert>}

                <Form onSubmit={handleSubmit}>
                    <Form.Group controlId="firstname" className="mb-3">
                        <Form.Label>First Name</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Enter first name"
                            value={firstname}
                            onChange={(e) => setFirstname(e.target.value)}
                            required
                        />
                    </Form.Group>

                    <Form.Group controlId="lastname" className="mb-3">
                        <Form.Label>Last Name</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Enter last name"
                            value={lastname}
                            onChange={(e) => setLastname(e.target.value)}
                            required
                        />
                    </Form.Group>

                    <Form.Group controlId="email" className="mb-3">
                        <Form.Label>Email</Form.Label>
                        <Form.Control
                            type="email"
                            placeholder="Enter email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </Form.Group>

                    <Form.Group controlId="location">
                        <Form.Label>Location</Form.Label>
                        <Form.Control
                            as="select"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            required
                        >
                            <option value="">Select Location</option>
                            {locations.map((loc, index) => (
                                <option key={index} value={loc}>
                                    {loc}
                                </option>
                            ))}
                        </Form.Control>
                    </Form.Group>

                    <Form.Group controlId="password" className="mb-3">
                        <Form.Label>Password</Form.Label>
                        <Form.Control
                            type="password"
                            placeholder="Enter password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </Form.Group>

                    <Form.Group controlId="confirmPassword" className="mb-3">
                        <Form.Label>Confirm Password</Form.Label>
                        <Form.Control
                            type="password"
                            placeholder="Confirm password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </Form.Group>

                    <Button variant="primary" type="submit" className="w-100 mt-2">
                        Add Administrator
                    </Button>
                </Form>
            </Card.Body>
        </Card>
    );
};

export default AdminAdministrator;
