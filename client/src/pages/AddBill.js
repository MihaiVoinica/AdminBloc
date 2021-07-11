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
import { getRequestHeaders, billTypes, billLabels } from "../utils";
// Styling
import "./AddBill.css";

const AddBill = React.memo((props) => {
  const rootPathname = useMemo(() => "/bills", []);
  const [loading, setLoading] = useState(true);
  const [fields, setFields] = useState({
    buildingId: "",
    type: "",
    name: "",
    value: "",
  });
  const [errors, setErrors] = useState({});
  const [buildings, setBuildings] = useState([]);
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
      setErrors({});

      const { buildingId, ...fieldsData } = fields;

      if (!buildingId) {
        setErrors({ buildingId: "BuildingId field is required" });
        return;
      }

      setLoading(true);

      axios
        .patch(
          `/buildings/create-bill/${buildingId}`,
          fieldsData,
          getRequestHeaders()
        )
        .then((res) => {
          const { data = {} } = res;
          // TODO: use this name
          const { name = "" } = data;
          toast.success(
            `Factura [${fieldsData.name}] a fost adaugata cu succes`
          );
          history.push(rootPathname);
        })
        .catch((err) => {
          const { response = {} } = err;
          const { data = {} } = response;
          const { type, name, value } = data;
          setLoading(false);
          setErrors({ type, name, value });
        });
    },
    [history, fields, rootPathname]
  );

  const onCancel = useCallback(() => {
    history.push(rootPathname);
  }, [history]);

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
            <h2 className="mx-auto">Adaugare Factura</h2>
            <Form>
              {buildings.length ? (
                <FormGroup>
                  <Label for="buildingId">Bloc:</Label>
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
                      <option key={`buildings-row-${id}`} value={_id}>
                        {name}
                      </option>
                    ))}
                  </Input>
                  <FormFeedback>{errors["buildingId"]}</FormFeedback>
                </FormGroup>
              ) : null}
              <FormGroup>
                <Label for="type">Tip factura:</Label>
                <Input
                  type="select"
                  name="type"
                  id="type"
                  invalid={Boolean(errors["type"])}
                  value={fields["type"]}
                  onChange={onInputChange}
                >
                  <option value="">Alegeti un tip de factura</option>
                  <option value={billTypes.PeopleCount}>
                    {billLabels[billTypes.PeopleCount]}
                  </option>
                  <option value={billTypes.Share}>
                    {billLabels[billTypes.Share]}
                  </option>
                  <option value={billTypes.Consumption}>
                    {billLabels[billTypes.Consumption]}
                  </option>
                  <option value={billTypes.Radiant}>
                    {billLabels[billTypes.Radiant]}
                  </option>
                </Input>
                <FormFeedback>{errors["type"]}</FormFeedback>
              </FormGroup>
              <FormGroup>
                <Label for="value">Valoare (RON)</Label>
                <Input
                  id="value"
                  name="value"
                  type="number"
                  step={0.01}
                  min={0}
                  invalid={Boolean(errors["value"])}
                  value={fields["value"]}
                  onChange={onInputChange}
                />
                <FormFeedback>{errors["value"]}</FormFeedback>
              </FormGroup>
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

export default AddBill;
