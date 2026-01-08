/* eslint-disable no-unused-vars */
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
  FaCalendarCheck,
  FaFileDownload,
  FaBuilding,
} from "react-icons/fa";
import axios from "axios";
import BASE_URL from "../../apiConfig";

const EventList = () => {
  const [events, setEvents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [attendanceDate, setAttendanceDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    time: "",
    location: "",
    eventType: "Training",
    isPaid: false,
    feeAmount: "",
    branch: "Karunya Sindu", // Default Branch
  });

  const fetchEvents = useCallback(async () => {
    try {
      const { data } = await axios.get(`${BASE_URL}/api/events`);
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

  // --- NEW: DOWNLOAD PARTICIPANTS FUNCTION ---
  const handleDownloadParticipants = () => {
    if (!selectedEvent || selectedEvent.registrations.length === 0)
      return alert("No participants to export.");

    const headers = [
      "Name",
      "Phone",
      "Registration Date",
      "Payment Status",
      "Days Attended",
    ];

    const rows = selectedEvent.registrations.map((r) => [
      `"${r.name}"`, // Quote name to handle commas
      `"${r.phone}"`,
      new Date(r.registeredAt).toLocaleDateString(),
      r.paymentStatus,
      r.attendanceLog ? r.attendanceLog.length : 0,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      headers.join(",") +
      "\n" +
      rows.map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `Participants_${selectedEvent.title.replace(/\s+/g, "_")}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  // ------------------------------------------

  const toggleAttendance = async (regId, currentLog) => {
    try {
      const targetDateStr = new Date(attendanceDate).toDateString();
      const isPresent = currentLog.some(
        (d) => new Date(d).toDateString() === targetDateStr
      );
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

      const { data } = await axios.put(
        `${BASE_URL}/api/events/${selectedEvent._id}/attendance`,
        { registrationId: regId, date: attendanceDate, status: !isPresent },
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

  const markPayment = async (regId) => {
    if (!window.confirm("Confirm payment received?")) return;
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

      const { data } = await axios.put(
        `${BASE_URL}/api/events/${selectedEvent._id}/payment`,
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
    setAttendanceDate(new Date().toISOString().split("T")[0]);
    setShowAttendanceModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const payload = { ...formData };
      if (!payload.endDate) payload.endDate = payload.startDate;

      await axios.post(`${BASE_URL}/api/events`, payload, config);

      setShowModal(false);
      fetchEvents();
      setFormData({
        title: "",
        description: "",
        startDate: "",
        endDate: "",
        time: "",
        location: "",
        eventType: "Training",
        isPaid: false,
        feeAmount: "",
        branch: "Karunya Sindu",
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

  const isPresentOnDate = (log) => {
    if (!log) return false;
    const target = new Date(attendanceDate).toDateString();
    return log.some((d) => new Date(d).toDateString() === target);
  };

  return (
    <div>
      <Row className="mb-4 align-items-center">
        <Col>
          <h2
            className="text-maroon"
            style={{ fontFamily: "Playfair Display" }}
          >
            Events & Trainings
          </h2>
          <p className="text-muted">
            Manage Tailoring, Computer Classes & Celebrations
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
                <th className="ps-4">Dates</th>
                <th>Title</th>
                <th>Branch</th>
                <th>Type</th>
                <th>Fee</th>
                <th>Users</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {events.map((e) => {
                const start = new Date(e.startDate).toLocaleDateString();
                const end = e.endDate
                  ? new Date(e.endDate).toLocaleDateString()
                  : start;
                return (
                  <tr key={e._id}>
                    <td className="ps-4">
                      <div className="fw-bold">{start}</div>
                      {start !== end && (
                        <small className="text-muted">to {end}</small>
                      )}
                    </td>
                    <td className="fw-bold">{e.title}</td>
                    <td>
                      <Badge bg="light" text="dark" className="border">
                        {e.branch}
                      </Badge>
                    </td>
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
                      >
                        <FaClipboardList /> Manage
                      </Button>
                    </td>
                  </tr>
                );
              })}
              {events.length === 0 && (
                <tr>
                  <td colSpan="7" className="text-center py-5">
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
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div className="d-flex align-items-center gap-2">
              <strong>Attendance For:</strong>
              <input
                type="date"
                className="form-control w-auto"
                value={attendanceDate}
                onChange={(e) => setAttendanceDate(e.target.value)}
              />
            </div>
            {/* --- DOWNLOAD BUTTON --- */}
            <Button
              variant="success"
              size="sm"
              onClick={handleDownloadParticipants}
            >
              <FaFileDownload /> Export List
            </Button>
          </div>

          {selectedEvent?.registrations.length === 0 ? (
            <p className="text-center text-muted">No registrations yet.</p>
          ) : (
            <Table striped bordered hover className="align-middle">
              <thead>
                <tr>
                  <th>Name</th>
                  <th className="text-center">Attended</th>
                  <th className="text-center">Fee</th>
                  <th className="text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {selectedEvent?.registrations.map((reg) => (
                  <tr key={reg._id}>
                    <td>
                      {reg.name}
                      <br />
                      <small className="text-muted">{reg.phone}</small>
                    </td>
                    <td className="text-center fw-bold">
                      {reg.attendanceLog?.length || 0} Days
                    </td>
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
                    <td className="text-center">
                      <Button
                        size="sm"
                        variant={
                          isPresentOnDate(reg.attendanceLog)
                            ? "success"
                            : "outline-secondary"
                        }
                        onClick={() =>
                          toggleAttendance(reg._id, reg.attendanceLog)
                        }
                      >
                        {isPresentOnDate(reg.attendanceLog) ? (
                          <>
                            <FaCalendarCheck /> Present
                          </>
                        ) : (
                          "Mark Present"
                        )}
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
          <Modal.Title>Create New Training / Event</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={12} className="mb-3">
                <Form.Label>Title</Form.Label>
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
                  <option>Training</option>
                  <option>Tailoring</option>
                  <option>Computer Training</option>
                  <option>Celebration</option>
                  <option>Workshop</option>
                </Form.Select>
              </Col>
              <Col md={6} className="mb-3">
                <Form.Label>Branch (Organizer)</Form.Label>
                <Form.Select
                  name="branch"
                  value={formData.branch}
                  onChange={handleChange}
                >
                  <option value="Karunya Sindu">Karunya Sindu</option>
                  <option value="Karunya Bharathi">Karunya Bharathi</option>
                  <option value="Headquarters">Headquarters</option>
                </Form.Select>
              </Col>

              <Col md={6} className="mb-3">
                <Form.Label>Start Date</Form.Label>
                <Form.Control
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  required
                />
              </Col>
              <Col md={6} className="mb-3">
                <Form.Label>End Date</Form.Label>
                <Form.Control
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                />
              </Col>

              <Col md={6} className="mb-3">
                <Form.Label>Time / Schedule</Form.Label>
                <Form.Control
                  type="text"
                  name="time"
                  value={formData.time}
                  placeholder="e.g. 10 AM"
                  onChange={handleChange}
                  required
                />
              </Col>
              <Col md={6} className="mb-3">
                <Form.Label>Physical Venue / Location</Form.Label>
                <Form.Control
                  name="location"
                  value={formData.location}
                  placeholder="e.g. Community Hall"
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

              <Col md={6}>
                <Form.Check
                  type="switch"
                  label="Is Paid Training?"
                  name="isPaid"
                  checked={formData.isPaid}
                  onChange={handleChange}
                  className="mb-3 fw-bold"
                />
              </Col>
              {formData.isPaid && (
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Fee (₹)</Form.Label>
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
              Create Training
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default EventList;
