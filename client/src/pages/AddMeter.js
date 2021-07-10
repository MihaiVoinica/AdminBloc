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
import "./AddMeter.css";

const AddMeter = React.memo((props) => {
  const rootPathname = useMemo(() => "/meters", []);
  const [loading, setLoading] = useState(true);
  const [fields, setFields] = useState({ apartmentId: "", name: "" });
  const [errors, setErrors] = useState({});
  const [apartments, setApartments] = useState([]);
  const history = useHistory();

  useEffect(() => {
    axios
      .get(`/apartments/list`, getRequestHeaders())
      .then((res) => {
        const { data = [] } = res;
        setApartments(
          data.map(({ _id, name, buildingName }) => ({
            _id,
            name: `[${buildingName}] ${name}`,
          }))
        );
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

      const { apartmentId, ...data } = fields;

      if (!apartmentId) {
        setErrors({ apartmentId: "ApartmentId field is required" });
        return;
      }

      axios
        .patch(
          `/apartments/create-meter/${apartmentId}`,
          data,
          getRequestHeaders()
        )
        .then((res) => {
          const { data = {} } = res;
          const { name = "" } = data;
          toast.success(`Contorul [${name}] a fost adaugat cu succes`);
          history.push(rootPathname);
        })
        .catch((err) => {
          const { response = {} } = err;
          const { data = {} } = response;
          const { name } = data;
          setLoading(false);
          setErrors({ name });
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
            <h2 className="mx-auto">Adaugare Contor</h2>
            <Form>
              {apartments.length ? (
                <FormGroup>
                  <Label for="apartmentId">Apartament:</Label>
                  <Input
                    type="select"
                    name="apartmentId"
                    id="apartmentId"
                    invalid={Boolean(errors["apartmentId"])}
                    value={fields["apartmentId"]}
                    onChange={onInputChange}
                  >
                    <option value="">Alegeti un apartament</option>
                    {apartments.map(({ _id, name }, id) => (
                      <option key={`apartments-row-${id}`} value={_id}>
                        {name}
                      </option>
                    ))}
                  </Input>
                  <FormFeedback>{errors["apartmentId"]}</FormFeedback>
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

export default AddMeter;
