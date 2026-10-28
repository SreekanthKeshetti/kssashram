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
  FaClock,
  FaTasks,
  FaUserTie,
  FaFileInvoiceDollar,
  FaChevronRight,
} from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";

const DashboardHome = () => {
  const navigate = useNavigate();
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

  // Helper Component for Action Cards
  const ActionCard = ({ title, count, link, icon, color }) => (
    <Col md={4} className="mb-3">
      <Card
        className="shadow-sm border-0 h-100 action-card-hover"
        onClick={() => navigate(link)}
        style={{ cursor: "pointer", borderLeft: `5px solid ${color}` }}
      >
        <Card.Body className="d-flex align-items-center justify-content-between">
          <div>
            <h6 className="text-muted text-uppercase small fw-bold mb-1">
              {title}
            </h6>
            <h4 className="m-0 fw-bold" style={{ color: color }}>
              {count} Pending
            </h4>
            <div className="small text-muted mt-1">
              Click to Review <FaChevronRight size={10} />
            </div>
          </div>
          <div
            className="p-3 rounded-circle"
            style={{ backgroundColor: `${color}20`, color: color }}
          >
            {icon}
          </div>
        </Card.Body>
      </Card>
    </Col>
  );

  // 1. Loading State
  if (loading)
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
      </div>
    );

  // 2. Error State
  if (error) return <Alert variant="danger">{error}</Alert>;

  // 3. DEFINE VARIABLES (Critical Step - Must be before return)
  // Check if myActions exists in stats to avoid crashes if backend didn't send it
  const actions = stats.myActions || { students: 0, members: 0, vouchers: 0 };

  // Calculate if we should show the section
  const hasActions =
    actions.students > 0 || actions.members > 0 || actions.vouchers > 0;

  // 4. Render
  return (
    <div>
      {/* --- Welcome Section --- */}
      <div className="mb-4 d-flex justify-content-between align-items-end">
        <div>
          <h2
            className="text-maroon"
            style={{ fontFamily: "Playfair Display" }}
          >
            Welcome back, {user?.name.split(" ")[0]}!
          </h2>
          <p className="text-muted m-0">
            Overview of Ashram activities & pending tasks.
          </p>
        </div>
        <div className="d-none d-md-block">
          <span className="badge bg-light text-dark border p-2">
            {new Date().toLocaleDateString("en-IN", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
        </div>
      </div>

      {/* --- ACTION CENTER (Dynamic Row) --- */}
      {hasActions && (
        <div className="mb-4 fade-in">
          <h5 className="text-maroon mb-3">
            <FaTasks className="me-2" /> Action Center (My Tasks)
          </h5>
          <Row>
            {actions.students > 0 && (
              <ActionCard
                title="Student Admissions"
                count={actions.students}
                link="/dashboard/students"
                icon={<FaUserGraduate size={24} />}
                color="#d35400"
              />
            )}
            {actions.members > 0 && (
              <ActionCard
                title="Membership Requests"
                count={actions.members}
                link="/dashboard/members"
                icon={<FaUserTie size={24} />}
                color="#2980b9"
              />
            )}
            {actions.vouchers > 0 && (
              <ActionCard
                title="Voucher Approvals"
                count={actions.vouchers}
                link="/dashboard/finance"
                icon={<FaFileInvoiceDollar size={24} />}
                color="#c0392b"
              />
            )}
          </Row>
        </div>
      )}

      {/* --- ROW 1: INCOME METRICS --- */}
      <h5 className="text-muted small fw-bold text-uppercase mb-3">
        Financial Overview
      </h5>
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
        {/* 1. APPROVED EXPENSES */}
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

        {/* 2. PENDING EXPENSES - CLICKABLE */}
        <Col lg={3} md={6} xs={12} className="mb-3">
          <Card
            className="p-3 text-white shadow border-0 h-100 action-card-hover"
            style={{
              background: "linear-gradient(45deg, #f09819, #edde5d)",
              cursor: "pointer",
            }}
            onClick={() =>
              navigate("/dashboard/finance", { state: { filter: "Pending" } })
            }
            title="Click to view pending vouchers"
          >
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h3 className="mb-0 fw-bold">
                  ₹ {stats.financials.pendingExpense?.toLocaleString() || 0}
                </h3>
                <small>Pending Approval ➜</small>
              </div>
              <div style={{ fontSize: "2rem", opacity: 0.5 }}>
                <FaClock />
              </div>
            </div>
          </Card>
        </Col>

        {/* 3. ACTIVE STUDENTS */}
        <Col lg={3} md={6} xs={12} className="mb-3">
          <Card
            className="p-3 text-white shadow border-0 h-100 action-card-hover"
            style={{
              background: "linear-gradient(45deg, #2193b0, #6dd5ed)",
              cursor: "pointer",
            }}
            onClick={() => navigate("/dashboard/students")}
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

        {/* 4. LOW STOCK ALERTS */}
        <Col lg={3} md={6} xs={12} className="mb-3">
          <Card
            className="p-3 text-white shadow border-0 h-100 action-card-hover"
            style={{
              background: "linear-gradient(45deg, #f7971e, #ffd200)",
              cursor: "pointer",
            }}
            onClick={() => navigate("/dashboard/inventory")}
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
              <h5 className="mb-0 text-maroon">Quick Links</h5>
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
        </Col>
      </Row>
      <style>
        {`
          .action-card-hover:hover {
            transform: translateY(-3px);
            transition: all 0.2s ease-in-out;
          }
        `}
      </style>
    </div>
  );
};

export default DashboardHome;
