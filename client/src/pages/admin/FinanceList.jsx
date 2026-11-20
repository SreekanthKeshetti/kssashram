// /* eslint-disable no-unused-vars */
// /* eslint-disable react-hooks/immutability */
// import React, { useEffect, useState } from "react";
// import axios from "axios";
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
//   Alert,
//   Spinner,
// } from "react-bootstrap";
// import {
//   FaPlus,
//   FaCheck,
//   FaFilePdf,
//   FaFileDownload,
//   FaExchangeAlt,
//   FaBan,
//   FaPaperclip,
//   FaImages,
//   FaEye,
//   FaTrash,
//   FaLock,
// } from "react-icons/fa";
// import { Link, useLocation } from "react-router-dom";

// const FinanceList = () => {
//   const location = useLocation();
//   const [vouchers, setVouchers] = useState([]);
//   const [accountHeads, setAccountHeads] = useState([]);
//   const [bankAccounts, setBankAccounts] = useState([]);

//   const [showModal, setShowModal] = useState(false);
//   const [showTransferModal, setShowTransferModal] = useState(false);
//   const [showCancelModal, setShowCancelModal] = useState(false);
//   const [cancelData, setCancelData] = useState({ id: "", reason: "" });

//   const [userInfo, setUserInfo] = useState(null);
//   const [statusFilter, setStatusFilter] = useState("All");
//   const [dateFilter, setDateFilter] = useState({ start: "", end: "" });
//   const [currentBalance, setCurrentBalance] = useState(0);

//   // --- BILLS & INVOICE ATTACHMENTS STATE (OPTION B) ---
//   const [showBillsModal, setShowBillsModal] = useState(false);
//   const [selectedVoucherForBills, setSelectedVoucherForBills] = useState(null);
//   const [modalBillFiles, setModalBillFiles] = useState([]);
//   const [modalBillPreviews, setModalBillPreviews] = useState([]);
//   const [uploadingBills, setUploadingBills] = useState(false);
//   const [previewImage, setPreviewImage] = useState(null);

//   // Files selected during voucher creation
//   const [creationFiles, setCreationFiles] = useState([]);
//   const [creationPreviews, setCreationPreviews] = useState([]);
//   const [createSubmitting, setCreateSubmitting] = useState(false);

//   const [formData, setFormData] = useState({
//     voucherType: "Debit",
//     accountHead: "",
//     amount: "",
//     description: "",
//     paymentMode: "Cash",
//     recipientName: "",
//     branch: "KarunaSri Seva Samithi",
//     paymentDetails: {
//       chequeNo: "",
//       chequeDate: "",
//       bankName: "",
//       transactionId: "",
//     },
//   });

//   const [transferData, setTransferData] = useState({
//     toBranch: "Karunya Sindhu",
//     amount: "",
//     paymentMode: "Bank Transfer",
//     description: "Monthly Fund Release",
//     paymentDetails: { transactionId: "", bankName: "" },
//   });

//   useEffect(() => {
//     const user = JSON.parse(localStorage.getItem("userInfo"));
//     setUserInfo(user);
//     if (user) {
//       fetchVouchers(user);
//       fetchAccountHeads(user);
//     }
//     if (location.state && location.state.filter) {
//       setStatusFilter(location.state.filter);
//     }
//     fetchBalance();
//   }, [location]);

//   const fetchBalance = async () => {
//     try {
//       const user = JSON.parse(localStorage.getItem("userInfo"));
//       const config = { headers: { Authorization: `Bearer ${user.token}` } };
//       const { data } = await axios.get(
//         `${BASE_URL}/api/finance/cash-balance`,
//         config,
//       );
//       setCurrentBalance(data.systemBalance);
//     } catch (error) {
//       console.error("Balance Error", error);
//     }
//   };

//   const fetchVouchers = async (user) => {
//     try {
//       const config = { headers: { Authorization: `Bearer ${user.token}` } };
//       const { data } = await axios.get(
//         `${BASE_URL}/api/finance/vouchers`,
//         config,
//       );
//       setVouchers(data);
//     } catch (error) {
//       console.error(error);
//     }
//   };

//   const fetchAccountHeads = async (user) => {
//     try {
//       const config = { headers: { Authorization: `Bearer ${user.token}` } };
//       const { data } = await axios.get(`${BASE_URL}/api/accounts`, config);
//       setAccountHeads(data);

//       const banks = data.filter(
//         (acc) =>
//           acc.name.toLowerCase().includes("bank") ||
//           acc.name.toLowerCase().includes("cash"),
//       );
//       setBankAccounts(banks);
//     } catch (error) {
//       console.error(error);
//     }
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;

//     if (
//       name === "voucherType" &&
//       value === "Debit" &&
//       formData.paymentMode === "UPI"
//     ) {
//       setFormData((prev) => ({
//         ...prev,
//         voucherType: value,
//         paymentMode: "Cash",
//       }));
//       return;
//     }

//     if (name === "paymentMode" && value === "Bank Deduction") {
//       setFormData((prev) => ({
//         ...prev,
//         paymentMode: value,
//         recipientName: "Bank",
//       }));
//     } else if (
//       ["chequeNo", "chequeDate", "bankName", "transactionId"].includes(name)
//     ) {
//       setFormData((prev) => ({
//         ...prev,
//         paymentDetails: { ...prev.paymentDetails, [name]: value },
//       }));
//     } else {
//       setFormData({ ...formData, [name]: value });
//     }
//   };

//   // Option B: File handling during creation
//   const handleCreationFileChange = (e) => {
//     const selectedFiles = Array.from(e.target.files);
//     setCreationFiles(selectedFiles);

//     const previews = selectedFiles.map((file) => ({
//       name: file.name,
//       url: URL.createObjectURL(file),
//       type: file.type,
//     }));
//     setCreationPreviews(previews);
//   };

//   // Option B: File handling inside the row modal
//   const handleModalBillChange = (e) => {
//     const selectedFiles = Array.from(e.target.files);
//     setModalBillFiles(selectedFiles);

//     const previews = selectedFiles.map((file) => ({
//       name: file.name,
//       url: URL.createObjectURL(file),
//       type: file.type,
//     }));
//     setModalBillPreviews(previews);
//   };

//   const openBillsModal = (voucher) => {
//     setSelectedVoucherForBills(voucher);
//     setModalBillFiles([]);
//     setModalBillPreviews([]);
//     setShowBillsModal(true);
//   };

//   const handleUploadAdditionalBills = async (e) => {
//     e.preventDefault();
//     if (modalBillFiles.length === 0)
//       return alert("Please choose files to upload");

//     setUploadingBills(true);
//     const fd = new FormData();
//     for (let i = 0; i < modalBillFiles.length; i++) {
//       fd.append("files", modalBillFiles[i]);
//     }

//     try {
//       const config = {
//         headers: {
//           "Content-Type": "multipart/form-data",
//           Authorization: `Bearer ${userInfo.token}`,
//         },
//       };

//       const { data } = await axios.post(
//         `${BASE_URL}/api/finance/vouchers/${selectedVoucherForBills._id}/upload`,
//         fd,
//         config,
//       );

//       alert("Bills uploaded successfully!");
//       setSelectedVoucherForBills((prev) => ({
//         ...prev,
//         attachments: data.attachments,
//       }));
//       setModalBillFiles([]);
//       setModalBillPreviews([]);
//       fetchVouchers(userInfo);
//     } catch (err) {
//       alert(err.response?.data?.message || "Failed to upload bills");
//     }
//     setUploadingBills(false);
//   };

//   const handleDeleteBill = async (filePath) => {
//     // Safety check feedback
//     if (
//       selectedVoucherForBills.status === "Approved" &&
//       userInfo.role !== "admin"
//     ) {
//       return alert(
//         "Action Blocked: Bills cannot be removed from an Approved Voucher.",
//       );
//     }

//     if (!window.confirm("Are you sure you want to delete this bill document?"))
//       return;

//     try {
//       const config = {
//         headers: { Authorization: `Bearer ${userInfo.token}` },
//         data: { filePath },
//       };

//       const { data } = await axios.delete(
//         `${BASE_URL}/api/finance/vouchers/${selectedVoucherForBills._id}/attachment`,
//         config,
//       );

//       alert("Bill attachment removed.");
//       setSelectedVoucherForBills((prev) => ({
//         ...prev,
//         attachments: data.attachments,
//       }));
//       fetchVouchers(userInfo);
//     } catch (err) {
//       alert(err.response?.data?.message || "Error deleting bill");
//     }
//   };

//   const renderPaymentFields = () => {
//     const mode = formData.paymentMode;
//     if (mode === "Cash") return null;

//     return (
//       <div className="bg-light p-2 rounded mb-3 border">
//         <h6 className="text-muted small mb-2 fw-bold">Payment Details</h6>
//         <Row className="g-2">
//           {mode === "Bank Deduction" ? (
//             <Col md={12}>
//               <Form.Label className="small">Select Bank Account *</Form.Label>
//               <Form.Select
//                 name="bankName"
//                 value={formData.paymentDetails.bankName}
//                 onChange={handleChange}
//                 required
//               >
//                 <option value="">-- Choose Account --</option>
//                 {bankAccounts.map((acc) => (
//                   <option key={acc._id} value={acc.name}>
//                     {acc.name}
//                   </option>
//                 ))}
//               </Form.Select>
//             </Col>
//           ) : (
//             <>
//               <Col md={4}>
//                 <Form.Control
//                   size="sm"
//                   type="date"
//                   name="chequeDate"
//                   value={formData.paymentDetails.chequeDate}
//                   onChange={handleChange}
//                   title="Date"
//                 />
//               </Col>
//               <Col md={4}>
//                 <Form.Control
//                   size="sm"
//                   placeholder="Bank Name"
//                   name="bankName"
//                   value={formData.paymentDetails.bankName}
//                   onChange={handleChange}
//                 />
//               </Col>
//               <Col md={4}>
//                 <Form.Control
//                   size="sm"
//                   placeholder={
//                     mode === "Cheque"
//                       ? "Cheque No"
//                       : mode === "DD"
//                         ? "DD No"
//                         : "Ref / Transaction ID"
//                   }
//                   name={
//                     mode === "Cheque" || mode === "DD"
//                       ? "chequeNo"
//                       : "transactionId"
//                   }
//                   value={
//                     mode === "Cheque" || mode === "DD"
//                       ? formData.paymentDetails.chequeNo
//                       : formData.paymentDetails.transactionId
//                   }
//                   onChange={handleChange}
//                 />
//               </Col>
//             </>
//           )}
//         </Row>
//       </div>
//     );
//   };

