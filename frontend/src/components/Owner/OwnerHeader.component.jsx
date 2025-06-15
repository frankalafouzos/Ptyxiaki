import React from "react";
import {
  Navbar,
  Nav,
  Container,
  Button,
} from "react-bootstrap";
import { FaUser } from "react-icons/fa";
import { FaUserPen } from "react-icons/fa6";
import logo from "../../imgs/Logo.png"; // Adjust the import path as necessary
import useIsAuthenticated from 'react-auth-kit/hooks/useIsAuthenticated';
import useSignOut from 'react-auth-kit/hooks/useSignOut'
import DarkModeToggle from "../DarkModeToggler.component"; // Adjust the import path as necessary

const OwnerHeader = () => {
  const isAuthenticated = useIsAuthenticated();
  const signout = useSignOut();

  return (
    <header>
      <Navbar variant="white" expand="xl" collapseOnSelect>
        <Container content="fluid">
          <Navbar.Brand href="/owner/home">
            <img id="logo" src={logo} alt="" />
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto">
              <Nav.Link href="/owner/offers">Offers</Nav.Link>
              <Nav.Link href="/owner/dashboard">Dashboard</Nav.Link>
              <Nav.Link href="/owner/pending-edits">Pending Edits</Nav.Link>
              <Nav.Link href="/owner/profile">Profile</Nav.Link>
              <Nav.Link href="/owner/restaurants">My Restaurants</Nav.Link> {/* Example owner-specific link */}
              <Nav.Link href="/owner/add-restaurant">Add Establishment</Nav.Link> {/* Add Restaurant Link */}
              {isAuthenticated() ? (
                // Elements to render when owner is authenticated
                <>
                  <Button onClick={() => {
                    signout();

                    localStorage.setItem('role', 'user');
                    window.location.href = "/"
                  }}>
                    Sign out
                  </Button>
                </>
              ) : (
                // Elements to render when owner is not authenticated
                <>
                  <Nav.Link href="/owner-signup">
                    <FaUserPen /> Sign Up
                  </Nav.Link>
                  <Nav.Link href="/owner-signin">
                    <FaUser /> Sign In
                  </Nav.Link>
                </>
              )}
              <DarkModeToggle />
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </header>
  );
};

export default OwnerHeader;
