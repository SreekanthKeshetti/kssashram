/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import axios from "axios";
import BASE_URL from "../../apiConfig";
import {
  Table,
  Button,
  Card,
  Row,
  Col,
  Form,
  Badge,
  Alert,
} from "react-bootstrap";
import { FaClipboardCheck, FaHistory } from "react-icons/fa";
import { useNavigate } from "react-router-dom"; // 1. Import this

const StockAudit = () => {
  const navigate = useNavigate(); // 2. Initialize hook
  const [items, setItems] = useState([]);
  const [auditData, setAuditData] = useState({}); // Stores physical qty inputs
  const [remarks, setRemarks] = useState({}); // Stores remarks
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const { data } = await axios.get(`${BASE_URL}/api/inventory`, config);
      setItems(data);

      // Initialize audit data with current system values
      const initialData = {};
      data.forEach((item) => {
        initialData[item._id] = item.quantity;
      });
      setAuditData(initialData);
    } catch (error) {
      console.error(error);
    }
  };

  const handleQtyChange = (id, val) => {
    setAuditData({ ...auditData, [id]: Number(val) });
  };

  const handleRemarkChange = (id, val) => {
    setRemarks({ ...remarks, [id]: val });
  };

  // const handleSubmitAudit = async () => {
  //   if (
  //     !window.confirm(
  //       "This will update the live stock quantities. Are you sure?"
  //     )
  //   )
  //     return;

  //   setLoading(true);
  //   try {
  //     const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  //     const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

  //     // Prepare Payload
  //     const auditItems = items.map((item) => ({
  //       itemId: item._id,
  //       itemName: item.itemName,
  //       systemQty: item.quantity,
  //       physicalQty: auditData[item._id],
  //       remark: remarks[item._id] || "",
  //     }));

  //     await axios.post(
  //       "http://localhost:5000/api/inventory/audit",
  //       { items: auditItems },
  //       config
  //     );

  //     alert("Audit Completed! Stock Adjusted.");
  //     fetchInventory(); // Refresh data
  //     setRemarks({});
  //   } catch (error) {
  //     alert("Error submitting audit");
  //   }
  //   setLoading(false);
  // };
  const handleSubmitAudit = async () => {
    if (
      !window.confirm(
        "This will update the live stock quantities. Are you sure?"
      )
    )
      return;

    setLoading(true);
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

      const auditItems = items.map((item) => ({
        itemId: item._id,
        itemName: item.itemName,
        systemQty: item.quantity,
        physicalQty:
          auditData[item._id] !== undefined
            ? auditData[item._id]
            : item.quantity,
        remark: remarks[item._id] || "",
      }));

      await axios.post(
        `${BASE_URL}/api/inventory/audit`,
        { items: auditItems },
        config
      );

      alert("Audit Completed Successfully!");

      // 3. REDIRECT to History Page immediately
      navigate("/dashboard/inventory/history");
    } catch (error) {
      alert("Error submitting audit");
      setLoading(false);
    }
  };

  return (
    <div>
      <Row className="mb-4 align-items-center">
        <Col>
          <h2
            className="text-maroon"
            style={{ fontFamily: "Playfair Display" }}
          >
            Stock Reconciliation
          </h2>
          <p className="text-muted">Compare System Stock vs Physical Stock</p>
        </Col>
        <Col className="text-end">
          <Button
            variant="success"
            onClick={handleSubmitAudit}
            disabled={loading}
          >
            <FaClipboardCheck /> {loading ? "Saving..." : "Finalize Audit"}
          </Button>
        </Col>
      </Row>

      <Card className="shadow-sm border-0">
        <Card.Body className="p-0">
          <Table hover responsive className="align-middle mb-0">
            <thead className="bg-light">
              <tr>
                <th className="ps-4">Item Name</th>
                <th>System Stock</th>
                <th style={{ width: "150px" }}>Physical Stock</th>
                <th>Difference</th>
                <th>Remark</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const physical =
                  auditData[item._id] !== undefined
                    ? auditData[item._id]
                    : item.quantity;
                const diff = physical - item.quantity;

                return (
                  <tr
                    key={item._id}
                    className={diff !== 0 ? "bg-light-warning" : ""}
                  >
                    <td className="ps-4 fw-bold">
                      {item.itemName}{" "}
                      <Badge bg="secondary" className="ms-1">
                        {item.unit}
                      </Badge>
                    </td>
                    <td>{item.quantity}</td>
                    <td>
                      <Form.Control
                        type="number"
                        value={physical}
                        onChange={(e) =>
                          handleQtyChange(item._id, e.target.value)
                        }
                        style={{
                          borderColor: diff !== 0 ? "#ffc107" : "#ced4da",
                        }}
                      />
                    </td>
                    <td>
                      {diff === 0 ? (
                        <span className="text-success fw-bold">Match</span>
                      ) : (
                        <span
                          className={
                            diff < 0
                              ? "text-danger fw-bold"
                              : "text-primary fw-bold"
                          }
                        >
                          {diff > 0 ? `+${diff}` : diff}
                        </span>
                      )}
                    </td>
                    <td>
                      {diff !== 0 && (
                        <Form.Control
                          size="sm"
                          placeholder="Reason (e.g. Spoilage)"
                          value={remarks[item._id] || ""}
                          onChange={(e) =>
                            handleRemarkChange(item._id, e.target.value)
                          }
                        />
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </div>
  );
};

export default StockAudit;
