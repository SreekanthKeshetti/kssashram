// /* eslint-disable react-hooks/immutability */
// /* eslint-disable no-unused-vars */
// import React, { useEffect, useState, useCallback } from "react";
// import { Link } from "react-router-dom";
// import BASE_URL from "../../apiConfig";
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
//   Tabs,
//   Tab,
//   Alert,
//   Spinner,
// } from "react-bootstrap";
// import {
//   FaPlus,
//   FaExclamationTriangle,
//   FaHistory,
//   FaClipboardList,
//   FaShoppingCart,
//   FaGift,
//   FaListAlt,
//   FaTruck,
//   FaBoxOpen,
//   FaCheckCircle,
//   FaTrash,
//   FaUtensils,
//   FaChartBar,
//   FaFileDownload,
//   FaUser,
//   FaPrint,
// } from "react-icons/fa";
// import axios from "axios";

// const InventoryList = () => {
//   const [activeTab, setActiveTab] = useState("stock");
//   const [items, setItems] = useState([]);
//   const [transfers, setTransfers] = useState([]);
//   const [currentUser, setCurrentUser] = useState(null);
//   const [loading, setLoading] = useState(true);

//   // --- MODAL STATES ---
//   const [showModal, setShowModal] = useState(false);
//   const [showHistoryModal, setShowHistoryModal] = useState(false);
//   const [showIssueModal, setShowIssueModal] = useState(false);
//   const [showConsumeModal, setShowConsumeModal] = useState(false);
//   const [showReportModal, setShowReportModal] = useState(false);

//   const [selectedItem, setSelectedItem] = useState(null);
//   const [selectedItemHistory, setSelectedItemHistory] = useState(null);

//   // --- FORM DATA: ADD STOCK ---
//   const [formData, setFormData] = useState({
//     itemCode: "",
//     itemName: "",
//     category: "Food",
//     isPerishable: false,
//     quantity: "",
//     unit: "kg",
//     expiryDate: "",
//     sourceType: "Purchase",
//     vendor: "",
//     unitCost: "",
//     totalCost: "",
//     invoiceNo: "",
//     donorPhone: "",
//     donorAddress: "",
//     branch: "KarunaSri Seva Samithi",
//   });

//   // --- FORM DATA: ISSUE SLIP ---
//   const [issueData, setIssueData] = useState({
//     toBranch: "Karunya Sindhu",
//     remarks: "",
//     items: [{ itemName: "", itemCode: "", quantity: "", unit: "kg" }],
//   });

//   const [consumeData, setConsumeData] = useState({ quantity: "", reason: "" });

//   const [reportParams, setReportParams] = useState({
//     startDate: new Date().toISOString().split("T")[0],
//     endDate: new Date().toISOString().split("T")[0],
//     branch: "",
//   });
//   const [reportData, setReportData] = useState([]);

//   useEffect(() => {
//     const user = JSON.parse(localStorage.getItem("userInfo"));
//     setCurrentUser(user);
//     if (user) {
//       fetchInventory(user);
//       fetchTransfers(user);
//       setReportParams((prev) => ({
//         ...prev,
//         branch: user.branch || "KarunaSri Seva Samithi",
//       }));
//       setFormData((prev) => ({
//         ...prev,
//         branch: user.branch || "KarunaSri Seva Samithi",
//       }));
//     }
//   }, []);

//   const fetchInventory = async (user) => {
//     try {
//       const config = { headers: { Authorization: `Bearer ${user.token}` } };
//       const { data } = await axios.get(`${BASE_URL}/api/inventory`, config);
//       setItems(data);
//       setLoading(false);
//     } catch (error) {
//       console.error(error);
//       setLoading(false);
//     }
//   };

//   const fetchTransfers = async (user) => {
//     try {
//       const config = { headers: { Authorization: `Bearer ${user.token}` } };
//       const { data } = await axios.get(
//         `${BASE_URL}/api/inventory/transfer`,
//         config,
//       );
//       setTransfers(data);
//     } catch (error) {
//       console.error(error);
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!formData.itemCode || !formData.quantity)
//       return alert("Select an item and enter quantity");

//     try {
//       const config = {
//         headers: { Authorization: `Bearer ${currentUser.token}` },
//       };
//       const payload = { ...formData, quantity: Number(formData.quantity) };
//       await axios.post(`${BASE_URL}/api/inventory`, payload, config);

//       setShowModal(false);
//       fetchInventory(currentUser);
//       alert("Stock Updated Successfully!");
//       setFormData({
//         itemCode: "",
//         itemName: "",
//         category: "Food",
//         isPerishable: false,
//         quantity: "",
//         unit: "kg",
//         expiryDate: "",
//         sourceType: "Purchase",
//         vendor: "",
//         unitCost: "",
//         totalCost: "",
//         invoiceNo: "",
//         donorPhone: "",
//         donorAddress: "",
//         branch: currentUser.branch || "KarunaSri Seva Samithi",
//       });
//     } catch (error) {
//       alert(error.response?.data?.message || "Error updating stock");
//     }
//   };

//   const handleChange = (e) => {
//     const { name, value, type, checked } = e.target;
//     const val = type === "checkbox" ? checked : value;

//     if (name === "unitCost" || name === "quantity") {
//       const qty = name === "quantity" ? val : formData.quantity;
//       const cost = name === "unitCost" ? val : formData.unitCost;
//       setFormData((prev) => ({
//         ...prev,
//         [name]: val,
//         totalCost: qty && cost ? (qty * cost).toFixed(2) : prev.totalCost,
//       }));
//     } else {
//       setFormData({ ...formData, [name]: val });
//     }
//   };

//   const handleIssueStock = async () => {
//     const validItems = issueData.items.filter((i) => i.itemCode && i.quantity);
//     if (validItems.length === 0) return alert("Add at least one valid item.");

//     try {
//       const config = {
//         headers: { Authorization: `Bearer ${currentUser.token}` },
//       };
//       await axios.post(
//         `${BASE_URL}/api/inventory/transfer/issue`,
//         { ...issueData, items: validItems },
//         config,
//       );
//       alert("Issue Slip Created!");
//       setShowIssueModal(false);
//       fetchInventory(currentUser);
//       fetchTransfers(currentUser);
//       setIssueData({
//         toBranch: "Karunya Sindhu",
//         remarks: "",
//         items: [{ itemName: "", itemCode: "", quantity: "", unit: "kg" }],
//       });
//     } catch (error) {
//       alert(error.response?.data?.message || "Error");
//     }
//   };

//   const handleReceiveStock = async (transferId) => {
//     if (!window.confirm("Confirm receipt of goods?")) return;
//     try {
//       const config = {
//         headers: { Authorization: `Bearer ${currentUser.token}` },
//       };
//       await axios.put(
//         `${BASE_URL}/api/inventory/transfer/receive`,
//         { transferId },
//         config,
//       );
//       alert("Goods Received!");
//       fetchInventory(currentUser);
//       fetchTransfers(currentUser);
//     } catch (error) {
//       alert(error.response?.data?.message || "Error");
//     }
//   };

