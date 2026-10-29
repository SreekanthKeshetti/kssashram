import React, { useEffect, useState } from "react";
import {
  Row,
  Col,
  Card,
  Table,
  Badge,
  Button,
  Tabs,
  Tab,
  Modal,
  Form,
  Spinner,
} from "react-bootstrap";
import {
  FaPhoneAlt,
  FaWhatsapp,
  FaClipboardList,
  FaClock,
  FaCalendarCheck,
} from "react-icons/fa";
import axios from "axios";
import BASE_URL from "../../apiConfig";

const Renewals = () => {
  const [data, setData] = useState({
    thirtyDays: [],
    sevenDays: [],
    twoDays: [],
    overdue: [],
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("thirtyDays");
  const [currentUser, setCurrentUser] = useState(null);

  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedDonor, setSelectedDonor] = useState(null);
  const [newNote, setNewNote] = useState("");

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("userInfo"));
    setCurrentUser(user);
    if (user) fetchRenewals(user);
  }, []);

  const fetchRenewals = async (user) => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const res = await axios.get(`${BASE_URL}/api/donations/renewals`, config);
      setData(res.data);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const handleWhatsAppClick = (don) => {
    const dateStr = new Date(don.nextReminderDate).toLocaleDateString("en-IN");
    let cleanNumber = don.donorPhone.replace(/\D/g, "");
    if (cleanNumber.length === 10) cleanNumber = "91" + cleanNumber;

    const message = `Namaste ${don.donorName} garu,\n\nWe are from Karunasri Seva Samithi. Last year you generously supported *${don.scheme}*. Your 1-year anniversary is approaching on *${dateStr}*.\n\nWe humbly request you to renew your support and invite you to visit the Ashram.\n\nRegards,\nAshram Management`;

    // --- ROBUST FIX FOR DESKTOP APP & WEB ---
    // Using wa.me with the phone number directly in the path ensures the Desktop App catches both phone and text parameters
    const waUrl = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, "_blank");
  };

  const submitNote = async (e) => {
    e.preventDefault();
    if (!newNote) return;
    try {
      const config = {
        headers: { Authorization: `Bearer ${currentUser.token}` },
      };
      await axios.post(
        `${BASE_URL}/api/donations/${selectedDonor._id}/followup`,
        { note: newNote },
        config,
      );
      alert("Follow-up note saved!");
      setNewNote("");
      setShowNoteModal(false);
      fetchRenewals(currentUser);
    } catch (err) {
      alert("Failed to save note");
    }
  };

  const openHistory = (don) => {
    setSelectedDonor(don);
    setShowHistoryModal(true);
  };

  const renderTable = (donationsArray) => {
    if (donationsArray.length === 0)
      return (
        <p className="text-center text-muted p-4">
          No upcoming renewals in this period.
        </p>
      );
    return (
      <Table hover responsive className="align-middle">
        <thead className="bg-light">
          <tr>
            <th>Donor Details</th>
            <th>Scheme & Last Amount</th>
            <th>Next Renewal Date</th>
            <th className="text-center">Follow Up Activity</th>
            <th className="text-end">Actions</th>
          </tr>
        </thead>
        <tbody>
          {donationsArray.map((d) => (
            <tr key={d._id}>
              <td>
                <div className="fw-bold text-maroon">{d.donorName}</div>
                <div className="small text-muted">
                  <FaPhoneAlt size={10} className="me-1" /> {d.donorPhone}
                </div>
              </td>
              <td>
                <Badge bg="secondary" className="mb-1">
                  {d.scheme}
                </Badge>
                <div className="fw-bold text-success">
                  ₹{d.amount.toLocaleString("en-IN")}
                </div>
              </td>
              <td>
                <div className="fw-bold">
                  {new Date(d.nextReminderDate).toLocaleDateString("en-IN")}
                </div>
              </td>
              <td className="text-center">
                <Button
                  variant="outline-info"
                  size="sm"
                  onClick={() => openHistory(d)}
                >
                  <FaClock className="me-1" /> View Logs (
                  {d.followUpLogs?.length || 0})
                </Button>
              </td>
              <td className="text-end">
                {d.donorPhone && d.donorPhone !== "0000000000" && (
                  <Button
                    variant="outline-success"
                    size="sm"
                    className="me-2"
                    title="WhatsApp Message"
                    onClick={() => handleWhatsAppClick(d)}
                  >
                    <FaWhatsapp />
                  </Button>
                )}
                <Button
                  variant="outline-primary"
                  size="sm"
                  title="Add Call Note"
                  onClick={() => {
                    setSelectedDonor(d);
                    setShowNoteModal(true);
                  }}
                >
                  <FaClipboardList /> Add Note
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    );
  };

  if (loading)
    return (
      <div className="text-center py-5">
        <Spinner animation="border" />
      </div>
    );

  return (
    <div>
      <Row className="mb-4">
        <Col>
          <h2
            className="text-maroon m-0"
            style={{ fontFamily: "Playfair Display" }}
          >
            Donor Renewal Pipeline
          </h2>
          <p className="text-muted m-0 small">
            Telecalling Dashboard for 1-Year Anniversaries
          </p>
        </Col>
      </Row>

      <Card className="border-0 shadow-sm">
        <Card.Header className="bg-white">
          <Tabs
            activeKey={activeTab}
            onSelect={(k) => setActiveTab(k)}
            className="mb-0 border-0"
          >
            <Tab
              eventKey="thirtyDays"
              title={
                <span>
                  <Badge bg="primary" className="me-2">
                    {data.thirtyDays.length}
                  </Badge>{" "}
                  Upcoming (30 Days)
                </span>
              }
            ></Tab>
            <Tab
              eventKey="sevenDays"
              title={
                <span>
                  <Badge bg="warning" text="dark" className="me-2">
                    {data.sevenDays.length}
                  </Badge>{" "}
                  Action Required (7 Days)
                </span>
              }
            ></Tab>
            <Tab
              eventKey="twoDays"
              title={
                <span>
                  <Badge bg="danger" className="me-2">
                    {data.twoDays.length}
                  </Badge>{" "}
                  Critical (2 Days)
                </span>
              }
            ></Tab>
            <Tab
              eventKey="overdue"
              title={
                <span>
                  <Badge bg="secondary" className="me-2">
                    {data.overdue.length}
                  </Badge>{" "}
                  Missed / Overdue
                </span>
              }
            ></Tab>
          </Tabs>
        </Card.Header>
        <Card.Body className="p-0">
          {activeTab === "thirtyDays" && renderTable(data.thirtyDays)}
          {activeTab === "sevenDays" && renderTable(data.sevenDays)}
          {activeTab === "twoDays" && renderTable(data.twoDays)}
          {activeTab === "overdue" && renderTable(data.overdue)}
        </Card.Body>
      </Card>

      {/* MODAL: ADD NOTE */}
      <Modal show={showNoteModal} onHide={() => setShowNoteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add Call Note</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={submitNote}>
            <p className="mb-2 small text-muted">
              Donor: <strong>{selectedDonor?.donorName}</strong>
            </p>
            <Form.Group className="mb-3">
              <Form.Label>Conversation Summary</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="e.g. Spoke to donor, will visit ashram on Sunday."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                required
              />
            </Form.Group>
            <Button type="submit" variant="dark" className="w-100">
              Save Note
            </Button>
          </Form>
        </Modal.Body>
      </Modal>

      {/* MODAL: VIEW HISTORY */}
      <Modal
        show={showHistoryModal}
        onHide={() => setShowHistoryModal(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            Interaction History: {selectedDonor?.donorName}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedDonor?.followUpLogs &&
          selectedDonor.followUpLogs.length > 0 ? (
            <div className="timeline-container ps-3 border-start border-primary">
              {[...selectedDonor.followUpLogs].reverse().map((log, idx) => (
                <div key={idx} className="mb-3 position-relative">
                  <div
                    className="position-absolute"
                    style={{ left: "-22px", top: "2px" }}
                  >
                    <FaCalendarCheck
                      className="text-primary bg-white"
                      size={12}
                    />
                  </div>
                  <div className="small fw-bold text-muted">
                    {new Date(log.date).toLocaleString("en-IN")}
                  </div>
                  <div className="fw-bold text-dark">
                    By: {log.actionBy}{" "}
                    <Badge
                      bg={log.type === "System" ? "info" : "dark"}
                      className="ms-2"
                    >
                      {log.type}
                    </Badge>
                  </div>
                  <p className="mb-0 text-secondary">{log.note}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted">
              No interactions logged yet.
            </p>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default Renewals;
