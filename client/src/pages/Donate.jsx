import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Card,
  InputGroup,
  Alert,
  Spinner,
} from "react-bootstrap";
import {
  FaHeart,
  FaRupeeSign,
  FaCheckCircle,
  FaLock,
  FaUniversity,
} from "react-icons/fa";
import axios from "axios";
import "./Donate.css";
import BASE_URL from "../../src/apiConfig";

const Donate = () => {
  const [amount, setAmount] = useState("");
  const [scheme, setScheme] = useState("Nitya Annadhana Nidhi");
  const [paymentMode, setPaymentMode] = useState("Online");

  const [donorDetails, setDonorDetails] = useState({
    donorName: "",
    donorPhone: "",
    donorEmail: "",
    donorPan: "",
    address: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [schemesList, setSchemesList] = useState([]);

  useEffect(() => {
    const fetchSchemes = async () => {
      try {
        const { data } = await axios.get(`${BASE_URL}/api/schemes`);
        setSchemesList(data);
        if (data.length > 0) {
          setScheme(data[0].name);
          if (data[0].defaultRate > 0) setAmount(data[0].defaultRate);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchSchemes();
  }, []);

  const amounts = [500, 1000, 2500, 5000, 10000, 25000];

  const handleChange = (e) => {
    setDonorDetails({ ...donorDetails, [e.target.name]: e.target.value });
  };

  const handleDonate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    if (!amount || !donorDetails.donorName || !donorDetails.donorPhone) {
      setMessage({
        type: "danger",
        text: "Please fill in all required fields (Name, Phone, Amount).",
      });
      setLoading(false);
      return;
    }

    try {
      const payload = {
        ...donorDetails,
        amount: Number(amount),
        scheme,
        paymentMode,
        paymentReference:
          paymentMode === "Online"
            ? "Razorpay_Simulated_ID"
            : "Bank_Transfer_Ref",
      };

      await axios.post(`${BASE_URL}/api/donations/public`, payload);

      setMessage({
        type: "success",
        text: "Thank you! Your donation has been recorded successfully. You will receive a receipt shortly.",
      });

      setAmount("");
      setDonorDetails({
        donorName: "",
        donorPhone: "",
        donorEmail: "",
        donorPan: "",
        address: "",
      });
    } catch (error) {
      setMessage({
        type: "danger",
        text:
          error.response?.data?.message || "Donation failed. Please try again.",
      });
    }
    setLoading(false);
  };

  return (
    <>
      <div className="donate-hero">
        <Container>
          <h1
            className="display-4 fw-bold"
            style={{ fontFamily: "Playfair Display" }}
          >
            Make a Donation
          </h1>
          <p className="lead opacity-75">
            Your contribution brings light to someone's life.
          </p>
        </Container>
      </div>

      <Container className="pb-5">
        {message.text && (
          <Alert variant={message.type} className="mb-4 text-center">
            {message.text}
          </Alert>
        )}

        <Form onSubmit={handleDonate}>
          <Row className="gy-4">
            <Col lg={7}>
              <Card className="border-0 shadow-sm p-4 h-100">
                <h3 className="donate-section-title">
                  1. Choose Donation Details
                </h3>

                <Form.Label className="fw-bold text-muted">
                  Select Cause (Scheme)
                </Form.Label>
                <select
                  className="scheme-select-box form-select"
                  value={scheme}
                  onChange={(e) => {
                    const val = e.target.value;
                    setScheme(val);
                    const selected = schemesList.find((s) => s.name === val);
                    if (selected && selected.defaultRate > 0) {
                      setAmount(selected.defaultRate);
                    }
                  }}
                >
                  {schemesList.map((s) => (
                    <option key={s._id} value={s.name}>
                      {s.name}
                    </option>
                  ))}
                </select>

                <Form.Label className="fw-bold text-muted mt-3">
                  Select Amount (₹)
                </Form.Label>
                <div className="amount-btn-grid">
                  {amounts.map((amt) => (
                    <button
                      type="button"
                      key={amt}
                      className={`amount-btn ${
                        Number(amount) === amt ? "active" : ""
                      }`}
                      onClick={() => setAmount(amt)}
                    >
                      ₹{amt.toLocaleString()}
                    </button>
                  ))}
                </div>

                <InputGroup className="mb-3">
                  <InputGroup.Text>
                    <FaRupeeSign />
                  </InputGroup.Text>
                  <Form.Control
                    type="number"
                    placeholder="Enter custom amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    style={{ fontSize: "1.2rem", fontWeight: "bold" }}
                  />
                </InputGroup>

                <h5 className="mt-4 mb-3 fw-bold text-secondary">
                  Payment Method
                </h5>

                <div
                  className={`payment-method-card ${
                    paymentMode === "Online" ? "active" : ""
                  }`}
                  onClick={() => setPaymentMode("Online")}
                >
                  <div className="d-flex align-items-center gap-3">
                    <div className="bg-light p-2 rounded">
                      <FaLock />
                    </div>
                    <div>
                      <strong>Online Payment</strong>
                      <div className="small text-muted">
                        Credit Card, Debit Card, UPI
                      </div>
                    </div>
                  </div>
                  <input
                    type="radio"
                    checked={paymentMode === "Online"}
                    readOnly
                  />
                </div>

                <div
                  className={`payment-method-card ${
                    paymentMode === "Bank Transfer" ? "active" : ""
                  }`}
                  onClick={() => setPaymentMode("Bank Transfer")}
                >
                  <div className="d-flex align-items-center gap-3">
                    <div className="bg-light p-2 rounded">
                      <FaUniversity />
                    </div>
                    <div>
                      <strong>Bank Transfer (NEFT/RTGS)</strong>
                      <div className="small text-muted">
                        Direct transfer to Ashram account
                      </div>
                    </div>
                  </div>
                  <input
                    type="radio"
                    checked={paymentMode === "Bank Transfer"}
                    readOnly
                  />
                </div>
              </Card>
            </Col>

            <Col lg={5}>
              <Card
                className="border-0 shadow-lg p-4 h-100"
                style={{ borderTop: "5px solid #581818" }}
              >
                <h3 className="donate-section-title">2. Donor Information</h3>

                <Row>
                  <Col md={12} className="mb-3">
                    <Form.Label>
                      Full Name <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="donorName"
                      value={donorDetails.donorName}
                      onChange={handleChange}
                      placeholder="As per PAN Card"
                      required
                    />
                  </Col>
                  <Col md={12} className="mb-3">
                    <Form.Label>
                      Mobile Number <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      type="tel"
                      name="donorPhone"
                      value={donorDetails.donorPhone}
                      onChange={handleChange}
                      placeholder="+91"
                      required
                    />
                  </Col>
                  <Col md={12} className="mb-3">
                    <Form.Label>Email Address</Form.Label>
                    <Form.Control
                      type="email"
                      name="donorEmail"
                      value={donorDetails.donorEmail}
                      onChange={handleChange}
                      placeholder="To receive receipt"
                    />
                  </Col>

                  <Col md={12} className="mb-3">
                    <Form.Label>PAN Number</Form.Label>
                    <Form.Control
                      type="text"
                      name="donorPan"
                      value={donorDetails.donorPan}
                      onChange={handleChange}
                      placeholder="Required for 80G Receipt"
                    />
                  </Col>

                  <Col md={12} className="mb-3">
                    <Form.Label>Address</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={2}
                      name="address"
                      value={donorDetails.address}
                      onChange={handleChange}
                      placeholder="Your communication address"
                    />
                  </Col>
                </Row>

                <div className="donation-summary mt-3 text-center">
                  <small className="text-muted text-uppercase ls-1">
                    Total Donation
                  </small>
                  <div className="total-amount-display">
                    ₹ {amount ? parseInt(amount).toLocaleString() : "0"}
                  </div>
                  <small className="text-muted">For: {scheme}</small>
                </div>

                <Button
                  type="submit"
                  className="btn-ashram w-100 py-3 mt-4 text-uppercase fw-bold"
                  style={{ fontSize: "1.1rem" }}
                  disabled={loading}
                >
                  {loading ? (
                    <Spinner animation="border" size="sm" />
                  ) : (
                    <>
                      Proceed to Pay <FaHeart className="ms-2" />
                    </>
                  )}
                </Button>

                <div className="text-center mt-3">
                  <small className="text-muted">
                    <FaLock size={12} /> Secure 256-bit SSL encrypted payment
                  </small>
                </div>
              </Card>
            </Col>
          </Row>
        </Form>

        {paymentMode === "Bank Transfer" && (
          <Row className="mt-5 justify-content-center">
            <Col md={8}>
              <Card className="p-4 border-warning bg-light text-center">
                <h4 className="text-maroon mb-3">Bank Account Details</h4>
                <p className="mb-1">
                  <strong>Account Name:</strong> Karunasri Seva Samithi
                </p>
                <p className="mb-1">
                  <strong>Account Number:</strong> 992200300000312
                </p>
                <p className="mb-1">
                  <strong>Bank:</strong> Telangana State Co-operative Apex Bank
                </p>
                <p className="mb-1">
                  <strong>IFSC Code:</strong> TSAB0000122
                </p>
                <p className="mb-0">
                  <strong>Branch:</strong> Champapet
                </p>
                <hr />
                <small className="text-danger">
                  After transfer, please click "Proceed to Pay" to record your
                  donation.
                </small>
              </Card>
            </Col>
          </Row>
        )}
      </Container>
    </>
  );
};

export default Donate;
