import React, { useEffect, useState } from "react";
import { Row, Col, Card, Table, Button, Spinner, Alert } from "react-bootstrap";
import {
  FaRupeeSign,
  FaArrowDown,
  FaArrowUp,
  FaUserGraduate,
  FaExclamationTriangle,
  FaDownload,
} from "react-icons/fa";
import axios from "axios";

const Reports = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const { data } = await axios.get(
        "http://localhost:5000/api/reports/stats",
        config
      );
      setStats(data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError("Failed to load reports");
      setLoading(false);
    }
  };

  if (loading)
    return (
      <div className="text-center py-5">
        <Spinner animation="border" />
      </div>
    );
  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <div>
      <Row className="mb-4 align-items-center">
        <Col>
          <h2
            className="text-maroon"
            style={{ fontFamily: "Playfair Display" }}
          >
            Executive Reports
          </h2>
          <p className="text-muted">Financial Health & Operational Status</p>
        </Col>
        <Col className="text-end">
          <Button variant="outline-dark" onClick={() => window.print()}>
            <FaDownload /> Print / Save PDF
          </Button>
        </Col>
      </Row>

      {/* --- Financial Cards --- */}
      <Row className="mb-4">
        <Col md={4}>
          <Card
            className="shadow-sm border-0 text-white"
            style={{ background: "linear-gradient(45deg, #11998e, #38ef7d)" }}
          >
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-uppercase mb-2" style={{ opacity: 0.8 }}>
                    Total Income
                  </h6>
                  <h2 className="fw-bold">
                    <FaRupeeSign size={20} />{" "}
                    {stats.financials.income.toLocaleString()}
                  </h2>
                </div>
                <FaArrowUp size={30} style={{ opacity: 0.5 }} />
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card
            className="shadow-sm border-0 text-white"
            style={{ background: "linear-gradient(45deg, #ff416c, #ff4b2b)" }}
          >
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-uppercase mb-2" style={{ opacity: 0.8 }}>
                    Total Expenses
                  </h6>
                  <h2 className="fw-bold">
                    <FaRupeeSign size={20} />{" "}
                    {stats.financials.expense.toLocaleString()}
                  </h2>
                </div>
                <FaArrowDown size={30} style={{ opacity: 0.5 }} />
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card
            className="shadow-sm border-0 text-white"
            style={{ background: "linear-gradient(45deg, #2193b0, #6dd5ed)" }}
          >
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-uppercase mb-2" style={{ opacity: 0.8 }}>
                    Net Balance
                  </h6>
                  <h2 className="fw-bold">
                    <FaRupeeSign size={20} />{" "}
                    {stats.financials.balance.toLocaleString()}
                  </h2>
                </div>
                <div style={{ fontSize: "1.5rem", fontWeight: "bold" }}>⚖️</div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* --- Operational Stats --- */}
      <Row className="mb-4">
        <Col md={6}>
          <Card className="shadow-sm border-0 h-100">
            <Card.Body className="d-flex align-items-center justify-content-between">
              <div>
                <h5 className="text-maroon">Active Students</h5>
                <h3 className="fw-bold">{stats.counts.students}</h3>
                <small className="text-muted">
                  Currently admitted in Ashram
                </small>
              </div>
              <div className="bg-light p-3 rounded-circle text-maroon">
                <FaUserGraduate size={30} />
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card className="shadow-sm border-0 h-100">
            <Card.Body className="d-flex align-items-center justify-content-between">
              <div>
                <h5 className="text-warning">Low Stock Alerts</h5>
                <h3 className="fw-bold">{stats.counts.lowStock}</h3>
                <small className="text-muted">
                  Items below minimum quantity
                </small>
              </div>
              <div className="bg-light p-3 rounded-circle text-warning">
                <FaExclamationTriangle size={30} />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* --- Recent Donations Table --- */}
      <Card className="shadow-sm border-0">
        <Card.Header className="bg-white py-3">
          <h5 className="mb-0 text-maroon">Recent Donations</h5>
        </Card.Header>
        <Table responsive hover className="mb-0 align-middle">
          <thead className="bg-light">
            <tr>
              <th className="ps-4">Date</th>
              <th>Donor</th>
              <th>Scheme</th>
              <th className="text-end pe-4">Amount</th>
            </tr>
          </thead>
          <tbody>
            {stats.recentDonations.map((d) => (
              <tr key={d._id}>
                <td className="ps-4 text-muted">
                  {new Date(d.createdAt).toLocaleDateString()}
                </td>
                <td className="fw-bold">{d.donorName}</td>
                <td>
                  <span className="badge bg-info text-dark">{d.scheme}</span>
                </td>
                <td className="text-end pe-4 fw-bold text-success">
                  + ₹{d.amount.toLocaleString()}
                </td>
              </tr>
            ))}
            {stats.recentDonations.length === 0 && (
              <tr>
                <td colSpan="4" className="text-center py-3">
                  No recent activity
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </Card>
    </div>
  );
};

export default Reports;
