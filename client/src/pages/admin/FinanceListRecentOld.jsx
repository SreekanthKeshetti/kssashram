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
  FaBalanceScale,
  FaExchangeAlt,
  FaBan,
} from "react-icons/fa";
import { Link, useLocation } from "react-router-dom";

const FinanceList = () => {
  const location = useLocation();
  const [vouchers, setVouchers] = useState([]);
  const [accountHeads, setAccountHeads] = useState([]);

  // Modals
  const [showModal, setShowModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false); // NEW MODAL

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

  // NEW: Transfer Form Data
  const [transferData, setTransferData] = useState({
    toBranch: "Karunya Sindhu",
    amount: "",
    paymentMode: "Bank Transfer",
    description: "Monthly Fund Release",
    paymentDetails: { transactionId: "", bankName: "" },
  });
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelData, setCancelData] = useState({ id: "", reason: "" });

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("userInfo"));
    setUserInfo(user);
    if (user) {
      fetchVouchers(user);
      fetchAccountHeads(user);
    }
    // Auto-filter if coming from Dashboard
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
    } catch (error) {
      console.error(error);
    }
  };

  // --- ACTIONS ---

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
      alert("Error downloading voucher PDF");
    }
  };

  const handleApprove = async (id) => {
    if (!window.confirm("Confirm signature for this voucher?")) return;
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      await axios.put(
        `${BASE_URL}/api/finance/vouchers/${id}/approve`,
        {},
        config,
      );
      fetchVouchers(userInfo);
      alert("Approval Recorded!");
    } catch (error) {
      alert(error.response?.data?.message || "Error approving");
    }
  };

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

  // --- NEW: HANDLE FUND TRANSFER ---
  const handleTransferSubmit = async () => {
    if (!transferData.amount) return alert("Please enter amount");
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      await axios.post(
        `${BASE_URL}/api/finance/transfer`,
        transferData,
        config,
      );

      alert("Funds Transferred! Vouchers created for both HQ and Branch.");
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

  const handleExport = () => {
    if (vouchers.length === 0) return alert("No vouchers to export.");
    const headers = [
      "Date",
      "Voucher No",
      "Type",
      "Account Code",
      "Ledger Name",
      "Amount",
      "Mode",
      "Narration",
      "Prepared By",
      "Status",
    ];
    const rows = filteredVouchers.map((v) => [
      new Date(v.createdAt).toLocaleDateString(),
      v.voucherNo,
      v.voucherType,
      v.accountHead?.code || "N/A",
      `"${v.accountHead?.name || "Unknown"}"`,
      v.amount,
      v.paymentMode,
      `"${v.description || ""}"`,
      v.preparedBy?.name || "System",
      v.status,
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      headers.join(",") +
      "\n" +
      rows.map((e) => e.join(",")).join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute(
      "download",
      `Tally_Export_${new Date().toISOString().split("T")[0]}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (
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
      fetchBalance(); // Update balance immediately
    } catch (err) {
      alert(err.response?.data?.message || "Error");
    }
  };

  const renderPaymentFields = () => (
    <div className="bg-light p-2 rounded mb-3 border">
      <h6 className="text-muted small mb-2">Payment Details (Optional)</h6>
      <Row className="g-2">
        {(formData.paymentMode === "Cheque" ||
          formData.paymentMode === "DD") && (
          <Col md={4}>
            <Form.Control
              size="sm"
              placeholder="Cheque/DD No"
              name="chequeNo"
              value={formData.paymentDetails.chequeNo}
              onChange={handleChange}
            />
          </Col>
        )}
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
        {(formData.paymentMode === "Online" ||
          formData.paymentMode === "UPI" ||
          formData.paymentMode === "Bank Transfer") && (
          <Col md={12}>
            <Form.Control
              size="sm"
              placeholder="Transaction ID / Ref No"
              name="transactionId"
              value={formData.paymentDetails.transactionId}
              onChange={handleChange}
            />
          </Col>
        )}
      </Row>
    </div>
  );

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
          {/* NEW: SHOW BALANCE HERE */}
          <div className="mt-2">
            <Badge bg="success" className="p-2 fs-6">
              Current Funds Available: ₹ {currentBalance.toLocaleString()}
            </Badge>
          </div>
        </Col>
        <Col lg={7}>
          <div className="d-flex flex-wrap gap-2 justify-content-lg-end">
            {/* <Link
              to="/dashboard/finance/reconcile"
              className="btn btn-outline-dark shadow-sm d-flex align-items-center"
            >
              <FaBalanceScale className="me-2" /> Reconcile
            </Link> */}

            {/* NEW: TRANSFER BUTTON (Only for Admin/HQ) */}
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
                          L1:{" "}
                          {v.approvals?.level1?.status === "Approved"
                            ? "Signed"
                            : "Pending"}
                        </Badge>
                        <Badge
                          bg={
                            v.approvals?.level2?.status === "Approved"
                              ? "success"
                              : "secondary"
                          }
                        >
                          L2:{" "}
                          {v.approvals?.level2?.status === "Approved"
                            ? "Signed"
                            : "Waiting"}
                        </Badge>
                      </div>
                    </td>
                    {/* <td>
                      {(canApproveL1 || canApproveL2) && (
                        <Button
                          size="sm"
                          variant="outline-success"
                          className="me-2"
                          onClick={() => handleApprove(v._id)}
                        >
                          <FaCheck /> Sign
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
                    </td> */}
                    <td>
                      {/* Check if Cancelled */}
                      {v.status === "Cancelled" ? (
                        <small className="text-danger d-block">
                          {v.cancellationReason}
                        </small>
                      ) : (
                        <div className="d-flex gap-1">
                          {/* Approve Button */}
                          {(canApproveL1 || canApproveL2) && (
                            <Button
                              size="sm"
                              variant="outline-success"
                              onClick={() => handleApprove(v._id)}
                            >
                              <FaCheck />
                            </Button>
                          )}

                          {/* Download Button */}
                          <Button
                            size="sm"
                            variant="outline-danger"
                            onClick={() =>
                              handleDownloadVoucher(v._id, v.voucherNo)
                            }
                          >
                            <FaFilePdf />
                          </Button>

                          {/* NEW: CANCEL BUTTON (Only Admin/President) */}
                          {(userInfo?.role === "admin" ||
                            userInfo?.role === "president") && (
                            <Button
                              size="sm"
                              variant="outline-dark"
                              title="Void"
                              onClick={() => handleCancelClick(v._id)}
                            >
                              <FaBan />
                            </Button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* --- MODAL 1: CREATE VOUCHER (Existing) --- */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Create Voucher</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Row className="g-2 mb-2">
              <Col md={6}>
                <Form.Label className="small">Voucher Type</Form.Label>
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
                <Form.Label className="small">Branch</Form.Label>
                <Form.Select
                  name="branch"
                  value={formData.branch}
                  onChange={handleChange}
                >
                  <option value="KarunaSri Seva Samithi">
                    KarunaSri Seva Samithi
                  </option>
                  <option value="Karunya Sindhu">Karunya Sindhu</option>
                  <option value="Karunya Bharathi">Karunya Bharathi</option>
                  <option value="Karunya Jyothi">Karunya Jyothi</option>
                  <option value="KarunaSri Seva Samithi">
                    KarunaSri Seva Samithi
                  </option>
                </Form.Select>
              </Col>
            </Row>
            <Form.Group className="mb-2">
              <Form.Label className="small">Account Head</Form.Label>
              <Form.Select
                name="accountHead"
                value={formData.accountHead}
                onChange={handleChange}
                required
              >
                <option value="">-- Select --</option>
                {accountHeads
                  .filter((a) => a.type === formData.voucherType)
                  .map((acc) => (
                    <option key={acc._id} value={acc._id}>
                      {acc.code} - {acc.name}
                    </option>
                  ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label className="small">Paid To</Form.Label>
              <Form.Control
                name="recipientName"
                value={formData.recipientName}
                onChange={handleChange}
                required
              />
            </Form.Group>
            <Row className="g-2 mb-2">
              <Col md={6}>
                <Form.Label className="small">Amount</Form.Label>
                <Form.Control
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  required
                />
              </Col>
              <Col md={6}>
                <Form.Label className="small">Mode</Form.Label>
                <Form.Select
                  name="paymentMode"
                  value={formData.paymentMode}
                  onChange={handleChange}
                >
                  <option>Cash</option>
                  <option>Cheque</option>
                  <option>Bank Transfer</option>
                  <option>UPI</option>
                </Form.Select>
              </Col>
            </Row>
            {renderPaymentFields()}
            <Form.Group className="mb-3">
              <Form.Label className="small">Description</Form.Label>
              <Form.Control
                as="textarea"
                name="description"
                value={formData.description}
                onChange={handleChange}
              />
            </Form.Group>
            <Button type="submit" variant="dark" className="w-100">
              Generate Voucher
            </Button>
          </Form>
        </Modal.Body>
      </Modal>

      {/* --- MODAL 2: TRANSFER FUNDS (NEW) --- */}
      <Modal
        show={showTransferModal}
        onHide={() => setShowTransferModal(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Inter-Branch Fund Transfer</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="alert alert-info small">
            This will create a <strong>Debit Voucher</strong> for HQ and a{" "}
            <strong>Credit Voucher</strong> for the Branch automatically.
          </div>
          <Form.Group className="mb-3">
            <Form.Label>Transfer To</Form.Label>
            <Form.Select
              value={transferData.toBranch}
              onChange={(e) =>
                setTransferData({ ...transferData, toBranch: e.target.value })
              }
            >
              <option value="Karunya Sindhu">Karunya Sindhu</option>
              <option value="Karunya Bharathi">Karunya Bharathi</option>
              <option value="Karunya Jyothi">Karunya Jyothi</option>
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Amount (₹)</Form.Label>
            <Form.Control
              type="number"
              value={transferData.amount}
              onChange={(e) =>
                setTransferData({ ...transferData, amount: e.target.value })
              }
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Payment Mode</Form.Label>
            <Form.Select
              value={transferData.paymentMode}
              onChange={(e) =>
                setTransferData({
                  ...transferData,
                  paymentMode: e.target.value,
                })
              }
            >
              <option>Bank Transfer</option>
              <option>Cheque</option>
              <option>Cash</option>
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Description / Month</Form.Label>
            <Form.Control
              value={transferData.description}
              onChange={(e) =>
                setTransferData({
                  ...transferData,
                  description: e.target.value,
                })
              }
            />
          </Form.Group>
          <Button
            variant="warning"
            className="w-100"
            onClick={handleTransferSubmit}
          >
            Transfer Funds
          </Button>
        </Modal.Body>
      </Modal>
      <Modal show={showCancelModal} onHide={() => setShowCancelModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Cancel Voucher</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="danger">
            Warning: This will void the voucher and update balances.
          </Alert>
          <Form.Group>
            <Form.Label>Reason</Form.Label>
            <Form.Control
              as="textarea"
              value={cancelData.reason}
              onChange={(e) =>
                setCancelData({ ...cancelData, reason: e.target.value })
              }
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCancelModal(false)}>
            Close
          </Button>
          <Button variant="danger" onClick={submitCancellation}>
            Confirm
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default FinanceList;
