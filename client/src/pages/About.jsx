import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import { FaHandHoldingHeart, FaDove, FaUniversity } from "react-icons/fa";
import "./About.css";
// --- IMPORT THE LOCAL IMAGE ---
import ashramImg from "../assets/karunasri.jpg";
import ashramImg2 from "../assets/image2.jpg";

const About = () => {
  return (
    <>
      {/* 1. Divine Hero Section */}
      <div className="page-hero">
        <div>
          <h1 className="page-title">About Us</h1>
          <p className="lead text-white-50">
            Serving Humanity through Sanatana Dharma
          </p>
        </div>
      </div>
      {/* 2. Our Journey (Image Left, Text Right) */}
      <section className="about-section">
        <Container>
          <Row className="align-items-center">
            <Col lg={6} className="mb-4 mb-lg-0">
              <div className="img-frame">
                <img
                  src={ashramImg2}
                  alt="Ashram Journey"
                  className="about-img"
                />
              </div>
            </Col>
            <Col lg={6} className="ps-lg-5">
              <h2 className="section-heading">Our Sacred Journey</h2>
              <p className="text-content">
                Karunasri Seva Samithi was established with a singular vision:
                to see God in every living being. Guided by the principle of
                <strong> "Manava Sevaye Madhava Seva"</strong> (Service to Man
                is Service to God), we strive to uplift the underprivileged
                through compassion and action.
              </p>
              <p className="text-content">
                What began as a small initiative to provide meals has grown into
                a multi-faceted movement covering education (Vidyarthi Nidhi),
                spiritual growth, and community support.
              </p>
            </Col>
          </Row>
        </Container>
      </section>
      {/* 3. Mission, Vision, Values (Cards) */}
      <section className="about-section about-bg-cream">
        <Container>
          <Row>
            <Col md={4} className="mb-4">
              <div className="mission-card">
                <FaHandHoldingHeart className="mission-icon" />
                <h3 className="mission-title">Our Mission</h3>
                <p className="text-muted">
                  To provide free education, nutritious food, and shelter to
                  children and individuals from marginalized backgrounds.
                </p>
              </div>
            </Col>
            <Col md={4} className="mb-4">
              <div className="mission-card">
                <FaDove className="mission-icon" />
                <h3 className="mission-title">Our Vision</h3>
                <p className="text-muted">
                  To build a society rooted in dharma, where every individual
                  lives with dignity, knowledge, and self-reliance.
                </p>
              </div>
            </Col>
            <Col md={4} className="mb-4">
              <div className="mission-card">
                <FaUniversity className="mission-icon" />
                <h3 className="mission-title">Our Values</h3>
                <p className="text-muted">
                  Transparency in every donation, integrity in our actions, and
                  unconditional love for those we serve.
                </p>
              </div>
            </Col>
          </Row>
        </Container>
      </section>
      {/* 4. Words of Inspiration (Image Right, Text Left) */}
      <section className="about-section">
        <Container>
          <Row className="align-items-center">
            <Col lg={7}>
              <h2 className="section-heading">Words of Inspiration</h2>
              <blockquote className="blockquote mt-3">
                <p
                  className="fst-italic text-muted"
                  style={{ fontSize: "1.2rem" }}
                >
                  "We want that education by which character is formed, strength
                  of mind is increased, the intellect is expanded, and by which
                  one can stand on one's own feet."
                </p>
                <footer className="blockquote-footer mt-2 text-warning">
                  Inspiration for our Vidyarthi Nidhi Scheme
                </footer>
              </blockquote>
              <p className="text-content mt-4">
                Our Trust follows the path of selfless service, believing that
                knowledge and character are the greatest tools for
                transformation. Every project we undertake is a step toward
                building a brighter future for our students and the community.
              </p>
            </Col>
            <Col lg={5} className="mt-4 mt-lg-0">
              <div className="img-frame">
                <img src={ashramImg} alt="Inspiration" className="about-img" />
              </div>
            </Col>
          </Row>
        </Container>
      </section>
      {/* 6. Branches / Legal Info */}{" "}
      <section className="py-5 bg-light text-center border-top">
        {" "}
        <Container>
          {" "}
          <h4 style={{ fontFamily: "Playfair Display", color: "#581818" }}>
            Registered Trust Branches{" "}
          </h4>{" "}
          <p className="text-muted mb-4">
            We currently operate across multiple locations to serve more
            people.{" "}
          </p>{" "}
          <Row className="justify-content-center">
            {" "}
            <Col md={3} className="mb-3">
              {" "}
              <div className="p-3 bg-white border rounded">
                <h6 className="fw-bold text-dark">Hyderabad (HQ)</h6>
                <small>Saroornagar</small>{" "}
              </div>{" "}
            </Col>{" "}
            <Col md={3} className="mb-3">
              {" "}
              <div className="p-3 bg-white border rounded">
                <h6 className="fw-bold text-dark">Warangal</h6>
                <small>Hanamkonda</small>{" "}
              </div>{" "}
            </Col>{" "}
            <Col md={3} className="mb-3">
              {" "}
              <div className="p-3 bg-white border rounded">
                <h6 className="fw-bold text-dark">Vijayawada</h6>
                <small>Benz Circle</small>{" "}
              </div>{" "}
            </Col>{" "}
          </Row>{" "}
          <div className="mt-4">
            {" "}
            <small className="text-muted">
              Registered under Trust Act. 80G & 12A Exempted.{" "}
            </small>{" "}
          </div>{" "}
        </Container>{" "}
      </section>
    </>
  );
};

export default About;
