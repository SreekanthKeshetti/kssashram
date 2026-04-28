import React from "react";
import { Container, Row, Col, Card } from "react-bootstrap";
import { Link } from "react-router-dom";
import HeroSlider from "../components/HeroSlider";
import DonationSchemes from "../components/DonationSchemes";
import QuoteSection from "../components/QuoteSection";
import JoinCtaSection from "../components/JoinCtaSection";

const Home = () => {
  return (
    <>
      <Container fluid className="p-0">
        <HeroSlider />
        <DonationSchemes />
        <QuoteSection />
        <JoinCtaSection />
      </Container>
    </>
  );
};

export default Home;
