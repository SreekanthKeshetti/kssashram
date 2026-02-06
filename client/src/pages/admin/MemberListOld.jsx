/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/immutability */
import React, { useEffect, useState } from "react";
import axios from "axios";
import BASE_URL from "../../apiConfig";
import { Link } from "react-router-dom";

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
  FaUserTie,
  FaCheckCircle,
  FaTimesCircle,
  FaTasks,
  FaFilePdf,
} from "react-icons/fa";

const MemberList = () => {
  const [members, setMembers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Activity Modal State
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [activityData, setActivityData] = useState({
    eventName: "",
    role: "",
    date: "",
  });

  // --- UPDATED FORM STATE WITH NEW FIELDS ---
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",

    // New Profile Fields
    spouseName: "",
    dob: "",
    qualification: "",
    profession: "",
    otherOrgPositions: "",
    references: "",
    pan: "",
    aadhaar: "",

    phone: "",
    email: "",
    address: "",

    // Membership Details
    membershipType: "Annual",
    category: "Ordinary",
    feeAmount: "1000",
    feeStatus: "Paid",
    branch: "Karunya Sindhu",
  });

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      if (!userInfo || !userInfo.token) return;

      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const { data } = await axios.get(`${BASE_URL}/api/members`, config);
      setMembers(data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch members");
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      await axios.post(`${BASE_URL}/api/members`, formData, config);
      setShowModal(false);
      fetchMembers();
      alert("Member Registered Successfully!");

      // Reset Form
      setFormData({
        firstName: "",
        lastName: "",
        spouseName: "",
        dob: "",
        qualification: "",
        profession: "",
        otherOrgPositions: "",
        references: "",
        pan: "",
        aadhaar: "",
        phone: "",
        email: "",
        address: "",
        membershipType: "Annual",
        category: "Ordinary",
        feeAmount: "1000",
        feeStatus: "Paid",
        branch: "Karunya Sindhu",
      });
    } catch (err) {
      alert("Error registering member");
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --- ACTIVITY HANDLERS ---
  const openActivityModal = (member) => {
    setSelectedMember(member);
    setShowActivityModal(true);
  };

  const handleAddActivity = async (e) => {
    e.preventDefault();
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

      await axios.post(
        `${BASE_URL}/api/members/${selectedMember._id}/activity`,
        activityData,
        config,
      );

      alert("Activity Logged Successfully!");
      setShowActivityModal(false);
      setActivityData({ eventName: "", role: "", date: "" });
      fetchMembers();
    } catch (err) {
      alert("Error logging activity");
    }
  };
  const handleDownloadBlank = async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const response = await axios.get(`${BASE_URL}/api/members/blank-form`, {
        headers: { Authorization: `Bearer ${userInfo.token}` },
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "Blank_Membership_Form.pdf");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      alert("Error downloading blank form");
    }
  };

  return (
    <div>
      <Row className="mb-4 align-items-center">
        <Col>
          <h2
            className="text-maroon m-0"
            style={{ fontFamily: "Playfair Display" }}
          >
            Membership Registry
          </h2>
          <p className="text-muted m-0 small">
            Manage Volunteers, Life Members, and Patrons
          </p>
        </Col>
        <Col className="text-end">
          <Button
            variant="outline-danger"
            className="me-2"
            onClick={handleDownloadBlank}
          >
            <FaFilePdf className="me-2" /> Blank Form
          </Button>

          <Button
            variant="primary"
            style={{ backgroundColor: "#581818", border: "none" }}
            onClick={() => setShowModal(true)}
          >
            <FaPlus className="me-2" /> New Member
          </Button>
        </Col>
      </Row>

      {error && <Alert variant="danger">{error}</Alert>}

      <Card className="shadow-sm border-0">
        <Card.Body className="p-0">
          <Table
            hover
            responsive
            className="align-middle mb-0"
            style={{ fontSize: "0.9rem" }}
          >
            <thead className="bg-light">
              <tr>
                <th className="ps-4">Name</th>
                <th>Contact</th>
                <th>Category / Plan</th>
                <th>Joined Date</th>
                <th>Fee Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {members.map((m) => (
                <tr key={m._id}>
                  <td className="ps-4">
                    <div className="fw-bold">
                      <FaUserTie className="me-2 text-secondary" />
                      {m.firstName} {m.lastName}
                    </div>
                    {(m.pan || m.aadhaar) && (
                      <div
                        style={{ fontSize: "0.7rem" }}
                        className="text-muted ms-4"
                      >
                        {m.pan && <span className="me-2">PAN: {m.pan}</span>}
                      </div>
                    )}
                  </td>
                  <td>
                    <div>{m.phone}</div>
                    <small className="text-muted">{m.email}</small>
                  </td>

                  {/* CATEGORY BADGES */}
                  <td>
                    <div className="d-flex flex-column gap-1 align-items-start">
                      <Badge
                        bg={
                          m.category === "EC"
                            ? "danger"
                            : m.category === "Permanent"
                              ? "success"
                              : "secondary"
                        }
                      >
                        {m.category || "Ordinary"}
                      </Badge>
                      <Badge bg="light" text="dark" className="border">
                        {m.membershipType}
                      </Badge>
                    </div>
                  </td>

                  <td>{new Date(m.joinDate).toLocaleDateString()}</td>
                  <td>
                    {m.feeStatus === "Paid" ? (
                      <span
                        className="text-success fw-bold"
                        style={{ fontSize: "0.85rem" }}
                      >
                        <FaCheckCircle className="me-1" /> Paid
                      </span>
                    ) : (
                      <span
                        className="text-danger fw-bold"
                        style={{ fontSize: "0.85rem" }}
                      >
                        <FaTimesCircle className="me-1" /> Pending
                      </span>
                    )}
                  </td>
                  <td>
                    <div className="d-flex gap-2">
                      <Link
                        to={`/dashboard/members/${m._id}`}
                        className="btn btn-sm btn-outline-primary"
                        title="View Profile"
                      >
                        <FaUserTie />
                      </Link>
                      <Button
                        size="sm"
                        variant="outline-dark"
                        onClick={() => openActivityModal(m)}
                        title="Log Activity"
                      >
                        <FaTasks />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {members.length === 0 && !loading && (
                <tr>
                  <td colSpan="6" className="text-center py-5 text-muted">
                    No members found
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* --- NEW MEMBER REGISTRATION MODAL --- */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton className="bg-light">
          <Modal.Title>New Member Application</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            {/* Personal Details */}
            <h6 className="text-maroon border-bottom pb-2 mb-3">
              Personal Information
            </h6>
            <Row className="mb-2 g-2">
              <Col md={6}>
                <Form.Control
                  size="sm"
                  placeholder="First Name *"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                />
              </Col>
              <Col md={6}>
                <Form.Control
                  size="sm"
                  placeholder="Last Name *"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                />
              </Col>
            </Row>

            <Row className="mb-2 g-2">
              <Col md={6}>
                <Form.Control
                  size="sm"
                  placeholder="Father's / Spouse Name"
                  name="spouseName"
                  value={formData.spouseName}
                  onChange={handleChange}
                />
              </Col>
              <Col md={6}>
                <Form.Control
                  size="sm"
                  type="date"
                  title="Date of Birth"
                  name="dob"
                  value={formData.dob}
                  onChange={handleChange}
                />
              </Col>
            </Row>

            <Row className="mb-2 g-2">
              <Col md={6}>
                <Form.Control
                  size="sm"
                  placeholder="Qualification (e.g. B.Com)"
                  name="qualification"
                  value={formData.qualification}
                  onChange={handleChange}
                />
              </Col>
              <Col md={6}>
                <Form.Control
                  size="sm"
                  placeholder="Profession (e.g. Retired Bank Employee)"
                  name="profession"
                  value={formData.profession}
                  onChange={handleChange}
                />
              </Col>
            </Row>

            <Row className="mb-3 g-2">
              <Col md={6}>
                <Form.Control
                  size="sm"
                  placeholder="Aadhaar Number"
                  name="aadhaar"
                  value={formData.aadhaar}
                  onChange={handleChange}
                />
              </Col>
              <Col md={6}>
                <Form.Control
                  size="sm"
                  placeholder="PAN Number"
                  name="pan"
                  value={formData.pan}
                  onChange={handleChange}
                />
              </Col>
            </Row>

            {/* Contact & References */}
            <h6 className="text-maroon border-bottom pb-2 mb-3">
              Contact & References
            </h6>
            <Row className="mb-2 g-2">
              <Col md={6}>
                <Form.Control
                  size="sm"
                  placeholder="Mobile Number *"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </Col>
              <Col md={6}>
                <Form.Control
                  size="sm"
                  type="email"
                  placeholder="Email Address"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </Col>
            </Row>

            <Form.Control
              size="sm"
              as="textarea"
              rows={2}
              placeholder="Residential Address *"
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
              className="mb-2"
            />

            <Form.Control
              size="sm"
              placeholder="Positions held in other Organizations (Optional)"
              name="otherOrgPositions"
              value={formData.otherOrgPositions}
              onChange={handleChange}
              className="mb-2"
            />
            <Form.Control
              size="sm"
              placeholder="References (Name of persons who introduced you)"
              name="references"
              value={formData.references}
              onChange={handleChange}
              className="mb-3"
            />

            {/* Membership Type */}
            <h6 className="text-maroon border-bottom pb-2 mb-3">
              Membership Details
            </h6>
            <Row className="g-2">
              <Col md={4} className="mb-3">
                <Form.Label className="small fw-bold">Category</Form.Label>
                <Form.Select
                  size="sm"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                >
                  <option value="Ordinary">Ordinary Member</option>
                  <option value="Permanent">Permanent Member</option>
                  <option value="EC">Executive Committee (EC)</option>
                </Form.Select>
              </Col>
              <Col md={4} className="mb-3">
                <Form.Label className="small fw-bold">Plan Type</Form.Label>
                <Form.Select
                  size="sm"
                  name="membershipType"
                  value={formData.membershipType}
                  onChange={handleChange}
                >
                  <option value="Annual">Annual</option>
                  <option value="Life">Life Membership</option>
                  <option value="Patron">Patron</option>
                  <option value="Volunteer">Volunteer</option>
                </Form.Select>
              </Col>
              <Col md={4} className="mb-3">
                <Form.Label className="small fw-bold">Branch</Form.Label>
                <Form.Select
                  size="sm"
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
                  <option value="Headquarters">Headquarters</option>
                </Form.Select>
              </Col>
            </Row>

            <Row className="g-2">
              <Col md={6}>
                <Form.Label className="small fw-bold">
                  Fee Amount (₹)
                </Form.Label>
                <Form.Control
                  size="sm"
                  type="number"
                  name="feeAmount"
                  value={formData.feeAmount}
                  onChange={handleChange}
                />
              </Col>
              <Col md={6}>
                <Form.Label className="small fw-bold">
                  Payment Status
                </Form.Label>
                <Form.Select
                  size="sm"
                  name="feeStatus"
                  value={formData.feeStatus}
                  onChange={handleChange}
                >
                  <option value="Paid">Paid</option>
                  <option value="Pending">Pending</option>
                  <option value="Waived">Waived (Honorary)</option>
                </Form.Select>
              </Col>
            </Row>

            <Button type="submit" className="w-100 btn-ashram mt-4">
              Register Member
            </Button>
          </Form>
        </Modal.Body>
      </Modal>

      {/* ACTIVITY MODAL */}
      <Modal
        show={showActivityModal}
        onHide={() => setShowActivityModal(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Log Member Activity</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="text-muted small mb-3">
            Member:{" "}
            <strong>
              {selectedMember?.firstName} {selectedMember?.lastName}
            </strong>
          </p>
          <Form onSubmit={handleAddActivity}>
            <Form.Group className="mb-3">
              <Form.Label>Event / Task Name</Form.Label>
              <Form.Control
                placeholder="e.g. Janmashtami Setup"
                value={activityData.eventName}
                onChange={(e) =>
                  setActivityData({
                    ...activityData,
                    eventName: e.target.value,
                  })
                }
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Role / Responsibility</Form.Label>
              <Form.Control
                placeholder="e.g. Food Serving Volunteer"
                value={activityData.role}
                onChange={(e) =>
                  setActivityData({ ...activityData, role: e.target.value })
                }
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Date</Form.Label>
              <Form.Control
                type="date"
                value={activityData.date}
                onChange={(e) =>
                  setActivityData({ ...activityData, date: e.target.value })
                }
                required
              />
            </Form.Group>
            <Button type="submit" className="w-100 btn-ashram">
              Save Activity
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default MemberList;
