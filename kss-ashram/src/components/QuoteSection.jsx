import React from "react";
import { Container } from "react-bootstrap";
import { FaQuoteLeft } from "react-icons/fa";
import "./QuoteSection.css";

const QuoteSection = () => {
  return (
    <div className="quote-section">
      <div className="quote-overlay"></div>
      <Container className="quote-content-wrapper">
        <FaQuoteLeft
          size={40}
          style={{ color: "#DAA520", opacity: 0.8, marginBottom: "25px" }}
        />
        <h3 className="quote-text">
          "The best way to find yourself is to lose yourself in the service of
          others."
        </h3>
        <p className="quote-author">- Mahatma Gandhi</p>
      </Container>
    </div>
  );
};

export default QuoteSection;
