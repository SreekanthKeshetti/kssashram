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
  const [currentUser, setCurrentUser] = useState(null); // Keep track of logged in user

  // Edit Mode State (For Basic Info)
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});

  // Sub-data States
  const [newEdu, setNewEdu] = useState({
    year: "",
    class: "",
    school: "",
    examName: "", // New
    maxMarks: "", // New
    marksObtained: "", // New
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

  // --- ALUMNI STATES ---
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

  // --- DOCUMENT STATES ---
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [newLeave, setNewLeave] = useState({
    startDate: "",
    endDate: "",
    reason: "",
  });
  // 1. STATE FOR INSPECTIONS & FORMS
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
  // --- NEW ACTIVITY STATE ---
  const [newActivity, setNewActivity] = useState({
    activityType: "Sports",
    name: "",
    participationLevel: "",
    achievement: "",
  });

  useEffect(() => {
    // Get current user info on mount
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
      // Load existing forms status
      if (data.formsStatus) {
        setForms(data.formsStatus);
      }
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  // --- DOCUMENT HANDLERS ---
  const handleFileChange = (e) => {
    setFiles(e.target.files);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (files.length === 0) return alert("Select files first");

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append("files", files[i]);
    }

    setUploading(true);
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const config = {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${userInfo.token}`,
        },
      };
      await axios.post(
        `${BASE_URL}/api/students/${id}/upload`,
        formData,
        config,
      );
      alert("Documents Uploaded!");
      setFiles([]);
      fetchStudent();
    } catch (err) {
      alert("Upload failed");
    }
    setUploading(false);
  };

  // --- LEAVE HANDLERS ---
  const addLeave = async () => {
    if (!newLeave.startDate || !newLeave.reason)
      return alert("Please fill Start Date and Reason");

    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      await axios.post(
        `${BASE_URL}/api/students/${id}/leave`,
        newLeave,
        config,
      );

      alert("Leave Recorded");
      setNewLeave({ startDate: "", endDate: "", reason: "" });
      fetchStudent();
    } catch (err) {
      alert("Error recording leave");
    }
  };

  const markReturned = async (leaveId) => {
    if (!window.confirm("Confirm student has returned to Ashram?")) return;
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      await axios.put(
        `${BASE_URL}/api/students/${id}/leave/${leaveId}`,
        {},
        config,
      );

      alert("Student Marked as Returned");
      fetchStudent();
    } catch (err) {
      alert("Error updating status");
    }
  };

  const handleDeleteDoc = async (filePath) => {
    if (!window.confirm("Delete this document?")) return;
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

  const saveProfileChanges = async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

      await axios.put(
        `${BASE_URL}/api/students/${id}`,
        {
          firstName: editData.firstName,
          lastName: editData.lastName,
          guardianName: editData.guardianName,
          contactNumber: editData.contactNumber,
          address: editData.address,
          dob: editData.dob,
        },
        config,
      );

      setIsEditing(false);
      fetchStudent();
      alert("Profile Updated Successfully!");
    } catch (error) {
      alert("Error updating profile");
    }
  };

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

  // --- ALUMNI HANDLERS ---

  const handleConvertToAlumni = async () => {
    // 1. Validate Input
    if (!alumniData.reason || !alumniData.exitDate)
      return alert("Please fill Exit Date and Reason");

    // 2. Call the new Request Exit Logic
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

      await axios.put(
        `${BASE_URL}/api/students/${id}`,
        {
          action: "request_exit",
          exitDate: alumniData.exitDate,
          reason: alumniData.reason,
          alumniDetails: alumniData, // Optional contact info
        },
        config,
      );

      setShowAlumniModal(false);
      fetchStudent(); // Refresh UI
      alert("Exit Request Submitted! Waiting for Committee Approval.");
    } catch (err) {
      alert(err.response?.data?.message || "Error submitting request");
    }
  };

  // 2. Edit Alumni (Open Modal with Data)
  const handleEditAlumni = () => {
    setAlumniData(student.alumniDetails);
    setShowAlumniModal(true);
  };

  // 3. Delete Alumni (Revert to Active)
  const handleDeleteAlumni = async () => {
    if (
      !window.confirm(
        "Are you sure? This will revert the student status back to 'Active'.",
      )
    )
      return;

    await handleUpdate({
      admissionStatus: "Active",
      alumniDetails: {
        jobTitle: "",
        company: "",
        currentLocation: "",
        email: "",
        phone: "",
      }, // Clear data
    });
    alert("Reverted to Active Student.");
  };

  // --- HANDLE EXIT APPROVAL ---
  const handleApproveExit = async (status) => {
    if (!window.confirm(`Confirm ${status} for Alumni Exit?`)) return;
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

      await axios.put(
        `${BASE_URL}/api/students/${id}/approve-exit`,
        { status }, // 'Approved' or 'Rejected'
        config,
      );

      alert(`Exit Request ${status}`);
      fetchStudent(); // Refresh UI
    } catch (err) {
      alert(err.response?.data?.message || "Error updating status");
    }
  };

  // --- Helper Functions ---
  // const addEducation = () => {
  //   if (!newEdu.year || !newEdu.school) return alert("Please fill details");
  //   const updatedHistory = [...student.educationHistory, newEdu];
  //   handleUpdate({ educationHistory: updatedHistory });
  //   setNewEdu({ year: "", class: "", school: "", percentage: "" });
  // };
  const addEducation = () => {
    if (!newEdu.year || !newEdu.examName)
      return alert("Please fill Year and Exam Name");

    // Auto-calculate percentage if marks are provided
    let calcPercentage = newEdu.percentage;
    if (newEdu.maxMarks && newEdu.marksObtained) {
      const p = (Number(newEdu.marksObtained) / Number(newEdu.maxMarks)) * 100;
      calcPercentage = p.toFixed(2) + "%";
    }

    const entry = { ...newEdu, percentage: calcPercentage };

    const updatedHistory = [...student.educationHistory, entry];
    handleUpdate({ educationHistory: updatedHistory });

    // Reset Form
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

  const addHealth = () => {
    if (!newHealth.checkupType) return alert("Please fill details");
    const updatedHealth = [...student.healthRecords, newHealth];
    handleUpdate({ healthRecords: updatedHealth });
    setNewHealth({ checkupType: "", doctorName: "", observation: "" });
  };

  const addExpense = () => {
    if (!newExpense.description || !newExpense.amount)
      return alert("Please enter description and amount");
    handleUpdate({
      newExpense: {
        description: newExpense.description,
        amount: Number(newExpense.amount),
        date: new Date(),
      },
    });
    setNewExpense({ description: "", amount: "" });
  };

  const openSponsorModal = async () => {
    setShowSponsorModal(true);
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const { data } = await axios.get(`${BASE_URL}/api/donations`, config);
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
  const currentLeave = student.leaves?.find((l) => l.status === "On Leave");

  // 3. HANDLERS
  const handleFormToggle = async (formName) => {
    const updatedForms = { ...forms, [formName]: !forms[formName] };
    setForms(updatedForms); // Optimistic UI update

    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      await axios.put(
        `${BASE_URL}/api/students/${id}/statutory`,
        { formsStatus: updatedForms },
        config,
      );
    } catch (err) {
      alert("Error updating form status");
    }
  };

  const addInspection = async () => {
    if (!newInspection.officialName || !newInspection.date)
      return alert("Fill details");

    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

      const { data } = await axios.put(
        `${BASE_URL}/api/students/${id}/statutory`,
        { newInspection },
        config,
      );

      setStudent(data); // Refresh student data with new log
      setNewInspection({
        date: "",
        officialName: "",
        department: "",
        remarks: "",
        status: "Satisfactory",
      });
      alert("Inspection Logged");
    } catch (err) {
      alert("Error adding inspection");
    }
  };
  // --- ADD ACTIVITY HANDLER ---
  const addActivity = () => {
    if (!newActivity.name || !newActivity.participationLevel)
      return alert("Please fill details");

    handleUpdate({
      newActivityEntry: {
        activityType: newActivity.activityType,
        name: newActivity.name,
        participationLevel: newActivity.participationLevel,
        achievement: newActivity.achievement,
        date: new Date(),
      },
    });

    setNewActivity({
      activityType: "Sports",
      name: "",
      participationLevel: "",
      achievement: "",
    });
    alert("Activity Added!");
  };

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
            ID: {student._id.slice(-6).toUpperCase()}
          </span>
        </div>
        <div className="ms-auto d-flex gap-2">
          {currentLeave && (
            <Badge bg="warning" text="dark" className="align-self-center me-2">
              ON LEAVE
            </Badge>
          )}
          {/* ALUMNI BUTTON: Only show if Active */}
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
                  exitDate: "", // Reset logic
                  reason: "",
                });
                setShowAlumniModal(true);
              }}
            >
              <FaUserGraduate /> Mark as Alumni
            </Button>
          )}

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

      {/* --- ALUMNI EXIT APPROVAL WORKFLOW (Visible only if Pending) --- */}
      {student.admissionStatus === "Exit_Pending" && (
        <Card className="mb-4 border-warning shadow-sm">
          <Card.Header className="bg-warning text-dark fw-bold d-flex align-items-center">
            <FaGavel className="me-2" /> Alumni Exit Request Pending
          </Card.Header>
          <Card.Body>
            <Row className="align-items-center">
              <Col md={8}>
                <h6 className="fw-bold">Reason for Leaving:</h6>
                <p className="text-muted fst-italic mb-2">
                  "{student.exitRequest?.reason}"
                </p>
                <small>
                  Requested Date:{" "}
                  {new Date(
                    student.exitRequest?.requestedDate,
                  ).toLocaleDateString()}
                </small>
                {/* DEBUG: Show who is logged in */}
                <div className="mt-2">
                  <Badge bg="dark" className="me-2">
                    Logged in as: {currentUser?.role}
                  </Badge>
                </div>
              </Col>

              <Col md={4}>
                <Table size="sm" bordered className="mb-0 text-center bg-white">
                  <tbody>
                    {/* --- PRESIDENT ROW --- */}
                    <tr>
                      <td className="small fw-bold align-middle">President</td>
                      <td className="align-middle">
                        <Badge
                          bg={
                            student.exitRequest?.approvals?.president
                              ?.status === "Approved"
                              ? "success"
                              : "secondary"
                          }
                        >
                          {student.exitRequest?.approvals?.president?.status ||
                            "Pending"}
                        </Badge>
                      </td>
                      <td className="align-middle">
                        {(currentUser?.role === "president" ||
                          currentUser?.role === "admin") &&
                          student.exitRequest?.approvals?.president?.status ===
                            "Pending" && (
                            <div className="d-flex gap-1 justify-content-center">
                              <Button
                                size="sm"
                                variant="success"
                                className="py-0 px-2"
                                onClick={() => handleApproveExit("Approved")}
                              >
                                ✓
                              </Button>
                              <Button
                                size="sm"
                                variant="outline-danger"
                                className="py-0 px-2"
                                onClick={() => handleApproveExit("Rejected")}
                              >
                                ✗
                              </Button>
                            </div>
                          )}
                      </td>
                    </tr>

                    {/* --- SECRETARY ROW --- */}
                    <tr>
                      <td className="small fw-bold align-middle">Secretary</td>
                      <td className="align-middle">
                        <Badge
                          bg={
                            student.exitRequest?.approvals?.secretary
                              ?.status === "Approved"
                              ? "success"
                              : "secondary"
                          }
                        >
                          {student.exitRequest?.approvals?.secretary?.status ||
                            "Pending"}
                        </Badge>
                      </td>
                      <td className="align-middle">
                        {(currentUser?.role === "secretary" ||
                          currentUser?.role === "admin") &&
                          student.exitRequest?.approvals?.secretary?.status ===
                            "Pending" && (
                            <div className="d-flex gap-1 justify-content-center">
                              <Button
                                size="sm"
                                variant="success"
                                className="py-0 px-2"
                                onClick={() => handleApproveExit("Approved")}
                              >
                                ✓
                              </Button>
                              <Button
                                size="sm"
                                variant="outline-danger"
                                className="py-0 px-2"
                                onClick={() => handleApproveExit("Rejected")}
                              >
                                ✗
                              </Button>
                            </div>
                          )}
                      </td>
                    </tr>

                    {/* --- TREASURER ROW --- */}
                    <tr>
                      <td className="small fw-bold align-middle">Treasurer</td>
                      <td className="align-middle">
                        <Badge
                          bg={
                            student.exitRequest?.approvals?.treasurer
                              ?.status === "Approved"
                              ? "success"
                              : "secondary"
                          }
                        >
                          {student.exitRequest?.approvals?.treasurer?.status ||
                            "Pending"}
                        </Badge>
                      </td>
                      <td className="align-middle">
                        {(currentUser?.role === "treasurer" ||
                          currentUser?.role === "admin") &&
                          student.exitRequest?.approvals?.treasurer?.status ===
                            "Pending" && (
                            <div className="d-flex gap-1 justify-content-center">
                              <Button
                                size="sm"
                                variant="success"
                                className="py-0 px-2"
                                onClick={() => handleApproveExit("Approved")}
                              >
                                ✓
                              </Button>
                              <Button
                                size="sm"
                                variant="outline-danger"
                                className="py-0 px-2"
                                onClick={() => handleApproveExit("Rejected")}
                              >
                                ✗
                              </Button>
                            </div>
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
        {/* Left Sidebar */}
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
                <div className="mb-2">
                  <Badge
                    bg={
                      student.admissionStatus === "Alumni"
                        ? "info"
                        : student.admissionStatus === "Active"
                          ? "success"
                          : "warning"
                    }
                  >
                    {student.admissionStatus}
                  </Badge>
                </div>
              </div>

              {isEditing ? (
                <Form>
                  <Row className="mb-2">
                    <Col>
                      <Form.Control
                        size="sm"
                        value={editData.firstName}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            firstName: e.target.value,
                          })
                        }
                        placeholder="First Name"
                      />
                    </Col>
                    <Col>
                      <Form.Control
                        size="sm"
                        value={editData.lastName}
                        onChange={(e) =>
                          setEditData({ ...editData, lastName: e.target.value })
                        }
                        placeholder="Last Name"
                      />
                    </Col>
                  </Row>
                  <Form.Control
                    size="sm"
                    type="date"
                    className="mb-2"
                    value={editData.dob ? editData.dob.split("T")[0] : ""}
                    onChange={(e) =>
                      setEditData({ ...editData, dob: e.target.value })
                    }
                  />
                  <Form.Control
                    size="sm"
                    className="mb-2"
                    value={editData.guardianName}
                    onChange={(e) =>
                      setEditData({ ...editData, guardianName: e.target.value })
                    }
                    placeholder="Parent / Guardian"
                  />
                  <Form.Control
                    size="sm"
                    className="mb-2"
                    value={editData.contactNumber}
                    onChange={(e) =>
                      setEditData({
                        ...editData,
                        contactNumber: e.target.value,
                      })
                    }
                    placeholder="Contact"
                  />
                  <Form.Control
                    size="sm"
                    as="textarea"
                    value={editData.address}
                    onChange={(e) =>
                      setEditData({ ...editData, address: e.target.value })
                    }
                    placeholder="Address"
                  />
                </Form>
              ) : (
                <div className="text-center">
                  <h5>
                    {student.firstName} {student.lastName}
                  </h5>
                  <p className="text-muted small">
                    {student.gender} |{" "}
                    {new Date(student.dob).toLocaleDateString()}
                  </p>
                  <hr />
                  <div className="text-start">
                    <p>
                      <strong>Parent / Guardian:</strong> {student.guardianName}
                    </p>
                    <p>
                      <strong>Contact:</strong> {student.contactNumber}
                    </p>
                    <p>
                      <strong>Address:</strong> {student.address}
                    </p>
                  </div>
                </div>
              )}
            </Card.Body>
          </Card>

          {/* --- ALUMNI DETAILS CARD (Visible only if Alumni) --- */}
          {student.admissionStatus === "Alumni" && student.alumniDetails && (
            <Card
              className="shadow-sm border-0 mb-4"
              style={{ borderLeft: "5px solid #0dcaf0" }}
            >
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h6 className="text-info fw-bold m-0">Alumni Information</h6>
                  <div>
                    <Button
                      size="sm"
                      variant="link"
                      className="p-0 me-2"
                      onClick={handleEditAlumni}
                    >
                      <FaEdit />
                    </Button>
                    <Button
                      size="sm"
                      variant="link"
                      className="p-0 text-danger"
                      onClick={handleDeleteAlumni}
                    >
                      <FaTrash />
                    </Button>
                  </div>
                </div>

                <p className="mb-1">
                  <FaBriefcase className="me-2 text-muted" />{" "}
                  {student.alumniDetails.jobTitle || "Not working"}
                </p>
                <p className="mb-1">
                  <strong>@</strong> {student.alumniDetails.company || "N/A"}
                </p>
                <p className="mb-1">
                  <FaMapMarkerAlt className="me-2 text-muted" />{" "}
                  {student.alumniDetails.currentLocation}
                </p>
                <hr />
                <p className="mb-1">
                  <FaEnvelope className="me-2 text-muted" />{" "}
                  {student.alumniDetails.email || "No Email"}
                </p>
                <p className="mb-0">
                  <FaPhone className="me-2 text-muted" />{" "}
                  {student.alumniDetails.phone}
                </p>
              </Card.Body>
            </Card>
          )}

          {/* Sponsor Card */}
          <Card className="shadow-sm border-0 bg-light">
            <Card.Body>
              <h6 className="text-maroon fw-bold">
                <FaHandHoldingHeart /> Sponsor Details
              </h6>

              {student.sponsor ? (
                <div className="mt-3">
                  <p className="text-success fw-bold mb-1">Sponsored</p>

                  {/* --- FIX: Handle Object vs String --- */}
                  <div className="text-muted small mb-3">
                    {typeof student.sponsor === "object" ? (
                      <>
                        <strong>Name:</strong> {student.sponsor.donorName}
                        <br />
                        <strong>ID:</strong>{" "}
                        {student.sponsor._id.toString().slice(-6).toUpperCase()}
                      </>
                    ) : (
                      <>
                        <strong>ID:</strong>{" "}
                        {student.sponsor.toString().slice(-6).toUpperCase()}
                      </>
                    )}
                  </div>
                  {/* ----------------------------------- */}

                  {/* Email Report Button */}
                  <Button
                    size="sm"
                    variant="primary"
                    className="w-100 mb-2"
                    onClick={async () => {
                      if (
                        !confirm(
                          "Send Progress Report PDF to Sponsor via Email?",
                        )
                      )
                        return;
                      try {
                        const userInfo = JSON.parse(
                          localStorage.getItem("userInfo"),
                        );
                        const config = {
                          headers: {
                            Authorization: `Bearer ${userInfo.token}`,
                          },
                        };
                        await axios.post(
                          `${BASE_URL}/api/students/${id}/email-sponsor`,
                          {},
                          config,
                        );
                        alert("Report Sent Successfully!");
                      } catch (err) {
                        alert(
                          err.response?.data?.message || "Error sending report",
                        );
                      }
                    }}
                  >
                    <FaEnvelope className="me-2" /> Email Progress Report
                  </Button>

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
                {/* <Tab
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
                </Tab> */}
                <Tab
                  eventKey="education"
                  title={
                    <span>
                      <FaBook /> Academic Record
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
                        <th>Year/Class</th>
                        <th>Exam Name</th>
                        <th>School</th>
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
                            <div className="small text-muted">{edu.year}</div>
                          </td>
                          <td className="fw-bold text-primary">
                            {edu.examName || "Annual"}
                          </td>
                          <td>{edu.school}</td>
                          <td>
                            {edu.marksObtained && edu.maxMarks ? (
                              <span>
                                {edu.marksObtained} / {edu.maxMarks}
                              </span>
                            ) : (
                              "-"
                            )}
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

                  {/* Add New Record Form */}
                  <div className="p-3 bg-light rounded border">
                    <h6 className="text-maroon fw-bold mb-3">
                      Add Exam Result
                    </h6>
                    <Row className="g-2 mb-2">
                      <Col md={3}>
                        <Form.Control
                          size="sm"
                          placeholder="Academic Year (e.g. 2024-25)"
                          value={newEdu.year}
                          onChange={(e) =>
                            setNewEdu({ ...newEdu, year: e.target.value })
                          }
                        />
                      </Col>
                      <Col md={3}>
                        <Form.Control
                          size="sm"
                          placeholder="Class (e.g. 5th)"
                          value={newEdu.class}
                          onChange={(e) =>
                            setNewEdu({ ...newEdu, class: e.target.value })
                          }
                        />
                      </Col>
                      <Col md={6}>
                        <Form.Control
                          size="sm"
                          placeholder="School Name"
                          value={newEdu.school}
                          onChange={(e) =>
                            setNewEdu({ ...newEdu, school: e.target.value })
                          }
                        />
                      </Col>
                    </Row>
                    <Row className="g-2 align-items-end">
                      <Col md={3}>
                        <Form.Label className="small mb-0">
                          Exam Name
                        </Form.Label>
                        <Form.Control
                          size="sm"
                          placeholder="e.g. Half-Yearly"
                          value={newEdu.examName}
                          onChange={(e) =>
                            setNewEdu({ ...newEdu, examName: e.target.value })
                          }
                        />
                      </Col>
                      <Col md={2}>
                        <Form.Label className="small mb-0">
                          Marks Obt.
                        </Form.Label>
                        <Form.Control
                          size="sm"
                          type="number"
                          value={newEdu.marksObtained}
                          onChange={(e) =>
                            setNewEdu({
                              ...newEdu,
                              marksObtained: e.target.value,
                            })
                          }
                        />
                      </Col>
                      <Col md={2}>
                        <Form.Label className="small mb-0">
                          Max Marks
                        </Form.Label>
                        <Form.Control
                          size="sm"
                          type="number"
                          value={newEdu.maxMarks}
                          onChange={(e) =>
                            setNewEdu({ ...newEdu, maxMarks: e.target.value })
                          }
                        />
                      </Col>
                      <Col md={3}>
                        <Form.Label className="small mb-0">
                          Percentage (Auto)
                        </Form.Label>
                        <Form.Control
                          size="sm"
                          placeholder="%"
                          value={newEdu.percentage}
                          onChange={(e) =>
                            setNewEdu({ ...newEdu, percentage: e.target.value })
                          }
                        />
                      </Col>
                      <Col md={2}>
                        <Button
                          size="sm"
                          variant="dark"
                          className="w-100"
                          onClick={addEducation}
                        >
                          <FaPlus /> Add
                        </Button>
                      </Col>
                    </Row>
                  </div>
                </Tab>
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
                  <div className="p-3 bg-light rounded mt-3">
                    <h6 className="text-maroon">Record New Expense</h6>
                    <Row className="g-2">
                      <Col md={7}>
                        <Form.Control
                          placeholder="Description"
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
                {/* --- NEW TAB: EXTRA-CURRICULAR --- */}
                <Tab
                  eventKey="activities"
                  title={
                    <span>
                      <FaRunning /> Extra-Curricular
                    </span>
                  }
                >
                  {/* 1. Activity List Table */}
                  <Table striped bordered hover size="sm">
                    <thead className="bg-light">
                      <tr>
                        <th>Category</th>
                        <th>Activity Name</th>
                        <th>Level / Participation</th>
                        <th>Achievements / Remarks</th>
                        <th>Date Recorded</th>
                      </tr>
                    </thead>
                    <tbody>
                      {student.activities &&
                        student.activities.map((act, idx) => (
                          <tr key={idx}>
                            <td>
                              <Badge
                                bg={
                                  act.activityType === "Vedic/Spiritual"
                                    ? "warning"
                                    : act.activityType === "Sports"
                                      ? "success"
                                      : act.activityType === "Arts"
                                        ? "info"
                                        : "secondary"
                                }
                                text="dark"
                              >
                                {act.activityType}
                              </Badge>
                            </td>
                            <td className="fw-bold">{act.name}</td>
                            <td>{act.participationLevel}</td>
                            <td>
                              {act.achievement ? (
                                <span className="text-success fw-bold">
                                  <FaMedal /> {act.achievement}
                                </span>
                              ) : (
                                "-"
                              )}
                            </td>
                            <td className="small text-muted">
                              {new Date(act.date).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      {(!student.activities ||
                        student.activities.length === 0) && (
                        <tr>
                          <td colSpan="5" className="text-center text-muted">
                            No activities recorded yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </Table>

                  {/* 2. Add Activity Form */}
                  <div className="p-3 bg-light rounded mt-3 border">
                    <h6 className="text-maroon fw-bold">
                      Add New Activity / Achievement
                    </h6>
                    <Row className="g-2">
                      <Col md={3}>
                        <Form.Label className="small">Category</Form.Label>
                        <Form.Select
                          value={newActivity.activityType}
                          onChange={(e) =>
                            setNewActivity({
                              ...newActivity,
                              activityType: e.target.value,
                            })
                          }
                        >
                          <option>Sports</option>
                          <option>Arts</option>
                          <option>Vedic/Spiritual</option>
                          <option>Vocational</option>
                          <option>Other</option>
                        </Form.Select>
                      </Col>
                      <Col md={3}>
                        <Form.Label className="small">Activity Name</Form.Label>
                        <Form.Control
                          placeholder="e.g. Yoga, Cricket, Slokas"
                          value={newActivity.name}
                          onChange={(e) =>
                            setNewActivity({
                              ...newActivity,
                              name: e.target.value,
                            })
                          }
                        />
                      </Col>
                      <Col md={3}>
                        <Form.Label className="small">Level / Role</Form.Label>
                        <Form.Control
                          placeholder="e.g. Daily Practice, District Level"
                          value={newActivity.participationLevel}
                          onChange={(e) =>
                            setNewActivity({
                              ...newActivity,
                              participationLevel: e.target.value,
                            })
                          }
                        />
                      </Col>
                      <Col md={3}>
                        <Form.Label className="small">
                          Achievement (Optional)
                        </Form.Label>
                        <Form.Control
                          placeholder="e.g. Won 1st Prize"
                          value={newActivity.achievement}
                          onChange={(e) =>
                            setNewActivity({
                              ...newActivity,
                              achievement: e.target.value,
                            })
                          }
                        />
                      </Col>
                      <Col md={12} className="text-end mt-3">
                        <Button size="sm" variant="dark" onClick={addActivity}>
                          <FaPlus className="me-1" /> Add Activity Record
                        </Button>
                      </Col>
                    </Row>
                  </div>
                </Tab>

                {/* --- NEW DOCUMENTS TAB --- */}
                <Tab
                  eventKey="documents"
                  title={
                    <span>
                      <FaFileAlt /> Documents
                    </span>
                  }
                >
                  {/* Upload Section */}
                  <div className="p-3 bg-light rounded mb-4">
                    <h6 className="text-maroon">Upload Documents</h6>
                    <Form onSubmit={handleUpload} className="d-flex gap-2">
                      <Form.Control
                        type="file"
                        multiple
                        onChange={handleFileChange}
                      />
                      <Button
                        type="submit"
                        variant="primary"
                        disabled={uploading}
                      >
                        {uploading ? "Uploading..." : <FaCloudUploadAlt />}
                      </Button>
                    </Form>
                    <small className="text-muted">
                      Supported: Images, PDF, Word Docs
                    </small>
                  </div>

                  {/* Gallery Grid */}
                  <h6 className="mb-3">
                    Attached Files ({student.documents?.length || 0})
                  </h6>
                  <Row>
                    {student.documents &&
                      student.documents.map((path, index) => (
                        <Col md={4} key={index} className="mb-3">
                          <div className="border rounded p-2 position-relative bg-white text-center">
                            <Button
                              variant="danger"
                              size="sm"
                              className="position-absolute top-0 end-0 m-1"
                              style={{ zIndex: 10 }}
                              onClick={() => handleDeleteDoc(path)}
                            >
                              <FaTrash size={10} />
                            </Button>

                            {path.match(/\.(jpeg|jpg|png|gif)$/i) ? (
                              <img
                                src={`${BASE_URL}${path}`}
                                alt="Doc"
                                style={{
                                  width: "100%",
                                  height: "100px",
                                  objectFit: "cover",
                                  cursor: "pointer",
                                }}
                                onClick={() =>
                                  window.open(`${BASE_URL}${path}`, "_blank")
                                }
                              />
                            ) : (
                              <div className="py-4">
                                <FaFileAlt
                                  size={30}
                                  className="text-secondary mb-2"
                                />
                                <br />
                                <a
                                  href={`${BASE_URL}${path}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="small text-decoration-none"
                                >
                                  View Document
                                </a>
                              </div>
                            )}
                          </div>
                        </Col>
                      ))}
                    {(!student.documents || student.documents.length === 0) && (
                      <p className="text-muted text-center py-3">
                        No documents attached.
                      </p>
                    )}
                  </Row>
                </Tab>
                {/* --- NEW LEAVES TAB --- */}
                <Tab
                  eventKey="leaves"
                  title={
                    <span>
                      <FaSuitcase /> Leaves
                    </span>
                  }
                >
                  {/* Leave Form */}
                  <div className="p-3 bg-light rounded mb-4">
                    <h6 className="text-maroon">Record New Leave</h6>
                    {currentLeave ? (
                      <Alert variant="warning">
                        Student is currently on leave (Since{" "}
                        {new Date(currentLeave.startDate).toLocaleDateString()}
                        ).
                        <br />
                        <strong>Reason:</strong> {currentLeave.reason}
                        <div className="mt-2">
                          <Button
                            variant="success"
                            size="sm"
                            onClick={() => markReturned(currentLeave._id)}
                          >
                            Mark as Returned
                          </Button>
                        </div>
                      </Alert>
                    ) : (
                      <Row className="g-2">
                        <Col md={4}>
                          <Form.Label className="small">Start Date</Form.Label>
                          <Form.Control
                            type="date"
                            value={newLeave.startDate}
                            onChange={(e) =>
                              setNewLeave({
                                ...newLeave,
                                startDate: e.target.value,
                              })
                            }
                          />
                        </Col>
                        <Col md={4}>
                          <Form.Label className="small">
                            Expected Return
                          </Form.Label>
                          <Form.Control
                            type="date"
                            value={newLeave.endDate}
                            onChange={(e) =>
                              setNewLeave({
                                ...newLeave,
                                endDate: e.target.value,
                              })
                            }
                          />
                        </Col>
                        <Col md={4}>
                          <Form.Label className="small">Reason</Form.Label>
                          <Form.Control
                            placeholder="e.g. Going Home"
                            value={newLeave.reason}
                            onChange={(e) =>
                              setNewLeave({
                                ...newLeave,
                                reason: e.target.value,
                              })
                            }
                          />
                        </Col>
                        <Col md={12} className="text-end mt-2">
                          <Button size="sm" variant="danger" onClick={addLeave}>
                            Record Leave
                          </Button>
                        </Col>
                      </Row>
                    )}
                  </div>

                  {/* Leave History Table */}
                  <h6 className="mb-3">Leave History</h6>
                  <Table striped bordered hover size="sm">
                    <thead>
                      <tr>
                        <th>Start Date</th>
                        <th>Return Date</th>
                        <th>Reason</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {student.leaves &&
                        student.leaves.map((l, idx) => (
                          <tr key={idx}>
                            <td>
                              {new Date(l.startDate).toLocaleDateString()}
                            </td>
                            <td>
                              {l.actualReturnDate
                                ? new Date(
                                    l.actualReturnDate,
                                  ).toLocaleDateString()
                                : l.endDate
                                  ? new Date(l.endDate).toLocaleDateString() +
                                    " (Exp)"
                                  : "-"}
                            </td>
                            <td>{l.reason}</td>
                            <td>
                              {l.status === "On Leave" ? (
                                <Badge bg="warning" text="dark">
                                  On Leave
                                </Badge>
                              ) : (
                                <Badge bg="success">Returned</Badge>
                              )}
                            </td>
                          </tr>
                        ))}
                      {(!student.leaves || student.leaves.length === 0) && (
                        <tr>
                          <td colSpan="4" className="text-center text-muted">
                            No leave history.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                </Tab>
                <Tab
                  eventKey="legal"
                  title={
                    <span>
                      <FaGavel /> Legal & Statutory
                    </span>
                  }
                >
                  <div className="p-3">
                    {/* SECTION 1: MANDATORY FORMS CHECKLIST */}
                    <h5 className="text-maroon border-bottom pb-2 mb-3">
                      <FaClipboardCheck /> Juvenile Justice Act Forms
                    </h5>
                    <Row className="mb-4">
                      <Col md={6}>
                        <div className="form-check form-switch mb-3">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            checked={forms.form17}
                            onChange={() => handleFormToggle("form17")}
                          />
                          <label className="form-check-label">
                            Form 17 (Report at Production)
                          </label>
                        </div>
                        <div className="form-check form-switch mb-3">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            checked={forms.form18}
                            onChange={() => handleFormToggle("form18")}
                          />
                          <label className="form-check-label">
                            Form 18 (Order of Placement)
                          </label>
                        </div>
                        <div className="form-check form-switch mb-3">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            checked={forms.form20}
                            onChange={() => handleFormToggle("form20")}
                          />
                          <label className="form-check-label">
                            Form 20 (Undertaking by Parent / Guardian)
                          </label>
                        </div>
                      </Col>
                      <Col md={6}>
                        <div className="form-check form-switch mb-3">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            checked={forms.form7}
                            onChange={() => handleFormToggle("form7")}
                          />
                          <label className="form-check-label">
                            Form 7 (Individual Care Plan)
                          </label>
                        </div>
                        <div className="form-check form-switch mb-3">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            checked={forms.form44}
                            onChange={() => handleFormToggle("form44")}
                          />
                          <label className="form-check-label">
                            Form 44 (Release Order)
                          </label>
                        </div>
                        <div className="form-check form-switch mb-3">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            checked={forms.form37}
                            onChange={() => handleFormToggle("form37")}
                          />
                          <label className="form-check-label">
                            Form 37 (After Care Placement)
                          </label>
                        </div>
                      </Col>
                    </Row>

                    {/* SECTION 2: INSPECTION TRACKING */}
                    <h5 className="text-maroon border-bottom pb-2 mb-3">
                      <FaBuilding /> Government Inspection Log
                    </h5>

                    {/* Inspection Form */}
                    <div className="bg-light p-3 rounded mb-3">
                      <Row className="g-2">
                        <Col md={3}>
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
                        </Col>
                        <Col md={3}>
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
                        </Col>
                        <Col md={2}>
                          <Form.Select
                            value={newInspection.department}
                            onChange={(e) =>
                              setNewInspection({
                                ...newInspection,
                                department: e.target.value,
                              })
                            }
                          >
                            <option value="">Dept</option>
                            <option>CWC</option>
                            <option>DCPU</option>
                            <option>Police</option>
                            <option>Other</option>
                          </Form.Select>
                        </Col>
                        <Col md={2}>
                          <Form.Control
                            placeholder="Remarks"
                            value={newInspection.remarks}
                            onChange={(e) =>
                              setNewInspection({
                                ...newInspection,
                                remarks: e.target.value,
                              })
                            }
                          />
                        </Col>
                        <Col md={2}>
                          <Button
                            variant="dark"
                            className="w-100"
                            onClick={addInspection}
                          >
                            Log
                          </Button>
                        </Col>
                      </Row>
                    </div>

                    {/* Inspection Table */}
                    <Table striped bordered hover size="sm">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Official</th>
                          <th>Dept</th>
                          <th>Remarks</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {student.inspections &&
                          student.inspections.map((insp, idx) => (
                            <tr key={idx}>
                              <td>
                                {new Date(insp.date).toLocaleDateString()}
                              </td>
                              <td>{insp.officialName}</td>
                              <td>
                                <Badge bg="secondary">{insp.department}</Badge>
                              </td>
                              <td>{insp.remarks}</td>
                              <td>
                                {insp.status === "Action Required" ? (
                                  <Badge bg="danger">Action Req</Badge>
                                ) : (
                                  <Badge bg="success">OK</Badge>
                                )}
                              </td>
                            </tr>
                          ))}
                        {(!student.inspections ||
                          student.inspections.length === 0) && (
                          <tr>
                            <td colSpan="5" className="text-center text-muted">
                              No inspections recorded.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </Table>
                  </div>
                </Tab>
              </Tabs>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* --- ALUMNI EXIT REQUEST MODAL --- */}
      <Modal show={showAlumniModal} onHide={() => setShowAlumniModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Request Student Exit (Alumni)</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="warning" className="small">
            <FaGavel className="me-1" /> This action initiates a 3-Tier Approval
            Process (President, Secretary, Treasurer).
          </Alert>
          <Form>
            {/* 1. EXIT DETAILS */}
            <h6 className="text-maroon border-bottom pb-2">Exit Details</h6>
            <Form.Group className="mb-3">
              <Form.Label className="small fw-bold">Exit Date *</Form.Label>
              <Form.Control
                type="date"
                value={alumniData.exitDate || ""}
                onChange={(e) =>
                  setAlumniData({ ...alumniData, exitDate: e.target.value })
                }
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="small fw-bold">
                Reason for Leaving *
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={alumniData.reason || ""}
                onChange={(e) =>
                  setAlumniData({ ...alumniData, reason: e.target.value })
                }
                placeholder="e.g. Completed Education, Family Relocation"
              />
            </Form.Group>

            {/* 2. FUTURE CONTACT & WORK INFO */}
            <h6 className="text-maroon border-bottom pb-2 mt-4">
              Future Contact Info
            </h6>

            <Row className="g-2 mb-2">
              <Col md={6}>
                <Form.Control
                  size="sm"
                  placeholder="Mobile Number"
                  value={alumniData.phone || ""}
                  onChange={(e) =>
                    setAlumniData({ ...alumniData, phone: e.target.value })
                  }
                />
              </Col>
              <Col md={6}>
                <Form.Control
                  size="sm"
                  placeholder="Current Location / City"
                  value={alumniData.currentLocation || ""}
                  onChange={(e) =>
                    setAlumniData({
                      ...alumniData,
                      currentLocation: e.target.value,
                    })
                  }
                />
              </Col>
            </Row>

            <Form.Group className="mb-2">
              <Form.Control
                size="sm"
                placeholder="Email Address"
                value={alumniData.email || ""}
                onChange={(e) =>
                  setAlumniData({ ...alumniData, email: e.target.value })
                }
              />
            </Form.Group>

            <Row className="g-2">
              <Col md={6}>
                <Form.Control
                  size="sm"
                  placeholder="Job Title (e.g. Engineer)"
                  value={alumniData.jobTitle || ""}
                  onChange={(e) =>
                    setAlumniData({ ...alumniData, jobTitle: e.target.value })
                  }
                />
              </Col>
              <Col md={6}>
                <Form.Control
                  size="sm"
                  placeholder="Company / College Name"
                  value={alumniData.company || ""}
                  onChange={(e) =>
                    setAlumniData({ ...alumniData, company: e.target.value })
                  }
                />
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAlumniModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleConvertToAlumni}>
            Submit Request
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Sponsor Modal */}
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