//   // Option B: Multi-part submission supporting instant bill upload
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setCreateSubmitting(true);

//     try {
//       const fd = new FormData();
//       fd.append("voucherType", formData.voucherType);
//       fd.append("accountHead", formData.accountHead);
//       fd.append("amount", formData.amount);
//       fd.append("description", formData.description);
//       fd.append("paymentMode", formData.paymentMode);
//       fd.append("recipientName", formData.recipientName);
//       fd.append("branch", formData.branch);
//       fd.append("paymentDetails", JSON.stringify(formData.paymentDetails));

//       // Append bill photos if provided
//       for (let i = 0; i < creationFiles.length; i++) {
//         fd.append("files", creationFiles[i]);
//       }

//       const config = {
//         headers: {
//           "Content-Type": "multipart/form-data",
//           Authorization: `Bearer ${userInfo.token}`,
//         },
//       };

//       await axios.post(`${BASE_URL}/api/finance/vouchers`, fd, config);

//       setShowModal(false);
//       setCreationFiles([]);
//       setCreationPreviews([]);
//       fetchVouchers(userInfo);
//       fetchBalance();
//       alert("Voucher Created Successfully!");

//       setFormData({
//         voucherType: "Debit",
//         accountHead: "",
//         amount: "",
//         description: "",
//         paymentMode: "Cash",
//         recipientName: "",
//         branch: "KarunaSri Seva Samithi",
//         paymentDetails: {
//           chequeNo: "",
//           chequeDate: "",
//           bankName: "",
//           transactionId: "",
//         },
//       });
//     } catch (error) {
//       alert(error.response?.data?.message || "Error creating voucher");
//     }
//     setCreateSubmitting(false);
//   };

//   const handleTransferSubmit = async () => {
//     if (!transferData.amount) return alert("Please enter amount");
//     try {
//       const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
//       await axios.post(
//         `${BASE_URL}/api/finance/transfer`,
//         transferData,
//         config,
//       );
//       alert("Funds Transferred!");
//       setShowTransferModal(false);
//       fetchVouchers(userInfo);
//       fetchBalance();
//       setTransferData({
//         toBranch: "Karunya Sindhu",
//         amount: "",
//         paymentMode: "Bank Transfer",
//         description: "Monthly Fund Release",
//         paymentDetails: { transactionId: "", bankName: "" },
//       });
//     } catch (error) {
//       alert(error.response?.data?.message || "Transfer failed");
//     }
//   };

//   const handleDownloadVoucher = async (id, voucherNo) => {
//     try {
//       const config = {
//         headers: { Authorization: `Bearer ${userInfo.token}` },
//         responseType: "blob",
//       };
//       const response = await axios.get(
//         `${BASE_URL}/api/finance/vouchers/${id}/pdf`,
//         config,
//       );
//       const url = window.URL.createObjectURL(new Blob([response.data]));
//       const link = document.createElement("a");
//       link.href = url;
//       link.setAttribute("download", `${voucherNo}.pdf`);
//       document.body.appendChild(link);
//       link.click();
//       document.body.removeChild(link);
//     } catch (error) {
//       alert("Error downloading PDF");
//     }
//   };

//   const handleApprove = async (id) => {
//     if (!window.confirm("Confirm approval signature?")) return;
//     try {
//       const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
//       await axios.put(
//         `${BASE_URL}/api/finance/vouchers/${id}/approve`,
//         {},
//         config,
//       );
//       fetchVouchers(userInfo);
//       alert("Voucher Approved Successfully!");
//     } catch (error) {
//       alert(error.response?.data?.message || "Error");
//     }
//   };

//   const handleCancelClick = (id) => {
//     setCancelData({ id, reason: "" });
//     setShowCancelModal(true);
//   };

//   const submitCancellation = async () => {
//     if (!cancelData.reason) return alert("Reason required");
//     try {
//       const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
//       await axios.put(
//         `${BASE_URL}/api/finance/vouchers/${cancelData.id}/cancel`,
//         { reason: cancelData.reason },
//         config,
//       );
//       alert("Voucher Cancelled");
//       setShowCancelModal(false);
//       fetchVouchers(userInfo);
//       fetchBalance();
//     } catch (err) {
//       alert(err.response?.data?.message || "Error");
//     }
//   };

//   const handleExport = () => {
//     if (vouchers.length === 0) return alert("No data to export");
//     const headers = [
//       "Date",
//       "Voucher No",
//       "Type",
//       "Account",
//       "Amount",
//       "Mode",
//       "Narration",
//       "Bills Attached",
//       "Status",
//     ];
//     const rows = filteredVouchers.map((v) => [
//       new Date(v.createdAt).toLocaleDateString(),
//       v.voucherNo,
//       v.voucherType,
//       v.accountHead?.name,
//       v.amount,
//       v.paymentMode,
//       `"${v.description}"`,
//       v.attachments ? v.attachments.length : 0,
//       v.status,
//     ]);
//     const csvContent =
//       "data:text/csv;charset=utf-8," +
//       headers.join(",") +
//       "\n" +
//       rows.map((e) => e.join(",")).join("\n");
//     const link = document.createElement("a");
//     link.href = encodeURI(csvContent);
//     link.download = `Vouchers_${new Date().toISOString().split("T")[0]}.csv`;
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//   };

//   const filteredVouchers = vouchers.filter((v) => {
//     let dateMatch = true;
//     if (dateFilter.start) {
//       const vDate = new Date(v.createdAt);
//       const start = new Date(dateFilter.start);
//       const end = dateFilter.end ? new Date(dateFilter.end) : new Date();
//       end.setHours(23, 59, 59);
//       dateMatch = vDate >= start && vDate <= end;
//     }
//     let statusMatch = true;
//     if (statusFilter === "Pending") statusMatch = v.status !== "Approved";
//     else if (statusFilter === "Approved") statusMatch = v.status === "Approved";
//     return dateMatch && statusMatch;
//   });

//   return (
//     <div>
//       <Row className="mb-4 align-items-center">
//         <Col lg={5}>
//           <h2
//             className="text-maroon m-0"
//             style={{ fontFamily: "Playfair Display" }}
//           >
//             Vouchers & Expenses
//           </h2>
//           <div className="mt-2">
//             <Badge bg="success" className="p-2 fs-6">
//               Current Funds Available: ₹ {currentBalance.toLocaleString()}
//             </Badge>
//           </div>
//         </Col>
//         <Col lg={7}>
//           <div className="d-flex flex-wrap gap-2 justify-content-lg-end">
//             {(userInfo?.role === "admin" ||
//               userInfo?.role === "president" ||
//               userInfo?.role === "secretary") && (
//               <Button
//                 variant="warning"
//                 className="shadow-sm"
//                 onClick={() => setShowTransferModal(true)}
//               >
//                 <FaExchangeAlt className="me-2" /> Transfer Funds
//               </Button>
//             )}
//             <Button variant="success" size="sm" onClick={handleExport}>
//               <FaFileDownload className="me-2" /> Tally CSV
//             </Button>
//             <Button
//               variant="primary"
//               size="sm"
//               style={{ backgroundColor: "#581818", border: "none" }}
//               onClick={() => {
//                 setCreationFiles([]);
//                 setCreationPreviews([]);
//                 setShowModal(true);
//               }}
//             >
//               <FaPlus className="me-2" /> Create Voucher
//             </Button>
//           </div>
//         </Col>
//       </Row>

//       <Row className="mb-3">
//         <Col md={6}>
//           <div className="btn-group">
//             <button
//               className={`btn btn-sm ${statusFilter === "All" ? "btn-dark" : "btn-outline-dark"}`}
//               onClick={() => setStatusFilter("All")}
//             >
//               All
//             </button>
//             <button
//               className={`btn btn-sm ${statusFilter === "Pending" ? "btn-warning" : "btn-outline-warning"}`}
//               onClick={() => setStatusFilter("Pending")}
//             >
//               Pending Actions
//             </button>
//             <button
//               className={`btn btn-sm ${statusFilter === "Approved" ? "btn-success" : "btn-outline-success"}`}
//               onClick={() => setStatusFilter("Approved")}
//             >
//               Approved
//             </button>
//           </div>
//         </Col>
//         <Col md={6}>
//           <div className="d-flex gap-2 justify-content-end align-items-center">
//             <Form.Control
//               type="date"
//               size="sm"
//               value={dateFilter.start}
//               onChange={(e) =>
//                 setDateFilter({ ...dateFilter, start: e.target.value })
//               }
//               className="w-auto"
//             />
//             <span className="text-muted">-</span>
//             <Form.Control
//               type="date"
//               size="sm"
//               value={dateFilter.end}
//               onChange={(e) =>
//                 setDateFilter({ ...dateFilter, end: e.target.value })
//               }
//               className="w-auto"
//             />
//           </div>
//         </Col>
//       </Row>

