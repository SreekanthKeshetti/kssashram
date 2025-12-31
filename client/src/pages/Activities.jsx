import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import { Link } from "react-router-dom";
import { FaCheckCircle } from "react-icons/fa";
import "./Activities.css";

const Activities = () => {
  // Data for your services
  const sevas = [
    {
      id: 1,
      title: "Nitya Annadhana",
      subtitle: "Food Distribution Service",
      desc: "Hunger is the greatest enemy of human dignity. At Karunasri, we ensure that no one who comes to our Ashram goes back hungry. We serve wholesome, sattvic meals to sadhus, students, and the destitute every single day.",
      features: [
        "Daily feeding of 500+ people.",
        "Special feasts on festivals.",
        "Hygienic and nutritious preparation.",
      ],
      img: "https://images.unsplash.com/photo-1606216794074-735e91aa9c29?q=80&w=800&auto=format&fit=crop",
    },
    {
      id: 2,
      title: "Vidyarthi Nidhi",
      subtitle: "Education Support",
      desc: "Vidya (Knowledge) is the greatest wealth. We support underprivileged children by providing school fees, uniforms, and books. We also run a Vedic Patashala to preserve our ancient culture and traditions.",
      features: [
        "Scholarships for merit students.",
        "Free books and stationary distribution.",
        "Vedic chanting classes.",
      ],
      img: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?q=80&w=800&auto=format&fit=crop",
    },
    {
      id: 3,
      title: "Go-Seva (Cow Protection)",
      subtitle: "Animal Welfare",
      desc: "The cow is considered a mother in our culture. Our Goshala houses over 50 cows that have been rescued or are too old to produce milk. We provide them with fodder, medical care, and a loving home.",
      features: [
        "Shelter for abandoned cows.",
        "Daily Green Fodder & Medical checks.",
        "Go-Puja performed daily.",
      ],
      img: "https://images.unsplash.com/photo-1593113598332-cd288d649433?q=80&w=800&auto=format&fit=crop",
    },
    {
      id: 4,
      title: "Ashram Maintenance",
      subtitle: "Divine Infrastructure",
      desc: "To facilitate all these activities, we maintain a clean and spiritual environment. This includes the prayer hall, the kitchen, and the guest house for pilgrims.",
      features: [
        "Temple cleanliness and rituals.",
        "Accommodation for pilgrims.",
        "Greenery and garden maintenance.",
      ],
      img: "https://images.unsplash.com/photo-1564424918239-01150824b260?q=80&w=800&auto=format&fit=crop", // Temple/Building image
    },
  ];

  return (
    <>
      {/* 1. Hero Section */}
      <div className="activities-hero">
        <Container>
          <h1
            className="display-3 fw-bold"
            style={{ fontFamily: "Playfair Display, serif" }}
          >
            Our Sevas
          </h1>
          <p className="lead" style={{ opacity: 0.9 }}>
            Devotion through Action
          </p>
        </Container>
      </div>

      {/* 2. Activities List (Zig-Zag) */}
      <Container>
        {sevas.map((seva, index) => (
          // Logic: If index is even (0, 2), Image Left. If odd (1, 3), Image Right.
          <Row
            key={seva.id}
            className={`seva-row ${index % 2 !== 0 ? "flex-row-reverse" : ""}`}
          >
            {/* Image Column */}
            <Col lg={6} className="mb-4 mb-lg-0">
              <div className="seva-img-wrapper">
                <img src={seva.img} alt={seva.title} className="seva-img" />
              </div>
            </Col>

            {/* Text Column */}
            <Col lg={6} className="px-lg-5">
              <span className="seva-subtitle">{seva.subtitle}</span>
              <h2 className="seva-title">{seva.title}</h2>
              <p className="seva-desc">{seva.desc}</p>

              <ul className="seva-features">
                {seva.features.map((feature, idx) => (
                  <li key={idx}>
                    <FaCheckCircle className="feature-check" /> {feature}
                  </li>
                ))}
              </ul>

              <Link to="/donate" className="btn-seva-donate">
                Donate for {seva.title.split(" ")[0]}{" "}
                {/* Takes first word e.g. Donate for Nitya */}
              </Link>
            </Col>
          </Row>
        ))}
      </Container>

      {/* 3. Bottom Call to Action */}
      <div className="bg-light py-5 text-center mt-5">
        <Container>
          <h3 style={{ color: "#581818", fontFamily: "Playfair Display" }}>
            Ready to make a difference?
          </h3>
          <p className="text-muted mb-4">
            Your small contribution can save a life today.
          </p>
          <Link to="/donate" className="btn btn-ashram btn-lg">
            General Donation
          </Link>
        </Container>
      </div>
    </>
  );
};

export default Activities;
