// Packages
import React from "react";
import { Link } from "react-router-dom";
import { Container, Row, Col, Button } from "reactstrap";
// Styling
import "./Documents.css";

const Documents = React.memo((props) => (
  <Container className="mt-5 text-center">
    <Row className="mt-5">
      <Col className="mt-5">
        <h2 className="mx-auto mt-5">
          Bine ati venit in <strong>AdminBloc</strong>
        </h2>
        <h4 className="mt-3">
          Va rugam sa va logati pentru a folosi aplicatia.
        </h4>
        <Button className="mt-3" tag={Link} color="primary" to={`/login`}>
          Login
        </Button>
      </Col>
    </Row>
  </Container>
));

export default Documents;
