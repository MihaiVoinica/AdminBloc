// Packages
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useHistory } from "react-router-dom";
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
import { getRequestHeaders } from "../utils";
// Styling
import "./AddApartment.css";

const AddApartment = React.memo((props) => {
  const rootPathname = useMemo(() => "/apartments", []);
  const [loading, setLoading] = useState(true);
  const [buildings, setBuildings] = useState([]);
  const [fields, setFields] = useState({
    name: "",
    number: "",
    buildingId: "",
    userEmail: "",
    peopleCount: "",
    totalArea: "",
    radiantArea: "",
    share: "",
    thermalProvider: false,
  });
  const [errors, setErrors] = useState({});
  const history = useHistory();

  useEffect(() => {
    axios
      .get(`/buildings/list`, getRequestHeaders())
      .then((res) => {
        const { data = [] } = res;
        setBuildings(data.map(({ _id, name }) => ({ _id, name })));
        setLoading(false);
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
        .post("/apartments/create", fields, getRequestHeaders())
        .then((res) => {
          const { data = {} } = res;
          const { name = "" } = data;
          toast.success(`Blocul [${name}] a fost adaugat cu succes`);
          history.push(rootPathname);
        })
        .catch((err) => {
          const { response = {} } = err;
          const { data = {} } = response;
          const {
            name,
            number,
            buildingId,
            userEmail,
            peopleCount,
            totalArea,
            radiantArea,
            share,
            thermalProvider,
            msg,
          } = data;
          if (msg) {
            toast.error(`Error: ${msg}!`);
          } else {
            setErrors({
              name,
              number,
              buildingId,
              userEmail,
              peopleCount,
              totalArea,
              radiantArea,
              share,
              thermalProvider,
            });
          }
          setLoading(false);
        });
    },
    [history, fields, rootPathname]
  );

  const onCancel = useCallback(() => {
    history.push(rootPathname);
  }, [history]);

  const onInputChange = useCallback((event) => {
    const { target = {} } = event;
    const { name, value, type, checked } = target;
    if (type === "checkbox") {
      setFields((prevFields) => ({ ...prevFields, [name]: checked }));
    } else {
      setFields((prevFields) => ({ ...prevFields, [name]: value }));
    }
  }, []);

  return (
    <Container className="mt-5">
      <Row>
        <Col sm="12" md={{ size: 8, offset: 2 }} lg={{ size: 6, offset: 3 }}>
          <Card className="p-5 bg-light shadow-sm">
            <h2 className="mx-auto">Adaugare Apartament</h2>
            <Form>
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
                <Label for="number">Numar Apartament</Label>
                <Input
                  id="number"
                  name="number"
                  min={1}
                  type="number"
                  invalid={Boolean(errors["number"])}
                  value={fields["number"]}
                  onChange={onInputChange}
                />
                <FormFeedback>{errors["number"]}</FormFeedback>
              </FormGroup>
              <FormGroup>
                <Label for="buildingId">Bloc</Label>
                <Input
                  type="select"
                  name="buildingId"
                  id="buildingId"
                  invalid={Boolean(errors["buildingId"])}
                  value={fields["buildingId"]}
                  onChange={onInputChange}
                >
                  <option value="">Alegeti un bloc</option>
                  {buildings.map(({ _id, name }, id) => (
                    <option key={`admin-option-row-${id}`} value={_id}>
                      {name}
                    </option>
                  ))}
                </Input>
                <FormFeedback>{errors["buildingId"]}</FormFeedback>
              </FormGroup>
              <FormGroup>
                <Label for="userEmail">Email Proprietar</Label>
                <Input
                  id="userEmail"
                  name="userEmail"
                  type="text"
                  invalid={Boolean(errors["userEmail"])}
                  value={fields["userEmail"]}
                  onChange={onInputChange}
                />
                <FormFeedback>{errors["userEmail"]}</FormFeedback>
              </FormGroup>
              <FormGroup>
                <Label for="peopleCount">Nr persoane</Label>
                <Input
                  id="peopleCount"
                  name="peopleCount"
                  type="number"
                  min={0}
                  invalid={Boolean(errors["peopleCount"])}
                  value={fields["peopleCount"]}
                  onChange={onInputChange}
                />
                <FormFeedback>{errors["peopleCount"]}</FormFeedback>
              </FormGroup>
              <FormGroup>
                <Label for="totalArea">Suprafata Totala</Label>
                <Input
                  id="totalArea"
                  name="totalArea"
                  type="number"
                  step="0.01"
                  min={0}
                  invalid={Boolean(errors["totalArea"])}
                  value={fields["totalArea"]}
                  onChange={onInputChange}
                />
                <FormFeedback>{errors["totalArea"]}</FormFeedback>
              </FormGroup>
              <FormGroup>
                <Label for="radiantArea">Suprafata Radianta</Label>
                <Input
                  id="radiantArea"
                  name="radiantArea"
                  type="number"
                  step="0.01"
                  min={0}
                  invalid={Boolean(errors["radiantArea"])}
                  value={fields["radiantArea"]}
                  onChange={onInputChange}
                />
                <FormFeedback>{errors["radiantArea"]}</FormFeedback>
              </FormGroup>
              <FormGroup>
                <Label for="share">Cota parte indiviza</Label>
                <Input
                  id="share"
                  name="share"
                  type="number"
                  step="0.01"
                  min={0}
                  max={100}
                  invalid={Boolean(errors["share"])}
                  value={fields["share"]}
                  onChange={onInputChange}
                />
                <FormFeedback>{errors["share"]}</FormFeedback>
              </FormGroup>
              <FormGroup check className="mb-3">
                <Label check>
                  <Input
                    type="checkbox"
                    id="thermalProvider"
                    name="thermalProvider"
                    checked={Boolean(fields["thermalProvider"])}
                    onChange={onInputChange}
                  />{" "}
                  Contract individual de apa calda
                </Label>
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

export default AddApartment;
