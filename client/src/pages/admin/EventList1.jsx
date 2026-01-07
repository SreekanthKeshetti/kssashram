/* eslint-disable no-unused-vars */
// /* eslint-disable no-unused-vars */
// import React, { useEffect, useState, useCallback } from "react";
// import {
//   Table,
//   Button,
//   Badge,
//   Card,
//   Row,
//   Col,
//   Modal,
//   Form,
//   Alert,
// } from "react-bootstrap";
// import {
//   FaPlus,
//   FaMapMarkerAlt,
//   FaClipboardList,
//   FaUsers,
//   FaCheckSquare,
//   FaSquare,
// } from "react-icons/fa";
// import axios from "axios";

// const EventList = () => {
//   const [events, setEvents] = useState([]);
//   const [showModal, setShowModal] = useState(false);

//   // Attendance Modal State
//   const [showAttendanceModal, setShowAttendanceModal] = useState(false);
//   const [selectedEvent, setSelectedEvent] = useState(null);
//   const [error, setError] = useState("");

//   // Form Data
//   const [formData, setFormData] = useState({
//     title: "",
//     description: "",
//     date: "",
//     time: "",
//     location: "",
//     eventType: "Celebration",
//   });

//   // Fetch Events
//   const fetchEvents = useCallback(async () => {
//     try {
//       const { data } = await axios.get("http://localhost:5000/api/events");
//       setEvents(data);
//     } catch (error) {
//       console.error(error);
//       setError("Failed to load events");
//     }
//   }, []);

//   useEffect(() => {
//     // eslint-disable-next-line react-hooks/set-state-in-effect
//     fetchEvents();
//   }, [fetchEvents]);

//   // --- ATTENDANCE HANDLER ---
//   const toggleAttendance = async (regId, currentStatus) => {
//     try {
//       const userInfo = JSON.parse(localStorage.getItem("userInfo"));
//       const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

//       const { data } = await axios.put(
//         `http://localhost:5000/api/events/${selectedEvent._id}/attendance`,
//         {
//           registrationId: regId,
//           status: !currentStatus,
//         },
//         config
//       );

//       // Update local state immediately to reflect change
//       setSelectedEvent((prev) => ({
//         ...prev,
//         registrations: data.registrations,
//       }));
//       fetchEvents(); // Refresh main list
//     } catch (err) {
//       alert("Error updating attendance");
//     }
//   };

//   const openAttendanceModal = (evt) => {
//     setSelectedEvent(evt);
//     setShowAttendanceModal(true);
//   };

//   // Handle Create Event
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       const userInfo = JSON.parse(localStorage.getItem("userInfo"));
//       const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

//       // This API call works for both Admin AND Employee (Manager)
//       await axios.post("http://localhost:5000/api/events", formData, config);

//       setShowModal(false);
//       fetchEvents();
//       setFormData({
//         title: "",
//         description: "",
//         date: "",
//         time: "",
//         location: "",
//         eventType: "Celebration",
//       });
//       alert("Event Created Successfully!");
//     } catch (error) {
//       alert(error.response?.data?.message || "Error creating event");
//     }
//   };

//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   return (
//     <div>
//       <Row className="mb-4 align-items-center">
//         <Col>
//           <h2
//             className="text-maroon"
//             style={{ fontFamily: "Playfair Display" }}
//           >
//             Events Management
//           </h2>
//           <p className="text-muted">
//             Schedule Pujas, Workshops, and Celebrations
//           </p>
//         </Col>
//         <Col className="text-end">
//           {/* This button is visible to anyone who can access the Dashboard (Admin & Manager) */}
//           <Button
//             variant="primary"
//             style={{ backgroundColor: "#581818", border: "none" }}
//             onClick={() => setShowModal(true)}
//           >
//             <FaPlus /> Create Event
//           </Button>
//         </Col>
//       </Row>

//       {error && <Alert variant="danger">{error}</Alert>}

