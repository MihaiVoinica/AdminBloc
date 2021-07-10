import React, { useCallback, useMemo, useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { Container, Row, Col, Table, Spinner, Button } from "reactstrap";
import { toast } from "react-toastify";
import axios from "axios";
// Utils
import { getRequestHeaders, userHasAccess, userRoles } from "../utils";
// Styling
import "./Contact.css";

const Contact = React.memo((props) => {
  const canModifyStatusFlag = useMemo(
    () => userHasAccess([userRoles.SUPERADMIN, userRoles.ADMIN]),
    []
  );
  const canCreateFlag = useMemo(() => userHasAccess([userRoles.NORMAL]), []);
  const [loading, setLoading] = useState(true);
  const [tickets, setTickets] = useState([]);
  const history = useHistory();

  useEffect(() => {
    axios
      .get(`/tickets/list`, getRequestHeaders())
      .then((res) => {
        const { data = [] } = res;
        setTickets(data);
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

  const onConfirmClick = useCallback(
    (id, ticketName) => {
      setLoading(true);

      axios
        .patch(`tickets/confirm/${id}`, {}, getRequestHeaders())
        .then((res) => {
          const { data = {} } = res;
          // TODO: use this name
          const { name = "" } = data;
          toast.success(`Ticketul [${ticketName}] a fost confirmat cu succes`);
          const newTickets = [...tickets];
          const ticketIndex = newTickets.findIndex(({ _id }) => _id === id);
          newTickets[ticketIndex].status = "confirmed";
          setTickets(newTickets);
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
      console.log("confirm", id);
    },
    [tickets]
  );

  const onResolveClick = useCallback(
    (id, ticketName) => {
      setLoading(true);

      axios
        .patch(`tickets/resolve/${id}`, {}, getRequestHeaders())
        .then((res) => {
          const { data = {} } = res;
          // TODO: use this name
          const { name = "" } = data;
          toast.success(`Ticketul [${ticketName}] a fost rezolvat cu succes`);
          const newTickets = [...tickets];
          const ticketIndex = newTickets.findIndex(({ _id }) => _id === id);
          newTickets[ticketIndex].status = "resolved";
          setTickets(newTickets);
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
      console.log("resolve", id);
    },
    [tickets]
  );

  const onRemoveClick = useCallback(
    (id, ticketName) => {
      setLoading(true);

      axios
        .patch(`tickets/remove/${id}`, {}, getRequestHeaders())
        .then((res) => {
          const { data = {} } = res;
          // TODO: use this name
          const { name = "" } = data;
          toast.success(`Ticketul [${ticketName}] a fost sters cu succes`);
          const newTickets = [...tickets].filter(({ _id }) => _id !== id);
          setTickets(newTickets);
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
    [tickets]
  );

  const getRows = useCallback(
    () =>
      tickets.map(
        ({ _id, buildingName, apartmentName, name, comment, status }, id) => (
          <tr key={`tickets-row-${id}`}>
            <td>{buildingName}</td>
            <td>{apartmentName}</td>
            <td>{name}</td>
            <td>{comment}</td>
            {canModifyStatusFlag ? (
              <td className="text-center">
                {status === "created" ? (
                  <Button
                    disabled={loading}
                    color="info"
                    size="sm"
                    onClick={onConfirmClick.bind(null, _id, name)}
                  >
                    C
                  </Button>
                ) : status === "confirmed" ? (
                  <Button
                    disabled={loading}
                    color="success"
                    size="sm"
                    onClick={onResolveClick.bind(null, _id, name)}
                  >
                    R
                  </Button>
                ) : (
                  "-"
                )}
              </td>
            ) : null}
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
          </tr>
        )
      ),
    [tickets, loading]
  );

  return (
    <Container style={{ maxWidth: "1400px" }}>
      <Row className="mt-5">
        <Col className="d-flex justify-content-between align-items-center">
          <span className="">
            <h3>Tickete ({tickets.length})</h3>
          </span>
          {canCreateFlag ? (
            <span>
              <Button
                disabled={loading}
                className=""
                color="primary"
                size="sm"
                onClick={onAddClick}
              >
                Adaugare Ticket
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
                <th>Apartament</th>
                <th>Nume</th>
                <th>Comentariu</th>
                {canModifyStatusFlag ? (
                  <th className="text-center">Actiuni</th>
                ) : null}
                <th className="text-center">Stergere</th>
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

export default Contact;
