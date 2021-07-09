// Packages
import React, { useEffect, useState, useCallback } from "react";
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
import { login } from "../utils";
// Styling
import "./ActivateUser.css";

const ActivateUser = React.memo((props) => {
  const { token } = useParams();
  const [loading, setLoading] = useState(true);
  const [fields, setFields] = useState({
    activationPin: "",
    password: "",
    password2: "",
  });
  const [errors, setErrors] = useState({});
  const history = useHistory();

  useEffect(() => {
    axios
      .get(`/auth/validate-user/${token}`)
      .then((res) => {
        const { data = {} } = res;
        const { isValid } = data;
        if (isValid) {
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
        .post(`/auth/activate-user/${token}`, fields)
        .then((res) => {
          const data = res.data;
          login(data);
          history.push("/");
        })
        .catch((err) => {
          const { response = {} } = err;
          const { data = {} } = response;
          const { msg, activationPin, password, password2 } = data;
          if (msg) {
            toast.error(`Error: ${msg}!`);
          }
          setLoading(false);
          setErrors({ activationPin, password, password2 });
        });
    },
    [history, fields]
  );

  const onKeyPress = useCallback(
    (event) => {
      if (event.key === "Enter") {
        onSubmit(event);
      }
    },
    [onSubmit]
  );

  const onCancel = useCallback(
    (event) => {
      event.preventDefault();
      history.push("/");
    },
    [history]
  );

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
            <h2 className="mx-auto">Activate User</h2>
            <Form onKeyPress={onKeyPress}>
              <FormGroup>
                <Label for="activationPin">Pin</Label>
                <Input
                  id="activationPin"
                  name="activationPin"
                  type="text"
                  invalid={Boolean(errors["activationPin"])}
                  value={fields["activationPin"]}
                  onChange={onInputChange}
                />
                <FormFeedback>{errors["activationPin"]}</FormFeedback>
              </FormGroup>
              <FormGroup>
                <Label for="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="on"
                  invalid={Boolean(errors["password"])}
                  value={fields["password"]}
                  onChange={onInputChange}
                />
                <FormFeedback>{errors["password"]}</FormFeedback>
              </FormGroup>
              <FormGroup>
                <Label for="password">Confirm Password</Label>
                <Input
                  id="password2"
                  name="password2"
                  type="password"
                  autoComplete="on"
                  invalid={Boolean(errors["password2"])}
                  value={fields["password2"]}
                  onChange={onInputChange}
                />
                <FormFeedback>{errors["password2"]}</FormFeedback>
              </FormGroup>
              <FormGroup>
                <Button
                  color="primary"
                  className="float-right"
                  onClick={onSubmit}
                  disabled={loading}
                >
                  Register
                </Button>
                <Button
                  outline
                  color="secondary"
                  className="float-left"
                  onClick={onCancel}
                >
                  Cancel
                </Button>
              </FormGroup>
            </Form>
          </Card>
        </Col>
      </Row>
    </Container>
  );
});

export default ActivateUser;