//   // --- PRINT RECEIPT HANDLER ---
//   const handlePrintMaterialReceipt = (log, itemName) => {
//     const win = window.open("", "", "height=600,width=800");
//     win.document.write(
//       "<html><head><title>Material Receipt</title></head><body>",
//     );
//     win.document.write(
//       '<div style="font-family:sans-serif; padding:40px; border:2px solid #581818; text-align:center;">',
//     );
//     win.document.write(
//       '<h2 style="color:#581818; margin:0;">KARUNASRI SEVA SAMITHI</h2>',
//     );
//     win.document.write(
//       "<p>H.No.17-1-474, Krishna Nagar, Saidabad, Hyderabad</p><hr/>",
//     );
//     win.document.write("<h3>MATERIAL ACKNOWLEDGEMENT RECEIPT</h3>");
//     win.document.write(
//       '<div style="text-align:left; margin-top:30px; font-size:1.1rem;">',
//     );
//     win.document.write(
//       `<p><strong>Date:</strong> ${new Date(log.date).toLocaleDateString()}</p>`,
//     );
//     win.document.write(
//       `<p><strong>Received with thanks from:</strong> Sri/Smt. ${log.vendor || "Anonymous"}</p>`,
//     );
//     win.document.write(
//       `<table border="1" style="width:100%; text-align:center; border-collapse:collapse; margin-top:20px;">`,
//     );
//     win.document.write(
//       `<tr style="background:#eee;"><th>Description</th><th>Quantity</th></tr>`,
//     );
//     win.document.write(
//       `<tr><td>${itemName}</td><td>${log.quantityChange}</td></tr></table>`,
//     );
//     win.document.write(
//       "<br/><p>Thank you for your generous contribution in kind.</p></div>",
//     );
//     win.document.write(
//       '<div style="margin-top:50px; text-align:right;"><p>______________________<br/>Authorized Signatory</p></div></div></body></html>',
//     );
//     win.document.close();
//     win.print();
//   };

//   if (loading)
//     return (
//       <div className="text-center py-5">
//         <Spinner animation="border" />
//       </div>
//     );

//   return (
//     <div>
//       <Row className="mb-4 align-items-center">
//         <Col lg={5} xs={12} className="mb-3 mb-lg-0">
//           <h2
//             className="text-maroon m-0"
//             style={{ fontFamily: "Playfair Display" }}
//           >
//             Inventory Management
//           </h2>
//           <p className="text-muted m-0 small">
//             Alphanumeric Master List & Incharge Control
//           </p>
//         </Col>

//         <Col lg={7} xs={12}>
//           <div className="d-flex flex-wrap gap-2 justify-content-lg-end">
//             <Button
//               variant="info"
//               className="text-white"
//               onClick={() => setShowReportModal(true)}
//             >
//               <FaChartBar /> Analysis
//             </Button>
//             <Link
//               to="/dashboard/inventory/history"
//               className="btn btn-outline-secondary"
//             >
//               <FaHistory /> Audit Logs
//             </Link>
//             <Link
//               to="/dashboard/inventory/audit"
//               className="btn btn-outline-dark"
//             >
//               <FaClipboardList /> Stock Count
//             </Link>
//             {(currentUser?.role === "admin" ||
//               currentUser?.role === "warden_food" ||
//               currentUser?.role === "warden_nonfood") && (
//               <>
//                 <Button
//                   variant="warning"
//                   onClick={() => setShowIssueModal(true)}
//                 >
//                   <FaTruck /> Issue Slip
//                 </Button>
//                 <Button
//                   variant="primary"
//                   style={{ backgroundColor: "#581818", border: "none" }}
//                   onClick={() => setShowModal(true)}
//                 >
//                   <FaPlus /> Add Stock
//                 </Button>
//               </>
//             )}
//           </div>
//         </Col>
//       </Row>

//       <Tabs
//         activeKey={activeTab}
//         onSelect={(k) => setActiveTab(k)}
//         className="mb-4"
//       >
//         <Tab
//           eventKey="stock"
//           title={
//             <span>
//               <FaBoxOpen className="me-2" /> Stock Register
//             </span>
//           }
//         >
//           <Card className="shadow-sm border-0">
//             <Card.Body className="p-0">
//               <Table hover responsive className="align-middle mb-0">
//                 <thead className="bg-light">
//                   <tr>
//                     <th className="ps-4">Code</th>
//                     <th>Item Name</th>
//                     <th>Category</th>
//                     <th>Branch</th>
//                     <th>Stock</th>
//                     <th className="text-end pe-4">Action</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {items.map((item) => (
//                     <tr key={item._id}>
//                       <td className="ps-4 text-primary fw-bold">
//                         {item.itemCode}
//                       </td>
//                       <td className="fw-bold">{item.itemName}</td>
//                       <td>
//                         <Badge bg="secondary">{item.category}</Badge>
//                       </td>
//                       <td>
//                         <small className="text-muted text-uppercase fw-bold">
//                           {item.branch}
//                         </small>
//                       </td>
//                       <td>
//                         <div className="d-flex align-items-center">
//                           <span className="me-2 fw-bold">
//                             {item.quantity} {item.unit}
//                           </span>
//                           <ProgressBar
//                             now={Math.min(item.quantity, 100)}
//                             variant={item.quantity < 10 ? "danger" : "success"}
//                             style={{ width: "60px", height: "5px" }}
//                           />
//                         </div>
//                       </td>
//                       <td className="text-end pe-4">
//                         <Button
//                           variant="outline-warning"
//                           size="sm"
//                           className="me-2"
//                           onClick={() => {
//                             setSelectedItem(item);
//                             setShowConsumeModal(true);
//                           }}
//                         >
//                           <FaUtensils />
//                         </Button>
//                         <Button
//                           variant="outline-info"
//                           size="sm"
//                           onClick={() => {
//                             setSelectedItemHistory(item);
//                             setShowHistoryModal(true);
//                           }}
//                         >
//                           <FaListAlt /> Ledger
//                         </Button>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </Table>
//             </Card.Body>
//           </Card>
//         </Tab>

//         <Tab
//           eventKey="transfers"
//           title={
//             <span>
//               <FaTruck className="me-2" /> Transfer Slips
//             </span>
//           }
//         >
//           <Card className="shadow-sm border-0">
//             <Card.Body className="p-0">
//               <Table hover responsive className="align-middle mb-0">
//                 <thead className="bg-light">
//                   <tr>
//                     <th className="ps-4">Slip No</th>
//                     <th>From</th>
//                     <th>To</th>
//                     <th>Items</th>
//                     <th>Status</th>
//                     <th className="text-end pe-4">Action</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {transfers.map((tr) => (
//                     <tr key={tr._id}>
//                       <td className="ps-4 fw-bold">{tr.transferNo}</td>
//                       <td>{tr.fromBranch}</td>
//                       <td className="fw-bold">{tr.toBranch}</td>
//                       <td className="small">
//                         {tr.items
//                           .map((i) => `${i.itemName}(${i.quantity})`)
//                           .join(", ")}
//                       </td>
//                       <td>
//                         <Badge
//                           bg={
//                             tr.status === "In-Transit" ? "warning" : "success"
//                           }
//                         >
//                           {tr.status}
//                         </Badge>
//                       </td>
//                       <td className="text-end pe-4">
//                         {tr.status === "In-Transit" &&
//                         (currentUser.branch === tr.toBranch ||
//                           currentUser.role === "admin") ? (
//                           <Button
//                             size="sm"
//                             variant="success"
//                             onClick={() => handleReceiveStock(tr._id)}
//                           >
//                             Receive
//                           </Button>
//                         ) : (
//                           <span>{tr.status}</span>
//                         )}
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </Table>
//             </Card.Body>
//           </Card>
//         </Tab>
//       </Tabs>

