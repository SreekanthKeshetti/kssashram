/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable no-unused-vars */
import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import BASE_URL from "../../apiConfig";
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
  FaClipboardList,
  FaUsers,
  FaChalkboardTeacher,
  FaBuilding,
  FaPhone,
  FaTrash,
  FaUserPlus,
  FaFileDownload,
  FaFilePdf,
} from "react-icons/fa";

const EventList = () => {
  const [events, setEvents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [attendanceDate, setAttendanceDate] = useState(
    new Date().toISOString().split("T")[0],
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
    feeAmount: "", // Serves as Donation Amount
    branch: "Karunya Sindhu",
    faculty: {
      name: "",
      phone: "",
      organization: "",
      designation: "",
    },
  });

  const [showRegModal, setShowRegModal] = useState(false);
  const [attendees, setAttendees] = useState([{ name: "", phone: "" }]);

  const fetchEvents = useCallback(async () => {
    try {
      const { data } = await axios.get(`${BASE_URL}/api/events`);
      setEvents(data);
    } catch (error) {
      console.error(error);
      setError("Failed to load programs");
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // --- REGISTRATION HANDLERS ---
  const openRegistrationModal = (evt) => {
    setSelectedEvent(evt);
    setAttendees([{ name: "", phone: "" }]);
    setShowRegModal(true);
  };

  const handleAttendeeChange = (index, field, value) => {
    const updated = [...attendees];
    updated[index][field] = value;
    setAttendees(updated);
  };

  const addAttendeeRow = () => {
    setAttendees([...attendees, { name: "", phone: "" }]);
  };

  const removeAttendeeRow = (index) => {
    const updated = attendees.filter((_, i) => i !== index);
    setAttendees(updated);
  };

  const submitRegistration = async () => {
    const validAttendees = attendees.filter(
      (a) => a.name && a.name.trim() !== "" && a.phone,
    );
    if (validAttendees.length === 0) return alert("Please add valid details.");

    try {
      await axios.post(`${BASE_URL}/api/events/${selectedEvent._id}/register`, {
        attendees: validAttendees,
      });
      alert(`Successfully registered ${validAttendees.length} participants!`);
      setShowRegModal(false);
      fetchEvents();
    } catch (err) {
      alert(err.response?.data?.message || "Registration Failed");
    }
  };

  // --- ATTENDANCE & DONATION HANDLERS ---
  const toggleAttendance = async (regId, currentLog) => {
    try {
      const targetDateStr = new Date(attendanceDate).toDateString();
      const isPresent = currentLog.some(
        (d) => new Date(d).toDateString() === targetDateStr,
      );
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

      const { data } = await axios.put(
        `${BASE_URL}/api/events/${selectedEvent._id}/attendance`,
        { registrationId: regId, date: attendanceDate, status: !isPresent },
        config,
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
    if (
      !window.confirm(
        "Confirm Donation Received? A receipt will be generated automatically.",
      )
    )
      return;
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

      const { data } = await axios.put(
        `${BASE_URL}/api/events/${selectedEvent._id}/payment`,
        { registrationId: regId, status: "Paid" }, // Keeping 'Paid' for DB compatibility
        config,
      );
      setSelectedEvent((prev) => ({
        ...prev,
        registrations: data.registrations,
      }));
      fetchEvents();
      alert("Donation Recorded & Receipt Generated!");
    } catch (err) {
      alert("Error recording donation");
    }
  };

  const openAttendanceModal = (evt) => {
    setSelectedEvent(evt);
    setAttendanceDate(new Date().toISOString().split("T")[0]);
    setShowAttendanceModal(true);
  };

  const handleDownloadParticipants = () => {
    if (!selectedEvent || selectedEvent.registrations.length === 0)
      return alert("No participants to export.");

    const headers = [
      "Name",
      "Phone",
      "Registration Date",
      "Donation Status",
      "Days Attended",
    ];
    const rows = selectedEvent.registrations.map((r) => [
      `"${r.name}"`,
      `"${r.phone}"`,
      new Date(r.registeredAt).toLocaleDateString(),
      r.paymentStatus === "Paid" ? "Donation Received" : r.paymentStatus,
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
      `Participants_${selectedEvent.title.replace(/\s+/g, "_")}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const isPresentOnDate = (log) => {
    if (!log) return false;
    const target = new Date(attendanceDate).toDateString();
    return log.some((d) => new Date(d).toDateString() === target);
  };

  // --- CREATE EVENT HANDLER ---
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
        feeAmount: "",
        branch: "Karunya Sindhu",
        faculty: { name: "", phone: "", organization: "", designation: "" },
      });
      alert("Skill Development Program Created!");
    } catch (error) {
      alert(error.response?.data?.message || "Error creating program");
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (
      ["facultyName", "facultyPhone", "facultyOrg", "facultyDesig"].includes(
        name,
      )
    ) {
      const fieldMap = {
        facultyName: "name",
        facultyPhone: "phone",
        facultyOrg: "organization",
        facultyDesig: "designation",
      };
      setFormData((prev) => ({
        ...prev,
        faculty: { ...prev.faculty, [fieldMap[name]]: value },
      }));
    } else {
      const val = type === "checkbox" ? checked : value;
      setFormData({ ...formData, [name]: val });
    }
  };

  const handleDownloadForm = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/events/blank-form`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "Skill_Registration_Form.pdf");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      alert("Error downloading form");
    }
  };

  return (
    <div>
      <Row className="mb-4 align-items-center">
        <Col lg={6} xs={12} className="mb-3 mb-lg-0">
          <h2
            className="text-maroon m-0"
            style={{ fontFamily: "Playfair Display" }}
          >
            Skill Development & Training
          </h2>
          <p className="text-muted m-0 small">
            Manage Vocational Courses, Workshops & Faculty
          </p>
        </Col>
        <Col lg={6} xs={12}>
          <div className="d-flex flex-wrap gap-2 justify-content-lg-end justify-content-start">
            <Button
              variant="outline-danger"
              className="shadow-sm flex-grow-1 flex-lg-grow-0"
              onClick={handleDownloadForm}
            >
              <FaFilePdf className="me-2" /> Blank Form
            </Button>
            <Button
              variant="primary"
              style={{ backgroundColor: "#581818", border: "none" }}
              onClick={() => setShowModal(true)}
            >
              <FaPlus className="me-2" /> Add New Program
            </Button>
          </div>
        </Col>
      </Row>

      {error && <Alert variant="danger">{error}</Alert>}

      <Card className="shadow-sm border-0">
        <Card.Body className="p-0">
          <Table hover responsive className="align-middle mb-0">
            <thead className="bg-light">
              <tr>
                <th className="ps-4">Program / Title</th>
                <th>Trainer / Faculty</th>
                <th>Branch</th>
                <th>Expected Donation</th>
                <th>Participants</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {events.map((e) => {
                const start = new Date(e.startDate).toLocaleDateString();
                return (
                  <tr key={e._id}>
                    <td className="ps-4">
                      <div className="fw-bold">{e.title}</div>
                      <small className="text-muted">Start: {start}</small>
                      <br />
                      <Badge bg="info" text="dark" className="mt-1">
                        {e.eventType}
                      </Badge>
                    </td>

                    <td>
                      {e.faculty && e.faculty.name ? (
                        <div>
                          <div className="fw-bold text-dark">
                            <FaChalkboardTeacher className="me-1 text-secondary" />
                            {e.faculty.name}
                          </div>
                          {e.faculty.organization && (
                            <div className="small text-muted">
                              <FaBuilding className="me-1" />{" "}
                              {e.faculty.organization}
                            </div>
                          )}
                          {e.faculty.phone && (
                            <div className="small text-muted">
                              <FaPhone className="me-1" /> {e.faculty.phone}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted small">Not Assigned</span>
                      )}
                    </td>

                    <td>
                      <Badge bg="light" text="dark" className="border">
                        {e.branch}
                      </Badge>
                    </td>
                    <td>
                      {e.feeAmount > 0 ? (
                        <Badge bg="success">₹ {e.feeAmount}</Badge>
                      ) : (
                        <Badge bg="secondary">No Donation</Badge>
                      )}
                    </td>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <Badge bg="secondary">
                          <FaUsers className="me-1" /> {e.registrations.length}
                        </Badge>
                        <Button
                          size="sm"
                          variant="outline-primary"
                          className="py-0 px-2"
                          onClick={() => openRegistrationModal(e)}
                          title="Add Participants"
                        >
                          <FaUserPlus size={12} />
                        </Button>
                      </div>
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
                  <td colSpan="6" className="text-center py-5">
                    No active programs found.
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* --- CREATE PROGRAM MODAL --- */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Create Skill Development Program</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <h6 className="text-maroon border-bottom pb-2 mb-3">
              Program Details
            </h6>
            <Row>
              <Col md={12} className="mb-3">
                <Form.Label>Program Title</Form.Label>
                <Form.Control
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  placeholder="e.g. Advanced Tailoring Workshop"
                />
              </Col>
              <Col md={6} className="mb-3">
                <Form.Label>Category</Form.Label>
                <Form.Select
                  name="eventType"
                  value={formData.eventType}
                  onChange={handleChange}
                >
                  <option>Training</option>
                  <option>Tailoring</option>
                  <option>Computer Training</option>
                  <option>Workshop</option>
                  <option>Vedic Class</option>
                  <option>Celebration</option>
                </Form.Select>
              </Col>
              <Col md={6} className="mb-3">
                <Form.Label>Branch</Form.Label>
                <Form.Select
                  name="branch"
                  value={formData.branch}
                  onChange={handleChange}
                >
                  <option value="Karunya Sindhu">Karunya Sindhu</option>
                  <option value="Karunya Bharathi">Karunya Bharathi</option>
                  <option value="Karunya Jyothi">Karunya Jyothi</option>
                  <option value="KarunaSri Seva Samithi">
                    KarunaSri Seva Samithi
                  </option>
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
                <Form.Label>Timings</Form.Label>
                <Form.Control
                  name="time"
                  value={formData.time}
                  placeholder="e.g. 10:00 AM - 1:00 PM"
                  onChange={handleChange}
                  required
                />
              </Col>
              <Col md={6} className="mb-3">
                <Form.Label>Venue</Form.Label>
                <Form.Control
                  name="location"
                  value={formData.location}
                  placeholder="Venue"
                  onChange={handleChange}
                  required
                />
              </Col>

              {/* --- NEW: DONATION AMOUNT PLACEMENT --- */}
              <Col md={6} className="mb-3">
                <Form.Label className="fw-bold text-success">
                  Skill Development Donation (₹)
                </Form.Label>
                <Form.Control
                  type="number"
                  name="feeAmount"
                  value={formData.feeAmount}
                  onChange={handleChange}
                  placeholder="Leave empty or 0 if free"
                />
              </Col>

              <Col md={12} className="mb-3">
                <Form.Label>Description / Syllabus</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                />
              </Col>
            </Row>

            <h6 className="text-maroon border-bottom pb-2 mb-3 mt-2">
              Faculty / Trainer Details
            </h6>
            <Row>
              <Col md={6} className="mb-3">
                <Form.Label>Trainer Name</Form.Label>
                <Form.Control
                  name="facultyName"
                  value={formData.faculty.name}
                  onChange={handleChange}
                  placeholder="Name of the person taking class"
                />
              </Col>
              <Col md={6} className="mb-3">
                <Form.Label>Phone Number</Form.Label>
                <Form.Control
                  name="facultyPhone"
                  value={formData.faculty.phone}
                  onChange={handleChange}
                  placeholder="Contact No"
                />
              </Col>
              <Col md={6} className="mb-3">
                <Form.Label>Organization / Institute</Form.Label>
                <Form.Control
                  name="facultyOrg"
                  value={formData.faculty.organization}
                  onChange={handleChange}
                  placeholder="e.g. Infosys / Self / Veda Pathashala"
                />
              </Col>
              <Col md={6} className="mb-3">
                <Form.Label>Designation</Form.Label>
                <Form.Control
                  name="facultyDesig"
                  value={formData.faculty.designation}
                  onChange={handleChange}
                  placeholder="e.g. Senior Instructor"
                />
              </Col>
            </Row>

            <Button type="submit" className="w-100 btn-ashram mt-4">
              Create Program
            </Button>
          </Form>
        </Modal.Body>
      </Modal>

      {/* REGISTRATION MODAL */}
      <Modal
        show={showRegModal}
        onHide={() => setShowRegModal(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Add Participants: {selectedEvent?.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Table bordered size="sm">
            <thead>
              <tr>
                <th style={{ width: "45%" }}>Student Name</th>
                <th style={{ width: "45%" }}>Contact</th>
                <th style={{ width: "10%" }}></th>
              </tr>
            </thead>
            <tbody>
              {attendees.map((person, index) => (
                <tr key={index}>
                  <td>
                    <Form.Control
                      size="sm"
                      placeholder="Name"
                      value={person.name}
                      onChange={(e) =>
                        handleAttendeeChange(index, "name", e.target.value)
                      }
                    />
                  </td>
                  <td>
                    <Form.Control
                      size="sm"
                      placeholder="Phone"
                      value={person.phone}
                      onChange={(e) =>
                        handleAttendeeChange(index, "phone", e.target.value)
                      }
                    />
                  </td>
                  <td className="text-center">
                    {attendees.length > 1 && (
                      <Button
                        variant="link"
                        className="text-danger p-0"
                        onClick={() => removeAttendeeRow(index)}
                      >
                        <FaTrash />
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          <Button variant="outline-primary" size="sm" onClick={addAttendeeRow}>
            <FaPlus /> Add Row
          </Button>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowRegModal(false)}>
            Close
          </Button>
          <Button variant="success" onClick={submitRegistration}>
            Register All
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ATTENDANCE & DONATION MODAL */}
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
            <Button
              variant="success"
              size="sm"
              onClick={handleDownloadParticipants}
            >
              <FaFileDownload className="me-2" /> Export List
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
                  <th className="text-center">Donation Status</th>
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
                      {reg.paymentStatus === "Paid" ? (
                        <Badge bg="success">Receipt Generated</Badge>
                      ) : reg.paymentStatus === "Free" ? (
                        <Badge bg="secondary">No Donation</Badge>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline-success"
                          onClick={() => markPayment(reg._id)}
                        >
                          Receive Donation
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
                        {isPresentOnDate(reg.attendanceLog)
                          ? "Present"
                          : "Mark Present"}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default EventList;
