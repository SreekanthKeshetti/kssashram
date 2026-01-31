/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Row,
  Col,
  Card,
  Badge,
  Table,
  Button,
  Spinner,
  Alert,
} from "react-bootstrap";
import {
  FaArrowLeft,
  FaUserTie,
  FaPhone,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaStar,
  FaMedal,
  FaFilePdf,
  FaEnvelope,
  FaIdCard,
  FaBriefcase,
  FaGraduationCap,
} from "react-icons/fa";
import axios from "axios";
import BASE_URL from "../../apiConfig";

const MemberProfile = () => {
  const { id } = useParams();
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMember = async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem("userInfo"));
        const config = {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        };
        const { data } = await axios.get(
          `${BASE_URL}/api/members/${id}`,
          config,
        );
        setMember(data);
        setLoading(false);
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    };
    fetchMember();
  }, [id]);

  // --- NEW: DOWNLOAD FORM HANDLER ---
  const downloadForm = async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const response = await axios.get(
        `${BASE_URL}/api/members/${id}/download`,
        {
          headers: { Authorization: `Bearer ${userInfo.token}` },
          responseType: "blob",
        },
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Application_${member.firstName}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      alert("Error downloading form");
    }
  };

  if (loading)
    return (
      <div className="text-center py-5">
        <Spinner animation="border" />
      </div>
    );
  if (!member) return <Alert variant="danger">Member not found</Alert>;

  // Committee Eligibility Logic
  const joinDate = new Date(member.joinDate);
  const today = new Date();
  const diffTime = Math.abs(today - joinDate);
  const diffYears = diffTime / (1000 * 60 * 60 * 24 * 365);
  const isEligible = diffYears >= 2 && member.activities.length >= 5;

  return (
    <div>
      {/* HEADER */}
      <div className="d-flex align-items-center gap-3 mb-4">
        <Link
          to="/dashboard/members"
          className="btn btn-outline-secondary btn-sm"
        >
          <FaArrowLeft />
        </Link>
        <div>
          <h2
            className="text-maroon m-0"
            style={{ fontFamily: "Playfair Display" }}
          >
            Member Profile
          </h2>
          <span className="text-muted small">
            ID: {member._id.slice(-6).toUpperCase()}
          </span>
        </div>

        {/* DOWNLOAD BUTTON */}
        <Button
          variant="danger"
          size="sm"
          className="ms-auto"
          onClick={downloadForm}
        >
          <FaFilePdf className="me-2" /> Download Application Form
        </Button>
      </div>

      <Row>
        {/* LEFT COL: Personal Info */}
        <Col md={5}>
          <Card className="shadow-sm border-0 mb-4">
            <Card.Body>
              <div className="text-center mb-3">
                <div
                  className="bg-light rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                  style={{ width: "100px", height: "100px" }}
                >
                  <FaUserTie size={50} className="text-secondary" />
                </div>
                <h4>
                  {member.firstName} {member.lastName}
                </h4>

                <div className="d-flex justify-content-center gap-2 mb-2">
                  <Badge bg="dark">{member.category}</Badge>
                  <Badge bg="info" text="dark">
                    {member.membershipType}
                  </Badge>
                </div>
                <small className="text-muted">{member.branch}</small>
              </div>

              <hr />

              {/* CONTACT DETAILS */}
              <h6 className="text-maroon fw-bold mb-3">Contact Details</h6>
              <div className="text-start mb-4">
                <p className="mb-2">
                  <FaPhone className="me-2 text-muted" /> {member.phone}
                </p>
                <p className="mb-2">
                  <FaEnvelope className="me-2 text-muted" />{" "}
                  {member.email || "No Email"}
                </p>
                <p className="mb-2">
                  <FaMapMarkerAlt className="me-2 text-muted" />{" "}
                  {member.address}
                </p>
              </div>

              {/* PERSONAL & PROFESSIONAL (NEW FIELDS) */}
              <h6 className="text-maroon fw-bold mb-3">
                Personal & Professional
              </h6>
              <div className="small text-muted mb-4">
                <div className="mb-2">
                  <strong>Father/Spouse:</strong>{" "}
                  <span className="text-dark">{member.spouseName || "-"}</span>
                </div>
                <div className="mb-2">
                  <strong>DOB:</strong>{" "}
                  <span className="text-dark">
                    {member.dob
                      ? new Date(member.dob).toLocaleDateString()
                      : "-"}
                  </span>
                </div>
                <div className="mb-2">
                  <FaGraduationCap className="me-1" /> <strong>Qual:</strong>{" "}
                  {member.qualification || "-"}
                </div>
                <div className="mb-2">
                  <FaBriefcase className="me-1" /> <strong>Profession:</strong>{" "}
                  {member.profession || "-"}
                </div>
                <div className="mb-2">
                  <strong>Other Org Roles:</strong>{" "}
                  {member.otherOrgPositions || "-"}
                </div>
              </div>

              {/* IDS & REFERENCES (NEW FIELDS) */}
              <h6 className="text-maroon fw-bold mb-3">IDs & References</h6>
              <div className="small text-muted mb-3">
                <div className="mb-2">
                  <FaIdCard className="me-1" /> <strong>PAN:</strong>{" "}
                  {member.pan || "-"}
                </div>
                <div className="mb-2">
                  <FaIdCard className="me-1" /> <strong>Aadhaar:</strong>{" "}
                  {member.aadhaar || "-"}
                </div>
                <div className="mt-3 p-2 bg-light rounded border">
                  <strong>Referred By:</strong>
                  <br />
                  {member.references || "Direct Admission"}
                </div>
              </div>

              {/* COMMITTEE ELIGIBILITY */}
              <div
                className={`p-3 rounded mt-3 ${isEligible ? "bg-success text-white" : "bg-light border"}`}
              >
                <h6 className="fw-bold mb-2">
                  <FaMedal /> Committee Eligibility
                </h6>
                {isEligible ? (
                  <span>Eligible! (2+ Years & Active)</span>
                ) : (
                  <small>
                    Years: {diffYears.toFixed(1)} / 2 <br />
                    Activities: {member.activities.length} / 5
                  </small>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* RIGHT COL: Activities Log */}
        <Col md={7}>
          <Card className="shadow-sm border-0">
            <Card.Header className="bg-white py-3">
              <h5 className="m-0 text-maroon">
                <FaStar className="me-2 text-warning" /> Activity History
              </h5>
            </Card.Header>
            <Card.Body className="p-0">
              <Table hover responsive className="align-middle mb-0">
                <thead className="bg-light">
                  <tr>
                    <th className="ps-4">Date</th>
                    <th>Event / Task</th>
                    <th>Role Performed</th>
                  </tr>
                </thead>
                <tbody>
                  {member.activities && member.activities.length > 0 ? (
                    [...member.activities].reverse().map((act, idx) => (
                      <tr key={idx}>
                        <td className="ps-4">
                          {new Date(act.date).toLocaleDateString()}
                        </td>
                        <td className="fw-bold">{act.eventName}</td>
                        <td>
                          <Badge bg="secondary">{act.role}</Badge>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" className="text-center py-5 text-muted">
                        No activities logged yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default MemberProfile;
