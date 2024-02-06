import React from "react";
import {
  Navbar,
  Nav,
  Container,
  Form,
  Col,
  Row,
  Button,
} from "react-bootstrap";
import { FaUser, FaSearch } from "react-icons/fa";
import { FaUserPen } from "react-icons/fa6";
import logo from "../imgs/Logo.png";
import useIsAuthenticated from 'react-auth-kit/hooks/useIsAuthenticated';


const Header = () => {
  const isAuthenticated = useIsAuthenticated();


  return (
    <header>
      <Navbar variant="white" expand="xl" collapseOnSelect>
        <Container content="fluid">
          <Navbar.Brand href="/">
            <img id="logo" src={logo} alt="" />
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto">
              

              <Nav.Link href="/restaurants"> Restaurants</Nav.Link>
              <Nav.Link href="/offers"> Offers</Nav.Link>

              {isAuthenticated() ? (
                // Elements to render when user is authenticated
                <Nav.Link href="/profile">Profile</Nav.Link>
              ) : (
                // Elements to render when user is not authenticated
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

export default Header;
