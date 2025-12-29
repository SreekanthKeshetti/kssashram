// eslint-disable-next-line no-unused-vars
import React, { useEffect, useState, useCallback } from "react";
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
// import { FaPlus, FaCheck } from "react-icons/fa";
import axios from "axios";
import { FaPlus, FaCheck, FaFileDownload, FaFilePdf } from "react-icons/fa"; // Added FaFilePdf

const FinanceList = () => {
  const [vouchers, setVouchers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [userInfo, setUserInfo] = useState(null); // To store logged-in user details

  // Form Data
  const [formData, setFormData] = useState({
    voucherType: "Debit",
    ledgerName: "",
    amount: "",
    description: "",
    paymentMode: "Cash",
  });

  // 1. Load User Info & Fetch Data
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("userInfo"));
    setUserInfo(user);
    // eslint-disable-next-line react-hooks/immutability
    fetchVouchers(user);
  }, []);

  const fetchVouchers = async (user) => {
    try {
      if (!user) return;
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

  // 2. Handle Create Voucher
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
      // eslint-disable-next-line no-unused-vars
    } catch (error) {
      alert("Error creating voucher");
    }
  };

  // 3. Handle Approve (Admin Only)
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
      // eslint-disable-next-line no-unused-vars
    } catch (error) {
      alert("Error approving: You might not be an Admin.");
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
                  {/* <td>
                    
                    {v.status === "Pending" && userInfo?.role === "admin" ? (
                      <Button
                        size="sm"
                        variant="outline-success"
                        onClick={() => handleApprove(v._id)}
                      >
                        <FaCheck /> Approve
                      </Button>
                    ) : v.status === "Pending" ? (
                      <span className="text-muted small fst-italic">
                        Waiting Approval
                      </span>
                    ) : (
                      <span className="text-success small fw-bold">
                        Verified
                      </span>
                    )}
                  </td> */}
                  <td>
                    <div className="d-flex gap-2">
                      {/* 1. Approve Button (Admin Only) */}
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

                      {/* 2. Download Voucher PDF Button */}
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
                            // eslint-disable-next-line no-unused-vars
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
