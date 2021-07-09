// Packages
import React, { useCallback } from "react";
import { useHistory } from "react-router-dom";
import { Container, Row, Col, Table, Button } from "reactstrap";
import axios from "axios";
// Styling
import "./Apartments.css";

const Apartments = React.memo((props) => {
  const history = useHistory();

  const onAddClick = useCallback(
    (event) => {
      event.preventDefault();
      history.push(`${history.location.pathname}/add`);
    },
    [history]
  );

  const onEditClick = useCallback(
    (id, event) => {
      event.preventDefault();
      history.push(`${history.location.pathname}/edit/${id}`);
    },
    [history]
  );

  return (
    <Container className="mt-5">
      <Row>
        <Col className="d-flex justify-content-between align-items-center">
          <span className="">
            <h3>Apartamente</h3>
          </span>
          <span>
            <Button className="" color="primary" size="sm" onClick={onAddClick}>
              + Adaugare Apartament
            </Button>
            <Button
              className=""
              color="primary"
              size="sm"
              onClick={onEditClick.bind(null, "3")}
            >
              + Modificare Apartament
            </Button>
          </span>
        </Col>
      </Row>
      <Row>
        <Col sm="12" md={{ size: 8, offset: 2 }} lg={{ size: 6, offset: 3 }}>
          <Table hover>
            <thead>
              <tr>
                <th>#</th>
                <th>First Name</th>
                <th>Last Name</th>
                <th>Username</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">1</th>
                <td>Mark</td>
                <td>Otto</td>
                <td>@mdo</td>
              </tr>
              <tr>
                <th scope="row">2</th>
                <td>Jacob</td>
                <td>Thornton</td>
                <td>@fat</td>
              </tr>
              <tr>
                <th scope="row">3</th>
                <td>Larry</td>
                <td>the Bird</td>
                <td>@twitter</td>
              </tr>
            </tbody>
          </Table>
        </Col>
      </Row>
    </Container>
  );
});

export default Apartments;
