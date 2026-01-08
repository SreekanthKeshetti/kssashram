// import React, { useEffect, useState, useCallback } from "react";
// import {
//   Table,
//   Button,
//   Badge,
//   Card,
//   Row,
//   Col,
//   Modal,
//   Form,
//   ProgressBar,
// } from "react-bootstrap";
// import { FaPlus, FaBox, FaExclamationTriangle } from "react-icons/fa";
// import { FaClipboardList, FaHistory } from "react-icons/fa"; // Add FaHistory
// import axios from "axios";
// import { Link } from "react-router-dom";

// const InventoryList = () => {
//   const [items, setItems] = useState([]);
//   const [showModal, setShowModal] = useState(false);

//   const [formData, setFormData] = useState({
//     itemName: "",
//     category: "Food",
//     isPerishable: false,
//     quantity: "",
//     unit: "kg",
//     expiryDate: "",
//   });

//   const fetchInventory = useCallback(async () => {
//     try {
//       const userInfo = JSON.parse(localStorage.getItem("userInfo"));
//       const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
//       const { data } = await axios.get(
//         "http://localhost:5000/api/inventory",
//         config
//       );
//       setItems(data);
//     } catch (error) {
//       console.error(error);
//     }
//   }, []);

//   useEffect(() => {
//     // eslint-disable-next-line react-hooks/set-state-in-effect
//     fetchInventory();
//   }, [fetchInventory]);

//   // const handleSubmit = async (e) => {
//   //   e.preventDefault();
//   //   try {
//   //     const userInfo = JSON.parse(localStorage.getItem("userInfo"));
//   //     const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
//   //     await axios.post("http://localhost:5000/api/inventory", formData, config);
//   //     setShowModal(false);
//   //     fetchInventory();
//   //     alert("Stock Updated Successfully!");
//   //     // eslint-disable-next-line no-unused-vars
//   //   } catch (error) {
//   //     alert("Error updating stock");
//   //   }
//   // };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     // Basic Validation
//     if (!formData.itemName || !formData.quantity) {
//       alert("Please enter Item Name and Quantity");
//       return;
//     }

