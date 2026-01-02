/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useEffect, useState, useCallback } from "react";
import {
  Table,
  Button,
  Badge,
  Card,
  Row,
  Col,
  Spinner,
  Alert,
  Modal,
  Form,
} from "react-bootstrap";
import {
  FaPlus,
  FaFilePdf,
  FaImages,
  FaTrash,
  FaSearch,
  FaCertificate,
} from "react-icons/fa";
import axios from "axios";

const DonationList = () => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [schemes, setSchemes] = useState([]); // New State for schemes

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    donorName: "",
    donorPhone: "",
    donorEmail: "",
    donorPan: "",
    donorAadhaar: "",
    amount: "",
    scheme: "Nitya Annadhana",
    paymentMode: "Cash",
    paymentReference: "",
    branch: "Headquarters",
    isRecurring: false, // <--- Add this
  });
  // --- MEDIA MODAL STATE ---
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  // Fetch Schemes
  useEffect(() => {
    const getSchemes = async () => {
      const { data } = await axios.get("http://localhost:5000/api/schemes");
      setSchemes(data);
      // Set default scheme if available
      if (data.length > 0)
        setFormData((prev) => ({ ...prev, scheme: data[0].name }));
    };
    getSchemes();
    fetchDonations(); // Existing fetch
  }, []);

  // --- 1. Define Fetch Function with Safety Checks ---
  const fetchDonations = useCallback(async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));

      // Safety Check: If no user logged in, stop here to avoid errors
      if (!userInfo || !userInfo.token) {
        setLoading(false);
        return;
      }

      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const { data } = await axios.get(
        "http://localhost:5000/api/donations",
        config
      );

      setDonations(data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch donations.");
      setLoading(false);
    }
  }, []);

  // --- 2. Call in useEffect ---
  useEffect(() => {
    fetchDonations();
  }, [fetchDonations]);

  // Handle Input Change
  // function handleChange(e) {
  //   setFormData({ ...formData, [e.target.name]: e.target.value });
  // }
  const handleChange = (e) => {
    const value =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  // Handle Form Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userInfo.token}`,
        },
      };

      // Send Data to Backend
      await axios.post("http://localhost:5000/api/donations", formData, config);

      // Success: Close Modal, Refresh List, Reset Form
      setShowModal(false);
      fetchDonations();
      setFormData({
        donorName: "",
        donorPhone: "",
        donorEmail: "",
        donorPan: "",
        amount: "",
        scheme: "Nitya Annadhana",
        paymentMode: "Cash",
        paymentReference: "",
        branch: "Headquarters",
      });
      alert("Donation Added Successfully!");
    } catch (err) {
      alert(err.response?.data?.message || "Error adding donation");
    }
    setSubmitLoading(false);
  };
  // --- HANDLE FILE SELECT ---
  const handleFileChange = (e) => {
    setFiles(e.target.files);
  };

  // --- HANDLE UPLOAD SUBMIT ---
  const handleUpload = async (e) => {
    e.preventDefault();
    if (files.length === 0) return alert("Please select files");

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
        `http://localhost:5000/api/donations/${selectedDonation._id}/upload`,
        formData,
        config
      );

      alert("Uploaded Successfully!");
      setFiles([]);
      setShowMediaModal(false);
      fetchDonations(); // Refresh to update data
    } catch (err) {
      alert("Upload failed");
    }
    setUploading(false);
  };

  const openMediaModal = (donation) => {
    setSelectedDonation(donation);
    setShowMediaModal(true);
  };

  // --- NEW DELETE MEDIA FUNCTION ---
  const handleDeleteMedia = async (filePath) => {
    if (!window.confirm("Are you sure you want to delete this file?")) return;

    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const config = {
        headers: { Authorization: `Bearer ${userInfo.token}` },
        data: { filePath }, // Send path in body for DELETE request
      };

      const { data } = await axios.delete(
        `http://localhost:5000/api/donations/${selectedDonation._id}/media`,
        config
      );

      // Update the selected donation in UI immediately
      setSelectedDonation({ ...selectedDonation, media: data.media });
      fetchDonations(); // Refresh main list
      alert("File Deleted");
    } catch (err) {
      alert("Error deleting file");
    }
  };
  const handleExport = () => {
    console.log("Export button clicked..."); // Debug Log 1

    if (!donations || donations.length === 0) {
      alert("No data to export");
      return;
    }

    try {
      // 1. Define Headers
      const headers = [
        "Date",
        "Account Code",
        "Donor Name",
        "Phone",
        "Email",
        "PAN",
        "Scheme",
        "Amount",
        "Mode",
        "Receipt Status",
      ];

      // 2. Map Data (With Safety Checks)
      const rows = donations.map((d) => {
        // Safe check for Account Code
        // If populated: d.accountHead.code
        // If not populated (just ID): 'N/A'
        // If null: 'N/A'
        let accCode = "N/A";
        if (d.accountHead && typeof d.accountHead === "object") {
          accCode = d.accountHead.code || "N/A";
        }

        return [
          new Date(d.createdAt).toLocaleDateString(),
          accCode,
          `"${d.donorName || ""}"`, // Quote strings to handle commas
          `"${d.donorPhone || ""}"`,
          d.donorEmail || "-",
          d.donorPan || "-",
          `"${d.scheme || ""}"`,
          d.amount || 0,
          d.paymentMode || "-",
          d.receiptStatus || "-",
        ];
      });

      // 3. Create CSV Content
      const csvContent =
        headers.join(",") + "\n" + rows.map((e) => e.join(",")).join("\n");

      // 4. Create Blob (Better than encodeURI)
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);

      // 5. Trigger Download
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `Donations_Export_${new Date().toISOString().split("T")[0]}.csv`
      );
      document.body.appendChild(link);
      link.click();

      // 6. Cleanup
      document.body.removeChild(link);
      console.log("Export successful!"); // Debug Log 2
    } catch (err) {
      console.error("Export Error:", err);
      alert("An error occurred while exporting. Check console for details.");
    }
  };
  // --- STATE FOR TAX CERTIFICATE MODAL ---
  const [showTaxModal, setShowTaxModal] = useState(false);
  const [taxYear, setTaxYear] = useState(new Date().getFullYear());
  const [taxPhone, setTaxPhone] = useState("");

  // --- NEW: SEARCH DONOR FUNCTION (Inside Component) ---
  const handleSearchDonor = async () => {
    if (!formData.donorPhone)
      return alert("Please enter a phone number to search.");

    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

      const { data } = await axios.get(
        `http://localhost:5000/api/donations/search?phone=${formData.donorPhone}`,
        config
      );

      if (data.success) {
        setFormData((prev) => ({
          ...prev,
          donorName: data.donor.donorName,
          donorEmail: data.donor.donorEmail || "",
          donorPan: data.donor.donorPan || "",
          donorAadhaar: data.donor.donorAadhaar || "",
        }));
        alert("Donor details found and autofilled!");
      }
    } catch (err) {
      alert("Donor not found. Please enter details manually.");
    }
  };

  // --- NEW: DOWNLOAD TAX CERTIFICATE ---
  const handleDownloadTaxCert = async (e) => {
    e.preventDefault();
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const response = await axios.get(
        `http://localhost:5000/api/donations/tax-certificate?phone=${taxPhone}&year=${taxYear}`,
        {
          headers: { Authorization: `Bearer ${userInfo.token}` },
          responseType: "blob",
        }
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `TaxCert_${taxPhone}_${taxYear}.pdf`);
      document.body.appendChild(link);
      link.click();
      setShowTaxModal(false);
    } catch (err) {
      alert("Error: No donations found for this donor in the selected year.");
    }
  };
  return (
    <div>
      {/* --- Header --- */}
      <Row className="mb-4 align-items-center">
        <Col>
          <h2
            className="text-maroon"
            style={{ fontFamily: "Playfair Display" }}
          >
            Donations Management
          </h2>
          <p className="text-muted">Track all incoming donations</p>
        </Col>
        <Col className="text-end">
          <Button
            variant="info"
            className="me-2 text-white"
            onClick={() => setShowTaxModal(true)}
          >
            <FaCertificate /> Tax Cert
          </Button>
          <Button variant="success" className="me-2" onClick={handleExport}>
            <FaFilePdf /> Export
          </Button>
          <Button
            variant="primary"
            style={{ backgroundColor: "#581818", border: "none" }}
            onClick={() => setShowModal(true)}
          >
            <FaPlus /> Add New Donation
          </Button>
        </Col>
      </Row>
      <Row>
        <Col md={6} className="mb-3">
          <Form.Label>
            Phone Number <span className="text-danger">*</span>
          </Form.Label>
          <div className="input-group">
            <Form.Control
              type="text"
              name="donorPhone"
              value={formData.donorPhone}
              onChange={handleChange}
              required
              placeholder="Enter phone to search"
            />
            <Button
              variant="outline-secondary"
              onClick={handleSearchDonor}
              title="Search Existing Donor"
            >
              <FaSearch />
            </Button>
          </div>
        </Col>
      </Row>
      {/* --- Error Alert --- */}
      {error && <Alert variant="danger">{error}</Alert>}
      {/* --- Data Table --- */}
      <Card className="shadow-sm border-0">
        <Card.Body className="p-0">
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" />
            </div>
          ) : (
            <Table hover responsive className="align-middle mb-0">
              <thead className="bg-light">
                <tr>
                  <th className="ps-4">Date</th>
                  <th>Donor Name</th>
                  <th>Scheme</th>
                  <th>Amount</th>
                  <th>Mode</th>
                  <th>Branch</th>
                  <th>Receipt</th>
                </tr>
              </thead>
              <tbody>
                {donations.map((d) => (
                  <tr key={d._id}>
                    <td className="ps-4">
                      {new Date(d.createdAt).toLocaleDateString()}
                    </td>
                    <td>
                      <div className="fw-bold">{d.donorName}</div>
                      <small className="text-muted">{d.donorPhone}</small>
                    </td>
                    <td>
                      <Badge bg="info" text="dark">
                        {d.scheme}
                      </Badge>
                    </td>
                    <td className="fw-bold">₹{d.amount.toLocaleString()}</td>
                    <td>{d.paymentMode}</td>
                    <td>{d.branch}</td>
                    {/* <td>
                      {d.receiptStatus === "Sent" ? (
                        <Badge bg="success">Sent</Badge>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline-dark"
                          style={{ fontSize: "0.7rem" }}
                        >
                          Generate
                        </Button>
                      )}
                    </td> */}
                    <td>
                      <div className="d-flex justify-content-center gap-2">
                        {/* 1. Media Gallery Button */}
                        <Button
                          size="sm"
                          variant={
                            d.media && d.media.length > 0
                              ? "warning"
                              : "outline-secondary"
                          }
                          title="View/Upload Photos"
                          onClick={() => openMediaModal(d)}
                        >
                          <FaImages />
                        </Button>
                        {/* Download Button */}
                        <Button
                          size="sm"
                          variant="outline-dark"
                          title="Download PDF"
                          onClick={async () => {
                            try {
                              const userInfo = JSON.parse(
                                localStorage.getItem("userInfo")
                              );
                              const response = await axios.get(
                                `http://localhost:5000/api/donations/${d._id}/receipt`,
                                {
                                  headers: {
                                    Authorization: `Bearer ${userInfo.token}`,
                                  },
                                  responseType: "blob", // Important for file download
                                }
                              );
                              // Create a link to download the blob
                              const url = window.URL.createObjectURL(
                                new Blob([response.data])
                              );
                              const link = document.createElement("a");
                              link.href = url;
                              link.setAttribute(
                                "download",
                                `Receipt_${d.donorName}.pdf`
                              );
                              document.body.appendChild(link);
                              link.click();
                            } catch (err) {
                              alert("Error downloading receipt");
                            }
                          }}
                        >
                          <FaFilePdf />
                        </Button>

                        {/* Email Button */}
                        {d.donorEmail && (
                          <Button
                            size="sm"
                            variant={
                              d.receiptStatus === "Sent"
                                ? "success"
                                : "outline-primary"
                            }
                            title="Email Receipt"
                            onClick={async () => {
                              if (!confirm(`Send receipt to ${d.donorEmail}?`))
                                return;
                              try {
                                const userInfo = JSON.parse(
                                  localStorage.getItem("userInfo")
                                );
                                await axios.post(
                                  `http://localhost:5000/api/donations/${d._id}/email`,
                                  {},
                                  {
                                    headers: {
                                      Authorization: `Bearer ${userInfo.token}`,
                                    },
                                  }
                                );
                                alert("Email Sent Successfully!");
                                fetchDonations(); // Refresh to show green status
                              } catch (err) {
                                alert("Error sending email");
                              }
                            }}
                          >
                            {d.receiptStatus === "Sent" ? "Sent" : "Email"}
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {donations.length === 0 && (
                  <tr>
                    <td colSpan="7" className="text-center py-5 text-muted">
                      No donations found.
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>
      {/* --- ADD DONATION MODAL --- */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Add Manual Donation</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6} className="mb-3">
                <Form.Label>
                  Donor Name <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="text"
                  name="donorName"
                  value={formData.donorName}
                  onChange={handleChange}
                  required
                />
              </Col>
              <Col md={6} className="mb-3">
                <Form.Label>
                  Phone Number <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="text"
                  name="donorPhone"
                  value={formData.donorPhone}
                  onChange={handleChange}
                  required
                />
              </Col>
              <Col md={6} className="mb-3">
                <Form.Label>Email (Optional)</Form.Label>
                <Form.Control
                  type="email"
                  name="donorEmail"
                  value={formData.donorEmail}
                  onChange={handleChange}
                />
              </Col>
              <Col md={6} className="mb-3">
                <Form.Label>PAN Number (For 80G)</Form.Label>
                <Form.Control
                  type="text"
                  name="donorPan"
                  value={formData.donorPan}
                  onChange={handleChange}
                />
              </Col>
              <Col md={6} className="mb-3">
                <Form.Label>Aadhaar Number</Form.Label>
                <Form.Control
                  type="text"
                  name="donorAadhaar"
                  value={formData.donorAadhaar}
                  onChange={handleChange}
                  placeholder="Optional"
                />
              </Col>
            </Row>

            <hr />

            <Row>
              <Col md={6} className="mb-3">
                <Form.Label>
                  Amount (₹) <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  required
                />
              </Col>
              {/* Update Scheme Select to use Dynamic Data */}
              <Col md={6} className="mb-3">
                <Form.Label>
                  Scheme <span className="text-danger">*</span>
                </Form.Label>
                <Form.Select
                  name="scheme"
                  value={formData.scheme}
                  onChange={handleChange}
                >
                  {schemes.map((s) => (
                    <option key={s._id} value={s.name}>
                      {s.name}
                    </option>
                  ))}
                </Form.Select>
              </Col>
              {/* Update Payment Mode to include Foreign Currency */}
              <Col md={6} className="mb-3">
                <Form.Label>Payment Mode</Form.Label>
                <Form.Select
                  name="paymentMode"
                  value={formData.paymentMode}
                  onChange={handleChange}
                >
                  <option>Cash</option>
                  <option>Online</option>
                  <option>Cheque</option>
                  <option>DD</option>
                  <option>Foreign Currency</option> {/* Added */}
                </Form.Select>
              </Col>
              <Col md={6} className="mb-3">
                <Form.Label>Reference / Cheque No</Form.Label>
                <Form.Control
                  type="text"
                  name="paymentReference"
                  value={formData.paymentReference}
                  onChange={handleChange}
                  placeholder="Optional"
                />
              </Col>
              <Col md={12} className="mb-3">
                <Form.Check
                  type="checkbox"
                  id="isRecurring"
                  label="Remind Donor Next Year? (Annual Recurring)"
                  name="isRecurring"
                  checked={formData.isRecurring}
                  onChange={handleChange}
                  className="fw-bold text-primary"
                />
                <Form.Text className="text-muted">
                  If checked, the system will send an email 30 days and 7 days
                  before the same date next year.
                </Form.Text>
              </Col>
            </Row>

            <div className="text-end mt-3">
              <Button
                variant="secondary"
                className="me-2"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                type="submit"
                disabled={submitLoading}
                style={{ backgroundColor: "#581818" }}
              >
                {submitLoading ? "Saving..." : "Save Donation"}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
      <Modal
        show={showMediaModal}
        onHide={() => setShowMediaModal(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Celebration Media</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedDonation && (
            <>
              <h5 className="text-maroon mb-3">
                Upload Photos/Videos for {selectedDonation.donorName}
              </h5>

              {/* Upload Form */}
              <Form
                onSubmit={handleUpload}
                className="mb-4 p-3 bg-light rounded"
              >
                <Form.Group controlId="formFileMultiple" className="mb-3">
                  <Form.Label>Select Files (Images/Video/PDF)</Form.Label>
                  <Form.Control
                    type="file"
                    multiple
                    onChange={handleFileChange}
                  />
                </Form.Group>
                <Button type="submit" variant="primary" disabled={uploading}>
                  {uploading ? "Uploading..." : "Upload Files"}
                </Button>
              </Form>

              <hr />

              {/* Gallery Grid */}
              <h6 className="mb-3">
                Attached Media ({selectedDonation.media?.length || 0})
              </h6>
              <Row>
                {selectedDonation.media &&
                  selectedDonation.media.map((path, index) => (
                    <Col md={4} key={index} className="mb-3">
                      <div className="border rounded p-1 position-relative">
                        {/* DELETE BUTTON OVERLAY */}
                        <Button
                          variant="danger"
                          size="sm"
                          className="position-absolute top-0 end-0 m-1"
                          style={{ zIndex: 10 }}
                          onClick={() => handleDeleteMedia(path)}
                          title="Delete File"
                        >
                          <FaTrash size={10} />
                        </Button>
                        {/* Check if it's an image or other file */}
                        {path.match(/\.(jpeg|jpg|png|gif)$/) ? (
                          <img
                            src={`http://localhost:5000${path}`}
                            alt="Donation Media"
                            style={{
                              width: "100%",
                              height: "150px",
                              objectFit: "cover",
                            }}
                          />
                        ) : (
                          <div className="text-center py-5 bg-white">
                            <a
                              href={`http://localhost:5000${path}`}
                              target="_blank"
                              rel="noreferrer"
                            >
                              View Document/Video
                            </a>
                          </div>
                        )}
                      </div>
                    </Col>
                  ))}
                {(!selectedDonation.media ||
                  selectedDonation.media.length === 0) && (
                  <p className="text-muted text-center">
                    No media uploaded yet.
                  </p>
                )}
              </Row>
            </>
          )}
        </Modal.Body>
      </Modal>
      {/* 3. ADD TAX CERTIFICATE MODAL (At the bottom) */}
      <Modal show={showTaxModal} onHide={() => setShowTaxModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Generate Consolidated 80G Certificate</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleDownloadTaxCert}>
            <Form.Group className="mb-3">
              <Form.Label>Donor Phone Number</Form.Label>
              <Form.Control
                required
                value={taxPhone}
                onChange={(e) => setTaxPhone(e.target.value)}
                placeholder="Enter Donor Phone"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Financial Year (Start Year)</Form.Label>
              <Form.Select
                value={taxYear}
                onChange={(e) => setTaxYear(e.target.value)}
              >
                <option value="2023">2023 - 2024</option>
                <option value="2024">2024 - 2025</option>
                <option value="2025">2025 - 2026 (Current)</option>{" "}
                {/* Select this for recent entries */}
              </Form.Select>
            </Form.Group>
            <Button type="submit" variant="primary" className="w-100">
              Download Certificate
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default DonationList;
