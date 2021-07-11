// Packages
import React, {
  useCallback,
  useMemo,
  useEffect,
  useRef,
  useState,
} from "react";
import { useHistory, Link } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Table,
  Button,
  Label,
  Input,
  Form,
  FormGroup,
  Spinner,
  FormFeedback,
} from "reactstrap";
import { toast } from "react-toastify";
import axios from "axios";
// Utils
import {
  getRequestHeaders,
  userHasAccess,
  userRoles,
  billLabels,
} from "../utils";
// Styling
import "./Bills.css";

const Bills = React.memo((props) => {
  const buildingAccessFlag = useMemo(
    () => userHasAccess([userRoles.SUPERADMIN, userRoles.ADMIN]),
    []
  );
  const viewOnlyFlag = useMemo(() => userHasAccess([userRoles.NORMAL]), []);
  const promisesFlag = useRef(2);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    apartmentId: "",
    buildingId: "",
  });
  const [errors, setErrors] = useState({});
  const [buildings, setBuildings] = useState([]);
  const [apartments, setApartments] = useState([]);
  const [bills, setBills] = useState({ apartments: [], buildings: [] });
  const history = useHistory();

  useEffect(() => {
    if (buildingAccessFlag) {
      axios
        .get(`/buildings/list`, getRequestHeaders())
        .then((res) => {
          const { data = [] } = res;
          setBuildings(data.map(({ _id, name }) => ({ _id, name })));

          if (!--promisesFlag.current) {
            setLoading(false);
          }
        })
        .catch((err) => {
          const { response = {} } = err;
          const { data = {} } = response;
          const { msg } = data;
          toast.error(`Error: ${msg}!`);
        });
    } else {
      if (!--promisesFlag.current) {
        setLoading(false);
      }
    }

    axios
      .get(`/apartments/list`, getRequestHeaders())
      .then((res) => {
        const { data = [] } = res;
        setApartments(
          data.map(({ _id, name, buildingId, buildingName }) => ({
            _id,
            buildingId,
            name: `[${buildingName}] ${name}`,
          }))
        );

        if (!--promisesFlag.current) {
          setLoading(false);
        }
      })
      .catch((err) => {
        const { response = {} } = err;
        const { data = {} } = response;
        const { msg } = data;
        toast.error(`Error: ${msg}!`);
      });
  }, [buildingAccessFlag]);

  useEffect(() => {
    setLoading(true);

    if (buildingAccessFlag) {
      const { buildingId } = filters;
      axios
        .get(`/buildings/list-bills`, getRequestHeaders({ buildingId }))
        .then((res) => {
          const { data = [] } = res;
          setBills((prevState) => ({ ...prevState, buildings: data }));

          if (promisesFlag.current <= 0) {
            setLoading(false);
          }
        })
        .catch((err) => {
          const { response = {} } = err;
          const { data = {} } = response;
          const { msg } = data;
          toast.error(`Error: ${msg}!`);
        });
    }

    const { apartmentId } = filters;
    axios
      .get(`/apartments/list-bills`, getRequestHeaders({ apartmentId }))
      .then((res) => {
        const { data = [] } = res;
        setBills((prevState) => ({ ...prevState, apartments: data }));

        if (promisesFlag.current <= 0) {
          setLoading(false);
        }
      })
      .catch((err) => {
        const { response = {} } = err;
        const { data = {} } = response;
        const { msg } = data;
        toast.error(`Error: ${msg}!`);
      });
  }, [filters, buildingAccessFlag]);

  const onAddClick = useCallback(() => {
    history.push(`${history.location.pathname}/add`);
  }, [history]);

  const onEditClick = useCallback(
    (buildingId, id) => {
      history.push(`${history.location.pathname}/edit/${buildingId}/${id}`);
    },
    [history]
  );

  const onGenerateBillsClick = useCallback(() => {
    const { buildingId } = filters;

    if (!buildingId) {
      setErrors({ buildingId: "BuildingId field is required" });
      return;
    }

    setLoading(true);

    axios
      .patch(`buildings/generate-bills/${buildingId}`, {}, getRequestHeaders())
      .then((res) => {
        const { data = {} } = res;
        // TODO: use this name
        const { name = "" } = data;
        toast.success(
          `Facturile pentru blocul [${
            buildings.find(({ _id }) => _id === buildingId).name
          }] au fost generate cu succes`
        );
        const newBills = [...bills].filter(({ _id }) => _id !== id);
        setBills(newBills);
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
  }, [buildings, filters]);

  const onRemoveClick = useCallback(
    (buildingId, id, billName) => {
      setLoading(true);

      axios
        .patch(
          `buildings/remove-bill/${buildingId}`,
          { id },
          getRequestHeaders()
        )
        .then((res) => {
          const { data = {} } = res;
          // TODO: use this name
          const { name = "" } = data;
          toast.success(`Factura [${billName}] a fost stearsa cu succes`);
          const newBills = [...bills].filter(({ _id }) => _id !== id);
          setBills(newBills);
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
    [bills]
  );

  const getBuildingsRows = useCallback(
    () =>
      bills.buildings.map(
        ({ _id, buildingId, buildingName, type, name, value }, id) => (
          <tr key={`bills-buildings-row-${id}`}>
            <td>{buildingName}</td>
            <td>{billLabels[type]}</td>
            <td>{name}</td>
            <td>{value} RON</td>
            <>
              {/* <td className="text-center">
                  <Button
                    disabled={loading}
                    color="warning"
                    size="sm"
                    onClick={onEditClick.bind(null, buildingId, _id)}
                  >
                    M
                  </Button>
                </td> */}
              <td className="text-center">
                <Button
                  disabled={loading}
                  color="danger"
                  size="sm"
                  onClick={onRemoveClick.bind(null, buildingId, _id, name)}
                >
                  S
                </Button>
              </td>
            </>
          </tr>
        )
      ),
    [bills, loading]
  );

  const getApartmentsRows = useCallback(
    () =>
      bills.apartments
        .filter(
          ({ buildingId }) =>
            !filters.buildingId || filters.buildingId === buildingId
        )
        .map(
          (
            { _id, buildingId, buildingName, apartmentName, type, name, value },
            id
          ) => (
            <tr key={`bills-apartments-row-${id}`}>
              <td>{buildingName}</td>
              <td>{apartmentName}</td>
              <td>{billLabels[type]}</td>
              <td>{name}</td>
              <td>{value} RON</td>
            </tr>
          )
        ),
    [bills, filters, loading]
  );

  const onInputChange = useCallback((event) => {
    const { target = {} } = event;
    const { name, value } = target;
    setFilters((prevFields) => ({ ...prevFields, [name]: value }));
    setErrors({});
  }, []);

  return (
    <Container style={{ maxWidth: "1400px" }}>
      <Row className="mt-5">
        <Col className="d-flex justify-content-between align-items-center">
          <span className="">
            <h3>Facturi ({bills.length})</h3>
          </span>
          <span>
            <Button
              tag={Link}
              to="/past-bills"
              className=""
              color="info"
              size="sm"
            >
              Facturi Anterioare
            </Button>
            {buildingAccessFlag ? (
              <>
                <Button
                  className="ml-3"
                  color="success"
                  size="sm"
                  onClick={onGenerateBillsClick}
                >
                  Genereaza facturi pentru apartamente
                </Button>
                <Button
                  disabled={loading}
                  className="ml-3"
                  color="primary"
                  size="sm"
                  onClick={onAddClick}
                >
                  Adaugare Factura
                </Button>
              </>
            ) : null}
          </span>
        </Col>
      </Row>
      {viewOnlyFlag ? (
        <Row className="mt-2">
          <Col className="d-flex justify-content-between align-items-center">
            <span className="">
              <h5>
                Total de plata:{" "}
                {bills.apartments.reduce((acc, val) => acc + val, 0)} RON
              </h5>
            </span>
          </Col>
        </Row>
      ) : null}
      {buildingAccessFlag && buildings.length ? (
        <>
          <Row className="mt-5">
            <Col>
              <Form>
                <FormGroup row>
                  <Label sm={4} md={2}>
                    Filtru Bloc:
                  </Label>
                  <Col sm={4} md={3}>
                    <Input
                      type="select"
                      name="buildingId"
                      id="buildingId"
                      value={filters["buildingId"]}
                      invalid={Boolean(errors["buildingId"])}
                      onChange={onInputChange}
                    >
                      <option value="">Alegeti un bloc</option>
                      {buildings.map(({ _id, name }, id) => (
                        <option key={`filter-buildings-row-${id}`} value={_id}>
                          {name}
                        </option>
                      ))}
                    </Input>
                    <FormFeedback>{errors["buildingId"]}</FormFeedback>
                  </Col>
                </FormGroup>
              </Form>
            </Col>
          </Row>
          <Row className="mt-2">
            <Col>
              <Table hover>
                <thead>
                  <tr>
                    <th>Bloc</th>
                    <th>Tip Factura</th>
                    <th>Nume</th>
                    <th>Valoare</th>
                    <>
                      {/* <th className="text-center">Modificare</th> */}
                      <th className="text-center">Stergere</th>
                    </>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="text-center">
                        <Spinner style={{ width: "3rem", height: "3rem" }} />
                      </td>
                    </tr>
                  ) : (
                    getBuildingsRows()
                  )}
                </tbody>
              </Table>
            </Col>
          </Row>
        </>
      ) : null}
      {apartments.length ? (
        <>
          <Row className="mt-5">
            <Col>
              <Form>
                <FormGroup row>
                  <Label sm={3} md={2}>
                    Filtru Apartamente:
                  </Label>
                  <Col sm={4} md={3}>
                    <Input
                      type="select"
                      name="apartmentId"
                      id="apartmentId"
                      value={filters["apartmentId"]}
                      onChange={onInputChange}
                    >
                      <option value="">Alegeti un apartament</option>
                      {apartments
                        .filter(
                          ({ buildingId }) =>
                            !filters.buildingId ||
                            filters.buildingId === buildingId
                        )
                        .map(({ _id, name }, id) => (
                          <option
                            key={`filter-apartment-row-${id}`}
                            value={_id}
                          >
                            {name}
                          </option>
                        ))}
                    </Input>
                  </Col>
                </FormGroup>
              </Form>
            </Col>
          </Row>
          <Row className="mt-2">
            <Col>
              <Table hover>
                <thead>
                  <tr>
                    <th>Bloc</th>
                    <th>Apartament</th>
                    <th>Tip Factura</th>
                    <th>Nume</th>
                    <th>Valoare</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="text-center">
                        <Spinner style={{ width: "3rem", height: "3rem" }} />
                      </td>
                    </tr>
                  ) : (
                    getApartmentsRows()
                  )}
                </tbody>
              </Table>
            </Col>
          </Row>
        </>
      ) : null}
    </Container>
  );
});

export default Bills;