//       <Card className="shadow-sm border-0">
//         <Card.Body className="p-0">
//           <Table hover responsive className="align-middle mb-0">
//             <thead className="bg-light">
//               <tr>
//                 <th className="ps-4">Date</th>
//                 <th>Event Name</th>
//                 <th>Type</th>
//                 <th>Location</th>
//                 <th>Registrations</th>
//                 <th>Action</th>
//               </tr>
//             </thead>
//             <tbody>
//               {events.map((e) => (
//                 <tr key={e._id}>
//                   <td className="ps-4">
//                     <div className="fw-bold">
//                       {new Date(e.date).toLocaleDateString()}
//                     </div>
//                     <small className="text-muted">{e.time}</small>
//                   </td>
//                   <td className="fw-bold">{e.title}</td>
//                   <td>
//                     <Badge bg="info" text="dark">
//                       {e.eventType}
//                     </Badge>
//                   </td>
//                   <td>
//                     <FaMapMarkerAlt className="text-danger me-1" /> {e.location}
//                   </td>
//                   <td>
//                     <Badge bg="secondary">
//                       <FaUsers className="me-1" /> {e.registrations.length}
//                     </Badge>
//                   </td>
//                   <td>
//                     <Button
//                       size="sm"
//                       variant="outline-dark"
//                       onClick={() => openAttendanceModal(e)}
//                       title="Manage Attendance"
//                     >
//                       <FaClipboardList /> Attendance
//                     </Button>
//                   </td>
//                 </tr>
//               ))}
//               {events.length === 0 && (
//                 <tr>
//                   <td colSpan="5" className="text-center py-5">
//                     No events scheduled
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </Table>
//         </Card.Body>
//       </Card>
//       {/* --- ATTENDANCE MODAL --- */}
//       <Modal
//         show={showAttendanceModal}
//         onHide={() => setShowAttendanceModal(false)}
//         size="lg"
//       >
//         <Modal.Header closeButton>
//           <Modal.Title>Attendance: {selectedEvent?.title}</Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           {selectedEvent?.registrations.length === 0 ? (
//             <p className="text-center text-muted">No registrations yet.</p>
//           ) : (
//             <Table striped bordered hover>
//               <thead>
//                 <tr>
//                   <th>Name</th>
//                   <th>Phone</th>
//                   <th className="text-center">Status</th>
//                   <th className="text-center">Action</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {selectedEvent?.registrations.map((reg) => (
//                   <tr key={reg._id}>
//                     <td>{reg.name}</td>
//                     <td>{reg.phone}</td>
//                     <td className="text-center">
//                       {reg.attended ? (
//                         <Badge bg="success">Present</Badge>
//                       ) : (
//                         <Badge bg="danger">Absent</Badge>
//                       )}
//                     </td>
//                     <td className="text-center">
//                       <Button
//                         size="sm"
//                         variant={
//                           reg.attended ? "outline-danger" : "outline-success"
//                         }
//                         onClick={() => toggleAttendance(reg._id, reg.attended)}
//                       >
//                         {reg.attended ? "Mark Absent" : "Mark Present"}
//                       </Button>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </Table>
//           )}
//         </Modal.Body>
//       </Modal>
//       {/* Create Event Modal */}
//       <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
//         <Modal.Header closeButton>
//           <Modal.Title>Create New Event</Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           <Form onSubmit={handleSubmit}>
//             <Row>
//               <Col md={6} className="mb-3">
//                 <Form.Label>Event Title</Form.Label>
//                 <Form.Control
//                   name="title"
//                   value={formData.title}
//                   onChange={handleChange}
//                   required
//                 />
//               </Col>
//               <Col md={6} className="mb-3">
//                 <Form.Label>Type</Form.Label>
//                 <Form.Select
//                   name="eventType"
//                   value={formData.eventType}
//                   onChange={handleChange}
//                 >
//                   <option>Celebration</option>
//                   <option>Training</option>
//                   <option>Workshop</option>
//                   <option>Puja</option>
//                 </Form.Select>
//               </Col>
//               <Col md={6} className="mb-3">
//                 <Form.Label>Date</Form.Label>
//                 <Form.Control
//                   type="date"
//                   name="date"
//                   value={formData.date}
//                   onChange={handleChange}
//                   required
//                 />
//               </Col>
//               <Col md={6} className="mb-3">
//                 <Form.Label>Time</Form.Label>
//                 <Form.Control
//                   type="text"
//                   name="time"
//                   value={formData.time}
//                   placeholder="e.g. 10:00 AM"
//                   onChange={handleChange}
//                   required
//                 />
//               </Col>
//               <Col md={12} className="mb-3">
//                 <Form.Label>Location</Form.Label>
//                 <Form.Control
//                   name="location"
//                   value={formData.location}
//                   onChange={handleChange}
//                   required
//                 />
//               </Col>
//               <Col md={12} className="mb-3">
//                 <Form.Label>Description</Form.Label>
//                 <Form.Control
//                   as="textarea"
//                   rows={3}
//                   name="description"
//                   value={formData.description}
//                   onChange={handleChange}
//                   required
//                 />
//               </Col>
//             </Row>
//             <Button type="submit" className="w-100 btn-ashram">
//               Publish Event
//             </Button>
//           </Form>
//         </Modal.Body>
//       </Modal>
//     </div>
//   );
// };

