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
import "./AddDocument.css";

const AddDocument = React.memo((props) => {
  const rootPathname = useMemo(() => "/documents", []);
  const [loading, setLoading] = useState(true);
  const [buildings, setBuildings] = useState([]);
  const [fields, setFields] = useState({
    buildingId: "",
    name: "",
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

      setErrors({});

      const { buildingId, name, file } = fields;

      if (!file) {
        setErrors({ file: "File field is required" });
        return;
      }

      setLoading(true);

      const formData = new FormData();
      formData.append("buildingId", buildingId);
      formData.append("name", name);
      formData.append("files", file);

      axios
        .post(
          "/files/create",
          formData,
          getRequestHeaders({ requestHasFilesFlag: true })
        )
        .then((res) => {
          const { data = {} } = res;
          const { name = "" } = data;
          toast.success(`Documentul [${name}] a fost adaugat cu succes`);
          history.push(rootPathname);
        })
        .catch((err) => {
          const { response = {} } = err;
          const { data = {} } = response;
          const { buildingId, name, msg } = data;
          if (msg) {
            toast.error(`Error: ${msg}!`);
          } else {
            setErrors({ buildingId, name });
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
    const { name, value, type, files } = target;
    if (type === "file") {
      setFields((prevFields) => ({ ...prevFields, [name]: files[0] }));
    } else {
      setFields((prevFields) => ({ ...prevFields, [name]: value }));
    }
  }, []);

  return (
    <Container className="mt-5">
      <Row>
        <Col sm="12" md={{ size: 8, offset: 2 }} lg={{ size: 6, offset: 3 }}>
          <Card className="p-5 bg-light shadow-sm">
            <h2 className="mx-auto">Adaugare Document</h2>
            <Form>
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
                <Label for="file">Fisier</Label>
                <Input
                  type="file"
                  name="file"
                  id="file"
                  invalid={Boolean(errors["file"])}
                  onChange={onInputChange}
                />
                <FormFeedback>{errors["file"]}</FormFeedback>
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

export default AddDocument;