//       {/* --- ADD STOCK MODAL --- */}
//       <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
//         <Modal.Header closeButton>
//           <Modal.Title>Inventory Inward Entry</Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           <Form onSubmit={handleSubmit}>
//             <Row className="mb-4">
//               <Col md={6}>
//                 <Form.Label className="fw-bold">Branch</Form.Label>
//                 <Form.Select
//                   name="branch"
//                   value={formData.branch}
//                   onChange={handleChange}
//                   disabled={currentUser?.role !== "admin"}
//                 >
//                   <option value="KarunaSri Seva Samithi">KSS (HQ)</option>
//                   <option value="Karunya Sindhu">KSA (Sindhu)</option>
//                   <option value="Karunya Bharathi">KBA (Bharathi)</option>
//                   <option value="Karunya Jyothi">KJA (Jyothi)</option>
//                 </Form.Select>
//               </Col>
//               <Col md={6}>
//                 <Form.Label className="fw-bold">Select Master Item</Form.Label>
//                 <Form.Select
//                   name="itemCode"
//                   value={formData.itemCode}
//                   onChange={(e) => {
//                     const selected = items.find(
//                       (i) => i.itemCode === e.target.value,
//                     );
//                     if (selected) {
//                       setFormData({
//                         ...formData,
//                         itemCode: selected.itemCode,
//                         itemName: selected.itemName,
//                         category: selected.category,
//                       });
//                     }
//                   }}
//                   required
//                 >
//                   <option value="">-- Choose Item --</option>
//                   {items
//                     .filter((i) => i.branch === formData.branch)
//                     .filter((i) => {
//                       if (currentUser.role === "warden_food")
//                         return i.category === "Food";
//                       if (currentUser.role === "warden_nonfood")
//                         return i.category !== "Food";
//                       return true;
//                     })
//                     .map((i) => (
//                       <option key={i._id} value={i.itemCode}>
//                         {i.itemCode} | {i.itemName}
//                       </option>
//                     ))}
//                 </Form.Select>
//               </Col>
//             </Row>

//             <Row className="mb-3">
//               <Col md={4}>
//                 <Form.Label>Quantity</Form.Label>
//                 <Form.Control
//                   type="number"
//                   name="quantity"
//                   value={formData.quantity}
//                   onChange={handleChange}
//                   required
//                 />
//               </Col>
//               <Col md={4}>
//                 <Form.Label>Unit</Form.Label>
//                 <Form.Select
//                   name="unit"
//                   value={formData.unit}
//                   onChange={handleChange}
//                 >
//                   <option>kg</option>
//                   <option>liters</option>
//                   <option>pieces</option>
//                   <option>bags</option>
//                 </Form.Select>
//               </Col>
//               <Col md={4} className="pt-4">
//                 <Form.Check
//                   type="checkbox"
//                   label="Perishable?"
//                   name="isPerishable"
//                   checked={formData.isPerishable}
//                   onChange={handleChange}
//                 />
//               </Col>
//             </Row>

//             <h6 className="text-maroon fw-bold mt-4">Inward Source</h6>
//             <Form.Group className="mb-3 d-flex gap-3">
//               <Form.Check
//                 type="radio"
//                 label="Purchase"
//                 name="sourceType"
//                 value="Purchase"
//                 checked={formData.sourceType === "Purchase"}
//                 onChange={handleChange}
//               />
//               <Form.Check
//                 type="radio"
//                 label="Donation"
//                 name="sourceType"
//                 value="Donation"
//                 checked={formData.sourceType === "Donation"}
//                 onChange={handleChange}
//               />
//             </Form.Group>

//             {formData.sourceType === "Purchase" ? (
//               <Row>
//                 <Col md={6}>
//                   <Form.Label>Vendor</Form.Label>
//                   <Form.Control
//                     name="vendor"
//                     value={formData.vendor}
//                     onChange={handleChange}
//                   />
//                 </Col>
//                 <Col md={6}>
//                   <Form.Label>Invoice #</Form.Label>
//                   <Form.Control
//                     name="invoiceNo"
//                     value={formData.invoiceNo}
//                     onChange={handleChange}
//                   />
//                 </Col>
//               </Row>
//             ) : (
//               <Row>
//                 <Col md={6}>
//                   <Form.Label>Donor Name</Form.Label>
//                   <Form.Control
//                     name="vendor"
//                     value={formData.vendor}
//                     onChange={handleChange}
//                   />
//                 </Col>
//                 <Col md={6}>
//                   <Form.Label>Phone</Form.Label>
//                   <Form.Control
//                     name="donorPhone"
//                     value={formData.donorPhone}
//                     onChange={handleChange}
//                   />
//                 </Col>
//               </Row>
//             )}

//             <Button type="submit" className="w-100 mt-4 btn-ashram">
//               Post to Inventory
//             </Button>
//           </Form>
//         </Modal.Body>
//       </Modal>

//       {/* --- ISSUE SLIP MODAL --- */}
//       <Modal
//         show={showIssueModal}
//         onHide={() => setShowIssueModal(false)}
//         size="lg"
//       >
//         <Modal.Header closeButton>
//           <Modal.Title>Inter-Branch Transfer Slip</Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           <Form.Label>Destination Branch</Form.Label>
//           <Form.Select
//             className="mb-3"
//             value={issueData.toBranch}
//             onChange={(e) =>
//               setIssueData({ ...issueData, toBranch: e.target.value })
//             }
//           >
//             <option value="Karunya Sindhu">Karunya Sindhu</option>
//             <option value="Karunya Bharathi">Karunya Bharathi</option>
//             <option value="Karunya Jyothi">Karunya Jyothi</option>
//           </Form.Select>
//           {issueData.items.map((item, idx) => (
//             <Row key={idx} className="mb-2 g-2">
//               <Col md={7}>
//                 <Form.Select
//                   value={item.itemCode}
//                   onChange={(e) => {
//                     const sel = items.find(
//                       (i) => i.itemCode === e.target.value,
//                     );
//                     const updated = [...issueData.items];
//                     updated[idx] = {
//                       ...updated[idx],
//                       itemCode: sel.itemCode,
//                       itemName: sel.itemName,
//                     };
//                     setIssueData({ ...issueData, items: updated });
//                   }}
//                 >
//                   <option value="">-- Pick Item --</option>
//                   {items
//                     .filter((i) => i.branch === currentUser.branch)
//                     .filter((i) => {
//                       if (currentUser.role === "warden_food")
//                         return i.category === "Food";
//                       if (currentUser.role === "warden_nonfood")
//                         return i.category !== "Food";
//                       return true;
//                     })
//                     .map((i) => (
//                       <option key={i._id} value={i.itemCode}>
//                         {i.itemCode} | {i.itemName}
//                       </option>
//                     ))}
//                 </Form.Select>
//               </Col>
//               <Col md={3}>
//                 <Form.Control
//                   type="number"
//                   placeholder="Qty"
//                   value={item.quantity}
//                   onChange={(e) => {
//                     const updated = [...issueData.items];
//                     updated[idx].quantity = e.target.value;
//                     setIssueData({ ...issueData, items: updated });
//                   }}
//                 />
//               </Col>
//               <Col md={2}>
//                 {issueData.items.length > 1 && (
//                   <Button
//                     variant="link"
//                     className="text-danger"
//                     onClick={() => {
//                       const updated = issueData.items.filter(
//                         (_, i) => i !== idx,
//                       );
//                       setIssueData({ ...issueData, items: updated });
//                     }}
//                   >
//                     <FaTrash />
//                   </Button>
//                 )}
//               </Col>
//             </Row>
//           ))}
//           <Button
//             variant="link"
//             size="sm"
//             onClick={() =>
//               setIssueData({
//                 ...issueData,
//                 items: [
//                   ...issueData.items,
//                   { itemName: "", itemCode: "", quantity: "", unit: "kg" },
//                 ],
//               })
//             }
//           >
//             <FaPlus /> Add Item
//           </Button>
//           <Button className="w-100 mt-3 btn-ashram" onClick={handleIssueStock}>
//             Confirm & Generate Slip
//           </Button>
//         </Modal.Body>
//       </Modal>