// export default EventList;
import React, { useEffect, useState, useCallback } from "react";
import {
  Table,
  Button,
  Badge,
  Card,
  Row,
  Col,
  Modal,
  Form,
  Alert,
} from "react-bootstrap";
import {
  FaPlus,
  FaMapMarkerAlt,
  FaClipboardList,
  FaUsers,
  FaRupeeSign,
} from "react-icons/fa";
import axios from "axios";

const EventList = () => {
  const [events, setEvents] = useState([]);
  const [showModal, setShowModal] = useState(false);

  // Attendance Modal State
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [error, setError] = useState("");

  // Form Data
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    location: "",
    eventType: "Celebration",
    isPaid: false,
    feeAmount: "",
  });

  const fetchEvents = useCallback(async () => {
    try {
      const { data } = await axios.get("http://localhost:5000/api/events");
      setEvents(data);
    } catch (error) {
      console.error(error);
      setError("Failed to load events");
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchEvents();
  }, [fetchEvents]);

  // --- ATTENDANCE HANDLER ---
  const toggleAttendance = async (regId, currentStatus) => {
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

      const { data } = await axios.put(
        `http://localhost:5000/api/events/${selectedEvent._id}/attendance`,
        { registrationId: regId, status: !currentStatus },
        config
      );
      setSelectedEvent((prev) => ({
        ...prev,
        registrations: data.registrations,
      }));
      fetchEvents();
    } catch (err) {
      alert("Error updating attendance");
    }
  };

  // --- PAYMENT HANDLER (Mark Paid) ---
  const markPayment = async (regId) => {
    if (!window.confirm("Confirm payment received?")) return;
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

      const { data } = await axios.put(
        `http://localhost:5000/api/events/${selectedEvent._id}/payment`,
        { registrationId: regId, status: "Paid" },
        config
      );
      setSelectedEvent((prev) => ({
        ...prev,
        registrations: data.registrations,
      }));
      fetchEvents();
    } catch (err) {
      alert("Error updating payment");
    }
  };

  const openAttendanceModal = (evt) => {
    setSelectedEvent(evt);
    setShowAttendanceModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

      await axios.post("http://localhost:5000/api/events", formData, config);

      setShowModal(false);
      fetchEvents();
      setFormData({
        title: "",
        description: "",
        date: "",
        time: "",
        location: "",
        eventType: "Celebration",
        isPaid: false,
        feeAmount: "",
      });
      alert("Event Created Successfully!");
    } catch (error) {
      alert(error.response?.data?.message || "Error creating event");
    }
  };

  const handleChange = (e) => {
    const value =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  return (
    <div>
      <Row className="mb-4 align-items-center">
        <Col>
          <h2
            className="text-maroon"
            style={{ fontFamily: "Playfair Display" }}
          >
            Events Management
          </h2>
          <p className="text-muted">
            Schedule Pujas, Workshops, and Celebrations
          </p>
        </Col>
        <Col className="text-end">
          <Button
            variant="primary"
            style={{ backgroundColor: "#581818", border: "none" }}
            onClick={() => setShowModal(true)}
          >
            <FaPlus /> Create Event
          </Button>
        </Col>
      </Row>

      {error && <Alert variant="danger">{error}</Alert>}

      <Card className="shadow-sm border-0">
        <Card.Body className="p-0">
          <Table hover responsive className="align-middle mb-0">
            <thead className="bg-light">
              <tr>
                <th className="ps-4">Date</th>
                <th>Event Name</th>
                <th>Type</th>
                <th>Fee</th>
                <th>Registrations</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {events.map((e) => (
                <tr key={e._id}>
                  <td className="ps-4">
                    <div className="fw-bold">
                      {new Date(e.date).toLocaleDateString()}
                    </div>
                    <small className="text-muted">{e.time}</small>
                  </td>
                  <td className="fw-bold">{e.title}</td>
                  <td>
                    <Badge bg="info" text="dark">
                      {e.eventType}
                    </Badge>
                  </td>
                  <td>
                    {e.isPaid ? (
                      <Badge bg="warning" text="dark">
                        ₹ {e.feeAmount}
                      </Badge>
                    ) : (
                      <Badge bg="success">Free</Badge>
                    )}
                  </td>
                  <td>
                    <Badge bg="secondary">
                      <FaUsers className="me-1" /> {e.registrations.length}
                    </Badge>
                  </td>
                  <td>
                    <Button
                      size="sm"
                      variant="outline-dark"
                      onClick={() => openAttendanceModal(e)}
                      title="Manage Attendance"
                    >
                      <FaClipboardList /> Manage
                    </Button>
                  </td>
                </tr>
              ))}
              {events.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center py-5">
                    No events scheduled
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* --- ATTENDANCE & PAYMENT MODAL --- */}
      <Modal
        show={showAttendanceModal}
        onHide={() => setShowAttendanceModal(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Manage: {selectedEvent?.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedEvent?.registrations.length === 0 ? (
            <p className="text-center text-muted">No registrations yet.</p>
          ) : (
            <Table striped bordered hover className="align-middle">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Phone</th>
                  <th className="text-center">Payment</th>
                  <th className="text-center">Attendance</th>
                </tr>
              </thead>
              <tbody>
                {selectedEvent?.registrations.map((reg) => (
                  <tr key={reg._id}>
                    <td>{reg.name}</td>
                    <td>{reg.phone}</td>

                    {/* Payment Column */}
                    <td className="text-center">
                      {reg.paymentStatus === "Paid" ||
                      reg.paymentStatus === "Free" ? (
                        <Badge bg="success">{reg.paymentStatus}</Badge>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline-warning"
                          onClick={() => markPayment(reg._id)}
                        >
                          Mark Paid
                        </Button>
                      )}
                    </td>

                    {/* Attendance Column */}
                    <td className="text-center">
                      <Button
                        size="sm"
                        variant={
                          reg.attended ? "outline-danger" : "outline-success"
                        }
                        onClick={() => toggleAttendance(reg._id, reg.attended)}
                      >
                        {reg.attended ? "Mark Absent" : "Mark Present"}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Modal.Body>
      </Modal>

      {/* Create Event Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Create New Event</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6} className="mb-3">
                <Form.Label>Event Title</Form.Label>
                <Form.Control
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
              </Col>
              <Col md={6} className="mb-3">
                <Form.Label>Type</Form.Label>
                <Form.Select
                  name="eventType"
                  value={formData.eventType}
                  onChange={handleChange}
                >
                  <option>Celebration</option>
                  <option>Training</option>
                  <option>Workshop</option>
                  <option>Puja</option>
                </Form.Select>
              </Col>
              <Col md={6} className="mb-3">
                <Form.Label>Date</Form.Label>
                <Form.Control
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                />
              </Col>
              <Col md={6} className="mb-3">
                <Form.Label>Time</Form.Label>
                <Form.Control
                  type="text"
                  name="time"
                  value={formData.time}
                  placeholder="e.g. 10:00 AM"
                  onChange={handleChange}
                  required
                />
              </Col>
              <Col md={12} className="mb-3">
                <Form.Label>Location</Form.Label>
                <Form.Control
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  required
                />
              </Col>
              <Col md={12} className="mb-3">
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                />
              </Col>

              {/* --- PAID EVENT SECTION --- */}
              <Col md={6}>
                <Form.Check
                  type="switch"
                  label="Is this a Paid Event?"
                  name="isPaid"
                  checked={formData.isPaid}
                  onChange={handleChange}
                  className="mb-3 fw-bold"
                />
              </Col>
              {formData.isPaid && (
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Fee Amount (₹)</Form.Label>
                    <Form.Control
                      type="number"
                      name="feeAmount"
                      value={formData.feeAmount}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                </Col>
              )}
            </Row>
            <Button type="submit" className="w-100 btn-ashram">
              Publish Event
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default EventList;
