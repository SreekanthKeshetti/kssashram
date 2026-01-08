import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Button,
  Modal,
  Form,
  Badge,
} from "react-bootstrap";
import {
  FaClock,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaBuilding,
} from "react-icons/fa";
import axios from "axios";
import "./Events.css";
import BASE_URL from "../apiConfig";

const Events = () => {
  const [activeTab, setActiveTab] = useState("upcoming");
  const [events, setEvents] = useState([]);

  // Registration Modal State
  const [showRegModal, setShowRegModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [regData, setRegData] = useState({ name: "", phone: "" });

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const { data } = await axios.get(`${BASE_URL}/api/events`);
        setEvents(data);
      } catch (error) {
        console.error("Error fetching events", error);
      }
    };
    fetchEvents();
  }, []);

  // Filter Logic
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const upcomingEvents = events.filter((e) => {
    const start = new Date(e.startDate || e.date);
    start.setHours(0, 0, 0, 0);
    return start >= now;
  });

  const pastEvents = events.filter((e) => {
    const start = new Date(e.startDate || e.date);
    start.setHours(0, 0, 0, 0);
    return start < now;
  });

  const displayData = activeTab === "upcoming" ? upcomingEvents : pastEvents;

  const handleRegisterClick = (evt) => {
    setSelectedEvent(evt);
    setShowRegModal(true);
  };

  const handleRegSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        `${BASE_URL}/api/events/${selectedEvent._id}/register`,
        regData
      );

      let msg = "Registration Successful!";
      if (selectedEvent.isPaid) {
        msg += ` Please pay the fee of ₹${selectedEvent.feeAmount} at the venue/office to confirm your seat.`;
      }

      alert(msg);
      setShowRegModal(false);
      setRegData({ name: "", phone: "" });

      const { data } = await axios.get(`${BASE_URL}/api/events`);
      setEvents(data);
    } catch (error) {
      alert(error.response?.data?.message || "Registration Failed");
    }
  };

  return (
    <>
      <div className="events-hero">
        <div>
          <h1
            className="display-3 fw-bold"
            style={{ fontFamily: "Playfair Display" }}
          >
            Events & Trainings
          </h1>
          <p className="lead">
            Participate in our sacred gatherings and skill development programs
          </p>
        </div>
      </div>

      <Container className="py-5">
        <div className="event-tabs">
          <button
            className={`event-tab-btn ${
              activeTab === "upcoming" ? "active" : ""
            }`}
            onClick={() => setActiveTab("upcoming")}
          >
            Upcoming Programs
          </button>
          <button
            className={`event-tab-btn ${activeTab === "past" ? "active" : ""}`}
            onClick={() => setActiveTab("past")}
          >
            Past Events
          </button>
        </div>

        <div className="event-list-container">
          {displayData.map((evt) => {
            const startObj = new Date(evt.startDate || evt.date);
            const endObj = evt.endDate ? new Date(evt.endDate) : startObj;

            const startDay = startObj.getDate();
            const startMonth = startObj
              .toLocaleString("default", { month: "short" })
              .toUpperCase();

            const isMultiDay = startObj.getTime() !== endObj.getTime();
            const dateString = isMultiDay
              ? `${startObj.toLocaleDateString()} - ${endObj.toLocaleDateString()}`
              : startObj.toLocaleDateString();

            return (
              <div key={evt._id} className="event-card-lg">
                <Row className="g-0 align-items-center">
                  <Col md={2} sm={3} className="text-center">
                    <div className="date-block">
                      <span className="date-day">{startDay}</span>
                      <span className="date-month">{startMonth}</span>
                    </div>
                  </Col>

                  <Col md={7} sm={9}>
                    <div className="event-details">
                      {/* 1. SHOW ORGANIZING BRANCH */}
                      <div className="mb-2">
                        <Badge
                          bg="dark"
                          className="me-2 text-uppercase"
                          style={{ fontSize: "0.7rem", letterSpacing: "1px" }}
                        >
                          <FaBuilding className="me-1" /> Org by:{" "}
                          {evt.branch || "Headquarters"}
                        </Badge>
                        <Badge bg="info" text="dark" className="me-2">
                          {evt.eventType}
                        </Badge>
                        {evt.isPaid && (
                          <Badge bg="warning" text="dark">
                            Fee: ₹{evt.feeAmount}
                          </Badge>
                        )}
                      </div>

                      <h3 className="event-title-lg">{evt.title}</h3>

                      <div className="event-meta-row">
                        <span>
                          <FaCalendarAlt className="text-primary me-1" />{" "}
                          {dateString}
                        </span>
                        <span>
                          <FaClock className="text-warning me-1" /> {evt.time}
                        </span>
                      </div>

                      {/* 2. SHOW VENUE (LOCATION) */}
                      <div className="event-meta-row mt-1 text-danger fw-bold">
                        <span>
                          <FaMapMarkerAlt className="me-1" /> Venue:{" "}
                          {evt.location}
                        </span>
                      </div>

                      <p className="text-muted mb-0 mt-2">{evt.description}</p>
                    </div>
                  </Col>

                  <Col md={3} className="text-center p-3 border-start">
                    {activeTab === "upcoming" ? (
                      <Button
                        className="btn-ashram w-100 mb-2"
                        onClick={() => handleRegisterClick(evt)}
                      >
                        Register Now
                      </Button>
                    ) : (
                      <Button
                        variant="outline-secondary"
                        className="w-100"
                        disabled
                      >
                        Completed
                      </Button>
                    )}

                    {activeTab === "upcoming" && (
                      <small
                        className={`d-block mt-2 ${
                          evt.isPaid ? "text-danger fw-bold" : "text-success"
                        }`}
                      >
                        {evt.isPaid
                          ? `Entry Fee: ₹${evt.feeAmount}`
                          : "Free Entry"}
                      </small>
                    )}
                  </Col>
                </Row>
              </div>
            );
          })}

          {displayData.length === 0 && (
            <div className="text-center py-5">
              <h5 className="text-muted">No events found.</h5>
            </div>
          )}
        </div>
      </Container>

      <Modal show={showRegModal} onHide={() => setShowRegModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Register for {selectedEvent?.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedEvent?.isPaid && (
            <div className="alert alert-warning">
              <strong>Note:</strong> Paid Event (₹{selectedEvent.feeAmount}).
              Pay at venue.
            </div>
          )}
          <Form onSubmit={handleRegSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Your Name</Form.Label>
              <Form.Control
                type="text"
                value={regData.name}
                onChange={(e) =>
                  setRegData({ ...regData, name: e.target.value })
                }
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Phone Number</Form.Label>
              <Form.Control
                type="text"
                value={regData.phone}
                onChange={(e) =>
                  setRegData({ ...regData, phone: e.target.value })
                }
                required
              />
            </Form.Group>
            <Button type="submit" className="w-100 btn-ashram">
              Confirm Registration
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default Events;
