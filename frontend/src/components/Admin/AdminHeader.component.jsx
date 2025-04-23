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

const OwnerHeader = () => {
  const isAuthenticated = useIsAuthenticated();
  const signout = useSignOut();

  return (
    <header>
      <Navbar variant="white" expand="xl" collapseOnSelect>
        <Container content="fluid">
          <Navbar.Brand href="/admin">
            <img id="logo" src={logo} alt="" />
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto">

              <Nav.Link href="/admin/pending-edits">
                Pending Edits
              </Nav.Link>
              {/* <Nav.Link href="/admin/pending-restaurants">Requests</Nav.Link> */}
              <Nav.Link href="/admin/restaurants">Restaurants</Nav.Link>
              <Nav.Link href="/admin/users">Users</Nav.Link>
              <Nav.Link href="/admin/add-administrator">Add Administrator</Nav.Link>
              <Nav.Link href="/admin/profile">Profile</Nav.Link>
              {isAuthenticated() ? (
                // Elements to render when owner is authenticated
                <>
                  <Button onClick={() => {
                    signout();

                    localStorage.setItem('role', '');
                    window.location.href = "/"
                  }}>
                    Sign out
                  </Button>
                </>
              ) : (
                // Elements to render when owner is not authenticated
                <>
                  <Nav.Link href="/signup">
                    <FaUserPen /> Sign Up
                  </Nav.Link>
                  <Nav.Link href="/login">
                    <FaUser /> Sign In
                  </Nav.Link>
                </>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </header>
  );
};

export default OwnerHeader;
