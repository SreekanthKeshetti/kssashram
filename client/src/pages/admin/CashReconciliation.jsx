/* eslint-disable react-hooks/immutability */
/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import axios from "axios";
import BASE_URL from "../../apiConfig";
import { Card, Row, Col, Form, Button, Alert, Spinner } from "react-bootstrap";
import { FaBalanceScale, FaArrowLeft, FaSave } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";

const CashReconciliation = () => {
  const navigate = useNavigate();
  const [systemBalance, setSystemBalance] = useState(0);
  const [physicalBalance, setPhysicalBalance] = useState("");
  const [remark, setRemark] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBalance();
  }, []);

  const fetchBalance = async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const { data } = await axios.get(
        `${BASE_URL}/api/finance/cash-balance`,
        config
      );
      setSystemBalance(data.systemBalance);
      setLoading(false);
    } catch (error) {
      alert("Error fetching balance");
      setLoading(false);
    }
  };

  const handleReconcile = async () => {
    if (physicalBalance === "") return alert("Enter physical balance");
    const diff = Number(physicalBalance) - systemBalance;

    if (diff === 0) return alert("Balances match! No adjustment needed.");
    if (!remark) return alert("Please provide a reason for the mismatch.");

    if (
      !window.confirm(
        `This will create an adjustment voucher for Rs. ${Math.abs(
          diff
        )}. Proceed?`
      )
    )
      return;

    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

      await axios.post(
        `${BASE_URL}/api/finance/reconcile`,
        {
          systemBalance,
          physicalBalance: Number(physicalBalance),
          remark,
        },
        config
      );

      alert("Reconciliation Successful! Adjustment Voucher Created.");
      navigate("/dashboard/finance"); // Go back to list
    } catch (error) {
      alert("Error posting adjustment");
    }
  };

  if (loading)
    return (
      <div className="text-center py-5">
        <Spinner animation="border" />
      </div>
    );

  const difference =
    physicalBalance !== "" ? Number(physicalBalance) - systemBalance : 0;

  return (
    <div>
      <div className="d-flex align-items-center gap-3 mb-4">
        <Link
          to="/dashboard/finance"
          className="btn btn-outline-secondary btn-sm"
        >
          <FaArrowLeft />
        </Link>
        <div>
          <h2
            className="text-maroon m-0"
            style={{ fontFamily: "Playfair Display" }}
          >
            Cash Reconciliation
          </h2>
          <p className="text-muted m-0">
            Compare System Books vs Physical Cash
          </p>
        </div>
      </div>

      <Row className="justify-content-center">
        <Col md={8}>
          <Card className="shadow-lg border-0">
            <Card.Body className="p-5">
              {/* System Balance Display */}
              <div className="text-center mb-4 p-3 bg-light rounded">
                <h5 className="text-muted">Expected System Cash Balance</h5>
                <h1 className="fw-bold text-maroon">
                  ₹ {systemBalance.toLocaleString()}
                </h1>
              </div>

              <Form>
                <Form.Group className="mb-4">
                  <Form.Label className="fw-bold">
                    Physical Cash Count (Actual)
                  </Form.Label>
                  <Form.Control
                    type="number"
                    size="lg"
                    placeholder="Enter amount counted in drawer"
                    value={physicalBalance}
                    onChange={(e) => setPhysicalBalance(e.target.value)}
                  />
                </Form.Group>

                {/* Difference Indicator */}
                {physicalBalance !== "" && (
                  <div
                    className={`alert ${
                      difference === 0 ? "alert-success" : "alert-warning"
                    } text-center`}
                  >
                    {difference === 0 ? (
                      <strong>
                        <FaBalanceScale /> Perfect Match!
                      </strong>
                    ) : (
                      <div>
                        <strong>Mismatch Detected: </strong>
                        <span
                          className={
                            difference < 0
                              ? "text-danger fw-bold"
                              : "text-success fw-bold"
                          }
                        >
                          {difference > 0
                            ? `+ ₹${difference}`
                            : `- ₹${Math.abs(difference)}`}
                        </span>
                        <p className="mb-0 small mt-1">
                          {difference < 0
                            ? "Cash Shortage (Will create Expense Voucher)"
                            : "Excess Cash (Will create Income Voucher)"}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {difference !== 0 && (
                  <Form.Group className="mb-4">
                    <Form.Label>Reason for Discrepancy</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      placeholder="e.g. Rounding error, Lost receipt, Found loose change"
                      value={remark}
                      onChange={(e) => setRemark(e.target.value)}
                    />
                  </Form.Group>
                )}

                <div className="d-grid">
                  <Button
                    variant={difference === 0 ? "success" : "danger"}
                    size="lg"
                    disabled={difference === 0 || !physicalBalance}
                    onClick={handleReconcile}
                  >
                    {difference === 0
                      ? "Books are Balanced"
                      : "Post Adjustment Voucher"}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default CashReconciliation;
