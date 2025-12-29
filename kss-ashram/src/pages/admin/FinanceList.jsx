/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/immutability */
import React, { useEffect, useState } from "react";
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
// Added FaFileDownload for the export button
import {
  FaPlus,
  FaCheck,
  FaFilePdf,
  FaFileDownload,
  FaBalanceScale,
} from "react-icons/fa";
import axios from "axios";
import { Link } from "react-router-dom"; // Ensure Link is imported

const FinanceList = () => {
  const [vouchers, setVouchers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [userInfo, setUserInfo] = useState(null);

  // Form Data
  const [formData, setFormData] = useState({
    voucherType: "Debit",
    ledgerName: "",
    amount: "",
    description: "",
    paymentMode: "Cash",
  });

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("userInfo"));
    setUserInfo(user);
    if (user) fetchVouchers(user);
  }, []);

  const fetchVouchers = async (user) => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get(
        "http://localhost:5000/api/finance/vouchers",
        config
      );
      setVouchers(data);
    } catch (error) {
      console.error(error);
    }
  };

  // --- NEW FUNCTION: EXPORT TO CSV (TALLY FORMAT) ---
  const handleExport = () => {
    if (vouchers.length === 0) {
      alert("No vouchers to export.");
      return;
    }

    // 1. Define Headers (Standard Accounting Format)
    const headers = [
      "Date",
      "Voucher No",
      "Voucher Type",
      "Ledger Name",
      "Amount",
      "Payment Mode",
      "Narration (Description)",
      "Status",
    ];

    // 2. Map Data to CSV Rows
    const rows = vouchers.map((v) => [
      new Date(v.createdAt).toLocaleDateString(), // Date
      v.voucherNo,
      v.voucherType,
      `"${v.ledgerName}"`, // Wrap in quotes to handle commas inside names
      v.amount,
      v.paymentMode,
      `"${v.description || ""}"`, // Wrap narration in quotes
      v.status,
    ]);

    // 3. Combine Headers and Rows
    const csvContent =
      "data:text/csv;charset=utf-8," +
      headers.join(",") +
      "\n" +
      rows.map((e) => e.join(",")).join("\n");

    // 4. Trigger Download
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
  // --------------------------------------------------

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      await axios.post(
        "http://localhost:5000/api/finance/vouchers",
        formData,
        config
      );
      setShowModal(false);
      fetchVouchers(userInfo);
      alert("Voucher Created Successfully!");
      setFormData({
        voucherType: "Debit",
        ledgerName: "",
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
        `http://localhost:5000/api/finance/vouchers/${id}/approve`,
        {},
        config
      );
      fetchVouchers(userInfo);
      alert("Voucher Approved!");
    } catch (error) {
      alert("Error approving");
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div>
      <Row className="mb-4 align-items-center">
        <Col>
          <h2
            className="text-maroon"
            style={{ fontFamily: "Playfair Display" }}
          >
            Finance & Accounts
          </h2>
          <p className="text-muted">
            Manage Vouchers (Debit/Credit) and Expenses
          </p>
        </Col>
        <Col className="text-end">
          <Link
            to="/dashboard/finance/reconcile"
            className="btn btn-outline-dark me-2"
          >
            <FaBalanceScale /> Reconcile Cash
          </Link>
          {/* --- EXPORT BUTTON --- */}
          <Button variant="success" className="me-2" onClick={handleExport}>
            <FaFileDownload /> Download Tally CSV
          </Button>

          <Button
            variant="primary"
            style={{ backgroundColor: "#581818", border: "none" }}
            onClick={() => setShowModal(true)}
          >
            <FaPlus /> Create Voucher
          </Button>
        </Col>
      </Row>

      <Card className="shadow-sm border-0">
        <Card.Body className="p-0">
          <Table hover responsive className="align-middle mb-0">
            <thead className="bg-light">
              <tr>
                <th className="ps-4">Voucher No</th>
                <th>Type</th>
                <th>Ledger / Head</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {vouchers.map((v) => (
                <tr key={v._id}>
                  <td className="ps-4 text-muted small">{v.voucherNo}</td>
                  <td>
                    {v.voucherType === "Credit" ? (
                      <Badge bg="success">Credit (Income)</Badge>
                    ) : (
                      <Badge bg="danger">Debit (Expense)</Badge>
                    )}
                  </td>
                  <td className="fw-bold">{v.ledgerName}</td>
                  <td>₹{v.amount.toLocaleString()}</td>
                  <td>
                    {v.status === "Approved" ? (
                      <Badge bg="success">Approved</Badge>
                    ) : (
                      <Badge bg="warning" text="dark">
                        Pending
                      </Badge>
                    )}
                  </td>
                  <td>
                    <div className="d-flex gap-2">
                      {/* Approve Button (Admin Only) */}
                      {v.status === "Pending" && userInfo?.role === "admin" ? (
                        <Button
                          size="sm"
                          variant="outline-success"
                          onClick={() => handleApprove(v._id)}
                          title="Approve"
                        >
                          <FaCheck />
                        </Button>
                      ) : null}

                      {/* Download Individual PDF Button */}
                      <Button
                        size="sm"
                        variant="outline-danger"
                        title="Download Voucher PDF"
                        onClick={async () => {
                          try {
                            const config = {
                              headers: {
                                Authorization: `Bearer ${userInfo.token}`,
                              },
                              responseType: "blob",
                            };
                            const response = await axios.get(
                              `http://localhost:5000/api/finance/vouchers/${v._id}/pdf`,
                              config
                            );

                            const url = window.URL.createObjectURL(
                              new Blob([response.data])
                            );
                            const link = document.createElement("a");
                            link.href = url;
                            link.setAttribute("download", `${v.voucherNo}.pdf`);
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
              ))}
              {vouchers.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center py-5">
                    No vouchers found
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* Create Voucher Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Create Expenditure Voucher</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Voucher Type</Form.Label>
              <Form.Select name="voucherType" onChange={handleChange}>
                <option value="Debit">Debit (Expense)</option>
                <option value="Credit">Credit (Income)</option>
                <option value="Journal">Journal (Adjustment)</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Ledger Name (Expense Head)</Form.Label>
              <Form.Control
                name="ledgerName"
                onChange={handleChange}
                required
                placeholder="e.g. Vegetables, Salary, Electricity"
              />
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
                    <option>UPI</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
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
