import React, { useCallback, useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { Container, Row, Col, Table, Button } from "reactstrap";
import { toast } from "react-toastify";
import axios from "axios";
// Utils
import { getRequestHeaders } from "../utils";
// Styling
import "./Buildings.css";

const Buildings = React.memo((props) => {
  const [loading, setLoading] = useState(true);
  const [buildings, setBuildings] = useState([]);
  const history = useHistory();

  // Load initial data
  useEffect(() => {
    axios
      .get(`/buildings/list`, getRequestHeaders())
      .then((res) => {
        const { data = {} } = res;
        setBuildings(data);
        setLoading(false);
      })
      .catch((err) => {
        const { response = {} } = err;
        const { data = {} } = response;
        const { msg } = data;
        toast.error(`Error: ${msg}!`);
      });
  }, []);

  const onAddClick = useCallback(() => {
    history.push(`${history.location.pathname}/add`);
  }, [history]);

  const onEditClick = useCallback(
    (id) => {
      console.log("onEditClick", id);
      history.push(`${history.location.pathname}/edit/${id}`);
    },
    [history]
  );

  const onRemoveClick = useCallback(
    (id) => {
      axios
        .patch(`buildings/remove/${id}`, {}, getRequestHeaders())
        .then((res) => {
          const { data = {} } = res;
          const { name = "" } = data;
          toast.success(`Blocul [${name}] a fost sters cu succes!`);
          const newBuildings = [...buildings].filter(({ _id }) => _id !== id);
          setBuildings(newBuildings);
        })
        .catch((err) => {
          const { response = {} } = err;
          const { data = {} } = response;
          const { msg } = data;
          toast.error(`Error: ${msg}!`);
        })
        .finally(() => {
          setLoading(false);
        });
      console.log("onRemoveClick", id);
    },
    [buildings]
  );

  const getRows = useCallback(
    () =>
      buildings.map(
        ({ _id, userEmail, name, address, apartmentsCount }, id) => (
          <tr key={`buildings-row-${id}`}>
            <td>{name}</td>
            <td>{address}</td>
            <td>{userEmail}</td>
            <td>{apartmentsCount}</td>
            <td className="text-center">
              <Button
                disabled={loading}
                color="warning"
                size="sm"
                onClick={onEditClick.bind(null, _id)}
              >
                M
              </Button>
            </td>
            <td className="text-center">
              <Button
                disabled={loading}
                color="danger"
                size="sm"
                onClick={onRemoveClick.bind(null, _id)}
              >
                S
              </Button>
            </td>
          </tr>
        )
      ),
    [buildings, loading]
  );

  return (
    <Container sm="12" md={{ size: 10, offset: 1 }}>
      <Row className="mt-5">
        <Col className="d-flex justify-content-between align-items-center">
          <span className="">
            <h3>Blocuri</h3>
          </span>
          <span>
            <Button
              disabled={loading}
              className=""
              color="primary"
              size="sm"
              onClick={onAddClick}
            >
              Adaugare Bloc
            </Button>
          </span>
        </Col>
      </Row>
      <Row className="mt-5">
        <Col>
          <Table hover>
            <thead>
              <tr>
                <th>Nume</th>
                <th>Adresa</th>
                <th>Administrator</th>
                <th style={{ minWidth: "100px" }}>Nr. Apart.</th>
                <th className="text-center">Modificare</th>
                <th className="text-center">Stergere</th>
              </tr>
            </thead>
            <tbody>{getRows()}</tbody>
          </Table>
        </Col>
      </Row>
    </Container>
  );
});

export default Buildings;
