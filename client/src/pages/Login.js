// Packages
import React, { useState, useCallback } from "react";
import { useHistory } from "react-router-dom";
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
import "./Login.css";

const Login = React.memo((props) => {
  const [loading, setLoading] = useState(false);
  const [fields, setFields] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const history = useHistory();

  const onSubmit = useCallback(
    (event) => {
      event.preventDefault();

      setLoading(true);
      setErrors({});

      axios
        .post("/auth/login", fields)
        .then((res) => {
          const data = res.data;
          login(data);
          history.push("/");
        })
        .catch((err) => {
          const { response = {} } = err;
          const { data = {} } = response;
          const { email, password } = data;
          setLoading(false);
          setErrors({ email, password });
        });
    },
    [history, fields]
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
    setFields((prevState) => ({ ...prevState, [name]: value }));
  }, []);

  return (
    <Container className="mt-5">
      <Row>
        <Col sm="12" md={{ size: 8, offset: 2 }} lg={{ size: 6, offset: 3 }}>
          <Card className="p-5 bg-light shadow-sm">
            <h2 className="mx-auto">Login</h2>
            <Form>
              <FormGroup>
                <Label for="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="text"
                  invalid={Boolean(errors["email"])}
                  value={fields["email"]}
                  onChange={onInputChange}
                />
                <FormFeedback>{errors["email"]}</FormFeedback>
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
                <Button
                  color="primary"
                  className="float-right"
                  onClick={onSubmit}
                  disabled={loading}
                >
                  Sign in
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

export default Login;
