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
import {  FaUser, FaSearch } from "react-icons/fa";
import { FaUserPen } from "react-icons/fa6";
import logo from "../imgs/Logo.png";

const Header = () => {
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

              <Form inline>
                <Row id="search">
                  <Col xs="auto">
                    <Form.Control
                      type="text"
                      placeholder="Search"
                      className=" mr-sm-2"
                    />
                  </Col>
                  <Col xs="auto">
                    <Button id="searchButton" className="w-2 ml-0" type="submit">
                      Submit
                    </Button>
                  </Col>
                </Row>
              </Form>


              <Nav.Link href="/restaurants"> Restaurants</Nav.Link>
              <Nav.Link href="/offers"> Offers</Nav.Link>
              
              <Nav.Link href="/signup">
                <FaUserPen /> Sign Up
              </Nav.Link>
              <Nav.Link href="/login">
                <FaUser /> Sign In
              </Nav.Link>
              
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </header>
  );
};

export default Header;
