// Packages
import React, { useCallback, useEffect, useState } from "react";
import { useHistory, Link } from "react-router-dom";
import { Container, Row, Col, Table, Button } from "reactstrap";
import { toast } from "react-toastify";
import axios from "axios";
// Utils
import { getRequestHeaders } from "../utils";
// Styling
import "./Apartments.css";

const Apartments = React.memo((props) => {
  const [loading, setLoading] = useState(true);
  const [apartments, setApartments] = useState([]);
  const history = useHistory();

  // Load initial data
  useEffect(() => {
    axios
      .get(`/apartments/list`, getRequestHeaders())
      .then((res) => {
        const { data = {} } = res;
        setApartments(data);
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
      history.push(`${history.location.pathname}/edit/${id}`);
    },
    [history]
  );

  const onRemoveClick = useCallback(
    (id) => {
      axios
        .patch(`apartments/remove/${id}`, {}, getRequestHeaders())
        .then((res) => {
          const { data = {} } = res;
          const { name = "" } = data;
          toast.success(`Apartamentul [${name}] a fost sters cu succes!`);
          const newApartments = [...apartments].filter(({ _id }) => _id !== id);
          setApartments(newApartments);
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
    },
    [apartments]
  );

  const getRows = useCallback(
    () =>
      apartments.map(
        (
          {
            _id,
            name,
            number,
            buildingName,
            userName,
            peopleCount,
            totalArea,
            radiantArea,
            share,
            thermalProvider,
            remainingCost,
            currentCost,
          },
          id
        ) => (
          <tr key={`apartments-row-${id}`}>
            <td>{name}</td>
            <td>{number}</td>
            <td>{buildingName}</td>
            <td>
              {userName ? (
                userName
              ) : (
                <Button
                  tag={Link}
                  disabled={loading}
                  color="info"
                  size="sm"
                  to={`/register/${_id}`}
                >
                  Inrolare
                </Button>
              )}
            </td>
            <td>{peopleCount}</td>
            <td>{totalArea}m2</td>
            <td>{radiantArea}m2</td>
            <td>{share}</td>
            <td>{thermalProvider ? "Da" : "Nu"}</td>
            <td>{remainingCost}RON</td>
            <td>{currentCost}RON</td>
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
    [apartments, loading]
  );

  return (
    <Container style={{ maxWidth: "1400px" }}>
      <Row className="mt-5">
        <Col className="d-flex justify-content-between align-items-center">
          <span className="">
            <h3>Apartamente</h3>
          </span>
          <span>
            <Button
              disabled={loading}
              className=""
              color="primary"
              size="sm"
              onClick={onAddClick}
            >
              Adaugare Apartament
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
                <th>Numar</th>
                <th>Bloc</th>
                <th>Proprietar</th>
                <th style={{ minWidth: "95px" }}>Nr. pers.</th>
                <th style={{ minWidth: "75px" }}>S. Tot.</th>
                <th style={{ minWidth: "80px" }}>S. Rad.</th>
                <th>Cota</th>
                <th style={{ minWidth: "105px" }}>Apa calda</th>
                <th>Restante</th>
                <th>Total</th>
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

export default Apartments;
