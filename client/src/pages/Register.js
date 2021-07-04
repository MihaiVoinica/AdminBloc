// Packages
import React, { useState, useCallback } from "react";
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
import { getUserToken } from "../utils";
// Styling
import "./Register.css";

const Register = React.memo((props) => {
  const [loading, setLoading] = useState(false);
  const [fields, setFields] = useState({
    name: "",
    email: "",
    password: "",
    password2: "",
  });
  const [errors, setErrors] = useState({});
  const history = useHistory();

  const onSubmit = useCallback(
    (event) => {
      event.preventDefault();

      setLoading(true);
      setErrors({});

      axios
        .post("/auth/register", fields, {
          headers: {
            "X-Auth-Token": getUserToken(),
            "Content-Type": "application/json",
          },
        })
        .then((res) => {
          const { name, email } = res.data;
          toast.success(
            `An email has been sent to [${email}] in order to activate user <${name}>`
          );
          history.push("/");
        })
        .catch((err) => {
          const { response = {} } = err;
          const { data = {} } = response;
          const { name, email, password, password2 } = data;
          setLoading(false);
          setErrors({ name, email, password, password2 });
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
    setFields((prevFields) => ({ ...prevFields, [name]: value }));
  }, []);

  return (
    <Container className="mt-5">
      <Row>
        <Col sm="12" md={{ size: 8, offset: 2 }} lg={{ size: 6, offset: 3 }}>
          <Card className="p-5 bg-light shadow-sm">
            <h2 className="mx-auto">Register New User</h2>
            <Form>
              <FormGroup>
                <Label for="name">Name</Label>
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
              {/* <FormGroup>
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
              </FormGroup> */}
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

export default Register;