//     try {
//       const userInfo = JSON.parse(localStorage.getItem("userInfo"));
//       const config = {
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${userInfo.token}`,
//         },
//       };

//       // Prepare Payload (Ensure types are correct)
//       const payload = {
//         itemName: formData.itemName,
//         category: formData.category,
//         quantity: Number(formData.quantity), // <--- Force Number
//         unit: formData.unit,
//         isPerishable:
//           formData.isPerishable === true || formData.isPerishable === "true", // Handle boolean
//         expiryDate: formData.expiryDate || null,
//         branch: "Headquarters", // Ensure branch is sent
//       };

//       console.log("Sending Payload:", payload); // Debugging: Check console to see what is sent

//       await axios.post("http://localhost:5000/api/inventory", payload, config);

//       setShowModal(false);
//       fetchInventory();

//       // Reset Form
//       setFormData({
//         itemName: "",
//         category: "Food",
//         isPerishable: false,
//         quantity: "",
//         unit: "kg",
//         expiryDate: "",
//       });

//       alert("Stock Updated Successfully!");
//     } catch (error) {
//       console.error("Add Stock Error:", error.response?.data); // Check console for details
//       // Show the specific error message from Backend
//       alert(error.response?.data?.message || "Error updating stock");
//     }
//   };

//   const handleChange = (e) => {
//     const value =
//       e.target.type === "checkbox" ? e.target.checked : e.target.value;
//     setFormData({ ...formData, [e.target.name]: value });
//   };

//   return (
//     <div>
//       <Row className="mb-4 align-items-center">
//         <Col>
//           <h2
//             className="text-maroon"
//             style={{ fontFamily: "Playfair Display" }}
//           >
//             Inventory & Stock
//           </h2>
//           <p className="text-muted">
//             Manage Food, Non-Food, and Ashram Supplies
//           </p>
//         </Col>
//         <Col className="text-end">
//           {/* History Button */}
//           <Link
//             to="/dashboard/inventory/history"
//             className="btn btn-outline-secondary me-2"
//           >
//             <FaHistory /> History
//           </Link>
//           {/* Audit Button */}
//           <Link
//             to="/dashboard/inventory/audit"
//             className="btn btn-outline-dark me-2"
//           >
//             <FaClipboardList /> Stock Audit
//           </Link>{" "}
//           <Button
//             variant="primary"
//             style={{ backgroundColor: "#581818", border: "none" }}
//             onClick={() => setShowModal(true)}
//           >
//             <FaPlus /> Add / Update Stock
//           </Button>
//         </Col>
//       </Row>

//       <Row className="mb-4">
//         <Col md={3}>
//           <Card className="p-3 text-center border-0 shadow-sm">
//             <h3 className="text-success">
//               {items.filter((i) => i.category === "Food").length}
//             </h3>
//             <small>Food Items</small>
//           </Card>
//         </Col>
//         <Col md={3}>
//           <Card className="p-3 text-center border-0 shadow-sm">
//             <h3 className="text-primary">
//               {items.filter((i) => i.category === "Non-Food").length}
//             </h3>
//             <small>Non-Food Items</small>
//           </Card>
//         </Col>
//       </Row>

//       <Card className="shadow-sm border-0">
//         <Card.Body className="p-0">
//           <Table hover responsive className="align-middle mb-0">
//             <thead className="bg-light">
//               <tr>
//                 <th className="ps-4">Item Name</th>
//                 <th>Category</th>
//                 <th>Stock Level</th>
//                 <th>Status</th>
//                 <th>Expiry (If Perishable)</th>
//               </tr>
//             </thead>
//             <tbody>
//               {items.map((item) => (
//                 <tr key={item._id}>
//                   <td className="ps-4 fw-bold">{item.itemName}</td>
//                   <td>
//                     <Badge bg="secondary">{item.category}</Badge>
//                   </td>
//                   <td>
//                     <div className="d-flex align-items-center">
//                       <span className="me-2 fw-bold">
//                         {item.quantity} {item.unit}
//                       </span>
//                       {/* Visual Bar for stock */}
//                       <ProgressBar
//                         now={Math.min(item.quantity, 100)}
//                         variant={item.quantity < 20 ? "danger" : "success"}
//                         style={{ width: "80px", height: "5px" }}
//                       />
//                     </div>
//                   </td>
//                   <td>
//                     {item.quantity < 10 ? (
//                       <Badge bg="danger">
//                         <FaExclamationTriangle /> Low Stock
//                       </Badge>
//                     ) : (
//                       <Badge bg="success">In Stock</Badge>
//                     )}
//                   </td>
//                   <td>
//                     {item.isPerishable && item.expiryDate ? (
//                       new Date(item.expiryDate).toLocaleDateString()
//                     ) : (
//                       <span className="text-muted">-</span>
//                     )}
//                   </td>
//                 </tr>
//               ))}
//               {items.length === 0 && (
//                 <tr>
//                   <td colSpan="5" className="text-center py-5">
//                     No inventory items found
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </Table>
//         </Card.Body>
//       </Card>

//       {/* Add Item Modal */}
//       <Modal show={showModal} onHide={() => setShowModal(false)}>
//         <Modal.Header closeButton>
//           <Modal.Title>Add Inventory Item</Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           <Form onSubmit={handleSubmit}>
//             <Form.Group className="mb-3">
//               <Form.Label>Item Name</Form.Label>
//               <Form.Control
//                 name="itemName"
//                 value={formData.itemName}
//                 onChange={handleChange}
//                 required
//                 placeholder="e.g. Rice, Oil, Chairs"
//               />
//             </Form.Group>

//             <Row>
//               <Col md={6}>
//                 <Form.Group className="mb-3">
//                   <Form.Label>Category</Form.Label>
//                   <Form.Select
//                     name="category"
//                     value={formData.category} // <--- Added value
//                     onChange={handleChange}
//                   >
//                     <option>Food</option>
//                     <option>Non-Food</option>
//                     <option>Medical</option>
//                     <option>General</option>
//                   </Form.Select>
//                 </Form.Group>
//               </Col>
//               <Col md={6}>
//                 <Form.Group className="mb-3">
//                   <Form.Label>Quantity</Form.Label>
//                   <Form.Control
//                     type="number"
//                     name="quantity"
//                     value={formData.quantity} // <--- Added value
//                     onChange={handleChange}
//                     required
//                   />
//                 </Form.Group>
//               </Col>
//             </Row>

//             <Row>
//               <Col md={6}>
//                 <Form.Group className="mb-3">
//                   <Form.Label>Unit</Form.Label>
//                   <Form.Select
//                     name="unit"
//                     value={formData.unit}
//                     onChange={handleChange}
//                   >
//                     <option>kg</option>
//                     <option>liters</option>
//                     <option>bags</option>
//                     <option>pieces</option>
//                     <option>boxes</option>
//                   </Form.Select>
//                 </Form.Group>
//               </Col>
//               <Col md={6}>
//                 <Form.Group className="mb-3 pt-4">
//                   <Form.Check
//                     type="checkbox"
//                     label="Is Perishable?"
//                     name="isPerishable"
//                     checked={formData.isPerishable}
//                     onChange={handleChange}
//                   />
//                 </Form.Group>
//               </Col>
//             </Row>

//             {/* Show Expiry Date only if Perishable is checked */}
//             {formData.isPerishable && (
//               <Form.Group className="mb-3">
//                 <Form.Label>Expiry Date</Form.Label>
//                 <Form.Control
//                   type="date"
//                   name="expiryDate"
//                   value={formData.expiryDate}
//                   onChange={handleChange}
//                 />
//               </Form.Group>
//             )}

//             <Button type="submit" className="w-100 btn-ashram">
//               Update Stock
//             </Button>
//           </Form>
//         </Modal.Body>
//       </Modal>
//     </div>
//   );
// };

// export default InventoryList;
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
import {
  FaPlus,
  FaExclamationTriangle,
  FaHistory,
  FaClipboardList,
  FaShoppingCart,
  FaGift,
  FaListAlt,
} from "react-icons/fa";
import axios from "axios";
import { Link } from "react-router-dom";
import BASE_URL from "../../apiConfig";

const InventoryList = () => {
  const [items, setItems] = useState([]);
  const [showModal, setShowModal] = useState(false);

  // --- NEW STATE FOR HISTORY MODAL ---
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedItemHistory, setSelectedItemHistory] = useState(null);

  const [formData, setFormData] = useState({
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

  const fetchInventory = useCallback(async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const { data } = await axios.get(`${BASE_URL}/api/inventory`, config);
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
    if (!formData.itemName || !formData.quantity) {
      alert("Please enter Item Name and Quantity");
      return;
    }

    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userInfo.token}`,
        },
      };

      const payload = {
        ...formData,
        quantity: Number(formData.quantity),
        branch: "Headquarters",
      };

      await axios.post(`${BASE_URL}/api/inventory`, payload, config);

      setShowModal(false);
      fetchInventory();

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

      alert("Stock Updated Successfully!");
    } catch (error) {
      alert(error.response?.data?.message || "Error updating stock");
    }
  };

  const handleChange = (e) => {
    const value =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;

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

  // --- NEW: OPEN HISTORY HANDLER ---
  const handleViewHistory = (item) => {
    setSelectedItemHistory(item);
    setShowHistoryModal(true);
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
          <Link
            to="/dashboard/inventory/history"
            className="btn btn-outline-secondary me-2"
          >
            <FaHistory /> Audit Logs
          </Link>
          <Link
            to="/dashboard/inventory/audit"
            className="btn btn-outline-dark me-2"
          >
            <FaClipboardList /> Stock Audit
          </Link>
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
                <th>Expiry</th>
                <th className="text-end pe-4">Action</th>
                {/* Added Action Column */}
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
                  {/* View History Button */}
                  <td className="text-end pe-4">
                    <Button
                      variant="outline-info"
                      size="sm"
                      onClick={() => handleViewHistory(item)}
                      title="View Stock Ledger"
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

      {/* --- ADD ITEM MODAL --- */}
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
                >
                  <option>Food</option>
                  <option>Non-Food</option>
                  <option>Medical</option>
                  <option>General</option>
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
              <Form.Group className="mb-3">
                <Form.Label>Donor Name (Optional)</Form.Label>
                <Form.Control
                  placeholder="Name of Donor"
                  name="vendor"
                  value={formData.vendor}
                  onChange={handleChange}
                />
              </Form.Group>
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

      {/* --- NEW: VIEW HISTORY MODAL --- */}
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
                  <th>Date</th>
                  <th>Type</th>
                  <th>Qty Added</th>
                  <th>Source / Vendor</th>
                  <th>Total Cost</th>
                </tr>
              </thead>
              <tbody>
                {[...selectedItemHistory.stockHistory]
                  .reverse()
                  .map((log, idx) => (
                    <tr key={idx}>
                      <td>{new Date(log.date).toLocaleDateString()}</td>
                      <td>
                        <Badge
                          bg={
                            log.changeType === "Purchase"
                              ? "warning"
                              : log.changeType === "Donation"
                              ? "success"
                              : "secondary"
                          }
                        >
                          {log.changeType}
                        </Badge>
                      </td>
                      <td className="fw-bold">+{log.quantityChange}</td>
                      <td>
                        {log.vendor || "-"}
                        {log.invoiceNo && (
                          <div className="small text-muted">
                            Inv: {log.invoiceNo}
                          </div>
                        )}
                      </td>
                      <td>{log.totalCost ? `₹${log.totalCost}` : "-"}</td>
                    </tr>
                  ))}
              </tbody>
            </Table>
          ) : (
            <p className="text-center text-muted">
              No history found for this item.
            </p>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default InventoryList;
