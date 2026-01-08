import React, { useState } from "react";
import { Container, Row, Col, Card } from "react-bootstrap";
import { Link } from "react-router-dom";
import { FaChevronRight, FaChevronUp } from "react-icons/fa";
import "./DonationSchemes.css";

const DonationSchemes = () => {
  // State to track if we are showing all items or just the first few
  const [showAll, setShowAll] = useState(false);

  // Full List of Schemes (Mock Data)
  const allSchemes = [
    {
      id: 1,
      title: "Nitya Annadhana",
      desc: "Sponsor daily meals for the Ashram residents. Food is Brahman.",
      img: "https://images.unsplash.com/photo-1606216794074-735e91aa9c29?w=600&auto=format&fit=crop",
    },
    {
      id: 2,
      title: "Vidyarthi Poshan",
      desc: "Support the education, books, and uniform of a Ved pathshala student.",
      img: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=600&auto=format&fit=crop",
    },
    // {
    //   id: 3,
    //   title: "Go-Seva (Cow Care)",
    //   desc: "Protect and feed our cows. Gauseva is the highest form of service.",
    //   img: "https://images.unsplash.com/photo-1593113598332-cd288d649433?w=600&auto=format&fit=crop",
    // },
    {
      id: 3,
      title: "Ashram Construction",
      desc: "Donate bricks or cement for the new prayer hall construction.",
      img: "https://images.unsplash.com/photo-1548625361-ec8595edc29b?w=600&auto=format&fit=crop",
    },
    {
      id: 4,
      title: "Medical Camp",
      desc: "Sponsor medicines for the free rural health checkup camps.",
      img: "https://images.unsplash.com/photo-1576091160550-2187d80a1b44?w=600&auto=format&fit=crop",
    },
    // {
    //   id: 5,
    //   title: "Festival Seva",
    //   desc: "Contribute towards flowers and decorations for major festivals.",
    //   img: "https://images.unsplash.com/photo-1561343754-0518747449a5?w=600&auto=format&fit=crop",
    // },
  ];

  // Logic: If showAll is true, take the whole list. If false, take only first 3.
  const displayedSchemes = showAll ? allSchemes : allSchemes.slice(0, 3);

  return (
    <section className="donation-section">
      <Container>
        {/* Header: Title LEFT, Toggle Link RIGHT */}
        <div className="scheme-header">
          <h2 className="scheme-title">Our Sacred Sevas</h2>

          <div
            className="view-toggle-link"
            onClick={() => setShowAll(!showAll)}
          >
            {showAll ? (
              <>
                View Less <FaChevronUp size={12} />
              </>
            ) : (
              <>
                View All <FaChevronRight size={12} />
              </>
            )}
          </div>
        </div>

        <Row>
          {displayedSchemes.map((item) => (
            <Col lg={4} md={6} className="mb-4 fade-in" key={item.id}>
              <Card className="scheme-card h-100">
                <div className="scheme-img-wrapper">
                  <img src={item.img} alt={item.title} />
                </div>
                <Card.Body className="scheme-body">
                  <Card.Title className="scheme-name">{item.title}</Card.Title>
                  <Card.Text className="scheme-desc">{item.desc}</Card.Text>
                  <Link to="/donate" className="btn-donate-card">
                    Donate Now
                  </Link>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </section>
  );
};

export default DonationSchemes;
