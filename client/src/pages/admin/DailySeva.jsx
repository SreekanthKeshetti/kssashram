import React, { useEffect, useState } from "react";
import {
  Card,
  Row,
  Col,
  Form,
  Button,
  Alert,
  Spinner,
  Badge,
} from "react-bootstrap";
import {
  FaCalendarAlt,
  FaBirthdayCake,
  FaPray,
  FaPrint,
  FaRing,
  FaHandHoldingHeart,
} from "react-icons/fa";
import axios from "axios";

const DailySeva = () => {
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]); // Default Today
  const [sevas, setSevas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSevaList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date]);

  const fetchSevaList = async () => {
    try {
      setLoading(true);
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

      const { data } = await axios.get(
        `http://localhost:5000/api/donations/daily-seva?date=${date}`,
        config
      );
      setSevas(data);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  // Helper to get Icon and Color based on Occasion
  const getOccasionStyle = (occasion) => {
    const occ = occasion ? occasion.toLowerCase() : "";
    if (occ.includes("birthday"))
      return {
        icon: <FaBirthdayCake />,
        color: "success",
        text: "Happy Birthday",
      };
    if (occ.includes("death") || occ.includes("memory"))
      return { icon: <FaPray />, color: "secondary", text: "In Loving Memory" };
    if (occ.includes("marriage") || occ.includes("anniversary"))
      return { icon: <FaRing />, color: "info", text: "Happy Anniversary" };
    return {
      icon: <FaHandHoldingHeart />,
      color: "primary",
      text: "Special Seva",
    };
  };

  return (
    <div className="daily-seva-container">
      {/* Header & Controls */}
      <Row className="mb-4 align-items-end d-print-none">
        <Col md={8}>
          <h2
            className="text-maroon"
            style={{ fontFamily: "Playfair Display" }}
          >
            Daily Seva Schedule (Nitya Annadhana)
          </h2>
          <p className="text-muted">
            List of donors for prayers and wishes today.
          </p>
        </Col>
        <Col md={4} className="d-flex gap-2">
          <Form.Control
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="fw-bold border-maroon"
          />
          <Button variant="dark" onClick={() => window.print()}>
            <FaPrint /> Print
          </Button>
        </Col>
      </Row>

      {/* --- PRINTABLE SECTION --- */}
      <div className="printable-area">
        <div className="text-center mb-4 d-none d-print-block">
          <h3>KARUNASRI SEVA SAMITHI</h3>
          <h5>Daily Seva List - {new Date(date).toLocaleDateString()}</h5>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" />
          </div>
        ) : sevas.length === 0 ? (
          <Alert variant="light" className="text-center py-5 border shadow-sm">
            <h5 className="text-muted">
              No specific Sevas scheduled for this date.
            </h5>
            <p>Standard Ashram prayers will continue.</p>
          </Alert>
        ) : (
          <Row>
            {sevas.map((seva) => {
              const style = getOccasionStyle(seva.occasion);
              return (
                <Col md={6} lg={4} key={seva._id} className="mb-4">
                  <Card
                    className={`h-100 border-${style.color} shadow-sm seva-card`}
                  >
                    <Card.Header
                      className={`bg-${style.color} text-white fw-bold d-flex justify-content-between align-items-center`}
                    >
                      <span>
                        {style.icon} {style.text}
                      </span>
                      <small>{seva.branch}</small>
                    </Card.Header>
                    <Card.Body className="text-center">
                      {/* Who is it for? */}
                      <h4
                        className="text-maroon mb-1"
                        style={{ fontFamily: "Playfair Display" }}
                      >
                        {seva.inNameOf || seva.donorName}
                      </h4>
                      <p className="text-muted small mb-3">
                        ({seva.occasion || "General Donation"})
                      </p>

                      <hr />

                      {/* Who Donated? */}
                      <p className="mb-0 text-muted small">Sponsored By:</p>
                      <h6 className="fw-bold">{seva.donorName}</h6>
                      <p className="mb-0 small">{seva.donorPhone}</p>

                      {/* Scheme */}
                      <div className="mt-3">
                        <Badge bg="light" text="dark" className="border">
                          {seva.scheme}
                        </Badge>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              );
            })}
          </Row>
        )}
      </div>

      <style>
        {`
          @media print {
            .d-print-none { display: none !important; }
            .d-print-block { display: block !important; }
            .dashboard-container { margin: 0; padding: 0; }
            .sidebar { display: none; }
            .main-content { margin-left: 0; width: 100%; }
            .seva-card { border: 1px solid #ccc !important; box-shadow: none !important; page-break-inside: avoid; }
          }
        `}
      </style>
    </div>
  );
};

export default DailySeva;
