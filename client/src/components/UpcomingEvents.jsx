import React from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import { FaClock, FaMapMarkerAlt } from "react-icons/fa";
import "./UpcomingEvents.css";

const UpcomingEvents = () => {
  const events = [
    {
      id: 1,
      day: "15",
      month: "AUG",
      title: "Sri Krishna Janmashtami",
      time: "6:00 PM - 12:00 AM",
      location: "Main Temple Hall",
    },
    {
      id: 2,
      day: "22",
      month: "SEP",
      title: "Radhastami Celebrations",
      time: "10:00 AM - 2:00 PM",
      location: "Ashram Gardens",
    },
    {
      id: 3,
      day: "05",
      month: "OCT",
      title: "Govardhan Puja & Annakut",
      time: "5:00 PM Onwards",
      location: "Goshala Grounds",
    },
  ];

  return (
    <section className="events-section">
      <Container>
        <div className="text-center mb-5">
          <h6
            className="text-uppercase"
            style={{ color: "var(--primary-color)", letterSpacing: "2px" }}
          >
            Join our Sacred Gatherings
          </h6>
          <h2
            className="section-title"
            style={{ fontFamily: "var(--font-heading)", fontSize: "2.5rem" }}
          >
            Upcoming Events
          </h2>
        </div>

        {events.map((event) => (
          <Row key={event.id} className="event-row align-items-center">
            {/* Date Box */}
            <Col xs={3} md={2} className="d-flex justify-content-center">
              <div className="event-date-box">
                <span className="event-month">{event.month}</span>
                <span className="event-day">{event.day}</span>
              </div>
            </Col>

            {/* Event Details */}
            <Col xs={9} md={7}>
              <h3 className="event-title">{event.title}</h3>
              <div className="d-flex gap-3 text-muted small">
                <span>
                  <FaClock className="me-1 text-warning" /> {event.time}
                </span>
                <span>
                  <FaMapMarkerAlt className="me-1 text-danger" />{" "}
                  {event.location}
                </span>
              </div>
            </Col>

            {/* Action Button */}
            <Col xs={12} md={3} className="text-md-end mt-3 mt-md-0">
              <Button variant="outline-dark" className="rounded-pill px-4">
                Register Free
              </Button>
            </Col>
          </Row>
        ))}

        <div className="text-center mt-5">
          <Button className="btn-ashram">View Full Calendar</Button>
        </div>
      </Container>
    </section>
  );
};

export default UpcomingEvents;
