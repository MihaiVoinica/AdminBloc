// Packages
import React, { useCallback, useMemo, useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { Container, Row, Col, Table, Spinner, Button } from "reactstrap";
import { toast } from "react-toastify";
import axios from "axios";
// Utils
import { getRequestHeaders, userHasAccess, userRoles } from "../utils";
// Styling
import "./Documents.css";

const Documents = React.memo((props) => {
  const canModifyFlag = useMemo(
    () => userHasAccess([userRoles.SUPERADMIN, userRoles.ADMIN]),
    []
  );
  const [loading, setLoading] = useState(true);
  const [files, setFiles] = useState([]);
  const history = useHistory();

  useEffect(() => {
    axios
      .get(`/files/list`, getRequestHeaders())
      .then((res) => {
        const { data = [] } = res;
        setFiles(data);
        setLoading(false);
      })
      .catch((err) => {
        const { response = {} } = err;
        const { data = {} } = response;
        const { msg } = data;
        toast.error(`Error: ${msg}!`);
      });
  }, []);

  const onAddClick = useCallback(() => {
    history.push(`${history.location.pathname}/add`);
  }, [history]);

  const onEditClick = useCallback(
    (id) => {
      history.push(`${history.location.pathname}/edit/${id}`);
    },
    [history]
  );

  const onRemoveClick = useCallback(
    (id, fileName) => {
      setLoading(true);

      axios
        .patch(`files/remove/${id}`, {}, getRequestHeaders())
        .then((res) => {
          const { data = {} } = res;
          // TODO: use this name
          const { name = "" } = data;
          toast.success(`Documentul [${fileName}] a fost sters cu succes`);
          const newFiles = [...files].filter(({ _id }) => _id !== id);
          setFiles(newFiles);
        })
        .catch((err) => {
          const { response = {} } = err;
          const { data = {} } = response;
          const { msg } = data;
          toast.error(`Error: ${msg}!`);
        })
        .finally(() => {
          setLoading(false);
        });
    },
    [files]
  );

  const onDownloadClick = (id, filename) => {
    axios
      .get(
        `/files/download`,
        getRequestHeaders({ id, requestDownloadFilesFlag: true })
      )
      .then((res) => {
        const type = res.headers["content-type"];
        const blob = new Blob([res.data], { type: type, encoding: "UTF-8" });
        const link = document.createElement("a");
        link.href = window.URL.createObjectURL(blob);
        link.download = filename;
        link.click();
        link.remove();
      });
  };

  const getRows = useCallback(
    () =>
      files.map(({ _id, buildingName, userEmail, name, originalname }, id) => (
        <tr key={`files-row-${id}`}>
          <td>{buildingName}</td>
          <td>{userEmail}</td>
          <td>{name}</td>
          <td className="text-center">
            <Button
              disabled={loading}
              color="info"
              size="sm"
              onClick={onDownloadClick.bind(null, _id, originalname)}
            >
              D
            </Button>
          </td>
          {canModifyFlag ? (
            <>
              {/* <td className="text-center">
                <Button
                  disabled={loading}
                  color="warning"
                  size="sm"
                  onClick={onEditClick.bind(null, _id)}
                >
                  M
                </Button>
              </td> */}
              <td className="text-center">
                <Button
                  disabled={loading}
                  color="danger"
                  size="sm"
                  onClick={onRemoveClick.bind(null, _id, name)}
                >
                  S
                </Button>
              </td>
            </>
          ) : null}
        </tr>
      )),
    [loading, files, canModifyFlag]
  );

  return (
    <Container style={{ maxWidth: "1400px" }}>
      <Row className="mt-5">
        <Col className="d-flex justify-content-between align-items-center">
          <span className="">
            <h3>Documente ({files.length})</h3>
          </span>
          {canModifyFlag ? (
            <span>
              <Button
                disabled={loading}
                className=""
                color="primary"
                size="sm"
                onClick={onAddClick}
              >
                Adaugare Document
              </Button>
            </span>
          ) : null}
        </Col>
      </Row>
      <Row className="mt-5">
        <Col>
          <Table hover>
            <thead>
              <tr>
                <th>Bloc</th>
                <th>Autor</th>
                <th>Nume</th>
                <th className="text-center">Descarcare</th>
                {canModifyFlag ? (
                  <>
                    {/* <th className="text-center">Modificare</th> */}
                    <th className="text-center">Stergere</th>
                  </>
                ) : null}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={13} className="text-center">
                    <Spinner style={{ width: "3rem", height: "3rem" }} />
                  </td>
                </tr>
              ) : (
                getRows()
              )}
            </tbody>
          </Table>
        </Col>
      </Row>
    </Container>
  );
});

export default Documents;