//       <Card className="shadow-sm border-0">
//         <Card.Body className="p-0">
//           <Table hover responsive className="align-middle mb-0 text-nowrap">
//             <thead className="bg-light">
//               <tr>
//                 <th className="ps-3">Date / Branch</th>
//                 <th>Voucher No</th>
//                 <th>Payee / Recipient</th>
//                 <th>Amount</th>
//                 <th>Bills Attached</th>
//                 <th>Approval Status</th>
//                 <th>Action</th>
//               </tr>
//             </thead>
//             <tbody>
//               {filteredVouchers.map((v) => {
//                 const role = userInfo?.role;
//                 const canApproveL1 =
//                   (role === "secretary" ||
//                     role === "president" ||
//                     role === "admin") &&
//                   v.approvals?.level1?.status !== "Approved";
//                 const canApproveL2 =
//                   role === "treasurer" &&
//                   v.approvals?.level1?.status === "Approved" &&
//                   v.approvals?.level2?.status !== "Approved";

//                 const billCount = v.attachments?.length || 0;

//                 return (
//                   <tr key={v._id}>
//                     <td className="ps-3">
//                       <div className="small text-muted">
//                         {new Date(v.createdAt).toLocaleDateString()}
//                       </div>
//                       <Badge bg="light" text="dark" className="border">
//                         {v.branch}
//                       </Badge>
//                     </td>
//                     <td className="fw-bold">{v.voucherNo}</td>
//                     <td>
//                       {v.recipientName || "-"}
//                       <div className="small text-muted">
//                         {v.accountHead?.name}
//                       </div>
//                     </td>
//                     <td
//                       className={`fw-bold ${v.voucherType === "Debit" ? "text-danger" : "text-success"}`}
//                     >
//                       {v.voucherType === "Debit" ? "-" : "+"} ₹
//                       {v.amount.toLocaleString()}
//                     </td>
//                     <td>
//                       <Button
//                         size="sm"
//                         variant={
//                           billCount > 0 ? "warning" : "outline-secondary"
//                         }
//                         onClick={() => openBillsModal(v)}
//                         title="View or upload physical bills"
//                       >
//                         <FaPaperclip className="me-1" />
//                         {billCount > 0 ? (
//                           <span>
//                             <strong>{billCount}</strong> Bill
//                             {billCount > 1 ? "s" : ""}
//                           </span>
//                         ) : (
//                           <span>Attach</span>
//                         )}
//                       </Button>
//                     </td>
//                     <td>
//                       {v.status === "Cancelled" ? (
//                         <Badge bg="danger">Cancelled</Badge>
//                       ) : (
//                         <div
//                           className="d-flex flex-column gap-1"
//                           style={{ fontSize: "0.7rem" }}
//                         >
//                           <Badge
//                             bg={
//                               v.approvals?.level1?.status === "Approved"
//                                 ? "success"
//                                 : "warning"
//                             }
//                           >
//                             L1: {v.approvals?.level1?.status}
//                           </Badge>
//                           <Badge
//                             bg={
//                               v.approvals?.level2?.status === "Approved"
//                                 ? "success"
//                                 : "secondary"
//                             }
//                           >
//                             L2: {v.approvals?.level2?.status}
//                           </Badge>
//                         </div>
//                       )}
//                     </td>
//                     <td>
//                       {v.status !== "Cancelled" && (
//                         <div className="d-flex gap-1">
//                           {(canApproveL1 || canApproveL2) && (
//                             <Button
//                               size="sm"
//                               variant="outline-success"
//                               onClick={() => handleApprove(v._id)}
//                               title="Sign & Approve"
//                             >
//                               <FaCheck />
//                             </Button>
//                           )}
//                           <Button
//                             size="sm"
//                             variant="outline-danger"
//                             onClick={() =>
//                               handleDownloadVoucher(v._id, v.voucherNo)
//                             }
//                             title="Download Voucher PDF"
//                           >
//                             <FaFilePdf />
//                           </Button>
//                           {(userInfo?.role === "admin" ||
//                             userInfo?.role === "president") && (
//                             <Button
//                               size="sm"
//                               variant="outline-dark"
//                               onClick={() => handleCancelClick(v._id)}
//                               title="Void Voucher"
//                             >
//                               <FaBan />
//                             </Button>
//                           )}
//                         </div>
//                       )}
//                       {v.status === "Cancelled" && (
//                         <small className="text-danger d-block">
//                           {v.cancellationReason}
//                         </small>
//                       )}
//                     </td>
//                   </tr>
//                 );
//               })}
//             </tbody>
//           </Table>
//         </Card.Body>
//       </Card>

//       {/* --- CREATE VOUCHER MODAL (WITH OPTION B DIRECT BILL UPLOADER) --- */}
//       <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
//         <Modal.Header closeButton>
//           <Modal.Title>Create Voucher</Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           <Form onSubmit={handleSubmit}>
//             <Row className="g-2 mb-2">
//               <Col md={6}>
//                 <Form.Label className="small">Voucher Type</Form.Label>
//                 <Form.Select
//                   name="voucherType"
//                   value={formData.voucherType}
//                   onChange={handleChange}
//                 >
//                   <option value="Debit">Debit (Payment / Expense)</option>
//                   <option value="Credit">Credit (Receipt / Income)</option>
//                 </Form.Select>
//               </Col>
//               <Col md={6}>
//                 <Form.Label className="small">Payment Mode</Form.Label>
//                 <Form.Select
//                   name="paymentMode"
//                   value={formData.paymentMode}
//                   onChange={handleChange}
//                 >
//                   <option>Cash</option>
//                   <option>Bank Transfer</option>
//                   <option>Cheque</option>
//                   {formData.voucherType === "Credit" && <option>UPI</option>}
//                   <option
//                     className="fw-bold text-danger"
//                     value="Bank Deduction"
//                   >
//                     Bank Charge / Deduction
//                   </option>
//                 </Form.Select>
//               </Col>
//             </Row>

//             <Row className="g-2 mb-2">
//               <Col md={12}>
//                 <Form.Label className="small fw-bold">Account Head</Form.Label>
//                 <Form.Select
//                   name="accountHead"
//                   value={formData.accountHead}
//                   onChange={handleChange}
//                   required
//                 >
//                   <option value="">-- Select Expense / Income Head --</option>
//                   {accountHeads
//                     .filter((a) => a.type === formData.voucherType)
//                     .map((acc) => (
//                       <option key={acc._id} value={acc._id}>
//                         {acc.code} - {acc.name}
//                       </option>
//                     ))}
//                 </Form.Select>
//               </Col>
//             </Row>

//             {formData.paymentMode !== "Bank Deduction" && (
//               <Form.Group className="mb-2">
//                 <Form.Label className="small fw-bold">
//                   Paid To / Recipient Name *
//                 </Form.Label>
//                 <Form.Control
//                   name="recipientName"
//                   value={formData.recipientName}
//                   onChange={handleChange}
//                   placeholder="e.g. Reliance Supermarket, Electrician, Cook"
//                   required
//                 />
//               </Form.Group>
//             )}

//             <Row className="g-2 mb-2">
//               <Col md={6}>
//                 <Form.Label className="small fw-bold">Amount (₹) *</Form.Label>
//                 <Form.Control
//                   type="number"
//                   name="amount"
//                   value={formData.amount}
//                   onChange={handleChange}
//                   required
//                   className="fw-bold text-danger"
//                 />
//               </Col>
//               <Col md={6}>
//                 <Form.Label className="small fw-bold">Branch</Form.Label>
//                 <Form.Select
//                   name="branch"
//                   value={formData.branch}
//                   onChange={handleChange}
//                   disabled={
//                     userInfo?.role !== "admin" && userInfo?.role !== "president"
//                   }
//                 >
//                   <option value="KarunaSri Seva Samithi">
//                     KarunaSri Seva Samithi
//                   </option>
//                   <option value="Karunya Sindhu">Karunya Sindhu</option>
//                   <option value="Karunya Bharathi">Karunya Bharathi</option>
//                   <option value="Karunya Jyothi">Karunya Jyothi</option>
//                 </Form.Select>
//               </Col>
//             </Row>

//             {renderPaymentFields()}

//             <Form.Group className="mb-3">
//               <Form.Label className="small fw-bold">
//                 Description / Narration
//               </Form.Label>
//               <Form.Control
//                 as="textarea"
//                 rows={2}
//                 name="description"
//                 value={formData.description}
//                 onChange={handleChange}
//                 placeholder="Detailed particulars of this transaction"
//               />
//             </Form.Group>

//             {/* OPTION B: DIRECT BILL UPLOAD DURING CREATION */}
//             <Form.Group className="mb-3 p-3 bg-light rounded border">
//               <Form.Label className="small fw-bold text-dark d-flex align-items-center justify-content-between">
//                 <span>
//                   <FaPaperclip className="me-2 text-danger" /> Attach Bill
//                   Photos / PDF (Optional)
//                 </span>
//                 <small className="text-muted">
//                   You can also upload later from table
//                 </small>
//               </Form.Label>
//               <Form.Control
//                 type="file"
//                 multiple
//                 accept="image/*,.pdf"
//                 onChange={handleCreationFileChange}
//                 size="sm"
//               />

//               {creationPreviews.length > 0 && (
//                 <div className="mt-2 d-flex flex-wrap gap-2">
//                   {creationPreviews.map((f, i) => (
//                     <div
//                       key={i}
//                       className="border p-1 rounded bg-white text-center"
//                       style={{ width: "80px" }}
//                     >
//                       {f.type.startsWith("image/") ? (
//                         <img
//                           src={f.url}
//                           alt="preview"
//                           style={{
//                             width: "70px",
//                             height: "50px",
//                             objectFit: "cover",
//                           }}
//                         />
//                       ) : (
//                         <div className="py-2 text-muted small">
//                           <FaFilePdf size={20} className="text-danger" />
//                         </div>
//                       )}
//                       <small
//                         className="d-block text-truncate mt-1"
//                         style={{ fontSize: "0.65rem" }}
//                       >
//                         {f.name}
//                       </small>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </Form.Group>

//             <Button
//               type="submit"
//               variant="dark"
//               className="w-100 py-2"
//               disabled={createSubmitting}
//             >
//               {createSubmitting ? (
//                 <span>
//                   <Spinner animation="border" size="sm" className="me-2" />
//                   Uploading & Creating...
//                 </span>
//               ) : (
//                 "Generate Voucher"
//               )}
//             </Button>
//           </Form>
//         </Modal.Body>
//       </Modal>

