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
// } from "react-bootstrap";
// import { FaPlus, FaCheck, FaFilePdf, FaFileDownload } from "react-icons/fa";

// const FinanceList = () => {
//   const [vouchers, setVouchers] = useState([]);
//   const [accountHeads, setAccountHeads] = useState([]);
//   const [showModal, setShowModal] = useState(false);
//   const [userInfo, setUserInfo] = useState(null);

//   const [formData, setFormData] = useState({
//     voucherType: "Debit",
//     accountHead: "",
//     amount: "",
//     description: "",
//     paymentMode: "Cash",
//     recipientName: "", // New Field
//     paymentDetails: {
//       chequeNo: "",
//       chequeDate: "",
//       bankName: "",
//       transactionId: "",
//     },
//   });
//   const [dateFilter, setDateFilter] = useState({ start: "", end: "" });

//   useEffect(() => {
//     const user = JSON.parse(localStorage.getItem("userInfo"));
//     setUserInfo(user);
//     if (user) {
//       fetchVouchers(user);
//       fetchAccountHeads(user);
//     }
//   }, []);

//   const fetchVouchers = async (user) => {
//     try {
//       const config = { headers: { Authorization: `Bearer ${user.token}` } };
//       const { data } = await axios.get(
//         `${BASE_URL}/api/finance/vouchers`,
//         config
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
//     } catch (error) {
//       console.error(error);
//     }
//   };

