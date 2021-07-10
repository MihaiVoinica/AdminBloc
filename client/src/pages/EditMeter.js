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
import { getRequestHeaders } from "../utils";
// Styling
import "./EditMeter.css";

const EditMeter = React.memo((props) => {
  const { id: meterId, apartmentId } = useParams();
  const rootPathname = useMemo(() => "/meters", []);
  const [loading, setLoading] = useState(true);
  const [fields, setFields] = useState({
    apartmentId: "",
    name: "",
    prevValue: "",
    value: "",
    consumption: "",
  });
  const [errors, setErrors] = useState({});
  const history = useHistory();

  useEffect(() => {
    axios
      .get(
        `/apartments/get-meter/${apartmentId}`,
        getRequestHeaders({ id: meterId })
      )
      .then((res) => {
        const { data = {} } = res;
        const { name, prevValue, value, consumption } = data;
        setFields({ apartmentId, name, prevValue, value, consumption });
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

      axios
        .patch(
          `/apartments/update-meter/${apartmentId}`,
          { ...data, id: meterId },
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
    if (name) {
      setFields((prevFields) => ({ ...prevFields, [name]: value }));
    }
  }, []);

  return (
    <Container className="mt-5">
      <Row>
        <Col sm="12" md={{ size: 8, offset: 2 }} lg={{ size: 6, offset: 3 }}>
          <Card className="p-5 bg-light shadow-sm">
            <h2 className="mx-auto">Modificare Contor</h2>
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
                <Label for="prevValue">Index precedent</Label>
                <Input
                  id="prevValue"
                  type="text"
                  disabled={true}
                  value={fields["prevValue"]}
                />
              </FormGroup>
              <FormGroup>
                <Label for="value">Index actual (m&sup3;)</Label>
                <Input
                  id="value"
                  name="value"
                  type="number"
                  step={0.0001}
                  min={fields["prevValue"]}
                  invalid={Boolean(errors["value"])}
                  value={fields["value"]}
                  onChange={onInputChange}
                />
                <FormFeedback>{errors["value"]}</FormFeedback>
              </FormGroup>
              <FormGroup>
                <Label for="consumption">Consum actual (m&sup3;)</Label>
                <Input
                  id="consumption"
                  type="text"
                  disabled={true}
                  value={
                    fields["value"]
                      ? fields["value"] - fields["prevValue"]
                      : fields["consumption"]
                  }
                />
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

export default EditMeter;