//       {/* --- BILLS & INVOICE ATTACHMENTS MODAL --- */}
//       <Modal
//         show={showBillsModal}
//         onHide={() => setShowBillsModal(false)}
//         size="lg"
//       >
//         <Modal.Header closeButton className="bg-light">
//           <Modal.Title className="fs-5 d-flex align-items-center">
//             <FaPaperclip className="me-2 text-danger" /> Supporting Invoices /
//             Bills:{" "}
//             <span className="ms-1 fw-bold text-maroon">
//               {selectedVoucherForBills?.voucherNo}
//             </span>
//           </Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           {selectedVoucherForBills && (
//             <>
//               {/* Voucher Overview Header */}
//               <div className="p-3 bg-light rounded border mb-3 d-flex justify-content-between align-items-center">
//                 <div>
//                   <h6 className="m-0 fw-bold text-dark">
//                     {selectedVoucherForBills.recipientName || "General Expense"}
//                   </h6>
//                   <small className="text-muted">
//                     {selectedVoucherForBills.description || "No description"}
//                   </small>
//                 </div>
//                 <div className="text-end">
//                   <h5 className="m-0 text-danger fw-bold">
//                     ₹ {selectedVoucherForBills.amount?.toLocaleString()}
//                   </h5>
//                   <Badge
//                     bg={
//                       selectedVoucherForBills.status === "Approved"
//                         ? "success"
//                         : "warning"
//                     }
//                   >
//                     {selectedVoucherForBills.status}
//                   </Badge>
//                 </div>
//               </div>

//               {/* Safety Rule Feedback Alert */}
//               {selectedVoucherForBills.status === "Approved" && (
//                 <Alert
//                   variant="warning"
//                   className="small py-2 d-flex align-items-center"
//                 >
//                   <FaLock className="me-2" />
//                   <span>
//                     <strong>Audit Locked:</strong> This voucher is fully
//                     approved by the Treasurer. Supporting bills cannot be
//                     deleted by regular staff.
//                   </span>
//                 </Alert>
//               )}

//               {/* Upload Additional Files Zone */}
//               <Card className="p-3 bg-white border mb-4">
//                 <Form onSubmit={handleUploadAdditionalBills}>
//                   <Form.Label className="small fw-bold">
//                     Upload Additional Bill Photos or Documents
//                   </Form.Label>
//                   <div className="d-flex gap-2">
//                     <Form.Control
//                       type="file"
//                       multiple
//                       accept="image/*,.pdf"
//                       onChange={handleModalBillChange}
//                       size="sm"
//                     />
//                     <Button
//                       type="submit"
//                       variant="dark"
//                       size="sm"
//                       disabled={uploadingBills || modalBillFiles.length === 0}
//                     >
//                       {uploadingBills ? "Uploading..." : "Upload"}
//                     </Button>
//                   </div>
//                 </Form>

//                 {modalBillPreviews.length > 0 && (
//                   <div className="mt-2 d-flex flex-wrap gap-2">
//                     {modalBillPreviews.map((f, i) => (
//                       <div
//                         key={i}
//                         className="border p-1 rounded bg-light text-center"
//                         style={{ width: "80px" }}
//                       >
//                         {f.type.startsWith("image/") ? (
//                           <img
//                             src={f.url}
//                             alt="preview"
//                             style={{
//                               width: "70px",
//                               height: "50px",
//                               objectFit: "cover",
//                             }}
//                           />
//                         ) : (
//                           <div className="py-2 text-muted small">
//                             <FaFilePdf size={20} className="text-danger" />
//                           </div>
//                         )}
//                         <small
//                           className="d-block text-truncate mt-1"
//                           style={{ fontSize: "0.65rem" }}
//                         >
//                           {f.name}
//                         </small>
//                       </div>
//                     ))}
//                   </div>
//                 )}
//               </Card>

//               {/* Uploaded Bills Gallery */}
//               <h6 className="fw-bold text-maroon border-bottom pb-2">
//                 Attached Invoices & Receipts (
//                 {selectedVoucherForBills.attachments?.length || 0})
//               </h6>

//               <Row>
//                 {selectedVoucherForBills.attachments?.map((path, idx) => {
//                   const isPdf = path.toLowerCase().endsWith(".pdf");
//                   return (
//                     <Col md={4} sm={6} xs={12} key={idx} className="mb-3">
//                       <Card className="h-100 shadow-sm border overflow-hidden">
//                         {isPdf ? (
//                           <div className="p-4 text-center bg-light">
//                             <FaFilePdf size={40} className="text-danger mb-2" />
//                             <span className="d-block small text-muted">
//                               PDF Invoice
//                             </span>
//                           </div>
//                         ) : (
//                           <div
//                             style={{
//                               height: "140px",
//                               cursor: "pointer",
//                               background: "#f8f9fa",
//                             }}
//                             onClick={() => setPreviewImage(path)}
//                             title="Click to view full image"
//                           >
//                             <img
//                               src={path}
//                               style={{
//                                 width: "100%",
//                                 height: "100%",
//                                 objectFit: "cover",
//                               }}
//                               alt="Voucher bill"
//                             />
//                           </div>
//                         )}
//                         <Card.Footer className="p-2 bg-white d-flex justify-content-between align-items-center">
//                           <a
//                             href={path}
//                             target="_blank"
//                             rel="noreferrer"
//                             className="btn btn-sm btn-outline-primary py-0 px-2"
//                             style={{ fontSize: "0.75rem" }}
//                           >
//                             <FaEye className="me-1" /> Open
//                           </a>

//                           {/* SAFETY RULE: Only show delete if NOT approved OR if user is Admin */}
//                           {selectedVoucherForBills.status !== "Approved" ||
//                           userInfo?.role === "admin" ? (
//                             <Button
//                               size="sm"
//                               variant="outline-danger"
//                               className="py-0 px-2"
//                               style={{ fontSize: "0.75rem" }}
//                               onClick={() => handleDeleteBill(path)}
//                             >
//                               <FaTrash className="me-1" /> Delete
//                             </Button>
//                           ) : (
//                             <Badge
//                               bg="secondary"
//                               style={{ fontSize: "0.65rem" }}
//                             >
//                               <FaLock className="me-1" /> Locked
//                             </Badge>
//                           )}
//                         </Card.Footer>
//                       </Card>
//                     </Col>
//                   );
//                 })}

//                 {(!selectedVoucherForBills.attachments ||
//                   selectedVoucherForBills.attachments.length === 0) && (
//                   <Col xs={12}>
//                     <p className="text-center text-muted py-4">
//                       No bill photos or documents attached yet.
//                     </p>
//                   </Col>
//                 )}
//               </Row>
//             </>
//           )}
//         </Modal.Body>
//       </Modal>

//       {/* LIGHTBOX MODAL FOR FULL-SIZE IMAGE PREVIEW */}
//       <Modal
//         show={!!previewImage}
//         onHide={() => setPreviewImage(null)}
//         size="lg"
//         centered
//       >
//         <Modal.Header closeButton>
//           <Modal.Title className="fs-6">Full Bill Preview</Modal.Title>
//         </Modal.Header>
//         <Modal.Body className="p-0 text-center bg-dark">
//           {previewImage && (
//             <img
//               src={previewImage}
//               alt="Full view"
//               style={{
//                 maxWidth: "100%",
//                 maxHeight: "80vh",
//                 objectFit: "contain",
//               }}
//             />
//           )}
//         </Modal.Body>
//       </Modal>

//       {/* --- TRANSFER FUNDS MODAL --- */}
//       <Modal
//         show={showTransferModal}
//         onHide={() => setShowTransferModal(false)}
//       >
//         <Modal.Header closeButton>
//           <Modal.Title>Inter-Branch Fund Transfer</Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           <div className="alert alert-info small">
//             Creates auto Debit (HQ) & Credit (Branch) vouchers.
//           </div>
//           <Form.Group className="mb-2">
//             <Form.Label>Transfer To</Form.Label>
//             <Form.Select
//               value={transferData.toBranch}
//               onChange={(e) =>
//                 setTransferData({ ...transferData, toBranch: e.target.value })
//               }
//             >
//               <option value="Karunya Sindhu">Karunya Sindhu</option>
//               <option value="Karunya Bharathi">Karunya Bharathi</option>
//             </Form.Select>
//           </Form.Group>
//           <Form.Control
//             type="number"
//             placeholder="Amount"
//             value={transferData.amount}
//             onChange={(e) =>
//               setTransferData({ ...transferData, amount: e.target.value })
//             }
//             className="mb-2"
//           />
//           <Form.Control
//             placeholder="Description / Month"
//             value={transferData.description}
//             onChange={(e) =>
//               setTransferData({ ...transferData, description: e.target.value })
//             }
//             className="mb-3"
//           />
//           <Button
//             variant="warning"
//             className="w-100"
//             onClick={handleTransferSubmit}
//           >
//             Transfer Funds
//           </Button>
//         </Modal.Body>
//       </Modal>

//       {/* --- CANCEL VOUCHER MODAL --- */}
//       <Modal show={showCancelModal} onHide={() => setShowCancelModal(false)}>
//         <Modal.Header closeButton>
//           <Modal.Title>Cancel Voucher</Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           <Alert variant="danger">Warning: This action cannot be undone.</Alert>
//           <Form.Control
//             as="textarea"
//             placeholder="Reason for cancellation..."
//             value={cancelData.reason}
//             onChange={(e) =>
//               setCancelData({ ...cancelData, reason: e.target.value })
//             }
//           />
//         </Modal.Body>
//         <Modal.Footer>
//           <Button variant="secondary" onClick={() => setShowCancelModal(false)}>
//             Close
//           </Button>
//           <Button variant="danger" onClick={submitCancellation}>
//             Confirm Void
//           </Button>
//         </Modal.Footer>
//       </Modal>
//     </div>
//   );
// };

