import React from "react";
import { Carousel, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import firstImage from "../assets/karunasri.jpg";
import secondImage from "../assets/image2.jpg";

const HeroSlider = () => {
  const slides = [
    {
      id: 1,
      image: firstImage,
      title: "Service to Mankind is Service to God",
      subtitle:
        "Join Karunasri Seva Samithi in uplifting the lives of the needy.",
      btnText: "Our Mission",
      link: "/about",
    },
    // {
    //   id: 2,
    //   image:
    //     "https://images.unsplash.com/photo-1593113598332-cd288d649433?q=80&w=1920&auto=format&fit=crop",
    //   title: "Nitya Annadhana",
    //   subtitle: "Feeding the hungry is the highest form of charity.",
    //   btnText: "Donate a Meal",
    //   link: "/donate",
    // },
    {
      id: 2,
      image: secondImage,
      title: "Vidyarthi Nidhi",
      subtitle: "Empowering the future through education and values.",
      btnText: "Sponsor a Child",
      link: "/donate",
    },
  ];

  return (
    <>
      <Carousel
        fade
        interval={4000}
        pause={false}
        controls={true}
        indicators={true}
        className="custom-carousel"
      >
        {slides.map((slide) => (
          <Carousel.Item key={slide.id} className="hero-slide-item">
            <img
              className="d-block  hero-image"
              src={slide.image}
              alt={slide.title}
            />
            {/* <div className="hero-overlay"></div> */}

            {/* <Carousel.Caption
              className="d-flex flex-column justify-content-center align-items-center h-100"
              style={{ bottom: 0 }}
            >
              <div>
                <h1 className="display-3 hero-title mb-3">{slide.title}</h1>
                <p className="lead mb-4 text-light hero-subtitle">
                  {slide.subtitle}
                </p>
                <Button as={Link} to={slide.link} className="btn-hero">
                  {slide.btnText}
                </Button>
              </div>
            </Carousel.Caption> */}
          </Carousel.Item>
        ))}
      </Carousel>
      <style>
        {`
      /* Make the slider take up significant height */
.hero-slide-item {
  height: 85vh;
  position: relative;
}

.hero-image {
  object-fit: cover;
  width: 100%;
  height: 100%;
}

/* Dark Gradient Overlay for text readability */
.hero-overlay {
  background: linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.2) 100%);
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
}

/* Customizing Bootstrap Carousel Indicators to be Round */
.custom-carousel .carousel-indicators {
  bottom: 30px;
}

.custom-carousel .carousel-indicators [data-bs-target] {
  width: 12px !important;
  height: 12px !important;
  border-radius: 50% !important;
  background-color: var(--gold-accent) !important;
  border: 2px solid rgba(255,255,255,0.5) !important;
  margin: 0 8px !important;
  opacity: 0.6;
  transition: all 0.3s ease;
}

.custom-carousel .carousel-indicators .active {
  opacity: 1;
  transform: scale(1.3);
  background-color: var(--primary-color) !important;
  border-color: white !important;
}

/* Caption Text Styling */
.hero-title {
  text-shadow: 2px 2px 4px rgba(0,0,0,0.6);
  font-weight: bold;
  letter-spacing: 1px;
}

.hero-subtitle {
  font-size: 1.5rem;
  text-shadow: 1px 1px 2px rgba(0,0,0,0.8);
  font-weight: 300;
}

/* Hero Button */
.btn-hero {
  background-color: var(--primary-color);
  color: white;
  border: 2px solid var(--primary-color);
  padding: 12px 35px;
  font-size: 1.1rem;
  font-weight: bold;
  border-radius: 50px;
  text-transform: uppercase;
  margin-top: 20px;
  transition: all 0.3s;
}

.btn-hero:hover {
  background-color: transparent;
  color: white;
  border-color: white;
}

      `}
      </style>
    </>
  );
};

export default HeroSlider;
