/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import BASE_URL from "../../apiConfig";

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
  FaEnvelope,
  FaCheck,
} from "react-icons/fa";

// --- CONSTANTS FOR TELUGU DATE ---
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
const PAKSHAS = ["Shukla", "Krishna"];
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

const DonationList = () => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [schemes, setSchemes] = useState([]);

  // Filters
  const [filterCategory, setFilterCategory] = useState("Household");
  const [dateFilter, setDateFilter] = useState({ start: "", end: "" });

  // Modals
  const [showModal, setShowModal] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showTaxModal, setShowTaxModal] = useState(false);
  const [showMediaModal, setShowMediaModal] = useState(false);

  // Import State
  const [importCategory, setImportCategory] = useState("Household");
  const [importFile, setImportFile] = useState(null);

  // Tax Cert State
  const [taxYear, setTaxYear] = useState(new Date().getFullYear());
  const [taxPhone, setTaxPhone] = useState("");

  // Media State
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  // Occasion List State
  const [occasionsList, setOccasionsList] = useState([]);

  // --- TITHI SELECTION STATE ---
  const [tithiParts, setTithiParts] = useState({
    masam: TELUGU_MASAMS[0],
    paksha: PAKSHAS[0],
    tithi: TITHIS[0],
  });

  // --- MAIN FORM DATA ---
  const [formData, setFormData] = useState({
    donorName: "",
    donorPhone: "",
    donorEmail: "",
    donorPan: "",
    donorAadhaar: "",
    amount: "",
    scheme: "Nitya Annadhana",
    paymentMode: "Cash",
    branch: "Karunya Sindhu",
    category: "Household",
    address: "",

    // Occasion
    occasion: "",
    inNameOf: "",

    // Calendar Logic
    calendarType: "Gregorian",
    programDate: "",
    tithi: "", // Will be auto-filled on submit

    // Manual Legacy Data
    manualReceiptNo: "",
    manualReceiptDate: "",

    // Payment Details (Nested)
    paymentDetails: {
      chequeNo: "",
      chequeDate: "",
      bankName: "",
      transactionId: "",
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem("userInfo"));
        if (!userInfo || !userInfo.token) return;
        const config = {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        };

        const schemeRes = await axios.get(`${BASE_URL}/api/schemes`, config);
        setSchemes(schemeRes.data);
        if (schemeRes.data.length > 0) {
          setFormData((prev) => ({ ...prev, scheme: schemeRes.data[0].name }));
        }

        const occRes = await axios.get(`${BASE_URL}/api/occasions`, config);
        setOccasionsList(occRes.data);
      } catch (err) {
        console.error("Error fetching dropdown data:", err);
      }
    };

    fetchData();
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

  const filteredDonations = donations.filter((d) => {
    let matchesCategory = true;
    if (filterCategory !== "All") {
      const cat = d.category || "Household";
      matchesCategory = cat === filterCategory;
    }

    let matchesDate = true;
    if (dateFilter.start) {
      matchesDate = new Date(d.createdAt) >= new Date(dateFilter.start);
    }
    if (matchesDate && dateFilter.end) {
      const endDate = new Date(dateFilter.end);
      endDate.setHours(23, 59, 59, 999);
      matchesDate = new Date(d.createdAt) <= endDate;
    }

    return matchesCategory && matchesDate;
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (
      ["chequeNo", "chequeDate", "bankName", "transactionId"].includes(name)
    ) {
      setFormData((prev) => ({
        ...prev,
        paymentDetails: { ...prev.paymentDetails, [name]: value },
      }));
    } else {
      const val = type === "checkbox" ? checked : value;
      setFormData({ ...formData, [name]: val });
    }
  };

  const handleSearchDonor = async () => {
    if (!formData.donorPhone) return alert("Enter phone number to search.");
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const { data } = await axios.get(
        `${BASE_URL}/api/donations/search?phone=${formData.donorPhone}`,
        config,
      );
      if (data.success) {
        setFormData((prev) => ({
          ...prev,
          donorName: data.donor.donorName,
          donorEmail: data.donor.donorEmail || "",
          donorPan: data.donor.donorPan || "",
          donorAadhaar: data.donor.donorAadhaar || "",
          address: data.donor.address || "",
        }));
        alert("Donor Found! Details Autofilled.");
      }
    } catch (err) {
      alert("New Donor. Please enter details.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);

    // --- PREPARE DATA ---
    const payload = { ...formData };

    // If Telugu, construct the string
    if (payload.calendarType === "Telugu") {
      payload.tithi = `${tithiParts.masam} ${tithiParts.paksha} ${tithiParts.tithi}`;
      payload.programDate = ""; // Clear English date if Telugu
    } else {
      payload.tithi = ""; // Clear Telugu if English
    }

    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userInfo.token}`,
        },
      };
      await axios.post(`${BASE_URL}/api/donations`, payload, config);
      setShowModal(false);
      fetchDonations();

      // Reset Form
      setFormData({
        donorName: "",
        donorPhone: "",
        donorEmail: "",
        donorPan: "",
        donorAadhaar: "",
        amount: "",
        scheme: "Nitya Annadhana",
        paymentMode: "Cash",
        branch: "Karunya Sindhu",
        category: "Household",
        address: "",
        occasion: "",
        inNameOf: "",
        calendarType: "Gregorian",
        programDate: "",
        tithi: "",
        manualReceiptNo: "",
        manualReceiptDate: "",
        paymentDetails: {
          chequeNo: "",
          chequeDate: "",
          bankName: "",
          transactionId: "",
        },
      });
    } catch (err) {
      alert(err.response?.data?.message || "Error adding donation");
    }
    setSubmitLoading(false);
  };

  const renderPaymentFields = () => {
    const mode = formData.paymentMode;
    if (mode === "Cheque" || mode === "DD") {
      return (
        <Row className="bg-light p-2 rounded mb-3 border">
          <Col md={4}>
            <Form.Control
              size="sm"
              placeholder={mode === "Cheque" ? "Cheque No" : "DD No"}
              name="chequeNo"
              value={formData.paymentDetails.chequeNo}
              onChange={handleChange}
            />
          </Col>
          <Col md={4}>
            <Form.Control
              size="sm"
              type="date"
              name="chequeDate"
              value={formData.paymentDetails.chequeDate}
              onChange={handleChange}
            />
          </Col>
          <Col md={4}>
            <Form.Control
              size="sm"
              placeholder="Bank Name"
              name="bankName"
              value={formData.paymentDetails.bankName}
              onChange={handleChange}
            />
          </Col>
        </Row>
      );
    }
    if (mode === "Online" || mode === "UPI" || mode === "Bank Transfer") {
      return (
        <div className="bg-light p-2 rounded mb-3 border">
          <Form.Control
            size="sm"
            placeholder="Transaction ID / Reference No"
            name="transactionId"
            value={formData.paymentDetails.transactionId}
            onChange={handleChange}
          />
        </div>
      );
    }
    return null;
  };

  // --- HANDLERS ---
  const handleEmailReceipt = async (id, currentStatus) => {
    const action = currentStatus === "Sent" ? "Resend" : "Send";
    if (
      !window.confirm(
        `Are you sure you want to ${action} the receipt via Email?`,
      )
    )
      return;
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      await axios.post(`${BASE_URL}/api/donations/${id}/email`, {}, config);
      alert(`Receipt ${action} Successfully!`);
      fetchDonations();
    } catch (err) {
      alert(err.response?.data?.message || "Error sending email.");
    }
  };

  const handleExport = () => {
    if (filteredDonations.length === 0) return alert("No data to export");
    const headers = [
      "Receipt ID",
      "Date",
      "Donor Name",
      "Phone",
      "Category",
      "Amount",
      "Scheme",
      "Mode",
      "Branch",
      "Manual Ref",
    ];
    const rows = filteredDonations.map((d) => [
      d._id.toString().slice(-6).toUpperCase(),
      new Date(d.createdAt).toLocaleDateString(),
      `"${d.donorName}"`,
      `"${d.donorPhone}"`,
      d.category,
      d.amount,
      d.scheme,
      d.paymentMode,
      d.branch,
      d.manualReceiptNo || "-",
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      headers.join(",") +
      "\n" +
      rows.map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `Donations_Export_${new Date().toISOString().split("T")[0]}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportSubmit = async (e) => {
    e.preventDefault();
    if (!importFile) return alert("Please select a CSV file first.");
    const fd = new FormData();
    fd.append("file", importFile);
    fd.append("category", importCategory);

    setSubmitLoading(true);
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
        config,
      );
      alert(data.message);
      setShowImportModal(false);
      setImportFile(null);
      fetchDonations();
    } catch (err) {
      alert(err.response?.data?.message || "Import Failed");
    }
    setSubmitLoading(false);
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
        },
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

  const openMediaModal = (d) => {
    setSelectedDonation(d);
    setShowMediaModal(true);
  };
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
        config,
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
        config,
      );
      setSelectedDonation({ ...selectedDonation, media: data.media });
      fetchDonations();
      alert("File Deleted");
    } catch (err) {
      alert("Error deleting file");
    }
  };

  return (
    <div>
      <Row className="mb-4 align-items-center">
        <Col lg={5}>
          <h2
            className="text-maroon m-0"
            style={{ fontFamily: "Playfair Display" }}
          >
            Donations
          </h2>
          <p className="text-muted m-0 small">
            Manage incoming funds & receipts
          </p>
        </Col>
        <Col lg={7}>
          <div className="d-flex flex-wrap gap-2 justify-content-lg-end">
            <input
              type="file"
              id="donateCsv"
              accept=".csv"
              style={{ display: "none" }}
              onChange={(e) => {
                setImportFile(e.target.files[0]);
                setShowImportModal(true);
              }}
            />
            <Button
              variant="warning"
              size="sm"
              onClick={() => setShowImportModal(true)}
            >
              <FaFileUpload /> Import
            </Button>
            <Button
              variant="info"
              size="sm"
              className="text-white"
              onClick={() => setShowTaxModal(true)}
            >
              <FaCertificate /> Tax Cert
            </Button>
            <Button variant="success" size="sm" onClick={handleExport}>
              <FaFilePdf /> Export
            </Button>
            <Button
              variant="primary"
              size="sm"
              style={{ backgroundColor: "#581818" }}
              onClick={() => setShowModal(true)}
            >
              <FaPlus /> Add New
            </Button>
          </div>
        </Col>
      </Row>

      {/* FILTERS */}
      <Row className="mb-3 g-2">
        <Col md={6}>
          <ButtonGroup>
            <Button
              variant={filterCategory === "Household" ? "dark" : "outline-dark"}
              size="sm"
              onClick={() => setFilterCategory("Household")}
            >
              Household
            </Button>
            <Button
              variant={
                filterCategory === "Organizational"
                  ? "warning"
                  : "outline-warning"
              }
              size="sm"
              onClick={() => setFilterCategory("Organizational")}
            >
              Organization
            </Button>
            <Button
              variant={
                filterCategory === "All" ? "secondary" : "outline-secondary"
              }
              size="sm"
              onClick={() => setFilterCategory("All")}
            >
              All
            </Button>
          </ButtonGroup>
        </Col>
        <Col md={6}>
          <div className="d-flex gap-2 justify-content-end">
            <Form.Control
              type="date"
              size="sm"
              value={dateFilter.start}
              onChange={(e) =>
                setDateFilter({ ...dateFilter, start: e.target.value })
              }
              className="w-auto"
            />
            <Form.Control
              type="date"
              size="sm"
              value={dateFilter.end}
              onChange={(e) =>
                setDateFilter({ ...dateFilter, end: e.target.value })
              }
              className="w-auto"
            />
          </div>
        </Col>
      </Row>

      {/* TABLE */}
      <Card className="shadow-sm border-0">
        <Card.Body className="p-0">
          <Table
            hover
            responsive
            className="align-middle mb-0 text-nowrap"
            style={{ fontSize: "0.9rem" }}
          >
            <thead className="bg-light">
              <tr>
                <th className="ps-3" style={{ width: "12%" }}>
                  Date / ID
                </th>
                <th style={{ width: "20%" }}>Donor</th>
                <th style={{ width: "10%" }}>Category</th>
                <th style={{ width: "10%" }}>Amount</th>
                <th style={{ width: "15%" }}>Mode</th>
                <th style={{ width: "15%" }}>Branch</th>
                <th style={{ width: "18%" }} className="text-center">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredDonations.map((d) => (
                <tr key={d._id}>
                  <td className="ps-3">
                    <div className="fw-bold">
                      {new Date(d.createdAt).toLocaleDateString()}
                    </div>
                    <small className="text-muted">
                      {d._id.slice(-6).toUpperCase()}
                    </small>
                    {d.manualReceiptNo && (
                      <div className="text-danger small">
                        Ref: {d.manualReceiptNo}
                      </div>
                    )}
                  </td>
                  <td>
                    <div
                      className="fw-bold text-maroon text-truncate"
                      style={{ maxWidth: "180px" }}
                      title={d.donorName}
                    >
                      {d.donorName}
                    </div>
                    <small className="text-muted">{d.donorPhone}</small>
                  </td>
                  <td>
                    <Badge bg="light" text="dark" className="border">
                      {d.category}
                    </Badge>
                  </td>
                  <td className="fw-bold text-success">
                    ₹{d.amount.toLocaleString()}
                  </td>
                  <td>
                    {d.paymentMode}
                    {d.paymentDetails?.chequeNo && (
                      <div className="small text-muted">
                        #{d.paymentDetails.chequeNo}
                      </div>
                    )}
                  </td>
                  <td>
                    <small
                      className="text-truncate d-block"
                      style={{ maxWidth: "150px" }}
                      title={d.branch}
                    >
                      {d.branch}
                    </small>
                  </td>
                  <td>
                    <div className="d-flex gap-1 justify-content-center">
                      <Button
                        size="sm"
                        variant="outline-danger"
                        onClick={async () => {
                          try {
                            const userInfo = JSON.parse(
                              localStorage.getItem("userInfo"),
                            );
                            const response = await axios.get(
                              `${BASE_URL}/api/donations/${d._id}/receipt`,
                              {
                                headers: {
                                  Authorization: `Bearer ${userInfo.token}`,
                                },
                                responseType: "blob",
                              },
                            );
                            const url = window.URL.createObjectURL(
                              new Blob([response.data]),
                            );
                            const link = document.createElement("a");
                            link.href = url;
                            link.setAttribute(
                              "download",
                              `Receipt_${d.donorName}.pdf`,
                            );
                            document.body.appendChild(link);
                            link.click();
                          } catch (e) {
                            alert("Error");
                          }
                        }}
                        title="Download PDF"
                      >
                        <FaFilePdf />
                      </Button>

                      <Button
                        size="sm"
                        variant={
                          d.receiptStatus === "Sent"
                            ? "success"
                            : "outline-primary"
                        }
                        onClick={() =>
                          handleEmailReceipt(d._id, d.receiptStatus)
                        }
                        title={
                          d.receiptStatus === "Sent"
                            ? "Resend Email"
                            : "Send Email"
                        }
                      >
                        <FaEnvelope className="me-1" />{" "}
                        {d.receiptStatus === "Sent" ? "Resend" : "Send"}
                      </Button>

                      <Button
                        size="sm"
                        variant={
                          d.media?.length > 0 ? "warning" : "outline-secondary"
                        }
                        onClick={() => openMediaModal(d)}
                        title="View Attachments"
                      >
                        <FaImages />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* --- ADD DONATION MODAL --- */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton className="bg-light">
          <Modal.Title>New Donation Entry</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <div className="d-flex justify-content-center mb-3">
              <ButtonGroup>
                <Button
                  variant={
                    formData.category === "Household" ? "dark" : "outline-dark"
                  }
                  onClick={() =>
                    setFormData({ ...formData, category: "Household" })
                  }
                  size="sm"
                >
                  Household
                </Button>
                <Button
                  variant={
                    formData.category === "Organizational"
                      ? "warning"
                      : "outline-warning"
                  }
                  onClick={() =>
                    setFormData({ ...formData, category: "Organizational" })
                  }
                  size="sm"
                >
                  Organization
                </Button>
              </ButtonGroup>
            </div>

            <Row className="g-2 mb-2">
              <Col md={6}>
                <Form.Label className="small fw-bold">
                  Phone Number *
                </Form.Label>
                <div className="input-group input-group-sm">
                  <Form.Control
                    name="donorPhone"
                    value={formData.donorPhone}
                    onChange={handleChange}
                    required
                    placeholder="Search by Phone"
                  />
                  <Button variant="secondary" onClick={handleSearchDonor}>
                    <FaSearch />
                  </Button>
                </div>
              </Col>
              <Col md={6}>
                <Form.Label className="small fw-bold">Donor Name *</Form.Label>
                <Form.Control
                  size="sm"
                  name="donorName"
                  value={formData.donorName}
                  onChange={handleChange}
                  required
                />
              </Col>
            </Row>

            <Row className="g-2 mb-2">
              <Col md={4}>
                <Form.Control
                  size="sm"
                  name="donorEmail"
                  placeholder="Email"
                  value={formData.donorEmail}
                  onChange={handleChange}
                />
              </Col>
              <Col md={4}>
                <Form.Control
                  size="sm"
                  name="donorPan"
                  placeholder="PAN"
                  value={formData.donorPan}
                  onChange={handleChange}
                />
              </Col>
              <Col md={4}>
                <Form.Control
                  size="sm"
                  name="donorAadhaar"
                  placeholder="Aadhaar"
                  value={formData.donorAadhaar}
                  onChange={handleChange}
                />
              </Col>
            </Row>

            <Form.Control
              size="sm"
              as="textarea"
              rows={1}
              name="address"
              placeholder="Address"
              value={formData.address}
              onChange={handleChange}
              className="mb-3"
            />
            <hr />

            <Row className="g-2 mb-2">
              <Col md={4}>
                <Form.Label className="small fw-bold">Amount (₹) *</Form.Label>
                <Form.Control
                  size="sm"
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  required
                  className="fw-bold"
                />
              </Col>
              <Col md={4}>
                <Form.Label className="small fw-bold">Branch *</Form.Label>
                <Form.Select
                  size="sm"
                  name="branch"
                  value={formData.branch}
                  onChange={handleChange}
                >
                  <option value="Karunya Sindhu">Karunya Sindhu</option>
                  <option value="Karunya Bharathi">Karunya Bharathi</option>
                  <option value="Karunya Jyothi">Karunya Jyothi</option>
                  <option value="Karuna Sree Seva Samithi">
                    Karuna Sree Seva Samithi
                  </option>
                  <option value="Headquarters">Headquarters</option>
                </Form.Select>
              </Col>
              <Col md={4}>
                <Form.Label className="small fw-bold">Scheme</Form.Label>
                <Form.Select
                  size="sm"
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
            </Row>

            <Form.Group className="mb-2">
              <Form.Label className="small fw-bold">Payment Mode</Form.Label>
              <Form.Select
                size="sm"
                name="paymentMode"
                value={formData.paymentMode}
                onChange={handleChange}
              >
                <option>Cash</option>
                <option>Online</option>
                <option>UPI</option>
                <option>Cheque</option>
                <option>DD</option>
                <option>Foreign Currency</option>
              </Form.Select>
            </Form.Group>
            {renderPaymentFields()}

            <div className="bg-light p-2 rounded mb-3 border">
              <Row className="g-2 align-items-center">
                <Col md={6}>
                  <Form.Control
                    size="sm"
                    placeholder="Manual Receipt No (Optional)"
                    name="manualReceiptNo"
                    value={formData.manualReceiptNo}
                    onChange={handleChange}
                  />
                </Col>
                <Col md={6}>
                  <Form.Control
                    size="sm"
                    type="date"
                    name="manualReceiptDate"
                    value={formData.manualReceiptDate}
                    onChange={handleChange}
                  />
                </Col>
              </Row>
            </div>

            <Row className="g-2 mb-2">
              <Col md={4}>
                <Form.Select
                  size="sm"
                  name="occasion"
                  value={formData.occasion}
                  onChange={handleChange}
                >
                  <option value="">-- Occasion --</option>
                  {occasionsList.map((o) => (
                    <option key={o._id} value={o.name}>
                      {o.name}
                    </option>
                  ))}
                  <option value="Other">Other</option>
                </Form.Select>
              </Col>
              <Col md={4}>
                <Form.Select
                  size="sm"
                  name="calendarType"
                  value={formData.calendarType}
                  onChange={handleChange}
                >
                  <option value="Gregorian">English Date</option>
                  <option value="Telugu">Telugu Tithi</option>
                </Form.Select>
              </Col>
              <Col md={4}>
                {formData.calendarType === "Gregorian" ? (
                  <Form.Control
                    size="sm"
                    type="date"
                    name="programDate"
                    value={formData.programDate}
                    onChange={handleChange}
                  />
                ) : (
                  // --- CHANGED: TELUGU DROPDOWNS ---
                  <div className="d-flex gap-1">
                    <Form.Select
                      size="sm"
                      onChange={(e) =>
                        setTithiParts({ ...tithiParts, masam: e.target.value })
                      }
                      title="Masam"
                    >
                      {TELUGU_MASAMS.map((m) => (
                        <option key={m}>{m}</option>
                      ))}
                    </Form.Select>
                    <Form.Select
                      size="sm"
                      onChange={(e) =>
                        setTithiParts({ ...tithiParts, paksha: e.target.value })
                      }
                      title="Paksha"
                    >
                      {PAKSHAS.map((p) => (
                        <option key={p}>{p}</option>
                      ))}
                    </Form.Select>
                    <Form.Select
                      size="sm"
                      onChange={(e) =>
                        setTithiParts({ ...tithiParts, tithi: e.target.value })
                      }
                      title="Tithi"
                    >
                      {TITHIS.map((t) => (
                        <option key={t}>{t}</option>
                      ))}
                    </Form.Select>
                  </div>
                )}
              </Col>
              <Col md={12}>
                <Form.Control
                  size="sm"
                  placeholder="In Name Of (Gotram/Name)"
                  name="inNameOf"
                  value={formData.inNameOf}
                  onChange={handleChange}
                />
              </Col>
            </Row>

            <Button
              type="submit"
              variant="primary"
              className="w-100 mt-2"
              style={{ backgroundColor: "#581818" }}
            >
              Save Donation
            </Button>
          </Form>
        </Modal.Body>
      </Modal>

      {/* IMPORT MODAL */}
      <Modal show={showImportModal} onHide={() => setShowImportModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Import Donations</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleImportSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Category</Form.Label>
              <Form.Select
                value={importCategory}
                onChange={(e) => setImportCategory(e.target.value)}
              >
                <option value="Household">Household</option>
                <option value="Organizational">Organizational</option>
              </Form.Select>
            </Form.Group>
            <Form.Control
              type="file"
              accept=".csv"
              onChange={(e) => setImportFile(e.target.files[0])}
              required
            />
            <Button
              type="submit"
              variant="warning"
              className="mt-3 w-100"
              disabled={submitLoading}
            >
              {submitLoading ? "Importing..." : "Upload & Import"}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>

      {/* TAX CERT MODAL */}
      <Modal show={showTaxModal} onHide={() => setShowTaxModal(false)}>
        <Modal.Body>
          <Form onSubmit={handleDownloadTaxCert}>
            <Form.Control
              placeholder="Donor Phone"
              value={taxPhone}
              onChange={(e) => setTaxPhone(e.target.value)}
              className="mb-2"
              required
            />
            <Form.Select
              value={taxYear}
              onChange={(e) => setTaxYear(e.target.value)}
              className="mb-2"
            >
              <option value="2024">2024-25</option>
              <option value="2025">2025-26</option>
            </Form.Select>
            <Button type="submit" className="w-100">
              Download Cert
            </Button>
          </Form>
        </Modal.Body>
      </Modal>

      {/* MEDIA MODAL */}
      <Modal show={showMediaModal} onHide={() => setShowMediaModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Attachments</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleUpload} className="d-flex gap-2 mb-3">
            <Form.Control type="file" multiple onChange={handleFileChange} />
            <Button type="submit" disabled={uploading}>
              {uploading ? "..." : "Upload"}
            </Button>
          </Form>
          <Row>
            {selectedDonation?.media?.map((path, i) => (
              <Col xs={6} key={i} className="mb-2 position-relative">
                <img
                  src={`${BASE_URL}${path}`}
                  style={{ width: "100%", height: "100px", objectFit: "cover" }}
                  alt="doc"
                />
                <Button
                  size="sm"
                  variant="danger"
                  className="position-absolute top-0 end-0 py-0 px-1"
                  onClick={() => handleDeleteMedia(path)}
                >
                  x
                </Button>
              </Col>
            ))}
          </Row>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default DonationList;
