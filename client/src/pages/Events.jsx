// import React, { useState } from "react";
// import { Container, Row, Col, Button, Badge } from "react-bootstrap";
// import { FaClock, FaMapMarkerAlt } from "react-icons/fa";
// import "./Events.css";

// const Events = () => {
//   const [activeTab, setActiveTab] = useState("upcoming");

//   // Mock Data
//   const upcomingEvents = [
//     {
//       id: 1,
//       day: "15",
//       month: "AUG",
//       title: "Sri Krishna Janmashtami",
//       time: "6:00 PM - Midnight",
//       location: "Main Temple Hall",
//       desc: "Join us for the grand celebration of Lord Krishna's appearance day with Kirtan, Abhishekam, and Prasadam.",
//     },
//     {
//       id: 2,
//       day: "10",
//       month: "SEP",
//       title: "Ganesh Chaturthi",
//       time: "9:00 AM - 1:00 PM",
//       location: "Ashram Courtyard",
//       desc: "Special Puja and Ganapati Homa followed by cultural programs by our Bal Vihar students.",
//     },
//   ];

//   const pastEvents = [
//     {
//       id: 101,
//       day: "20",
//       month: "JUL",
//       title: "Guru Purnima",
//       time: "Completed",
//       location: "Main Temple Hall",
//       desc: "Over 500 devotees participated in the Paduka Puja honoring the Guru Parampara.",
//     },
//     {
//       id: 102,
//       day: "21",
//       month: "JUN",
//       title: "International Yoga Day",
//       time: "Completed",
//       location: "Garden Area",
//       desc: "A health and wellness session conducted for all ashram residents and visitors.",
//     },
//   ];

//   const displayData = activeTab === "upcoming" ? upcomingEvents : pastEvents;

//   return (
//     <>
//       <div className="events-hero">
//         <div>
//           <h1
//             className="display-3 fw-bold"
//             style={{ fontFamily: "Playfair Display" }}
//           >
//             Events & Calendar
//           </h1>
//           <p className="lead">Participate in our sacred gatherings</p>
//         </div>
//       </div>

//       <Container className="py-5">
//         {/* Tabs */}
//         <div className="event-tabs">
//           <button
//             className={`event-tab-btn ${
//               activeTab === "upcoming" ? "active" : ""
//             }`}
//             onClick={() => setActiveTab("upcoming")}
//           >
//             Upcoming Events
//           </button>
//           <button
//             className={`event-tab-btn ${activeTab === "past" ? "active" : ""}`}
//             onClick={() => setActiveTab("past")}
//           >
//             Past Celebrations
//           </button>
//         </div>

//         {/* Event List */}
//         <div className="event-list-container">
//           {displayData.map((evt) => (
//             <div key={evt.id} className="event-card-lg">
//               <Row className="g-0 align-items-center">
//                 {/* Date Column */}
//                 <Col md={2} sm={3} className="text-center">
//                   <div className="date-block">
//                     <span className="date-day">{evt.day}</span>
//                     <span className="date-month">{evt.month}</span>
//                   </div>
//                 </Col>

//                 {/* Details Column */}
//                 <Col md={7} sm={9}>
//                   <div className="event-details">
//                     <h3 className="event-title-lg">{evt.title}</h3>
//                     <div className="event-meta-row">
//                       <span>
//                         <FaClock className="text-warning me-1" /> {evt.time}
//                       </span>
//                       <span>
//                         <FaMapMarkerAlt className="text-danger me-1" />{" "}
//                         {evt.location}
//                       </span>
//                     </div>
//                     <p className="text-muted mb-0">{evt.desc}</p>
//                   </div>
//                 </Col>

//                 {/* Button Column */}
//                 <Col md={3} className="text-center p-3 border-start">
//                   {activeTab === "upcoming" ? (
//                     <Button className="btn-ashram w-100 mb-2">
//                       Register Now
//                     </Button>
//                   ) : (
//                     <Button
//                       variant="outline-secondary"
//                       className="w-100"
//                       disabled
//                     >
//                       View Gallery
//                     </Button>
//                   )}
//                   {activeTab === "upcoming" && (
//                     <small className="text-muted d-block mt-2">
//                       Free Entry
//                     </small>
//                   )}
//                 </Col>
//               </Row>
//             </div>
//           ))}

//           {displayData.length === 0 && (
//             <p className="text-center text-muted">
//               No events found for this category.
//             </p>
//           )}
//         </div>
//       </Container>
//     </>
//   );
// };

// export default Events;
// import React, { useState, useEffect } from "react";
// import { Container, Row, Col, Button, Modal, Form } from "react-bootstrap";
// import { FaClock, FaMapMarkerAlt } from "react-icons/fa";
// import axios from "axios";
// import "./Events.css";

