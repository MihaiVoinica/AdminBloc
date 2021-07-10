// Packages
import React, {
  useCallback,
  useMemo,
  useEffect,
  useState,
  useRef,
} from "react";
import { useHistory } from "react-router-dom";
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
} from "reactstrap";
import { toast } from "react-toastify";
import axios from "axios";
// Utils
import { getRequestHeaders, userHasAccess, userRoles } from "../utils";
// Styling
import "./Meters.css";

const Meters = React.memo((props) => {
  const buildingAccessFlag = useMemo(
    () => userHasAccess([userRoles.SUPERADMIN, userRoles.ADMIN]),
    []
  );
  const canDeleteFlag = useMemo(
    () => userHasAccess([userRoles.SUPERADMIN, userRoles.ADMIN]),
    []
  );
  const promisesFlag = useRef(2);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    apartmentId: "",
    buildingId: "",
  });
  const [buildings, setBuildings] = useState([]);
  const [apartments, setApartments] = useState([]);
  const [meters, setMeters] = useState([]);
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

    axios
      .get(`/apartments/list-meters`, getRequestHeaders(filters))
      .then((res) => {
        const { data = [] } = res;
        setMeters(data);

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
  }, [filters]);

  const onAddClick = useCallback(() => {
    history.push(`${history.location.pathname}/add`);
  }, [history]);

  const onEditClick = useCallback(
    (apartmentId, id) => {
      history.push(`${history.location.pathname}/edit/${apartmentId}/${id}`);
    },
    [history]
  );

  const onRemoveClick = useCallback(
    (apartmentId, id, meterName) => {
      setLoading(true);

      axios
        .patch(
          `apartments/remove-meter/${apartmentId}`,
          { id },
          getRequestHeaders()
        )
        .then((res) => {
          const { data = {} } = res;
          // TODO: use this name
          const { name = "" } = data;
          toast.success(`Contorul [${meterName}] a fost sters cu succes`);
          const newMeters = [...meters].filter(({ _id }) => _id !== id);
          setMeters(newMeters);
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
    [meters]
  );

  const getRows = useCallback(
    () =>
      meters.map(
        (
          {
            _id,
            buildingName,
            apartmentId,
            apartmentName,
            name,
            prevValue,
            value,
            consumption,
          },
          id
        ) => (
          <tr key={`meters-row-${id}`}>
            <td>{buildingName}</td>
            <td>{apartmentName}</td>
            <td>{name}</td>
            <td>{prevValue} m&sup3;</td>
            <td>{value} m&sup3;</td>
            <td>{consumption} m&sup3;</td>
            <td className="text-center">
              <Button
                disabled={loading}
                color="warning"
                size="sm"
                onClick={onEditClick.bind(null, apartmentId, _id)}
              >
                M
              </Button>
            </td>
            {canDeleteFlag ? (
              <td className="text-center">
                <Button
                  disabled={loading}
                  color="danger"
                  size="sm"
                  onClick={onRemoveClick.bind(null, apartmentId, _id, name)}
                >
                  S
                </Button>
              </td>
            ) : null}
          </tr>
        )
      ),
    [meters, loading, canDeleteFlag]
  );

  const onInputChange = useCallback((event) => {
    const { target = {} } = event;
    const { name, value } = target;
    setFilters((prevFields) => ({ ...prevFields, [name]: value }));
  }, []);

  return (
    <Container style={{ maxWidth: "1400px" }}>
      <Row className="mt-5">
        <Col className="d-flex justify-content-between align-items-center">
          <span className="">
            <h3>Contoare ({meters.length})</h3>
          </span>
          <span>
            <Button
              disabled={loading}
              className=""
              color="primary"
              size="sm"
              onClick={onAddClick}
            >
              Adaugare Contor
            </Button>
          </span>
        </Col>
      </Row>
      {buildings.length || apartments.length ? (
        <Row className="mt-5">
          <Col>
            <Form>
              <FormGroup row>
                <Label sm={1}>Filtre:</Label>
                {buildings.length ? (
                  <Col sm={3}>
                    <Input
                      type="select"
                      name="buildingId"
                      id="buildingId"
                      value={filters["buildingId"]}
                      onChange={onInputChange}
                    >
                      <option value="">Alegeti un bloc</option>
                      {buildings.map(({ _id, name }, id) => (
                        <option key={`filter-buildings-row-${id}`} value={_id}>
                          {name}
                        </option>
                      ))}
                    </Input>
                  </Col>
                ) : null}
                {apartments.length ? (
                  <Col sm={3}>
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
                            key={`filter-apartments-row-${id}`}
                            value={_id}
                          >
                            {name}
                          </option>
                        ))}
                    </Input>
                  </Col>
                ) : null}
              </FormGroup>
            </Form>
          </Col>
        </Row>
      ) : null}
      <Row className={buildings.length || apartments.length ? "mt-2" : "mt-5"}>
        <Col>
          <Table hover>
            <thead>
              <tr>
                <th>Bloc</th>
                <th>Apartament</th>
                <th>Nume</th>
                <th>Index precedent</th>
                <th>Index actual</th>
                <th>Consum</th>
                <th className="text-center">Modificare</th>
                {canDeleteFlag ? (
                  <th className="text-center">Stergere</th>
                ) : null}
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
                getRows()
              )}
            </tbody>
          </Table>
        </Col>
      </Row>
    </Container>
  );
});

export default Meters;
