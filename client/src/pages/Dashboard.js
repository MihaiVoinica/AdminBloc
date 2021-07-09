// Packages
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Container, Row, Col, Table } from "reactstrap";
import { toast } from "react-toastify";
import axios from "axios";
// Utils
import { getRequestHeaders, userHasAccess, userRoles } from "../utils";
// Styling
import "./Dashboard.css";

const Dashboard = React.memo((props) => {
  const buildingAccessFlag = useMemo(
    () => userHasAccess([userRoles.SUPERADMIN, userRoles.ADMIN]),
    []
  );
  const [buildings, setBuildings] = useState([]);
  const [apartments, setApartments] = useState([]);

  useEffect(() => {
    if (buildingAccessFlag) {
      axios
        .get(`/buildings/list`, getRequestHeaders())
        .then((res) => {
          const { data = [] } = res;
          setBuildings(data);
        })
        .catch((err) => {
          const { response = {} } = err;
          const { data = {} } = response;
          const { msg } = data;
          toast.error(`Error: ${msg}!`);
        });
    }

    axios
      .get(`/apartments/list`, getRequestHeaders())
      .then((res) => {
        const { data = [] } = res;
        setApartments(data);
      })
      .catch((err) => {
        const { response = {} } = err;
        const { data = {} } = response;
        const { msg } = data;
        toast.error(`Error: ${msg}!`);
      });
  }, [buildingAccessFlag]);

  const getBuildingsRows = useCallback(
    () =>
      buildings.map(({ userEmail, name, address, apartmentsCount }, id) => (
        <tr key={`buildings-row-${id}`}>
          <td>{name}</td>
          <td>{address}</td>
          <td>{userEmail}</td>
          <td>{apartmentsCount}</td>
        </tr>
      )),
    [buildings]
  );

  const getApartmentsRows = useCallback(
    () =>
      apartments.map(
        (
          {
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
            <td>{userName}</td>
            <td>{peopleCount}</td>
            <td>{totalArea} m&sup2;</td>
            <td>{radiantArea} m&sup2;</td>
            <td>{share}</td>
            <td>{thermalProvider ? "Da" : "Nu"}</td>
            <td>{remainingCost} RON</td>
            <td>{currentCost} RON</td>
          </tr>
        )
      ),
    [apartments]
  );

  return (
    <Container style={{ maxWidth: "1400px" }}>
      <Row className="mt-5">
        <Col className="d-flex justify-content-between align-items-center">
          <span className="">
            <h3>Dashboard</h3>
          </span>
        </Col>
      </Row>
      {buildingAccessFlag ? (
        <>
          <Row className="mt-5">
            <Col className="d-flex justify-content-between align-items-center">
              <span className="">
                <h5>Blocuri</h5>
              </span>
            </Col>
          </Row>
          <Row className="mt-3">
            <Col>
              <Table hover>
                <thead>
                  <tr>
                    <th>Nume</th>
                    <th>Adresa</th>
                    <th>Administrator</th>
                    <th style={{ minWidth: "100px" }}>Nr. Apart.</th>
                  </tr>
                </thead>
                <tbody>{getBuildingsRows()}</tbody>
              </Table>
            </Col>
          </Row>
        </>
      ) : null}
      <Row className="mt-5">
        <Col className="d-flex justify-content-between align-items-center">
          <span className="">
            <h5>Apartamente</h5>
          </span>
        </Col>
      </Row>
      <Row className="mt-3">
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
              </tr>
            </thead>
            <tbody>{getApartmentsRows()}</tbody>
          </Table>
        </Col>
      </Row>
    </Container>
  );
});

export default Dashboard;