// export default FinanceList;
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
  Spinner,
  ProgressBar,
} from "react-bootstrap";
import {
  FaPlus,
  FaCheck,
  FaFilePdf,
  FaFileDownload,
  FaExchangeAlt,
  FaBan,
  FaPaperclip,
  FaImages,
  FaEye,
  FaTrash,
  FaLock,
  FaWallet,
  FaCoins,
  FaBuilding,
  FaExclamationTriangle,
} from "react-icons/fa";
import { Link, useLocation } from "react-router-dom";

const FinanceList = () => {
  const location = useLocation();
  const [vouchers, setVouchers] = useState([]);
  const [accountHeads, setAccountHeads] = useState([]);
  const [bankAccounts, setBankAccounts] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelData, setCancelData] = useState({ id: "", reason: "" });

  const [userInfo, setUserInfo] = useState(null);
  const [statusFilter, setStatusFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState({ start: "", end: "" });

  // --- PETTY CASH & WALLET STATE ---
  const [balanceDetails, setBalanceDetails] = useState({
    systemBalance: 0,
    availableToSpend: 0,
    isBranch: false,
    pettyCashReceived: 0,
    approvedSpent: 0,
    pendingSpent: 0,
  });

  const [showPettyCashOverviewModal, setShowPettyCashOverviewModal] =
    useState(false);
  const [pettyCashOverview, setPettyCashOverview] = useState([]);
  const [overviewLoading, setOverviewLoading] = useState(false);

  // --- BILLS & INVOICE ATTACHMENTS STATE (OPTION B) ---
  const [showBillsModal, setShowBillsModal] = useState(false);
  const [selectedVoucherForBills, setSelectedVoucherForBills] = useState(null);
  const [modalBillFiles, setModalBillFiles] = useState([]);
  const [modalBillPreviews, setModalBillPreviews] = useState([]);
  const [uploadingBills, setUploadingBills] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  // Files selected during voucher creation
  const [creationFiles, setCreationFiles] = useState([]);
  const [creationPreviews, setCreationPreviews] = useState([]);
  const [createSubmitting, setCreateSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    voucherType: "Debit",
    accountHead: "",
    amount: "",
    description: "",
    paymentMode: "Cash",
    recipientName: "",
    branch: "KarunaSri Seva Samithi",
    paymentDetails: {
      chequeNo: "",
      chequeDate: "",
      bankName: "",
      transactionId: "",
    },
  });

  const [transferData, setTransferData] = useState({
    toBranch: "Karunya Sindhu",
    amount: "",
    paymentMode: "Bank Transfer",
    description: "Monthly Petty Cash Float",
    paymentDetails: { transactionId: "", bankName: "" },
  });

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("userInfo"));
    setUserInfo(user);
    if (user) {
      fetchVouchers(user);
      fetchAccountHeads(user);
    }
    if (location.state && location.state.filter) {
      setStatusFilter(location.state.filter);
    }
    fetchBalance();
  }, [location]);

  const fetchBalance = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("userInfo"));
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get(
        `${BASE_URL}/api/finance/cash-balance`,
        config,
      );
      setBalanceDetails(data);
    } catch (error) {
      console.error("Balance Error", error);
    }
  };

  const fetchVouchers = async (user) => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get(
        `${BASE_URL}/api/finance/vouchers`,
        config,
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

      const banks = data.filter(
        (acc) =>
          acc.name.toLowerCase().includes("bank") ||
          acc.name.toLowerCase().includes("cash"),
      );
      setBankAccounts(banks);
    } catch (error) {
      console.error(error);
    }
  };

  const openPettyCashOverview = async () => {
    setOverviewLoading(true);
    setShowPettyCashOverviewModal(true);
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const { data } = await axios.get(
        `${BASE_URL}/api/finance/petty-cash-overview`,
        config,
      );
      setPettyCashOverview(data);
    } catch (err) {
      alert("Failed to load Petty Cash Overview");
    }
    setOverviewLoading(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (
      name === "voucherType" &&
      value === "Debit" &&
      formData.paymentMode === "UPI"
    ) {
      setFormData((prev) => ({
        ...prev,
        voucherType: value,
        paymentMode: "Cash",
      }));
      return;
    }

    if (name === "paymentMode" && value === "Bank Deduction") {
      setFormData((prev) => ({
        ...prev,
        paymentMode: value,
        recipientName: "Bank",
      }));
    } else if (
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

  // Option B: File handling during creation
  const handleCreationFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setCreationFiles(selectedFiles);

    const previews = selectedFiles.map((file) => ({
      name: file.name,
      url: URL.createObjectURL(file),
      type: file.type,
    }));
    setCreationPreviews(previews);
  };

  // Option B: File handling inside the row modal
  const handleModalBillChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setModalBillFiles(selectedFiles);

    const previews = selectedFiles.map((file) => ({
      name: file.name,
      url: URL.createObjectURL(file),
      type: file.type,
    }));
    setModalBillPreviews(previews);
  };

  const openBillsModal = (voucher) => {
    setSelectedVoucherForBills(voucher);
    setModalBillFiles([]);
    setModalBillPreviews([]);
    setShowBillsModal(true);
  };

  const handleUploadAdditionalBills = async (e) => {
    e.preventDefault();
    if (modalBillFiles.length === 0) return alert("Please choose files to upload");

    setUploadingBills(true);
    const fd = new FormData();
    for (let i = 0; i < modalBillFiles.length; i++) {
      fd.append("files", modalBillFiles[i]);
    }

    try {
      const config = {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${userInfo.token}`,
        },
      };

      const { data } = await axios.post(
        `${BASE_URL}/api/finance/vouchers/${selectedVoucherForBills._id}/upload`,
        fd,
        config,
      );

      alert("Bills uploaded successfully!");
      setSelectedVoucherForBills((prev) => ({
        ...prev,
        attachments: data.attachments,
      }));
      setModalBillFiles([]);
      setModalBillPreviews([]);
      fetchVouchers(userInfo);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to upload bills");
    }
    setUploadingBills(false);
  };

  const handleDeleteBill = async (filePath) => {
    if (selectedVoucherForBills.status === "Approved" && userInfo.role !== "admin") {
      return alert(
        "Action Blocked: Bills cannot be removed from an Approved Voucher.",
      );
    }

    if (!window.confirm("Are you sure you want to delete this bill document?"))
      return;

    try {
      const config = {
        headers: { Authorization: `Bearer ${userInfo.token}` },
        data: { filePath },
      };

      const { data } = await axios.delete(
        `${BASE_URL}/api/finance/vouchers/${selectedVoucherForBills._id}/attachment`,
        config,
      );

      alert("Bill attachment removed.");
      setSelectedVoucherForBills((prev) => ({
        ...prev,
        attachments: data.attachments,
      }));
      fetchVouchers(userInfo);
    } catch (err) {
      alert(err.response?.data?.message || "Error deleting bill");
    }
  };

  const renderPaymentFields = () => {
    const mode = formData.paymentMode;
    if (mode === "Cash") return null;

    return (
      <div className="bg-light p-2 rounded mb-3 border">
        <h6 className="text-muted small mb-2 fw-bold">Payment Details</h6>
        <Row className="g-2">
          {mode === "Bank Deduction" ? (
            <Col md={12}>
              <Form.Label className="small">Select Bank Account *</Form.Label>
              <Form.Select
                name="bankName"
                value={formData.paymentDetails.bankName}
                onChange={handleChange}
                required
              >
                <option value="">-- Choose Account --</option>
                {bankAccounts.map((acc) => (
                  <option key={acc._id} value={acc.name}>
                    {acc.name}
                  </option>
                ))}
              </Form.Select>
            </Col>
          ) : (
            <>
              <Col md={4}>
                <Form.Control
                  size="sm"
                  type="date"
                  name="chequeDate"
                  value={formData.paymentDetails.chequeDate}
                  onChange={handleChange}
                  title="Date"
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
              <Col md={4}>
                <Form.Control
                  size="sm"
                  placeholder={
                    mode === "Cheque"
                      ? "Cheque No"
                      : mode === "DD"
                        ? "DD No"
                        : "Ref / Transaction ID"
                  }
                  name={
                    mode === "Cheque" || mode === "DD"
                      ? "chequeNo"
                      : "transactionId"
                  }
                  value={
                    mode === "Cheque" || mode === "DD"
                      ? formData.paymentDetails.chequeNo
                      : formData.paymentDetails.transactionId
                  }
                  onChange={handleChange}
                />
              </Col>
            </>
          )}
        </Row>
      </div>
    );
  };

  // Option B: Multi-part submission supporting instant bill upload + overdraft check
  const handleSubmit = async (e) => {
    e.preventDefault();
    setCreateSubmitting(true);

    try {
      const fd = new FormData();
      fd.append("voucherType", formData.voucherType);
      fd.append("accountHead", formData.accountHead);
      fd.append("amount", formData.amount);
      fd.append("description", formData.description);
      fd.append("paymentMode", formData.paymentMode);
      fd.append("recipientName", formData.recipientName);
      fd.append("branch", formData.branch);
      fd.append("paymentDetails", JSON.stringify(formData.paymentDetails));

      for (let i = 0; i < creationFiles.length; i++) {
        fd.append("files", creationFiles[i]);
      }

      const config = {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${userInfo.token}`,
        },
      };

      await axios.post(`${BASE_URL}/api/finance/vouchers`, fd, config);

      setShowModal(false);
      setCreationFiles([]);
      setCreationPreviews([]);
      fetchVouchers(userInfo);
      fetchBalance();
      alert("Voucher Created Successfully!");

      setFormData({
        voucherType: "Debit",
        accountHead: "",
        amount: "",
        description: "",
        paymentMode: "Cash",
        recipientName: "",
        branch: "KarunaSri Seva Samithi",
        paymentDetails: {
          chequeNo: "",
          chequeDate: "",
          bankName: "",
          transactionId: "",
        },
      });
    } catch (error) {
      alert(error.response?.data?.message || "Error creating voucher");
    }
    setCreateSubmitting(false);
  };

  const handleTransferSubmit = async () => {
    if (!transferData.amount) return alert("Please enter amount");
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      await axios.post(
        `${BASE_URL}/api/finance/transfer`,
        transferData,
        config,
      );
      alert(`Petty Cash of ₹${transferData.amount} Disbursed to ${transferData.toBranch}!`);
      setShowTransferModal(false);
      fetchVouchers(userInfo);
      fetchBalance();
      setTransferData({
        toBranch: "Karunya Sindhu",
        amount: "",
        paymentMode: "Bank Transfer",
        description: "Monthly Petty Cash Float",
        paymentDetails: { transactionId: "", bankName: "" },
      });
    } catch (error) {
      alert(error.response?.data?.message || "Transfer failed");
    }
  };

  const handleDownloadVoucher = async (id, voucherNo) => {
    try {
      const config = {
        headers: { Authorization: `Bearer ${userInfo.token}` },
        responseType: "blob",
      };
      const response = await axios.get(
        `${BASE_URL}/api/finance/vouchers/${id}/pdf`,
        config,
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${voucherNo}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      alert("Error downloading PDF");
    }
  };

  const handleApprove = async (id) => {
    if (!window.confirm("Confirm approval signature?")) return;
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      await axios.put(
        `${BASE_URL}/api/finance/vouchers/${id}/approve`,
        {},
        config,
      );
      fetchVouchers(userInfo);
      fetchBalance();
      alert("Voucher Approved Successfully!");
    } catch (error) {
      alert(error.response?.data?.message || "Error");
    }
  };

  const handleCancelClick = (id) => {
    setCancelData({ id, reason: "" });
    setShowCancelModal(true);
  };

  const submitCancellation = async () => {
    if (!cancelData.reason) return alert("Reason required");
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      await axios.put(
        `${BASE_URL}/api/finance/vouchers/${cancelData.id}/cancel`,
        { reason: cancelData.reason },
        config,
      );
      alert("Voucher Cancelled");
      setShowCancelModal(false);
      fetchVouchers(userInfo);
      fetchBalance();
    } catch (err) {
      alert(err.response?.data?.message || "Error");
    }
  };

  const handleExport = () => {
    if (vouchers.length === 0) return alert("No data to export");
    const headers = [
      "Date",
      "Voucher No",
      "Type",
      "Subtype",
      "Account",
      "Amount",
      "Mode",
      "Narration",
      "Bills Attached",
      "Status",
    ];
    const rows = filteredVouchers.map((v) => [
      new Date(v.createdAt).toLocaleDateString(),
      v.voucherNo,
      v.voucherType,
      v.voucherSubtype || "Standard",
      v.accountHead?.name,
      v.amount,
      v.paymentMode,
      `"${v.description}"`,
      v.attachments ? v.attachments.length : 0,
      v.status,
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      headers.join(",") +
      "\n" +
      rows.map((e) => e.join(",")).join("\n");
    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = `Vouchers_${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredVouchers = vouchers.filter((v) => {
    let dateMatch = true;
    if (dateFilter.start) {
      const vDate = new Date(v.createdAt);
      const start = new Date(dateFilter.start);
      const end = dateFilter.end ? new Date(dateFilter.end) : new Date();
      end.setHours(23, 59, 59);
      dateMatch = vDate >= start && vDate <= end;
    }
    let statusMatch = true;
    if (statusFilter === "Pending") statusMatch = v.status !== "Approved";
    else if (statusFilter === "Approved") statusMatch = v.status === "Approved";
    return dateMatch && statusMatch;
  });

  const isCentralLeadership = [
    "admin",
    "president",
    "secretary",
    "treasurer",
  ].includes(userInfo?.role);

  return (
    <div>
      {/* --- TOP ROW: HEADER & ACTIONS --- */}
      <Row className="mb-3 align-items-center">
        <Col lg={5}>
          <h2
            className="text-maroon m-0"
            style={{ fontFamily: "Playfair Display" }}
          >
            Vouchers & Finance
          </h2>
          <p className="text-muted m-0 small">
            Imprest System & Branch Expenditure Controls
          </p>
        </Col>
        <Col lg={7}>
          <div className="d-flex flex-wrap gap-2 justify-content-lg-end">
            {isCentralLeadership && (
              <Button
                variant="outline-primary"
                className="shadow-sm"
                onClick={openPettyCashOverview}
              >
                <FaWallet className="me-2" /> Central Petty Cash Monitor
              </Button>
            )}

            {isCentralLeadership && (
              <Button
                variant="warning"
                className="shadow-sm"
                onClick={() => setShowTransferModal(true)}
              >
                <FaExchangeAlt className="me-2" /> Disburse Branch Float
              </Button>
            )}

            <Button variant="success" size="sm" onClick={handleExport}>
              <FaFileDownload className="me-2" /> Tally CSV
            </Button>
            <Button
              variant="primary"
              size="sm"
              style={{ backgroundColor: "#581818", border: "none" }}
              onClick={() => {
                setCreationFiles([]);
                setCreationPreviews([]);
                setShowModal(true);
              }}
            >
              <FaPlus className="me-2" /> Create Voucher
            </Button>
          </div>
        </Col>
      </Row>

      {/* --- BRANCH PETTY CASH WALLET (DISPLAYED FOR BRANCH MANAGERS & WARDENS) --- */}
      {balanceDetails.isBranch && (
        <Card className="mb-4 border-0 shadow-sm" style={{ background: "linear-gradient(135deg, #2c0b0b, #581818)", color: "white" }}>
          <Card.Body className="p-4">
            <Row className="align-items-center">
              <Col md={6}>
                <div className="d-flex align-items-center mb-2">
                  <FaCoins size={24} className="text-warning me-2" />
                  <span className="text-uppercase fw-bold opacity-75 small" style={{ letterSpacing: "1px" }}>
                    Branch Petty Cash Balance (In-Hand)
                  </span>
                </div>
                <h1 className="display-5 fw-bold text-warning mb-1">
                  ₹ {balanceDetails.systemBalance.toLocaleString("en-IN")}
                </h1>
                <small className="opacity-75">
                  Available to Spend:{" "}
                  <strong>₹ {balanceDetails.availableToSpend.toLocaleString("en-IN")}</strong>{" "}
                  (₹{balanceDetails.pendingSpent.toLocaleString("en-IN")} in pending vouchers)
                </small>
              </Col>
              <Col md={6} className="border-start border-secondary ps-md-4 mt-3 mt-md-0">
                <div className="d-flex justify-content-between small opacity-75 mb-1">
                  <span>Petty Cash Float Received from HQ:</span>
                  <strong className="text-white">₹ {balanceDetails.pettyCashReceived.toLocaleString("en-IN")}</strong>
                </div>
                <div className="d-flex justify-content-between small opacity-75 mb-2">
                  <span>Total Approved Expenses:</span>
                  <strong className="text-danger">₹ {balanceDetails.approvedSpent.toLocaleString("en-IN")}</strong>
                </div>
                <ProgressBar
                  now={
                    balanceDetails.pettyCashReceived > 0
                      ? Math.min(
                          (balanceDetails.approvedSpent / balanceDetails.pettyCashReceived) * 100,
                          100,
                        )
                      : 0
                  }
                  variant={balanceDetails.availableToSpend < 2000 ? "danger" : "warning"}
                  style={{ height: "6px" }}
                />
                <div className="mt-2 text-end">
                  <span className="badge bg-secondary text-white small">
                    🔒 Untouchable Donations: Devotee cash is ring-fenced for Trust bank deposits.
                  </span>
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      )}

      {/* --- CENTRAL HQ MAIN CASH IN HAND (DISPLAYED FOR HQ / CENTRAL LEADERSHIP) --- */}
      {!balanceDetails.isBranch && (
        <Card className="mb-4 border-0 shadow-sm bg-light">
          <Card.Body className="p-3 d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center">
              <div className="p-3 bg-white rounded-circle shadow-sm me-3 text-success">
                <FaCoins size={24} />
              </div>
              <div>
                <span className="text-muted small text-uppercase fw-bold d-block">
                  KSS Headquarters Central Cash Pool
                </span>
                <h3 className="fw-bold text-success m-0">
                  ₹ {balanceDetails.systemBalance.toLocaleString("en-IN")}
                </h3>
              </div>
            </div>
            <div className="text-end">
              <Badge bg="success" className="p-2 mb-1">
                HQ Donations Deposited Intact
              </Badge>
              <div className="small text-muted">
                Branches operate on Petty Cash Floats disbursed below.
              </div>
            </div>
          </Card.Body>
        </Card>
      )}

      {/* --- FILTER BUTTONS & DATE RANGE --- */}
      <Row className="mb-3">
        <Col md={6}>
          <div className="btn-group">
            <button
              className={`btn btn-sm ${statusFilter === "All" ? "btn-dark" : "btn-outline-dark"}`}
              onClick={() => setStatusFilter("All")}
            >
              All Vouchers
            </button>
            <button
              className={`btn btn-sm ${statusFilter === "Pending" ? "btn-warning" : "btn-outline-warning"}`}
              onClick={() => setStatusFilter("Pending")}
            >
              Pending Actions
            </button>
            <button
              className={`btn btn-sm ${statusFilter === "Approved" ? "btn-success" : "btn-outline-success"}`}
              onClick={() => setStatusFilter("Approved")}
            >
              Approved
            </button>
          </div>
        </Col>
        <Col md={6}>
          <div className="d-flex gap-2 justify-content-end align-items-center">
            <Form.Control
              type="date"
              size="sm"
              value={dateFilter.start}
              onChange={(e) =>
                setDateFilter({ ...dateFilter, start: e.target.value })
              }
              className="w-auto"
            />
            <span className="text-muted">-</span>
            <Form.Control
              type="date"
              size="sm"
              value={dateFilter.end}
              onChange={(e) =>
                setDateFilter({ ...dateFilter, end: e.target.value })
              }
              className="w-auto"
            />
          </div>
        </Col>
      </Row>

      {/* --- VOUCHER TABLE --- */}
      <Card className="shadow-sm border-0">
        <Card.Body className="p-0">
          <Table hover responsive className="align-middle mb-0 text-nowrap">
            <thead className="bg-light">
              <tr>
                <th className="ps-3">Date / Branch</th>
                <th>Voucher No</th>
                <th>Payee / Recipient</th>
                <th>Amount</th>
                <th>Bills Attached</th>
                <th>Approval Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredVouchers.map((v) => {
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

                const billCount = v.attachments?.length || 0;
                const isFloatDisbursal =
                  v.voucherSubtype === "Petty_Cash_Disbursement";

                return (
                  <tr key={v._id}>
                    <td className="ps-3">
                      <div className="small text-muted">
                        {new Date(v.createdAt).toLocaleDateString()}
                      </div>
                      <Badge bg="light" text="dark" className="border">
                        {v.branch}
                      </Badge>
                      {isFloatDisbursal && (
                        <div className="text-primary small fw-bold mt-1">
                          ↳ Petty Cash Float
                        </div>
                      )}
                    </td>
                    <td className="fw-bold">{v.voucherNo}</td>
                    <td>
                      {v.recipientName || "-"}
                      <div className="small text-muted">
                        {v.accountHead?.name}
                      </div>
                    </td>
                    <td
                      className={`fw-bold ${v.voucherType === "Debit" ? "text-danger" : "text-success"}`}
                    >
                      {v.voucherType === "Debit" ? "-" : "+"} ₹
                      {v.amount.toLocaleString()}
                    </td>
                    <td>
                      <Button
                        size="sm"
                        variant={billCount > 0 ? "warning" : "outline-secondary"}
                        onClick={() => openBillsModal(v)}
                        title="View or upload physical bills"
                      >
                        <FaPaperclip className="me-1" />
                        {billCount > 0 ? (
                          <span>
                            <strong>{billCount}</strong> Bill{billCount > 1 ? "s" : ""}
                          </span>
                        ) : (
                          <span>Attach</span>
                        )}
                      </Button>
                    </td>
                    <td>
                      {v.status === "Cancelled" ? (
                        <Badge bg="danger">Cancelled</Badge>
                      ) : (
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
                            L1: {v.approvals?.level1?.status}
                          </Badge>
                          <Badge
                            bg={
                              v.approvals?.level2?.status === "Approved"
                                ? "success"
                                : "secondary"
                            }
                          >
                            L2: {v.approvals?.level2?.status}
                          </Badge>
                        </div>
                      )}
                    </td>
                    <td>
                      {v.status !== "Cancelled" && (
                        <div className="d-flex gap-1">
                          {(canApproveL1 || canApproveL2) && (
                            <Button
                              size="sm"
                              variant="outline-success"
                              onClick={() => handleApprove(v._id)}
                              title="Sign & Approve"
                            >
                              <FaCheck />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline-danger"
                            onClick={() =>
                              handleDownloadVoucher(v._id, v.voucherNo)
                            }
                            title="Download Voucher PDF"
                          >
                            <FaFilePdf />
                          </Button>
                          {(userInfo?.role === "admin" ||
                            userInfo?.role === "president") && (
                            <Button
                              size="sm"
                              variant="outline-dark"
                              onClick={() => handleCancelClick(v._id)}
                              title="Void Voucher"
                            >
                              <FaBan />
                            </Button>
                          )}
                        </div>
                      )}
                      {v.status === "Cancelled" && (
                        <small className="text-danger d-block">
                          {v.cancellationReason}
                        </small>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* --- CREATE VOUCHER MODAL (WITH OVERDRAFT WARNING & DIRECT BILL UPLOADER) --- */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Create Voucher</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {balanceDetails.isBranch && (
            <Alert variant="info" className="small py-2 mb-3 d-flex align-items-center justify-content-between">
              <div>
                <FaWallet className="me-2" />
                <strong>Branch Petty Cash Limit:</strong> You currently have{" "}
                <span className="text-danger fw-bold">
                  ₹ {balanceDetails.availableToSpend.toLocaleString("en-IN")}
                </span>{" "}
                available in petty cash.
              </div>
              <Badge bg="secondary">Untouchable Donor Pool</Badge>
            </Alert>
          )}

          <Form onSubmit={handleSubmit}>
            <Row className="g-2 mb-2">
              <Col md={6}>
                <Form.Label className="small">Voucher Type</Form.Label>
                <Form.Select
                  name="voucherType"
                  value={formData.voucherType}
                  onChange={handleChange}
                >
                  <option value="Debit">Debit (Payment / Expense)</option>
                  <option value="Credit">Credit (Receipt / Income)</option>
                </Form.Select>
              </Col>
              <Col md={6}>
                <Form.Label className="small">Payment Mode</Form.Label>
                <Form.Select
                  name="paymentMode"
                  value={formData.paymentMode}
                  onChange={handleChange}
                >
                  <option>Cash</option>
                  <option>Bank Transfer</option>
                  <option>Cheque</option>
                  {formData.voucherType === "Credit" && <option>UPI</option>}
                  <option className="fw-bold text-danger" value="Bank Deduction">
                    Bank Charge / Deduction
                  </option>
                </Form.Select>
              </Col>
            </Row>

            <Row className="g-2 mb-2">
              <Col md={12}>
                <Form.Label className="small fw-bold">Account Head</Form.Label>
                <Form.Select
                  name="accountHead"
                  value={formData.accountHead}
                  onChange={handleChange}
                  required
                >
                  <option value="">-- Select Expense / Income Head --</option>
                  {accountHeads
                    .filter((a) => a.type === formData.voucherType)
                    .map((acc) => (
                      <option key={acc._id} value={acc._id}>
                        {acc.code} - {acc.name}
                      </option>
                    ))}
                </Form.Select>
              </Col>
            </Row>

            {formData.paymentMode !== "Bank Deduction" && (
              <Form.Group className="mb-2">
                <Form.Label className="small fw-bold">
                  Paid To / Recipient Name *
                </Form.Label>
                <Form.Control
                  name="recipientName"
                  value={formData.recipientName}
                  onChange={handleChange}
                  placeholder="e.g. Rythu Bazar, Milk Vendor, Electrician"
                  required
                />
              </Form.Group>
            )}

            <Row className="g-2 mb-2">
              <Col md={6}>
                <Form.Label className="small fw-bold">Amount (₹) *</Form.Label>
                <Form.Control
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  required
                  className="fw-bold text-danger"
                />
              </Col>
              <Col md={6}>
                <Form.Label className="small fw-bold">Branch</Form.Label>
                <Form.Select
                  name="branch"
                  value={formData.branch}
                  onChange={handleChange}
                  disabled={
                    userInfo?.role !== "admin" && userInfo?.role !== "president"
                  }
                >
                  <option value="KarunaSri Seva Samithi">
                    KarunaSri Seva Samithi (HQ)
                  </option>
                  <option value="Karunya Sindhu">Karunya Sindhu</option>
                  <option value="Karunya Bharathi">Karunya Bharathi</option>
                  <option value="Karunya Jyothi">Karunya Jyothi</option>
                </Form.Select>
              </Col>
            </Row>

            {renderPaymentFields()}

            <Form.Group className="mb-3">
              <Form.Label className="small fw-bold">Description / Narration</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Detailed particulars of this transaction"
              />
            </Form.Group>

            {/* DIRECT BILL UPLOADER (OPTION B) */}
            <Form.Group className="mb-3 p-3 bg-light rounded border">
              <Form.Label className="small fw-bold text-dark d-flex align-items-center justify-content-between">
                <span>
                  <FaPaperclip className="me-2 text-danger" /> Attach Bill Photos / Invoices (Optional)
                </span>
                <small className="text-muted">You can also upload later from table</small>
              </Form.Label>
              <Form.Control
                type="file"
                multiple
                accept="image/*,.pdf"
                onChange={handleCreationFileChange}
                size="sm"
              />

              {creationPreviews.length > 0 && (
                <div className="mt-2 d-flex flex-wrap gap-2">
                  {creationPreviews.map((f, i) => (
                    <div
                      key={i}
                      className="border p-1 rounded bg-white text-center"
                      style={{ width: "80px" }}
                    >
                      {f.type.startsWith("image/") ? (
                        <img
                          src={f.url}
                          alt="preview"
                          style={{ width: "70px", height: "50px", objectFit: "cover" }}
                        />
                      ) : (
                        <div className="py-2 text-muted small">
                          <FaFilePdf size={20} className="text-danger" />
                        </div>
                      )}
                      <small
                        className="d-block text-truncate mt-1"
                        style={{ fontSize: "0.65rem" }}
                      >
                        {f.name}
                      </small>
                    </div>
                  ))}
                </div>
              )}
            </Form.Group>

            <Button
              type="submit"
              variant="dark"
              className="w-100 py-2"
              disabled={createSubmitting}
            >
              {createSubmitting ? (
                <span>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Uploading & Creating...
                </span>
              ) : (
                "Generate Voucher"
              )}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>

      {/* --- CENTRAL LEADERSHIP PETTY CASH MONITOR MODAL --- */}
      <Modal
        show={showPettyCashOverviewModal}
        onHide={() => setShowPettyCashOverviewModal(false)}
        size="xl"
      >
        <Modal.Header closeButton className="bg-light">
          <Modal.Title className="fs-5 d-flex align-items-center">
            <FaWallet className="me-2 text-primary" /> Central Leadership: Branch Petty Cash Monitor
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {overviewLoading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="danger" />
            </div>
          ) : (
            <>
              <Alert variant="info" className="small mb-3">
                <strong>Accounting Rule:</strong> Public donations received at branches are strictly routed to the Trust Central Pool. All branch daily expenditures are financed exclusively via these monthly Imprest Floats.
              </Alert>

              <Table bordered hover responsive className="align-middle text-center mb-4">
                <thead className="bg-light text-uppercase" style={{ fontSize: "0.8rem" }}>
                  <tr>
                    <th className="text-start ps-3">Branch Name</th>
                    <th>Float Disbursed</th>
                    <th className="text-danger">Total Spent (Approved)</th>
                    <th className="text-warning">Pending Review</th>
                    <th className="bg-white text-success fw-bold">Live Cash in Hand</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {pettyCashOverview.map((item, idx) => (
                    <tr key={idx}>
                      <td className="text-start ps-3 fw-bold text-maroon">
                        <FaBuilding className="me-2 text-secondary" />
                        {item.branch}
                      </td>
                      <td>₹ {item.floatReceived.toLocaleString("en-IN")}</td>
                      <td className="text-danger">₹ {item.spentApproved.toLocaleString("en-IN")}</td>
                      <td className="text-warning">₹ {item.pendingApproval.toLocaleString("en-IN")}</td>
                      <td className="fw-bold fs-6 text-success bg-light">
                        ₹ {item.cashInHand.toLocaleString("en-IN")}
                      </td>
                      <td>
                        <Button
                          size="sm"
                          variant="outline-warning"
                          onClick={() => {
                            setShowPettyCashOverviewModal(false);
                            setTransferData({
                              toBranch: item.branch,
                              amount: "",
                              paymentMode: "Bank Transfer",
                              description: `Monthly Float Replenishment - ${new Date().toLocaleString("default", { month: "long" })}`,
                              paymentDetails: { transactionId: "", bankName: "" },
                            });
                            setShowTransferModal(true);
                          }}
                        >
                          Top-Up Float
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </>
          )}
        </Modal.Body>
      </Modal>

      {/* --- BILLS & INVOICE ATTACHMENTS MODAL --- */}
      <Modal
        show={showBillsModal}
        onHide={() => setShowBillsModal(false)}
        size="lg"
      >
        <Modal.Header closeButton className="bg-light">
          <Modal.Title className="fs-5 d-flex align-items-center">
            <FaPaperclip className="me-2 text-danger" /> Supporting Invoices / Bills:{" "}
            <span className="ms-1 fw-bold text-maroon">
              {selectedVoucherForBills?.voucherNo}
            </span>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedVoucherForBills && (
            <>
              <div className="p-3 bg-light rounded border mb-3 d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="m-0 fw-bold text-dark">
                    {selectedVoucherForBills.recipientName || "General Expense"}
                  </h6>
                  <small className="text-muted">
                    {selectedVoucherForBills.description || "No description"}
                  </small>
                </div>
                <div className="text-end">
                  <h5 className="m-0 text-danger fw-bold">
                    ₹ {selectedVoucherForBills.amount?.toLocaleString()}
                  </h5>
                  <Badge
                    bg={
                      selectedVoucherForBills.status === "Approved"
                        ? "success"
                        : "warning"
                    }
                  >
                    {selectedVoucherForBills.status}
                  </Badge>
                </div>
              </div>

              {selectedVoucherForBills.status === "Approved" && (
                <Alert variant="warning" className="small py-2 d-flex align-items-center">
                  <FaLock className="me-2" />
                  <span>
                    <strong>Audit Locked:</strong> This voucher is fully approved by the Treasurer. Supporting bills cannot be deleted by regular staff.
                  </span>
                </Alert>
              )}

              <Card className="p-3 bg-white border mb-4">
                <Form onSubmit={handleUploadAdditionalBills}>
                  <Form.Label className="small fw-bold">
                    Upload Additional Bill Photos or Documents
                  </Form.Label>
                  <div className="d-flex gap-2">
                    <Form.Control
                      type="file"
                      multiple
                      accept="image/*,.pdf"
                      onChange={handleModalBillChange}
                      size="sm"
                    />
                    <Button
                      type="submit"
                      variant="dark"
                      size="sm"
                      disabled={uploadingBills || modalBillFiles.length === 0}
                    >
                      {uploadingBills ? "Uploading..." : "Upload"}
                    </Button>
                  </div>
                </Form>

                {modalBillPreviews.length > 0 && (
                  <div className="mt-2 d-flex flex-wrap gap-2">
                    {modalBillPreviews.map((f, i) => (
                      <div
                        key={i}
                        className="border p-1 rounded bg-light text-center"
                        style={{ width: "80px" }}
                      >
                        {f.type.startsWith("image/") ? (
                          <img
                            src={f.url}
                            alt="preview"
                            style={{ width: "70px", height: "50px", objectFit: "cover" }}
                          />
                        ) : (
                          <div className="py-2 text-muted small">
                            <FaFilePdf size={20} className="text-danger" />
                          </div>
                        )}
                        <small
                          className="d-block text-truncate mt-1"
                          style={{ fontSize: "0.65rem" }}
                        >
                          {f.name}
                        </small>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              <h6 className="fw-bold text-maroon border-bottom pb-2">
                Attached Invoices & Receipts (
                {selectedVoucherForBills.attachments?.length || 0})
              </h6>

              <Row>
                {selectedVoucherForBills.attachments?.map((path, idx) => {
                  const isPdf = path.toLowerCase().endsWith(".pdf");
                  return (
                    <Col md={4} sm={6} xs={12} key={idx} className="mb-3">
                      <Card className="h-100 shadow-sm border overflow-hidden">
                        {isPdf ? (
                          <div className="p-4 text-center bg-light">
                            <FaFilePdf size={40} className="text-danger mb-2" />
                            <span className="d-block small text-muted">
                              PDF Invoice
                            </span>
                          </div>
                        ) : (
                          <div
                            style={{ height: "140px", cursor: "pointer", background: "#f8f9fa" }}
                            onClick={() => setPreviewImage(path)}
                            title="Click to view full image"
                          >
                            <img
                              src={path}
                              style={{ width: "100%", height: "100%", objectFit: "cover" }}
                              alt="Voucher bill"
                            />
                          </div>
                        )}
                        <Card.Footer className="p-2 bg-white d-flex justify-content-between align-items-center">
                          <a
                            href={path}
                            target="_blank"
                            rel="noreferrer"
                            className="btn btn-sm btn-outline-primary py-0 px-2"
                            style={{ fontSize: "0.75rem" }}
                          >
                            <FaEye className="me-1" /> Open
                          </a>

                          {selectedVoucherForBills.status !== "Approved" ||
                          userInfo?.role === "admin" ? (
                            <Button
                              size="sm"
                              variant="outline-danger"
                              className="py-0 px-2"
                              style={{ fontSize: "0.75rem" }}
                              onClick={() => handleDeleteBill(path)}
                            >
                              <FaTrash className="me-1" /> Delete
                            </Button>
                          ) : (
                            <Badge bg="secondary" style={{ fontSize: "0.65rem" }}>
                              <FaLock className="me-1" /> Locked
                            </Badge>
                          )}
                        </Card.Footer>
                      </Card>
                    </Col>
                  );
                })}

                {(!selectedVoucherForBills.attachments ||
                  selectedVoucherForBills.attachments.length === 0) && (
                  <Col xs={12}>
                    <p className="text-center text-muted py-4">
                      No bill photos or documents attached yet.
                    </p>
                  </Col>
                )}
              </Row>
            </>
          )}
        </Modal.Body>
      </Modal>

      {/* LIGHTBOX MODAL FOR FULL-SIZE IMAGE PREVIEW */}
      <Modal
        show={!!previewImage}
        onHide={() => setPreviewImage(null)}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title className="fs-6">Full Bill Preview</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-0 text-center bg-dark">
          {previewImage && (
            <img
              src={previewImage}
              alt="Full view"
              style={{ maxWidth: "100%", maxHeight: "80vh", objectFit: "contain" }}
            />
          )}
        </Modal.Body>
      </Modal>

      {/* --- DISBURSE MONTHLY PETTY CASH FLOAT MODAL --- */}
      <Modal show={showTransferModal} onHide={() => setShowTransferModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Disburse Monthly Petty Cash Float</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="alert alert-info small">
            <strong>Imprest Replenishment:</strong> This allocates a cash operational advance to the branch's local petty cash drawer.
          </div>
          <Form.Group className="mb-2">
            <Form.Label>Target Branch</Form.Label>
            <Form.Select
              value={transferData.toBranch}
              onChange={(e) =>
                setTransferData({ ...transferData, toBranch: e.target.value })
              }
            >
              <option value="Karunya Sindhu">Karunya Sindhu</option>
              <option value="Karunya Bharathi">Karunya Bharathi</option>
              <option value="Karunya Jyothi">Karunya Jyothi</option>
            </Form.Select>
          </Form.Group>
          <Form.Control
            type="number"
            placeholder="Petty Cash Amount (₹)"
            value={transferData.amount}
            onChange={(e) =>
              setTransferData({ ...transferData, amount: e.target.value })
            }
            className="mb-2"
          />
          <Form.Control
            placeholder="Purpose (e.g. Monthly Advance for April 2026)"
            value={transferData.description}
            onChange={(e) =>
              setTransferData({ ...transferData, description: e.target.value })
            }
            className="mb-3"
          />
          <Button
            variant="warning"
            className="w-100 fw-bold"
            onClick={handleTransferSubmit}
          >
            Disburse Petty Cash Float
          </Button>
        </Modal.Body>
      </Modal>

      {/* --- CANCEL VOUCHER MODAL --- */}
      <Modal show={showCancelModal} onHide={() => setShowCancelModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Cancel Voucher</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="danger">Warning: This action cannot be undone.</Alert>
          <Form.Control
            as="textarea"
            placeholder="Reason for cancellation..."
            value={cancelData.reason}
            onChange={(e) =>
              setCancelData({ ...cancelData, reason: e.target.value })
            }
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCancelModal(false)}>
            Close
          </Button>
          <Button variant="danger" onClick={submitCancellation}>
            Confirm Void
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default FinanceList;