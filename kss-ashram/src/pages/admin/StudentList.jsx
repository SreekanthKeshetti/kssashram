/* eslint-disable react-hooks/immutability */
/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Badge,
  Card,
  Row,
  Col,
  Modal,
  Form,
} from "react-bootstrap";
import {
  FaPlus,
  FaEye,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaUserGraduate,
  FaFileDownload,
  FaTrash,
} from "react-icons/fa";
import { Link } from "react-router-dom";
import axios from "axios";

const StudentList = () => {
  const [students, setStudents] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    dob: "",
    gender: "Male",
    guardianName: "",
    contactNumber: "",
    address: "",
    branch: "Headquarters",
  });

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("userInfo"));
    setCurrentUser(user);
    if (user) fetchStudents(user);
  }, []);

  const fetchStudents = async (user) => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get(
        "http://localhost:5000/api/students",
        config
      );
      setStudents(data);
    } catch (error) {
      console.error(error);
    }
  };

  // --- EXPORT FUNCTION (CSV) ---
  const handleExport = () => {
    if (students.length === 0) return alert("No data to export");

    const headers = [
      "First Name",
      "Last Name",
      "Guardian",
      "DOB",
      "Gender",
      "Contact",
      "Branch",
      "Status",
    ];
    const rows = students.map((s) => [
      s.firstName,
      s.lastName,
      s.guardianName,
      new Date(s.dob).toLocaleDateString(),
      s.gender,
      s.contactNumber,
      s.branch,
      s.admissionStatus,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      headers.join(",") +
      "\n" +
      rows.map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "Students_List.csv");
    document.body.appendChild(link);
    link.click();
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this student record?"))
      return;
    try {
      const config = {
        headers: { Authorization: `Bearer ${currentUser.token}` },
      };
      await axios.delete(`http://localhost:5000/api/students/${id}`, config);
      fetchStudents(currentUser);
      alert("Student Deleted");
    } catch (error) {
      alert("Error deleting student");
    }
  };

  // ... (Helper functions: handleApprove, handleChange, handleSubmit, openViewModal, StatusBadge) ...
  const handleApprove = async (status) => {
    try {
      const config = {
        headers: { Authorization: `Bearer ${currentUser.token}` },
      };
      await axios.put(
        `http://localhost:5000/api/students/${selectedStudent._id}/approve`,
        {
          status: status,
          remark: "Approved via Dashboard",
          approvalType: currentUser.role,
        },
        config
      );
      alert(`Successfully ${status}`);
      setShowViewModal(false);
      fetchStudents(currentUser);
    } catch (error) {
      alert(error.response?.data?.message || "Error updating status");
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const config = {
        headers: { Authorization: `Bearer ${currentUser.token}` },
      };
      await axios.post("http://localhost:5000/api/students", formData, config);
      setShowAddModal(false);
      fetchStudents(currentUser);
      alert("Application Submitted!");
      setFormData({
        firstName: "",
        lastName: "",
        dob: "",
        gender: "Male",
        guardianName: "",
        contactNumber: "",
        address: "",
        branch: "Headquarters",
      });
    } catch (error) {
      alert("Error submitting application");
    }
  };

  const openViewModal = (student) => {
    setSelectedStudent(student);
    setShowViewModal(true);
  };

  const StatusBadge = ({ status }) => {
    if (status === "Approved")
      return (
        <Badge bg="success">
          <FaCheckCircle /> Approved
        </Badge>
      );
    if (status === "Rejected")
      return (
        <Badge bg="danger">
          <FaTimesCircle /> Rejected
        </Badge>
      );
    return (
      <Badge bg="warning" text="dark">
        <FaClock /> Pending
      </Badge>
    );
  };
  // --- NEW HELPER: Overall Admission Status ---
  const renderOverallStatus = (status) => {
    switch (status) {
      case "Active":
        return (
          <Badge bg="success" style={{ fontSize: "0.9rem" }}>
            ADMITTED
          </Badge>
        );
      case "Alumni":
        return (
          <Badge bg="info" style={{ fontSize: "0.9rem" }}>
            ALUMNI
          </Badge>
        );
      case "Rejected":
        return (
          <Badge bg="danger" style={{ fontSize: "0.9rem" }}>
            REJECTED
          </Badge>
        );
      default: // 'In Review' or 'Draft'
        return (
          <Badge bg="secondary" style={{ fontSize: "0.9rem" }}>
            IN REVIEW
          </Badge>
        );
    }
  };

  return (
    <div>
      <Row className="mb-4 align-items-center">
        <Col>
          <h2
            className="text-maroon"
            style={{ fontFamily: "Playfair Display" }}
          >
            Student Admissions
          </h2>
        </Col>
        <Col className="text-end">
          {/* --- EXPORT BUTTON (Beside New Admission) --- */}
          <Button variant="success" className="me-2" onClick={handleExport}>
            <FaFileDownload /> Export List
          </Button>

          <Button
            variant="primary"
            style={{ backgroundColor: "#581818", border: "none" }}
            onClick={() => setShowAddModal(true)}
          >
            <FaPlus /> New Admission
          </Button>
        </Col>
      </Row>

      <Card className="shadow-sm border-0">
        <Card.Body className="p-0">
          <Table hover responsive className="align-middle mb-0">
            <thead className="bg-light">
              <tr>
                <th className="ps-4">Name</th>
                <th>Guardian</th>
                <th>Branch</th>
                <th className="text-center">Approvals</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s._id}>
                  <td className="ps-4 fw-bold">
                    {s.firstName} {s.lastName}
                  </td>
                  <td>{s.guardianName}</td>
                  <td>{s.branch}</td>
                  <td className="text-center">
                    <small>
                      P:{" "}
                      {s.approvals.president.status === "Approved"
                        ? "✅"
                        : "⏳"}{" "}
                      | S:{" "}
                      {s.approvals.secretary.status === "Approved"
                        ? "✅"
                        : "⏳"}{" "}
                      | T:{" "}
                      {s.approvals.treasurer.status === "Approved"
                        ? "✅"
                        : "⏳"}
                    </small>
                  </td>
                  {/* <td>
                    {s.admissionStatus === "Active" ? (
                      <Badge bg="success">Admitted</Badge>
                    ) : (
                      <Badge bg="secondary">In Review</Badge>
                    )}
                  </td> */}
                  {/* --- FIXED STATUS COLUMN --- */}
                  <td>{renderOverallStatus(s.admissionStatus)}</td>
                  {/* --------------------------- */}

                  <td></td>
                  <td>
                    <div className="d-flex gap-2">
                      <Button
                        size="sm"
                        variant="outline-primary"
                        onClick={() => openViewModal(s)}
                        title="View Status"
                      >
                        <FaEye />
                      </Button>

                      <Link
                        to={`/dashboard/students/${s._id}`}
                        className="btn btn-sm btn-dark"
                        title="Full Profile"
                      >
                        <FaUserGraduate />
                      </Link>

                      {/* Delete Button (Admin Only) */}
                      {currentUser?.role === "admin" && (
                        <Button
                          size="sm"
                          variant="outline-danger"
                          onClick={() => handleDelete(s._id)}
                          title="Delete"
                        >
                          <FaTrash />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {students.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center py-5">
                    No students found
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* --- MODALS (View & Add) --- */}
      <Modal
        show={showViewModal}
        onHide={() => setShowViewModal(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Application Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedStudent && (
            <>
              <h4 className="text-maroon">
                {selectedStudent.firstName} {selectedStudent.lastName}
              </h4>
              <p className="text-muted">
                Guardian: {selectedStudent.guardianName}
              </p>
              <hr />
              <h5 className="mb-3">Approval Workflow</h5>

              {/* President */}
              <div className="d-flex justify-content-between align-items-center mb-3 p-2 border rounded">
                <div>
                  <strong>1. President Review</strong>
                </div>
                <div>
                  <StatusBadge
                    status={selectedStudent.approvals.president.status}
                  />
                </div>
                {currentUser?.role === "president" &&
                  selectedStudent.approvals.president.status === "Pending" && (
                    <div>
                      <Button
                        size="sm"
                        variant="success"
                        className="me-2"
                        onClick={() => handleApprove("Approved")}
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleApprove("Rejected")}
                      >
                        Reject
                      </Button>
                    </div>
                  )}
              </div>

              {/* Secretary */}
              <div className="d-flex justify-content-between align-items-center mb-3 p-2 border rounded">
                <div>
                  <strong>2. Secretary Review</strong>
                </div>
                <div>
                  <StatusBadge
                    status={selectedStudent.approvals.secretary.status}
                  />
                </div>
                {currentUser?.role === "secretary" &&
                  selectedStudent.approvals.secretary.status === "Pending" && (
                    <div>
                      <Button
                        size="sm"
                        variant="success"
                        className="me-2"
                        onClick={() => handleApprove("Approved")}
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleApprove("Rejected")}
                      >
                        Reject
                      </Button>
                    </div>
                  )}
              </div>

              {/* Treasurer */}
              <div className="d-flex justify-content-between align-items-center mb-3 p-2 border rounded">
                <div>
                  <strong>3. Treasurer Review</strong>
                </div>
                <div>
                  <StatusBadge
                    status={selectedStudent.approvals.treasurer.status}
                  />
                </div>
                {currentUser?.role === "treasurer" &&
                  selectedStudent.approvals.treasurer.status === "Pending" && (
                    <div>
                      <Button
                        size="sm"
                        variant="success"
                        className="me-2"
                        onClick={() => handleApprove("Approved")}
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleApprove("Rejected")}
                      >
                        Reject
                      </Button>
                    </div>
                  )}
              </div>
            </>
          )}
        </Modal.Body>
      </Modal>

      <Modal
        show={showAddModal}
        onHide={() => setShowAddModal(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>New Student Application</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6} className="mb-3">
                <Form.Label>First Name</Form.Label>
                <Form.Control
                  name="firstName"
                  onChange={handleChange}
                  required
                />
              </Col>
              <Col md={6} className="mb-3">
                <Form.Label>Last Name</Form.Label>
                <Form.Control
                  name="lastName"
                  onChange={handleChange}
                  required
                />
              </Col>
              <Col md={6} className="mb-3">
                <Form.Label>Date of Birth</Form.Label>
                <Form.Control
                  type="date"
                  name="dob"
                  onChange={handleChange}
                  required
                />
              </Col>
              <Col md={6} className="mb-3">
                <Form.Label>Guardian Name</Form.Label>
                <Form.Control
                  name="guardianName"
                  onChange={handleChange}
                  required
                />
              </Col>
              <Col md={6} className="mb-3">
                <Form.Label>Contact Number</Form.Label>
                <Form.Control
                  name="contactNumber"
                  onChange={handleChange}
                  required
                />
              </Col>
              <Col md={12} className="mb-3">
                <Form.Label>Address</Form.Label>
                <Form.Control
                  as="textarea"
                  name="address"
                  onChange={handleChange}
                  required
                />
              </Col>
            </Row>
            <Button type="submit" className="w-100 btn-ashram">
              Submit Application
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default StudentList;