// const Events = () => {
//   const [activeTab, setActiveTab] = useState("upcoming");
//   const [events, setEvents] = useState([]);

//   // Registration Modal State
//   const [showRegModal, setShowRegModal] = useState(false);
//   const [selectedEvent, setSelectedEvent] = useState(null);
//   const [regData, setRegData] = useState({ name: "", phone: "" });

//   // Fetch Events from Backend
//   useEffect(() => {
//     const fetchEvents = async () => {
//       try {
//         const { data } = await axios.get("http://localhost:5000/api/events");
//         setEvents(data);
//       } catch (error) {
//         console.error("Error fetching events", error);
//       }
//     };
//     fetchEvents();
//   }, []);

//   // Filter Logic
//   const now = new Date();
//   const upcomingEvents = events.filter(
//     (e) => new Date(e.date).setHours(0, 0, 0, 0) >= now.setHours(0, 0, 0, 0)
//   );
//   const pastEvents = events.filter(
//     (e) => new Date(e.date) < new Date().setHours(0, 0, 0, 0)
//   );

//   const displayData = activeTab === "upcoming" ? upcomingEvents : pastEvents;

//   // Handle Registration Click
//   const handleRegisterClick = (evt) => {
//     setSelectedEvent(evt);
//     setShowRegModal(true);
//   };

//   // Submit Registration
//   const handleRegSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       await axios.post(
//         `http://localhost:5000/api/events/${selectedEvent._id}/register`,
//         regData
//       );
//       alert("Registration Successful! We look forward to seeing you.");
//       setShowRegModal(false);
//       setRegData({ name: "", phone: "" });

//       // Refresh events to update count
//       const { data } = await axios.get("http://localhost:5000/api/events");
//       setEvents(data);
//     } catch (error) {
//       alert(error.response?.data?.message || "Registration Failed");
//     }
//   };

//   return (
//     <>
//       <div className="events-hero">
//         <div>
//           <h1
//             className="display-3 fw-bold"
//             style={{ fontFamily: "Playfair Display" }}
//           >
//             Events & Calendar
//           </h1>
//           <p className="lead">Participate in our sacred gatherings</p>
//         </div>
//       </div>

//       <Container className="py-5">
//         {/* Tabs */}
//         <div className="event-tabs">
//           <button
//             className={`event-tab-btn ${
//               activeTab === "upcoming" ? "active" : ""
//             }`}
//             onClick={() => setActiveTab("upcoming")}
//           >
//             Upcoming Events
//           </button>
//           <button
//             className={`event-tab-btn ${activeTab === "past" ? "active" : ""}`}
//             onClick={() => setActiveTab("past")}
//           >
//             Past Celebrations
//           </button>
//         </div>

//         {/* Event List */}
//         <div className="event-list-container">
//           {displayData.map((evt) => {
//             const dateObj = new Date(evt.date);
//             const day = dateObj.getDate();
//             const month = dateObj
//               .toLocaleString("default", { month: "short" })
//               .toUpperCase();

//             return (
//               <div key={evt._id} className="event-card-lg">
//                 <Row className="g-0 align-items-center">
//                   <Col md={2} sm={3} className="text-center">
//                     <div className="date-block">
//                       <span className="date-day">{day}</span>
//                       <span className="date-month">{month}</span>
//                     </div>
//                   </Col>
//                   <Col md={7} sm={9}>
//                     <div className="event-details">
//                       <h3 className="event-title-lg">{evt.title}</h3>
//                       <div className="event-meta-row">
//                         <span>
//                           <FaClock className="text-warning me-1" /> {evt.time}
//                         </span>
//                         <span>
//                           <FaMapMarkerAlt className="text-danger me-1" />{" "}
//                           {evt.location}
//                         </span>
//                       </div>
//                       <p className="text-muted mb-0">{evt.description}</p>
//                     </div>
//                   </Col>
//                   <Col md={3} className="text-center p-3 border-start">
//                     {activeTab === "upcoming" ? (
//                       <Button
//                         className="btn-ashram w-100 mb-2"
//                         onClick={() => handleRegisterClick(evt)}
//                       >
//                         Register Now
//                       </Button>
//                     ) : (
//                       <Button
//                         variant="outline-secondary"
//                         className="w-100"
//                         disabled
//                       >
//                         Completed
//                       </Button>
//                     )}
//                     {activeTab === "upcoming" && (
//                       <small className="text-muted d-block mt-2">
//                         Free Entry
//                       </small>
//                     )}
//                   </Col>
//                 </Row>
//               </div>
//             );
//           })}
//           {displayData.length === 0 && (
//             <p className="text-center text-muted py-5">No events found.</p>
//           )}
//         </div>
//       </Container>

