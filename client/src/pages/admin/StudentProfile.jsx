/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import axios from "axios";
import BASE_URL from "../../apiConfig";
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
  FaSave,
  FaBriefcase,
  FaMapMarkerAlt,
  FaEnvelope,
  FaTrash,
  FaPhone,
  FaFileAlt,
  FaCloudUploadAlt,
  FaSuitcase,
  FaGavel,
  FaClipboardCheck,
  FaBuilding,
  FaMedal,
  FaRunning,
} from "react-icons/fa";

const StudentProfile = () => {
  const { id } = useParams();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  // Edit Mode State
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});

  // --- ACADEMIC STATE (Updated for Marks) ---
  const [newEdu, setNewEdu] = useState({
    year: "",
    class: "",
    school: "",
    examName: "",
    maxMarks: "",
    marksObtained: "",
    percentage: "",
  });

  const [newHealth, setNewHealth] = useState({
    checkupType: "",
    doctorName: "",
    observation: "",
  });
  const [newExpense, setNewExpense] = useState({ description: "", amount: "" });

  // Sponsor States
  const [showSponsorModal, setShowSponsorModal] = useState(false);
  const [donors, setDonors] = useState([]);
  const [selectedSponsorId, setSelectedSponsorId] = useState("");

  // --- ALUMNI STATE ---
  const [showAlumniModal, setShowAlumniModal] = useState(false);
  const [alumniData, setAlumniData] = useState({
    jobTitle: "",
    company: "",
    currentLocation: "",
    email: "",
    phone: "",
    exitDate: "",
    reason: "",
  });

  // --- TRANSFER STATE ---
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferData, setTransferData] = useState({
    targetBranch: "",
    reason: "",
  });

  // Document & Other States
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [newLeave, setNewLeave] = useState({
    startDate: "",
    endDate: "",
    reason: "",
  });

  const [forms, setForms] = useState({
    form20: false,
    form44: false,
    form37: false,
    form17: false,
    form18: false,
    form7: false,
  });
  const [newInspection, setNewInspection] = useState({
    date: "",
    officialName: "",
    department: "",
    remarks: "",
    status: "Satisfactory",
  });
  const [newActivity, setNewActivity] = useState({
    activityType: "Sports",
    name: "",
    participationLevel: "",
    achievement: "",
  });

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("userInfo"));
    setCurrentUser(user);
    fetchStudent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchStudent = async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const { data } = await axios.get(
        `${BASE_URL}/api/students/${id}`,
        config,
      );
      setStudent(data);
      setEditData(data);
      if (data.formsStatus) setForms(data.formsStatus);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  // --- HANDLERS ---

  // 1. TRANSFER HANDLERS
  const handleRequestTransfer = async () => {
    if (!transferData.targetBranch || !transferData.reason)
      return alert("Fill all details");
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      await axios.put(
        `${BASE_URL}/api/students/${id}`,
        {
          action: "request_transfer",
          ...transferData,
        },
        config,
      );
      setShowTransferModal(false);
      fetchStudent();
      alert("Transfer Request Sent!");
    } catch (err) {
      alert("Error requesting transfer");
    }
  };

  const handleApproveTransfer = async (status) => {
    if (!window.confirm(`Confirm ${status}?`)) return;
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      await axios.put(
        `${BASE_URL}/api/students/${id}/approve-transfer`,
        { status },
        config,
      );
      fetchStudent();
      alert(`Transfer ${status}`);
    } catch (err) {
      alert("Error processing transfer");
    }
  };

  // 2. ALUMNI HANDLERS
  const handleConvertToAlumni = async () => {
    if (!alumniData.reason || !alumniData.exitDate)
      return alert("Please fill Exit Date and Reason");
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      await axios.put(
        `${BASE_URL}/api/students/${id}`,
        {
          action: "request_exit",
          exitDate: alumniData.exitDate,
          reason: alumniData.reason,
          alumniDetails: alumniData,
        },
        config,
      );
      setShowAlumniModal(false);
      fetchStudent();
      alert("Exit Request Submitted!");
    } catch (err) {
      alert(err.response?.data?.message || "Error");
    }
  };

  const handleApproveExit = async (status) => {
    if (!window.confirm(`Confirm ${status} for Alumni Exit?`)) return;
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      await axios.put(
        `${BASE_URL}/api/students/${id}/approve-exit`,
        { status },
        config,
      );
      alert(`Exit Request ${status}`);
      fetchStudent();
    } catch (err) {
      alert("Error updating status");
    }
  };

  // 3. EDUCATION HANDLER (UPDATED FOR MARKS)
  const addEducation = () => {
    if (!newEdu.year || !newEdu.examName)
      return alert("Please fill Year and Exam Name");

    // Auto-calculate percentage
    let calcPercentage = newEdu.percentage;
    if (newEdu.maxMarks && newEdu.marksObtained) {
      const p = (Number(newEdu.marksObtained) / Number(newEdu.maxMarks)) * 100;
      calcPercentage = p.toFixed(2) + "%";
    }

    const entry = { ...newEdu, percentage: calcPercentage };
    const updatedHistory = [...student.educationHistory, entry];
    handleUpdate({ educationHistory: updatedHistory });
    setNewEdu({
      year: "",
      class: "",
      school: "",
      examName: "",
      maxMarks: "",
      marksObtained: "",
      percentage: "",
    });
  };

  // 4. GENERIC UPDATE
  const handleUpdate = async (updateData) => {
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      await axios.put(`${BASE_URL}/api/students/${id}`, updateData, config);
      fetchStudent();
    } catch (error) {
      alert("Error updating student");
    }
  };

  // ... (Keep existing simple handlers for Health, Expense, Docs, Leaves) ...
  const handleFileChange = (e) => setFiles(e.target.files);
  const handleUpload = async (e) => {
    e.preventDefault();
    if (files.length === 0) return alert("Select files");
    const fd = new FormData();
    for (let i = 0; i < files.length; i++) fd.append("files", files[i]);
    setUploading(true);
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const config = {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${userInfo.token}`,
        },
      };
      await axios.post(`${BASE_URL}/api/students/${id}/upload`, fd, config);
      alert("Uploaded!");
      setFiles([]);
      fetchStudent();
    } catch (err) {
      alert("Upload failed");
    }
    setUploading(false);
  };
  const handleDeleteDoc = async (filePath) => {
    if (!window.confirm("Delete?")) return;
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const config = {
        headers: { Authorization: `Bearer ${userInfo.token}` },
        data: { filePath },
      };
      await axios.delete(`${BASE_URL}/api/students/${id}/documents`, config);
      fetchStudent();
    } catch (err) {
      alert("Delete failed");
    }
  };
  const addLeave = async () => {
    if (!newLeave.startDate || !newLeave.reason) return alert("Fill details");
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      await axios.post(
        `${BASE_URL}/api/students/${id}/leave`,
        newLeave,
        config,
      );
      setNewLeave({ startDate: "", endDate: "", reason: "" });
      fetchStudent();
    } catch (err) {
      alert("Error");
    }
  };
  const markReturned = async (leaveId) => {
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      await axios.put(
        `${BASE_URL}/api/students/${id}/leave/${leaveId}`,
        {},
        config,
      );
      fetchStudent();
    } catch (err) {
      alert("Error");
    }
  };
  const addHealth = () => {
    if (!newHealth.checkupType) return alert("Details missing");
    const updatedHealth = [...student.healthRecords, newHealth];
    handleUpdate({ healthRecords: updatedHealth });
    setNewHealth({ checkupType: "", doctorName: "", observation: "" });
  };
  const addExpense = () => {
    if (!newExpense.description || !newExpense.amount)
      return alert("Details missing");
    handleUpdate({
      newExpense: {
        description: newExpense.description,
        amount: Number(newExpense.amount),
        date: new Date(),
      },
    });
    setNewExpense({ description: "", amount: "" });
  };
  const addActivity = () => {
    if (!newActivity.name) return alert("Details missing");
    handleUpdate({ newActivityEntry: { ...newActivity, date: new Date() } });
    setNewActivity({
      activityType: "Sports",
      name: "",
      participationLevel: "",
      achievement: "",
    });
  };
  const handleFormToggle = async (formName) => {
    const updatedForms = { ...forms, [formName]: !forms[formName] };
    setForms(updatedForms);
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      await axios.put(
        `${BASE_URL}/api/students/${id}/statutory`,
        { formsStatus: updatedForms },
        config,
      );
    } catch (err) {
      alert("Error");
    }
  };
  const addInspection = async () => {
    if (!newInspection.officialName) return alert("Details missing");
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const { data } = await axios.put(
        `${BASE_URL}/api/students/${id}/statutory`,
        { newInspection },
        config,
      );
      setStudent(data);
      setNewInspection({
        date: "",
        officialName: "",
        department: "",
        remarks: "",
        status: "Satisfactory",
      });
    } catch (err) {
      alert("Error");
    }
  };
  const saveProfileChanges = async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      await axios.put(
        `${BASE_URL}/api/students/${id}`,
        { ...editData },
        config,
      );
      setIsEditing(false);
      fetchStudent();
      alert("Saved!");
    } catch (error) {
      alert("Error");
    }
  };
  const openSponsorModal = async () => {
    setShowSponsorModal(true);
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const { data } = await axios.get(`${BASE_URL}/api/donations`, config);
      setDonors(data);
    } catch (err) {
      alert("Failed to load donors");
    }
  };
  const mapSponsor = async () => {
    if (!selectedSponsorId) return alert("Select a sponsor");
    await handleUpdate({ sponsor: selectedSponsorId });
    setShowSponsorModal(false);
    alert("Mapped!");
  };

  if (loading)
    return (
      <div className="text-center py-5">
        <Spinner animation="border" />
      </div>
    );
  const currentLeave = student.leaves?.find((l) => l.status === "On Leave");

  return (
    <div>
      {/* HEADER */}
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
            ID: {student.admissionNumber || student._id.slice(-6).toUpperCase()}
          </span>
        </div>
        <div className="ms-auto d-flex gap-2">
          {currentLeave && (
            <Badge bg="warning" text="dark" className="align-self-center me-2">
              ON LEAVE
            </Badge>
          )}

          {/* TRANSFER BUTTON (Visible only if Active) */}
          {student.admissionStatus === "Active" && (
            <Button
              variant="outline-dark"
              onClick={() => setShowTransferModal(true)}
            >
              <FaBuilding className="me-1" /> Transfer
            </Button>
          )}

          {/* ALUMNI BUTTON (Visible only if Active) */}
          {student.admissionStatus === "Active" && (
            <Button
              variant="outline-primary"
              onClick={() => {
                setAlumniData({
                  jobTitle: "",
                  company: "",
                  currentLocation: "",
                  email: "",
                  phone: "",
                  exitDate: "",
                  reason: "",
                });
                setShowAlumniModal(true);
              }}
            >
              <FaUserGraduate className="me-1" /> Mark Alumni
            </Button>
          )}

          {isEditing ? (
            <Button variant="success" onClick={saveProfileChanges}>
              <FaSave /> Save
            </Button>
          ) : (
            <Button
              variant="primary"
              style={{ backgroundColor: "#581818" }}
              onClick={() => setIsEditing(true)}
            >
              <FaEdit /> Edit
            </Button>
          )}
        </div>
      </div>

      {/* --- TRANSFER REQUEST PENDING BANNER --- */}
      {student.transferRequest?.status === "Pending" && (
        <Alert
          variant="info"
          className="d-flex justify-content-between align-items-center mb-4"
        >
          <div>
            <strong>
              <FaBuilding className="me-2" /> Transfer Requested
            </strong>
            <span className="mx-2">to</span>
            <Badge bg="dark">{student.transferRequest.targetBranch}</Badge>
            <div className="small mt-1">
              Reason: {student.transferRequest.reason}
            </div>
          </div>
          {(currentUser?.role === "president" ||
            currentUser?.role === "admin") && (
            <div>
              <Button
                size="sm"
                variant="success"
                className="me-2"
                onClick={() => handleApproveTransfer("Approved")}
              >
                Approve
              </Button>
              <Button
                size="sm"
                variant="danger"
                onClick={() => handleApproveTransfer("Rejected")}
              >
                Reject
              </Button>
            </div>
          )}
        </Alert>
      )}

      {/* --- ALUMNI EXIT APPROVAL WORKFLOW --- */}
      {student.admissionStatus === "Exit_Pending" && (
        <Card className="mb-4 border-warning shadow-sm">
          <Card.Header className="bg-warning text-dark fw-bold d-flex align-items-center">
            <FaGavel className="me-2" /> Alumni Exit Request Pending
          </Card.Header>
          <Card.Body>
            <Row className="align-items-center">
              <Col md={8}>
                <h6 className="fw-bold">
                  Reason: {student.exitRequest?.reason}
                </h6>
                <small>
                  Requested Date:{" "}
                  {new Date(
                    student.exitRequest?.requestedDate,
                  ).toLocaleDateString()}
                </small>
              </Col>
              <Col md={4}>
                <Table size="sm" bordered className="mb-0 text-center bg-white">
                  <tbody>
                    <tr>
                      <td className="small fw-bold">President</td>
                      <td>
                        <Badge
                          bg={
                            student.exitRequest?.approvals?.president
                              ?.status === "Approved"
                              ? "success"
                              : "secondary"
                          }
                        >
                          {student.exitRequest?.approvals?.president?.status}
                        </Badge>
                      </td>
                      <td>
                        {(currentUser?.role === "president" ||
                          currentUser?.role === "admin") &&
                          student.exitRequest?.approvals?.president?.status ===
                            "Pending" && (
                            <Button
                              size="sm"
                              variant="success"
                              className="py-0"
                              onClick={() => handleApproveExit("Approved")}
                            >
                              ✓
                            </Button>
                          )}
                      </td>
                    </tr>
                    <tr>
                      <td className="small fw-bold">Secretary</td>
                      <td>
                        <Badge
                          bg={
                            student.exitRequest?.approvals?.secretary
                              ?.status === "Approved"
                              ? "success"
                              : "secondary"
                          }
                        >
                          {student.exitRequest?.approvals?.secretary?.status}
                        </Badge>
                      </td>
                      <td>
                        {(currentUser?.role === "secretary" ||
                          currentUser?.role === "admin") &&
                          student.exitRequest?.approvals?.secretary?.status ===
                            "Pending" && (
                            <Button
                              size="sm"
                              variant="success"
                              className="py-0"
                              onClick={() => handleApproveExit("Approved")}
                            >
                              ✓
                            </Button>
                          )}
                      </td>
                    </tr>
                    <tr>
                      <td className="small fw-bold">Treasurer</td>
                      <td>
                        <Badge
                          bg={
                            student.exitRequest?.approvals?.treasurer
                              ?.status === "Approved"
                              ? "success"
                              : "secondary"
                          }
                        >
                          {student.exitRequest?.approvals?.treasurer?.status}
                        </Badge>
                      </td>
                      <td>
                        {(currentUser?.role === "treasurer" ||
                          currentUser?.role === "admin") &&
                          student.exitRequest?.approvals?.treasurer?.status ===
                            "Pending" && (
                            <Button
                              size="sm"
                              variant="success"
                              className="py-0"
                              onClick={() => handleApproveExit("Approved")}
                            >
                              ✓
                            </Button>
                          )}
                      </td>
                    </tr>
                  </tbody>
                </Table>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      )}

      <Row>
        {/* LEFT COL */}
        <Col md={4}>
          <Card className="shadow-sm border-0 mb-4">
            <Card.Body>
              <div className="text-center mb-3">
                <div
                  className="bg-light rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                  style={{ width: "100px", height: "100px" }}
                >
                  <FaUserGraduate size={50} className="text-secondary" />
                </div>
                <div>
                  <Badge
                    bg={
                      student.admissionStatus === "Active" ? "success" : "info"
                    }
                  >
                    {student.admissionStatus}
                  </Badge>
                </div>
                <div className="mt-2 text-muted small">{student.branch}</div>
              </div>
              {isEditing ? (
                <Form>
                  <Form.Control
                    size="sm"
                    value={editData.firstName}
                    onChange={(e) =>
                      setEditData({ ...editData, firstName: e.target.value })
                    }
                    className="mb-2"
                  />
                  <Form.Control
                    size="sm"
                    value={editData.lastName}
                    onChange={(e) =>
                      setEditData({ ...editData, lastName: e.target.value })
                    }
                    className="mb-2"
                  />
                  <Form.Control
                    size="sm"
                    type="date"
                    value={editData.dob ? editData.dob.split("T")[0] : ""}
                    onChange={(e) =>
                      setEditData({ ...editData, dob: e.target.value })
                    }
                    className="mb-2"
                  />
                  <Form.Control
                    size="sm"
                    value={editData.guardianName}
                    onChange={(e) =>
                      setEditData({ ...editData, guardianName: e.target.value })
                    }
                    className="mb-2"
                    placeholder="Guardian"
                  />
                  <Form.Control
                    size="sm"
                    value={editData.contactNumber}
                    onChange={(e) =>
                      setEditData({
                        ...editData,
                        contactNumber: e.target.value,
                      })
                    }
                    className="mb-2"
                    placeholder="Contact"
                  />
                </Form>
              ) : (
                <div className="text-start small">
                  <p>
                    <strong>Guardian:</strong> {student.guardianName}
                  </p>
                  <p>
                    <strong>Contact:</strong> {student.contactNumber}
                  </p>
                  <p>
                    <strong>DOB:</strong>{" "}
                    {new Date(student.dob).toLocaleDateString()}
                  </p>
                </div>
              )}
            </Card.Body>
          </Card>

          {/* SPONSOR CARD */}
          <Card className="shadow-sm border-0 bg-light">
            <Card.Body>
              <h6 className="text-maroon fw-bold">
                <FaHandHoldingHeart /> Sponsor
              </h6>
              {student.sponsor ? (
                <div className="mt-2">
                  <small>
                    <strong>
                      {typeof student.sponsor === "object"
                        ? student.sponsor.donorName
                        : "Linked"}
                    </strong>
                  </small>
                  <Button
                    size="sm"
                    variant="outline-danger"
                    className="w-100 mt-2"
                    onClick={() => handleUpdate({ sponsor: null })}
                  >
                    Remove
                  </Button>
                </div>
              ) : (
                <Button
                  size="sm"
                  variant="outline-primary"
                  className="w-100 mt-2"
                  onClick={openSponsorModal}
                >
                  Map Sponsor
                </Button>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* RIGHT COL */}
        <Col md={8}>
          <Card className="shadow-sm border-0">
            <Card.Body>
              <Tabs defaultActiveKey="education" className="mb-3">
                {/* EDUCATION TAB (UPDATED) */}
                <Tab
                  eventKey="education"
                  title={
                    <span>
                      <FaBook /> Education
                    </span>
                  }
                >
                  <Table
                    striped
                    bordered
                    hover
                    size="sm"
                    className="text-center align-middle"
                  >
                    <thead className="bg-light">
                      <tr>
                        <th>Class</th>
                        <th>Exam</th>
                        <th>Marks</th>
                        <th>%</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {student.educationHistory.map((edu, idx) => (
                        <tr key={idx}>
                          <td>
                            <strong>{edu.class}</strong>
                            <br />
                            <small>{edu.year}</small>
                          </td>
                          <td className="text-primary fw-bold">
                            {edu.examName || "Annual"}
                          </td>
                          <td>
                            {edu.marksObtained}/{edu.maxMarks}
                          </td>
                          <td className="fw-bold">{edu.percentage}</td>
                          <td>
                            <Button
                              size="sm"
                              variant="link"
                              className="text-danger p-0"
                              onClick={() => {
                                const updated = student.educationHistory.filter(
                                  (_, i) => i !== idx,
                                );
                                handleUpdate({ educationHistory: updated });
                              }}
                            >
                              <FaTrash size={12} />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                  <div className="p-3 bg-light rounded border">
                    <h6 className="fw-bold text-maroon">Add Marks</h6>
                    <Row className="g-2 mb-2">
                      <Col md={3}>
                        <Form.Control
                          size="sm"
                          placeholder="Year"
                          value={newEdu.year}
                          onChange={(e) =>
                            setNewEdu({ ...newEdu, year: e.target.value })
                          }
                        />
                      </Col>
                      <Col md={3}>
                        <Form.Control
                          size="sm"
                          placeholder="Class"
                          value={newEdu.class}
                          onChange={(e) =>
                            setNewEdu({ ...newEdu, class: e.target.value })
                          }
                        />
                      </Col>
                      <Col md={6}>
                        <Form.Control
                          size="sm"
                          placeholder="School"
                          value={newEdu.school}
                          onChange={(e) =>
                            setNewEdu({ ...newEdu, school: e.target.value })
                          }
                        />
                      </Col>
                    </Row>
                    <Row className="g-2">
                      <Col md={3}>
                        <Form.Control
                          size="sm"
                          placeholder="Exam Name"
                          value={newEdu.examName}
                          onChange={(e) =>
                            setNewEdu({ ...newEdu, examName: e.target.value })
                          }
                        />
                      </Col>
                      <Col md={3}>
                        <Form.Control
                          size="sm"
                          type="number"
                          placeholder="Marks"
                          value={newEdu.marksObtained}
                          onChange={(e) =>
                            setNewEdu({
                              ...newEdu,
                              marksObtained: e.target.value,
                            })
                          }
                        />
                      </Col>
                      <Col md={3}>
                        <Form.Control
                          size="sm"
                          type="number"
                          placeholder="Max"
                          value={newEdu.maxMarks}
                          onChange={(e) =>
                            setNewEdu({ ...newEdu, maxMarks: e.target.value })
                          }
                        />
                      </Col>
                      <Col md={3}>
                        <Button
                          size="sm"
                          variant="dark"
                          className="w-100"
                          onClick={addEducation}
                        >
                          Add
                        </Button>
                      </Col>
                    </Row>
                  </div>
                </Tab>

                {/* HEALTH */}
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
                        <th>Observation</th>
                      </tr>
                    </thead>
                    <tbody>
                      {student.healthRecords.map((h, idx) => (
                        <tr key={idx}>
                          <td>{new Date(h.date).toLocaleDateString()}</td>
                          <td>{h.checkupType}</td>
                          <td>{h.observation}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                  <div className="input-group input-group-sm">
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
                    <Button onClick={addHealth}>Add</Button>
                  </div>
                </Tab>

                {/* STATUTORY */}
                <Tab
                  eventKey="legal"
                  title={
                    <span>
                      <FaGavel /> Legal
                    </span>
                  }
                >
                  <div className="p-3">
                    <h6 className="text-maroon border-bottom pb-2">
                      Mandatory Forms (JJ Act)
                    </h6>
                    <Row className="mb-3">
                      {Object.keys(forms).map((key) => (
                        <Col md={4} key={key}>
                          <Form.Check
                            type="switch"
                            label={key.toUpperCase().replace("FORM", "Form ")}
                            checked={forms[key]}
                            onChange={() => handleFormToggle(key)}
                          />
                        </Col>
                      ))}
                    </Row>
                    <h6 className="text-maroon border-bottom pb-2">
                      Inspection Log
                    </h6>
                    <div className="input-group input-group-sm mb-3">
                      <Form.Control
                        type="date"
                        value={newInspection.date}
                        onChange={(e) =>
                          setNewInspection({
                            ...newInspection,
                            date: e.target.value,
                          })
                        }
                      />
                      <Form.Control
                        placeholder="Official Name"
                        value={newInspection.officialName}
                        onChange={(e) =>
                          setNewInspection({
                            ...newInspection,
                            officialName: e.target.value,
                          })
                        }
                      />
                      <Button variant="dark" onClick={addInspection}>
                        Log
                      </Button>
                    </div>
                    <Table size="sm">
                      <tbody>
                        {student.inspections?.map((i, idx) => (
                          <tr key={idx}>
                            <td>{new Date(i.date).toLocaleDateString()}</td>
                            <td>{i.officialName}</td>
                            <td>{i.remarks}</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                </Tab>

                {/* DOCUMENTS */}
                <Tab
                  eventKey="docs"
                  title={
                    <span>
                      <FaFileAlt /> Docs
                    </span>
                  }
                >
                  <div className="p-3">
                    <Form onSubmit={handleUpload} className="d-flex gap-2 mb-3">
                      <Form.Control
                        type="file"
                        multiple
                        onChange={handleFileChange}
                      />
                      <Button type="submit" disabled={uploading}>
                        Upload
                      </Button>
                    </Form>
                    <Row>
                      {student.documents?.map((path, idx) => (
                        <Col xs={4} key={idx} className="mb-2">
                          <div className="border p-2 text-center position-relative">
                            <small className="d-block text-truncate">
                              Doc {idx + 1}
                            </small>
                            <a
                              href={`${BASE_URL}${path}`}
                              target="_blank"
                              rel="noreferrer"
                            >
                              View
                            </a>
                            <Button
                              size="sm"
                              variant="danger"
                              className="position-absolute top-0 end-0 p-0 px-1"
                              onClick={() => handleDeleteDoc(path)}
                            >
                              x
                            </Button>
                          </div>
                        </Col>
                      ))}
                    </Row>
                  </div>
                </Tab>
              </Tabs>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* MODALS */}
      <Modal
        show={showTransferModal}
        onHide={() => setShowTransferModal(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Transfer Student</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Label>Target Branch</Form.Label>
          <Form.Select
            className="mb-3"
            value={transferData.targetBranch}
            onChange={(e) =>
              setTransferData({ ...transferData, targetBranch: e.target.value })
            }
          >
            <option value="">-- Select --</option>
            <option value="Headquarters">Headquarters</option>
            <option value="Karunya Sindhu">Karunya Sindhu</option>
            <option value="Karunya Bharathi">Karunya Bharathi</option>
            <option value="Karunya Jyothi">Karunya Jyothi</option>
            <option value="Karuna Sree Seva Samithi">
              Karuna Sree Seva Samithi
            </option>
          </Form.Select>
          <Form.Label>Reason</Form.Label>
          <Form.Control
            as="textarea"
            className="mb-3"
            value={transferData.reason}
            onChange={(e) =>
              setTransferData({ ...transferData, reason: e.target.value })
            }
          />
          <Button
            className="w-100"
            variant="dark"
            onClick={handleRequestTransfer}
          >
            Submit Request
          </Button>
        </Modal.Body>
      </Modal>

      <Modal show={showAlumniModal} onHide={() => setShowAlumniModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Request Exit (Alumni)</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="warning" className="small">
            3-Tier Approval Required.
          </Alert>
          <Form.Group className="mb-2">
            <Form.Label>Exit Date</Form.Label>
            <Form.Control
              type="date"
              value={alumniData.exitDate}
              onChange={(e) =>
                setAlumniData({ ...alumniData, exitDate: e.target.value })
              }
            />
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>Reason</Form.Label>
            <Form.Control
              as="textarea"
              value={alumniData.reason}
              onChange={(e) =>
                setAlumniData({ ...alumniData, reason: e.target.value })
              }
            />
          </Form.Group>
          <h6 className="mt-3 border-bottom">Future Contact</h6>
          <Row className="g-2">
            <Col>
              <Form.Control
                size="sm"
                placeholder="Phone"
                value={alumniData.phone}
                onChange={(e) =>
                  setAlumniData({ ...alumniData, phone: e.target.value })
                }
              />
            </Col>
            <Col>
              <Form.Control
                size="sm"
                placeholder="City"
                value={alumniData.currentLocation}
                onChange={(e) =>
                  setAlumniData({
                    ...alumniData,
                    currentLocation: e.target.value,
                  })
                }
              />
            </Col>
          </Row>
          <Row className="g-2 mt-2">
            <Col>
              <Form.Control
                size="sm"
                placeholder="Job"
                value={alumniData.jobTitle}
                onChange={(e) =>
                  setAlumniData({ ...alumniData, jobTitle: e.target.value })
                }
              />
            </Col>
            <Col>
              <Form.Control
                size="sm"
                placeholder="Company"
                value={alumniData.company}
                onChange={(e) =>
                  setAlumniData({ ...alumniData, company: e.target.value })
                }
              />
            </Col>
          </Row>
          <Form.Control
            size="sm"
            placeholder="Email"
            value={alumniData.email}
            onChange={(e) =>
              setAlumniData({ ...alumniData, email: e.target.value })
            }
            className="mt-2"
          />
          <Button
            className="w-100 mt-3"
            variant="danger"
            onClick={handleConvertToAlumni}
          >
            Submit Request
          </Button>
        </Modal.Body>
      </Modal>

      <Modal show={showSponsorModal} onHide={() => setShowSponsorModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Map Sponsor</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Select onChange={(e) => setSelectedSponsorId(e.target.value)}>
            <option value="">-- Choose Donor --</option>
            {donors.map((d) => (
              <option key={d._id} value={d._id}>
                {d.donorName} - ₹{d.amount}
              </option>
            ))}
          </Form.Select>
          <Button className="w-100 mt-3" onClick={mapSponsor}>
            Map
          </Button>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default StudentProfile;
