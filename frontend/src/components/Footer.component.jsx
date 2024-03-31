import { Container, Row, Col } from "react-bootstrap";
import "../css/Footer.css";

const Footer = () => {
  const year = new Date().getFullYear();
  return (
    <footer style={{backgroundColor: "#262626"}}>
      <Container >
        <Row >
          <Col className="text-center py-3">Book a Bite &copy; {year}</Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;