//       {/* Registration Modal */}
//       <Modal show={showRegModal} onHide={() => setShowRegModal(false)}>
//         <Modal.Header closeButton>
//           <Modal.Title>Register for {selectedEvent?.title}</Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           <Form onSubmit={handleRegSubmit}>
//             <Form.Group className="mb-3">
//               <Form.Label>Your Name</Form.Label>
//               <Form.Control
//                 type="text"
//                 value={regData.name}
//                 onChange={(e) =>
//                   setRegData({ ...regData, name: e.target.value })
//                 }
//                 required
//               />
//             </Form.Group>
//             <Form.Group className="mb-3">
//               <Form.Label>Phone Number</Form.Label>
//               <Form.Control
//                 type="text"
//                 value={regData.phone}
//                 onChange={(e) =>
//                   setRegData({ ...regData, phone: e.target.value })
//                 }
//                 required
//               />
//             </Form.Group>
//             <Button type="submit" className="w-100 btn-ashram">
//               Confirm Registration
//             </Button>
//           </Form>
//         </Modal.Body>
//       </Modal>
//     </>
//   );
// };

// export default Events;
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
import { FaClock, FaMapMarkerAlt, FaRupeeSign } from "react-icons/fa";
import axios from "axios";
import "./Events.css";

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
        const { data } = await axios.get("http://localhost:5000/api/events");
        setEvents(data);
      } catch (error) {
        console.error("Error fetching events", error);
      }
    };
    fetchEvents();
  }, []);

  const now = new Date();
  const upcomingEvents = events.filter(
    (e) => new Date(e.date).setHours(0, 0, 0, 0) >= now.setHours(0, 0, 0, 0)
  );
  const pastEvents = events.filter(
    (e) => new Date(e.date) < new Date().setHours(0, 0, 0, 0)
  );

  const displayData = activeTab === "upcoming" ? upcomingEvents : pastEvents;

  const handleRegisterClick = (evt) => {
    setSelectedEvent(evt);
    setShowRegModal(true);
  };

  const handleRegSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        `http://localhost:5000/api/events/${selectedEvent._id}/register`,
        regData
      );

      let msg = "Registration Successful!";
      if (selectedEvent.isPaid) {
        msg += " Please pay the fee at the venue to confirm your seat.";
      }

      alert(msg);
      setShowRegModal(false);
      setRegData({ name: "", phone: "" });

      // Refresh
      const { data } = await axios.get("http://localhost:5000/api/events");
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
            Events & Calendar
          </h1>
          <p className="lead">Participate in our sacred gatherings</p>
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
            Upcoming Events
          </button>
          <button
            className={`event-tab-btn ${activeTab === "past" ? "active" : ""}`}
            onClick={() => setActiveTab("past")}
          >
            Past Celebrations
          </button>
        </div>

        <div className="event-list-container">
          {displayData.map((evt) => {
            const dateObj = new Date(evt.date);
            const day = dateObj.getDate();
            const month = dateObj
              .toLocaleString("default", { month: "short" })
              .toUpperCase();

            return (
              <div key={evt._id} className="event-card-lg">
                <Row className="g-0 align-items-center">
                  <Col md={2} sm={3} className="text-center">
                    <div className="date-block">
                      <span className="date-day">{day}</span>
                      <span className="date-month">{month}</span>
                    </div>
                  </Col>
                  <Col md={7} sm={9}>
                    <div className="event-details">
                      <h3 className="event-title-lg">
                        {evt.title}
                        {evt.isPaid && (
                          <Badge bg="warning" text="dark" className="ms-2 fs-6">
                            ₹{evt.feeAmount}
                          </Badge>
                        )}
                      </h3>
                      <div className="event-meta-row">
                        <span>
                          <FaClock className="text-warning me-1" /> {evt.time}
                        </span>
                        <span>
                          <FaMapMarkerAlt className="text-danger me-1" />{" "}
                          {evt.location}
                        </span>
                      </div>
                      <p className="text-muted mb-0">{evt.description}</p>
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
            <p className="text-center text-muted py-5">No events found.</p>
          )}
        </div>
      </Container>

      {/* Registration Modal */}
      <Modal show={showRegModal} onHide={() => setShowRegModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Register for {selectedEvent?.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedEvent?.isPaid && (
            <div className="alert alert-warning">
              <strong>Note:</strong> This is a paid event. You are required to
              pay
              <strong> ₹{selectedEvent.feeAmount}</strong> at the venue or via
              UPI to confirm your spot.
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
