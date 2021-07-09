// Packages
import React, { useState, useMemo, useCallback } from "react";
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
import { getRequestHeaders, userHasAccess, userRoles } from "../utils";
// Styling
import "./Register.css";

const Register = React.memo((props) => {
  const isSuperAdmin = useMemo(() => userHasAccess([userRoles.SUPERADMIN]), []);
  const [loading, setLoading] = useState(false);
  const [fields, setFields] = useState({
    name: "",
    email: "",
    role: "",
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
        .post("/auth/register", fields, getRequestHeaders())
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
            <h2 className="mx-auto">Inrolare utilizator nou</h2>
            <Form onKeyPress={onKeyPress}>
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
              {isSuperAdmin ? (
                <FormGroup>
                  <Label for="role">Rol</Label>
                  <Input
                    type="select"
                    name="role"
                    id="role"
                    value={fields["role"]}
                    onChange={onInputChange}
                  >
                    <option value="">Alegeti un rol</option>
                    <option value={userRoles.SUPERADMIN}>
                      Super Administrator
                    </option>
                    <option value={userRoles.ADMIN}>Administrator</option>
                  </Input>
                  <FormFeedback>{errors["role"]}</FormFeedback>
                </FormGroup>
              ) : null}
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

export default Register;
