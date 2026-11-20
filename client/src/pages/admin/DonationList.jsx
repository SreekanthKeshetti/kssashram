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
  FaWhatsapp,
  FaEye,
  FaTrash,
  FaGavel,
  FaUserCheck,
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
  const [showOnlyEdits, setShowOnlyEdits] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showTaxModal, setShowTaxModal] = useState(false);
  const [showMediaModal, setShowMediaModal] = useState(false);

  // 3-TIER COMMITTEE EDIT WORKFLOW STATES
  const [showReviewEditModal, setShowReviewEditModal] = useState(false);
  const [selectedReviewDonation, setSelectedReviewDonation] = useState(null);
  const [editReason, setEditReason] = useState("");
  const [reviewRemark, setReviewRemark] = useState("");

  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [whatsAppData, setWhatsAppData] = useState({
    donorName: "",
    phone: "",
    amount: "",
    receiptNo: "",
    scheme: "",
    message: "",
  });

  const [previewImage, setPreviewImage] = useState(null);
  const [localFilePreviews, setLocalFilePreviews] = useState([]);

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

  // INITIAL STATE WITH isRecurring DEFAULTED TO TRUE
  const [formData, setFormData] = useState({
    donationDate: new Date().toISOString().split("T")[0],
    donorName: "",
    donorPhone: "",
    donorLandline: "",
    donorEmail: "",
    donorPan: "",
    donorAadhaar: "",
    amount: "",
    scheme: "Nitya Annadhana Nidhi",
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
    isRecurring: true, // DEFAULTED TO TRUE
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
          const firstScheme = schemeRes.data[0];
          setFormData((prev) => ({
            ...prev,
            scheme: firstScheme.name,
            amount: firstScheme.defaultRate > 0 ? firstScheme.defaultRate : "",
          }));
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
    setEditReason("");

    setFormData({
      donationDate: new Date().toISOString().split("T")[0],
      donorName: "",
      donorPhone: "",
      donorLandline: "",
      donorEmail: "",
      donorPan: "",
      donorAadhaar: "",
      amount:
        schemes.length > 0 && schemes[0].defaultRate > 0
          ? schemes[0].defaultRate
          : "",
      scheme: schemes.length > 0 ? schemes[0].name : "Nitya Annadhana Nidhi",
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
      isRecurring: true, // DEFAULTED TO TRUE
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
    setEditReason("");

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
      isRecurring: d.isRecurring !== undefined ? d.isRecurring : true,
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

    if (name === "scheme") {
      const selectedScheme = schemes.find((s) => s.name === value);
      if (selectedScheme && selectedScheme.defaultRate > 0 && !isEditing) {
        setFormData((prev) => ({
          ...prev,
          scheme: value,
          amount: selectedScheme.defaultRate,
        }));
        return;
      }
    }

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
        // Requirement 1: Enforce 3-Tier Committee Consensus Request
        if (!editReason.trim()) {
          setSubmitLoading(false);
          return alert(
            "Please enter the mandatory reason for this edit request.",
          );
        }

        const { data } = await axios.post(
          `${BASE_URL}/api/donations/${editId}/request-edit`,
          { updates: payload, reason: editReason },
          config,
        );

        alert(
          data.message ||
            "Edit Request submitted for 3-tier committee approval.",
        );
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

  // Requirement 1: Committee Vote Action (Majority: 2 of 3)
  const handleVoteEdit = async (status) => {
    if (
      !window.confirm(
        `Are you sure you want to vote ${status} on this edit request?`,
      )
    )
      return;
    try {
      const config = {
        headers: { Authorization: `Bearer ${currentUser.token}` },
      };
      const { data } = await axios.put(
        `${BASE_URL}/api/donations/${selectedReviewDonation._id}/approve-edit`,
        { status, remark: reviewRemark },
        config,
      );
      alert(data.message);
      setShowReviewEditModal(false);
      setReviewRemark("");
      fetchDonations();
    } catch (err) {
      alert(
        err.response?.data?.message || "Error recording committee decision.",
      );
    }
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
      "Recurring",
      "Manual Ref",
      "Comments",
    ];

    const safeString = (str) => {
      if (!str) return `"-"`;
      return `"${String(str).replace(/"/g, '""').replace(/\n/g, " ")}"`;
    };

    const rows = filteredDonations.map((d) => {
      const pd = d.paymentDetails || {};
      const formatDate = (date) =>
        date ? new Date(date).toLocaleDateString() : "-";

      return [
        safeString(d.receiptNo || d._id.toString().slice(-6).toUpperCase()),
        formatDate(d.createdAt),
        safeString(d.donorName),
        safeString(d.donorPhone),
        safeString(d.donorLandline),
        safeString(d.donorEmail),
        safeString(d.donorPan),
        safeString(d.donorAadhaar),
        safeString(d.address),
        d.category,
        d.amount,
        safeString(d.scheme),
        safeString(d.occasion),
        safeString(d.inNameOf),
        d.paymentMode,
        safeString(pd.chequeNo || pd.ddNo),
        formatDate(pd.chequeDate),
        safeString(pd.transactionId),
        safeString(pd.bankName),
        safeString(d.depositBank?.name),
        safeString(d.branch),
        d.isRecurring ? "Yes" : "No",
        safeString(d.manualReceiptNo),
        safeString(d.comments),
      ];
    });

    const csvContent =
      "data:text/csv;charset=utf-8," +
      headers.join(",") +
      "\n" +
      rows.map((e) => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.setAttribute("href", url);
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
      alert("Receipt sent successfully via email!");
      fetchDonations();
    } catch (e) {
      alert("Error sending email: " + (e.response?.data?.message || e.message));
    }
  };

  const handleOpenWhatsAppModal = (donation) => {
    const recNo = donation.receiptNo || donation._id.slice(-6).toUpperCase();
    const frontendBaseUrl = window.location.origin;
    const downloadUrl = `${frontendBaseUrl}/receipt/${donation._id}`;

    const defaultMsg = `Namaste ${donation.donorName} garu,\n\nThank you for your generous donation of Rs. ${donation.amount.toLocaleString("en-IN")} towards *${donation.scheme}* to Karunasri Seva Samithi.\n\nReceipt No: *${recNo}*\nDate: ${new Date(donation.createdAt).toLocaleDateString("en-IN")}\n\nYou can view your official receipt and download the 80G tax certificate here:\n${downloadUrl}\n\nWith Gratitude,\n*Karunasri Seva Samithi*`;

    setWhatsAppData({
      donorName: donation.donorName,
      phone: donation.donorPhone !== "0000000000" ? donation.donorPhone : "",
      message: defaultMsg,
    });
    setShowWhatsAppModal(true);
  };

  const handleSendWhatsApp = () => {
    if (!whatsAppData.phone)
      return alert("Please enter a valid donor mobile number");

    let cleanNumber = whatsAppData.phone.replace(/\D/g, "");
    if (cleanNumber.length === 10) cleanNumber = "91" + cleanNumber;

    const waUrl = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(whatsAppData.message)}`;
    window.open(waUrl, "_blank");
    setShowWhatsAppModal(false);
  };

  const openMediaModal = (d) => {
    setSelectedDonation(d);
    setFiles([]);
    setLocalFilePreviews([]);
    setShowMediaModal(true);
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(selectedFiles);

    const previews = selectedFiles.map((file) => ({
      name: file.name,
      url: URL.createObjectURL(file),
      type: file.type,
    }));
    setLocalFilePreviews(previews);
  };

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
      const { data } = await axios.post(
        `${BASE_URL}/api/donations/${selectedDonation._id}/upload`,
        fd,
        config,
      );
      alert("Uploaded Successfully!");
      setFiles([]);
      setLocalFilePreviews([]);
      setSelectedDonation((prev) => ({ ...prev, media: data.media }));
      fetchDonations();
    } catch (e) {
      alert("Upload failed: " + (e.response?.data?.message || e.message));
    }
    setUploading(false);
  };

  const handleDeleteMedia = async (filePath) => {
    if (!window.confirm("Delete this attachment?")) return;
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
      alert("Attachment removed");
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
    if (mode === "Cash" && Number(formData.amount) > 2000) {
      return (
        <Alert
          variant="warning"
          className="small py-2 mb-3 shadow-sm border-warning"
        >
          <strong>⚠️ 80G Tax Exemption Warning:</strong>
          <br />
          As per IT Act, cash donations exceeding ₹2,000 are{" "}
          <strong>not eligible</strong> for 80G tax deductions. The 80G text
          will be automatically removed from this receipt.
        </Alert>
      );
    }
    return null;
  };

  const filteredDonations = donations.filter((d) => {
    if (showOnlyEdits) {
      return d.editRequest && d.editRequest.status === "Pending";
    }

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

  const isCommitteeMember = [
    "admin",
    "president",
    "secretary",
    "treasurer",
  ].includes(currentUser?.role);

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
          <p className="text-muted m-0 small">
            Manage incoming funds, recurring Sevas & 3-tier approvals
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

      <Row className="mb-3 g-2 align-items-center">
        <Col md={7}>
          <ButtonGroup>
            <Button
              variant={
                !showOnlyEdits && filterCategory === "Household"
                  ? "dark"
                  : "outline-dark"
              }
              size="sm"
              onClick={() => {
                setShowOnlyEdits(false);
                setFilterCategory("Household");
              }}
            >
              Household
            </Button>
            <Button
              variant={
                !showOnlyEdits && filterCategory === "Organizational"
                  ? "warning"
                  : "outline-warning"
              }
              size="sm"
              onClick={() => {
                setShowOnlyEdits(false);
                setFilterCategory("Organizational");
              }}
            >
              Organization
            </Button>
            <Button
              variant={
                !showOnlyEdits && filterCategory === "All"
                  ? "secondary"
                  : "outline-secondary"
              }
              size="sm"
              onClick={() => {
                setShowOnlyEdits(false);
                setFilterCategory("All");
              }}
            >
              All
            </Button>
            <Button
              variant={showOnlyEdits ? "danger" : "outline-danger"}
              size="sm"
              onClick={() => setShowOnlyEdits(!showOnlyEdits)}
            >
              <FaGavel className="me-1" /> Pending Edits (
              {
                donations.filter(
                  (d) => d.editRequest && d.editRequest.status === "Pending",
                ).length
              }
              )
            </Button>
          </ButtonGroup>
        </Col>
        <Col md={5}>
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
                <th style={{ width: "16%" }}>Donor</th>
                <th style={{ width: "16%" }}>Scheme / Head</th>
                <th style={{ width: "8%" }}>Category</th>
                <th style={{ width: "10%" }}>Amount</th>
                <th style={{ width: "10%" }}>Mode</th>
                <th style={{ width: "10%" }}>Branch</th>
                <th style={{ width: "10%" }}>Status / Consensus</th>
                <th style={{ width: "18%" }} className="text-center">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredDonations.map((d) => {
                const isCancelled = d.status === "Cancelled";
                const hasPendingEdit =
                  d.editRequest && d.editRequest.status === "Pending";
                const p =
                  d.editRequest?.approvals?.president?.status || "Pending";
                const s =
                  d.editRequest?.approvals?.secretary?.status || "Pending";
                const t =
                  d.editRequest?.approvals?.treasurer?.status || "Pending";

                return (
                  <tr
                    key={d._id}
                    style={
                      isCancelled
                        ? { opacity: 0.6, backgroundColor: "#f8f9fa" }
                        : hasPendingEdit
                          ? { backgroundColor: "#fff9e6" }
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
                        {new Date(d.createdAt).toLocaleDateString("en-IN")}
                      </div>
                      <small className="text-muted">
                        {d.receiptNo || d._id.slice(-6).toUpperCase()}
                      </small>
                      {d.isRecurring && (
                        <div className="text-primary small fw-bold">
                          ↻ Annual Seva
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
                        style={{ maxWidth: "130px" }}
                        title={d.branch}
                      >
                        {d.branch}
                      </small>
                    </td>
                    <td>
                      {isCancelled ? (
                        <Badge bg="danger">Cancelled</Badge>
                      ) : hasPendingEdit ? (
                        <div>
                          <Badge
                            bg="warning"
                            text="dark"
                            className="d-block mb-1"
                          >
                            Edit Pending (2/3)
                          </Badge>
                          <div
                            className="d-flex justify-content-start gap-1"
                            style={{ fontSize: "0.7rem" }}
                          >
                            <span title="President">
                              P:
                              {p === "Approved"
                                ? "✅"
                                : p === "Rejected"
                                  ? "❌"
                                  : "⏳"}
                            </span>
                            <span title="Secretary">
                              S:
                              {s === "Approved"
                                ? "✅"
                                : s === "Rejected"
                                  ? "❌"
                                  : "⏳"}
                            </span>
                            <span title="Treasurer">
                              T:
                              {t === "Approved"
                                ? "✅"
                                : t === "Rejected"
                                  ? "❌"
                                  : "⏳"}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <Badge bg="success">Active</Badge>
                      )}
                    </td>
                    <td className="text-center">
                      {!isCancelled && (
                        <div className="d-flex justify-content-center gap-1">
                          {/* COMMITTEE VOTE BUTTON */}
                          {hasPendingEdit && isCommitteeMember && (
                            <Button
                              size="sm"
                              variant="danger"
                              title="Review & Vote on Edit Request"
                              onClick={() => {
                                setSelectedReviewDonation(d);
                                setShowReviewEditModal(true);
                              }}
                            >
                              <FaUserCheck className="me-1" /> Vote
                            </Button>
                          )}

                          {/* REQUEST EDIT BUTTON */}
                          <Button
                            size="sm"
                            variant={
                              hasPendingEdit ? "secondary" : "outline-primary"
                            }
                            title={
                              hasPendingEdit
                                ? "Edit Pending Approval"
                                : "Request Edit (Requires 3-Tier Approval)"
                            }
                            onClick={() => handleEditClick(d)}
                            disabled={hasPendingEdit}
                          >
                            <FaEdit />
                          </Button>

                          <Button
                            size="sm"
                            variant="outline-success"
                            title="Share on WhatsApp"
                            onClick={() => handleOpenWhatsAppModal(d)}
                          >
                            <FaWhatsapp />
                          </Button>

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
                                alert("Error downloading receipt");
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
                            onClick={() => openMediaModal(d)}
                            title="Docs & Photos"
                          >
                            <FaImages />
                          </Button>
                          {(currentUser?.role === "admin" ||
                            currentUser?.role === "president" ||
                            currentUser?.role === "secretary") && (
                            <Button
                              size="sm"
                              variant="outline-danger"
                              title="Void Receipt"
                              onClick={() => handleCancelClick(d._id)}
                            >
                              <FaBan />
                            </Button>
                          )}
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

      {/* --- ADD / EDIT REQUEST MODAL --- */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton className="bg-light">
          <Modal.Title>
            {isEditing
              ? "Request Edit (Requires 3-Tier Committee Approval)"
              : "New Receipt / Transaction"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {isEditing && (
            <Alert variant="warning" className="small mb-3">
              <strong>⚠️ Locked Receipt Policy:</strong> Edits to official
              receipts cannot be committed directly. Submitting this form will
              route your changes to the{" "}
              <strong>
                3-Tier Committee (President, Secretary, Treasurer)
              </strong>
              . The live receipt updates automatically when at least 2 of 3
              committee members approve.
            </Alert>
          )}

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
                      className="fw-bold text-success"
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

                {/* Requirement 2: ALWAYS ENABLED RECURRING SWITCH */}
                <div className="p-2 mb-2 rounded bg-light border d-flex align-items-center justify-content-between">
                  <div>
                    <span className="fw-bold text-dark">
                      ↻ Annual Recurring Seva
                    </span>
                    <small className="d-block text-muted">
                      Keeps this donor in the CRM renewal engine. Turn off only
                      if donor explicitly declined annual support.
                    </small>
                  </div>
                  <Form.Check
                    type="switch"
                    id="isRecurringSwitch"
                    name="isRecurring"
                    checked={formData.isRecurring}
                    onChange={handleChange}
                    className="fs-5"
                  />
                </div>

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

                {/* Requirement 1: MANDATORY REASON WHEN REQUESTING EDIT */}
                {isEditing && (
                  <Form.Group className="mt-3 p-3 bg-white border border-danger rounded">
                    <Form.Label className="small fw-bold text-danger">
                      Mandatory Reason for Edit Request *
                    </Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={2}
                      placeholder="Explain to President, Secretary, and Treasurer why this change is necessary..."
                      value={editReason}
                      onChange={(e) => setEditReason(e.target.value)}
                      required
                    />
                  </Form.Group>
                )}
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

                {/* RESTORED EXACT INTEREST PERIOD INPUTS */}
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

                {isEditing && (
                  <Form.Group className="mt-3 p-3 bg-white border border-danger rounded">
                    <Form.Label className="small fw-bold text-danger">
                      Mandatory Reason for Edit Request *
                    </Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={2}
                      placeholder="Explain reason for adjusting this transaction..."
                      value={editReason}
                      onChange={(e) => setEditReason(e.target.value)}
                      required
                    />
                  </Form.Group>
                )}
              </div>
            )}

            <Button
              type="submit"
              className="btn-ashram w-100 mt-3"
              disabled={submitLoading}
            >
              {submitLoading
                ? "Processing..."
                : isEditing
                  ? "Submit for Committee Approval"
                  : "Save Receipt"}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>

      {/* --- COMMITTEE EDIT REVIEW & VOTE MODAL (2 of 3 CONSENSUS) --- */}
      <Modal
        show={showReviewEditModal}
        onHide={() => setShowReviewEditModal(false)}
        size="lg"
      >
        <Modal.Header closeButton className="bg-danger text-white">
          <Modal.Title className="fs-5 d-flex align-items-center">
            <FaGavel className="me-2" /> 3-Tier Committee Consensus: Edit Review
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedReviewDonation && (
            <>
              <div className="p-3 bg-light rounded border mb-3">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <h5 className="text-maroon fw-bold mb-1">
                      Receipt: {selectedReviewDonation.receiptNo}
                    </h5>
                    <div className="text-muted small">
                      Requested By:{" "}
                      <strong>
                        {selectedReviewDonation.editRequest?.requestedBy
                          ?.name || "Staff"}
                      </strong>{" "}
                      on{" "}
                      {new Date(
                        selectedReviewDonation.editRequest?.requestedAt ||
                          Date.now(),
                      ).toLocaleDateString()}
                    </div>
                  </div>
                  <Badge bg="warning" text="dark" className="fs-6 p-2">
                    Pending Consensus (2 of 3 Required)
                  </Badge>
                </div>

                <div className="mt-3 p-2 bg-white rounded border border-warning">
                  <strong className="text-danger">
                    Reason for Requested Edit:
                  </strong>
                  <p className="mb-0 mt-1 fst-italic">
                    "{selectedReviewDonation.editRequest?.reason}"
                  </p>
                </div>
              </div>

              {/* Side-by-Side Diff Table */}
              <h6 className="fw-bold text-dark mb-2">
                Proposed Changes Comparison:
              </h6>
              <Table bordered size="sm" className="align-middle mb-4">
                <thead
                  className="bg-light text-uppercase"
                  style={{ fontSize: "0.75rem" }}
                >
                  <tr>
                    <th>Field</th>
                    <th className="text-muted">Current Live Value</th>
                    <th className="text-success">Proposed New Value</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(
                    selectedReviewDonation.editRequest?.proposedUpdates || {},
                  )
                    .filter(
                      ([key]) =>
                        key !== "paymentDetails" && key !== "interestPeriod",
                    )
                    .map(([key, rawNewVal]) => {
                      let oldVal = selectedReviewDonation[key];
                      let newVal = rawNewVal;

                      if (key === "depositBank") {
                        oldVal =
                          selectedReviewDonation.depositBank?.name || oldVal;
                        const matchedBank = bankAccounts.find(
                          (b) => b._id === newVal,
                        );
                        newVal = matchedBank ? matchedBank.name : newVal;
                      }

                      if (key === "accountHead") {
                        oldVal =
                          selectedReviewDonation.accountHead?.name || oldVal;
                      }

                      const isChanged =
                        String(oldVal ?? "") !== String(newVal ?? "");
                      return (
                        <tr
                          key={key}
                          className={isChanged ? "table-warning" : ""}
                        >
                          <td className="fw-bold text-capitalize">
                            {key.replace(/([A-Z])/g, " $1")}
                          </td>
                          <td className="text-muted">
                            {String(oldVal ?? "-")}
                          </td>
                          <td
                            className={isChanged ? "fw-bold text-success" : ""}
                          >
                            {String(newVal ?? "-")}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </Table>

              {/* 3-Tier Committee Votes Table */}
              <h6 className="fw-bold text-dark mb-2">
                Committee Consensus Status:
              </h6>
              <Table
                bordered
                size="sm"
                className="text-center align-middle mb-4"
              >
                <thead
                  className="bg-light text-uppercase"
                  style={{ fontSize: "0.75rem" }}
                >
                  <tr>
                    <th>President</th>
                    <th>Secretary</th>
                    <th>Treasurer</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <Badge
                        bg={
                          selectedReviewDonation.editRequest?.approvals
                            ?.president?.status === "Approved"
                            ? "success"
                            : selectedReviewDonation.editRequest?.approvals
                                  ?.president?.status === "Rejected"
                              ? "danger"
                              : "secondary"
                        }
                      >
                        {selectedReviewDonation.editRequest?.approvals
                          ?.president?.status || "Pending"}
                      </Badge>
                    </td>
                    <td>
                      <Badge
                        bg={
                          selectedReviewDonation.editRequest?.approvals
                            ?.secretary?.status === "Approved"
                            ? "success"
                            : selectedReviewDonation.editRequest?.approvals
                                  ?.secretary?.status === "Rejected"
                              ? "danger"
                              : "secondary"
                        }
                      >
                        {selectedReviewDonation.editRequest?.approvals
                          ?.secretary?.status || "Pending"}
                      </Badge>
                    </td>
                    <td>
                      <Badge
                        bg={
                          selectedReviewDonation.editRequest?.approvals
                            ?.treasurer?.status === "Approved"
                            ? "success"
                            : selectedReviewDonation.editRequest?.approvals
                                  ?.treasurer?.status === "Rejected"
                              ? "danger"
                              : "secondary"
                        }
                      >
                        {selectedReviewDonation.editRequest?.approvals
                          ?.treasurer?.status || "Pending"}
                      </Badge>
                    </td>
                  </tr>
                </tbody>
              </Table>

              <Form.Group className="mb-3">
                <Form.Label className="small fw-bold">
                  Your Remark / Feedback (Optional)
                </Form.Label>
                <Form.Control
                  size="sm"
                  placeholder="e.g. Verified donor receipt discrepancy with bank statement"
                  value={reviewRemark}
                  onChange={(e) => setReviewRemark(e.target.value)}
                />
              </Form.Group>
            </>
          )}
        </Modal.Body>
        <Modal.Footer className="d-flex justify-content-between">
          <Button
            variant="secondary"
            onClick={() => setShowReviewEditModal(false)}
          >
            Close
          </Button>
          <div className="d-flex gap-2">
            <Button variant="danger" onClick={() => handleVoteEdit("Rejected")}>
              Vote to Reject
            </Button>
            <Button
              variant="success"
              onClick={() => handleVoteEdit("Approved")}
            >
              Vote to Approve (2/3)
            </Button>
          </div>
        </Modal.Footer>
      </Modal>

      {/* --- WHATSAPP SHARE MODAL --- */}
      <Modal
        show={showWhatsAppModal}
        onHide={() => setShowWhatsAppModal(false)}
        centered
      >
        <Modal.Header closeButton className="bg-success text-white">
          <Modal.Title className="fs-5 d-flex align-items-center">
            <FaWhatsapp className="me-2" size={24} /> Send Receipt on WhatsApp
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label className="small fw-bold">
              Donor WhatsApp Mobile Number *
            </Form.Label>
            <Form.Control
              type="text"
              value={whatsAppData.phone}
              onChange={(e) =>
                setWhatsAppData({ ...whatsAppData, phone: e.target.value })
              }
              placeholder="e.g. 9848012345 (with or without 91)"
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="small fw-bold">
              Message Preview (Editable)
            </Form.Label>
            <Form.Control
              as="textarea"
              rows={7}
              value={whatsAppData.message}
              onChange={(e) =>
                setWhatsAppData({ ...whatsAppData, message: e.target.value })
              }
              style={{ fontSize: "0.85rem", lineHeight: "1.4" }}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowWhatsAppModal(false)}
          >
            Close
          </Button>
          <Button
            variant="success"
            onClick={handleSendWhatsApp}
            className="fw-bold"
          >
            <FaWhatsapp className="me-2" /> Open in WhatsApp
          </Button>
        </Modal.Footer>
      </Modal>

      {/* --- MEDIA ATTACHMENTS MODAL --- */}
      <Modal
        show={showMediaModal}
        onHide={() => setShowMediaModal(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title className="d-flex align-items-center justify-content-between w-100 me-3">
            <span>
              <FaImages className="me-2 text-warning" />
              Attachments: {selectedDonation?.donorName}
            </span>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Card className="p-3 bg-light border-0 mb-4">
            <Form onSubmit={handleUpload}>
              <Form.Label className="small fw-bold">
                Choose Photos or Files to Upload
              </Form.Label>
              <div className="d-flex gap-2 mb-2">
                <Form.Control
                  type="file"
                  multiple
                  accept="image/*,.pdf"
                  onChange={handleFileChange}
                />
                <Button
                  type="submit"
                  variant="dark"
                  disabled={uploading || files.length === 0}
                >
                  {uploading ? "Uploading..." : "Upload"}
                </Button>
              </div>
            </Form>
          </Card>

          <Row>
            {selectedDonation?.media?.map((path, i) => {
              const isPdf = path.toLowerCase().endsWith(".pdf");
              return (
                <Col md={4} sm={6} xs={12} key={i} className="mb-3">
                  <Card className="h-100 shadow-sm border position-relative overflow-hidden">
                    {isPdf ? (
                      <div className="p-4 text-center bg-light">
                        <FaFilePdf size={48} className="text-danger mb-2" />
                        <span className="d-block small text-muted">
                          PDF Document
                        </span>
                      </div>
                    ) : (
                      <div
                        style={{
                          height: "160px",
                          cursor: "pointer",
                          background: "#f8f9fa",
                        }}
                        onClick={() => setPreviewImage(path)}
                      >
                        <img
                          src={path}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                          alt="Donation attachment"
                        />
                      </div>
                    )}
                    <Card.Footer className="p-2 bg-white d-flex justify-content-between align-items-center">
                      <a
                        href={path}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-sm btn-outline-primary py-0 px-2"
                        style={{ fontSize: "0.75rem" }}
                      >
                        <FaEye className="me-1" /> Open
                      </a>
                      <Button
                        size="sm"
                        variant="outline-danger"
                        className="py-0 px-2"
                        style={{ fontSize: "0.75rem" }}
                        onClick={() => handleDeleteMedia(path)}
                      >
                        <FaTrash className="me-1" /> Delete
                      </Button>
                    </Card.Footer>
                  </Card>
                </Col>
              );
            })}
          </Row>
        </Modal.Body>
      </Modal>

      {/* FULL SIZE IMAGE LIGHTBOX */}
      <Modal
        show={!!previewImage}
        onHide={() => setPreviewImage(null)}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title className="fs-6">Full Image Preview</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-0 text-center bg-dark">
          {previewImage && (
            <img
              src={previewImage}
              alt="Full view"
              style={{
                maxWidth: "100%",
                maxHeight: "80vh",
                objectFit: "contain",
              }}
            />
          )}
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
    </div>
  );
};

export default DonationList;
