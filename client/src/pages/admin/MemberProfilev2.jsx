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

  if (loading)
    return (
      <div className="text-center py-5">
        <Spinner animation="border" />
      </div>
    );
  if (!member) return <Alert variant="danger">Member not found</Alert>;

  // --- KSS_MEM_5: COMMITTEE ELIGIBILITY LOGIC ---
  // Criteria: Member for > 2 Years AND has done > 5 Activities (Example logic)
  const joinDate = new Date(member.joinDate);
  const today = new Date();
  const diffTime = Math.abs(today - joinDate);
  const diffYears = diffTime / (1000 * 60 * 60 * 24 * 365);

  const isExperienced = diffYears >= 2;
  const isActiveVolunteer = member.activities.length >= 5;
  const isEligible = isExperienced && isActiveVolunteer;

  return (
    <div>
      <div className="d-flex align-items-center gap-3 mb-4">
        <Link
          to="/dashboard/members"
          className="btn btn-outline-secondary btn-sm"
        >
          <FaArrowLeft />
        </Link>
        <h2
          className="text-maroon m-0"
          style={{ fontFamily: "Playfair Display" }}
        >
          Member Profile
        </h2>
      </div>

      <Row>
        {/* LEFT COL: Personal Info & Eligibility */}
        <Col md={4}>
          <Card className="shadow-sm border-0 mb-4">
            <Card.Body className="text-center">
              <div
                className="bg-light rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                style={{ width: "100px", height: "100px" }}
              >
                <FaUserTie size={50} className="text-secondary" />
              </div>
              <h4>
                {member.firstName} {member.lastName}
              </h4>
              <Badge bg="info" className="mb-2">
                {member.membershipType} Member
              </Badge>

              {/* Branch Badge */}
              <div className="mb-3">
                <Badge bg="dark" className="border">
                  {member.branch || "Headquarters"}
                </Badge>
              </div>

              <hr />

              <div className="text-start">
                <p>
                  <FaPhone className="me-2 text-muted" /> {member.phone}
                </p>
                <p>
                  <FaMapMarkerAlt className="me-2 text-muted" />{" "}
                  {member.address}
                </p>
                <p>
                  <FaCalendarAlt className="me-2 text-muted" /> Joined:{" "}
                  {new Date(member.joinDate).toLocaleDateString()}
                </p>
              </div>

              {/* ELIGIBILITY CARD (KSS_MEM_5) */}
              <div
                className={`p-3 rounded mt-3 ${
                  isEligible ? "bg-success text-white" : "bg-light border"
                }`}
              >
                <h6 className="fw-bold mb-2">
                  <FaMedal /> Committee Eligibility
                </h6>
                {isEligible ? (
                  <span>
                    Eligible for Committee! <br />
                    (2+ Years & Active)
                  </span>
                ) : (
                  <small>
                    Current Status:
                    <br />
                    Years: {diffYears.toFixed(1)} / 2 <br />
                    Activities: {member.activities.length} / 5
                  </small>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* RIGHT COL: Activities Log (KSS_MEM_4) */}
        <Col md={8}>
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
