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
  Alert,
} from "react-bootstrap";
import {
  FaPlus,
  FaUserTie,
  FaCheckCircle,
  FaTimesCircle,
  FaTasks,
} from "react-icons/fa";

const MemberList = () => {
  const [members, setMembers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  // Activity Modal State
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [activityData, setActivityData] = useState({
    eventName: "",
    role: "",
    date: "",
  });
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    address: "",
    membershipType: "Annual",
    feeAmount: "1000",
    feeStatus: "Paid",
  });

  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const { data } = await axios.get(`${BASE_URL}/api/members`, config);
      setMembers(data);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch members");
    }
  };
  // --- ACTIVITY HANDLER ---
  const handleAddActivity = async (e) => {
    e.preventDefault();
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

      await axios.post(
        `${BASE_URL}/api/members/${selectedMember._id}/activity`,
        activityData,
        config
      );

      alert("Activity Logged Successfully!");
      setShowActivityModal(false);
      setActivityData({ eventName: "", role: "", date: "" });
      fetchMembers(); // Refresh to update list (if we showed count)
      // eslint-disable-next-line no-unused-vars
    } catch (err) {
      alert("Error logging activity");
    }
  };

  const openActivityModal = (member) => {
    setSelectedMember(member);
    setShowActivityModal(true);
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
      // eslint-disable-next-line no-unused-vars
    } catch (err) {
      alert("Error registering member");
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div>
      <Row className="mb-4 align-items-center">
        <Col>
          <h2
            className="text-maroon"
            style={{ fontFamily: "Playfair Display" }}
          >
            Membership Management
          </h2>
          <p className="text-muted">
            Manage Volunteers, Life Members, and Patrons
          </p>
        </Col>
        <Col className="text-end">
          <Button
            variant="primary"
            style={{ backgroundColor: "#581818", border: "none" }}
            onClick={() => setShowModal(true)}
          >
            <FaPlus /> Register Member
          </Button>
        </Col>
      </Row>

      {error && <Alert variant="danger">{error}</Alert>}

      <Card className="shadow-sm border-0">
        <Card.Body className="p-0">
          <Table hover responsive className="align-middle mb-0">
            <thead className="bg-light">
              <tr>
                <th className="ps-4">Name</th>
                <th>Contact</th>
                <th>Type</th>
                <th>Joined Date</th>
                <th>Fee Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {members.map((m) => (
                <tr key={m._id}>
                  <td className="ps-4 fw-bold">
                    <FaUserTie className="me-2 text-secondary" />
                    {m.firstName} {m.lastName}
                  </td>
                  <td>
                    <div>{m.phone}</div>
                    <small className="text-muted">{m.email}</small>
                  </td>
                  <td>
                    <Badge bg="info" text="dark">
                      {m.membershipType}
                    </Badge>
                  </td>
                  <td>{new Date(m.joinDate).toLocaleDateString()}</td>
                  <td>
                    {m.feeStatus === "Paid" ? (
                      <span className="text-success">
                        <FaCheckCircle /> Paid
                      </span>
                    ) : (
                      <span className="text-danger">
                        <FaTimesCircle /> Pending
                      </span>
                    )}
                  </td>
                  <td>
                    <Button
                      size="sm"
                      variant="outline-dark"
                      onClick={() => openActivityModal(m)}
                      title="Log Activity"
                    >
                      <FaTasks /> Log Work
                    </Button>
                  </td>
                </tr>
              ))}
              {members.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center py-5">
                    No members found
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
      {/* --- ACTIVITY MODAL --- */}
      <Modal
        show={showActivityModal}
        onHide={() => setShowActivityModal(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Log Member Activity</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Member:{" "}
            <strong>
              {selectedMember?.firstName} {selectedMember?.lastName}
            </strong>
          </p>
          <Form onSubmit={handleAddActivity}>
            <Form.Group className="mb-3">
              <Form.Label>Event / Program Name</Form.Label>
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

      {/* Add Member Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>New Member Registration</Modal.Title>
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
            </Row>
            <Row>
              <Col md={6} className="mb-3">
                <Form.Label>Phone</Form.Label>
                <Form.Control name="phone" onChange={handleChange} required />
              </Col>
              <Col md={6} className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control name="email" onChange={handleChange} />
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Label>Address</Form.Label>
              <Form.Control
                as="textarea"
                name="address"
                onChange={handleChange}
                required
              />
            </Form.Group>

            <hr />

            <Row>
              <Col md={4} className="mb-3">
                <Form.Label>Membership Type</Form.Label>
                <Form.Select name="membershipType" onChange={handleChange}>
                  <option>Annual</option>
                  <option>Life</option>
                  <option>Patron</option>
                  <option>Volunteer</option>
                </Form.Select>
              </Col>
              <Col md={4} className="mb-3">
                <Form.Label>Fee Amount (₹)</Form.Label>
                <Form.Control
                  type="number"
                  name="feeAmount"
                  value={formData.feeAmount}
                  onChange={handleChange}
                />
              </Col>
              <Col md={4} className="mb-3">
                <Form.Label>Fee Status</Form.Label>
                <Form.Select name="feeStatus" onChange={handleChange}>
                  <option>Paid</option>
                  <option>Pending</option>
                  <option>Waived</option>
                </Form.Select>
              </Col>
            </Row>

            <Button type="submit" className="w-100 btn-ashram">
              Register Member
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default MemberList;
