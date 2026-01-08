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
  ButtonGroup,
} from "react-bootstrap";
import {
  FaPlus,
  FaFilePdf,
  FaImages,
  FaTrash,
  FaSearch,
  FaCertificate,
  FaUsers,
  FaBuilding,
  FaLayerGroup,
  FaFileUpload,
  FaClock,
} from "react-icons/fa";
import axios from "axios";
import BASE_URL from "../../apiConfig";
const DonationList = () => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [schemes, setSchemes] = useState([]);

  // --- NEW: CATEGORY FILTER STATE ---
  const [filterCategory, setFilterCategory] = useState("Household"); // Default to Household

  const [showModal, setShowModal] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  const [showImportModal, setShowImportModal] = useState(false);
  const [importCategory, setImportCategory] = useState("Household"); // Default
  const [importFile, setImportFile] = useState(null);

  // --- TAX CERTIFICATE STATES ---
  const [showTaxModal, setShowTaxModal] = useState(false);
  const [taxYear, setTaxYear] = useState(new Date().getFullYear());
  const [taxPhone, setTaxPhone] = useState("");

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
    branch: "Karunya Sindu",
    isRecurring: false,
    occasion: "",
    inNameOf: "",
    programDate: "",
    // New Field
    category: "Household",
  });

  const [showMediaModal, setShowMediaModal] = useState(false);
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const getSchemes = async () => {
      try {
        const { data } = await axios.get(`${BASE_URL}/api/schemes`);
        setSchemes(data);
        if (data.length > 0)
          setFormData((prev) => ({ ...prev, scheme: data[0].name }));
      } catch (err) {
        console.error(err);
      }
    };
    getSchemes();
    fetchDonations();
  }, []);

  const fetchDonations = useCallback(async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      if (!userInfo || !userInfo.token) {
        setLoading(false);
        return;
      }
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const { data } = await axios.get(`${BASE_URL}/api/donations`, config);
      setDonations(data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch donations.");
      setLoading(false);
    }
  }, []);

  // --- FILTER LOGIC ---
  const filteredDonations = donations.filter((d) => {
    if (filterCategory === "All") return true;
    // Default legacy data (missing category) to Household
    const cat = d.category || "Household";
    return cat === filterCategory;
  });

  const handleChange = (e) => {
    const value =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSearchDonor = async () => {
    if (!formData.donorPhone)
      return alert("Please enter a phone number to search.");
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const { data } = await axios.get(
        `${BASE_URL}/api/donations/search?phone=${formData.donorPhone}`,
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
      await axios.post(`${BASE_URL}/api/donations`, formData, config);
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
        branch: "Karunya Sindu",
        isRecurring: false,
        occasion: "",
        inNameOf: "",
        programDate: "",
        category: "Household", // Reset to default
      });
      alert("Donation Added Successfully!");
    } catch (err) {
      alert(err.response?.data?.message || "Error adding donation");
    }
    setSubmitLoading(false);
  };

  const handleExport = () => {
    if (filteredDonations.length === 0) return alert("No data to export");

    // 1. Define Headers
    const headers = [
      "Receipt ID",
      "Date",
      "KSS Category (Code)",
      "Category",
      "Donor Name",
      "Phone",
      "Email",
      "PAN",
      "Aadhaar",
      "Billing Address", // <--- Logic Updated below
      "Amount",
      "Scheme",
      "Mode",
      "Branch",
      "Occasion", // <--- RESTORED
      "In Name Of", // <--- Added for completeness
      "Program Date", // <--- Added for completeness
    ];

    // 2. Map Data Rows
    const rows = filteredDonations.map((d) => [
      d._id.toString().slice(-6).toUpperCase(),
      new Date(d.createdAt).toLocaleDateString(),
      d.accountHead ? d.accountHead.code : "-",
      d.category || "Household",
      `"${d.donorName}"`,
      `"${d.donorPhone}"`,
      d.donorEmail || "-",
      d.donorPan || "-",
      d.donorAadhaar ? `"${d.donorAadhaar}"` : "-",
      // FIX: Use Donor Address OR fallback to Branch Name as requested
      `"${d.address || d.branch}"`,
      d.amount,
      d.scheme,
      d.paymentMode,
      d.branch,
      // FIX: Added Occasion Details
      d.occasion || "-",
      d.inNameOf || "-",
      d.programDate ? new Date(d.programDate).toLocaleDateString() : "-",
    ]);

    // 3. Generate CSV
    const csvContent =
      "data:text/csv;charset=utf-8," +
      headers.join(",") +
      "\n" +
      rows.map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);

    // Filename
    const dateStr = new Date().toISOString().split("T")[0];
    link.setAttribute("download", `Donations_Export_${dateStr}.csv`);

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- 2. IMPORT HANDLER ---
  // const handleImport = async (e) => {
  //   const file = e.target.files[0];
  //   if (!file) return;
  //   const fd = new FormData();
  //   fd.append("file", file);

  //   try {
  //     const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  //     const config = {
  //       headers: {
  //         "Content-Type": "multipart/form-data",
  //         Authorization: `Bearer ${userInfo.token}`,
  //       },
  //     };
  //     const { data } = await axios.post(
  //       "http://localhost:5000/api/donations/import",
  //       fd,
  //       config
  //     );
  //     alert(data.message);
  //     fetchDonations();
  //   } catch (err) {
  //     alert(err.response?.data?.message || "Import Failed");
  //   }
  // };
  // --- IMPORT HANDLER ---
  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("file", file);

    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const config = {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${userInfo.token}`,
        },
      };
      const { data } = await axios.post(
        `${BASE_URL}/api/donations/import`,
        fd,
        config
      );
      alert(data.message);
      fetchDonations(); // Refresh list to show new data
    } catch (err) {
      alert(err.response?.data?.message || "Import Failed");
    }
  };

  // ... (Keep handleFileChange, handleUpload, openMediaModal, handleDeleteMedia, handleDownloadTaxCert EXACTLY AS IS) ...
  const handleFileChange = (e) => setFiles(e.target.files);
  const handleUpload = async (e) => {
    e.preventDefault();
    if (files.length === 0) return alert("Please select files");
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
      await axios.post(
        `${BASE_URL}/api/donations/${selectedDonation._id}/upload`,
        fd,
        config
      );
      alert("Uploaded Successfully!");
      setFiles([]);
      setShowMediaModal(false);
      fetchDonations();
    } catch (err) {
      alert("Upload failed");
    }
    setUploading(false);
  };
  const openMediaModal = (donation) => {
    setSelectedDonation(donation);
    setShowMediaModal(true);
  };
  const handleDeleteMedia = async (filePath) => {
    if (!window.confirm("Are you sure you want to delete this file?")) return;
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const config = {
        headers: { Authorization: `Bearer ${userInfo.token}` },
        data: { filePath },
      };
      const { data } = await axios.delete(
        `${BASE_URL}/api/donations/${selectedDonation._id}/media`,
        config
      );
      setSelectedDonation({ ...selectedDonation, media: data.media });
      fetchDonations();
      alert("File Deleted");
    } catch (err) {
      alert("Error deleting file");
    }
  };
  const handleDownloadTaxCert = async (e) => {
    e.preventDefault();
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const response = await axios.get(
        `${BASE_URL}/api/donations/tax-certificate?phone=${taxPhone}&year=${taxYear}`,
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

  const handleImportSubmit = async (e) => {
    e.preventDefault();
    if (!importFile) return alert("Please select a file");

    const fd = new FormData();
    fd.append("file", importFile);
    fd.append("category", importCategory); // Sends "Household" or "Organizational" to backend

    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const config = {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${userInfo.token}`,
        },
      };

      const { data } = await axios.post(
        `${BASE_URL}/api/donations/import`,
        fd,
        config
      );

      alert(data.message);
      setShowImportModal(false); // Close the popup
      setImportFile(null); // Clear file
      fetchDonations(); // Refresh table
    } catch (err) {
      alert(err.response?.data?.message || "Import Failed");
    }
  };

  return (
    <div>
      <Row className="mb-4 align-items-center">
        <Col md={5}>
          <h2
            className="text-maroon"
            style={{ fontFamily: "Playfair Display" }}
          >
            Donations
          </h2>
        </Col>
        <Col md={7} className="text-end">
          <Button
            variant="warning"
            className="me-2 text-dark"
            onClick={() => setShowImportModal(true)}
          >
            <FaFileUpload /> Import CSV
          </Button>
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
            <FaPlus /> Add Donation
          </Button>
        </Col>
      </Row>

      {/* --- TABS --- */}
      <div className="mb-3">
        <ButtonGroup>
          <Button
            variant={filterCategory === "Household" ? "dark" : "outline-dark"}
            onClick={() => setFilterCategory("Household")}
          >
            <FaUsers className="me-2" /> Household (Individuals)
          </Button>
          <Button
            variant={
              filterCategory === "Organizational"
                ? "warning"
                : "outline-warning"
            }
            onClick={() => setFilterCategory("Organizational")}
          >
            <FaBuilding className="me-2" /> Organizational
          </Button>
          <Button
            variant={
              filterCategory === "All" ? "secondary" : "outline-secondary"
            }
            onClick={() => setFilterCategory("All")}
          >
            <FaLayerGroup className="me-2" /> All Records
          </Button>
        </ButtonGroup>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

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
                  <th>Category</th>
                  <th>Donor Name</th>
                  <th>Scheme</th>
                  <th>Amount</th>
                  <th>Mode</th>
                  <th>Branch</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredDonations.map((d) => (
                  <tr key={d._id}>
                    <td className="ps-4 text-muted small">
                      {new Date(d.createdAt).toLocaleDateString()}
                    </td>
                    <td>
                      <Badge
                        bg={
                          d.category === "Organizational"
                            ? "warning"
                            : "secondary"
                        }
                        text={
                          d.category === "Organizational" ? "dark" : "white"
                        }
                      >
                        {d.category || "Household"}
                      </Badge>
                    </td>
                    <td>
                      <div className="fw-bold">{d.donorName}</div>
                      <small className="text-muted">{d.donorPhone}</small>
                    </td>
                    <td>
                      <Badge bg="info" text="dark">
                        {d.scheme}
                      </Badge>

                      {/* --- RESTORED: Special Occasion Visuals --- */}
                      {(d.occasion || d.programDate) && (
                        <div
                          className="mt-1 small"
                          style={{ lineHeight: "1.2" }}
                        >
                          {d.occasion && (
                            <div className="fw-bold text-secondary mb-1">
                              {d.occasion}
                            </div>
                          )}

                          {d.programDate && (
                            <div className="text-danger fw-bold">
                              <FaClock className="me-1" />
                              {new Date(d.programDate).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="fw-bold">₹{d.amount.toLocaleString()}</td>
                    <td>{d.paymentMode}</td>
                    <td>
                      <small>{d.branch}</small>
                    </td>
                    <td>
                      <div className="d-flex justify-content-center gap-2">
                        <Button
                          size="sm"
                          variant={
                            d.media && d.media.length > 0
                              ? "warning"
                              : "outline-secondary"
                          }
                          onClick={() => openMediaModal(d)}
                        >
                          <FaImages />
                        </Button>
                        {/* Download Receipt Logic - Keeping existing */}
                        <Button
                          size="sm"
                          variant="outline-dark"
                          onClick={async () => {
                            try {
                              const userInfo = JSON.parse(
                                localStorage.getItem("userInfo")
                              );
                              const response = await axios.get(
                                `${BASE_URL}/api/donations/${d._id}/receipt`,
                                {
                                  headers: {
                                    Authorization: `Bearer ${userInfo.token}`,
                                  },
                                  responseType: "blob",
                                }
                              );
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
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredDonations.length === 0 && (
                  <tr>
                    <td colSpan="8" className="text-center py-5 text-muted">
                      No donations found in this category.
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Add New Donation</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            {/* NEW CATEGORY SELECTION */}
            <h6 className="text-maroon">Donation Type</h6>
            <Form.Group className="mb-3">
              <div className="d-flex gap-3">
                <Form.Check
                  type="radio"
                  label="Household (Individual)"
                  name="category"
                  value="Household"
                  checked={formData.category === "Household"}
                  onChange={handleChange}
                />
                <Form.Check
                  type="radio"
                  label="Organizational (Corporate/Trust)"
                  name="category"
                  value="Organizational"
                  checked={formData.category === "Organizational"}
                  onChange={handleChange}
                />
              </div>
            </Form.Group>
            <hr />

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
                  >
                    <FaSearch />
                  </Button>
                </div>
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
                <Form.Label>PAN Number</Form.Label>
                <Form.Control
                  type="text"
                  name="donorPan"
                  value={formData.donorPan}
                  onChange={handleChange}
                />
              </Col>
              {/* --- NEW AADHAAR FIELD --- */}
              <Col md={4} className="mb-3">
                <Form.Label>Aadhaar Number</Form.Label>
                <Form.Control
                  type="text"
                  name="donorAadhaar"
                  value={formData.donorAadhaar}
                  onChange={handleChange}
                  placeholder="12 Digit UID"
                />
              </Col>
            </Row>

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
              <Col md={6} className="mb-3">
                <Form.Label>
                  Ashram Branch <span className="text-danger">*</span>
                </Form.Label>
                <Form.Select
                  name="branch"
                  value={formData.branch}
                  onChange={handleChange}
                  className="fw-bold border-warning"
                >
                  <option value="Karunya Sindu">Karunya Sindu</option>
                  <option value="Karunya Bharathi">Karunya Bharathi</option>
                </Form.Select>
              </Col>
              <Col md={6} className="mb-3">
                <Form.Label>Scheme</Form.Label>
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
                  <option>Foreign Currency</option>
                </Form.Select>
              </Col>
            </Row>

            <hr />
            <h6 className="text-maroon">Special Occasion (Optional)</h6>
            <Row className="mb-3">
              <Col md={4}>
                <Form.Label>Occasion</Form.Label>
                <Form.Select
                  name="occasion"
                  value={formData.occasion}
                  onChange={handleChange}
                >
                  <option value="">-- None --</option>
                  <option value="Birthday">Birthday</option>
                  <option value="Anniversary">Anniversary</option>
                  <option value="In Memory">In Memory</option>
                </Form.Select>
              </Col>
              <Col md={4}>
                <Form.Label>In Name Of</Form.Label>
                <Form.Control
                  name="inNameOf"
                  value={formData.inNameOf}
                  onChange={handleChange}
                />
              </Col>
              <Col md={4}>
                <Form.Label>Seva Date</Form.Label>
                <Form.Control
                  type="date"
                  name="programDate"
                  value={formData.programDate}
                  onChange={handleChange}
                />
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

      {/* KEEP TAX CERT MODAL & MEDIA MODAL AS IS */}
      <Modal show={showTaxModal} onHide={() => setShowTaxModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Generate 80G Certificate</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleDownloadTaxCert}>
            <Form.Group className="mb-3">
              <Form.Label>Donor Phone</Form.Label>
              <Form.Control
                value={taxPhone}
                onChange={(e) => setTaxPhone(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Financial Year</Form.Label>
              <Form.Select
                value={taxYear}
                onChange={(e) => setTaxYear(e.target.value)}
              >
                <option value="2024">2024-25</option>
                <option value="2025">2025-26</option>
              </Form.Select>
            </Form.Group>
            <Button type="submit" variant="primary" className="w-100">
              Download
            </Button>
          </Form>
        </Modal.Body>
      </Modal>

      <Modal
        show={showMediaModal}
        onHide={() => setShowMediaModal(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Media</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleUpload} className="mb-3">
            <Form.Control type="file" multiple onChange={handleFileChange} />
            <Button type="submit" className="mt-2">
              Upload
            </Button>
          </Form>
          <Row>
            {selectedDonation?.media?.map((path, i) => (
              <Col md={4} key={i}>
                <div className="border p-1">
                  <img
                    src={`${BASE_URL}${path}`}
                    style={{ width: "100%", height: "150px" }}
                    alt=""
                  />
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => handleDeleteMedia(path)}
                  >
                    <FaTrash />
                  </Button>
                </div>
              </Col>
            ))}
          </Row>
        </Modal.Body>
      </Modal>
      <Modal show={showImportModal} onHide={() => setShowImportModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Import Donations</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleImportSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Select Category for this File</Form.Label>
              <Form.Select
                value={importCategory}
                onChange={(e) => setImportCategory(e.target.value)}
                className="fw-bold border-warning"
              >
                <option value="Household">Household (Individuals)</option>
                <option value="Organizational">
                  Organizational (Trusts/Corps)
                </option>
              </Form.Select>
              <Form.Text className="text-muted">
                All records in this CSV will be tagged with this category.
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Upload CSV File</Form.Label>
              <Form.Control
                type="file"
                accept=".csv"
                onChange={(e) => setImportFile(e.target.files[0])}
                required
              />
            </Form.Group>

            <Button type="submit" variant="dark" className="w-100">
              Upload & Import
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default DonationList;
