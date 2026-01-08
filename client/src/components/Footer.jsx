import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import { Link } from "react-router-dom";
import {
  FaPhoneAlt,
  FaEnvelope,
  FaMapMarkerAlt,
  FaFacebookF,
  FaTwitter,
  FaYoutube,
  FaInstagram,
  FaCcVisa,
  FaCcMastercard,
  FaUniversity,
  FaChevronRight,
} from "react-icons/fa";
import "./Footer.css";

const Footer = () => {
  return (
    <footer className="footer-section">
      <Container>
        <Row className="gy-5">
          {/* Column 1: Brand, Address, QR */}
          <Col lg={4} md={6}>
            <div className="footer-brand">Karunasri Seva Samithi</div>
            <div className="footer-address">
              <p className="mb-2"> 17-1-474, Krishna Nagar Colony,</p>
              <p className="mb-2">Saidabad,</p>
              <p className="mb-0">Hyderabad, Telangana - 500 060</p>
            </div>

            <div className="footer-qr-box">
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/d/d0/QR_code_for_mobile_English_Wikipedia.svg"
                alt="Scan to Donate"
                className="footer-qr-img"
              />
              <span className="qr-label">Scan to Donate</span>
            </div>
          </Col>

          {/* Column 2: Quick Links */}
          <Col lg={4} md={6}>
            <h5 className="footer-heading">Quick Links</h5>
            <ul className="footer-links">
              <li>
                <Link to="/">
                  <FaChevronRight size={12} className="me-2 text-warning" />{" "}
                  Home
                </Link>
              </li>
              <li>
                <Link to="/about">
                  <FaChevronRight size={12} className="me-2 text-warning" />{" "}
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/activities">
                  <FaChevronRight size={12} className="me-2 text-warning" /> Our
                  Activities
                </Link>
              </li>
              <li>
                <Link to="/donate">
                  <FaChevronRight size={12} className="me-2 text-warning" />{" "}
                  Donate Now
                </Link>
              </li>
              <li>
                <Link to="/gallery">
                  <FaChevronRight size={12} className="me-2 text-warning" />{" "}
                  Gallery
                </Link>
              </li>
              <li>
                <Link to="/contact">
                  <FaChevronRight size={12} className="me-2 text-warning" />{" "}
                  Contact Us
                </Link>
              </li>
            </ul>
          </Col>

          {/* Column 3: Contact Info */}
          <Col lg={4} md={12}>
            <h5 className="footer-heading">Get In Touch</h5>

            <div className="contact-item">
              <FaMapMarkerAlt className="contact-icon" />
              <div>
                <strong>Head Office:</strong>
                <br />
                17-1-474, Krishna Nagar Colony, Saidabad.
              </div>
            </div>

            <div className="contact-item">
              <FaPhoneAlt className="contact-icon" />
              <div>
                <strong>Phone:</strong>
                <br />
                +91 123456789
              </div>
            </div>

            <div className="contact-item">
              <FaEnvelope className="contact-icon" />
              <div>
                <strong>Email:</strong>
                <br />
                info@karunasri.org
              </div>
            </div>
          </Col>
        </Row>

        {/* Social Media Row */}
        <div className="social-row">
          <a href="#" className="social-icon-btn">
            <FaFacebookF />
          </a>
          <a href="#" className="social-icon-btn">
            <FaTwitter />
          </a>
          <a href="#" className="social-icon-btn">
            <FaYoutube />
          </a>
          <a href="#" className="social-icon-btn">
            <FaInstagram />
          </a>
        </div>

        {/* Payment Row */}
        <div className="payment-row">
          <span className="payment-label">Secure Donation Partners</span>
          <div className="payment-icons">
            <FaCcVisa className="pay-icon" title="Visa" />
            <FaCcMastercard className="pay-icon" title="Mastercard" />
            <FaUniversity className="pay-icon" title="Net Banking" />

            {/* Payment Images with white background for visibility */}
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/e/e1/UPI-Logo-vector.svg"
              alt="UPI"
              className="pay-img"
            />
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/c/cb/Rupay-Logo.png"
              alt="RuPay"
              className="pay-img"
            />
          </div>
        </div>

        {/* Copyright */}
        <div className="copyright-text">
          <p className="mb-0">
            &copy; {new Date().getFullYear()} Karunasri Seva Samithi. All Rights
            Reserved.
            <span className="mx-2">|</span>
            <Link to="/privacy">Privacy Policy</Link>
          </p>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;