//       {/* --- LEDGER / HISTORY MODAL --- */}
//       <Modal
//         show={showHistoryModal}
//         onHide={() => setShowHistoryModal(false)}
//         size="lg"
//       >
//         <Modal.Header closeButton>
//           <Modal.Title>
//             Stock Ledger: {selectedItemHistory?.itemName}
//           </Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           <Table striped bordered hover size="sm">
//             <thead className="bg-light">
//               <tr>
//                 <th>Date</th>
//                 <th>User</th>
//                 <th>Type</th>
//                 <th>Qty</th>
//                 <th>Ref</th>
//               </tr>
//             </thead>
//             <tbody>
//               {selectedItemHistory?.stockHistory
//                 ?.slice()
//                 .reverse()
//                 .map((log, idx) => (
//                   <tr key={idx}>
//                     <td>{new Date(log.date).toLocaleDateString()}</td>
//                     <td className="small text-primary fw-bold">
//                       <FaUser size={10} /> {log.addedBy?.name || "System"}
//                     </td>
//                     <td>
//                       <Badge bg="secondary">{log.changeType}</Badge>
//                     </td>
//                     <td
//                       className={`fw-bold ${log.quantityChange > 0 ? "text-success" : "text-danger"}`}
//                     >
//                       {log.quantityChange > 0 ? "+" : ""}
//                       {log.quantityChange}
//                     </td>
//                     <td className="small">
//                       {log.remarks || log.vendor || "-"}
//                       {log.changeType === "Donation" && (
//                         <Button
//                           size="sm"
//                           variant="link"
//                           className="p-0 ms-2"
//                           onClick={() =>
//                             handlePrintMaterialReceipt(
//                               log,
//                               selectedItemHistory.itemName,
//                             )
//                           }
//                         >
//                           <FaPrint />
//                         </Button>
//                       )}
//                     </td>
//                   </tr>
//                 ))}
//             </tbody>
//           </Table>
//         </Modal.Body>
//       </Modal>

//       {/* --- CONSUME MODAL --- */}
//       <Modal show={showConsumeModal} onHide={() => setShowConsumeModal(false)}>
//         <Modal.Header closeButton>
//           <Modal.Title>Daily Usage Entry</Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           <Form
//             onSubmit={async (e) => {
//               e.preventDefault();
//               try {
//                 const config = {
//                   headers: { Authorization: `Bearer ${currentUser.token}` },
//                 };
//                 await axios.post(
//                   `${BASE_URL}/api/inventory/consume`,
//                   {
//                     itemId: selectedItem._id,
//                     quantity: consumeData.quantity,
//                     reason: consumeData.reason,
//                   },
//                   config,
//                 );
//                 alert("Recorded!");
//                 setShowConsumeModal(false);
//                 fetchInventory(currentUser);
//               } catch (err) {
//                 alert("Error");
//               }
//             }}
//           >
//             <Form.Control
//               type="number"
//               placeholder="Quantity Used"
//               className="mb-2"
//               value={consumeData.quantity}
//               onChange={(e) =>
//                 setConsumeData({ ...consumeData, quantity: e.target.value })
//               }
//               required
//             />
//             <Form.Control
//               placeholder="Reason (e.g. Cooking Lunch)"
//               className="mb-3"
//               value={consumeData.reason}
//               onChange={(e) =>
//                 setConsumeData({ ...consumeData, reason: e.target.value })
//               }
//               required
//             />
//             <Button type="submit" variant="warning" className="w-100">
//               Post Consumption
//             </Button>
//           </Form>
//         </Modal.Body>
//       </Modal>

//       {/* --- REPORT MODAL --- */}
//       <Modal
//         show={showReportModal}
//         onHide={() => setShowReportModal(false)}
//         size="xl"
//       >
//         <Modal.Header closeButton>
//           <Modal.Title>Stock Analysis Report</Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           <Row className="mb-4 align-items-end">
//             <Col md={3}>
//               <Form.Label>Start</Form.Label>
//               <Form.Control
//                 type="date"
//                 value={reportParams.startDate}
//                 onChange={(e) =>
//                   setReportParams({
//                     ...reportParams,
//                     startDate: e.target.value,
//                   })
//                 }
//               />
//             </Col>
//             <Col md={3}>
//               <Form.Label>End</Form.Label>
//               <Form.Control
//                 type="date"
//                 value={reportParams.endDate}
//                 onChange={(e) =>
//                   setReportParams({ ...reportParams, endDate: e.target.value })
//                 }
//               />
//             </Col>
//             <Col md={3}>
//               <Form.Label>Branch</Form.Label>
//               <Form.Select
//                 value={reportParams.branch}
//                 onChange={(e) =>
//                   setReportParams({ ...reportParams, branch: e.target.value })
//                 }
//               >
//                 <option value="KarunaSri Seva Samithi">HQ (KSS)</option>
//                 <option value="Karunya Sindhu">KSA (Sindhu)</option>
//                 <option value="Karunya Bharathi">KBA (Bharathi)</option>
//                 <option value="Karunya Jyothi">KJA (Jyothi)</option>
//               </Form.Select>
//             </Col>
//             <Col md={3}>
//               <Button
//                 className="w-100 btn-ashram"
//                 onClick={async () => {
//                   const config = {
//                     headers: { Authorization: `Bearer ${currentUser.token}` },
//                   };
//                   const { data } = await axios.get(
//                     `${BASE_URL}/api/inventory/report?startDate=${reportParams.startDate}&endDate=${reportParams.endDate}&branch=${reportParams.branch}`,
//                     config,
//                   );
//                   setReportData(data);
//                 }}
//               >
//                 Generate
//               </Button>
//             </Col>
//           </Row>
//           {reportData.length > 0 && (
//             <Table bordered size="sm" className="text-center">
//               <thead className="bg-light">
//                 <tr>
//                   <th>Item</th>
//                   <th>Opening</th>
//                   <th className="text-success">Inward</th>
//                   <th className="text-danger">Outward</th>
//                   <th>Closing</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {reportData.map((r, i) => (
//                   <tr key={i}>
//                     <td>{r.itemName}</td>
//                     <td>{r.openingBalance}</td>
//                     <td className="text-success">+{r.inward}</td>
//                     <td className="text-danger">-{r.outward}</td>
//                     <td className="fw-bold">{r.closingBalance}</td>
//                   </tr>
//                 ))}
//               </tbody>
//             </Table>
//           )}
//         </Modal.Body>
//       </Modal>
//     </div>
//   );
// };

