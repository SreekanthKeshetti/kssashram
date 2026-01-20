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
import { FaPlus, FaCheck, FaFilePdf, FaFileDownload } from "react-icons/fa";

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
    recipientName: "", // New Field
    paymentDetails: {
      chequeNo: "",
      chequeDate: "",
      bankName: "",
      transactionId: "",
    },
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

  const handleApprove = async (id) => {
    if (!window.confirm("Confirm signature for this voucher?")) return;
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
        recipientName: "",
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

  // Helper for Payment Fields
  const renderPaymentFields = () => {
    const mode = formData.paymentMode;
    if (mode === "Cheque" || mode === "DD") {
      return (
        <Row className="bg-light p-2 rounded mb-3 border">
          <Col md={4}>
            <Form.Control
              size="sm"
              placeholder="Cheque/DD No"
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
    if (mode === "UPI" || mode === "Bank Transfer") {
      return (
        <Form.Control
          size="sm"
          className="mb-3"
          placeholder="Txn ID"
          name="transactionId"
          value={formData.paymentDetails.transactionId}
          onChange={handleChange}
        />
      );
    }
    return null;
  };

  const filteredVouchers = vouchers.filter((v) => {
    if (!dateFilter.start) return true;
    const vDate = new Date(v.createdAt);
    const start = new Date(dateFilter.start);
    const end = dateFilter.end ? new Date(dateFilter.end) : new Date();
    end.setHours(23, 59, 59);
    return vDate >= start && vDate <= end;
  });

  return (
    <div>
      <Row className="mb-4 align-items-center">
        <Col lg={6}>
          <h2
            className="text-maroon m-0"
            style={{ fontFamily: "Playfair Display" }}
          >
            Vouchers & Expenses
          </h2>
        </Col>
        <Col lg={6} className="text-end">
          <Button
            variant="primary"
            style={{ backgroundColor: "#581818" }}
            onClick={() => setShowModal(true)}
          >
            <FaPlus className="me-2" /> Create Voucher
          </Button>
        </Col>
      </Row>

      <Card className="shadow-sm border-0">
        <Card.Body className="p-0">
          <Table hover responsive className="align-middle mb-0 text-nowrap">
            <thead className="bg-light">
              <tr>
                <th className="ps-3">Date</th>
                <th>Voucher No</th>
                <th>Payee / Recipient</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredVouchers.map((v) => {
                // Determine Approval Rights
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
                    <td className="ps-3 small text-muted">
                      {new Date(v.createdAt).toLocaleDateString()}
                    </td>
                    <td className="fw-bold">{v.voucherNo}</td>
                    <td>
                      {v.recipientName || "-"}
                      <div className="small text-muted">
                        {v.accountHead?.name}
                      </div>
                    </td>
                    <td className="fw-bold text-danger">
                      ₹{v.amount.toLocaleString()}
                    </td>

                    {/* STATUS BADGE LOGIC */}
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

                    <td>
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
                      <Button size="sm" variant="outline-danger">
                        <FaFilePdf />
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* Modal */}
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
                        {acc.name}
                      </option>
                    ))}
                </Form.Select>
              </Col>
            </Row>

            <Form.Group className="mb-2">
              <Form.Label className="small">Recipient / Payee Name</Form.Label>
              <Form.Control
                name="recipientName"
                value={formData.recipientName}
                onChange={handleChange}
                required
                placeholder="Who is receiving money?"
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

            <Form.Control
              as="textarea"
              name="description"
              placeholder="Narration / Description"
              value={formData.description}
              onChange={handleChange}
              className="mb-3"
            />

            <Button type="submit" variant="dark" className="w-100">
              Generate Voucher
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default FinanceList;