//   const handleApprove = async (id) => {
//     if (!window.confirm("Confirm signature for this voucher?")) return;
//     try {
//       const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
//       await axios.put(
//         `${BASE_URL}/api/finance/vouchers/${id}/approve`,
//         {},
//         config
//       );
//       fetchVouchers(userInfo);
//       alert("Approval Recorded!");
//     } catch (error) {
//       alert(error.response?.data?.message || "Error approving");
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
//       await axios.post(`${BASE_URL}/api/finance/vouchers`, formData, config);
//       setShowModal(false);
//       fetchVouchers(userInfo);
//       alert("Voucher Created Successfully!");
//       setFormData({
//         voucherType: "Debit",
//         accountHead: "",
//         amount: "",
//         description: "",
//         paymentMode: "Cash",
//         recipientName: "",
//         paymentDetails: {
//           chequeNo: "",
//           chequeDate: "",
//           bankName: "",
//           transactionId: "",
//         },
//       });
//     } catch (error) {
//       alert("Error creating voucher");
//     }
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     if (
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

//   // Helper for Payment Fields
//   const renderPaymentFields = () => {
//     const mode = formData.paymentMode;
//     if (mode === "Cheque" || mode === "DD") {
//       return (
//         <Row className="bg-light p-2 rounded mb-3 border">
//           <Col md={4}>
//             <Form.Control
//               size="sm"
//               placeholder="Cheque/DD No"
//               name="chequeNo"
//               value={formData.paymentDetails.chequeNo}
//               onChange={handleChange}
//             />
//           </Col>
//           <Col md={4}>
//             <Form.Control
//               size="sm"
//               type="date"
//               name="chequeDate"
//               value={formData.paymentDetails.chequeDate}
//               onChange={handleChange}
//             />
//           </Col>
//           <Col md={4}>
//             <Form.Control
//               size="sm"
//               placeholder="Bank Name"
//               name="bankName"
//               value={formData.paymentDetails.bankName}
//               onChange={handleChange}
//             />
//           </Col>
//         </Row>
//       );
//     }
//     if (mode === "UPI" || mode === "Bank Transfer") {
//       return (
//         <Form.Control
//           size="sm"
//           className="mb-3"
//           placeholder="Txn ID"
//           name="transactionId"
//           value={formData.paymentDetails.transactionId}
//           onChange={handleChange}
//         />
//       );
//     }
//     return null;
//   };

//   const filteredVouchers = vouchers.filter((v) => {
//     if (!dateFilter.start) return true;
//     const vDate = new Date(v.createdAt);
//     const start = new Date(dateFilter.start);
//     const end = dateFilter.end ? new Date(dateFilter.end) : new Date();
//     end.setHours(23, 59, 59);
//     return vDate >= start && vDate <= end;
//   });

//   return (
//     <div>
//       <Row className="mb-4 align-items-center">
//         <Col lg={6}>
//           <h2
//             className="text-maroon m-0"
//             style={{ fontFamily: "Playfair Display" }}
//           >
//             Vouchers & Expenses
//           </h2>
//         </Col>
//         <Col lg={6} className="text-end">
//           <Button
//             variant="primary"
//             style={{ backgroundColor: "#581818" }}
//             onClick={() => setShowModal(true)}
//           >
//             <FaPlus className="me-2" /> Create Voucher
//           </Button>
//         </Col>
//       </Row>

//       <Card className="shadow-sm border-0">
//         <Card.Body className="p-0">
//           <Table hover responsive className="align-middle mb-0 text-nowrap">
//             <thead className="bg-light">
//               <tr>
//                 <th className="ps-3">Date</th>
//                 <th>Voucher No</th>
//                 <th>Payee / Recipient</th>
//                 <th>Amount</th>
//                 <th>Status</th>
//                 <th>Action</th>
//               </tr>
//             </thead>
//             <tbody>
//               {filteredVouchers.map((v) => {
//                 // Determine Approval Rights
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

//                 return (
//                   <tr key={v._id}>
//                     <td className="ps-3 small text-muted">
//                       {new Date(v.createdAt).toLocaleDateString()}
//                     </td>
//                     <td className="fw-bold">{v.voucherNo}</td>
//                     <td>
//                       {v.recipientName || "-"}
//                       <div className="small text-muted">
//                         {v.accountHead?.name}
//                       </div>
//                     </td>
//                     <td className="fw-bold text-danger">
//                       ₹{v.amount.toLocaleString()}
//                     </td>

//                     {/* STATUS BADGE LOGIC */}
//                     <td>
//                       <div
//                         className="d-flex flex-column gap-1"
//                         style={{ fontSize: "0.7rem" }}
//                       >
//                         <Badge
//                           bg={
//                             v.approvals?.level1?.status === "Approved"
//                               ? "success"
//                               : "warning"
//                           }
//                         >
//                           L1:{" "}
//                           {v.approvals?.level1?.status === "Approved"
//                             ? "Signed"
//                             : "Pending"}
//                         </Badge>
//                         <Badge
//                           bg={
//                             v.approvals?.level2?.status === "Approved"
//                               ? "success"
//                               : "secondary"
//                           }
//                         >
//                           L2:{" "}
//                           {v.approvals?.level2?.status === "Approved"
//                             ? "Signed"
//                             : "Waiting"}
//                         </Badge>
//                       </div>
//                     </td>

//                     <td>
//                       {(canApproveL1 || canApproveL2) && (
//                         <Button
//                           size="sm"
//                           variant="outline-success"
//                           className="me-2"
//                           onClick={() => handleApprove(v._id)}
//                         >
//                           <FaCheck /> Sign
//                         </Button>
//                       )}
//                       <Button size="sm" variant="outline-danger">
//                         <FaFilePdf />
//                       </Button>
//                     </td>
//                   </tr>
//                 );
//               })}
//             </tbody>
//           </Table>
//         </Card.Body>
//       </Card>

//       {/* Modal */}
//       <Modal show={showModal} onHide={() => setShowModal(false)}>
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
//                   <option value="Debit">Debit (Payment)</option>
//                   <option value="Credit">Credit (Receipt)</option>
//                 </Form.Select>
//               </Col>
//               <Col md={6}>
//                 <Form.Label className="small">Account Head</Form.Label>
//                 <Form.Select
//                   name="accountHead"
//                   value={formData.accountHead}
//                   onChange={handleChange}
//                   required
//                 >
//                   <option value="">-- Select --</option>
//                   {accountHeads
//                     .filter((a) => a.type === formData.voucherType)
//                     .map((acc) => (
//                       <option key={acc._id} value={acc._id}>
//                         {acc.name}
//                       </option>
//                     ))}
//                 </Form.Select>
//               </Col>
//             </Row>

//             <Form.Group className="mb-2">
//               <Form.Label className="small">Recipient / Payee Name</Form.Label>
//               <Form.Control
//                 name="recipientName"
//                 value={formData.recipientName}
//                 onChange={handleChange}
//                 required
//                 placeholder="Who is receiving money?"
//               />
//             </Form.Group>

//             <Row className="g-2 mb-2">
//               <Col md={6}>
//                 <Form.Label className="small">Amount</Form.Label>
//                 <Form.Control
//                   type="number"
//                   name="amount"
//                   value={formData.amount}
//                   onChange={handleChange}
//                   required
//                 />
//               </Col>
//               <Col md={6}>
//                 <Form.Label className="small">Mode</Form.Label>
//                 <Form.Select
//                   name="paymentMode"
//                   value={formData.paymentMode}
//                   onChange={handleChange}
//                 >
//                   <option>Cash</option>
//                   <option>Cheque</option>
//                   <option>Bank Transfer</option>
//                   <option>UPI</option>
//                 </Form.Select>
//               </Col>
//             </Row>

//             {renderPaymentFields()}

//             <Form.Control
//               as="textarea"
//               name="description"
//               placeholder="Narration / Description"
//               value={formData.description}
//               onChange={handleChange}
//               className="mb-3"
//             />

//             <Button type="submit" variant="dark" className="w-100">
//               Generate Voucher
//             </Button>
//           </Form>
//         </Modal.Body>
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
} from "react-bootstrap";
import {
  FaPlus,
  FaCheck,
  FaFilePdf,
  FaFileDownload,
  FaBalanceScale,
} from "react-icons/fa";
import { Link } from "react-router-dom";

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
    recipientName: "",
    paymentDetails: {
      chequeNo: "",
      chequeDate: "",
      bankName: "",
      transactionId: "",
    },
    branch: "Headquarters", // Default
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
    } catch (error) {
      console.error(error);
    }
  };

  // --- NEW: DOWNLOAD HANDLER ---
  const handleDownloadVoucher = async (id, voucherNo) => {
    try {
      const config = {
        headers: { Authorization: `Bearer ${userInfo.token}` },
        responseType: "blob", // Important for PDF
      };
      const response = await axios.get(
        `${BASE_URL}/api/finance/vouchers/${id}/pdf`,
        config,
      );

      // Create Link and Download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${voucherNo}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      alert("Error downloading voucher PDF");
    }
  };

  const handleApprove = async (id) => {
    if (!window.confirm("Confirm signature for this voucher?")) return;
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      await axios.put(
        `${BASE_URL}/api/finance/vouchers/${id}/approve`,
        {},
        config,
      );
      fetchVouchers(userInfo);
      alert("Approval Recorded!");
    } catch (error) {
      alert(error.response?.data?.message || "Error approving");
    }
  };

  // Tally Export Logic
  const handleExport = () => {
    if (vouchers.length === 0) return alert("No vouchers to export.");

    const headers = [
      "Date",
      "Voucher No",
      "Type",
      "Account Code",
      "Ledger Name",
      "Amount",
      "Mode",
      "Narration",
      "Prepared By",
      "Status",
    ];

    // Using filtered vouchers
    const rows = filteredVouchers.map((v) => [
      new Date(v.createdAt).toLocaleDateString(),
      v.voucherNo,
      v.voucherType,
      v.accountHead?.code || "N/A",
      `"${v.accountHead?.name || "Unknown"}"`,
      v.amount,
      v.paymentMode,
      `"${v.description || ""}"`,
      v.preparedBy?.name || "System",
      v.status,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      headers.join(",") +
      "\n" +
      rows.map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `Tally_Export_${new Date().toISOString().split("T")[0]}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
        branch: "Headquarters",
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

  // const renderPaymentFields = () => {
  //   const mode = formData.paymentMode;
  //   if (mode === "Cheque" || mode === "DD") {
  //     return (
  //       <Row className="bg-light p-2 rounded mb-3 border">
  //         <Col md={4}>
  //           <Form.Control
  //             size="sm"
  //             placeholder="Cheque/DD No"
  //             name="chequeNo"
  //             value={formData.paymentDetails.chequeNo}
  //             onChange={handleChange}
  //           />
  //         </Col>
  //         <Col md={4}>
  //           <Form.Control
  //             size="sm"
  //             type="date"
  //             name="chequeDate"
  //             value={formData.paymentDetails.chequeDate}
  //             onChange={handleChange}
  //           />
  //         </Col>
  //         <Col md={4}>
  //           <Form.Control
  //             size="sm"
  //             placeholder="Bank Name"
  //             name="bankName"
  //             value={formData.paymentDetails.bankName}
  //             onChange={handleChange}
  //           />
  //         </Col>
  //       </Row>
  //     );
  //   }
  //   if (mode === "UPI" || mode === "Bank Transfer") {
  //     return (
  //       <Form.Control
  //         size="sm"
  //         className="mb-3"
  //         placeholder="Txn ID"
  //         name="transactionId"
  //         value={formData.paymentDetails.transactionId}
  //         onChange={handleChange}
  //       />
  //     );
  //   }
  //   return null;
  // };
  const renderPaymentFields = () => {
    return (
      <div className="bg-light p-2 rounded mb-3 border">
        <h6 className="text-muted small mb-2">Payment Details (Optional)</h6>
        <Row className="g-2">
          {/* Show Cheque/DD No only for those modes */}
          {(formData.paymentMode === "Cheque" ||
            formData.paymentMode === "DD") && (
            <Col md={4}>
              <Form.Control
                size="sm"
                placeholder="Cheque/DD No"
                name="chequeNo"
                value={formData.paymentDetails.chequeNo}
                onChange={handleChange}
              />
            </Col>
          )}

          {/* Date Field */}
          <Col md={4}>
            <Form.Control
              size="sm"
              type="date"
              name="chequeDate"
              value={formData.paymentDetails.chequeDate}
              onChange={handleChange}
              title="Instrument Date"
            />
          </Col>

          {/* Bank Name - Visible for CASH too now */}
          <Col md={4}>
            <Form.Control
              size="sm"
              placeholder="Bank Name / Account No"
              name="bankName"
              value={formData.paymentDetails.bankName}
              onChange={handleChange}
            />
          </Col>

          {/* Transaction ID - Visible for Online/UPI */}
          {(formData.paymentMode === "Online" ||
            formData.paymentMode === "UPI" ||
            formData.paymentMode === "Bank Transfer") && (
            <Col md={12}>
              <Form.Control
                size="sm"
                placeholder="Transaction ID / Ref No"
                name="transactionId"
                value={formData.paymentDetails.transactionId}
                onChange={handleChange}
              />
            </Col>
          )}
        </Row>
      </div>
    );
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
        <Col lg={5}>
          <h2
            className="text-maroon m-0"
            style={{ fontFamily: "Playfair Display" }}
          >
            Vouchers & Expenses
          </h2>
        </Col>
        <Col lg={7}>
          <div className="d-flex flex-wrap gap-2 justify-content-lg-end">
            {/* Reconcile Button */}
            {/* <Link
              to="/dashboard/finance/reconcile"
              className="btn btn-outline-dark shadow-sm flex-grow-1 flex-lg-grow-0 text-decoration-none d-flex align-items-center justify-content-center"
            >
              <FaBalanceScale className="me-2" /> Reconcile Cash
            </Link> */}

            <Button variant="success" size="sm" onClick={handleExport}>
              <FaFileDownload className="me-2" /> Download Tally CSV
            </Button>
            <Button
              variant="primary"
              size="sm"
              style={{ backgroundColor: "#581818", border: "none" }}
              onClick={() => setShowModal(true)}
            >
              <FaPlus className="me-2" /> Create Voucher
            </Button>
          </div>
        </Col>
      </Row>

      {/* Date Filter */}
      <Row className="mb-3">
        <Col md={12}>
          <div className="d-flex gap-2 justify-content-end align-items-center">
            <span className="text-muted small fw-bold">Filter:</span>
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
                    <td
                      className={`fw-bold ${v.voucherType === "Debit" ? "text-danger" : "text-success"}`}
                    >
                      {v.voucherType === "Debit" ? "-" : "+"} ₹
                      {v.amount.toLocaleString()}
                    </td>

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
                      {/* FIX: ADDED ONCLICK HANDLER FOR DOWNLOAD */}
                      <Button
                        size="sm"
                        variant="outline-danger"
                        onClick={() =>
                          handleDownloadVoucher(v._id, v.voucherNo)
                        }
                      >
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

      {/* <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Create Voucher</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Row className="g-2 mb-2">
              <Col md={6}>
                <Form.Group className="mb-2">
                  <Form.Label className="small">Ashram Branch</Form.Label>
                  <Form.Select
                    name="branch"
                    value={formData.branch}
                    onChange={handleChange}
                    className="fw-bold border-warning"
                  >
                    <option value="Headquarters">Headquarters</option>
                    <option value="Karunya Sindu">Karunya Sindhu</option>
                    <option value="Karunya Bharathi">Karunya Bharathi</option>
                    <option value="Karunya Jyothi">Karunya Jyothi</option>
                    <option value="Karuna Sree Seva Samithi">
                      Karuna Sree Seva Samithi
                    </option>
                  </Form.Select>
                </Form.Group>
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
                        {acc.code} - {acc.name}
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
      </Modal> */}
      {/* MODAL UPDATED WITH BRANCH */}
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
              {/* NEW: BRANCH SELECTION */}
              <Col md={6}>
                <Form.Label className="small">Branch</Form.Label>
                <Form.Select
                  name="branch"
                  value={formData.branch}
                  onChange={handleChange}
                >
                  <option value="Headquarters">Headquarters</option>
                  <option value="Karunya Sindhu">Karunya Sindhu</option>
                  <option value="Karunya Bharathi">Karunya Bharathi</option>
                  <option value="Karunya Jyothi">Karunya Jyothi</option>
                  <option value="Karuna Sree Seva Samithi">
                    Karuna Sree Seva Samithi
                  </option>
                </Form.Select>
              </Col>
            </Row>

            <Row className="g-2 mb-2">
              <Col md={12}>
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
                        {acc.code} - {acc.name}
                      </option>
                    ))}
                </Form.Select>
              </Col>
            </Row>

            <Form.Group className="mb-2">
              <Form.Label className="small">Paid To (Recipient)</Form.Label>
              <Form.Control
                name="recipientName"
                value={formData.recipientName}
                onChange={handleChange}
                required
                placeholder="Name of Person/Shop"
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

            <Form.Group className="mb-3">
              <Form.Label className="small">Towards (Description)</Form.Label>
              <Form.Control
                as="textarea"
                name="description"
                placeholder="e.g. Bus Charges for students"
                value={formData.description}
                onChange={handleChange}
              />
            </Form.Group>

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
