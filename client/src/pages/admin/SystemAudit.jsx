import React, { useEffect, useState } from "react";
import { Table, Badge, Card, Row, Col, Spinner, Form } from "react-bootstrap";
import { FaShieldAlt, FaSearch } from "react-icons/fa";
import axios from "axios";
import BASE_URL from "../../apiConfig";

const SystemAudit = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const { data } = await axios.get(`${BASE_URL}/api/audit/system`, config);
      setLogs(data);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  // Filter Logic
  const filteredLogs = logs.filter(
    (log) =>
      log.userName.toLowerCase().includes(filter.toLowerCase()) ||
      log.module.toLowerCase().includes(filter.toLowerCase()) ||
      log.action.toLowerCase().includes(filter.toLowerCase())
  );

  const getActionBadge = (action) => {
    switch (action) {
      case "CREATE":
        return <Badge bg="success">CREATE</Badge>;
      case "UPDATE":
        return (
          <Badge bg="warning" text="dark">
            UPDATE
          </Badge>
        );
      case "DELETE":
        return <Badge bg="danger">DELETE</Badge>;
      case "APPROVE":
        return <Badge bg="info">APPROVE</Badge>;
      default:
        return <Badge bg="secondary">{action}</Badge>;
    }
  };

  if (loading)
    return (
      <div className="text-center py-5">
        <Spinner animation="border" />
      </div>
    );

  return (
    <div>
      <Row className="mb-4 align-items-center">
        <Col>
          <h2
            className="text-maroon"
            style={{ fontFamily: "Playfair Display" }}
          >
            System Audit Trail
          </h2>
          <p className="text-muted">
            Track all user activities and data changes
          </p>
        </Col>
        <Col md={4}>
          <div className="input-group">
            <span className="input-group-text bg-white">
              <FaSearch />
            </span>
            <Form.Control
              placeholder="Search User, Module or Action..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>
        </Col>
      </Row>

      <Card className="shadow-sm border-0">
        <Card.Body className="p-0">
          <Table
            hover
            responsive
            className="align-middle mb-0"
            style={{ fontSize: "0.9rem" }}
          >
            <thead className="bg-light">
              <tr>
                <th className="ps-4">Time</th>
                <th>User</th>
                <th>Module</th>
                <th>Action</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log) => (
                <tr key={log._id}>
                  <td className="ps-4 text-muted" style={{ width: "180px" }}>
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td className="fw-bold text-primary">{log.userName}</td>
                  <td>{log.module}</td>
                  <td>{getActionBadge(log.action)}</td>
                  <td className="text-muted">{log.details}</td>
                </tr>
              ))}
              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center py-5">
                    No logs found
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </div>
  );
};

export default SystemAudit;
