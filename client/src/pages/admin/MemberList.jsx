// /* eslint-disable no-unused-vars */
// /* eslint-disable react-hooks/immutability */
// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import BASE_URL from "../../apiConfig";
// import { Link } from "react-router-dom";

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
// import {
//   FaPlus,
//   FaUserTie,
//   FaCheckCircle,
//   FaTimesCircle,
//   FaTasks,
//   FaFilePdf,
//   FaEye, // For viewing approval status
// } from "react-icons/fa";

// const MemberList = () => {
//   const [members, setMembers] = useState([]);
//   const [showModal, setShowModal] = useState(false);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [currentUser, setCurrentUser] = useState(null);

//   // Approval Modal State
//   const [showApproveModal, setShowApproveModal] = useState(false);
//   const [selectedMember, setSelectedMember] = useState(null);

//   // Activity Modal State
//   const [showActivityModal, setShowActivityModal] = useState(false);
//   const [activityData, setActivityData] = useState({
//     eventName: "",
//     role: "",
//     date: "",
//   });

//   const [formData, setFormData] = useState({
//     firstName: "",
//     lastName: "",
//     spouseName: "",
//     dob: "",
//     qualification: "",
//     profession: "",
//     otherOrgPositions: "",
//     references: "",
//     pan: "",
//     aadhaar: "",
//     phone: "",
//     email: "",
//     address: "",
//     membershipType: "Annual",
//     category: "Ordinary",
//     feeAmount: "1000",
//     feeStatus: "Paid",
//     branch: "Karunya Sindhu",
//   });

//   useEffect(() => {
//     const user = JSON.parse(localStorage.getItem("userInfo"));
//     setCurrentUser(user);
//     if (user) fetchMembers(user);
//   }, []);

//   const fetchMembers = async (user) => {
//     try {
//       const config = { headers: { Authorization: `Bearer ${user.token}` } };
//       const { data } = await axios.get(`${BASE_URL}/api/members`, config);
//       setMembers(data);
//       setLoading(false);
//     } catch (err) {
//       console.error(err);
//       setError("Failed to fetch members");
//       setLoading(false);
//     }
//   };

//   // --- HANDLERS ---

