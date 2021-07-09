// Packages
import React, { useCallback, useState } from "react";
import { useHistory } from "react-router-dom";
import { Container, Row, Col, Table, Button } from "reactstrap";
import axios from "axios";
// Styling
import "./AddApartment.css";

const AddApartment = React.memo((props) => {
  const [loading, setLoading] = useState(true);
  const [fields, setFields] = useState({});
  const [errors, setErrors] = useState({});
  const history = useHistory();

  return (
    <Container className="mt-5">
      <Row>
        <Col className="d-flex justify-content-between align-items-left">
          <span className="">
            <h3>Adaugare Apartament</h3>
          </span>
        </Col>
      </Row>
    </Container>
  );
});

export default AddApartment;
