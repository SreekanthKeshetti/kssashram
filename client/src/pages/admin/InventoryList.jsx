/* eslint-disable react-hooks/immutability */

/* eslint-disable no-unused-vars */
import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
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
  ProgressBar,
  Tabs,
  Tab,
  Alert,
} from "react-bootstrap";
import {
  FaPlus,
  FaExclamationTriangle,
  FaHistory,
  FaClipboardList,
  FaShoppingCart,
  FaGift,
  FaListAlt,
  FaTruck,
  FaBoxOpen,
  FaCheckCircle,
  FaTrash,
  FaUtensils,
  FaChartBar,
  FaFileDownload,
  FaUser,
  FaPrint,
} from "react-icons/fa";
import axios from "axios";

const InventoryList = () => {
  const [activeTab, setActiveTab] = useState("stock");
  const [items, setItems] = useState([]);
  const [transfers, setTransfers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  // --- MODAL STATES ---
  const [showModal, setShowModal] = useState(false); // Add Stock
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showIssueModal, setShowIssueModal] = useState(false); // Transfer
  const [showConsumeModal, setShowConsumeModal] = useState(false); // Consumption
  const [showReportModal, setShowReportModal] = useState(false); // Analysis Report

  // --- SELECTED ITEMS ---
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedItemHistory, setSelectedItemHistory] = useState(null);

  // --- FORM DATA: ADD STOCK (FULL FIELDS) ---
  const [formData, setFormData] = useState({
    itemName: "",
    category: "Food",
    isPerishable: false,
    quantity: "",
    unit: "kg",
    expiryDate: "",
    sourceType: "Purchase",
    vendor: "", // Used for Vendor Name OR Donor Name
    unitCost: "",
    totalCost: "",
    invoiceNo: "",
    // NEW FIELDS
    donorPhone: "",
    donorAddress: "",
  });

  // --- FORM DATA: ISSUE SLIP ---
  const [issueData, setIssueData] = useState({
    toBranch: "Karunya Sindhu",
    remarks: "",
    items: [{ itemName: "", quantity: "", unit: "kg" }],
  });

  // --- FORM DATA: CONSUMPTION ---
  const [consumeData, setConsumeData] = useState({ quantity: "", reason: "" });

  // --- FORM DATA: REPORT ---
  const [reportParams, setReportParams] = useState({
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
    branch: "",
  });
  const [reportData, setReportData] = useState([]);

  // --- INITIAL LOAD ---
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("userInfo"));
    setCurrentUser(user);
    if (user) {
      fetchInventory(user);
      fetchTransfers(user);
      setReportParams((prev) => ({
        ...prev,
        branch: user.branch || "KarunaSri Seva Samithi",
      }));
      // NEW: Set default category based on role
      if (user.role === "warden_nonfood") {
        setFormData((prev) => ({ ...prev, category: "Non-Food" }));
      }
    }
  }, []);

  // --- API CALLS ---
  const fetchInventory = async (user) => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get(`${BASE_URL}/api/inventory`, config);
      setItems(data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchTransfers = async (user) => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get(
        `${BASE_URL}/api/inventory/transfer`,
        config,
      );
      setTransfers(data);
    } catch (error) {
      console.error(error);
    }
  };

  // --- HANDLER: ADD STOCK ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.itemName || !formData.quantity)
      return alert("Please enter Item Name and Quantity");

    try {
      const config = {
        headers: { Authorization: `Bearer ${currentUser.token}` },
      };
      const payload = { ...formData, quantity: Number(formData.quantity) };

      await axios.post(`${BASE_URL}/api/inventory`, payload, config);

      setShowModal(false);
      fetchInventory(currentUser);
      alert("Stock Updated Successfully!");

      // Reset Form
      setFormData({
        itemName: "",
        category: "Food",
        isPerishable: false,
        quantity: "",
        unit: "kg",
        expiryDate: "",
        sourceType: "Purchase",
        vendor: "",
        unitCost: "",
        totalCost: "",
        invoiceNo: "",
      });
    } catch (error) {
      alert(error.response?.data?.message || "Error updating stock");
    }
  };

  const handleChange = (e) => {
    const value =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;

    // Auto-calculate Total Cost
    if (e.target.name === "unitCost" || e.target.name === "quantity") {
      const qty = e.target.name === "quantity" ? value : formData.quantity;
      const cost = e.target.name === "unitCost" ? value : formData.unitCost;

      setFormData((prev) => ({
        ...prev,
        [e.target.name]: value,
        totalCost: qty && cost ? (qty * cost).toFixed(2) : prev.totalCost,
      }));
    } else {
      setFormData({ ...formData, [e.target.name]: value });
    }
  };

  // --- HANDLER: ISSUE STOCK (TRANSFER) ---
  const handleIssueStock = async () => {
    const validItems = issueData.items.filter((i) => i.itemName && i.quantity);
    if (validItems.length === 0)
      return alert("Please add at least one item to issue.");

    try {
      const config = {
        headers: { Authorization: `Bearer ${currentUser.token}` },
      };
      await axios.post(
        `${BASE_URL}/api/inventory/transfer/issue`,
        { ...issueData, items: validItems },
        config,
      );

      alert("Issue Slip Created! Stock deducted from your branch.");
      setShowIssueModal(false);
      fetchInventory(currentUser);
      fetchTransfers(currentUser);
      setIssueData({
        toBranch: "Karunya Sindhu",
        remarks: "",
        items: [{ itemName: "", quantity: "", unit: "kg" }],
      });
    } catch (error) {
      alert(error.response?.data?.message || "Error creating slip");
    }
  };

  const handleIssueItemChange = (index, field, value) => {
    const updated = [...issueData.items];
    updated[index][field] = value;
    setIssueData({ ...issueData, items: updated });
  };
  const addIssueRow = () => {
    setIssueData({
      ...issueData,
      items: [...issueData.items, { itemName: "", quantity: "", unit: "kg" }],
    });
  };
  const removeIssueRow = (index) => {
    const updated = issueData.items.filter((_, i) => i !== index);
    setIssueData({ ...issueData, items: updated });
  };

  // --- HANDLER: RECEIVE STOCK ---
  const handleReceiveStock = async (transferId) => {
    if (
      !window.confirm(
        "Confirm receipt of goods? This will update your branch stock.",
      )
    )
      return;
    try {
      const config = {
        headers: { Authorization: `Bearer ${currentUser.token}` },
      };
      await axios.put(
        `${BASE_URL}/api/inventory/transfer/receive`,
        { transferId },
        config,
      );

      alert("Goods Received! Stock updated.");
      fetchInventory(currentUser);
      fetchTransfers(currentUser);
    } catch (error) {
      alert(error.response?.data?.message || "Error receiving stock");
    }
  };

  // --- HANDLER: CONSUME STOCK ---
  const handleConsumeStock = async (e) => {
    e.preventDefault();
    try {
      const config = {
        headers: { Authorization: `Bearer ${currentUser.token}` },
      };
      await axios.post(
        `${BASE_URL}/api/inventory/consume`,
        {
          itemId: selectedItem._id,
          quantity: Number(consumeData.quantity),
          reason: consumeData.reason,
        },
        config,
      );

      alert("Consumption Recorded");
      setShowConsumeModal(false);
      setConsumeData({ quantity: "", reason: "" });
      fetchInventory(currentUser);
    } catch (error) {
      alert(error.response?.data?.message || "Error");
    }
  };

  // --- HANDLER: GENERATE REPORT ---
  const handleGenerateReport = async () => {
    try {
      const config = {
        headers: { Authorization: `Bearer ${currentUser.token}` },
      };
      const { data } = await axios.get(
        `${BASE_URL}/api/inventory/report?startDate=${reportParams.startDate}&endDate=${reportParams.endDate}&branch=${reportParams.branch}`,
        config,
      );
      setReportData(data);
    } catch (error) {
      alert("Error generating report");
    }
  };

  const downloadReportCSV = () => {
    if (reportData.length === 0) return;
    const headers = [
      "Item",
      "Unit",
      "Category",
      "Opening Balance",
      "Inward (Purchase/Transfer)",
      "Outward (Issue/Used)",
      "Closing Balance",
    ];
    const rows = reportData.map((r) => [
      `"${r.itemName}"`,
      r.unit,
      r.category,
      r.openingBalance,
      r.inward,
      r.outward,
      r.closingBalance,
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
      `Stock_Analysis_${reportParams.startDate}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleViewHistory = (item) => {
    setSelectedItemHistory(item);
    setShowHistoryModal(true);
  };

  const handlePrintMaterialReceipt = (log, itemName) => {
    const win = window.open("", "", "height=600,width=800");
    win.document.write("<html><head><title>Material Receipt</title>");
    win.document.write(
      '</head><body style="font-family: sans-serif; padding: 40px; border: 2px solid #581818;">',
    );

    // Header
    win.document.write('<div style="text-align:center;">');
    win.document.write(
      '<h2 style="color:#581818; margin:0;">KARUNASRI SEVA SAMITHI</h2>',
    );
    win.document.write(
      '<p style="margin:5px;">H.No.17-1-474, Krishna Nagar, Saidabad, Hyderabad</p>',
    );
    win.document.write('<hr style="border-top: 1px solid #daa520;">');
    win.document.write("<h3>MATERIAL ACKNOWLEDGEMENT RECEIPT</h3>");
    win.document.write("</div>");

    // Content
    win.document.write(
      '<div style="margin-top:30px; font-size: 1.1rem; line-height: 1.6;">',
    );
    win.document.write(
      `<p><strong>Date:</strong> ${new Date(log.date).toLocaleDateString()}</p>`,
    );
    win.document.write(
      `<p><strong>Received with thanks from:</strong> Sri/Smt. ${log.vendor}</p>`,
    );
    if (log.donorPhone)
      win.document.write(`<p><strong>Contact:</strong> ${log.donorPhone}</p>`);
    if (log.donorAddress)
      win.document.write(
        `<p><strong>Address:</strong> ${log.donorAddress}</p>`,
      );

    win.document.write("<br/>");
    win.document.write(
      '<table border="1" cellspacing="0" cellpadding="10" style="width:100%; text-align:center;">',
    );
    win.document.write(
      '<thead style="background:#eee;"><tr><th>Item Description</th><th>Quantity</th></tr></thead>',
    );
    win.document.write("<tbody>");
    win.document.write(
      `<tr><td>${itemName}</td><td>${log.quantityChange}</td></tr>`,
    );
    win.document.write("</tbody></table>");

    win.document.write(
      "<br/><p><em>Thank you for your generous contribution in kind.</em></p>",
    );
    win.document.write("</div>");

    // Footer
    win.document.write('<div style="margin-top:60px; text-align:right;">');
    win.document.write(
      "<p>______________________<br/>Authorized Signatory</p>",
    );
    win.document.write("</div>");

    win.document.write("</body></html>");
    win.document.close();
    win.print();
  };

  return (
    <div>
      <Row className="mb-4 align-items-center">
        <Col lg={5} xs={12} className="mb-3 mb-lg-0">
          <h2
            className="text-maroon m-0"
            style={{ fontFamily: "Playfair Display" }}
          >
            Inventory Management
          </h2>
          <p className="text-muted m-0 small">
            Hub & Spoke Supply Chain System
          </p>
        </Col>

        <Col lg={7} xs={12}>
          <div className="d-flex flex-wrap gap-2 justify-content-lg-end justify-content-start">
            <Button
              variant="info"
              className="shadow-sm text-white"
              onClick={() => setShowReportModal(true)}
            >
              <FaChartBar className="me-2" /> Analysis
            </Button>

            {/* RESTORED: AUDIT LOGS BUTTON */}
            <Link
              to="/dashboard/inventory/history"
              className="btn btn-outline-secondary shadow-sm"
            >
              <FaHistory className="me-2" /> Audit Logs
            </Link>

            <Link
              to="/dashboard/inventory/audit"
              className="btn btn-outline-dark shadow-sm"
            >
              <FaClipboardList className="me-2" /> Stock Count
            </Link>

            {/* Show ISSUE button only for Admin/KarunaSri Seva Samithi */}
            {(currentUser?.role === "admin" ||
              currentUser?.role === "warden_food" ||
              currentUser?.role === "warden_nonfood") && (
              <Button
                variant="warning"
                className="shadow-sm"
                onClick={() => setShowIssueModal(true)}
              >
                <FaTruck className="me-2" /> Issue Slip
              </Button>
            )}

            <Button
              variant="primary"
              className="shadow-sm"
              style={{ backgroundColor: "#581818", border: "none" }}
              onClick={() => setShowModal(true)}
            >
              <FaPlus className="me-2" /> Add Stock
            </Button>
          </div>
        </Col>
      </Row>

      <Tabs
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k)}
        className="mb-4"
      >
        {/* --- TAB 1: CURRENT STOCK REGISTER --- */}
        <Tab
          eventKey="stock"
          title={
            <span>
              <FaBoxOpen className="me-2" /> Current Stock Register
            </span>
          }
        >
          {/* Summary Cards */}
          <Row className="mb-4">
            <Col lg={4} md={6} xs={12} className="mb-3">
              <Card className="p-3 text-center border-0 shadow-sm h-100">
                <h3 className="text-success fw-bold m-0">
                  {items.filter((i) => i.category === "Food").length}
                </h3>
                <small className="text-muted text-uppercase">Food Items</small>
              </Card>
            </Col>
            <Col lg={4} md={6} xs={12} className="mb-3">
              <Card className="p-3 text-center border-0 shadow-sm h-100">
                <h3 className="text-primary fw-bold m-0">
                  {items.filter((i) => i.category === "Non-Food").length}
                </h3>
                <small className="text-muted text-uppercase">
                  Non-Food Items
                </small>
              </Card>
            </Col>
            <Col lg={4} md={12} xs={12} className="mb-3">
              <Card
                className="p-3 text-center border-0 shadow-sm h-100"
                style={{ borderLeft: "5px solid #dc3545" }}
              >
                <h3 className="text-danger fw-bold m-0">
                  <FaExclamationTriangle className="me-2 mb-1" size={20} />
                  {items.filter((i) => i.quantity < 10).length}
                </h3>
                <small className="text-muted text-uppercase">
                  Low Stock Alerts
                </small>
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
                    <th>Branch</th>

                    <th>Stock Level</th>
                    <th>Status</th>
                    <th>Expiry</th>
                    <th className="text-end pe-4">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item._id}>
                      <td className="ps-4 fw-bold">{item.itemName}</td>
                      <td>
                        <Badge bg="secondary">{item.category}</Badge>
                      </td>
                      {/* --- NEW BRANCH DATA --- */}
                      <td>
                        <small
                          className="text-muted text-uppercase fw-bold"
                          style={{ fontSize: "0.7rem" }}
                        >
                          {item.branch}
                        </small>
                      </td>
                      {/* ----------------------- */}

                      <td>
                        <div className="d-flex align-items-center">
                          <span className="me-2 fw-bold">
                            {item.quantity} {item.unit}
                          </span>
                          <ProgressBar
                            now={Math.min(item.quantity, 100)}
                            variant={item.quantity < 20 ? "danger" : "success"}
                            style={{ width: "80px", height: "5px" }}
                          />
                        </div>
                      </td>
                      <td>
                        {item.quantity < 10 ? (
                          <Badge bg="danger">Low Stock</Badge>
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
                      <td className="text-end pe-4">
                        <Button
                          variant="outline-warning"
                          size="sm"
                          className="me-2"
                          title="Record Daily Usage"
                          onClick={() => {
                            setSelectedItem(item);
                            setShowConsumeModal(true);
                          }}
                        >
                          <FaUtensils />
                        </Button>
                        <Button
                          variant="outline-info"
                          size="sm"
                          title="View Ledger"
                          onClick={() => handleViewHistory(item)}
                        >
                          <FaListAlt /> History
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {items.length === 0 && (
                    <tr>
                      <td colSpan="6" className="text-center py-5">
                        No inventory items found
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Tab>

        {/* --- TAB 2: TRANSFER SLIPS --- */}
        <Tab
          eventKey="transfers"
          title={
            <span>
              <FaTruck className="me-2" /> Transfer Slips
            </span>
          }
        >
          <Card className="shadow-sm border-0">
            <Card.Body className="p-0">
              <Table hover responsive className="align-middle mb-0">
                <thead className="bg-light">
                  <tr>
                    <th className="ps-4">Date / Slip No</th>
                    <th>From</th>
                    <th>To</th>
                    <th>Items</th>
                    <th>Personnel (Chain of Custody)</th>
                    <th>Status</th>
                    <th className="text-end pe-4">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {transfers.map((tr) => (
                    <tr key={tr._id}>
                      <td className="ps-4">
                        <div className="fw-bold">
                          {new Date(tr.createdAt).toLocaleDateString()}
                        </div>
                        <small className="text-muted">{tr.transferNo}</small>
                      </td>
                      <td>{tr.fromBranch}</td>
                      <td>
                        <span className="fw-bold text-dark">{tr.toBranch}</span>
                      </td>
                      <td>
                        <ul className="mb-0 ps-3 small text-muted">
                          {tr.items.map((i, idx) => (
                            <li key={idx}>
                              {i.itemName} - {i.quantity} {i.unit}
                            </li>
                          ))}
                        </ul>
                      </td>
                      {/* --- NEW: SHOW NAMES --- */}
                      <td className="small">
                        <div>
                          <strong className="text-primary">Issuer:</strong>{" "}
                          {tr.issuedBy?.name || "Unknown"}
                        </div>
                        {tr.status === "Received" ? (
                          <div>
                            <strong className="text-success">Receiver:</strong>{" "}
                            {tr.receivedBy?.name || "Unknown"}
                          </div>
                        ) : (
                          <div className="text-muted fst-italic">
                            Waiting for Receiver...
                          </div>
                        )}
                      </td>
                      {/* ----------------------- */}
                      <td>
                        <Badge
                          bg={
                            tr.status === "In-Transit" ? "warning" : "success"
                          }
                        >
                          {tr.status}
                        </Badge>
                      </td>
                      <td className="text-end pe-4">
                        {tr.status === "In-Transit" &&
                        (currentUser.branch === tr.toBranch ||
                          currentUser.branch === "KarunaSri Seva Samithi") ? (
                          <Button
                            size="sm"
                            variant="success"
                            onClick={() => handleReceiveStock(tr._id)}
                          >
                            <FaCheckCircle className="me-1" /> Receive
                          </Button>
                        ) : (
                          <span className="text-muted small">
                            {tr.status === "Received" ? "Completed" : tr.status}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {transfers.length === 0 && (
                    <tr>
                      <td colSpan="6" className="text-center py-5 text-muted">
                        No transfer slips found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Tab>
      </Tabs>

      {/* --- ADD STOCK MODAL (FULL RESTORED VERSION) --- */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Add / Update Stock</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Label>Item Name</Form.Label>
                <Form.Control
                  name="itemName"
                  value={formData.itemName}
                  onChange={handleChange}
                  required
                  placeholder="e.g. Rice"
                />
              </Col>
              <Col md={6}>
                <Form.Label>Category</Form.Label>
                <Form.Select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  // Disable if they are a specific warden
                  disabled={
                    currentUser?.role === "warden_food" ||
                    currentUser?.role === "warden_nonfood"
                  }
                >
                  {currentUser?.role === "warden_food" && (
                    <option value="Food">Food</option>
                  )}

                  {currentUser?.role === "warden_nonfood" && (
                    <>
                      <option value="Non-Food">Non-Food</option>
                      <option value="Medical">Medical</option>
                      <option value="General">General</option>
                    </>
                  )}

                  {/* Admin sees everything */}
                  {currentUser?.role === "admin" && (
                    <>
                      <option value="Food">Food</option>
                      <option value="Non-Food">Non-Food</option>
                      <option value="Medical">Medical</option>
                      <option value="General">General</option>
                    </>
                  )}
                </Form.Select>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={4}>
                <Form.Label>Quantity</Form.Label>
                <Form.Control
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  required
                />
              </Col>
              <Col md={4}>
                <Form.Label>Unit</Form.Label>
                <Form.Select
                  name="unit"
                  value={formData.unit}
                  onChange={handleChange}
                >
                  <option>kg</option>
                  <option>liters</option>
                  <option>pieces</option>
                  <option>bags</option>
                  <option>boxes</option>
                </Form.Select>
              </Col>
              <Col md={4} className="pt-4">
                <Form.Check
                  type="checkbox"
                  label="Perishable?"
                  name="isPerishable"
                  checked={formData.isPerishable}
                  onChange={handleChange}
                />
              </Col>
            </Row>

            {formData.isPerishable && (
              <Form.Group className="mb-3">
                <Form.Label>Expiry Date</Form.Label>
                <Form.Control
                  type="date"
                  name="expiryDate"
                  value={formData.expiryDate}
                  onChange={handleChange}
                />
              </Form.Group>
            )}

            <hr />

            <h6 className="text-maroon fw-bold mb-3">Source & Cost Details</h6>

            <Form.Group className="mb-3">
              <div className="d-flex gap-3">
                <Form.Check
                  type="radio"
                  label="Purchased"
                  name="sourceType"
                  value="Purchase"
                  checked={formData.sourceType === "Purchase"}
                  onChange={handleChange}
                />
                <Form.Check
                  type="radio"
                  label="Donated"
                  name="sourceType"
                  value="Donation"
                  checked={formData.sourceType === "Donation"}
                  onChange={handleChange}
                />
              </div>
            </Form.Group>

            {formData.sourceType === "Purchase" ? (
              <>
                <Row className="mb-2">
                  <Col md={6}>
                    <Form.Label>Vendor Name</Form.Label>
                    <Form.Control
                      placeholder="Shop / Supermarket"
                      name="vendor"
                      value={formData.vendor}
                      onChange={handleChange}
                    />
                  </Col>
                  <Col md={6}>
                    <Form.Label>Invoice / Bill No</Form.Label>
                    <Form.Control
                      placeholder="Bill #"
                      name="invoiceNo"
                      value={formData.invoiceNo}
                      onChange={handleChange}
                    />
                  </Col>
                </Row>
                <Row>
                  <Col md={6}>
                    <Form.Label>Cost per Unit</Form.Label>
                    <Form.Control
                      type="number"
                      name="unitCost"
                      value={formData.unitCost}
                      onChange={handleChange}
                      placeholder="0.00"
                    />
                  </Col>
                  <Col md={6}>
                    <Form.Label>Total Cost</Form.Label>
                    <Form.Control
                      type="number"
                      name="totalCost"
                      value={formData.totalCost}
                      readOnly
                      className="bg-light"
                    />
                  </Col>
                </Row>
              </>
            ) : (
              // --- DONATION FIELDS ---
              <>
                <Row className="mb-2">
                  <Col md={6}>
                    <Form.Label>Donor Name</Form.Label>
                    <Form.Control
                      placeholder="Name of Donor"
                      name="vendor"
                      value={formData.vendor}
                      onChange={handleChange}
                    />
                  </Col>
                  <Col md={6}>
                    <Form.Label>Donor Phone</Form.Label>
                    <Form.Control
                      placeholder="Mobile Number"
                      name="donorPhone"
                      value={formData.donorPhone}
                      onChange={handleChange}
                    />
                  </Col>
                </Row>
                <Form.Group className="mb-3">
                  <Form.Label>Donor Address</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    placeholder="Address (for receipt)"
                    name="donorAddress"
                    value={formData.donorAddress}
                    onChange={handleChange}
                  />
                </Form.Group>
              </>
            )}

            <Button type="submit" className="w-100 mt-4 btn-ashram">
              {formData.sourceType === "Purchase" ? (
                <FaShoppingCart className="me-2" />
              ) : (
                <FaGift className="me-2" />
              )}
              Add Stock
            </Button>
          </Form>
        </Modal.Body>
      </Modal>

      {/* --- ISSUE SLIP MODAL (TRANSFER) --- */}
      <Modal
        show={showIssueModal}
        onHide={() => setShowIssueModal(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Create Transfer Slip</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Select
            className="mb-3"
            value={issueData.toBranch}
            onChange={(e) =>
              setIssueData({ ...issueData, toBranch: e.target.value })
            }
          >
            <option value="Karunya Sindhu">Karunya Sindhu</option>
            <option value="Karunya Bharathi">Karunya Bharathi</option>
            <option value="Karunya Jyothi">Karunya Jyothi</option>
          </Form.Select>
          {issueData.items.map((item, idx) => (
            <Row key={idx} className="mb-2 g-2 align-items-center">
              <Col md={6}>
                <Form.Control
                  placeholder="Item Name (e.g. Sona Rice)"
                  value={item.itemName}
                  onChange={(e) =>
                    handleIssueItemChange(idx, "itemName", e.target.value)
                  }
                  list="itemSuggestions"
                />
                <datalist id="itemSuggestions">
                  {items
                    .filter((i) => {
                      if (currentUser?.role === "warden_food")
                        return i.category === "Food";
                      if (currentUser?.role === "warden_nonfood")
                        return i.category !== "Food";
                      return true; // Admin sees all
                    })
                    .map((i) => (
                      <option key={i._id} value={i.itemName} />
                    ))}
                </datalist>
              </Col>
              <Col md={3}>
                <Form.Control
                  type="number"
                  placeholder="Qty"
                  value={item.quantity}
                  onChange={(e) =>
                    handleIssueItemChange(idx, "quantity", e.target.value)
                  }
                />
              </Col>
              <Col md={2}>
                <Form.Select
                  value={item.unit}
                  onChange={(e) =>
                    handleIssueItemChange(idx, "unit", e.target.value)
                  }
                >
                  <option>kg</option>
                  <option>liters</option>
                  <option>pieces</option>
                  <option>bags</option>
                </Form.Select>
              </Col>
              <Col md={1}>
                {issueData.items.length > 1 && (
                  <Button
                    variant="link"
                    className="text-danger p-0"
                    onClick={() => removeIssueRow(idx)}
                  >
                    <FaTrash />
                  </Button>
                )}
              </Col>
            </Row>
          ))}
          <Button
            variant="primary"
            onClick={addIssueRow}
            size="sm"
            className="mb-3"
          >
            <FaPlus /> Add Another Item
          </Button>
          <Form.Control
            as="textarea"
            rows={2}
            placeholder="Remarks (e.g. Monthly Ration)"
            value={issueData.remarks}
            onChange={(e) =>
              setIssueData({ ...issueData, remarks: e.target.value })
            }
            className="mb-3"
          />
          <Button className="w-100 btn-ashram" onClick={handleIssueStock}>
            Create & Issue Slip
          </Button>
        </Modal.Body>
      </Modal>

      {/* --- CONSUME MODAL --- */}
      <Modal show={showConsumeModal} onHide={() => setShowConsumeModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            Record Consumption: {selectedItem?.itemName}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleConsumeStock}>
            <Form.Control
              type="number"
              value={consumeData.quantity}
              onChange={(e) =>
                setConsumeData({ ...consumeData, quantity: e.target.value })
              }
              placeholder="Qty Used"
              required
              className="mb-2"
            />
            <Form.Control
              value={consumeData.reason}
              onChange={(e) =>
                setConsumeData({ ...consumeData, reason: e.target.value })
              }
              placeholder="Reason (e.g. Lunch for 50 people)"
              required
              className="mb-3"
            />
            <Button type="submit" variant="warning" className="w-100">
              Confirm Usage
            </Button>
          </Form>
        </Modal.Body>
      </Modal>

      {/* --- REPORT / ANALYTIC MODAL --- */}
      <Modal
        show={showReportModal}
        onHide={() => setShowReportModal(false)}
        size="xl"
      >
        <Modal.Header closeButton>
          <Modal.Title>Stock Analysis Report</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row className="align-items-end mb-4">
            <Col md={3}>
              <Form.Label>Start Date</Form.Label>
              <Form.Control
                type="date"
                value={reportParams.startDate}
                onChange={(e) =>
                  setReportParams({
                    ...reportParams,
                    startDate: e.target.value,
                  })
                }
              />
            </Col>
            <Col md={3}>
              <Form.Label>End Date</Form.Label>
              <Form.Control
                type="date"
                value={reportParams.endDate}
                onChange={(e) =>
                  setReportParams({
                    ...reportParams,
                    endDate: e.target.value,
                  })
                }
              />
            </Col>
            <Col md={3}>
              <Form.Label>Branch</Form.Label>
              <Form.Select
                value={reportParams.branch}
                onChange={(e) =>
                  setReportParams({ ...reportParams, branch: e.target.value })
                }
              >
                <option value="KarunaSri Seva Samithi">
                  KarunaSri Seva Samithi
                </option>
                <option value="Karunya Sindhu">Karunya Sindhu</option>
                <option value="Karunya Bharathi">Karunya Bharathi</option>
              </Form.Select>
            </Col>
            <Col md={3}>
              <Button
                className="w-100 btn-ashram"
                onClick={handleGenerateReport}
              >
                Generate Analysis
              </Button>
            </Col>
          </Row>

          {reportData.length > 0 && (
            <>
              <div className="text-end mb-2">
                <Button size="sm" variant="success" onClick={downloadReportCSV}>
                  <FaFileDownload /> Download CSV
                </Button>
              </div>
              <Table
                bordered
                hover
                size="sm"
                className="text-center align-middle"
              >
                <thead className="bg-light">
                  <tr>
                    <th>Item Name</th>
                    <th>Opening</th>
                    <th className="text-success">Inward (+)</th>
                    <th className="text-danger">Outward (-)</th>
                    <th className="fw-bold bg-white">Closing Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.map((row, idx) => (
                    <tr key={idx}>
                      <td className="text-start ps-3 fw-bold">
                        {row.itemName}{" "}
                        <span className="text-muted small">({row.unit})</span>
                      </td>
                      <td>{row.openingBalance}</td>
                      <td className="text-success">{row.inward}</td>
                      <td className="text-danger">{row.outward}</td>
                      <td
                        className="fw-bold"
                        style={{ backgroundColor: "#f8f9fa" }}
                      >
                        {row.closingBalance}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </>
          )}
        </Modal.Body>
      </Modal>

      {/* --- HISTORY MODAL (WITH USER COLUMN) --- */}
      <Modal
        show={showHistoryModal}
        onHide={() => setShowHistoryModal(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            Stock History: {selectedItemHistory?.itemName}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedItemHistory?.stockHistory &&
          selectedItemHistory.stockHistory.length > 0 ? (
            <Table striped bordered hover size="sm">
              <thead className="bg-light">
                <tr>
                  <th>Date & Time</th>
                  <th>User</th>
                  <th>Type</th>
                  <th>Qty</th>
                  <th>Remarks</th>
                </tr>
              </thead>
              <tbody>
                {[...selectedItemHistory.stockHistory]
                  .reverse()
                  .map((log, idx) => (
                    <tr key={idx}>
                      <td className="small">
                        {new Date(log.date).toLocaleDateString()} <br />
                        <span className="text-muted">
                          {new Date(log.date).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </td>
                      <td className="small text-primary fw-bold">
                        <FaUser size={10} className="me-1" />
                        {log.addedBy ? log.addedBy.name : "System"}
                      </td>
                      <td>
                        <Badge bg="secondary">{log.changeType}</Badge>
                      </td>
                      <td
                        className={`fw-bold ${
                          log.quantityChange > 0
                            ? "text-success"
                            : "text-danger"
                        }`}
                      >
                        {log.quantityChange > 0 ? "+" : ""}
                        {log.quantityChange}
                      </td>
                      <td className="small">
                        {log.remarks || log.vendor || "-"}

                        {/* NEW: PRINT BUTTON FOR DONATIONS */}
                        {log.changeType === "Donation" && (
                          <Button
                            size="sm"
                            variant="link"
                            className="p-0 ms-2"
                            onClick={() =>
                              handlePrintMaterialReceipt(
                                log,
                                selectedItemHistory.itemName,
                              )
                            }
                            title="Print Receipt"
                          >
                            <FaPrint />
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </Table>
          ) : (
            <p className="text-center text-muted">No history found.</p>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default InventoryList;
