import React, { useEffect, useState } from "react";
import axios from "axios";
import BASE_URL from "../../apiConfig";
import {
  Card,
  Row,
  Col,
  Form,
  Button,
  Alert,
  Spinner,
  Badge,
} from "react-bootstrap";
import {
  FaCalendarAlt,
  FaPrint,
  FaCircle,
  FaMoon,
  FaSun,
} from "react-icons/fa";

// Constants for Dropdowns
const TELUGU_MASAMS = [
  "Chaitra",
  "Vaishakha",
  "Jyeshtha",
  "Ashadha",
  "Shravana",
  "Bhadrapada",
  "Ashwayuja",
  "Kartika",
  "Margashirsha",
  "Pushya",
  "Magha",
  "Phalguna",
];

const TITHIS = [
  "Padyami",
  "Vidiya",
  "Tadiya",
  "Chavithi",
  "Panchami",
  "Shasthi",
  "Saptami",
  "Ashtami",
  "Navami",
  "Dashami",
  "Ekadashi",
  "Dwadashi",
  "Trayodashi",
  "Chaturdashi",
  "Pournami",
  "Amavasya",
];

const PAKSHAS = ["Shukla", "Krishna"];

const DailySeva = () => {
  const [mode, setMode] = useState("Gregorian"); // 'Gregorian' or 'Telugu'

  // Date State
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  // Tithi State
  const [selectedMasam, setSelectedMasam] = useState(TELUGU_MASAMS[0]);
  const [selectedPaksha, setSelectedPaksha] = useState(PAKSHAS[0]);
  const [selectedTithi, setSelectedTithi] = useState(TITHIS[0]);

  const [sevas, setSevas] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSevaList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date, mode, selectedMasam, selectedPaksha, selectedTithi]);

  const fetchSevaList = async () => {
    try {
      setLoading(true);
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

      // Construct Query
      let url = `${BASE_URL}/api/donations/daily-seva?date=${date}`;

      if (mode === "Telugu") {
        const tithiString = `${selectedMasam} ${selectedPaksha} ${selectedTithi}`;
        url += `&tithi=${tithiString}`;
      }

      const { data } = await axios.get(url, config);
      setSevas(data);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  return (
    <div className="daily-seva-container">
      {/* --- HEADER --- */}
      <div className="d-print-none mb-4">
        <Row className="align-items-center">
          <Col md={6}>
            <h2
              className="text-maroon m-0"
              style={{ fontFamily: "Playfair Display" }}
            >
              Daily Seva List
            </h2>
            <p className="text-muted m-0 small">Donors to be announced today</p>
          </Col>
          <Col md={6} className="text-end">
            <Button variant="dark" onClick={() => window.print()}>
              <FaPrint className="me-2" /> Print List
            </Button>
          </Col>
        </Row>

        {/* --- CONTROLS CARD --- */}
        <Card className="mt-3 bg-light border-0">
          <Card.Body>
            <div className="d-flex gap-3 mb-3">
              <Button
                variant={mode === "Gregorian" ? "primary" : "outline-primary"}
                size="sm"
                onClick={() => setMode("Gregorian")}
              >
                <FaSun className="me-2" /> English Date
              </Button>
              <Button
                variant={mode === "Telugu" ? "warning" : "outline-warning"}
                size="sm"
                onClick={() => setMode("Telugu")}
              >
                <FaMoon className="me-2" /> Telugu Tithi
              </Button>
            </div>

            <Row className="g-2 align-items-center">
              {mode === "Gregorian" ? (
                <Col md={4}>
                  <Form.Label className="small fw-bold">Select Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </Col>
              ) : (
                <>
                  <Col md={3}>
                    <Form.Label className="small fw-bold">Masam</Form.Label>
                    <Form.Select
                      value={selectedMasam}
                      onChange={(e) => setSelectedMasam(e.target.value)}
                    >
                      {TELUGU_MASAMS.map((m) => (
                        <option key={m}>{m}</option>
                      ))}
                    </Form.Select>
                  </Col>
                  <Col md={3}>
                    <Form.Label className="small fw-bold">Paksha</Form.Label>
                    <Form.Select
                      value={selectedPaksha}
                      onChange={(e) => setSelectedPaksha(e.target.value)}
                    >
                      {PAKSHAS.map((p) => (
                        <option key={p}>{p}</option>
                      ))}
                    </Form.Select>
                  </Col>
                  <Col md={3}>
                    <Form.Label className="small fw-bold">Tithi</Form.Label>
                    <Form.Select
                      value={selectedTithi}
                      onChange={(e) => setSelectedTithi(e.target.value)}
                    >
                      {TITHIS.map((t) => (
                        <option key={t}>{t}</option>
                      ))}
                    </Form.Select>
                  </Col>
                </>
              )}
            </Row>
          </Card.Body>
        </Card>
      </div>

      {/* --- PRINTABLE NOTICE BOARD AREA --- */}
      <div className="printable-area p-3 p-lg-5 bg-white border shadow-sm">
        {/* Header for Print */}
        <div className="text-center mb-5 border-bottom pb-3">
          <h2
            className="text-maroon fw-bold"
            style={{ fontFamily: "Playfair Display", letterSpacing: "1px" }}
          >
            KARUNASRI SEVA SAMITHI
          </h2>
          <h5 className="text-uppercase text-muted mt-2">Daily Seva List</h5>
          <div className="mt-2 fw-bold text-dark">
            <FaCalendarAlt className="me-2" />
            {mode === "Gregorian" ? (
              new Date(date).toLocaleDateString("en-IN", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })
            ) : (
              <span className="text-warning text-dark bg-warning px-2 rounded">
                {selectedMasam} {selectedPaksha} {selectedTithi}
              </span>
            )}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" />
          </div>
        ) : sevas.length === 0 ? (
          <Alert variant="light" className="text-center py-5">
            <h5 className="text-muted">
              No specific Sevas scheduled for this selection.
            </h5>
            <p>Regular Ashram activities will continue as usual.</p>
          </Alert>
        ) : (
          <div className="seva-list">
            {sevas.map((seva) => (
              <div
                key={seva._id}
                className="seva-item mb-4 p-3 rounded"
                style={{
                  borderLeft: "5px solid #d35400",
                  backgroundColor: "#fffbf0",
                }}
              >
                <div className="d-flex align-items-start">
                  <div
                    className="me-3 mt-2 text-warning"
                    style={{ fontSize: "0.6rem" }}
                  >
                    <FaCircle />
                  </div>
                  <div>
                    {/* --- THE SENTENCE FORMAT --- */}
                    <h5
                      className="mb-2"
                      style={{
                        lineHeight: "1.6",
                        fontFamily: "Georgia, serif",
                      }}
                    >
                      <Badge bg="secondary" className="me-2 mb-1">
                        {seva.scheme}
                      </Badge>
                      sponsored by
                      <span className="text-maroon fw-bold fs-4 mx-2">
                        {" "}
                        Sri {seva.donorName} garu
                      </span>
                    </h5>

                    <div className="text-muted fst-italic">
                      {seva.occasion && (
                        <span>
                          on the occasion of{" "}
                          <strong className="text-dark">{seva.occasion}</strong>
                        </span>
                      )}
                      {seva.inNameOf && (
                        <span>
                          {" "}
                          in the name of{" "}
                          <strong className="text-dark">{seva.inNameOf}</strong>
                        </span>
                      )}
                      .
                    </div>
                    {/* --------------------------- */}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer for Print */}
        <div className="text-center mt-5 pt-4 border-top d-none d-print-block">
          <p className="text-muted small fst-italic">
            May the blessings of the Almighty be upon the donors and their
            families.
            <br />- Ashram Management
          </p>
        </div>
      </div>

      <style>
        {`
          .text-maroon { color: #581818; }
          @media print {
            .d-print-none { display: none !important; }
            .d-print-block { display: block !important; }
            .sidebar, .top-header { display: none; }
            .main-content { margin: 0; padding: 0; width: 100%; }
            body { background: white; }
            .printable-area { border: none !important; shadow: none !important; padding: 0 !important; }
            .seva-item { border: 1px solid #eee; page-break-inside: avoid; }
          }
        `}
      </style>
    </div>
  );
};

export default DailySeva;
