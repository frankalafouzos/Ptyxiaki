import React, { useEffect, useState } from "react";
import Dashboard from "../../components/Owner/Dashboard.component";
import useAuthUser from "react-auth-kit/hooks/useAuthUser";
import { Col, Row } from "react-bootstrap";
import "../../css/Dashboard.css";
import "../../css/Spinner.css"
import LoadingSpinner from "../../components/LoadingSpinner.component";
import { Link } from "react-router-dom";

const OwnerDashboard = () => {
  const authUser = useAuthUser();
  const email = authUser.email;
  const [owner, setOwner] = useState(null);
  const [validRestaurants, setValidRestaurants] = useState([]);
  const [error, setError] = useState(null);
  const [showSpinner, setShowSpinner] = useState(true);

  useEffect(() => {
    const fetchOwnerDashboard = async () => {
      try {
        console.log("Fetching dashboard data for email:", email);
        setShowSpinner(true);
        
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/restaurants/filterActiveRestaurants`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ email: email }),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch dashboard data");
        }

        const dashboardData = await response.json();
        console.log("Received dashboard data:", dashboardData);
        
        setOwner(dashboardData.owner);
        setValidRestaurants(dashboardData.owner.activeRestaurantsIds);
        
      } catch (error) {
        console.error("Error fetching dashboard:", error);
        setError(error.message);
      } finally {
        setShowSpinner(false);
      }
    };

    fetchOwnerDashboard();
  }, [email]);

  if (showSpinner) return <LoadingSpinner message="Loading your dashboard..." />;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Restaurants Dashboard</h1>
      {validRestaurants.length > 0 ? (
        <Row className="row">
          {validRestaurants.map((id) => (
            <Col key={id} sm={12} md={6} lg={6} xl={6} xxl={6}>
              <Link
                key={id}
                to={`/owner/restaurant-dashboard/${id}`}
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <Dashboard key={id} restaurantId={id} />
              </Link>
            </Col>
          ))}
        </Row>
      ) : (
        <div>No restaurants found for this owner.</div>
      )}
    </div>
  );
};

export default OwnerDashboard;