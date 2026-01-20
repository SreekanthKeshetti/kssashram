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
} from "react-bootstrap";
import {
  FaPlus,
  FaCheck,
  FaFilePdf,
  FaFileDownload,
  FaBalanceScale,
} from "react-icons/fa";
import { Link } from "react-router-dom";

const FinanceList = () => {
  const [vouchers, setVouchers] = useState([]);
  const [accountHeads, setAccountHeads] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [userInfo, setUserInfo] = useState(null);

  const [formData, setFormData] = useState({
    voucherType: "Debit",
    accountHead: "",
    amount: "",
    description: "",
    paymentMode: "Cash",
  });
  const [dateFilter, setDateFilter] = useState({ start: "", end: "" });

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("userInfo"));
    setUserInfo(user);
    if (user) {
      fetchVouchers(user);
      fetchAccountHeads(user);
    }
  }, []);

  const fetchVouchers = async (user) => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get(
        `${BASE_URL}/api/finance/vouchers`,
        config
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

  // --- TALLY EXPORT ---
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

    // changing the vouchers.map to filteredVouchers.map.
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
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `Tally_Export_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      await axios.post(`${BASE_URL}/api/finance/vouchers`, formData, config);
      setShowModal(false);
      fetchVouchers(userInfo);
      alert("Voucher Created Successfully!");
      setFormData({
        voucherType: "Debit",
        accountHead: "",
        amount: "",
        description: "",
        paymentMode: "Cash",
      });
    } catch (error) {
      alert("Error creating voucher");
    }
  };

  const handleApprove = async (id) => {
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      await axios.put(
        `${BASE_URL}/api/finance/vouchers/${id}/approve`,
        {},
        config
      );
      fetchVouchers(userInfo);
      alert("Approval Recorded!");
    } catch (error) {
      alert(error.response?.data?.message || "Error approving");
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const filteredAccounts = accountHeads.filter(
    (acc) => acc.type === formData.voucherType
  );

  const filteredVouchers = vouchers.filter((v) => {
    let matchesDate = true;
    if (dateFilter.start) {
      matchesDate = new Date(v.createdAt) >= new Date(dateFilter.start);
    }
    if (matchesDate && dateFilter.end) {
      const endDate = new Date(dateFilter.end);
      endDate.setHours(23, 59, 59, 999);
      matchesDate = new Date(v.createdAt) <= endDate;
    }
    return matchesDate;
  });

  return (
    <div>
      {/* <Row className="mb-4 align-items-center">
        <Col>
          <h2
            className="text-maroon"
            style={{ fontFamily: "Playfair Display" }}
          >
            Finance & Accounts
          </h2>
        </Col>
        <Col className="text-end">
          <Button variant="success" className="me-2" onClick={handleExport}>
            <FaFileDownload /> Tally CSV
          </Button>
          <Button
            variant="primary"
            style={{ backgroundColor: "#581818", border: "none" }}
            onClick={() => setShowModal(true)}
          >
            <FaPlus /> Create Voucher
          </Button>
        </Col>
      </Row> */}
      <Row className="mb-4 align-items-center">
        {/* Title: Full width on mobile, 5 cols on laptop */}
        <Col lg={5} xs={12} className="mb-3 mb-lg-0">
          <h2
            className="text-maroon m-0"
            style={{ fontFamily: "Playfair Display" }}
          >
            Finance & Accounts
          </h2>
          <p className="text-muted m-0 small">
            Manage Vouchers (Debit/Credit) and Expenses
          </p>
        </Col>

        {/* Buttons: Full width on mobile, 7 cols on laptop */}
        <Col lg={7} xs={12}>
          <div className="d-flex flex-wrap gap-2 justify-content-lg-end justify-content-start">
            {/* Reconcile Button */}
            {/* <Link
              to="/dashboard/finance/reconcile"
              className="btn btn-outline-dark shadow-sm flex-grow-1 flex-lg-grow-0 text-decoration-none d-flex align-items-center justify-content-center"
            >
              <FaBalanceScale className="me-2" /> Reconcile Cash
            </Link> */}

            {/* Tally CSV Export */}
            <Button
              variant="success"
              className="shadow-sm flex-grow-1 flex-lg-grow-0"
              onClick={handleExport}
            >
              <FaFileDownload className="me-2" /> Download Tally CSV
            </Button>

            {/* Create Voucher */}
            <Button
              variant="primary"
              className="shadow-sm flex-grow-1 flex-lg-grow-0"
              style={{ backgroundColor: "#581818", border: "none" }}
              onClick={() => setShowModal(true)}
            >
              <FaPlus className="me-2" /> Create Voucher
            </Button>
          </div>
        </Col>
      </Row>
      <Row className="mb-3">
        <Col md={4} lg={3} className="mb-2 mb-md-0">
          <Form.Label className="me-2 fw-bold">Filter by Date:</Form.Label>
        </Col>

        <Col md={8}>
          <div className="d-flex gap-2 justify-content-md-end align-items-center bg-light p-2 rounded border">
            <span className="fw-bold text-muted small">Filter Date:</span>
            <Form.Control
              type="date"
              size="sm"
              value={dateFilter.start}
              onChange={(e) =>
                setDateFilter({ ...dateFilter, start: e.target.value })
              }
              className="w-auto"
            />
            <span className="text-muted">-to-</span>
            <Form.Control
              type="date"
              size="sm"
              value={dateFilter.end}
              onChange={(e) =>
                setDateFilter({ ...dateFilter, end: e.target.value })
              }
              className="w-auto"
            />
            {/* Clear Button */}
            {(dateFilter.start || dateFilter.end) && (
              <Button
                variant="link"
                className="text-danger p-0 ms-1 text-decoration-none"
                size="sm"
                onClick={() => setDateFilter({ start: "", end: "" })}
              >
                Clear
              </Button>
            )}
          </div>
        </Col>
      </Row>

      <Card className="shadow-sm border-0">
        <Card.Body className="p-0">
          <Table hover responsive className="align-middle mb-0">
            <thead className="bg-light">
              <tr>
                <th className="ps-4">Date</th>
                <th className="ps-4">Voucher No</th>
                <th>Code</th>
                <th>Ledger Name</th>
                <th>Amount</th>
                <th>Prepared By</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {/* here am using the filtered vouchers instead of vouchers */}
              {filteredVouchers.map((v) => {
                // --- LOGIC MOVED INSIDE THE MAP FUNCTION ---
                // Check if the current logged-in user has already approved this voucher
                const hasApproved =
                  v.approvedBy &&
                  v.approvedBy.some((u) => u._id === userInfo?._id);

                // Check if user is a committee member authorized to approve
                const isCommittee = [
                  "admin",
                  "president",
                  "secretary",
                  "treasurer",
                ].includes(userInfo?.role);
                // -------------------------------------------

                return (
                  <tr key={v._id}>
                    {/* --- NEW DATE CELL --- */}
                    <td
                      className="ps-4 text-muted"
                      style={{ fontSize: "0.9rem" }}
                    >
                      {new Date(v.createdAt).toLocaleDateString()}
                      <div
                        className="small text-muted"
                        style={{ fontSize: "0.75rem" }}
                      >
                        {new Date(v.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </td>
                    <td className="ps-4 text-muted small">{v.voucherNo}</td>
                    <td>
                      <Badge bg="secondary">{v.accountHead?.code}</Badge>
                    </td>
                    <td className="fw-bold">{v.accountHead?.name}</td>
                    <td>₹{v.amount.toLocaleString()}</td>
                    <td className="small text-muted">{v.preparedBy?.name}</td>

                    {/* Status Column */}
                    <td>
                      {v.status === "Approved" ? (
                        <Badge bg="success">Approved</Badge>
                      ) : (
                        <Badge bg="warning" text="dark">
                          {v.status === "Partially Approved"
                            ? "1/2 Approvals"
                            : "Pending (0/2)"}
                        </Badge>
                      )}
                    </td>

                    {/* Action Column */}
                    <td>
                      <div className="d-flex gap-2">
                        {/* Approve Button Logic:
                            Show ONLY if:
                            1. Voucher is NOT fully approved yet
                            2. User is a Committee Member
                            3. User has NOT already approved it
                        */}
                        {v.status !== "Approved" &&
                        isCommittee &&
                        !hasApproved ? (
                          <Button
                            size="sm"
                            variant="outline-success"
                            onClick={() => handleApprove(v._id)}
                            title="Click to Sign"
                          >
                            <FaCheck /> Sign
                          </Button>
                        ) : null}

                        {/* Download PDF Button */}
                        <Button
                          size="sm"
                          variant="outline-danger"
                          title="Download Voucher"
                          onClick={async () => {
                            try {
                              const config = {
                                headers: {
                                  Authorization: `Bearer ${userInfo.token}`,
                                },
                                responseType: "blob",
                              };
                              const response = await axios.get(
                                `${BASE_URL}/api/finance/vouchers/${v._id}/pdf`,
                                config
                              );

                              const url = window.URL.createObjectURL(
                                new Blob([response.data])
                              );
                              const link = document.createElement("a");
                              link.href = url;
                              link.setAttribute(
                                "download",
                                `${v.voucherNo}.pdf`
                              );
                              document.body.appendChild(link);
                              link.click();
                            } catch (err) {
                              alert("Error downloading voucher");
                            }
                          }}
                        >
                          <FaFilePdf />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* Create Voucher Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Create Voucher</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Voucher Type</Form.Label>
              <Form.Select
                name="voucherType"
                onChange={handleChange}
                value={formData.voucherType}
              >
                <option value="Debit">Debit (Expense)</option>
                <option value="Credit">Credit (Income)</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Account Head (Ledger)</Form.Label>
              <Form.Select name="accountHead" onChange={handleChange} required>
                <option value="">-- Select Account Code --</option>
                {filteredAccounts.map((acc) => (
                  <option key={acc._id} value={acc._id}>
                    {acc.code} - {acc.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Amount (₹)</Form.Label>
                  <Form.Control
                    type="number"
                    name="amount"
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Payment Mode</Form.Label>
                  <Form.Select name="paymentMode" onChange={handleChange}>
                    <option>Cash</option>
                    <option>Bank Transfer</option>
                    <option>Cheque</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Narration</Form.Label>
              <Form.Control
                as="textarea"
                name="description"
                onChange={handleChange}
              />
            </Form.Group>

            <Button type="submit" className="w-100 btn-ashram">
              Generate Voucher
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default FinanceList;
