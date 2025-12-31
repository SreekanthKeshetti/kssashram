import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import { FaHandHoldingHeart, FaDove, FaUniversity } from "react-icons/fa";
import "./About.css";

const About = () => {
  return (
    <>
      {/* 1. Page Hero */}
      <div className="page-hero">
        <div>
          <h1 className="page-title">About Us</h1>
          <p className="lead text-white-50">Serving Humanity since 2010</p>
        </div>
      </div>

      {/* 2. Our Story (Image Left, Text Right) */}
      <section className="about-section">
        <Container>
          <Row className="align-items-center">
            <Col lg={6} className="mb-4 mb-lg-0">
              <div className="position-relative">
                <img
                  src="https://images.unsplash.com/photo-1516216628259-22b512b91873?w=800&auto=format&fit=crop"
                  alt="Ashram Activities"
                  className="img-fluid rounded shadow-lg"
                  style={{ border: "10px solid white" }}
                />
                {/* Decorative Box behind image */}
                <div
                  style={{
                    position: "absolute",
                    top: "-20px",
                    left: "-20px",
                    width: "100%",
                    height: "100%",
                    border: "2px solid #D35400",
                    zIndex: -1,
                    borderRadius: "4px",
                  }}
                ></div>
              </div>
            </Col>
            <Col lg={6} className="ps-lg-5">
              <h2 className="section-heading">Our Sacred Journey</h2>
              <p className="text-content">
                Karunasri Seva Samithi was established with a singular vision:
                to see God in every living being. What started as a small
                initiative to feed 10 people a day has now grown into a massive
                movement of compassion.
              </p>
              <p className="text-content">
                Guided by the principles of Sanatana Dharma, our Ashram provides
                shelter to the homeless, education to underprivileged children
                (Vidyarthi Nidhi), and protects our sacred cows (Go-Seva). We
                believe that <em>"Manava Sevaye Madhava Seva"</em> (Service to
                Man is Service to God).
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
                  To eradicate hunger and illiteracy by providing free food,
                  education, and shelter to the most vulnerable sections of
                  society.
                </p>
              </div>
            </Col>
            <Col md={4} className="mb-4">
              <div className="mission-card">
                <FaDove className="mission-icon" />
                <h3 className="mission-title">Our Vision</h3>
                <p className="text-muted">
                  A society where compassion rules, where no child goes to sleep
                  hungry, and where every individual lives with dignity.
                </p>
              </div>
            </Col>
            <Col md={4} className="mb-4">
              <div className="mission-card">
                <FaUniversity className="mission-icon" />
                <h3 className="mission-title">Our Values</h3>
                <p className="text-muted">
                  Integrity, Compassion, Transparency, and Selfless Service are
                  the four pillars that uphold our organization.
                </p>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* 4. Impact Statistics */}
      <div className="stats-strip">
        <Container>
          <Row>
            <Col md={3} xs={6} className="mb-4 mb-md-0">
              <div className="stat-number">15+</div>
              <div className="stat-label">Years of Service</div>
            </Col>
            <Col md={3} xs={6} className="mb-4 mb-md-0">
              <div className="stat-number">2M+</div>
              <div className="stat-label">Meals Served</div>
            </Col>
            <Col md={3} xs={6}>
              <div className="stat-number">500+</div>
              <div className="stat-label">Students Educated</div>
            </Col>
            <Col md={3} xs={6}>
              <div className="stat-number">3</div>
              <div className="stat-label">Active Branches</div>
            </Col>
          </Row>
        </Container>
      </div>

      {/* 5. Founder / Inspiration */}
      <section className="about-section">
        <Container>
          <Row className="align-items-center flex-row-reverse">
            <Col lg={5} className="mb-4 mb-lg-0 text-center">
              <div className="founder-img-box">
                {/* Placeholder for Swamiji/Founder Image */}
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/9/9b/Swami_Vivekananda_1893_Scanned_Image.jpg"
                  alt="Founder"
                  className="founder-img"
                />
              </div>
            </Col>
            <Col lg={7}>
              <h2 className="section-heading">Words of Inspiration</h2>
              <blockquote className="blockquote mt-3">
                <p
                  className="fst-italic text-muted"
                  style={{ fontSize: "1.3rem" }}
                >
                  "We want that education by which character is formed, strength
                  of mind is increased, the intellect is expanded, and by which
                  one can stand on one's own feet."
                </p>
                <footer className="blockquote-footer mt-2 text-warning">
                  Swami Vivekananda{" "}
                  <cite title="Source Title">(Inspiration)</cite>
                </footer>
              </blockquote>
              <p className="text-content mt-4">
                Our founders were deeply moved by these words. Following the
                path of the great Acharyas, Karunasri Seva Samithi strives to
                build a character-rich society through its various service
                wings.
              </p>
            </Col>
          </Row>
        </Container>
      </section>

      {/* 6. Branches / Legal Info */}
      <section className="py-5 bg-light text-center border-top">
        <Container>
          <h4 style={{ fontFamily: "Playfair Display", color: "#581818" }}>
            Registered Trust Branches
          </h4>
          <p className="text-muted mb-4">
            We currently operate across multiple locations to serve more people.
          </p>
          <Row className="justify-content-center">
            <Col md={3} className="mb-3">
              <div className="p-3 bg-white border rounded">
                <h6 className="fw-bold text-dark">Hyderabad (HQ)</h6>
                <small>Saroornagar</small>
              </div>
            </Col>
            <Col md={3} className="mb-3">
              <div className="p-3 bg-white border rounded">
                <h6 className="fw-bold text-dark">Warangal</h6>
                <small>Hanamkonda</small>
              </div>
            </Col>
            <Col md={3} className="mb-3">
              <div className="p-3 bg-white border rounded">
                <h6 className="fw-bold text-dark">Vijayawada</h6>
                <small>Benz Circle</small>
              </div>
            </Col>
          </Row>
          <div className="mt-4">
            <small className="text-muted">
              Registered under Trust Act. 80G & 12A Exempted.
            </small>
          </div>
        </Container>
      </section>
    </>
  );
};

export default About;
