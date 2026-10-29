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
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [whatsAppData, setWhatsAppData] = useState({
    donorName: "",
    phone: "",
    message: "",
  });

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

  const handleOpenWhatsAppModal = (don) => {
    const dateStr = new Date(don.nextReminderDate).toLocaleDateString("en-IN");
    const message = `Namaste ${don.donorName} garu,\n\nWe are from Karunasri Seva Samithi. Last year you generously supported *${don.scheme}*. Your 1-year anniversary is approaching on *${dateStr}*.\n\nWe humbly request you to renew your support and invite you to visit the Ashram.\n\nRegards,\nAshram Management`;

    setWhatsAppData({
      donorName: don.donorName,
      phone: don.donorPhone !== "0000000000" ? don.donorPhone : "",
      message: message,
    });
    setShowWhatsAppModal(true);
  };

  const handleSendWhatsApp = () => {
    let cleanNumber = whatsAppData.phone.replace(/\D/g, "");
    if (cleanNumber.length === 10) cleanNumber = "91" + cleanNumber;
    const waUrl = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(whatsAppData.message)}`;
    window.open(waUrl, "_blank");
    setShowWhatsAppModal(false);
  };

  const submitNote = async (e) => {
    e.preventDefault();
    try {
      const config = {
        headers: { Authorization: `Bearer ${currentUser.token}` },
      };
      await axios.post(
        `${BASE_URL}/api/donations/${selectedDonor._id}/followup`,
        { note: newNote },
        config,
      );
      setNewNote("");
      setShowNoteModal(false);
      fetchRenewals(currentUser);
    } catch (err) {
      alert("Failed to save note");
    }
  };

  const renderTable = (donationsArray) => {
    if (donationsArray.length === 0)
      return <p className="text-center text-muted p-4">No data.</p>;
    return (
      <Table hover responsive className="align-middle">
        <thead>
          <tr>
            <th>Donor</th>
            <th>Scheme</th>
            <th>Next Renewal</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {donationsArray.map((d) => (
            <tr key={d._id}>
              <td>
                {d.donorName}
                <br />
                <small>{d.donorPhone}</small>
              </td>
              <td>
                {d.scheme} - ₹{d.amount.toLocaleString("en-IN")}
              </td>
              <td>
                {new Date(d.nextReminderDate).toLocaleDateString("en-IN")}
              </td>
              <td>
                <Button
                  size="sm"
                  variant="outline-success"
                  onClick={() => handleOpenWhatsAppModal(d)}
                >
                  <FaWhatsapp />
                </Button>
                <Button
                  size="sm"
                  variant="outline-primary"
                  className="ms-2"
                  onClick={() => {
                    setSelectedDonor(d);
                    setShowNoteModal(true);
                  }}
                >
                  <FaClipboardList />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    );
  };

  return (
    <div>
      <Card>
        <Card.Header>
          <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)}>
            <Tab eventKey="thirtyDays" title="Upcoming (30d)"></Tab>
            <Tab eventKey="sevenDays" title="Action (7d)"></Tab>
            <Tab eventKey="twoDays" title="Critical (2d)"></Tab>
            <Tab eventKey="overdue" title="Overdue"></Tab>
          </Tabs>
        </Card.Header>
        <Card.Body>
          {activeTab === "thirtyDays"
            ? renderTable(data.thirtyDays)
            : activeTab === "sevenDays"
              ? renderTable(data.sevenDays)
              : activeTab === "twoDays"
                ? renderTable(data.twoDays)
                : renderTable(data.overdue)}
        </Card.Body>
      </Card>

      {/* WhatsApp Modal */}
      <Modal
        show={showWhatsAppModal}
        onHide={() => setShowWhatsAppModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Send WhatsApp Reminder</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Control
            className="mb-2"
            value={whatsAppData.phone}
            onChange={(e) =>
              setWhatsAppData({ ...whatsAppData, phone: e.target.value })
            }
          />
          <Form.Control
            as="textarea"
            rows={5}
            value={whatsAppData.message}
            onChange={(e) =>
              setWhatsAppData({ ...whatsAppData, message: e.target.value })
            }
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="success" onClick={handleSendWhatsApp}>
            Send on WhatsApp
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showNoteModal} onHide={() => setShowNoteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add Note</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={submitNote}>
            <Form.Control
              as="textarea"
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              required
            />
            <Button type="submit" className="mt-2 w-100">
              Save
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};
export default Renewals;
