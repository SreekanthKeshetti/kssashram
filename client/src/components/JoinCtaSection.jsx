// import React from "react";
// import { Container } from "react-bootstrap";
// import { FaWhatsapp } from "react-icons/fa";
// import "./JoinCtaSection.css";

// const JoinCtaSection = () => {
//   // Reliable Link from Wikimedia (Transparent Mandala)
//   const flowerImg =
//     "https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/Mandala_6.svg/640px-Mandala_6.svg.png";

//   return (
//     <section className="join-cta-section">
//       <Container>
//         <div className="cta-wrapper">
//           {/* Left Flower */}
//           <img
//             src={flowerImg}
//             alt="mandala decoration"
//             className="flower-decor flower-rotate d-none d-md-block"
//           />

//           {/* Center Content */}
//           <div className="cta-content">
//             <h2 className="trust-name-cta">Karunasri Seva Samithi</h2>
//             <p className="sub-text-cta">
//               Join our spiritual community for daily updates & events
//             </p>

//             <div className="whatsapp-box">
//               <div className="wa-icon-circle">
//                 <FaWhatsapp />
//               </div>
//               <a
//                 href="https://wa.me/919922003000"
//                 target="_blank"
//                 rel="noreferrer"
//                 className="btn-join-us"
//               >
//                 Join Us
//               </a>
//             </div>
//           </div>

//           {/* Right Flower */}
//           <img
//             src={flowerImg}
//             alt="mandala decoration"
//             className="flower-decor flower-rotate d-none d-md-block"
//           />
//         </div>
//       </Container>
//     </section>
//   );
// };

// export default JoinCtaSection;
import React from "react";
import { Container } from "react-bootstrap";
import { FaWhatsapp } from "react-icons/fa";
import "./JoinCtaSection.css";
import lotusImg from "../assets/lotus.png";

// Beautiful 5-Petal Lotus SVG matching your image
const LotusSVG = () => (
  <svg
    viewBox="0 0 512 512"
    className="flower-decor flower-rotate d-none d-md-block"
    fill="none"
    stroke="#b85d38" /* The exact coppery-brown color from your image */
    strokeWidth="18"
    strokeLinecap="round"
    strokeLinejoin="round"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Center Petal */}
    <path d="M256,420 C256,420 180,250 256,100 C332,250 256,420 256,420 Z" />
    {/* Left Inner Petal */}
    <path d="M256,420 C180,420 100,300 150,180 C200,280 256,420 256,420 Z" />
    {/* Right Inner Petal */}
    <path d="M256,420 C332,420 412,300 362,180 C312,280 256,420 256,420 Z" />
    {/* Left Outer Petal */}
    <path d="M256,420 C100,420 20,320 50,250 C100,350 256,420 256,420 Z" />
    {/* Right Outer Petal */}
    <path d="M256,420 C412,420 492,320 462,250 C412,350 256,420 256,420 Z" />
  </svg>
);

const JoinCtaSection = () => {
  return (
    <section className="join-cta-section">
      <Container>
        <div className="cta-wrapper">
          {/* Left Lotus */}
          <img
            src={lotusImg}
            alt="Lotus"
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

          {/* Right Lotus */}
          <img
            src={lotusImg}
            alt="Lotus"
            className="flower-decor flower-rotate d-none d-md-block"
          />
        </div>
      </Container>
    </section>
  );
};

export default JoinCtaSection;
