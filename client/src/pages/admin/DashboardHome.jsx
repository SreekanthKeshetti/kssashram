/* eslint-disable react-hooks/immutability */
// import React from "react";
// import { Row, Col, Card } from "react-bootstrap";

// const DashboardHome = () => {
//   return (
//     <div>
//       <h2
//         className="mb-4 text-maroon"
//         style={{ fontFamily: "Playfair Display" }}
//       >
//         Dashboard Overview
//       </h2>

//       <Row>
//         {/* Card 1 */}
//         <Col md={3}>
//           <Card
//             className="p-3 mb-3 text-white shadow border-0"
//             style={{ backgroundColor: "#581818" }}
//           >
//             <div className="d-flex justify-content-between align-items-center">
//               <div>
//                 <h3 className="mb-0">150</h3>
//                 <small>Total Donors</small>
//               </div>
//               <div style={{ fontSize: "2rem", opacity: 0.5 }}>👥</div>
//             </div>
//           </Card>
//         </Col>

//         {/* Card 2 */}
//         <Col md={3}>
//           <Card
//             className="p-3 mb-3 text-white shadow border-0"
//             style={{ backgroundColor: "#D35400" }}
//           >
//             <div className="d-flex justify-content-between align-items-center">
//               <div>
//                 <h3 className="mb-0">₹ 1.2L</h3>
//                 <small>Donations (Month)</small>
//               </div>
//               <div style={{ fontSize: "2rem", opacity: 0.5 }}>💰</div>
//             </div>
//           </Card>
//         </Col>

//         {/* Card 3 */}
//         <Col md={3}>
//           <Card
//             className="p-3 mb-3 text-white shadow border-0"
//             style={{ backgroundColor: "#25D366" }}
//           >
//             <div className="d-flex justify-content-between align-items-center">
//               <div>
//                 <h3 className="mb-0">12</h3>
//                 <small>Pending Approvals</small>
//               </div>
//               <div style={{ fontSize: "2rem", opacity: 0.5 }}>📝</div>
//             </div>
//           </Card>
//         </Col>
//       </Row>
//     </div>
//   );
// };

// export default DashboardHome;

import React, { useEffect, useState } from "react";
import { Row, Col, Card, Table, Spinner, Alert } from "react-bootstrap";
import {
  FaRupeeSign,
  FaUserGraduate,
  FaExclamationTriangle,
  FaHandHoldingHeart,
  FaArrowRight,
} from "react-icons/fa";
import { Link } from "react-router-dom";
import axios from "axios";

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
      // Call the API to get REAL numbers
      const { data } = await axios.get(
        "http://localhost:5000/api/reports/stats",
        config
      );
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

      {/* --- Key Metrics Cards (Dynamic Data) --- */}
      <Row className="mb-4">
        {/* 1. TOTAL INCOME (Combined) */}
        <Col md={4}>
          <Card
            className="p-3 mb-3 text-white shadow border-0"
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

        {/* 2. KARUNYA SINDU INCOME */}
        <Col md={4}>
          <Card
            className="p-3 mb-3 text-white shadow border-0"
            style={{ background: "linear-gradient(45deg, #FF8008, #FFC837)" }}
          >
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h3 className="mb-0 fw-bold">
                  ₹ {stats.financials.incomeSindu?.toLocaleString() || 0}
                </h3>
                <small>Karunya Sindu</small>
              </div>
              <div style={{ fontSize: "2rem", opacity: 0.5 }}>
                <FaRupeeSign />
              </div>
            </div>
          </Card>
        </Col>

        {/* 3. KARUNYA BHARATHI INCOME */}
        <Col md={4}>
          <Card
            className="p-3 mb-3 text-white shadow border-0"
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

        {/* 2. Expenses */}
        <Col md={3}>
          <Card
            className="p-3 mb-3 text-white shadow border-0"
            style={{ background: "linear-gradient(45deg, #ff416c, #ff4b2b)" }}
          >
            <div className="d-flex justify-content-between align-items-center">
              <div>
                {/* Display Real Expenses */}
                <h3 className="mb-0 fw-bold">
                  ₹ {stats.financials.expense.toLocaleString()}
                </h3>
                <small>Total Expenses</small>
              </div>
              <div style={{ fontSize: "2rem", opacity: 0.5 }}>
                <FaRupeeSign />
              </div>
            </div>
          </Card>
        </Col>

        {/* 3. Active Students */}
        <Col md={3}>
          <Card
            className="p-3 mb-3 text-white shadow border-0"
            style={{ background: "linear-gradient(45deg, #2193b0, #6dd5ed)" }}
          >
            <div className="d-flex justify-content-between align-items-center">
              <div>
                {/* Display Real Student Count */}
                <h3 className="mb-0 fw-bold">{stats.counts.students}</h3>
                <small>Active Students</small>
              </div>
              <div style={{ fontSize: "2rem", opacity: 0.5 }}>
                <FaUserGraduate />
              </div>
            </div>
          </Card>
        </Col>

        {/* 4. Low Stock Alerts */}
        <Col md={3}>
          <Card
            className="p-3 mb-3 text-white shadow border-0"
            style={{ background: "linear-gradient(45deg, #f7971e, #ffd200)" }}
          >
            <div className="d-flex justify-content-between align-items-center">
              <div>
                {/* Display Real Low Stock Count */}
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
        <Col md={8}>
          <Card className="shadow-sm border-0">
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
                {/* Map through Real Recent Donations */}
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

        <Col md={4}>
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

          {/* System Health / Alerts */}
          {stats.counts.lowStock > 0 && (
            <Alert variant="warning">
              <FaExclamationTriangle className="me-2" />
              <strong>Attention Needed:</strong> {stats.counts.lowStock}{" "}
              inventory items are running low.
              <Link to="/dashboard/inventory" className="alert-link ms-1">
                Check Inventory
              </Link>
            </Alert>
          )}
        </Col>
      </Row>
    </div>
  );
};

export default DashboardHome;
