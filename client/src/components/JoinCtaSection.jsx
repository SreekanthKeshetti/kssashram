import React from "react";
import { Container } from "react-bootstrap";
import { FaWhatsapp } from "react-icons/fa";
import "./JoinCtaSection.css";

const JoinCtaSection = () => {
  // Reliable Link from Wikimedia (Transparent Mandala)
  const flowerImg =
    "https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/Mandala_6.svg/640px-Mandala_6.svg.png";

  return (
    <section className="join-cta-section">
      <Container>
        <div className="cta-wrapper">
          {/* Left Flower */}
          <img
            src={flowerImg}
            alt="mandala decoration"
            className="flower-decor flower-rotate d-none d-md-block"
          />

          {/* Center Content */}
          <div className="cta-content">
            <h2 className="trust-name-cta">Karunasri Seva Samithi</h2>
            <p className="sub-text-cta">
              Join our spiritual community for daily updates & events
            </p>

            <div className="whatsapp-box">
              <div className="wa-icon-circle">
                <FaWhatsapp />
              </div>
              <a
                href="https://wa.me/919922003000"
                target="_blank"
                rel="noreferrer"
                className="btn-join-us"
              >
                Join Us
              </a>
            </div>
          </div>

          {/* Right Flower */}
          <img
            src={flowerImg}
            alt="mandala decoration"
            className="flower-decor flower-rotate d-none d-md-block"
          />
        </div>
      </Container>
    </section>
  );
};

export default JoinCtaSection;
