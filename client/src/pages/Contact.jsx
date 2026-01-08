import React, { useState } from "react";
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Card,
  Alert,
} from "react-bootstrap";
import { FaPhoneAlt, FaEnvelope, FaMapMarkerAlt } from "react-icons/fa";
import axios from "axios"; // Make sure you installed axios
import "./Contact.css";
import BASE_URL from "../apiConfig";

const Contact = () => {
  // State for form fields
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    subject: "General Inquiry",
    message: "",
  });

  const [status, setStatus] = useState({ type: "", msg: "" });

  // Handle Input Change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle Form Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: "", msg: "" });

    try {
      // Connect to your backend API
      const res = await axios.post(`${BASE_URL}/api/contact`, formData);

      setStatus({ type: "success", msg: res.data.message });
      // Reset form
      setFormData({
        name: "",
        phone: "",
        email: "",
        subject: "General Inquiry",
        message: "",
      });
    } catch (err) {
      setStatus({
        type: "danger",
        msg:
          err.response?.data?.message ||
          "Something went wrong. Please try again.",
      });
    }
  };

  return (
    <>
      <div className="contact-hero">
        <div>
          <h1
            className="display-3 fw-bold"
            style={{ fontFamily: "Playfair Display" }}
          >
            Contact Us
          </h1>
          <p className="lead">We are here to help and serve</p>
        </div>
      </div>

      <Container className="py-5">
        <Row className="gy-5">
          {/* Left: Contact Info */}
          <Col lg={5}>
            <h2
              className="mb-4"
              style={{ fontFamily: "Playfair Display", color: "#581818" }}
            >
              Get In Touch
            </h2>
            <p className="text-muted mb-5">
              Have questions about our schemes or want to visit the Ashram?
              Reach out to us.
            </p>

            <div className="d-flex mb-4">
              <div className="contact-box-icon flex-shrink-0">
                <FaMapMarkerAlt />
              </div>
              <div className="ms-3">
                <h5 className="fw-bold">Our Location</h5>
                <p className="text-muted">
                  Karunasri Seva Samithi / Karunya Sindhu 17-1-474, Krishna
                  Nagar Colony, Saidabad, Hyderabad-500 060 Telangana State
                </p>
              </div>
            </div>

            <div className="d-flex mb-4">
              <div className="contact-box-icon flex-shrink-0">
                <FaPhoneAlt />
              </div>
              <div className="ms-3">
                <h5 className="fw-bold">Phone Number</h5>
                <p className="text-muted mb-0">+91 1234567890</p>
                <p className="text-muted">+91 12 3456 7890</p>
              </div>
            </div>

            <div className="d-flex mb-4">
              <div className="contact-box-icon flex-shrink-0">
                <FaEnvelope />
              </div>
              <div className="ms-3">
                <h5 className="fw-bold">Email Address</h5>
                <p className="text-muted">info@karunasri.org</p>
              </div>
            </div>
          </Col>

          <Col lg={7}>
            <Card className="border-0 shadow-lg p-4">
              <h3 className="mb-4">Send a Message</h3>

              {/* Show Success/Error Alert */}
              {status.msg && <Alert variant={status.type}>{status.msg}</Alert>}

              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md={6} className="mb-3">
                    <Form.Label>Your Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="form-control-ashram"
                    />
                  </Col>
                  <Col md={6} className="mb-3">
                    <Form.Label>Phone Number</Form.Label>
                    <Form.Control
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      className="form-control-ashram"
                    />
                  </Col>
                </Row>
                <div className="mb-3">
                  <Form.Label>Email Address</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="form-control-ashram"
                  />
                </div>
                <div className="mb-3">
                  <Form.Label>Subject</Form.Label>
                  <Form.Select
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="form-control-ashram"
                  >
                    <option>General Inquiry</option>
                    <option>Donation Related</option>
                    <option>Volunteering</option>
                    <option>Student Admission</option>
                  </Form.Select>
                </div>
                <div className="mb-4">
                  <Form.Label>Message</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    className="form-control-ashram"
                  />
                </div>
                <Button type="submit" className="btn-ashram w-100 py-2">
                  Send Message
                </Button>
              </Form>
            </Card>
          </Col>
        </Row>

        {/* Map Section */}
        <Row className="mt-5 pt-4">
          <Col>
            <div
              className="rounded overflow-hidden shadow-sm"
              style={{ height: "400px" }}
            >
              <iframe
                title="Google Map"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3807.953931677399!2d78.50604131435277!3d17.36581198809159!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bcb9850c9b0e3e9%3A0x6b80862100690000!2sKarunasri%20Seva%20Samithi!5e0!3m2!1sen!2sin"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
              ></iframe>
            </div>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default Contact;