//   const handleApprove = async (status) => {
//     try {
//       const config = {
//         headers: { Authorization: `Bearer ${currentUser.token}` },
//       };
//       await axios.put(
//         `${BASE_URL}/api/members/${selectedMember._id}/approve`,
//         { status, remark: "Approved via Dashboard" },
//         config,
//       );
//       alert(`Membership ${status}`);
//       setShowApproveModal(false);
//       fetchMembers(currentUser);
//     } catch (err) {
//       alert("Error processing approval");
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       const config = {
//         headers: { Authorization: `Bearer ${currentUser.token}` },
//       };
//       await axios.post(`${BASE_URL}/api/members`, formData, config);
//       setShowModal(false);
//       fetchMembers(currentUser);
//       alert("Application Submitted! Waiting for Committee Approval.");

//       // Reset Form
//       setFormData({
//         firstName: "",
//         lastName: "",
//         spouseName: "",
//         dob: "",
//         qualification: "",
//         profession: "",
//         otherOrgPositions: "",
//         references: "",
//         pan: "",
//         aadhaar: "",
//         phone: "",
//         email: "",
//         address: "",
//         membershipType: "Annual",
//         category: "Ordinary",
//         feeAmount: "1000",
//         feeStatus: "Paid",
//         branch: "Karunya Sindhu",
//       });
//     } catch (err) {
//       alert("Error registering member");
//     }
//   };

//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   const openApproveModal = (m) => {
//     setSelectedMember(m);
//     setShowApproveModal(true);
//   };

//   const openActivityModal = (member) => {
//     setSelectedMember(member);
//     setShowActivityModal(true);
//   };

//   const handleAddActivity = async (e) => {
//     e.preventDefault();
//     try {
//       const config = {
//         headers: { Authorization: `Bearer ${currentUser.token}` },
//       };
//       await axios.post(
//         `${BASE_URL}/api/members/${selectedMember._id}/activity`,
//         activityData,
//         config,
//       );
//       alert("Activity Logged!");
//       setShowActivityModal(false);
//       setActivityData({ eventName: "", role: "", date: "" });
//       fetchMembers(currentUser);
//     } catch (err) {
//       alert("Error logging activity");
//     }
//   };

//   const handleDownloadBlank = async () => {
//     try {
//       const response = await axios.get(`${BASE_URL}/api/members/blank-form`, {
//         headers: { Authorization: `Bearer ${currentUser.token}` },
//         responseType: "blob",
//       });
//       const url = window.URL.createObjectURL(new Blob([response.data]));
//       const link = document.createElement("a");
//       link.href = url;
//       link.setAttribute("download", "Blank_Membership_Form.pdf");
//       document.body.appendChild(link);
//       link.click();
//       document.body.removeChild(link);
//     } catch (err) {
//       alert("Error downloading blank form");
//     }
//   };

//   // Helper for Status Icons
//   const ApprovalStatus = ({ status, label }) => {
//     let color = "text-muted";
//     let icon = "⏳";
//     if (status === "Approved") {
//       color = "text-success";
//       icon = "✅";
//     } else if (status === "Rejected") {
//       color = "text-danger";
//       icon = "❌";
//     }

//     return (
//       <span className={`${color} small fw-bold me-2`} title={label}>
//         {label.charAt(0)}:{icon}
//       </span>
//     );
//   };

//   return (
//     <div>
//       <Row className="mb-4 align-items-center">
//         <Col>
//           <h2
//             className="text-maroon m-0"
//             style={{ fontFamily: "Playfair Display" }}
//           >
//             Membership Registry
//           </h2>
//           <p className="text-muted m-0 small">
//             Manage Volunteers, Life Members, and Patrons
//           </p>
//         </Col>
//         <Col className="text-end">
//           <Button
//             variant="outline-danger"
//             className="me-2"
//             onClick={handleDownloadBlank}
//           >
//             <FaFilePdf className="me-2" /> Blank Form
//           </Button>
//           <Button
//             variant="primary"
//             style={{ backgroundColor: "#581818", border: "none" }}
//             onClick={() => setShowModal(true)}
//           >
//             <FaPlus className="me-2" /> New Application
//           </Button>
//         </Col>
//       </Row>

//       {error && <Alert variant="danger">{error}</Alert>}

//       <Card className="shadow-sm border-0">
//         <Card.Body className="p-0">
//           <Table
//             hover
//             responsive
//             className="align-middle mb-0"
//             style={{ fontSize: "0.9rem" }}
//           >
//             <thead className="bg-light">
//               <tr>
//                 <th className="ps-4">Name</th>
//                 <th>Category</th>
//                 <th>Approvals</th>
//                 <th>Membership Status</th>
//                 <th>Fee Status</th>
//                 <th>Action</th>
//               </tr>
//             </thead>
//             <tbody>
//               {members.map((m) => (
//                 <tr key={m._id}>
//                   <td className="ps-4">
//                     <div className="fw-bold">
//                       <FaUserTie className="me-2 text-secondary" />
//                       {m.firstName} {m.lastName}
//                     </div>
//                     <small className="text-muted">{m.phone}</small>
//                   </td>
//                   <td>
//                     <div className="d-flex flex-column gap-1 align-items-start">
//                       <Badge bg="secondary">{m.category}</Badge>
//                       <small>{m.membershipType}</small>
//                     </div>
//                   </td>

//                   {/* APPROVAL ICONS */}
//                   <td>
//                     <ApprovalStatus
//                       status={m.approvals?.president?.status}
//                       label="President"
//                     />
//                     <ApprovalStatus
//                       status={m.approvals?.secretary?.status}
//                       label="Secretary"
//                     />
//                     <ApprovalStatus
//                       status={m.approvals?.treasurer?.status}
//                       label="Treasurer"
//                     />
//                   </td>

//                   {/* OVERALL STATUS */}
//                   <td>
//                     <Badge
//                       bg={
//                         m.membershipStatus === "Active"
//                           ? "success"
//                           : m.membershipStatus === "Rejected"
//                             ? "danger"
//                             : "warning"
//                       }
//                       text={m.membershipStatus === "Pending" ? "dark" : "light"}
//                     >
//                       {m.membershipStatus}
//                     </Badge>
//                   </td>

//                   <td>
//                     {m.feeStatus === "Paid" ? (
//                       <span className="text-success fw-bold small">
//                         <FaCheckCircle /> Paid
//                       </span>
//                     ) : (
//                       <span className="text-danger fw-bold small">
//                         <FaTimesCircle /> Pending
//                       </span>
//                     )}
//                   </td>
//                   <td>
//                     <div className="d-flex gap-2">
//                       {/* Approval Action */}
//                       <Button
//                         size="sm"
//                         variant="outline-dark"
//                         onClick={() => openApproveModal(m)}
//                         title="View/Approve"
//                       >
//                         <FaEye />
//                       </Button>
//                       <Link
//                         to={`/dashboard/members/${m._id}`}
//                         className="btn btn-sm btn-outline-primary"
//                         title="View Profile"
//                       >
//                         <FaUserTie />
//                       </Link>
//                       <Button
//                         size="sm"
//                         variant="outline-secondary"
//                         onClick={() => openActivityModal(m)}
//                         title="Log Activity"
//                       >
//                         <FaTasks />
//                       </Button>
//                     </div>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </Table>
//         </Card.Body>
//       </Card>

//       {/* --- APPROVAL MODAL --- */}
//       {/* <Modal show={showApproveModal} onHide={() => setShowApproveModal(false)}>
//         <Modal.Header closeButton>
//           <Modal.Title>Membership Application</Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           {selectedMember && (
//             <>
//               <h5 className="text-maroon">
//                 {selectedMember.firstName} {selectedMember.lastName}
//               </h5>
//               <p className="text-muted mb-3">
//                 Applied for:{" "}
//                 <strong>
//                   {selectedMember.category} ({selectedMember.membershipType})
//                 </strong>
//               </p>

//               <Table bordered size="sm" className="mb-0">
//                 <tbody>
//                   <tr>
//                     <td>President</td>
//                     <td className="text-center">
//                       <Badge
//                         bg={
//                           selectedMember.approvals.president.status ===
//                           "Approved"
//                             ? "success"
//                             : "secondary"
//                         }
//                       >
//                         {selectedMember.approvals.president.status}
//                       </Badge>
//                     </td>
//                     <td>
//                       {currentUser?.role === "president" &&
//                         selectedMember.approvals.president.status ===
//                           "Pending" && (
//                           <Button
//                             size="sm"
//                             variant="success"
//                             onClick={() => handleApprove("Approved")}
//                           >
//                             Approve
//                           </Button>
//                         )}
//                     </td>
//                   </tr>
//                   <tr>
//                     <td>Secretary</td>
//                     <td className="text-center">
//                       <Badge
//                         bg={
//                           selectedMember.approvals.secretary.status ===
//                           "Approved"
//                             ? "success"
//                             : "secondary"
//                         }
//                       >
//                         {selectedMember.approvals.secretary.status}
//                       </Badge>
//                     </td>
//                     <td>
//                       {currentUser?.role === "secretary" &&
//                         selectedMember.approvals.secretary.status ===
//                           "Pending" && (
//                           <Button
//                             size="sm"
//                             variant="success"
//                             onClick={() => handleApprove("Approved")}
//                           >
//                             Approve
//                           </Button>
//                         )}
//                     </td>
//                   </tr>
//                   <tr>
//                     <td>Treasurer</td>
//                     <td className="text-center">
//                       <Badge
//                         bg={
//                           selectedMember.approvals.treasurer.status ===
//                           "Approved"
//                             ? "success"
//                             : "secondary"
//                         }
//                       >
//                         {selectedMember.approvals.treasurer.status}
//                       </Badge>
//                     </td>
//                     <td>
//                       {currentUser?.role === "treasurer" &&
//                         selectedMember.approvals.treasurer.status ===
//                           "Pending" && (
//                           <Button
//                             size="sm"
//                             variant="success"
//                             onClick={() => handleApprove("Approved")}
//                           >
//                             Approve
//                           </Button>
//                         )}
//                     </td>
//                   </tr>
//                 </tbody>
//               </Table>
//               {currentUser?.role === "admin" &&
//                 selectedMember.membershipStatus === "Pending" && (
//                   <div className="mt-3 text-center">
//                     <small className="text-muted d-block mb-2">
//                       Admin Override
//                     </small>
//                     <Button
//                       size="sm"
//                       variant="success"
//                       onClick={() => handleApprove("Approved")}
//                     >
//                       Force Approve
//                     </Button>
//                   </div>
//                 )}
//             </>
//           )}
//         </Modal.Body>
//       </Modal> */}
//       {/* --- APPROVAL MODAL --- */}
//       <Modal show={showApproveModal} onHide={() => setShowApproveModal(false)}>
//         <Modal.Header closeButton>
//           <Modal.Title>Membership Application Review</Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           {selectedMember && (
//             <>
//               {/* --- ENHANCED MEMBER SUMMARY --- */}
//               <div className="bg-light p-3 rounded mb-3 border">
//                 <h5 className="text-maroon fw-bold mb-3">
//                   {selectedMember.firstName} {selectedMember.lastName}
//                 </h5>

//                 <Row className="g-2 small text-muted">
//                   <Col xs={6}>
//                     <strong>Applied For:</strong>
//                     <br />
//                     <span className="text-dark">
//                       {selectedMember.category} ({selectedMember.membershipType}
//                       )
//                     </span>
//                   </Col>
//                   <Col xs={6}>
//                     <strong>Referred By:</strong>
//                     <br />
//                     <span className="text-dark fw-bold">
//                       {selectedMember.references || "N/A"}
//                     </span>
//                   </Col>
//                   <Col xs={6}>
//                     <strong>Profession:</strong>
//                     <br />
//                     <span className="text-dark">
//                       {selectedMember.profession || "-"}
//                     </span>
//                   </Col>
//                   <Col xs={6}>
//                     <strong>Payment:</strong>
//                     <br />
//                     {selectedMember.feeStatus === "Paid" ? (
//                       <Badge bg="success">
//                         Paid ₹{selectedMember.feeAmount}
//                       </Badge>
//                     ) : (
//                       <Badge bg="danger">Pending</Badge>
//                     )}
//                   </Col>
//                 </Row>
//               </div>

//               {/* --- APPROVAL TABLE --- */}
//               <h6 className="small fw-bold text-uppercase text-muted mb-2">
//                 Committee Decisions
//               </h6>
//               <Table bordered size="sm" className="mb-0 align-middle">
//                 <tbody>
//                   <tr>
//                     <td style={{ width: "30%" }}>President</td>
//                     <td className="text-center">
//                       <Badge
//                         bg={
//                           selectedMember.approvals.president.status ===
//                           "Approved"
//                             ? "success"
//                             : selectedMember.approvals.president.status ===
//                                 "Rejected"
//                               ? "danger"
//                               : "secondary"
//                         }
//                       >
//                         {selectedMember.approvals.president.status}
//                       </Badge>
//                     </td>
//                     <td className="text-end">
//                       {currentUser?.role === "president" &&
//                         selectedMember.approvals.president.status ===
//                           "Pending" && (
//                           <>
//                             <Button
//                               size="sm"
//                               variant="outline-success"
//                               className="me-1 py-0"
//                               onClick={() => handleApprove("Approved")}
//                             >
//                               Approve
//                             </Button>
//                             <Button
//                               size="sm"
//                               variant="outline-danger"
//                               className="py-0"
//                               onClick={() => handleApprove("Rejected")}
//                             >
//                               Reject
//                             </Button>
//                           </>
//                         )}
//                     </td>
//                   </tr>
//                   <tr>
//                     <td>Secretary</td>
//                     <td className="text-center">
//                       <Badge
//                         bg={
//                           selectedMember.approvals.secretary.status ===
//                           "Approved"
//                             ? "success"
//                             : selectedMember.approvals.secretary.status ===
//                                 "Rejected"
//                               ? "danger"
//                               : "secondary"
//                         }
//                       >
//                         {selectedMember.approvals.secretary.status}
//                       </Badge>
//                     </td>
//                     <td className="text-end">
//                       {currentUser?.role === "secretary" &&
//                         selectedMember.approvals.secretary.status ===
//                           "Pending" && (
//                           <>
//                             <Button
//                               size="sm"
//                               variant="outline-success"
//                               className="me-1 py-0"
//                               onClick={() => handleApprove("Approved")}
//                             >
//                               Approve
//                             </Button>
//                             <Button
//                               size="sm"
//                               variant="outline-danger"
//                               className="py-0"
//                               onClick={() => handleApprove("Rejected")}
//                             >
//                               Reject
//                             </Button>
//                           </>
//                         )}
//                     </td>
//                   </tr>
//                   <tr>
//                     <td>Treasurer</td>
//                     <td className="text-center">
//                       <Badge
//                         bg={
//                           selectedMember.approvals.treasurer.status ===
//                           "Approved"
//                             ? "success"
//                             : selectedMember.approvals.treasurer.status ===
//                                 "Rejected"
//                               ? "danger"
//                               : "secondary"
//                         }
//                       >
//                         {selectedMember.approvals.treasurer.status}
//                       </Badge>
//                     </td>
//                     <td className="text-end">
//                       {currentUser?.role === "treasurer" &&
//                         selectedMember.approvals.treasurer.status ===
//                           "Pending" && (
//                           <>
//                             <Button
//                               size="sm"
//                               variant="outline-success"
//                               className="me-1 py-0"
//                               onClick={() => handleApprove("Approved")}
//                             >
//                               Approve
//                             </Button>
//                             <Button
//                               size="sm"
//                               variant="outline-danger"
//                               className="py-0"
//                               onClick={() => handleApprove("Rejected")}
//                             >
//                               Reject
//                             </Button>
//                           </>
//                         )}
//                     </td>
//                   </tr>
//                 </tbody>
//               </Table>

//               {currentUser?.role === "admin" &&
//                 selectedMember.membershipStatus === "Pending" && (
//                   <div className="mt-3 text-center border-top pt-2">
//                     <small className="text-muted d-block mb-2">
//                       System Admin Override
//                     </small>
//                     <Button
//                       size="sm"
//                       variant="dark"
//                       onClick={() => handleApprove("Approved")}
//                     >
//                       Force Approve
//                     </Button>
//                   </div>
//                 )}
//             </>
//           )}
//         </Modal.Body>
//       </Modal>
//       {/* --- CREATE MEMBER MODAL --- */}
//       <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
//         <Modal.Header closeButton className="bg-light">
//           <Modal.Title>New Member Application</Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           <Form onSubmit={handleSubmit}>
//             {/* Personal Details */}
//             <h6 className="text-maroon border-bottom pb-2 mb-3">
//               Personal Information
//             </h6>
//             <Row className="mb-2 g-2">
//               <Col md={6}>
//                 <Form.Control
//                   size="sm"
//                   placeholder="First Name *"
//                   name="firstName"
//                   value={formData.firstName}
//                   onChange={handleChange}
//                   required
//                 />
//               </Col>
//               <Col md={6}>
//                 <Form.Control
//                   size="sm"
//                   placeholder="Last Name *"
//                   name="lastName"
//                   value={formData.lastName}
//                   onChange={handleChange}
//                   required
//                 />
//               </Col>
//             </Row>

//             <Row className="mb-2 g-2">
//               <Col md={6}>
//                 <Form.Control
//                   size="sm"
//                   placeholder="Father's / Spouse Name"
//                   name="spouseName"
//                   value={formData.spouseName}
//                   onChange={handleChange}
//                 />
//               </Col>
//               <Col md={6}>
//                 <Form.Control
//                   size="sm"
//                   type="date"
//                   title="Date of Birth"
//                   name="dob"
//                   value={formData.dob}
//                   onChange={handleChange}
//                 />
//               </Col>
//             </Row>
//             <Row className="mb-2 g-2">
//               <Col md={6}>
//                 <Form.Control
//                   size="sm"
//                   placeholder="Qualification"
//                   name="qualification"
//                   value={formData.qualification}
//                   onChange={handleChange}
//                 />
//               </Col>
//               <Col md={6}>
//                 <Form.Control
//                   size="sm"
//                   placeholder="Profession"
//                   name="profession"
//                   value={formData.profession}
//                   onChange={handleChange}
//                 />
//               </Col>
//             </Row>
//             <Row className="mb-3 g-2">
//               <Col md={6}>
//                 <Form.Control
//                   size="sm"
//                   placeholder="Aadhaar"
//                   name="aadhaar"
//                   value={formData.aadhaar}
//                   onChange={handleChange}
//                 />
//               </Col>
//               <Col md={6}>
//                 <Form.Control
//                   size="sm"
//                   placeholder="PAN"
//                   name="pan"
//                   value={formData.pan}
//                   onChange={handleChange}
//                 />
//               </Col>
//             </Row>

//             <h6 className="text-maroon border-bottom pb-2 mb-3">
//               Contact & References
//             </h6>
//             <Row className="mb-2 g-2">
//               <Col md={6}>
//                 <Form.Control
//                   size="sm"
//                   placeholder="Mobile *"
//                   name="phone"
//                   value={formData.phone}
//                   onChange={handleChange}
//                   required
//                 />
//               </Col>
//               <Col md={6}>
//                 <Form.Control
//                   size="sm"
//                   placeholder="Email"
//                   name="email"
//                   value={formData.email}
//                   onChange={handleChange}
//                 />
//               </Col>
//             </Row>

//             <Form.Control
//               size="sm"
//               as="textarea"
//               rows={2}
//               placeholder="Residential Address *"
//               name="address"
//               value={formData.address}
//               onChange={handleChange}
//               className="mb-2"
//               required
//             />

//             {/* --- ADDED MISSING FIELDS HERE --- */}
//             <Form.Control
//               size="sm"
//               placeholder="Positions held in other Organizations (Optional)"
//               name="otherOrgPositions"
//               value={formData.otherOrgPositions}
//               onChange={handleChange}
//               className="mb-2"
//             />
//             <Form.Control
//               size="sm"
//               placeholder="References (Introduced by)"
//               name="references"
//               value={formData.references}
//               onChange={handleChange}
//               className="mb-3"
//             />

//             <h6 className="text-maroon border-bottom pb-2 mb-3">
//               Membership Plan
//             </h6>
//             <Row className="g-2">
//               <Col md={4} className="mb-3">
//                 <Form.Label className="small fw-bold">Category</Form.Label>
//                 <Form.Select
//                   size="sm"
//                   name="category"
//                   value={formData.category}
//                   onChange={handleChange}
//                 >
//                   <option value="Ordinary">Ordinary Member</option>
//                   <option value="Permanent">Permanent Member</option>
//                   <option value="EC">Executive Committee</option>
//                 </Form.Select>
//               </Col>
//               <Col md={4} className="mb-3">
//                 <Form.Label className="small fw-bold">Plan Type</Form.Label>
//                 <Form.Select
//                   size="sm"
//                   name="membershipType"
//                   value={formData.membershipType}
//                   onChange={handleChange}
//                 >
//                   <option value="Annual">Annual</option>
//                   <option value="Life">Life Membership</option>
//                   <option value="Patron">Patron</option>
//                   <option value="Volunteer">Volunteer</option>
//                 </Form.Select>
//               </Col>
//               <Col md={4} className="mb-3">
//                 <Form.Label className="small fw-bold">Branch</Form.Label>
//                 <Form.Select
//                   size="sm"
//                   name="branch"
//                   value={formData.branch}
//                   onChange={handleChange}
//                 >
//                   <option value="Karunya Sindhu">Karunya Sindhu</option>
//                   <option value="Karunya Bharathi">Karunya Bharathi</option>
//                   <option value="Karunya Jyothi">Karunya Jyothi</option>
//                   <option value="Headquarters">Headquarters</option>
//                 </Form.Select>
//               </Col>
//             </Row>
//             <Row className="g-2">
//               <Col md={6}>
//                 <Form.Control
//                   size="sm"
//                   type="number"
//                   placeholder="Fee Amount"
//                   name="feeAmount"
//                   value={formData.feeAmount}
//                   onChange={handleChange}
//                 />
//               </Col>
//               <Col md={6}>
//                 <Form.Select
//                   size="sm"
//                   name="feeStatus"
//                   value={formData.feeStatus}
//                   onChange={handleChange}
//                 >
//                   <option value="Paid">Paid</option>
//                   <option value="Pending">Pending</option>
//                 </Form.Select>
//               </Col>
//             </Row>

//             <Button type="submit" className="w-100 btn-ashram mt-4">
//               Submit Application
//             </Button>
//           </Form>
//         </Modal.Body>
//       </Modal>

//       {/* ACTIVITY MODAL (Same as before) */}
//       <Modal
//         show={showActivityModal}
//         onHide={() => setShowActivityModal(false)}
//       >
//         <Modal.Header closeButton>
//           <Modal.Title>Log Activity</Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           <Form onSubmit={handleAddActivity}>
//             <Form.Group className="mb-3">
//               <Form.Label>Event Name</Form.Label>
//               <Form.Control
//                 value={activityData.eventName}
//                 onChange={(e) =>
//                   setActivityData({
//                     ...activityData,
//                     eventName: e.target.value,
//                   })
//                 }
//                 required
//               />
//             </Form.Group>
//             <Form.Group className="mb-3">
//               <Form.Label>Role</Form.Label>
//               <Form.Control
//                 value={activityData.role}
//                 onChange={(e) =>
//                   setActivityData({ ...activityData, role: e.target.value })
//                 }
//                 required
//               />
//             </Form.Group>
//             <Form.Group className="mb-3">
//               <Form.Label>Date</Form.Label>
//               <Form.Control
//                 type="date"
//                 value={activityData.date}
//                 onChange={(e) =>
//                   setActivityData({ ...activityData, date: e.target.value })
//                 }
//                 required
//               />
//             </Form.Group>
//             <Button type="submit" className="w-100 btn-ashram">
//               Save
//             </Button>
//           </Form>
//         </Modal.Body>
//       </Modal>
//     </div>
//   );
// };

// export default MemberList;
// Above code is before me implement the import button for importing and exporting the members.
/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/immutability */
import React, { useEffect, useState } from "react";
import axios from "axios";
import BASE_URL from "../../apiConfig";
import { Link } from "react-router-dom";

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
  FaUserTie,
  FaCheckCircle,
  FaTimesCircle,
  FaTasks,
  FaFilePdf,
  FaEye,
  FaFileUpload, // <--- New
  FaFileDownload, // <--- New
} from "react-icons/fa";

