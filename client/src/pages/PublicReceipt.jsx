/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import BASE_URL from "../apiConfig";
import {
  Container,
  Card,
  Row,
  Col,
  Button,
  Spinner,
  Alert,
} from "react-bootstrap";
import {
  FaCheckCircle,
  FaFilePdf,
  FaHeart,
  FaHome,
  FaDownload,
  FaBuilding,
  FaCalendarAlt,
} from "react-icons/fa";
import logo from "../assets/logo.jpg";

const PublicReceipt = () => {
  const { id } = useParams();
  const [donation, setDonation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [downloadTriggered, setDownloadTriggered] = useState(false);

  useEffect(() => {
    fetchDonationDetails();
  }, [id]);

  const fetchDonationDetails = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(
        `${BASE_URL}/api/donations/public/info/${id}`,
      );
      setDonation(data);
      setLoading(false);

      // Auto-trigger PDF download smoothly after 1.2 seconds so the donor sees the page first!
      setTimeout(() => {
        triggerDownload();
      }, 1200);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
          "Donation record not found. Please contact the Ashram office.",
      );
      setLoading(false);
    }
  };

  const triggerDownload = () => {
    setDownloadTriggered(true);
    // Point directly to our public PDF download stream
    window.location.href = `${BASE_URL}/api/donations/public/receipt/${id}`;
  };

  if (loading) {
    return (
      <Container className="py-5 text-center" style={{ minHeight: "70vh" }}>
        <div className="py-5">
          <Spinner
            animation="border"
            variant="danger"
            style={{ width: "3.5rem", height: "3.5rem" }}
          />
          <h4
            className="mt-4 text-maroon"
            style={{ fontFamily: "Playfair Display" }}
          >
            Connecting to Karunasri Seva Samithi...
          </h4>
          <p className="text-muted">
            Fetching your official 80G tax receipt...
          </p>
        </div>
      </Container>
    );
  }

  if (error || !donation) {
    return (
      <Container className="py-5" style={{ minHeight: "70vh" }}>
        <Row className="justify-content-center">
          <Col md={7}>
            <Card className="shadow-lg border-0 text-center p-4">
              <Alert variant="danger">
                {error || "Unable to find this donation receipt."}
              </Alert>
              <p className="text-muted">
                If you believe this is an error, please call Ashram Office: +91
                9000889785
              </p>
              <Button as={Link} to="/" variant="dark" className="mt-3">
                <FaHome className="me-2" /> Back to Home
              </Button>
            </Card>
          </Col>
        </Row>
      </Container>
    );
  }

  return (
    <Container className="py-5" style={{ minHeight: "80vh" }}>
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card
            className="shadow-lg border-0 overflow-hidden"
            style={{ borderRadius: "15px" }}
          >
            {/* Top Ashram Header */}
            <div
              className="p-4 text-center text-white"
              style={{
                background: "linear-gradient(135deg, #581818, #800000)",
              }}
            >
              <img
                src={logo}
                alt="Karunasri Logo"
                width="75"
                height="75"
                className="rounded-circle shadow-sm mb-3 bg-white p-1"
                style={{ objectFit: "contain" }}
              />
              <h3
                className="m-0 fw-bold"
                style={{ fontFamily: "Playfair Display", letterSpacing: "1px" }}
              >
                KARUNASRI SEVA SAMITHI
              </h3>
              <small
                className="opacity-75 text-uppercase"
                style={{ letterSpacing: "2px" }}
              >
                Manava Sevaye Madhava Seva
              </small>
            </div>

            <Card.Body className="p-4 text-center">
              {/* Thank you note */}
              <div className="mb-4">
                <h4
                  className="text-maroon fw-bold"
                  style={{ fontFamily: "Playfair Display" }}
                >
                  Namaste Sri {donation.donorName} garu!
                </h4>
                <p className="text-muted">
                  We express our heartfelt gratitude for your noble contribution
                  in service of our Ashram students and residents.
                </p>
              </div>

              {/* Receipt Highlights Box */}
              <div className="bg-light p-3 rounded mb-4 text-start border border-dashed">
                <Row className="g-2">
                  <Col xs={6}>
                    <small className="text-muted text-uppercase d-block fw-bold">
                      Receipt Number
                    </small>
                    <span className="fw-bold text-dark">
                      {donation.receiptNo || "KSS-NEW"}
                    </span>
                  </Col>
                  <Col xs={6}>
                    <small className="text-muted text-uppercase d-block fw-bold">
                      Date of Donation
                    </small>
                    <span className="text-dark">
                      <FaCalendarAlt className="me-1 text-muted" />
                      {new Date(donation.createdAt).toLocaleDateString()}
                    </span>
                  </Col>
                  <Col xs={12} className="border-top pt-2 mt-2">
                    <small className="text-muted text-uppercase d-block fw-bold">
                      Donation Scheme
                    </small>
                    <span className="text-dark fw-bold">{donation.scheme}</span>
                    {donation.occasion && (
                      <small className="d-block text-muted fst-italic">
                        Occasion: {donation.occasion}
                      </small>
                    )}
                  </Col>
                  <Col xs={12} className="border-top pt-2 mt-2">
                    <small className="text-muted text-uppercase d-block fw-bold">
                      Branch
                    </small>
                    <span className="text-dark">
                      <FaBuilding className="me-1 text-muted" />
                      {donation.branch}
                    </span>
                  </Col>
                </Row>
              </div>

              {/* Big Amount Card */}
              <div className="py-2 mb-4">
                <small className="text-muted text-uppercase fw-bold">
                  Amount Contributed
                </small>
                <h1
                  className="fw-bold text-success m-0"
                  style={{ fontFamily: "Playfair Display" }}
                >
                  ₹ {donation.amount.toLocaleString()}/-
                </h1>
                <small className="text-muted fst-italic">
                  Eligible for 80G Tax Exemption Benefit
                </small>
              </div>

              {/* Download Button & Indicator */}
              <div className="d-grid gap-2 mb-3">
                <Button
                  variant="success"
                  size="lg"
                  className="py-3 shadow-sm fw-bold text-uppercase"
                  onClick={triggerDownload}
                  style={{ letterSpacing: "1px" }}
                >
                  <FaDownload className="me-2" /> Download 80G Receipt (PDF)
                </Button>
              </div>

              {downloadTriggered && (
                <div className="text-success small mb-4 d-flex align-items-center justify-content-center">
                  <FaCheckCircle className="me-2" />
                  <span>
                    Download initiated! If it didn't start, please tap the
                    button above.
                  </span>
                </div>
              )}

              <hr />

              {/* Helpful footer links */}
              <div className="d-flex justify-content-between align-items-center mt-3">
                <Button as={Link} to="/" variant="outline-dark" size="sm">
                  <FaHome className="me-1" /> Ashram Website
                </Button>
                <Button
                  as={Link}
                  to="/donate"
                  variant="outline-danger"
                  size="sm"
                >
                  <FaHeart className="me-1" /> Make Another Seva
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default PublicReceipt;
