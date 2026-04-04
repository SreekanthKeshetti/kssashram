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
  Modal,
  Form,
  ButtonGroup,
  Alert,
} from "react-bootstrap";
import {
  FaPlus,
  FaFilePdf,
  FaImages,
  FaSearch,
  FaCertificate,
  FaFileUpload,
  FaEnvelope,
  FaBan,
  FaCheckCircle,
  FaFileCsv,
  FaUsers,
  FaBuilding,
  FaClock,
  FaEdit,
} from "react-icons/fa";

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
  const [schemes, setSchemes] = useState([]);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [occasionsList, setOccasionsList] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  const [filterCategory, setFilterCategory] = useState("Household");
  const [dateFilter, setDateFilter] = useState({ start: "", end: "" });

  const [showModal, setShowModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showTaxModal, setShowTaxModal] = useState(false);
  const [showMediaModal, setShowMediaModal] = useState(false);

  const [receiptType, setReceiptType] = useState("Donation");
  const [cancelData, setCancelData] = useState({ id: "", reason: "" });
  const [importFile, setImportFile] = useState(null);
  const [importCategory, setImportCategory] = useState("Household");
  const [submitLoading, setSubmitLoading] = useState(false);
  const [taxYear, setTaxYear] = useState(new Date().getFullYear());
  const [taxPhone, setTaxPhone] = useState("");
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  const [tithiParts, setTithiParts] = useState({
    masam: TELUGU_MASAMS[0],
    paksha: PAKSHAS[0],
    tithi: TITHIS[0],
  });

  const [formData, setFormData] = useState({
    donationDate: new Date().toISOString().split("T")[0],
    donorName: "",
    donorPhone: "",
    donorLandline: "",
    donorEmail: "",
    donorPan: "",
    donorAadhaar: "",
    amount: "",
    scheme: "Nitya Annadhana",
    paymentMode: "Cash",
    branch: "KarunaSri Seva Samithi",
    category: "Household",
    address: "",
    depositBank: "",
    occasion: "",
    inNameOf: "",
    calendarType: "Gregorian",
    programDate: "",
    tithi: "",
    isRecurring: false,
    comments: "",
    manualReceiptNo: "",
    paymentDetails: {
      chequeNo: "",
      chequeDate: "",
      bankName: "",
      transactionId: "",
    },
    interestPeriod: { startDate: "", endDate: "" },
  });

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("userInfo"));
    setCurrentUser(user);

    if (user && user.role === "kba_manager") {
      setFormData((prev) => ({ ...prev, branch: "Karunya Bharathi" }));
    } else if (user && user.role === "ksa_manager") {
      setFormData((prev) => ({ ...prev, branch: "Karunya Sindhu" }));
    }

    const fetchData = async () => {
      if (!user) return;
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const schemeRes = await axios.get(`${BASE_URL}/api/schemes`, config);
        setSchemes(schemeRes.data);
        if (schemeRes.data.length > 0) {
          setFormData((prev) => ({ ...prev, scheme: schemeRes.data[0].name }));
        }

        const occRes = await axios.get(`${BASE_URL}/api/occasions`, config);
        setOccasionsList(occRes.data);

        const accRes = await axios.get(`${BASE_URL}/api/accounts`, config);
        const banks = accRes.data.filter(
          (acc) =>
            acc.name.toLowerCase().includes("bank") ||
            acc.name.toLowerCase().includes("cash"),
        );
        setBankAccounts(banks);
        if (banks.length > 0) {
          setFormData((prev) => ({ ...prev, depositBank: banks[0]._id }));
        }
      } catch (err) {
        console.error(err);
      }
    };

    if (user) fetchData();
    fetchDonations();
  }, []);

  const fetchDonations = useCallback(async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      if (!userInfo) return;
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const { data } = await axios.get(`${BASE_URL}/api/donations`, config);
      setDonations(data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  }, []);

  const handleOpenAddModal = () => {
    setIsEditing(false);
    setEditId(null);
    setReceiptType("Donation");

    setFormData({
      donationDate: new Date().toISOString().split("T")[0],
      donorName: "",
      donorPhone: "",
      donorLandline: "",
      donorEmail: "",
      donorPan: "",
      donorAadhaar: "",
      amount: "",
      scheme: "Nitya Annadhana",
      paymentMode: "Cash",
      branch: "KarunaSri Seva Samithi",
      category: "Household",
      address: "",
      depositBank: bankAccounts.length > 0 ? bankAccounts[0]._id : "",
      occasion: "",
      inNameOf: "",
      calendarType: "Gregorian",
      programDate: "",
      tithi: "",
      isRecurring: false,
      comments: "",
      manualReceiptNo: "",
      paymentDetails: {
        chequeNo: "",
        chequeDate: "",
        bankName: "",
        transactionId: "",
      },
      interestPeriod: { startDate: "", endDate: "" },
    });
    setShowModal(true);
  };

  const handleEditClick = (d) => {
    setIsEditing(true);
    setEditId(d._id);

    if (d.scheme === "Interest Received" || d.donorName === "Bank Interest") {
      setReceiptType("General");
    } else {
      setReceiptType("Donation");
    }

    const formatDate = (date) =>
      date ? new Date(date).toISOString().split("T")[0] : "";

    setFormData({
      donationDate: formatDate(d.createdAt),
      donorName: d.donorName,
      donorPhone: d.donorPhone,
      donorLandline: d.donorLandline || "",
      donorEmail: d.donorEmail,
      donorPan: d.donorPan,
      donorAadhaar: d.donorAadhaar,
      amount: d.amount,
      scheme: d.scheme,
      paymentMode: d.paymentMode,
      branch: d.branch,
      category: d.category || "Household",
      address: d.address,
      depositBank: d.depositBank?._id || d.depositBank || "",
      occasion: d.occasion,
      inNameOf: d.inNameOf,
      calendarType: d.calendarType || "Gregorian",
      programDate: formatDate(d.programDate),
      tithi: d.tithi,
      isRecurring: d.isRecurring || false,
      comments: d.comments || "",
      manualReceiptNo: d.manualReceiptNo || "",
      paymentDetails: {
        chequeNo: d.paymentDetails?.chequeNo || "",
        chequeDate: formatDate(d.paymentDetails?.chequeDate),
        bankName: d.paymentDetails?.bankName || "",
        transactionId: d.paymentDetails?.transactionId || "",
      },
      interestPeriod: {
        startDate: formatDate(d.interestPeriod?.startDate),
        endDate: formatDate(d.interestPeriod?.endDate),
      },
    });
    setShowModal(true);
  };

  const handleCancelClick = (id) => {
    setCancelData({ id, reason: "" });
    setShowCancelModal(true);
  };

  const submitCancellation = async () => {
    if (!cancelData.reason) return alert("Please provide a reason.");
    if (!window.confirm("Are you sure? This cannot be undone.")) return;

    try {
      const config = {
        headers: { Authorization: `Bearer ${currentUser.token}` },
      };
      await axios.put(
        `${BASE_URL}/api/donations/${cancelData.id}/cancel`,
        { reason: cancelData.reason },
        config,
      );
      alert("Receipt Cancelled Successfully.");
      setShowCancelModal(false);
      fetchDonations();
    } catch (error) {
      alert(error.response?.data?.message || "Error cancelling receipt");
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (
      ["chequeNo", "chequeDate", "bankName", "transactionId"].includes(name)
    ) {
      setFormData((prev) => ({
        ...prev,
        paymentDetails: { ...prev.paymentDetails, [name]: value },
      }));
    } else if (name === "intStartDate" || name === "intEndDate") {
      setFormData((prev) => ({
        ...prev,
        interestPeriod: {
          ...prev.interestPeriod,
          [name === "intStartDate" ? "startDate" : "endDate"]: value,
        },
      }));
    } else {
      const val = type === "checkbox" ? checked : value;
      setFormData({ ...formData, [name]: val });
    }
  };

  const handleSearchDonor = async () => {
    if (!formData.donorPhone) return alert("Enter phone number to search.");
    try {
      const config = {
        headers: { Authorization: `Bearer ${currentUser.token}` },
      };
      const { data } = await axios.get(
        `${BASE_URL}/api/donations/search?phone=${formData.donorPhone}`,
        config,
      );
      if (data.success) {
        setFormData((prev) => ({
          ...prev,
          donorName: data.donor.donorName,
          donorLandline: data.donor.donorLandline || "",
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

    let submissionData = { ...formData };

    if (receiptType === "General") {
      submissionData.donorName = formData.donorName || "Bank Interest";
      submissionData.donorPhone = "0000000000";
      submissionData.category = "Organizational";
      submissionData.scheme = "Interest Received";
      submissionData.paymentMode = "Bank Transfer";
    }

    const payload = { ...submissionData };

    if (payload.calendarType === "Telugu") {
      payload.tithi = `${tithiParts.masam} ${tithiParts.paksha} ${tithiParts.tithi}`;
      payload.programDate = "";
    } else {
      payload.tithi = "";
    }

    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${currentUser.token}`,
        },
      };

      if (isEditing) {
        await axios.put(`${BASE_URL}/api/donations/${editId}`, payload, config);
        alert("Receipt Updated Successfully!");
      } else {
        await axios.post(`${BASE_URL}/api/donations`, payload, config);
        alert("Receipt Created Successfully!");
      }

      setShowModal(false);
      fetchDonations();
    } catch (err) {
      alert(err.response?.data?.message || "Error saving record");
    }
    setSubmitLoading(false);
  };

  const handleExport = () => {
    if (filteredDonations.length === 0) return alert("No data to export");

    const headers = [
      "Receipt ID",
      "Date",
      "Donor Name",
      "Mobile",
      "Landline",
      "Email",
      "PAN",
      "Aadhaar",
      "Address",
      "Category",
      "Amount",
      "Scheme",
      "Occasion",
      "In Name Of",
      "Mode",
      "Cheque/DD No",
      "Cheque Date",
      "Transaction Ref",
      "Donor Bank",
      "Deposited To (Org Account)",
      "Branch",
      "Manual Ref",
      "Comments",
    ];

    const rows = filteredDonations.map((d) => {
      const pd = d.paymentDetails || {};
      const formatDate = (date) =>
        date ? new Date(date).toLocaleDateString() : "-";

      return [
        d.receiptNo || d._id.toString().slice(-6).toUpperCase(),
        formatDate(d.createdAt),
        `"${d.donorName}"`,
        `"${d.donorPhone}"`,
        `"${d.donorLandline || "-"}"`,
        `"${d.donorEmail || "-"}"`,
        d.donorPan || "-",
        d.donorAadhaar || "-",
        `"${d.address ? d.address.replace(/\n/g, " ") : "-"}"`,
        d.category,
        d.amount,
        d.scheme,
        `"${d.occasion || "-"}"`,
        `"${d.inNameOf || "-"}"`,
        d.paymentMode,
        pd.chequeNo || pd.ddNo || "-",
        formatDate(pd.chequeDate),
        pd.transactionId || "-",
        pd.bankName || "-",
        d.depositBank?.name || "-",
        d.branch,
        d.manualReceiptNo || "-",
        `"${d.comments ? d.comments.replace(/\n/g, " ") : "-"}"`,
      ];
    });

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

  const handleEmailReceipt = async (id) => {
    if (!window.confirm("Email Receipt?")) return;
    try {
      const config = {
        headers: { Authorization: `Bearer ${currentUser.token}` },
      };
      await axios.post(`${BASE_URL}/api/donations/${id}/email`, {}, config);
      alert("Sent!");
      fetchDonations();
    } catch (e) {
      alert("Error sending email");
    }
  };

  const openMediaModal = (d) => {
    setSelectedDonation(d);
    setShowMediaModal(true);
  };
  const handleFileChange = (e) => setFiles(e.target.files);
  const handleUpload = async (e) => {
    e.preventDefault();
    if (files.length === 0) return alert("Select files");
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
    } catch (e) {
      alert("Upload failed");
    }
    setUploading(false);
  };
  const handleDeleteMedia = async (filePath) => {
    if (!window.confirm("Delete file?")) return;
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
      alert("Deleted");
    } catch (err) {
      alert("Error deleting file");
    }
  };

  const renderPaymentFields = () => {
    const mode = formData.paymentMode;
    if (mode === "Cheque" || mode === "DD") {
      return (
        <Row className="bg-light p-2 rounded mb-3 border">
          <Col md={4}>
            <Form.Control
              size="sm"
              placeholder="No"
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
    if (["Online", "UPI", "Bank Transfer"].includes(mode)) {
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

  const filteredDonations = donations.filter((d) => {
    let matchesCategory = true;
    if (filterCategory !== "All") {
      const cat = d.category || "Household";
      matchesCategory = cat === filterCategory;
    }
    let matchesDate = true;
    if (dateFilter.start)
      matchesDate = new Date(d.createdAt) >= new Date(dateFilter.start);
    if (matchesDate && dateFilter.end) {
      const endDate = new Date(dateFilter.end);
      endDate.setHours(23, 59, 59, 999);
      matchesDate = new Date(d.createdAt) <= endDate;
    }
    return matchesCategory && matchesDate;
  });

  return (
    <div>
      <Row className="mb-4 align-items-center">
        <Col lg={5}>
          <h2
            className="text-maroon m-0"
            style={{ fontFamily: "Playfair Display" }}
          >
            Receipts / Donations
          </h2>
          <p className="text-muted m-0 small">Manage all incoming funds</p>
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
              <FaFileCsv /> Export
            </Button>
            <Button
              variant="primary"
              size="sm"
              style={{ backgroundColor: "#581818" }}
              onClick={handleOpenAddModal}
            >
              <FaPlus /> Add Receipt
            </Button>
          </div>
        </Col>
      </Row>

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
                <th style={{ width: "20%" }}>Scheme / Head</th>
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
              {filteredDonations.map((d) => {
                const isCancelled = d.status === "Cancelled";
                return (
                  <tr
                    key={d._id}
                    style={
                      isCancelled
                        ? { opacity: 0.6, backgroundColor: "#f8f9fa" }
                        : {}
                    }
                  >
                    <td className="ps-3">
                      <div
                        className={
                          isCancelled
                            ? "text-decoration-line-through"
                            : "fw-bold"
                        }
                      >
                        {new Date(d.createdAt).toLocaleDateString()}
                      </div>
                      <small className="text-muted">
                        {d.receiptNo || d._id.slice(-6).toUpperCase()}
                      </small>

                      {d.manualReceiptNo && (
                        <div className="text-danger small mt-1">
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
                      <small className="text-muted">
                        {d.donorPhone !== "0000000000" ? d.donorPhone : ""}
                      </small>
                      {d.donorLandline && (
                        <div className="small text-muted">
                          Tel: {d.donorLandline}
                        </div>
                      )}
                    </td>
                    <td>
                      <div className="fw-bold text-dark">{d.scheme}</div>
                      {d.accountHead ? (
                        <small
                          className="text-muted"
                          style={{ fontSize: "0.75rem" }}
                        >
                          <strong className="text-success">
                            {d.accountHead.code}
                          </strong>{" "}
                          - {d.accountHead.name}
                        </small>
                      ) : (
                        <Badge
                          bg="warning"
                          text="dark"
                          style={{ fontSize: "0.6rem" }}
                        >
                          No Account Mapped
                        </Badge>
                      )}
                    </td>
                    <td>
                      <Badge bg="light" text="dark" className="border">
                        {d.category}
                      </Badge>
                    </td>
                    <td
                      className={`fw-bold ${isCancelled ? "text-decoration-line-through text-muted" : "text-success"}`}
                    >
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
                      {isCancelled ? (
                        <Badge bg="danger">Cancelled</Badge>
                      ) : (
                        <Badge bg="success">Active</Badge>
                      )}
                    </td>
                    <td className="text-center">
                      {!isCancelled && (
                        <div className="d-flex justify-content-center gap-1">
                          <Button
                            size="sm"
                            variant="outline-primary"
                            title="Edit"
                            onClick={() => handleEditClick(d)}
                          >
                            <FaEdit />
                          </Button>
                          {(currentUser?.role === "admin" ||
                            currentUser?.role === "president" ||
                            currentUser?.role === "secretary") && (
                            <Button
                              size="sm"
                              variant="outline-danger"
                              title="Void"
                              onClick={() => handleCancelClick(d._id)}
                            >
                              <FaBan />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline-dark"
                            title="PDF"
                            onClick={async () => {
                              try {
                                const response = await axios.get(
                                  `${BASE_URL}/api/donations/${d._id}/receipt`,
                                  {
                                    headers: {
                                      Authorization: `Bearer ${currentUser.token}`,
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
                            onClick={() => handleEmailReceipt(d._id)}
                            title="Email"
                          >
                            <FaEnvelope />
                          </Button>
                          <Button
                            size="sm"
                            variant={
                              d.media?.length > 0
                                ? "warning"
                                : "outline-secondary"
                            }
                            onClick={() => {
                              setSelectedDonation(d);
                              setShowMediaModal(true);
                            }}
                            title="Docs"
                          >
                            <FaImages />
                          </Button>
                        </div>
                      )}
                      {isCancelled && (
                        <small className="text-danger d-block fst-italic">
                          {d.cancellationReason}
                        </small>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* --- ADD/EDIT RECEIPT MODAL --- */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton className="bg-light">
          <Modal.Title>
            {isEditing ? "Edit" : "New"} Receipt / Transaction
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <div className="d-flex justify-content-center mb-4">
              <ButtonGroup className="w-100 shadow-sm">
                <Button
                  variant={receiptType === "Donation" ? "dark" : "outline-dark"}
                  onClick={() => setReceiptType("Donation")}
                >
                  <FaUsers className="me-2" /> Donor Receipt
                </Button>
                <Button
                  variant={
                    receiptType === "General" ? "warning" : "outline-warning"
                  }
                  onClick={() => setReceiptType("General")}
                >
                  <FaBuilding className="me-2" /> Bank Interest / Misc
                </Button>
              </ButtonGroup>
            </div>

            {receiptType === "Donation" && (
              <>
                <div className="d-flex justify-content-center mb-3">
                  <ButtonGroup>
                    <Button
                      variant={
                        formData.category === "Household"
                          ? "dark"
                          : "outline-dark"
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

                {/* --- ROW 1: Date, Mobile & Landline --- */}
                <Row className="g-2 mb-2">
                  <Col md={4}>
                    <Form.Label className="small fw-bold text-maroon">
                      Donation Date *
                    </Form.Label>
                    <Form.Control
                      type="date"
                      size="sm"
                      name="donationDate"
                      value={formData.donationDate}
                      onChange={handleChange}
                      required
                      className="fw-bold"
                    />
                  </Col>
                  <Col md={4}>
                    <Form.Label className="small fw-bold">
                      Mobile Number *
                    </Form.Label>
                    <div className="input-group input-group-sm">
                      <Form.Control
                        name="donorPhone"
                        value={formData.donorPhone}
                        onChange={handleChange}
                        required
                        placeholder="Search"
                      />
                      <Button variant="secondary" onClick={handleSearchDonor}>
                        <FaSearch />
                      </Button>
                    </div>
                  </Col>
                  <Col md={4}>
                    <Form.Label className="small fw-bold">
                      Landline Number
                    </Form.Label>
                    <Form.Control
                      size="sm"
                      name="donorLandline"
                      value={formData.donorLandline}
                      onChange={handleChange}
                      placeholder="e.g. 040-24073204"
                    />
                  </Col>
                </Row>

                {/* --- ROW 2: Name, Email, PAN & Aadhaar --- */}
                <Row className="g-2 mb-2">
                  <Col md={3}>
                    <Form.Label className="small fw-bold">
                      Donor Name *
                    </Form.Label>
                    <Form.Control
                      size="sm"
                      name="donorName"
                      value={formData.donorName}
                      onChange={handleChange}
                      required
                    />
                  </Col>
                  <Col md={3}>
                    <Form.Label className="small fw-bold">Email</Form.Label>
                    <Form.Control
                      size="sm"
                      name="donorEmail"
                      placeholder="Email"
                      value={formData.donorEmail}
                      onChange={handleChange}
                    />
                  </Col>
                  <Col md={3}>
                    <Form.Label className="small fw-bold">PAN</Form.Label>
                    <Form.Control
                      size="sm"
                      name="donorPan"
                      placeholder="PAN"
                      value={formData.donorPan}
                      onChange={handleChange}
                    />
                  </Col>
                  <Col md={3}>
                    <Form.Label className="small fw-bold">Aadhaar</Form.Label>
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
                  className="mb-3 mt-2"
                />
                <hr />
                <Row className="g-2 mb-2">
                  <Col md={4}>
                    <Form.Label className="small fw-bold">
                      Amount (₹) *
                    </Form.Label>
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
                    <Form.Label className="small fw-bold">Branch</Form.Label>
                    <Form.Select
                      size="sm"
                      name="branch"
                      value={formData.branch}
                      onChange={handleChange}
                      disabled={
                        currentUser?.role !== "admin" &&
                        currentUser?.role !== "president"
                      }
                    >
                      <option value="KarunaSri Seva Samithi">
                        KarunaSri Seva Samithi
                      </option>
                      <option value="Karunya Sindhu">Karunya Sindhu</option>
                      <option value="Karunya Bharathi">Karunya Bharathi</option>
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
                <Row className="g-2 mb-2">
                  <Col md={6}>
                    <Form.Label className="small fw-bold">
                      Payment Mode
                    </Form.Label>
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
                      <option>Bank Transfer</option>
                    </Form.Select>
                  </Col>
                  <Col md={6}>
                    <Form.Label className="small fw-bold">
                      Deposited To *
                    </Form.Label>
                    <Form.Select
                      size="sm"
                      name="depositBank"
                      value={formData.depositBank}
                      onChange={handleChange}
                      required
                    >
                      <option value="">-- Select Bank --</option>
                      {bankAccounts.map((b) => (
                        <option key={b._id} value={b._id}>
                          {b.name}
                        </option>
                      ))}
                    </Form.Select>
                  </Col>
                </Row>
                <Form.Check
                  type="switch"
                  label="Is Recurring?"
                  name="isRecurring"
                  checked={formData.isRecurring}
                  onChange={handleChange}
                  className="mb-2 text-primary"
                />
                {renderPaymentFields()}

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
                      <div className="d-flex gap-1">
                        <Form.Select
                          size="sm"
                          onChange={(e) =>
                            setTithiParts({
                              ...tithiParts,
                              masam: e.target.value,
                            })
                          }
                        >
                          {TELUGU_MASAMS.map((m) => (
                            <option key={m}>{m}</option>
                          ))}
                        </Form.Select>
                        <Form.Select
                          size="sm"
                          onChange={(e) =>
                            setTithiParts({
                              ...tithiParts,
                              paksha: e.target.value,
                            })
                          }
                        >
                          {PAKSHAS.map((p) => (
                            <option key={p}>{p}</option>
                          ))}
                        </Form.Select>
                        <Form.Select
                          size="sm"
                          onChange={(e) =>
                            setTithiParts({
                              ...tithiParts,
                              tithi: e.target.value,
                            })
                          }
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

                {/* --- RESTORED: MANUAL RECEIPT NO WITH COMMENTS --- */}
                <Row className="mt-3 g-2">
                  <Col md={4}>
                    <Form.Control
                      size="sm"
                      placeholder="Legacy / Manual Receipt No"
                      name="manualReceiptNo"
                      value={formData.manualReceiptNo}
                      onChange={handleChange}
                    />
                  </Col>
                  <Col md={8}>
                    <Form.Control
                      size="sm"
                      placeholder="Additional Comments / Notes (Optional)"
                      name="comments"
                      value={formData.comments}
                      onChange={handleChange}
                    />
                  </Col>
                </Row>
              </>
            )}

            {receiptType === "General" && (
              <div className="bg-light p-3 rounded border mb-3">
                <h6 className="text-maroon fw-bold mb-3">
                  Record Bank Interest / Income
                </h6>

                <Row className="mb-3">
                  <Col md={12}>
                    <Form.Label className="small fw-bold text-maroon">
                      Transaction Date *
                    </Form.Label>
                    <Form.Control
                      type="date"
                      size="sm"
                      name="donationDate"
                      value={formData.donationDate}
                      onChange={handleChange}
                      required
                      className="fw-bold"
                    />
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label className="small fw-bold">
                    Description / Source *
                  </Form.Label>
                  <Form.Control
                    name="donorName"
                    value={formData.donorName}
                    onChange={handleChange}
                    placeholder="e.g. SBI Savings Interest - Q1"
                    required
                  />
                </Form.Group>
                <Row className="g-2 mb-3">
                  <Col md={6}>
                    <Form.Label className="small fw-bold">
                      Amount Credited (₹) *
                    </Form.Label>
                    <Form.Control
                      type="number"
                      name="amount"
                      value={formData.amount}
                      onChange={handleChange}
                      required
                      className="fw-bold text-success"
                    />
                  </Col>
                  <Col md={6}>
                    <Form.Label className="small fw-bold">
                      Credited To Bank *
                    </Form.Label>
                    <Form.Select
                      name="depositBank"
                      value={formData.depositBank}
                      onChange={handleChange}
                      required
                    >
                      <option value="">-- Select Bank Account --</option>
                      {bankAccounts
                        .filter((b) => b.name.toLowerCase().includes("bank"))
                        .map((b) => (
                          <option key={b._id} value={b._id}>
                            {b.name}
                          </option>
                        ))}
                    </Form.Select>
                  </Col>
                </Row>
                <Form.Group className="mb-3">
                  <Form.Label className="small fw-bold">Branch *</Form.Label>
                  <Form.Select
                    size="sm"
                    name="branch"
                    value={formData.branch}
                    onChange={handleChange}
                    disabled={
                      currentUser?.role !== "admin" &&
                      currentUser?.role !== "president"
                    }
                  >
                    <option value="KarunaSri Seva Samithi">
                      KarunaSri Seva Samithi
                    </option>
                    <option value="Karunya Sindhu">Karunya Sindhu</option>
                    <option value="Karunya Bharathi">Karunya Bharathi</option>
                  </Form.Select>
                </Form.Group>
                <label className="small fw-bold mb-1">
                  Interest Period (Duration)
                </label>
                <div className="input-group mb-3">
                  <span className="input-group-text">From</span>
                  <Form.Control
                    type="date"
                    name="intStartDate"
                    value={formData.interestPeriod?.startDate || ""}
                    onChange={handleChange}
                  />
                  <span className="input-group-text">To</span>
                  <Form.Control
                    type="date"
                    name="intEndDate"
                    value={formData.interestPeriod?.endDate || ""}
                    onChange={handleChange}
                  />
                </div>
                <Alert variant="info" className="small py-2">
                  <FaClock className="me-2" /> Recorded under{" "}
                  <strong>"Interest Received"</strong>.
                </Alert>
              </div>
            )}

            <Button type="submit" className="btn-ashram w-100 mt-3">
              {submitLoading ? "Saving..." : isEditing ? "Update" : "Save"}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>

      {/* CANCEL MODAL */}
      <Modal show={showCancelModal} onHide={() => setShowCancelModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Cancel Receipt</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="danger">
            <strong>Warning:</strong> This will void the receipt and remove the
            amount from financial reports.
          </Alert>
          <Form.Group>
            <Form.Label>Reason for Cancellation *</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={cancelData.reason}
              onChange={(e) =>
                setCancelData({ ...cancelData, reason: e.target.value })
              }
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCancelModal(false)}>
            Back
          </Button>
          <Button variant="danger" onClick={submitCancellation}>
            Confirm Void
          </Button>
        </Modal.Footer>
      </Modal>

      {/* IMPORT MODAL */}
      <Modal show={showImportModal} onHide={() => setShowImportModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Import CSV</Modal.Title>
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
              className="mb-3"
            />
            <Button type="submit" className="w-100" disabled={submitLoading}>
              {submitLoading ? "Importing..." : "Upload"}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>

      {/* TAX MODAL */}
      <Modal show={showTaxModal} onHide={() => setShowTaxModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Download Tax Certificate</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleDownloadTaxCert}>
            <Form.Label>Donor Phone Number</Form.Label>
            <Form.Control
              placeholder="Enter Phone"
              value={taxPhone}
              onChange={(e) => setTaxPhone(e.target.value)}
              className="mb-3"
              required
            />
            <Form.Label>Financial Year</Form.Label>
            <Form.Select
              value={taxYear}
              onChange={(e) => setTaxYear(e.target.value)}
              className="mb-3"
            >
              <option value="2024">FY 2024-25</option>
              <option value="2025">FY 2025-26</option>
              <option value="2023">FY 2023-24</option>
            </Form.Select>
            <Button type="submit" className="w-100 btn-ashram">
              Download Certificate
            </Button>
          </Form>
        </Modal.Body>
      </Modal>

      {/* MEDIA MODAL old*/}
      {/* <Modal show={showMediaModal} onHide={() => setShowMediaModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Attachments</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleUpload} className="mb-3 d-flex gap-2">
            <Form.Control type="file" multiple onChange={handleFileChange} />
            <Button type="submit">Upload</Button>
          </Form>
          <Row>
            {selectedDonation?.media?.map((path, i) => (
              <Col xs={6} key={i}>
                <img
                  src={`${BASE_URL}${path}`}
                  style={{ width: "100%" }}
                  alt="doc"
                />
              </Col>
            ))}
          </Row>
        </Modal.Body>
      </Modal> */}
      {/* MEDIA MODAL */}
      {/* MEDIA MODAL */}
      <Modal show={showMediaModal} onHide={() => setShowMediaModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Attachments</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleUpload} className="mb-3 d-flex gap-2">
            <Form.Control type="file" multiple onChange={handleFileChange} />
            <Button type="submit" disabled={uploading}>
              {uploading ? "..." : "Upload"}
            </Button>
          </Form>
          <Row>
            {selectedDonation?.media?.map((path, i) => (
              <Col xs={6} key={i} className="mb-2 position-relative">
                {/* --- FIX: Removed BASE_URL --- */}
                <a href={path} target="_blank" rel="noreferrer">
                  <img
                    src={path}
                    style={{
                      width: "100%",
                      height: "150px",
                      objectFit: "cover",
                      borderRadius: "5px",
                      border: "1px solid #ddd",
                    }}
                    alt="attachment"
                  />
                </a>
                <Button
                  size="sm"
                  variant="danger"
                  className="position-absolute top-0 end-0 p-0 px-2 m-1 shadow-sm"
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