const MemberList = () => {
  const [members, setMembers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentUser, setCurrentUser] = useState(null);

  const [showApproveModal, setShowApproveModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);

  const [showActivityModal, setShowActivityModal] = useState(false);
  const [activityData, setActivityData] = useState({
    eventName: "",
    role: "",
    date: "",
  });

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    spouseName: "",
    dob: "",
    qualification: "",
    profession: "",
    otherOrgPositions: "",
    references: "",
    pan: "",
    aadhaar: "",
    phone: "",
    email: "",
    address: "",
    membershipType: "Annual",
    category: "Ordinary",
    feeAmount: "1000",
    feeStatus: "Paid",
    branch: "Karunya Sindhu",
  });

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("userInfo"));
    setCurrentUser(user);
    if (user) fetchMembers(user);
  }, []);

  const fetchMembers = async (user) => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get(`${BASE_URL}/api/members`, config);
      setMembers(data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch members");
      setLoading(false);
    }
  };

  const handleApprove = async (status) => {
    try {
      const config = {
        headers: { Authorization: `Bearer ${currentUser.token}` },
      };
      await axios.put(
        `${BASE_URL}/api/members/${selectedMember._id}/approve`,
        { status, remark: "Approved via Dashboard" },
        config,
      );
      alert(`Membership ${status}`);
      setShowApproveModal(false);
      fetchMembers(currentUser);
    } catch (err) {
      alert("Error processing approval");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const config = {
        headers: { Authorization: `Bearer ${currentUser.token}` },
      };
      await axios.post(`${BASE_URL}/api/members`, formData, config);
      setShowModal(false);
      fetchMembers(currentUser);
      alert("Application Submitted! Waiting for Committee Approval.");

      setFormData({
        firstName: "",
        lastName: "",
        spouseName: "",
        dob: "",
        qualification: "",
        profession: "",
        otherOrgPositions: "",
        references: "",
        pan: "",
        aadhaar: "",
        phone: "",
        email: "",
        address: "",
        membershipType: "Annual",
        category: "Ordinary",
        feeAmount: "1000",
        feeStatus: "Paid",
        branch: "Karunya Sindhu",
      });
    } catch (err) {
      alert("Error registering member");
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const openApproveModal = (m) => {
    setSelectedMember(m);
    setShowApproveModal(true);
  };

  const openActivityModal = (member) => {
    setSelectedMember(member);
    setShowActivityModal(true);
  };

  const handleAddActivity = async (e) => {
    e.preventDefault();
    try {
      const config = {
        headers: { Authorization: `Bearer ${currentUser.token}` },
      };
      await axios.post(
        `${BASE_URL}/api/members/${selectedMember._id}/activity`,
        activityData,
        config,
      );
      alert("Activity Logged!");
      setShowActivityModal(false);
      setActivityData({ eventName: "", role: "", date: "" });
      fetchMembers(currentUser);
    } catch (err) {
      alert("Error logging activity");
    }
  };

  const handleDownloadBlank = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/members/blank-form`, {
        headers: { Authorization: `Bearer ${currentUser.token}` },
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "Blank_Membership_Form.pdf");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      alert("Error downloading blank form");
    }
  };

  // --- NEW: IMPORT LOGIC ---
  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const fd = new FormData();
    fd.append("file", file);

    try {
      const config = {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${currentUser.token}`,
        },
      };

      const { data } = await axios.post(
        `${BASE_URL}/api/members/import`,
        fd,
        config,
      );

      alert(data.message);
      fetchMembers(currentUser); // Refresh list
    } catch (err) {
      alert(err.response?.data?.message || "Import Failed");
    }
  };

  // --- NEW: EXPORT LOGIC ---
  const handleExport = () => {
    if (members.length === 0) return alert("No members to export");

    const headers = [
      "First Name",
      "Last Name",
      "Father/Spouse Name",
      "DOB",
      "Mobile",
      "Email",
      "Aadhaar",
      "PAN",
      "Address",
      "Qualification",
      "Profession",
      "References",
      "Category",
      "Plan",
      "Fee Amount",
      "Fee Status",
      "Branch",
      "Join Date",
      "Membership Status",
    ];

    const rows = members.map((m) => [
      `"${m.firstName}"`,
      `"${m.lastName}"`,
      `"${m.spouseName || "-"}"`,
      m.dob ? new Date(m.dob).toLocaleDateString() : "-",
      `"${m.phone}"`,
      `"${m.email || "-"}"`,
      `"${m.aadhaar || "-"}"`,
      `"${m.pan || "-"}"`,
      `"${m.address ? m.address.replace(/\n/g, " ") : "-"}"`,
      `"${m.qualification || "-"}"`,
      `"${m.profession || "-"}"`,
      `"${m.references || "-"}"`,
      m.category,
      m.membershipType,
      m.feeAmount,
      m.feeStatus,
      m.branch,
      new Date(m.joinDate).toLocaleDateString(),
      m.membershipStatus,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      headers.join(",") +
      "\n" +
      rows.map((e) => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    const dateStr = new Date().toISOString().split("T")[0];
    link.setAttribute("download", `KSS_Members_Export_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const ApprovalStatus = ({ status, label }) => {
    let color = "text-muted";
    let icon = "⏳";
    if (status === "Approved") {
      color = "text-success";
      icon = "✅";
    } else if (status === "Rejected") {
      color = "text-danger";
      icon = "❌";
    }

    return (
      <span className={`${color} small fw-bold me-2`} title={label}>
        {label.charAt(0)}:{icon}
      </span>
    );
  };

  return (
    <div>
      <Row className="mb-4 align-items-center">
        <Col lg={4} xs={12} className="mb-3 mb-lg-0">
          <h2
            className="text-maroon m-0"
            style={{ fontFamily: "Playfair Display" }}
          >
            Membership Registry
          </h2>
          <p className="text-muted m-0 small">
            Manage Volunteers, Life Members, and Patrons
          </p>
        </Col>

        {/* Updated Header Buttons */}
        <Col lg={8} xs={12}>
          <div className="d-flex flex-wrap gap-2 justify-content-lg-end justify-content-start">
            <Button
              variant="outline-danger"
              className="shadow-sm flex-grow-1 flex-lg-grow-0"
              onClick={handleDownloadBlank}
            >
              <FaFilePdf className="me-1" /> Blank Form
            </Button>

            {/* Hidden Input for CSV Upload */}
            <input
              type="file"
              id="memberCsvInput"
              accept=".csv"
              style={{ display: "none" }}
              onChange={handleImport}
            />

            {/* Import Button */}
            <Button
              variant="warning"
              className="text-dark shadow-sm flex-grow-1 flex-lg-grow-0"
              onClick={() => document.getElementById("memberCsvInput").click()}
            >
              <FaFileUpload className="me-1" /> Import CSV
            </Button>

            {/* Export Button */}
            <Button
              variant="success"
              className="shadow-sm flex-grow-1 flex-lg-grow-0"
              onClick={handleExport}
            >
              <FaFileDownload className="me-1" /> Export List
            </Button>

            {/* Add New Button */}
            <Button
              variant="primary"
              className="shadow-sm flex-grow-1 flex-lg-grow-0"
              style={{ backgroundColor: "#581818", border: "none" }}
              onClick={() => setShowModal(true)}
            >
              <FaPlus className="me-1" /> New Application
            </Button>
          </div>
        </Col>
      </Row>

      {error && <Alert variant="danger">{error}</Alert>}

      <Card className="shadow-sm border-0">
        <Card.Body className="p-0">
          <Table
            hover
            responsive
            className="align-middle mb-0"
            style={{ fontSize: "0.9rem" }}
          >
            <thead className="bg-light">
              <tr>
                <th className="ps-4">Name</th>
                <th>Contact</th>
                <th>Category / Plan</th>
                <th>Approvals</th>
                <th>Membership Status</th>
                <th>Fee Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {members.map((m) => (
                <tr key={m._id}>
                  <td className="ps-4">
                    <div className="fw-bold">
                      <FaUserTie className="me-2 text-secondary" />
                      {m.firstName} {m.lastName}
                    </div>
                    <small className="text-muted">{m.branch}</small>
                  </td>
                  <td>
                    <div>{m.phone}</div>
                    <small className="text-muted">{m.email}</small>
                  </td>

                  <td>
                    <div className="d-flex flex-column gap-1 align-items-start">
                      <Badge bg="secondary">{m.category}</Badge>
                      <small>{m.membershipType}</small>
                    </div>
                  </td>

                  <td>
                    <ApprovalStatus
                      status={m.approvals?.president?.status}
                      label="President"
                    />
                    <ApprovalStatus
                      status={m.approvals?.secretary?.status}
                      label="Secretary"
                    />
                    <ApprovalStatus
                      status={m.approvals?.treasurer?.status}
                      label="Treasurer"
                    />
                  </td>

                  <td>
                    <Badge
                      bg={
                        m.membershipStatus === "Active"
                          ? "success"
                          : m.membershipStatus === "Rejected"
                            ? "danger"
                            : "warning"
                      }
                      text={m.membershipStatus === "Pending" ? "dark" : "light"}
                    >
                      {m.membershipStatus}
                    </Badge>
                  </td>

                  <td>
                    {m.feeStatus === "Paid" ? (
                      <span className="text-success fw-bold small">
                        <FaCheckCircle /> Paid
                      </span>
                    ) : (
                      <span className="text-danger fw-bold small">
                        <FaTimesCircle /> Pending
                      </span>
                    )}
                  </td>
                  <td>
                    <div className="d-flex gap-2">
                      <Button
                        size="sm"
                        variant="outline-dark"
                        onClick={() => openApproveModal(m)}
                        title="View/Approve"
                      >
                        <FaEye />
                      </Button>
                      <Link
                        to={`/dashboard/members/${m._id}`}
                        className="btn btn-sm btn-outline-primary"
                        title="View Profile"
                      >
                        <FaUserTie />
                      </Link>
                      <Button
                        size="sm"
                        variant="outline-secondary"
                        onClick={() => openActivityModal(m)}
                        title="Log Activity"
                      >
                        <FaTasks />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      <Modal show={showApproveModal} onHide={() => setShowApproveModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Membership Application Review</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedMember && (
            <>
              <div className="bg-light p-3 rounded mb-3 border">
                <h5 className="text-maroon fw-bold mb-3">
                  {selectedMember.firstName} {selectedMember.lastName}
                </h5>

                <Row className="g-2 small text-muted">
                  <Col xs={6}>
                    <strong>Applied For:</strong>
                    <br />
                    <span className="text-dark">
                      {selectedMember.category} ({selectedMember.membershipType}
                      )
                    </span>
                  </Col>
                  <Col xs={6}>
                    <strong>Referred By:</strong>
                    <br />
                    <span className="text-dark fw-bold">
                      {selectedMember.references || "N/A"}
                    </span>
                  </Col>
                  <Col xs={6}>
                    <strong>Profession:</strong>
                    <br />
                    <span className="text-dark">
                      {selectedMember.profession || "-"}
                    </span>
                  </Col>
                  <Col xs={6}>
                    <strong>Payment:</strong>
                    <br />
                    {selectedMember.feeStatus === "Paid" ? (
                      <Badge bg="success">
                        Paid ₹{selectedMember.feeAmount}
                      </Badge>
                    ) : (
                      <Badge bg="danger">Pending</Badge>
                    )}
                  </Col>
                </Row>
              </div>

              <h6 className="small fw-bold text-uppercase text-muted mb-2">
                Committee Decisions
              </h6>
              <Table bordered size="sm" className="mb-0 align-middle">
                <tbody>
                  <tr>
                    <td style={{ width: "30%" }}>President</td>
                    <td className="text-center">
                      <Badge
                        bg={
                          selectedMember.approvals.president.status ===
                          "Approved"
                            ? "success"
                            : selectedMember.approvals.president.status ===
                                "Rejected"
                              ? "danger"
                              : "secondary"
                        }
                      >
                        {selectedMember.approvals.president.status}
                      </Badge>
                    </td>
                    <td className="text-end">
                      {currentUser?.role === "president" &&
                        selectedMember.approvals.president.status ===
                          "Pending" && (
                          <>
                            <Button
                              size="sm"
                              variant="outline-success"
                              className="me-1 py-0"
                              onClick={() => handleApprove("Approved")}
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline-danger"
                              className="py-0"
                              onClick={() => handleApprove("Rejected")}
                            >
                              Reject
                            </Button>
                          </>
                        )}
                    </td>
                  </tr>
                  <tr>
                    <td>Secretary</td>
                    <td className="text-center">
                      <Badge
                        bg={
                          selectedMember.approvals.secretary.status ===
                          "Approved"
                            ? "success"
                            : selectedMember.approvals.secretary.status ===
                                "Rejected"
                              ? "danger"
                              : "secondary"
                        }
                      >
                        {selectedMember.approvals.secretary.status}
                      </Badge>
                    </td>
                    <td className="text-end">
                      {currentUser?.role === "secretary" &&
                        selectedMember.approvals.secretary.status ===
                          "Pending" && (
                          <>
                            <Button
                              size="sm"
                              variant="outline-success"
                              className="me-1 py-0"
                              onClick={() => handleApprove("Approved")}
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline-danger"
                              className="py-0"
                              onClick={() => handleApprove("Rejected")}
                            >
                              Reject
                            </Button>
                          </>
                        )}
                    </td>
                  </tr>
                  <tr>
                    <td>Treasurer</td>
                    <td className="text-center">
                      <Badge
                        bg={
                          selectedMember.approvals.treasurer.status ===
                          "Approved"
                            ? "success"
                            : selectedMember.approvals.treasurer.status ===
                                "Rejected"
                              ? "danger"
                              : "secondary"
                        }
                      >
                        {selectedMember.approvals.treasurer.status}
                      </Badge>
                    </td>
                    <td className="text-end">
                      {currentUser?.role === "treasurer" &&
                        selectedMember.approvals.treasurer.status ===
                          "Pending" && (
                          <>
                            <Button
                              size="sm"
                              variant="outline-success"
                              className="me-1 py-0"
                              onClick={() => handleApprove("Approved")}
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline-danger"
                              className="py-0"
                              onClick={() => handleApprove("Rejected")}
                            >
                              Reject
                            </Button>
                          </>
                        )}
                    </td>
                  </tr>
                </tbody>
              </Table>

              {currentUser?.role === "admin" &&
                selectedMember.membershipStatus === "Pending" && (
                  <div className="mt-3 text-center border-top pt-2">
                    <small className="text-muted d-block mb-2">
                      System Admin Override
                    </small>
                    <Button
                      size="sm"
                      variant="dark"
                      onClick={() => handleApprove("Approved")}
                    >
                      Force Approve
                    </Button>
                  </div>
                )}
            </>
          )}
        </Modal.Body>
      </Modal>

      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton className="bg-light">
          <Modal.Title>New Member Application</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <h6 className="text-maroon border-bottom pb-2 mb-3">
              Personal Information
            </h6>
            <Row className="mb-2 g-2">
              <Col md={6}>
                <Form.Control
                  size="sm"
                  placeholder="First Name *"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                />
              </Col>
              <Col md={6}>
                <Form.Control
                  size="sm"
                  placeholder="Last Name *"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                />
              </Col>
            </Row>

            <Row className="mb-2 g-2">
              <Col md={6}>
                <Form.Control
                  size="sm"
                  placeholder="Father's / Spouse Name"
                  name="spouseName"
                  value={formData.spouseName}
                  onChange={handleChange}
                />
              </Col>
              <Col md={6}>
                <Form.Control
                  size="sm"
                  type="date"
                  title="Date of Birth"
                  name="dob"
                  value={formData.dob}
                  onChange={handleChange}
                />
              </Col>
            </Row>
            <Row className="mb-2 g-2">
              <Col md={6}>
                <Form.Control
                  size="sm"
                  placeholder="Qualification"
                  name="qualification"
                  value={formData.qualification}
                  onChange={handleChange}
                />
              </Col>
              <Col md={6}>
                <Form.Control
                  size="sm"
                  placeholder="Profession"
                  name="profession"
                  value={formData.profession}
                  onChange={handleChange}
                />
              </Col>
            </Row>
            <Row className="mb-3 g-2">
              <Col md={6}>
                <Form.Control
                  size="sm"
                  placeholder="Aadhaar"
                  name="aadhaar"
                  value={formData.aadhaar}
                  onChange={handleChange}
                />
              </Col>
              <Col md={6}>
                <Form.Control
                  size="sm"
                  placeholder="PAN"
                  name="pan"
                  value={formData.pan}
                  onChange={handleChange}
                />
              </Col>
            </Row>

            <h6 className="text-maroon border-bottom pb-2 mb-3">
              Contact & References
            </h6>
            <Row className="mb-2 g-2">
              <Col md={6}>
                <Form.Control
                  size="sm"
                  placeholder="Mobile *"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </Col>
              <Col md={6}>
                <Form.Control
                  size="sm"
                  placeholder="Email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </Col>
            </Row>

            <Form.Control
              size="sm"
              as="textarea"
              rows={2}
              placeholder="Residential Address *"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="mb-2"
              required
            />

            <Form.Control
              size="sm"
              placeholder="Positions held in other Organizations (Optional)"
              name="otherOrgPositions"
              value={formData.otherOrgPositions}
              onChange={handleChange}
              className="mb-2"
            />
            <Form.Control
              size="sm"
              placeholder="References (Introduced by)"
              name="references"
              value={formData.references}
              onChange={handleChange}
              className="mb-3"
            />

            <h6 className="text-maroon border-bottom pb-2 mb-3">
              Membership Plan
            </h6>
            <Row className="g-2">
              <Col md={4} className="mb-3">
                <Form.Label className="small fw-bold">Category</Form.Label>
                <Form.Select
                  size="sm"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                >
                  <option value="Ordinary">Ordinary Member</option>
                  <option value="Permanent">Permanent Member</option>
                  <option value="EC">Executive Committee</option>
                </Form.Select>
              </Col>
              <Col md={4} className="mb-3">
                <Form.Label className="small fw-bold">Plan Type</Form.Label>
                <Form.Select
                  size="sm"
                  name="membershipType"
                  value={formData.membershipType}
                  onChange={handleChange}
                >
                  <option value="Annual">Annual</option>
                  <option value="Life">Life Membership</option>
                  <option value="Patron">Patron</option>
                  <option value="Volunteer">Volunteer</option>
                </Form.Select>
              </Col>
              <Col md={4} className="mb-3">
                <Form.Label className="small fw-bold">Branch</Form.Label>
                <Form.Select
                  size="sm"
                  name="branch"
                  value={formData.branch}
                  onChange={handleChange}
                >
                  <option value="Karunya Sindhu">Karunya Sindhu</option>
                  <option value="Karunya Bharathi">Karunya Bharathi</option>
                  <option value="Karunya Jyothi">Karunya Jyothi</option>
                  <option value="Headquarters">Headquarters</option>
                </Form.Select>
              </Col>
            </Row>
            <Row className="g-2">
              <Col md={6}>
                <Form.Control
                  size="sm"
                  type="number"
                  placeholder="Fee Amount"
                  name="feeAmount"
                  value={formData.feeAmount}
                  onChange={handleChange}
                />
              </Col>
              <Col md={6}>
                <Form.Select
                  size="sm"
                  name="feeStatus"
                  value={formData.feeStatus}
                  onChange={handleChange}
                >
                  <option value="Paid">Paid</option>
                  <option value="Pending">Pending</option>
                </Form.Select>
              </Col>
            </Row>

            <Button type="submit" className="w-100 btn-ashram mt-4">
              Submit Application
            </Button>
          </Form>
        </Modal.Body>
      </Modal>

      <Modal
        show={showActivityModal}
        onHide={() => setShowActivityModal(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Log Member Activity</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="text-muted small mb-3">
            Member:{" "}
            <strong>
              {selectedMember?.firstName} {selectedMember?.lastName}
            </strong>
          </p>
          <Form onSubmit={handleAddActivity}>
            <Form.Group className="mb-3">
              <Form.Label>Event / Task Name</Form.Label>
              <Form.Control
                placeholder="e.g. Janmashtami Setup"
                value={activityData.eventName}
                onChange={(e) =>
                  setActivityData({
                    ...activityData,
                    eventName: e.target.value,
                  })
                }
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Role / Responsibility</Form.Label>
              <Form.Control
                placeholder="e.g. Food Serving Volunteer"
                value={activityData.role}
                onChange={(e) =>
                  setActivityData({ ...activityData, role: e.target.value })
                }
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Date</Form.Label>
              <Form.Control
                type="date"
                value={activityData.date}
                onChange={(e) =>
                  setActivityData({ ...activityData, date: e.target.value })
                }
                required
              />
            </Form.Group>
            <Button type="submit" className="w-100 btn-ashram">
              Save Activity
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default MemberList;