// export default InventoryList;
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
  ButtonGroup,
  Spinner,
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
  FaUser,
  FaPrint,
  FaFilter,
} from "react-icons/fa";
import axios from "axios";

const InventoryList = () => {
  const [activeTab, setActiveTab] = useState("stock");
  const [items, setItems] = useState([]);
  const [transfers, setTransfers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // --- FILTER STATES ---
  const [filterBranch, setFilterBranch] = useState("All");
  const [filterCategory, setFilterCategory] = useState("All");

  // --- MODAL STATES ---
  const [showModal, setShowModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [showConsumeModal, setShowConsumeModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedItemHistory, setSelectedItemHistory] = useState(null);

  // --- FORM DATA: ADD STOCK ---
  const [formData, setFormData] = useState({
    itemCode: "",
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
    donorPhone: "",
    donorAddress: "",
    branch: "KarunaSri Seva Samithi",
  });

  const [issueData, setIssueData] = useState({
    toBranch: "Karunya Sindhu",
    remarks: "",
    items: [{ itemName: "", itemCode: "", quantity: "", unit: "kg" }],
  });

  const [consumeData, setConsumeData] = useState({ quantity: "", reason: "" });

  const [reportParams, setReportParams] = useState({
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
    branch: "",
  });
  const [reportData, setReportData] = useState([]);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("userInfo"));
    setCurrentUser(user);
    if (user) {
      fetchInventory(user);
      fetchTransfers(user);

      // Initial Filter Logic
      if (user.role !== "admin") {
        setFilterBranch(user.branch);
      }

      setReportParams((prev) => ({
        ...prev,
        branch: user.branch || "KarunaSri Seva Samithi",
      }));
      setFormData((prev) => ({
        ...prev,
        branch: user.branch || "KarunaSri Seva Samithi",
      }));
    }
  }, []);

  const fetchInventory = async (user) => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get(`${BASE_URL}/api/inventory`, config);
      setItems(data);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.itemCode || !formData.quantity)
      return alert("Select an item and enter quantity");

    try {
      const config = {
        headers: { Authorization: `Bearer ${currentUser.token}` },
      };
      const payload = { ...formData, quantity: Number(formData.quantity) };
      await axios.post(`${BASE_URL}/api/inventory`, payload, config);

      setShowModal(false);
      fetchInventory(currentUser);
      alert("Stock Updated Successfully!");
      setFormData({
        itemCode: "",
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
        donorPhone: "",
        donorAddress: "",
        branch: currentUser.branch || "KarunaSri Seva Samithi",
      });
    } catch (error) {
      alert(error.response?.data?.message || "Error updating stock");
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === "checkbox" ? checked : value;

    if (name === "unitCost" || name === "quantity") {
      const qty = name === "quantity" ? val : formData.quantity;
      const cost = name === "unitCost" ? val : formData.unitCost;
      setFormData((prev) => ({
        ...prev,
        [name]: val,
        totalCost: qty && cost ? (qty * cost).toFixed(2) : prev.totalCost,
      }));
    } else {
      setFormData({ ...formData, [name]: val });
    }
  };

  const handleIssueStock = async () => {
    const validItems = issueData.items.filter((i) => i.itemCode && i.quantity);
    if (validItems.length === 0) return alert("Add at least one valid item.");
    try {
      const config = {
        headers: { Authorization: `Bearer ${currentUser.token}` },
      };
      await axios.post(
        `${BASE_URL}/api/inventory/transfer/issue`,
        { ...issueData, items: validItems },
        config,
      );
      alert("Issue Slip Created!");
      setShowIssueModal(false);
      fetchInventory(currentUser);
      fetchTransfers(currentUser);
      setIssueData({
        toBranch: "Karunya Sindhu",
        remarks: "",
        items: [{ itemName: "", itemCode: "", quantity: "", unit: "kg" }],
      });
    } catch (error) {
      alert("Error");
    }
  };

  const handleReceiveStock = async (transferId) => {
    if (!window.confirm("Confirm receipt?")) return;
    try {
      const config = {
        headers: { Authorization: `Bearer ${currentUser.token}` },
      };
      await axios.put(
        `${BASE_URL}/api/inventory/transfer/receive`,
        { transferId },
        config,
      );
      alert("Received!");
      fetchInventory(currentUser);
      fetchTransfers(currentUser);
    } catch (error) {
      alert("Error");
    }
  };

  const handlePrintMaterialReceipt = (log, itemName) => {
    const win = window.open("", "", "height=600,width=800");
    win.document.write(
      "<html><head><title>Material Receipt</title></head><body>",
    );
    win.document.write(
      '<div style="font-family:sans-serif; padding:40px; border:2px solid #581818; text-align:center;">',
    );
    win.document.write(
      '<h2 style="color:#581818; margin:0;">KARUNASRI SEVA SAMITHI</h2><p>H.No.17-1-474, Krishna Nagar, Saidabad, Hyderabad</p><hr/>',
    );
    win.document.write("<h3>MATERIAL ACKNOWLEDGEMENT RECEIPT</h3>");
    win.document.write(
      '<div style="text-align:left; margin-top:30px; font-size:1.1rem;">',
    );
    win.document.write(
      `<p><strong>Date:</strong> ${new Date(log.date).toLocaleDateString()}</p>`,
    );
    win.document.write(
      `<p><strong>Received from:</strong> Sri/Smt. ${log.vendor || "Anonymous"}</p>`,
    );
    win.document.write(
      `<table border="1" style="width:100%; text-align:center; border-collapse:collapse; margin-top:20px;"><tr style="background:#eee;"><th>Description</th><th>Quantity</th></tr><tr><td>${itemName}</td><td>${log.quantityChange}</td></tr></table>`,
    );
    win.document.write(
      "<br/><p>Thank you for your generous contribution.</p></div></div></body></html>",
    );
    win.document.close();
    win.print();
  };

  // --- FILTERED TABLE LOGIC ---
  const filteredItems = items.filter((i) => {
    const branchMatch =
      filterBranch === "All" ? true : i.branch === filterBranch;
    const catMatch =
      filterCategory === "All" ? true : i.category === filterCategory;
    return branchMatch && catMatch;
  });

  if (loading)
    return (
      <div className="text-center py-5">
        <Spinner animation="border" />
      </div>
    );

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
            Secure Master Stock Control System
          </p>
        </Col>

        <Col lg={7} xs={12}>
          <div className="d-flex flex-wrap gap-2 justify-content-lg-end">
            <Button
              variant="info"
              className="text-white shadow-sm"
              onClick={() => setShowReportModal(true)}
            >
              <FaChartBar className="me-1" /> Analysis
            </Button>
            <Link
              to="/dashboard/inventory/history"
              className="btn btn-outline-secondary shadow-sm"
            >
              <FaHistory className="me-1" /> Audit Logs
            </Link>
            <Link
              to="/dashboard/inventory/audit"
              className="btn btn-outline-dark shadow-sm"
            >
              <FaClipboardList className="me-1" /> Stock Count
            </Link>
            {(currentUser?.role === "admin" ||
              currentUser?.role === "warden_food" ||
              currentUser?.role === "warden_nonfood") && (
              <>
                <Button
                  variant="warning"
                  className="shadow-sm"
                  onClick={() => setShowIssueModal(true)}
                >
                  <FaTruck className="me-1" /> Issue Slip
                </Button>
                <Button
                  variant="primary"
                  className="shadow-sm"
                  style={{ backgroundColor: "#581818", border: "none" }}
                  onClick={() => setShowModal(true)}
                >
                  <FaPlus className="me-1" /> Add Stock
                </Button>
              </>
            )}
          </div>
        </Col>
      </Row>

      {/* --- STATS CARDS (RESTORED) --- */}
      <Row className="mb-4">
        <Col lg={4} md={6} xs={12} className="mb-3">
          <Card className="p-3 text-center border-0 shadow-sm h-100">
            <h3 className="text-success fw-bold m-0">
              {items.filter((i) => i.category === "Food").length}
            </h3>
            <small className="text-muted text-uppercase fw-bold">
              Food Items Managed
            </small>
          </Card>
        </Col>
        <Col lg={4} md={6} xs={12} className="mb-3">
          <Card className="p-3 text-center border-0 shadow-sm h-100">
            <h3 className="text-primary fw-bold m-0">
              {items.filter((i) => i.category !== "Food").length}
            </h3>
            <small className="text-muted text-uppercase fw-bold">
              Non-Food Items Managed
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
            <small className="text-muted text-uppercase fw-bold">
              Critical Low Stock Alerts
            </small>
          </Card>
        </Col>
      </Row>

      {/* --- FILTER BAR (RESTORED & ENHANCED) --- */}
      <Card className="mb-4 border-0 shadow-sm bg-light">
        <Card.Body className="py-2">
          <Row className="align-items-center">
            <Col md={1} className="text-muted">
              <FaFilter /> Filter:
            </Col>
            {currentUser.role === "admin" && (
              <Col md={3}>
                <Form.Select
                  size="sm"
                  value={filterBranch}
                  onChange={(e) => setFilterBranch(e.target.value)}
                >
                  <option value="All">All Branches</option>
                  <option value="KarunaSri Seva Samithi">KSS (HQ)</option>
                  <option value="Karunya Sindhu">KSA (Sindhu)</option>
                  <option value="Karunya Bharathi">KBA (Bharathi)</option>
                  <option value="Karunya Jyothi">KJA (Jyothi)</option>
                </Form.Select>
              </Col>
            )}
            <Col md={4}>
              <ButtonGroup size="sm">
                <Button
                  variant={filterCategory === "All" ? "dark" : "outline-dark"}
                  onClick={() => setFilterCategory("All")}
                >
                  All Categories
                </Button>
                <Button
                  variant={filterCategory === "Food" ? "dark" : "outline-dark"}
                  onClick={() => setFilterCategory("Food")}
                >
                  Food
                </Button>
                <Button
                  variant={
                    filterCategory === "Non-Food" ? "dark" : "outline-dark"
                  }
                  onClick={() => setFilterCategory("Non-Food")}
                >
                  Non-Food
                </Button>
              </ButtonGroup>
            </Col>
            <Col className="text-end text-muted small">
              Displaying {filteredItems.length} SKUs
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Tabs
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k)}
        className="mb-4"
      >
        <Tab
          eventKey="stock"
          title={
            <span>
              <FaBoxOpen className="me-2" /> Stock Register
            </span>
          }
        >
          <Card className="shadow-sm border-0">
            <Card.Body className="p-0">
              <Table hover responsive className="align-middle mb-0">
                <thead
                  className="bg-light text-uppercase"
                  style={{ fontSize: "0.75rem" }}
                >
                  <tr>
                    <th className="ps-4">Code</th>
                    <th>Item Name</th>
                    <th>Category</th>
                    <th>Branch</th>
                    <th>Quantity</th>
                    <th>Status</th>
                    <th>Expiry</th>
                    <th className="text-end pe-4">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map((item) => (
                    <tr key={item._id}>
                      <td className="ps-4 text-primary fw-bold">
                        {item.itemCode}
                      </td>
                      <td className="fw-bold">{item.itemName}</td>
                      <td>
                        <Badge
                          bg={item.category === "Food" ? "success" : "info"}
                          text={item.category === "Food" ? "white" : "dark"}
                        >
                          {item.category}
                        </Badge>
                      </td>
                      <td>
                        <small className="text-muted fw-bold">
                          {item.branch}
                        </small>
                      </td>
                      <td>
                        <div className="d-flex align-items-center">
                          <span className="me-2 fw-bold">
                            {item.quantity} {item.unit}
                          </span>
                          <ProgressBar
                            now={Math.min(item.quantity, 100)}
                            variant={item.quantity < 10 ? "danger" : "success"}
                            style={{ width: "50px", height: "5px" }}
                          />
                        </div>
                      </td>
                      <td>
                        {item.quantity < 10 ? (
                          <Badge bg="danger">Low Stock</Badge>
                        ) : (
                          <Badge bg="success">Healthy</Badge>
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
                          title="Daily Usage"
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
                          title="Stock Ledger"
                          onClick={() => {
                            setSelectedItemHistory(item);
                            setShowHistoryModal(true);
                          }}
                        >
                          <FaListAlt /> Ledger
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {filteredItems.length === 0 && (
                    <tr>
                      <td colSpan="8" className="text-center py-5 text-muted">
                        No items found matching the current filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Tab>

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
                    <th className="ps-4">Slip No</th>
                    <th>From</th>
                    <th>To</th>
                    <th>Items</th>
                    <th>Status</th>
                    <th className="text-end pe-4">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {transfers.map((tr) => (
                    <tr key={tr._id}>
                      <td className="ps-4 fw-bold">{tr.transferNo}</td>
                      <td>{tr.fromBranch}</td>
                      <td className="fw-bold">{tr.toBranch}</td>
                      <td className="small">
                        {tr.items
                          .map((i) => `${i.itemName}(${i.quantity})`)
                          .join(", ")}
                      </td>
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
                          currentUser.role === "admin") ? (
                          <Button
                            size="sm"
                            variant="success"
                            onClick={() => handleReceiveStock(tr._id)}
                          >
                            Receive Goods
                          </Button>
                        ) : (
                          <span className="text-muted small">Completed</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Tab>
      </Tabs>

      {/* --- ADD STOCK MODAL (FINAL VERSION) --- */}
      {/* <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Inventory Inward Entry</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Row className="mb-4">
              <Col md={4}>
                <Form.Label className="fw-bold">1. Select Branch</Form.Label>
                <Form.Select
                  name="branch"
                  value={formData.branch}
                  onChange={handleChange}
                  disabled={currentUser?.role !== "admin"}
                >
                  <option value="KarunaSri Seva Samithi">KSS (HQ)</option>
                  <option value="Karunya Sindhu">KSA (Sindhu)</option>
                  <option value="Karunya Bharathi">KBA (Bharathi)</option>
                  <option value="Karunya Jyothi">KJA (Jyothi)</option>
                </Form.Select>
              </Col>
              <Col md={4}>
                <Form.Label className="fw-bold">
                  2. Select Item (Master)
                </Form.Label>
                <Form.Select
                  name="itemCode"
                  value={formData.itemCode}
                  onChange={(e) => {
                    const selected = items.find(
                      (i) => i.itemCode === e.target.value,
                    );
                    if (selected) {
                      setFormData({
                        ...formData,
                        itemCode: selected.itemCode,
                        itemName: selected.itemName,
                        category: selected.category,
                      });
                    }
                  }}
                  required
                >
                  <option value="">-- Choose Item --</option>
                  {items
                    .filter((i) => i.branch === formData.branch)
                    .filter((i) => {
                      if (currentUser.role === "warden_food")
                        return i.category === "Food";
                      if (currentUser.role === "warden_nonfood")
                        return i.category !== "Food";
                      return true;
                    })
                    .map((i) => (
                      <option key={i._id} value={i.itemCode}>
                        {i.itemCode} | {i.itemName}
                      </option>
                    ))}
                </Form.Select>
              </Col>
              <Col md={4}>
                <Form.Label className="fw-bold">3. Category</Form.Label>
                <Form.Select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                >
                  <option value="Food">Food</option>
                  <option value="Non-Food">Non-Food</option>
                  <option value="Medical">Medical</option>
                  <option value="General">General</option>
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
                  <option>Numbers</option>
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

            <h6 className="text-maroon fw-bold mt-4">Inward Source Details</h6>
            <Form.Group className="mb-3 d-flex gap-3">
              <Form.Check
                type="radio"
                label="Purchase"
                name="sourceType"
                value="Purchase"
                checked={formData.sourceType === "Purchase"}
                onChange={handleChange}
              />
              <Form.Check
                type="radio"
                label="Donation"
                name="sourceType"
                value="Donation"
                checked={formData.sourceType === "Donation"}
                onChange={handleChange}
              />
            </Form.Group>

            {formData.sourceType === "Purchase" ? (
              <Row>
                <Col md={6}>
                  <Form.Label>Vendor Name</Form.Label>
                  <Form.Control
                    name="vendor"
                    value={formData.vendor}
                    onChange={handleChange}
                  />
                </Col>
                <Col md={6}>
                  <Form.Label>Invoice #</Form.Label>
                  <Form.Control
                    name="invoiceNo"
                    value={formData.invoiceNo}
                    onChange={handleChange}
                  />
                </Col>
              </Row>
            ) : (
              <Row>
                <Col md={6}>
                  <Form.Label>Donor Name</Form.Label>
                  <Form.Control
                    name="vendor"
                    value={formData.vendor}
                    onChange={handleChange}
                  />
                </Col>
                <Col md={6}>
                  <Form.Label>Phone</Form.Label>
                  <Form.Control
                    name="donorPhone"
                    value={formData.donorPhone}
                    onChange={handleChange}
                  />
                </Col>
              </Row>
            )}

            <Button type="submit" className="w-100 mt-4 btn-ashram shadow-sm">
              Post Inward Entry
            </Button>
          </Form>
        </Modal.Body>
      </Modal> */}
      {/* --- ADD STOCK MODAL (DETAILED LAYOUT) --- */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Add / Update Stock</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Label>Item Name (Master List)</Form.Label>
                <Form.Select
                  name="itemCode"
                  value={formData.itemCode}
                  onChange={(e) => {
                    const selected = items.find(
                      (i) => i.itemCode === e.target.value,
                    );
                    if (selected) {
                      setFormData({
                        ...formData,
                        itemCode: selected.itemCode,
                        itemName: selected.itemName,
                        category: selected.category,
                      });
                    }
                  }}
                  required
                >
                  <option value="">-- Choose Item --</option>
                  {items
                    .filter((i) => i.branch === formData.branch)
                    .filter((i) => {
                      if (currentUser.role === "warden_food")
                        return i.category === "Food";
                      if (currentUser.role === "warden_nonfood")
                        return i.category !== "Food";
                      return true;
                    })
                    .map((i) => (
                      <option key={i._id} value={i.itemCode}>
                        {i.itemCode} | {i.itemName}
                      </option>
                    ))}
                </Form.Select>
              </Col>
              <Col md={6}>
                <Form.Label>Category</Form.Label>
                <Form.Select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                >
                  <option value="Food">Food</option>
                  <option value="Non-Food">Non-Food</option>
                  <option value="Medical">Medical</option>
                  <option value="General">General</option>
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
                  <option>Numbers</option>
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

            <hr />
            <h6 className="text-maroon fw-bold mb-3">Source & Cost Details</h6>

            <Form.Group className="mb-3 d-flex gap-3">
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

            <Button type="submit" className="w-100 mt-4 btn-ashram shadow-sm">
              <FaBoxOpen className="me-2" /> Add Stock
            </Button>
          </Form>
        </Modal.Body>
      </Modal>

      {/* --- ISSUE SLIP MODAL --- */}
      {/* <Modal
        show={showIssueModal}
        onHide={() => setShowIssueModal(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Inter-Branch Transfer Slip</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Label>Target Ashram / Branch</Form.Label>
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
            <option value="KarunaSri Seva Samithi">
              KarunaSri Seva Samithi
            </option>
          </Form.Select>
          {issueData.items.map((item, idx) => (
            <Row key={idx} className="mb-2 g-2">
              <Col md={7}>
                <Form.Select
                  value={item.itemCode}
                  onChange={(e) => {
                    const sel = items.find(
                      (i) => i.itemCode === e.target.value,
                    );
                    const updated = [...issueData.items];
                    updated[idx] = {
                      ...updated[idx],
                      itemCode: sel.itemCode,
                      itemName: sel.itemName,
                    };
                    setIssueData({ ...issueData, items: updated });
                  }}
                >
                  <option value="">-- Pick Master Item --</option>
                  {items
                    .filter((i) => i.branch === currentUser.branch)
                    .filter((i) => {
                      if (currentUser.role === "warden_food")
                        return i.category === "Food";
                      if (currentUser.role === "warden_nonfood")
                        return i.category !== "Food";
                      return true;
                    })
                    .map((i) => (
                      <option key={i._id} value={i.itemCode}>
                        {i.itemCode} | {i.itemName}
                      </option>
                    ))}
                </Form.Select>
              </Col>
              <Col md={3}>
                <Form.Control
                  type="number"
                  placeholder="Qty"
                  value={item.quantity}
                  onChange={(e) => {
                    const updated = [...issueData.items];
                    updated[idx].quantity = e.target.value;
                    setIssueData({ ...issueData, items: updated });
                  }}
                />
              </Col>
              <Col md={2}>
                {issueData.items.length > 1 && (
                  <Button
                    variant="link"
                    className="text-danger"
                    onClick={() => {
                      const updated = issueData.items.filter(
                        (_, i) => i !== idx,
                      );
                      setIssueData({ ...issueData, items: updated });
                    }}
                  >
                    <FaTrash />
                  </Button>
                )}
              </Col>
            </Row>
          ))}
          <Button
            variant="link"
            size="sm"
            onClick={() =>
              setIssueData({
                ...issueData,
                items: [
                  ...issueData.items,
                  { itemName: "", itemCode: "", quantity: "", unit: "kg" },
                ],
              })
            }
          >
            <FaPlus /> Add Another Item
          </Button>
          <Button
            className="w-100 mt-3 btn-ashram shadow-sm"
            onClick={handleIssueStock}
          >
            Post Transfer & Generate Slip
          </Button>
        </Modal.Body>
      </Modal> */}
      {/* --- CREATE TRANSFER SLIP MODAL --- */}
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
            <option value="KarunaSri Seva Samithi">
              KarunaSri Seva Samithi
            </option>
          </Form.Select>

          {issueData.items.map((item, idx) => (
            <Row key={idx} className="mb-2 g-2 align-items-center">
              <Col md={6}>
                <Form.Select
                  value={item.itemCode}
                  onChange={(e) => {
                    const sel = items.find(
                      (i) => i.itemCode === e.target.value,
                    );
                    const updated = [...issueData.items];
                    updated[idx] = {
                      ...updated[idx],
                      itemCode: sel.itemCode,
                      itemName: sel.itemName,
                    };
                    setIssueData({ ...issueData, items: updated });
                  }}
                >
                  <option value="">-- Select Item --</option>
                  {items
                    .filter((i) => i.branch === currentUser.branch)
                    .filter((i) => {
                      if (currentUser.role === "warden_food")
                        return i.category === "Food";
                      if (currentUser.role === "warden_nonfood")
                        return i.category !== "Food";
                      return true;
                    })
                    .map((i) => (
                      <option key={i._id} value={i.itemCode}>
                        {i.itemCode} | {i.itemName}
                      </option>
                    ))}
                </Form.Select>
              </Col>
              <Col md={3}>
                <Form.Control
                  type="number"
                  placeholder="Qty"
                  value={item.quantity}
                  onChange={(e) => {
                    const updated = [...issueData.items];
                    updated[idx].quantity = e.target.value;
                    setIssueData({ ...issueData, items: updated });
                  }}
                />
              </Col>
              <Col md={2}>
                <Form.Select
                  value={item.unit}
                  onChange={(e) => {
                    const updated = [...issueData.items];
                    updated[idx].unit = e.target.value;
                    setIssueData({ ...issueData, items: updated });
                  }}
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
                    onClick={() => {
                      const updated = issueData.items.filter(
                        (_, i) => i !== idx,
                      );
                      setIssueData({ ...issueData, items: updated });
                    }}
                  >
                    <FaTrash />
                  </Button>
                )}
              </Col>
            </Row>
          ))}

          <Button
            variant="primary"
            onClick={() =>
              setIssueData({
                ...issueData,
                items: [
                  ...issueData.items,
                  { itemName: "", itemCode: "", quantity: "", unit: "kg" },
                ],
              })
            }
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

      {/* --- HISTORY / LEDGER MODAL --- */}
      <Modal
        show={showHistoryModal}
        onHide={() => setShowHistoryModal(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            Stock Ledger: {selectedItemHistory?.itemName}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Table striped bordered hover size="sm">
            <thead className="bg-light">
              <tr>
                <th>Date</th>
                <th>User</th>
                <th>Type</th>
                <th>Qty</th>
                <th>Ref / Remark</th>
              </tr>
            </thead>
            <tbody>
              {selectedItemHistory?.stockHistory
                ?.slice()
                .reverse()
                .map((log, idx) => (
                  <tr key={idx}>
                    <td>{new Date(log.date).toLocaleDateString()}</td>
                    <td className="small text-primary fw-bold">
                      <FaUser size={10} className="me-1" />
                      {log.addedBy?.name || "System"}
                    </td>
                    <td>
                      <Badge bg="secondary">{log.changeType}</Badge>
                    </td>
                    <td
                      className={`fw-bold ${log.quantityChange > 0 ? "text-success" : "text-danger"}`}
                    >
                      {log.quantityChange > 0 ? "+" : ""}
                      {log.quantityChange}
                    </td>
                    <td className="small">
                      {log.remarks || log.vendor || "-"}
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
                        >
                          <FaPrint />
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>
          </Table>
        </Modal.Body>
      </Modal>

      {/* --- CONSUME MODAL --- */}
      <Modal show={showConsumeModal} onHide={() => setShowConsumeModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Record Daily Usage</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form
            onSubmit={async (e) => {
              e.preventDefault();
              try {
                const config = {
                  headers: { Authorization: `Bearer ${currentUser.token}` },
                };
                await axios.post(
                  `${BASE_URL}/api/inventory/consume`,
                  {
                    itemId: selectedItem._id,
                    quantity: consumeData.quantity,
                    reason: consumeData.reason,
                  },
                  config,
                );
                alert("Success! Consumption recorded.");
                setShowConsumeModal(false);
                fetchInventory(currentUser);
              } catch (err) {
                alert("Error recording usage");
              }
            }}
          >
            <Form.Control
              type="number"
              placeholder="Quantity Used"
              className="mb-2"
              value={consumeData.quantity}
              onChange={(e) =>
                setConsumeData({ ...consumeData, quantity: e.target.value })
              }
              required
            />
            <Form.Control
              placeholder="Purpose (e.g. Student Breakfast)"
              className="mb-3"
              value={consumeData.reason}
              onChange={(e) =>
                setConsumeData({ ...consumeData, reason: e.target.value })
              }
              required
            />
            <Button type="submit" variant="warning" className="w-100 shadow-sm">
              Confirm & Post
            </Button>
          </Form>
        </Modal.Body>
      </Modal>

      {/* --- REPORT MODAL --- */}
      <Modal
        show={showReportModal}
        onHide={() => setShowReportModal(false)}
        size="xl"
      >
        <Modal.Header closeButton>
          <Modal.Title>Master Stock Analysis</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row className="mb-4 align-items-end">
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
                  setReportParams({ ...reportParams, endDate: e.target.value })
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
                <option value="KarunaSri Seva Samithi">HQ (KSS)</option>
                <option value="Karunya Sindhu">KSA (Sindhu)</option>
                <option value="Karunya Bharathi">KBA (Bharathi)</option>
                <option value="Karunya Jyothi">KJA (Jyothi)</option>
              </Form.Select>
            </Col>
            <Col md={3}>
              <Button
                className="w-100 btn-ashram shadow-sm"
                onClick={async () => {
                  const config = {
                    headers: { Authorization: `Bearer ${currentUser.token}` },
                  };
                  const { data } = await axios.get(
                    `${BASE_URL}/api/inventory/report?startDate=${reportParams.startDate}&endDate=${reportParams.endDate}&branch=${reportParams.branch}`,
                    config,
                  );
                  setReportData(data);
                }}
              >
                Generate Statement
              </Button>
            </Col>
          </Row>
          {reportData.length > 0 && (
            <Table bordered size="sm" className="text-center align-middle">
              <thead
                className="bg-light text-uppercase"
                style={{ fontSize: "0.8rem" }}
              >
                <tr>
                  <th>Master Code / Description</th>
                  <th>Opening</th>
                  <th className="text-success">Inward (+)</th>
                  <th className="text-danger">Outward (-)</th>
                  <th className="bg-white">Closing</th>
                </tr>
              </thead>
              <tbody>
                {reportData.map((r, i) => (
                  <tr key={i}>
                    <td className="text-start ps-3 fw-bold">
                      {r.itemCode} - {r.itemName}
                    </td>
                    <td>{r.openingBalance}</td>
                    <td className="text-success">+{r.inward}</td>
                    <td className="text-danger">-{r.outward}</td>
                    <td className="fw-bold bg-light">{r.closingBalance}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default InventoryList;
