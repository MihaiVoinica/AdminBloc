// Packages
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Container,
  Row,
  Col,
  Form,
  FormGroup,
  Label,
  Input,
  FormFeedback,
  Button,
  Card,
} from "reactstrap";
import axios from "axios";
// Utils
import { getRequestHeaders, userHasAccess, userRoles } from "../utils";
// Styling
import "./EditBuilding.css";

const EditBuilding = React.memo((props) => {
  const { id: buildingId } = useParams();
  const rootPathname = useMemo(() => "/buildings", []);
  const [loading, setLoading] = useState(false);
  const [admins, setAdmins] = useState([]);
  const [fields, setFields] = useState({
    userId: "",
    name: "",
    address: "",
    apartmentsCount: "",
  });
  const [errors, setErrors] = useState({});
  const history = useHistory();

  useEffect(() => {
    let promisesFlag = 2;
    setLoading(true);

    if (userHasAccess([userRoles.SUPERADMIN])) {
      axios
        .get(`/auth/get-admins`, getRequestHeaders())
        .then((res) => {
          const { data = {} } = res;
          setAdmins(data);

          promisesFlag--;
          if (!promisesFlag) {
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

    axios
      .get(`/buildings/get`, getRequestHeaders({ id: buildingId }))
      .then((res) => {
        const { data = {} } = res;
        const { userId, name, address, apartmentsCount } = data;
        setFields({ userId, name, address, apartmentsCount });

        promisesFlag--;
        if (!promisesFlag) {
          setLoading(false);
        }
      })
      .catch((err) => {
        const { response = {} } = err;
        const { data = {} } = response;
        const { msg } = data;
        toast.error(`Error: ${msg}!`);
      });
  }, []);

  const onSubmit = useCallback(
    (event) => {
      event.preventDefault();

      setLoading(true);
      setErrors({});

      axios
        .post(`/buildings/update/${buildingId}`, fields, getRequestHeaders())
        .then((res) => {
          const { data = {} } = res;

          if (!data) {
            toast.warning(`Blocul nu a putut fi modificat, incercati din nou!`);
            setLoading(false);
          } else {
            const { name = "" } = data;
            toast.success(`Blocul [${name}] a fost modificat cu succes!`);
            history.push(rootPathname);
          }
        })
        .catch((err) => {
          const { response = {} } = err;
          const { data = {} } = response;
          const { name, address, apartmentsCount } = data;
          setLoading(false);
          setErrors({ name, address, apartmentsCount });
        });

      console.log("onSubmit", fields);
    },
    [history, fields, rootPathname]
  );

  const onCancel = useCallback(() => {
    history.push(rootPathname);
  }, [buildingId, history]);

  const onInputChange = useCallback((event) => {
    const { target = {} } = event;
    const { name, value } = target;
    setFields((prevFields) => ({ ...prevFields, [name]: value }));
  }, []);

  return (
    <Container className="mt-5">
      <Row>
        <Col sm="12" md={{ size: 8, offset: 2 }} lg={{ size: 6, offset: 3 }}>
          <Card className="p-5 bg-light shadow-sm">
            <h2 className="mx-auto">Adaugare Bloc</h2>
            <Form>
              {admins.length > 0 ? (
                <FormGroup>
                  <Label for="userId">Administrator</Label>
                  <Input
                    type="select"
                    name="userId"
                    id="userId"
                    value={fields["userId"]}
                    onChange={onInputChange}
                  >
                    <option value="">Alegeti un administrator</option>
                    {admins.map(({ _id, email }, id) => (
                      <option key={`admin-option-row-${id}`} value={_id}>
                        {email}
                      </option>
                    ))}
                  </Input>
                </FormGroup>
              ) : null}
              <FormGroup>
                <Label for="name">Nume</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  invalid={Boolean(errors["name"])}
                  value={fields["name"]}
                  onChange={onInputChange}
                />
                <FormFeedback>{errors["name"]}</FormFeedback>
              </FormGroup>
              <FormGroup>
                <Label for="address">Adresa</Label>
                <Input
                  id="address"
                  name="address"
                  type="text"
                  invalid={Boolean(errors["address"])}
                  value={fields["address"]}
                  onChange={onInputChange}
                />
                <FormFeedback>{errors["address"]}</FormFeedback>
              </FormGroup>
              <FormGroup>
                <Label for="apartmentsCount">Nr apartamente</Label>
                <Input
                  id="apartmentsCount"
                  name="apartmentsCount"
                  type="number"
                  min={fields["apartmentsCount"]}
                  invalid={Boolean(errors["apartmentsCount"])}
                  value={fields["apartmentsCount"]}
                  onChange={onInputChange}
                />
                <FormFeedback>{errors["apartmentsCount"]}</FormFeedback>
              </FormGroup>
              <FormGroup>
                <Button
                  color="primary"
                  className="float-right"
                  onClick={onSubmit}
                  disabled={loading}
                >
                  Salvare
                </Button>
                <Button
                  outline
                  color="secondary"
                  className="float-left"
                  onClick={onCancel}
                >
                  Renuntare
                </Button>
              </FormGroup>
            </Form>
          </Card>
        </Col>
      </Row>
    </Container>
  );
});

export default EditBuilding;
