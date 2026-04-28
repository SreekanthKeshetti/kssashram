import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import { Link } from "react-router-dom";
import "./DonationSchemes.css";
// --- IMPORT YOUR SAVED IMAGE ---
import mandalaBg from "../assets/mandala.jpg";

const DonationSchemes = () => {
  const allSchemes = [
    {
      title: "Nitya Annadhana Nidhi",
      desc: "Sponsor daily wholesome meals for Ashram residents and students. Food is the highest form of charity.",
    },
    {
      title: "Shasvitha Annadhana Nidhi",
      desc: "A permanent endowment fund. The interest generated ensures food distribution continues eternally.",
    },
    {
      title: "Vidyarthi Poshaka Nidhi",
      desc: "Support the overall welfare, clothing, and daily needs of a resident student in the Ashram.",
    },
    {
      title: "Pathashala Rusumu Nidhi",
      desc: "Contribute specifically towards school and college fees to ensure uninterrupted education.",
    },
    {
      title: "Vidyarthi Kaushalya Nidhi",
      desc: "Empower youth through skill development, vocational training, and computer literacy programs.",
    },

    {
      title: "Poshakulu Sponsorships",
      desc: "Become a Patron (Poshakulu, Raja Poshakulu, Maharaja Poshakulu) to support the core mission of the Trust.",
    },
    {
      title: "Samaja Seva Karyakramala Nidhi",
      desc: "Fund broader social service activities, disaster relief, medical camps, and community outreach.",
    },
    {
      title: "General / Corpus Fund",
      desc: "Unrestricted donations that allow the management to utilize funds where the need is most urgent.",
    },
  ];

  return (
    <section className="donation-section">
      <Container>
        <h2 className="impact-title text-center">Creating Impact</h2>
        <Row className="justify-content-center">
          {allSchemes.map((item, index) => (
            <Col lg={4} md={6} sm={12} className="mb-4" key={index}>
              <div className="flip-card">
                <div className="flip-card-inner">
                  {/* FRONT SIDE with the Mandala Image */}
                  <div
                    className="flip-card-front"
                    style={{ backgroundImage: `url(${mandalaBg})` }}
                  >
                    <div className="front-content-wrapper">
                      <h3 className="scheme-name-impact">{item.title}</h3>
                    </div>
                  </div>

                  {/* BACK SIDE */}
                  <div className="flip-card-back">
                    <p className="scheme-desc-impact">{item.desc}</p>
                    {/* <Link to="/donate" className="btn-donate-impact">
                      Donate Now
                    </Link> */}
                  </div>
                </div>
              </div>
            </Col>
          ))}
        </Row>
      </Container>
    </section>
  );
};

export default DonationSchemes;
