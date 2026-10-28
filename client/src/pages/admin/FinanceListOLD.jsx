/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/immutability */
import React, { useEffect, useState } from "react";
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
  Alert,
} from "react-bootstrap";
import {
  FaPlus,
  FaCheck,
  FaFilePdf,
  FaFileDownload,
  FaExchangeAlt,
  FaBan,
} from "react-icons/fa";
import { Link, useLocation } from "react-router-dom";

const FinanceList = () => {
  const location = useLocation();
  const [vouchers, setVouchers] = useState([]);
  const [accountHeads, setAccountHeads] = useState([]);
  const [bankAccounts, setBankAccounts] = useState([]); // Dropdown data

  // Modals
  const [showModal, setShowModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelData, setCancelData] = useState({ id: "", reason: "" });

  const [userInfo, setUserInfo] = useState(null);
  const [statusFilter, setStatusFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState({ start: "", end: "" });
  const [currentBalance, setCurrentBalance] = useState(0);

  // Voucher Form Data
  const [formData, setFormData] = useState({
    voucherType: "Debit",
    accountHead: "",
    amount: "",
    description: "",
    paymentMode: "Cash",
    recipientName: "",
    branch: "KarunaSri Seva Samithi",
    paymentDetails: {
      chequeNo: "",
      chequeDate: "",
      bankName: "",
      transactionId: "",
    },
  });

  // Transfer Form Data
  const [transferData, setTransferData] = useState({
    toBranch: "Karunya Sindhu",
    amount: "",
    paymentMode: "Bank Transfer",
    description: "Monthly Fund Release",
    paymentDetails: { transactionId: "", bankName: "" },
  });

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("userInfo"));
    setUserInfo(user);
    if (user) {
      fetchVouchers(user);
      fetchAccountHeads(user);
    }
    if (location.state && location.state.filter) {
      setStatusFilter(location.state.filter);
    }
    fetchBalance();
  }, [location]);

  const fetchBalance = async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const { data } = await axios.get(
        `${BASE_URL}/api/finance/cash-balance`,
        config,
      );
      setCurrentBalance(data.systemBalance);
    } catch (error) {
      console.error("Balance Error", error);
    }
  };

  const fetchVouchers = async (user) => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get(
        `${BASE_URL}/api/finance/vouchers`,
        config,
      );
      setVouchers(data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchAccountHeads = async (user) => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get(`${BASE_URL}/api/accounts`, config);
      setAccountHeads(data);

      // Filter for Banks (Code 101, 102, 103 etc or Name includes Bank/Cash)
      const banks = data.filter(
        (acc) =>
          acc.name.toLowerCase().includes("bank") ||
          acc.name.toLowerCase().includes("cash"),
      );
      setBankAccounts(banks);
    } catch (error) {
      console.error(error);
    }
  };

  // --- FORM HANDLERS ---

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Special logic for Bank Deduction: Auto-set recipient
    if (name === "paymentMode" && value === "Bank Deduction") {
      setFormData((prev) => ({
        ...prev,
        paymentMode: value,
        recipientName: "Bank",
      }));
    } else if (
      ["chequeNo", "chequeDate", "bankName", "transactionId"].includes(name)
    ) {
      setFormData((prev) => ({
        ...prev,
        paymentDetails: { ...prev.paymentDetails, [name]: value },
      }));
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const renderPaymentFields = () => {
    const mode = formData.paymentMode;
    if (mode === "Cash") return null; // No extra fields for Cash

    return (
      <div className="bg-light p-2 rounded mb-3 border">
        <h6 className="text-muted small mb-2 fw-bold">Payment Details</h6>
        <Row className="g-2">
          {/* SCENARIO A: BANK DEDUCTION (Select OUR Bank) */}
          {mode === "Bank Deduction" ? (
            <Col md={12}>
              <Form.Label className="small">Select Bank Account *</Form.Label>
              <Form.Select
                name="bankName"
                value={formData.paymentDetails.bankName}
                onChange={handleChange}
                required
              >
                <option value="">-- Choose Account --</option>
                {bankAccounts.map((acc) => (
                  <option key={acc._id} value={acc.name}>
                    {acc.name}
                  </option>
                ))}
              </Form.Select>
            </Col>
          ) : (
            /* SCENARIO B: Cheque/DD/Transfer/UPI (Date, Bank, Ref) */
            <>
              {/* 1. Date */}
              <Col md={4}>
                <Form.Control
                  size="sm"
                  type="date"
                  name="chequeDate"
                  value={formData.paymentDetails.chequeDate}
                  onChange={handleChange}
                  title="Date"
                />
              </Col>

              {/* 2. Bank Name (Text Input for External Bank) */}
              <Col md={4}>
                <Form.Control
                  size="sm"
                  placeholder="Bank Name"
                  name="bankName"
                  value={formData.paymentDetails.bankName}
                  onChange={handleChange}
                />
              </Col>

              {/* 3. Reference Number (Cheque No / Transaction ID) */}
              <Col md={4}>
                <Form.Control
                  size="sm"
                  placeholder={
                    mode === "Cheque"
                      ? "Cheque No"
                      : mode === "DD"
                        ? "DD No"
                        : "Ref / Transaction ID"
                  }
                  name={
                    mode === "Cheque" || mode === "DD"
                      ? "chequeNo"
                      : "transactionId"
                  }
                  value={
                    mode === "Cheque" || mode === "DD"
                      ? formData.paymentDetails.chequeNo
                      : formData.paymentDetails.transactionId
                  }
                  onChange={handleChange}
                />
              </Col>
            </>
          )}
        </Row>
      </div>
    );
  };

  // --- SUBMIT ACTIONS ---

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      await axios.post(`${BASE_URL}/api/finance/vouchers`, formData, config);
      setShowModal(false);
      fetchVouchers(userInfo);
      fetchBalance();
      alert("Voucher Created Successfully!");
      // Reset
      setFormData({
        voucherType: "Debit",
        accountHead: "",
        amount: "",
        description: "",
        paymentMode: "Cash",
        recipientName: "",
        branch: "KarunaSri Seva Samithi",
        paymentDetails: {
          chequeNo: "",
          chequeDate: "",
          bankName: "",
          transactionId: "",
        },
      });
    } catch (error) {
      alert("Error creating voucher");
    }
  };

  const handleTransferSubmit = async () => {
    if (!transferData.amount) return alert("Please enter amount");
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      await axios.post(
        `${BASE_URL}/api/finance/transfer`,
        transferData,
        config,
      );
      alert("Funds Transferred!");
      setShowTransferModal(false);
      fetchVouchers(userInfo);
      fetchBalance();
      setTransferData({
        toBranch: "Karunya Sindhu",
        amount: "",
        paymentMode: "Bank Transfer",
        description: "Monthly Fund Release",
        paymentDetails: { transactionId: "", bankName: "" },
      });
    } catch (error) {
      alert(error.response?.data?.message || "Transfer failed");
    }
  };

  const handleDownloadVoucher = async (id, voucherNo) => {
    try {
      const config = {
        headers: { Authorization: `Bearer ${userInfo.token}` },
        responseType: "blob",
      };
      const response = await axios.get(
        `${BASE_URL}/api/finance/vouchers/${id}/pdf`,
        config,
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${voucherNo}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      alert("Error downloading PDF");
    }
  };

  const handleApprove = async (id) => {
    if (!window.confirm("Confirm signature?")) return;
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      await axios.put(
        `${BASE_URL}/api/finance/vouchers/${id}/approve`,
        {},
        config,
      );
      fetchVouchers(userInfo);
      alert("Approved!");
    } catch (error) {
      alert(error.response?.data?.message || "Error");
    }
  };

  const handleCancelClick = (id) => {
    setCancelData({ id, reason: "" });
    setShowCancelModal(true);
  };

  const submitCancellation = async () => {
    if (!cancelData.reason) return alert("Reason required");
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      await axios.put(
        `${BASE_URL}/api/finance/vouchers/${cancelData.id}/cancel`,
        { reason: cancelData.reason },
        config,
      );
      alert("Voucher Cancelled");
      setShowCancelModal(false);
      fetchVouchers(userInfo);
      fetchBalance();
    } catch (err) {
      alert(err.response?.data?.message || "Error");
    }
  };

  const handleExport = () => {
    if (vouchers.length === 0) return alert("No data");
    const headers = [
      "Date",
      "Voucher No",
      "Type",
      "Account",
      "Amount",
      "Mode",
      "Narration",
      "Status",
    ];
    const rows = filteredVouchers.map((v) => [
      new Date(v.createdAt).toLocaleDateString(),
      v.voucherNo,
      v.voucherType,
      v.accountHead?.name,
      v.amount,
      v.paymentMode,
      `"${v.description}"`,
      v.status,
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      headers.join(",") +
      "\n" +
      rows.map((e) => e.join(",")).join("\n");
    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = "Vouchers.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredVouchers = vouchers.filter((v) => {
    let dateMatch = true;
    if (dateFilter.start) {
      const vDate = new Date(v.createdAt);
      const start = new Date(dateFilter.start);
      const end = dateFilter.end ? new Date(dateFilter.end) : new Date();
      end.setHours(23, 59, 59);
      dateMatch = vDate >= start && vDate <= end;
    }
    let statusMatch = true;
    if (statusFilter === "Pending") statusMatch = v.status !== "Approved";
    else if (statusFilter === "Approved") statusMatch = v.status === "Approved";
    return dateMatch && statusMatch;
  });

  return (
    <div>
      <Row className="mb-4 align-items-center">
        <Col lg={5}>
          <h2
            className="text-maroon m-0"
            style={{ fontFamily: "Playfair Display" }}
          >
            Vouchers & Expenses
          </h2>
          <div className="mt-2">
            <Badge bg="success" className="p-2 fs-6">
              Current Funds Available: ₹ {currentBalance.toLocaleString()}
            </Badge>
          </div>
        </Col>
        <Col lg={7}>
          <div className="d-flex flex-wrap gap-2 justify-content-lg-end">
            {(userInfo?.role === "admin" ||
              userInfo?.role === "president" ||
              userInfo?.role === "secretary") && (
              <Button
                variant="warning"
                className="shadow-sm"
                onClick={() => setShowTransferModal(true)}
              >
                <FaExchangeAlt className="me-2" /> Transfer Funds
              </Button>
            )}
            <Button variant="success" size="sm" onClick={handleExport}>
              <FaFileDownload className="me-2" /> Tally CSV
            </Button>
            <Button
              variant="primary"
              size="sm"
              style={{ backgroundColor: "#581818", border: "none" }}
              onClick={() => setShowModal(true)}
            >
              <FaPlus className="me-2" /> Create Voucher
            </Button>
          </div>
        </Col>
      </Row>

      <Row className="mb-3">
        <Col md={6}>
          <div className="btn-group">
            <button
              className={`btn btn-sm ${statusFilter === "All" ? "btn-dark" : "btn-outline-dark"}`}
              onClick={() => setStatusFilter("All")}
            >
              All
            </button>
            <button
              className={`btn btn-sm ${statusFilter === "Pending" ? "btn-warning" : "btn-outline-warning"}`}
              onClick={() => setStatusFilter("Pending")}
            >
              Pending Actions
            </button>
            <button
              className={`btn btn-sm ${statusFilter === "Approved" ? "btn-success" : "btn-outline-success"}`}
              onClick={() => setStatusFilter("Approved")}
            >
              Approved
            </button>
          </div>
        </Col>
        <Col md={6}>
          <div className="d-flex gap-2 justify-content-end align-items-center">
            <Form.Control
              type="date"
              size="sm"
              value={dateFilter.start}
              onChange={(e) =>
                setDateFilter({ ...dateFilter, start: e.target.value })
              }
              className="w-auto"
            />
            <span className="text-muted">-</span>
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
          <Table hover responsive className="align-middle mb-0 text-nowrap">
            <thead className="bg-light">
              <tr>
                <th className="ps-3">Date / Branch</th>
                <th>Voucher No</th>
                <th>Payee / Recipient</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredVouchers.map((v) => {
                const role = userInfo?.role;
                const canApproveL1 =
                  (role === "secretary" ||
                    role === "president" ||
                    role === "admin") &&
                  v.approvals?.level1?.status !== "Approved";
                const canApproveL2 =
                  role === "treasurer" &&
                  v.approvals?.level1?.status === "Approved" &&
                  v.approvals?.level2?.status !== "Approved";

                return (
                  <tr key={v._id}>
                    <td className="ps-3">
                      <div className="small text-muted">
                        {new Date(v.createdAt).toLocaleDateString()}
                      </div>
                      <Badge bg="light" text="dark" className="border">
                        {v.branch}
                      </Badge>
                    </td>
                    <td className="fw-bold">{v.voucherNo}</td>
                    <td>
                      {v.recipientName || "-"}
                      <div className="small text-muted">
                        {v.accountHead?.name}
                      </div>
                    </td>
                    <td
                      className={`fw-bold ${v.voucherType === "Debit" ? "text-danger" : "text-success"}`}
                    >
                      {v.voucherType === "Debit" ? "-" : "+"} ₹
                      {v.amount.toLocaleString()}
                    </td>
                    <td>
                      {v.status === "Cancelled" ? (
                        <Badge bg="danger">Cancelled</Badge>
                      ) : (
                        <div
                          className="d-flex flex-column gap-1"
                          style={{ fontSize: "0.7rem" }}
                        >
                          <Badge
                            bg={
                              v.approvals?.level1?.status === "Approved"
                                ? "success"
                                : "warning"
                            }
                          >
                            L1: {v.approvals?.level1?.status}
                          </Badge>
                          <Badge
                            bg={
                              v.approvals?.level2?.status === "Approved"
                                ? "success"
                                : "secondary"
                            }
                          >
                            L2: {v.approvals?.level2?.status}
                          </Badge>
                        </div>
                      )}
                    </td>
                    <td>
                      {v.status !== "Cancelled" && (
                        <div className="d-flex gap-1">
                          {(canApproveL1 || canApproveL2) && (
                            <Button
                              size="sm"
                              variant="outline-success"
                              onClick={() => handleApprove(v._id)}
                            >
                              <FaCheck />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline-danger"
                            onClick={() =>
                              handleDownloadVoucher(v._id, v.voucherNo)
                            }
                          >
                            <FaFilePdf />
                          </Button>
                          {(userInfo?.role === "admin" ||
                            userInfo?.role === "president") && (
                            <Button
                              size="sm"
                              variant="outline-dark"
                              onClick={() => handleCancelClick(v._id)}
                            >
                              <FaBan />
                            </Button>
                          )}
                        </div>
                      )}
                      {v.status === "Cancelled" && (
                        <small className="text-danger d-block">
                          {v.cancellationReason}
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

      {/* --- CREATE VOUCHER MODAL --- */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Create Voucher</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Row className="g-2 mb-2">
              <Col md={6}>
                <Form.Label className="small fw-bold">Voucher Type</Form.Label>
                <Form.Select
                  name="voucherType"
                  value={formData.voucherType}
                  onChange={handleChange}
                >
                  <option value="Debit">Debit (Payment)</option>
                  <option value="Credit">Credit (Receipt)</option>
                </Form.Select>
              </Col>
              <Col md={6}>
                <Form.Label className="small fw-bold">Mode</Form.Label>
                <Form.Select
                  name="paymentMode"
                  value={formData.paymentMode}
                  onChange={handleChange}
                >
                  <option>Cash</option>
                  <option>Bank Transfer</option>
                  <option>Cheque</option>
                  <option>UPI</option>
                  <option
                    className="fw-bold text-danger"
                    value="Bank Deduction"
                  >
                    Bank Charge / Deduction
                  </option>
                </Form.Select>
              </Col>
            </Row>

            <Row className="g-2 mb-2">
              <Col md={12}>
                <Form.Label className="small fw-bold">Account Head</Form.Label>
                <Form.Select
                  name="accountHead"
                  value={formData.accountHead}
                  onChange={handleChange}
                  required
                >
                  <option value="">-- Select Expense Category --</option>
                  {accountHeads
                    .filter((a) => a.type === formData.voucherType)
                    .map((acc) => (
                      <option key={acc._id} value={acc._id}>
                        {acc.code} - {acc.name}
                      </option>
                    ))}
                </Form.Select>
              </Col>
            </Row>

            {/* Recipient Input (Hidden for Bank Deduction) */}
            {formData.paymentMode !== "Bank Deduction" && (
              <Form.Group className="mb-2">
                <Form.Label className="small fw-bold">
                  Paid To (Recipient)
                </Form.Label>
                <Form.Control
                  name="recipientName"
                  value={formData.recipientName}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            )}

            <Row className="g-2 mb-2">
              <Col md={6}>
                <Form.Label className="small fw-bold">Amount (₹)</Form.Label>
                <Form.Control
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  required
                />
              </Col>
              <Col md={6}>
                <Form.Label className="small fw-bold">Branch</Form.Label>
                <Form.Select
                  name="branch"
                  value={formData.branch}
                  onChange={handleChange}
                  disabled={
                    userInfo?.role !== "admin" && userInfo?.role !== "president"
                  }
                >
                  <option value="KarunaSri Seva Samithi">
                    KarunaSri Seva Samithi
                  </option>
                  <option value="Karunya Sindhu">Karunya Sindhu</option>
                  <option value="Karunya Bharathi">Karunya Bharathi</option>
                  <option value="Karunya Jyothi">Karunya Jyothi</option>
                </Form.Select>
              </Col>
            </Row>

            {/* --- DYNAMIC PAYMENT FIELDS --- */}
            {renderPaymentFields()}

            <Form.Group className="mb-3">
              <Form.Label className="small fw-bold">Description</Form.Label>
              <Form.Control
                as="textarea"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder={
                  formData.paymentMode === "Bank Deduction"
                    ? "e.g. DD Charges for Rice"
                    : "Narration"
                }
              />
            </Form.Group>

            <Button type="submit" variant="dark" className="w-100">
              Generate Voucher
            </Button>
          </Form>
        </Modal.Body>
      </Modal>

      {/* --- TRANSFER MODAL --- */}
      <Modal
        show={showTransferModal}
        onHide={() => setShowTransferModal(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Inter-Branch Fund Transfer</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="alert alert-info small">
            Creates auto Debit (HQ) & Credit (Branch) vouchers.
          </div>
          <Form.Group className="mb-2">
            <Form.Label>Transfer To</Form.Label>
            <Form.Select
              value={transferData.toBranch}
              onChange={(e) =>
                setTransferData({ ...transferData, toBranch: e.target.value })
              }
            >
              <option value="Karunya Sindhu">Karunya Sindhu</option>
              <option value="Karunya Bharathi">Karunya Bharathi</option>
            </Form.Select>
          </Form.Group>
          <Form.Control
            type="number"
            placeholder="Amount"
            value={transferData.amount}
            onChange={(e) =>
              setTransferData({ ...transferData, amount: e.target.value })
            }
            className="mb-2"
          />
          <Form.Control
            placeholder="Description / Month"
            value={transferData.description}
            onChange={(e) =>
              setTransferData({ ...transferData, description: e.target.value })
            }
            className="mb-3"
          />
          <Button
            variant="warning"
            className="w-100"
            onClick={handleTransferSubmit}
          >
            Transfer Funds
          </Button>
        </Modal.Body>
      </Modal>

      {/* --- CANCEL MODAL --- */}
      <Modal show={showCancelModal} onHide={() => setShowCancelModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Cancel Voucher</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="danger">Warning: This action cannot be undone.</Alert>
          <Form.Control
            as="textarea"
            placeholder="Reason for cancellation..."
            value={cancelData.reason}
            onChange={(e) =>
              setCancelData({ ...cancelData, reason: e.target.value })
            }
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCancelModal(false)}>
            Close
          </Button>
          <Button variant="danger" onClick={submitCancellation}>
            Confirm Void
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default FinanceList;
