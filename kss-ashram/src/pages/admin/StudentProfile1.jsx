/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Row,
  Col,
  Card,
  Tabs,
  Tab,
  Table,
  Button,
  Form,
  Badge,
  Spinner,
  Modal,
  Alert,
} from "react-bootstrap";
import {
  FaArrowLeft,
  FaUserGraduate,
  FaHeartbeat,
  FaBook,
  FaRupeeSign,
  FaPlus,
  FaHandHoldingHeart,
  FaEdit,
  FaPrint,
} from "react-icons/fa";
import axios from "axios";

const StudentProfile = () => {
  const { id } = useParams();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  // Edit Mode State
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({}); // Stores changes while editing

  // --- State for New Entries ---
  const [newEdu, setNewEdu] = useState({
    year: "",
    class: "",
    school: "",
    percentage: "",
  });
  const [newHealth, setNewHealth] = useState({
    checkupType: "",
    doctorName: "",
    observation: "",
  });

  // --- FIX 1: State for New Expense ---
  const [newExpense, setNewExpense] = useState({ description: "", amount: "" });

  // --- FIX 2: State for Sponsor Mapping ---
  const [showSponsorModal, setShowSponsorModal] = useState(false);
  const [donors, setDonors] = useState([]); // List of available donors
  const [selectedSponsorId, setSelectedSponsorId] = useState("");

  useEffect(() => {
    fetchStudent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchStudent = async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const { data } = await axios.get(
        `http://localhost:5000/api/students/${id}`,
        config
      );
      setStudent(data);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setError("Failed to load student data");
      setLoading(false);
    }
  };
  // --- SAVE EDITED PROFILE ---
  const saveProfileChanges = async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

      // Update basic fields
      await axios.put(
        `http://localhost:5000/api/students/${id}`,
        {
          firstName: editData.firstName,
          lastName: editData.lastName,
          guardianName: editData.guardianName,
          contactNumber: editData.contactNumber,
          address: editData.address,
          dob: editData.dob,
        },
        config
      );

      setIsEditing(false);
      fetchStudent();
      alert("Profile Updated Successfully!");
    } catch (error) {
      alert("Error updating profile");
    }
  };

  // --- Generic Update Handler ---
  const handleUpdate = async (updateData) => {
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      await axios.put(
        `http://localhost:5000/api/students/${id}`,
        updateData,
        config
      );
      fetchStudent(); // Refresh UI
      // alert("Updated Successfully!"); // Optional: Commented out to reduce popup spam
    } catch (error) {
      alert("Error updating student");
    }
  };

  // --- Handlers for Adding Data ---
  const addEducation = () => {
    if (!newEdu.year || !newEdu.school) return alert("Please fill details");
    const updatedHistory = [...student.educationHistory, newEdu];
    handleUpdate({ educationHistory: updatedHistory });
    setNewEdu({ year: "", class: "", school: "", percentage: "" });
  };

  const addHealth = () => {
    if (!newHealth.checkupType) return alert("Please fill details");
    const updatedHealth = [...student.healthRecords, newHealth];
    handleUpdate({ healthRecords: updatedHealth });
    setNewHealth({ checkupType: "", doctorName: "", observation: "" });
  };

  // --- FIX 1: Add Expense Handler ---
  const addExpense = () => {
    if (!newExpense.description || !newExpense.amount)
      return alert("Please enter description and amount");

    // We send 'newExpense' object directly. The backend pushes it to the array.
    handleUpdate({
      newExpense: {
        description: newExpense.description,
        amount: Number(newExpense.amount),
        date: new Date(),
      },
    });
    setNewExpense({ description: "", amount: "" });
  };

  // --- FIX 2: Sponsor Handlers ---
  const openSponsorModal = async () => {
    setShowSponsorModal(true);
    try {
      // Fetch list of donations/donors to choose from
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const { data } = await axios.get(
        "http://localhost:5000/api/donations",
        config
      );
      setDonors(data);
    } catch (err) {
      alert("Failed to load donor list");
    }
  };

  const mapSponsor = async () => {
    if (!selectedSponsorId) return alert("Select a sponsor");
    await handleUpdate({ sponsor: selectedSponsorId });
    setShowSponsorModal(false);
    alert("Sponsor Mapped Successfully!");
  };

  if (loading)
    return (
      <div className="text-center py-5">
        <Spinner animation="border" />
      </div>
    );
  if (error) return <Alert variant="danger">{error}</Alert>;

  // Find sponsor name details if mapped
  const sponsorDetails = student.sponsor
    ? donors.find((d) => d._id === student.sponsor) // Try to find in loaded list (might need refresh if not loaded)
    : null;

  return (
    <div>
      {/* Header */}
      <div className="d-flex align-items-center gap-3 mb-4">
        <Link
          to="/dashboard/students"
          className="btn btn-outline-secondary btn-sm"
        >
          <FaArrowLeft />
        </Link>
        <div>
          <h2
            className="text-maroon m-0"
            style={{ fontFamily: "Playfair Display" }}
          >
            {student.firstName} {student.lastName}
          </h2>
          <span className="text-muted">
            ID: {student._id.slice(-6).toUpperCase()} | Branch: {student.branch}
          </span>
        </div>
        {/* <div className="ms-auto">
          <Badge
            bg={student.admissionStatus === "Active" ? "success" : "warning"}
          >
            {student.admissionStatus}
          </Badge>
        </div> */}
        <div className="ms-auto d-flex gap-2">
          {/* Print Button */}
          <Button variant="outline-dark" onClick={() => window.print()}>
            <FaPrint /> Print Profile
          </Button>

          {/* Edit Toggle Button */}
          {isEditing ? (
            <Button variant="success" onClick={saveProfileChanges}>
              <FaSave /> Save Changes
            </Button>
          ) : (
            <Button
              variant="primary"
              style={{ backgroundColor: "#581818" }}
              onClick={() => setIsEditing(true)}
            >
              <FaEdit /> Edit Details
            </Button>
          )}
        </div>
      </div>

      <Row>
        {/* Left Sidebar: Basic Info */}
        <Col md={4}>
          <Card className="shadow-sm border-0 mb-4">
            <Card.Body className="text-center">
              <div
                className="bg-light rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                style={{ width: "100px", height: "100px" }}
              >
                <FaUserGraduate size={50} className="text-secondary" />
              </div>
              <h5>
                {student.firstName} {student.lastName}
              </h5>
              <p className="text-muted small">
                {student.gender} | {new Date(student.dob).toLocaleDateString()}
              </p>
              <hr />
              <div className="text-start">
                <p>
                  <strong>Guardian:</strong> {student.guardianName}
                </p>
                <p>
                  <strong>Contact:</strong> {student.contactNumber}
                </p>
                <p>
                  <strong>Address:</strong> {student.address}
                </p>
              </div>
            </Card.Body>
          </Card>

          {/* Sponsor Card */}
          <Card className="shadow-sm border-0 bg-light">
            <Card.Body>
              <h6 className="text-maroon fw-bold">
                <FaHandHoldingHeart /> Sponsor Details
              </h6>

              {student.sponsor ? (
                <div className="mt-3">
                  <p className="text-success fw-bold mb-1">Sponsored</p>
                  <small className="text-muted">
                    Sponsor ID: {student.sponsor.slice(-6)}
                  </small>
                  {/* Note: To show Sponsor Name, backend populate is ideal, but for now we show ID or status */}
                  <div className="mt-2">
                    <Button
                      size="sm"
                      variant="outline-danger"
                      onClick={() => handleUpdate({ sponsor: null })}
                    >
                      Remove Mapping
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center mt-3">
                  <small className="text-muted d-block mb-2">
                    No sponsor mapped yet.
                  </small>
                  <Button
                    size="sm"
                    variant="outline-primary"
                    onClick={openSponsorModal}
                  >
                    Map Sponsor
                  </Button>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Right Content: Tabs */}
        <Col md={8}>
          <Card className="shadow-sm border-0">
            <Card.Body>
              <Tabs defaultActiveKey="education" className="mb-3">
                {/* Tab 1: Education */}
                <Tab
                  eventKey="education"
                  title={
                    <span>
                      <FaBook /> Education
                    </span>
                  }
                >
                  <Table striped bordered hover size="sm">
                    <thead>
                      <tr>
                        <th>Year</th>
                        <th>Class</th>
                        <th>School</th>
                        <th>%</th>
                      </tr>
                    </thead>
                    <tbody>
                      {student.educationHistory.map((edu, idx) => (
                        <tr key={idx}>
                          <td>{edu.year}</td>
                          <td>{edu.class}</td>
                          <td>{edu.school}</td>
                          <td>{edu.percentage}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                  <div className="p-3 bg-light rounded">
                    <h6>Add Academic Record</h6>
                    <Row className="g-2">
                      <Col md={3}>
                        <Form.Control
                          placeholder="Year"
                          value={newEdu.year}
                          onChange={(e) =>
                            setNewEdu({ ...newEdu, year: e.target.value })
                          }
                        />
                      </Col>
                      <Col md={3}>
                        <Form.Control
                          placeholder="Class"
                          value={newEdu.class}
                          onChange={(e) =>
                            setNewEdu({ ...newEdu, class: e.target.value })
                          }
                        />
                      </Col>
                      <Col md={4}>
                        <Form.Control
                          placeholder="School"
                          value={newEdu.school}
                          onChange={(e) =>
                            setNewEdu({ ...newEdu, school: e.target.value })
                          }
                        />
                      </Col>
                      <Col md={2}>
                        <Button size="sm" onClick={addEducation}>
                          <FaPlus />
                        </Button>
                      </Col>
                    </Row>
                  </div>
                </Tab>

                {/* Tab 2: Health */}
                <Tab
                  eventKey="health"
                  title={
                    <span>
                      <FaHeartbeat /> Health
                    </span>
                  }
                >
                  <Table striped bordered hover size="sm">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Type</th>
                        <th>Doctor</th>
                        <th>Observation</th>
                      </tr>
                    </thead>
                    <tbody>
                      {student.healthRecords.map((h, idx) => (
                        <tr key={idx}>
                          <td>{new Date(h.date).toLocaleDateString()}</td>
                          <td>{h.checkupType}</td>
                          <td>{h.doctorName}</td>
                          <td>{h.observation}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                  <div className="p-3 bg-light rounded">
                    <h6>Add Health Checkup</h6>
                    <Row className="g-2">
                      <Col md={4}>
                        <Form.Control
                          placeholder="Type"
                          value={newHealth.checkupType}
                          onChange={(e) =>
                            setNewHealth({
                              ...newHealth,
                              checkupType: e.target.value,
                            })
                          }
                        />
                      </Col>
                      <Col md={4}>
                        <Form.Control
                          placeholder="Doctor"
                          value={newHealth.doctorName}
                          onChange={(e) =>
                            setNewHealth({
                              ...newHealth,
                              doctorName: e.target.value,
                            })
                          }
                        />
                      </Col>
                      <Col md={4}>
                        <Form.Control
                          placeholder="Observation"
                          value={newHealth.observation}
                          onChange={(e) =>
                            setNewHealth({
                              ...newHealth,
                              observation: e.target.value,
                            })
                          }
                        />
                      </Col>
                      <Col md={12} className="text-end mt-2">
                        <Button size="sm" onClick={addHealth}>
                          Add Record
                        </Button>
                      </Col>
                    </Row>
                  </div>
                </Tab>

                {/* Tab 3: Expenses (FIXED) */}
                <Tab
                  eventKey="expenses"
                  title={
                    <span>
                      <FaRupeeSign /> Expenses
                    </span>
                  }
                >
                  <Table striped bordered hover size="sm">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Description</th>
                        <th className="text-end">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {student.expenses.map((exp, idx) => (
                        <tr key={idx}>
                          <td>{new Date(exp.date).toLocaleDateString()}</td>
                          <td>{exp.description}</td>
                          <td className="text-end fw-bold">₹{exp.amount}</td>
                        </tr>
                      ))}
                      {student.expenses.length === 0 && (
                        <tr>
                          <td colSpan="3" className="text-center text-muted">
                            No specific expenses recorded.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </Table>

                  {/* --- NEW EXPENSE INPUT SECTION --- */}
                  <div className="p-3 bg-light rounded mt-3">
                    <h6 className="text-maroon">Record New Expense</h6>
                    <Row className="g-2">
                      <Col md={7}>
                        <Form.Control
                          placeholder="Description (e.g. School Fees, Uniform)"
                          value={newExpense.description}
                          onChange={(e) =>
                            setNewExpense({
                              ...newExpense,
                              description: e.target.value,
                            })
                          }
                        />
                      </Col>
                      <Col md={3}>
                        <Form.Control
                          type="number"
                          placeholder="Amount (₹)"
                          value={newExpense.amount}
                          onChange={(e) =>
                            setNewExpense({
                              ...newExpense,
                              amount: e.target.value,
                            })
                          }
                        />
                      </Col>
                      <Col md={2}>
                        <Button
                          variant="danger"
                          className="w-100"
                          onClick={addExpense}
                        >
                          Add
                        </Button>
                      </Col>
                    </Row>
                  </div>
                </Tab>
              </Tabs>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* --- SPONSOR MAPPING MODAL --- */}
      <Modal show={showSponsorModal} onHide={() => setShowSponsorModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Map a Sponsor</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="text-muted">
            Select a donor from the list below to assign as a sponsor for{" "}
            <strong>{student.firstName}</strong>.
          </p>

          <Form.Group className="mb-3">
            <Form.Label>Select Donor</Form.Label>
            <Form.Select onChange={(e) => setSelectedSponsorId(e.target.value)}>
              <option value="">-- Choose Donor --</option>
              {donors.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.donorName} - ₹{d.amount} ({d.scheme})
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Button variant="primary" className="w-100" onClick={mapSponsor}>
            Confirm Mapping
          </Button>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default StudentProfile;
