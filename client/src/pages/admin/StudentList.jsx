/* eslint-disable react-hooks/immutability */
/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
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
  ButtonGroup,
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
  FaFileUpload,
  FaUserFriends,
  FaHistory,
} from "react-icons/fa";
import { Link } from "react-router-dom";

const StudentList = () => {
  const [students, setStudents] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  // --- FILTER STATE ---
  const [filterStatus, setFilterStatus] = useState("Active");

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    dob: "",
    gender: "Male",
    guardianName: "",
    contactNumber: "",
    address: "",
    branch: "Headquarters",
    admissionNumber: "",
    caseNumber: "",
    studentType: "General",
    alternateContact: "",
    currentClass: "",
  });

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("userInfo"));
    setCurrentUser(user);
    if (user) fetchStudents(user);
  }, []);

  const fetchStudents = async (user) => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get(`${BASE_URL}/api/students`, config);
      setStudents(data);
    } catch (error) {
      console.error(error);
    }
  };

  const filteredStudents = students.filter((s) => {
    if (filterStatus === "All") return true;
    if (filterStatus === "Alumni") return s.admissionStatus === "Alumni";
    if (filterStatus === "Active")
      return (
        s.admissionStatus === "Active" ||
        s.admissionStatus === "In Review" ||
        s.admissionStatus === "Draft"
      );
    return true;
  });

  const handleExport = () => {
    if (filteredStudents.length === 0)
      return alert("No data to export in current view");

    const headers = [
      "CCI Admin No",
      "Case Profile No",
      "First Name",
      "Last Name",
      "Class",
      "DOB",
      "Gender",
      "Mobile",
      "Alt Mobile (KSS)",
      "Student Type",
      "Branch",
      "Parent / Guardian",
      "Address",
      "Admission Status",
      "President Approval",
      "Secretary Approval",
      "Treasurer Approval",
    ];

    const rows = filteredStudents.map((s) => [
      s.admissionNumber || "-",
      s.caseNumber || "-",
      `"${s.firstName}"`,
      `"${s.lastName}"`,
      s.currentClass || "-",
      s.dob ? new Date(s.dob).toLocaleDateString() : "-",
      s.gender,
      `"${s.contactNumber || "-"}"`,
      `"${s.alternateContact || "-"}"`,
      s.studentType || "General",
      s.branch,
      `"${s.guardianName || "-"}"`,
      `"${s.address ? s.address.replace(/\n/g, " ") : "-"}"`,
      s.admissionStatus,
      s.approvals?.president?.status || "Pending",
      s.approvals?.secretary?.status || "Pending",
      s.approvals?.treasurer?.status || "Pending",
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      headers.join(",") +
      "\n" +
      rows.map((e) => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    const dateStr = new Date().toISOString().split("T")[0];
    link.setAttribute(
      "download",
      `KSS_${filterStatus}_Students_${dateStr}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this student record?"))
      return;
    try {
      const config = {
        headers: { Authorization: `Bearer ${currentUser.token}` },
      };
      await axios.delete(`${BASE_URL}/api/students/${id}`, config);
      fetchStudents(currentUser);
      alert("Student Deleted");
    } catch (error) {
      alert("Error deleting student");
    }
  };

  const handleApprove = async (status) => {
    try {
      const config = {
        headers: { Authorization: `Bearer ${currentUser.token}` },
      };
      await axios.put(
        `${BASE_URL}/api/students/${selectedStudent._id}/approve`,
        {
          status: status,
          remark: "Approved via Dashboard",
          approvalType: currentUser.role,
        },
        config,
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
      await axios.post(`${BASE_URL}/api/students`, formData, config);
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
        admissionNumber: "",
        caseNumber: "",
        studentType: "General",
        alternateContact: "",
        currentClass: "",
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

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const config = {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${userInfo.token}`,
        },
      };

      const { data } = await axios.post(
        `${BASE_URL}/api/students/import`,
        formData,
        config,
      );

      alert(data.message);
      fetchStudents(userInfo);
    } catch (err) {
      alert(err.response?.data?.message || "Import Failed");
    }
  };

  return (
    <div>
      {/* HEADER */}
      <Row className="mb-4 align-items-center">
        <Col lg={5} xs={12} className="mb-3 mb-lg-0">
          <h2
            className="text-maroon m-0"
            style={{ fontFamily: "Playfair Display" }}
          >
            Student Admissions
          </h2>
          <p className="text-muted m-0 small">Manage enrollments & alumni</p>
        </Col>

        <Col lg={7} xs={12}>
          <div className="d-flex flex-wrap gap-2 justify-content-lg-end justify-content-start">
            <input
              type="file"
              id="csvInput"
              accept=".csv"
              style={{ display: "none" }}
              onChange={handleImport}
            />

            <Button
              variant="warning"
              className="text-dark shadow-sm flex-grow-1 flex-lg-grow-0"
              onClick={() => document.getElementById("csvInput").click()}
            >
              <FaFileUpload className="me-1" /> Import CSV
            </Button>

            <Button
              variant="success"
              className="shadow-sm flex-grow-1 flex-lg-grow-0"
              onClick={handleExport}
            >
              <FaFileDownload className="me-1" /> Export List
            </Button>

            <Button
              variant="primary"
              className="shadow-sm flex-grow-1 flex-lg-grow-0"
              style={{ backgroundColor: "#581818", border: "none" }}
              onClick={() => setShowAddModal(true)}
            >
              <FaPlus className="me-1" /> New Admission
            </Button>
          </div>
        </Col>
      </Row>

      {/* FILTER TABS */}
      <div className="mb-3">
        <ButtonGroup className="d-flex flex-wrap shadow-sm">
          <Button
            variant={filterStatus === "Active" ? "dark" : "outline-dark"}
            className="flex-grow-1"
            onClick={() => setFilterStatus("Active")}
          >
            <FaUserFriends className="me-2" /> Current{" "}
            <span className="d-none d-sm-inline">Students</span>
          </Button>
          <Button
            variant={filterStatus === "Alumni" ? "info" : "outline-info"}
            className="flex-grow-1"
            onClick={() => setFilterStatus("Alumni")}
          >
            <FaHistory className="me-2" /> Alumni{" "}
            <span className="d-none d-sm-inline">List</span>
          </Button>
          <Button
            variant={filterStatus === "All" ? "secondary" : "outline-secondary"}
            className="flex-grow-1"
            onClick={() => setFilterStatus("All")}
          >
            All <span className="d-none d-sm-inline">Records</span>
          </Button>
        </ButtonGroup>
      </div>

      <Card className="shadow-sm border-0">
        <Card.Body className="p-0">
          <Table
            hover
            responsive
            className="align-middle mb-0 table-striped"
            style={{ fontSize: "0.85rem" }}
          >
            <thead className="bg-light text-uppercase">
              <tr>
                <th className="ps-3">Admin No</th>
                <th>Name / Case No</th>
                <th>Class</th>
                <th>DOB</th>
                <th>Mobile</th>
                <th>Alt Mobile</th>
                <th>Branch</th>
                <th>Type</th>
                <th className="text-center">Approvals</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((s) => (
                <tr key={s._id}>
                  <td className="ps-3 fw-bold text-primary">
                    {s.admissionNumber || "-"}
                  </td>

                  <td>
                    <div className="fw-bold text-dark">
                      {s.firstName} {s.lastName}
                    </div>
                    {s.caseNumber && (
                      <div className="text-muted small">
                        Case: {s.caseNumber}
                      </div>
                    )}
                  </td>

                  <td>{s.currentClass || "-"}</td>
                  <td>{s.dob ? new Date(s.dob).toLocaleDateString() : "-"}</td>
                  <td>{s.contactNumber || "-"}</td>
                  <td>{s.alternateContact || "-"}</td>

                  <td>
                    <Badge bg="light" text="dark" className="border">
                      {s.branch}
                    </Badge>
                  </td>

                  <td>
                    <Badge
                      bg={
                        s.studentType === "Orphan"
                          ? "danger"
                          : s.studentType === "Semi_Orphan"
                            ? "warning"
                            : "secondary"
                      }
                    >
                      {s.studentType}
                    </Badge>
                  </td>

                  <td className="text-center">
                    <div
                      className="d-flex justify-content-center gap-1"
                      style={{ fontSize: "0.7rem" }}
                    >
                      <span
                        title="President"
                        className={
                          s.approvals.president.status === "Approved"
                            ? "text-success"
                            : "text-muted"
                        }
                      >
                        P:
                        {s.approvals.president.status === "Approved"
                          ? "✅"
                          : "⏳"}
                      </span>
                      <span className="text-muted">|</span>
                      <span
                        title="Secretary"
                        className={
                          s.approvals.secretary.status === "Approved"
                            ? "text-success"
                            : "text-muted"
                        }
                      >
                        S:
                        {s.approvals.secretary.status === "Approved"
                          ? "✅"
                          : "⏳"}
                      </span>
                      <span className="text-muted">|</span>
                      <span
                        title="Treasurer"
                        className={
                          s.approvals.treasurer.status === "Approved"
                            ? "text-success"
                            : "text-muted"
                        }
                      >
                        T:
                        {s.approvals.treasurer.status === "Approved"
                          ? "✅"
                          : "⏳"}
                      </span>
                    </div>
                  </td>

                  <td>
                    <div className="d-flex gap-2">
                      <Button
                        size="sm"
                        variant="outline-primary"
                        onClick={() => openViewModal(s)}
                        title="View Status / Approve"
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

                      {currentUser?.role === "admin" && (
                        <Button
                          size="sm"
                          variant="outline-danger"
                          onClick={() => handleDelete(s._id)}
                        >
                          <FaTrash />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredStudents.length === 0 && (
                <tr>
                  <td colSpan="10" className="text-center py-5 text-muted">
                    No records found in "{filterStatus}" view.
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* VIEW MODAL */}
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
                Parent/Guardian: {selectedStudent.guardianName}
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

      {/* ADD MODAL */}
      <Modal
        show={showAddModal}
        onHide={() => setShowAddModal(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>New Student Admission</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <h6 className="text-maroon">Official Details</h6>
            <Row>
              <Col md={4} className="mb-3">
                <Form.Label>Admission Admin No</Form.Label>
                <Form.Control name="admissionNumber" onChange={handleChange} />
              </Col>
              <Col md={4} className="mb-3">
                <Form.Label>Case Profile No</Form.Label>
                <Form.Control name="caseNumber" onChange={handleChange} />
              </Col>
              <Col md={4} className="mb-3">
                <Form.Label>Student Type</Form.Label>
                <Form.Select name="studentType" onChange={handleChange}>
                  <option value="General">General</option>
                  <option value="BPL">BPL</option>
                  <option value="Orphan">Orphan</option>
                  <option value="Semi_Orphan">Semi-Orphan</option>
                </Form.Select>
              </Col>
            </Row>

            <h6 className="text-maroon mt-2">Personal Details</h6>
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
              <Col md={4} className="mb-3">
                <Form.Label>DOB</Form.Label>
                <Form.Control
                  type="date"
                  name="dob"
                  onChange={handleChange}
                  required
                />
              </Col>
              <Col md={4} className="mb-3">
                <Form.Label>Gender</Form.Label>
                <Form.Select name="gender" onChange={handleChange}>
                  <option>Male</option>
                  <option>Female</option>
                </Form.Select>
              </Col>
              <Col md={4} className="mb-3">
                <Form.Label>Class</Form.Label>
                <Form.Control
                  name="currentClass"
                  placeholder="e.g. 5th Class"
                  onChange={handleChange}
                />
              </Col>
            </Row>

            <h6 className="text-maroon mt-2">Guardian & Contact</h6>
            <Row>
              <Col md={6} className="mb-3">
                <Form.Label>Parent / Guardian</Form.Label>
                <Form.Control
                  name="guardianName"
                  onChange={handleChange}
                  placeholder="If applicable"
                />
              </Col>
              <Col md={6} className="mb-3">
                <Form.Label>Branch</Form.Label>
                <Form.Select name="branch" onChange={handleChange}>
                  <option value="Headquarters">Headquarters</option>
                  <option value="Karunya Sindhu">Karunya Sindhu</option>
                  <option value="Karunya Bharathi">Karunya Bharathi</option>
                  <option value="Karunya Jyothi">Karunya Jyothi</option>
                  <option value="KarunaSri Seva Samithi">
                    KarunaSri Seva Samithi
                  </option>
                </Form.Select>
              </Col>
              <Col md={6} className="mb-3">
                <Form.Label>Primary Contact</Form.Label>
                <Form.Control name="contactNumber" onChange={handleChange} />
              </Col>
              <Col md={6} className="mb-3">
                <Form.Label>Alternate Contact</Form.Label>
                <Form.Control name="alternateContact" onChange={handleChange} />
              </Col>
              <Col md={12} className="mb-3">
                <Form.Label>Address</Form.Label>
                <Form.Control
                  as="textarea"
                  name="address"
                  onChange={handleChange}
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
