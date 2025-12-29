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
  ProgressBar,
} from "react-bootstrap";
import { FaPlus, FaBox, FaExclamationTriangle } from "react-icons/fa";
import { FaClipboardList, FaHistory } from "react-icons/fa"; // Add FaHistory
import axios from "axios";
import { Link } from "react-router-dom";

const InventoryList = () => {
  const [items, setItems] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    itemName: "",
    category: "Food",
    isPerishable: false,
    quantity: "",
    unit: "kg",
    expiryDate: "",
  });

  const fetchInventory = useCallback(async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const { data } = await axios.get(
        "http://localhost:5000/api/inventory",
        config
      );
      setItems(data);
    } catch (error) {
      console.error(error);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchInventory();
  }, [fetchInventory]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      await axios.post("http://localhost:5000/api/inventory", formData, config);
      setShowModal(false);
      fetchInventory();
      alert("Stock Updated Successfully!");
      // eslint-disable-next-line no-unused-vars
    } catch (error) {
      alert("Error updating stock");
    }
  };

  const handleChange = (e) => {
    const value =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  return (
    <div>
      <Row className="mb-4 align-items-center">
        <Col>
          <h2
            className="text-maroon"
            style={{ fontFamily: "Playfair Display" }}
          >
            Inventory & Stock
          </h2>
          <p className="text-muted">
            Manage Food, Non-Food, and Ashram Supplies
          </p>
        </Col>
        <Col className="text-end">
          {/* History Button */}
          <Link
            to="/dashboard/inventory/history"
            className="btn btn-outline-secondary me-2"
          >
            <FaHistory /> History
          </Link>
          {/* Audit Button */}
          <Link
            to="/dashboard/inventory/audit"
            className="btn btn-outline-dark me-2"
          >
            <FaClipboardList /> Stock Audit
          </Link>{" "}
          <Button
            variant="primary"
            style={{ backgroundColor: "#581818", border: "none" }}
            onClick={() => setShowModal(true)}
          >
            <FaPlus /> Add / Update Stock
          </Button>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col md={3}>
          <Card className="p-3 text-center border-0 shadow-sm">
            <h3 className="text-success">
              {items.filter((i) => i.category === "Food").length}
            </h3>
            <small>Food Items</small>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="p-3 text-center border-0 shadow-sm">
            <h3 className="text-primary">
              {items.filter((i) => i.category === "Non-Food").length}
            </h3>
            <small>Non-Food Items</small>
          </Card>
        </Col>
      </Row>

      <Card className="shadow-sm border-0">
        <Card.Body className="p-0">
          <Table hover responsive className="align-middle mb-0">
            <thead className="bg-light">
              <tr>
                <th className="ps-4">Item Name</th>
                <th>Category</th>
                <th>Stock Level</th>
                <th>Status</th>
                <th>Expiry (If Perishable)</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item._id}>
                  <td className="ps-4 fw-bold">{item.itemName}</td>
                  <td>
                    <Badge bg="secondary">{item.category}</Badge>
                  </td>
                  <td>
                    <div className="d-flex align-items-center">
                      <span className="me-2 fw-bold">
                        {item.quantity} {item.unit}
                      </span>
                      {/* Visual Bar for stock */}
                      <ProgressBar
                        now={Math.min(item.quantity, 100)}
                        variant={item.quantity < 20 ? "danger" : "success"}
                        style={{ width: "80px", height: "5px" }}
                      />
                    </div>
                  </td>
                  <td>
                    {item.quantity < 10 ? (
                      <Badge bg="danger">
                        <FaExclamationTriangle /> Low Stock
                      </Badge>
                    ) : (
                      <Badge bg="success">In Stock</Badge>
                    )}
                  </td>
                  <td>
                    {item.isPerishable && item.expiryDate ? (
                      new Date(item.expiryDate).toLocaleDateString()
                    ) : (
                      <span className="text-muted">-</span>
                    )}
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center py-5">
                    No inventory items found
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* Add Item Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add Inventory Item</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Item Name</Form.Label>
              <Form.Control
                name="itemName"
                onChange={handleChange}
                required
                placeholder="e.g. Rice, Oil, Chairs"
              />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Category</Form.Label>
                  <Form.Select name="category" onChange={handleChange}>
                    <option>Food</option>
                    <option>Non-Food</option>
                    <option>Medical</option>
                    <option>General</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Quantity</Form.Label>
                  <Form.Control
                    type="number"
                    name="quantity"
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Unit</Form.Label>
                  <Form.Select name="unit" onChange={handleChange}>
                    <option>kg</option>
                    <option>liters</option>
                    <option>bags</option>
                    <option>pieces</option>
                    <option>boxes</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3 pt-4">
                  <Form.Check
                    type="checkbox"
                    label="Is Perishable?"
                    name="isPerishable"
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
            </Row>

            {/* Show Expiry Date only if Perishable is checked */}
            {formData.isPerishable && (
              <Form.Group className="mb-3">
                <Form.Label>Expiry Date</Form.Label>
                <Form.Control
                  type="date"
                  name="expiryDate"
                  onChange={handleChange}
                />
              </Form.Group>
            )}

            <Button type="submit" className="w-100 btn-ashram">
              Update Stock
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default InventoryList;
