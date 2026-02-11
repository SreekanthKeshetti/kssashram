/* eslint-disable react-hooks/immutability */
import React, { useEffect, useState } from "react";
import axios from "axios";
import BASE_URL from "../../apiConfig";
import { Row, Col, Card, Table, Spinner, Alert } from "react-bootstrap";
import {
  FaRupeeSign,
  FaUserGraduate,
  FaExclamationTriangle,
  FaHandHoldingHeart,
  FaArrowRight,
  FaClock, // <--- Added Icon for Pending
} from "react-icons/fa";
import { Link } from "react-router-dom";

const DashboardHome = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    setUser(userInfo);
    if (userInfo) fetchStats(userInfo);
  }, []);

  const fetchStats = async (userInfo) => {
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const { data } = await axios.get(`${BASE_URL}/api/reports/stats`, config);
      setStats(data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError("Failed to load dashboard data");
      setLoading(false);
    }
  };

  if (loading)
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <div>
      {/* --- Welcome Section --- */}
      <div className="mb-4">
        <h2 className="text-maroon" style={{ fontFamily: "Playfair Display" }}>
          Welcome back, {user?.name.split(" ")[0]}!
        </h2>
        <p className="text-muted">
          Here is the real-time status of the Ashram.
        </p>
      </div>

      {/* --- ROW 1: INCOME METRICS --- */}
      <Row className="mb-3">
        {/* 1. TOTAL INCOME */}
        <Col lg={4} md={6} xs={12} className="mb-3">
          <Card
            className="p-3 text-white shadow border-0 h-100"
            style={{ background: "linear-gradient(45deg, #11998e, #38ef7d)" }}
          >
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h3 className="mb-0 fw-bold">
                  ₹ {stats.financials.income.toLocaleString()}
                </h3>
                <small>Total Trust Income</small>
              </div>
              <div style={{ fontSize: "2rem", opacity: 0.5 }}>
                <FaHandHoldingHeart />
              </div>
            </div>
          </Card>
        </Col>

        {/* 2. KARUNYA SINDHU */}
        <Col lg={4} md={6} xs={12} className="mb-3">
          <Card
            className="p-3 text-white shadow border-0 h-100"
            style={{ background: "linear-gradient(45deg, #FF8008, #FFC837)" }}
          >
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h3 className="mb-0 fw-bold">
                  ₹ {stats.financials.incomeSindu?.toLocaleString() || 0}
                </h3>
                <small>Karunya Sindhu</small>
              </div>
              <div style={{ fontSize: "2rem", opacity: 0.5 }}>
                <FaRupeeSign />
              </div>
            </div>
          </Card>
        </Col>

        {/* 3. KARUNYA BHARATHI */}
        <Col lg={4} md={12} xs={12} className="mb-3">
          <Card
            className="p-3 text-white shadow border-0 h-100"
            style={{ background: "linear-gradient(45deg, #8E2DE2, #4A00E0)" }}
          >
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h3 className="mb-0 fw-bold">
                  ₹ {stats.financials.incomeBharathi?.toLocaleString() || 0}
                </h3>
                <small>Karunya Bharathi</small>
              </div>
              <div style={{ fontSize: "2rem", opacity: 0.5 }}>
                <FaRupeeSign />
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* --- ROW 2: OPERATIONAL & EXPENSE METRICS --- */}
      <Row className="mb-4">
        {/* 1. APPROVED EXPENSES (Red) */}
        <Col lg={3} md={6} xs={12} className="mb-3">
          <Card
            className="p-3 text-white shadow border-0 h-100"
            style={{ background: "linear-gradient(45deg, #ff416c, #ff4b2b)" }}
          >
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h3 className="mb-0 fw-bold">
                  ₹ {stats.financials.expense.toLocaleString()}
                </h3>
                <small>Approved Expenses</small>
              </div>
              <div style={{ fontSize: "2rem", opacity: 0.5 }}>
                <FaRupeeSign />
              </div>
            </div>
          </Card>
        </Col>

        {/* 2. PENDING EXPENSES (Yellow/Orange - NEW!) */}
        <Col lg={3} md={6} xs={12} className="mb-3">
          <Card
            className="p-3 text-white shadow border-0 h-100"
            style={{ background: "linear-gradient(45deg, #f09819, #edde5d)" }}
          >
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h3 className="mb-0 fw-bold">
                  ₹ {stats.financials.pendingExpense?.toLocaleString() || 0}
                </h3>
                <small>Pending Approval</small>
              </div>
              <div style={{ fontSize: "2rem", opacity: 0.5 }}>
                <FaClock />
              </div>
            </div>
          </Card>
        </Col>

        {/* 3. ACTIVE STUDENTS (Blue) */}
        <Col lg={3} md={6} xs={12} className="mb-3">
          <Card
            className="p-3 text-white shadow border-0 h-100"
            style={{ background: "linear-gradient(45deg, #2193b0, #6dd5ed)" }}
          >
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h3 className="mb-0 fw-bold">{stats.counts.students}</h3>
                <small>Active Students</small>
              </div>
              <div style={{ fontSize: "2rem", opacity: 0.5 }}>
                <FaUserGraduate />
              </div>
            </div>
          </Card>
        </Col>

        {/* 4. LOW STOCK ALERTS (Orange Warning) */}
        <Col lg={3} md={6} xs={12} className="mb-3">
          <Card
            className="p-3 text-white shadow border-0 h-100"
            style={{ background: "linear-gradient(45deg, #f7971e, #ffd200)" }}
          >
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h3 className="mb-0 fw-bold">{stats.counts.lowStock}</h3>
                <small>Low Stock Items</small>
              </div>
              <div style={{ fontSize: "2rem", opacity: 0.5 }}>
                <FaExclamationTriangle />
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* --- Recent Activity Section --- */}
      <Row>
        <Col xs={12} sm={12} md={12} lg={8} className="mb-3">
          <Card className="shadow-sm border-0 h-100">
            <Card.Header className="bg-white py-3 d-flex justify-content-between align-items-center">
              <h5 className="mb-0 text-maroon">Recent Donations</h5>
              <Link
                to="/dashboard/donations"
                className="btn btn-sm btn-outline-primary"
              >
                View All <FaArrowRight />
              </Link>
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
                      <span className="badge bg-light text-dark border">
                        {d.scheme}
                      </span>
                    </td>
                    <td className="text-end pe-4 fw-bold text-success">
                      + ₹{d.amount.toLocaleString()}
                    </td>
                  </tr>
                ))}
                {stats.recentDonations.length === 0 && (
                  <tr>
                    <td colSpan="4" className="text-center py-4 text-muted">
                      No recent donations found.
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </Card>
        </Col>

        <Col lg={4} md={12} xs={12} className="mb-3">
          {/* Quick Actions Card */}
          <Card className="shadow-sm border-0 mb-4">
            <Card.Header className="bg-white py-3">
              <h5 className="mb-0 text-maroon">Quick Actions</h5>
            </Card.Header>
            <Card.Body>
              <div className="d-grid gap-2">
                <Link
                  to="/dashboard/donations"
                  className="btn btn-outline-dark text-start"
                >
                  <FaHandHoldingHeart className="me-2" /> Add New Donation
                </Link>
                <Link
                  to="/dashboard/finance"
                  className="btn btn-outline-dark text-start"
                >
                  <FaRupeeSign className="me-2" /> Create Expense Voucher
                </Link>
                <Link
                  to="/dashboard/students"
                  className="btn btn-outline-dark text-start"
                >
                  <FaUserGraduate className="me-2" /> Admit Student
                </Link>
              </div>
            </Card.Body>
          </Card>

          {/* Alert Box for Pending Items */}
          {(stats.financials.pendingExpense > 0 ||
            stats.counts.lowStock > 0) && (
            <Card className="shadow-sm border-warning bg-light">
              <Card.Body>
                <h6 className="fw-bold text-dark mb-3">Attention Required</h6>

                {stats.financials.pendingExpense > 0 && (
                  <div className="mb-2 text-danger small">
                    <FaClock className="me-2" />
                    <strong>
                      ₹ {stats.financials.pendingExpense.toLocaleString()}
                    </strong>{" "}
                    in vouchers waiting for approval.
                  </div>
                )}

                {stats.counts.lowStock > 0 && (
                  <div className="text-warning small">
                    <FaExclamationTriangle className="me-2" />
                    <strong>{stats.counts.lowStock} items</strong> are running
                    low on stock.
                  </div>
                )}
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>
    </div>
  );
};

export default DashboardHome;
