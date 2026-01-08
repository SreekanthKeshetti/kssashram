/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import {
  Row,
  Col,
  Card,
  Table,
  Button,
  Spinner,
  Alert,
  Form,
  Tabs,
  Tab,
  Badge,
} from "react-bootstrap";
import {
  FaRupeeSign,
  FaArrowDown,
  FaArrowUp,
  FaUserGraduate,
  FaExclamationTriangle,
  FaDownload,
  FaChartPie,
  FaFilter,
} from "react-icons/fa";
import axios from "axios";
import BASE_URL from "../../apiConfig";

const Reports = () => {
  // Dashboard Stats State
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Custom Report State
  const [reportParams, setReportParams] = useState({
    startDate: new Date().toISOString().split("T")[0], // Today
    endDate: new Date().toISOString().split("T")[0], // Today
    reportType: "All",
  });
  const [customReport, setCustomReport] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const { data } = await axios.get(`${BASE_URL}/api/reports/stats`, config);
      setStats(data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  // --- GENERATE CUSTOM REPORT ---
  const handleGenerateReport = async (e) => {
    e.preventDefault();
    setReportLoading(true);
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

      const query = `startDate=${reportParams.startDate}&endDate=${reportParams.endDate}&reportType=${reportParams.reportType}`;
      const { data } = await axios.get(
        `${BASE_URL}/api/reports/custom?${query}`,
        config
      );

      setCustomReport(data);
    } catch (error) {
      alert("Error generating report");
    }
    setReportLoading(false);
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
            Executive Reports
          </h2>
          <p className="text-muted">Financial Health & Operational Status</p>
        </Col>
        <Col className="text-end">
          <Button variant="outline-dark" onClick={() => window.print()}>
            <FaDownload /> Print Page
          </Button>
        </Col>
      </Row>

      <Tabs defaultActiveKey="dashboard" className="mb-4">
        {/* TAB 1: DASHBOARD OVERVIEW (Existing Code) */}
        <Tab eventKey="dashboard" title="Dashboard Overview">
          {/* --- Financial Cards --- */}
          <Row className="mb-4">
            <Col md={4}>
              <Card
                className="shadow-sm border-0 text-white"
                style={{
                  background: "linear-gradient(45deg, #11998e, #38ef7d)",
                }}
              >
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6
                        className="text-uppercase mb-2"
                        style={{ opacity: 0.8 }}
                      >
                        Total Income
                      </h6>
                      <h2 className="fw-bold">
                        <FaRupeeSign size={20} />{" "}
                        {stats?.financials.income.toLocaleString()}
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
                style={{
                  background: "linear-gradient(45deg, #ff416c, #ff4b2b)",
                }}
              >
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6
                        className="text-uppercase mb-2"
                        style={{ opacity: 0.8 }}
                      >
                        Total Expenses
                      </h6>
                      <h2 className="fw-bold">
                        <FaRupeeSign size={20} />{" "}
                        {stats?.financials.expense.toLocaleString()}
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
                style={{
                  background: "linear-gradient(45deg, #2193b0, #6dd5ed)",
                }}
              >
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6
                        className="text-uppercase mb-2"
                        style={{ opacity: 0.8 }}
                      >
                        Net Balance
                      </h6>
                      <h2 className="fw-bold">
                        <FaRupeeSign size={20} />{" "}
                        {stats?.financials.balance.toLocaleString()}
                      </h2>
                    </div>
                    <div style={{ fontSize: "1.5rem", fontWeight: "bold" }}>
                      ⚖️
                    </div>
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
                    <h3 className="fw-bold">{stats?.counts.students}</h3>
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
                    <h3 className="fw-bold">{stats?.counts.lowStock}</h3>
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
        </Tab>

        {/* TAB 2: CUSTOM REPORT BUILDER (New Code) */}
        <Tab
          eventKey="custom"
          title={
            <span>
              <FaFilter /> Custom Finance Report
            </span>
          }
        >
          <Card className="border-0 shadow-sm mb-4">
            <Card.Body className="bg-light">
              <h5 className="mb-3 text-maroon">Generate Financial Report</h5>
              <Form onSubmit={handleGenerateReport}>
                <Row className="align-items-end g-3">
                  <Col md={3}>
                    <Form.Label>Start Date</Form.Label>
                    <Form.Control
                      type="date"
                      value={reportParams.startDate}
                      onChange={(e) =>
                        setReportParams({
                          ...reportParams,
                          startDate: e.target.value,
                        })
                      }
                      required
                    />
                  </Col>
                  <Col md={3}>
                    <Form.Label>End Date</Form.Label>
                    <Form.Control
                      type="date"
                      value={reportParams.endDate}
                      onChange={(e) =>
                        setReportParams({
                          ...reportParams,
                          endDate: e.target.value,
                        })
                      }
                      required
                    />
                  </Col>
                  <Col md={3}>
                    <Form.Label>Report Type</Form.Label>
                    <Form.Select
                      value={reportParams.reportType}
                      onChange={(e) =>
                        setReportParams({
                          ...reportParams,
                          reportType: e.target.value,
                        })
                      }
                    >
                      <option value="All">Income & Expense</option>
                      <option value="Income">Income Only</option>
                      <option value="Expense">Expense Only</option>
                    </Form.Select>
                  </Col>
                  <Col md={3}>
                    <Button
                      type="submit"
                      variant="primary"
                      className="w-100"
                      style={{ backgroundColor: "#581818" }}
                      disabled={reportLoading}
                    >
                      {reportLoading ? "Generating..." : "Generate Analysis"}
                    </Button>
                  </Col>
                </Row>
              </Form>
            </Card.Body>
          </Card>

          {/* REPORT RESULTS */}
          {customReport && (
            <div className="report-results fade-in">
              <Alert variant="info" className="text-center">
                <strong>Period:</strong>{" "}
                {new Date(reportParams.startDate).toLocaleDateString()} to{" "}
                {new Date(reportParams.endDate).toLocaleDateString()}
              </Alert>

              <Row className="mb-4">
                {/* Income Summary Table */}
                {(reportParams.reportType === "All" ||
                  reportParams.reportType === "Income") && (
                  <Col md={6}>
                    <Card className="border-0 shadow-sm h-100">
                      <Card.Header className="bg-success text-white fw-bold">
                        Income Breakdown
                      </Card.Header>
                      <Table bordered size="sm" className="mb-0">
                        <tbody>
                          {customReport.income.breakdown.map((item, idx) => (
                            <tr key={idx}>
                              <td>{item.head}</td>
                              <td className="text-end fw-bold">
                                ₹{item.amount.toLocaleString()}
                              </td>
                            </tr>
                          ))}
                          <tr className="bg-light">
                            <td className="fw-bold">TOTAL INCOME</td>
                            <td className="text-end fw-bold text-success">
                              ₹{customReport.income.total.toLocaleString()}
                            </td>
                          </tr>
                        </tbody>
                      </Table>
                    </Card>
                  </Col>
                )}

                {/* Expense Summary Table */}
                {(reportParams.reportType === "All" ||
                  reportParams.reportType === "Expense") && (
                  <Col md={6}>
                    <Card className="border-0 shadow-sm h-100">
                      <Card.Header className="bg-danger text-white fw-bold">
                        Expense Breakdown
                      </Card.Header>
                      <Table bordered size="sm" className="mb-0">
                        <tbody>
                          {customReport.expense.breakdown.map((item, idx) => (
                            <tr key={idx}>
                              <td>{item.head}</td>
                              <td className="text-end fw-bold">
                                ₹{item.amount.toLocaleString()}
                              </td>
                            </tr>
                          ))}
                          <tr className="bg-light">
                            <td className="fw-bold">TOTAL EXPENSE</td>
                            <td className="text-end fw-bold text-danger">
                              ₹{customReport.expense.total.toLocaleString()}
                            </td>
                          </tr>
                        </tbody>
                      </Table>
                    </Card>
                  </Col>
                )}
              </Row>

              {/* Net Result (Only for All) */}
              {reportParams.reportType === "All" && (
                <Card className="text-center p-3 border-warning bg-light mb-4">
                  <h4>
                    Net Surplus / Deficit:
                    <span
                      className={
                        customReport.netSurplus >= 0
                          ? "text-success ms-2"
                          : "text-danger ms-2"
                      }
                    >
                      ₹{customReport.netSurplus.toLocaleString()}
                    </span>
                  </h4>
                </Card>
              )}

              {/* Detailed Transaction List */}
              <h5 className="text-maroon mt-4">
                <FaChartPie /> Detailed Transactions
              </h5>
              <Card className="border-0 shadow-sm">
                <Table responsive hover size="sm">
                  <thead className="bg-light">
                    <tr>
                      <th>Date</th>
                      <th>Type</th>
                      <th>Account Head</th>
                      <th>Description</th>
                      <th className="text-end">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Combine lists for detail view */}
                    {[
                      ...customReport.income.details,
                      ...customReport.expense.details,
                    ]
                      .sort((a, b) => new Date(b.date) - new Date(a.date))
                      .map((item, idx) => (
                        <tr key={idx}>
                          <td>{new Date(item.date).toLocaleDateString()}</td>
                          <td>
                            <Badge
                              bg={
                                item.type.includes("Debit")
                                  ? "danger"
                                  : "success"
                              }
                            >
                              {item.type}
                            </Badge>
                          </td>
                          <td>{item.head}</td>
                          <td className="small text-muted">{item.desc}</td>
                          <td
                            className={`text-end fw-bold ${
                              item.type.includes("Debit")
                                ? "text-danger"
                                : "text-success"
                            }`}
                          >
                            {item.type.includes("Debit") ? "-" : "+"} ₹
                            {item.amount.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </Table>
              </Card>
            </div>
          )}
        </Tab>
      </Tabs>
    </div>
  );
};

export default Reports;
