/* eslint-disable no-unused-vars */
// /* eslint-disable no-unused-vars */
// import React, { useEffect, useState } from "react";
// import { useParams, Link } from "react-router-dom";
// import {
//   Row,
//   Col,
//   Card,
//   Tabs,
//   Tab,
//   Table,
//   Button,
//   Form,
//   Badge,
//   Spinner,
//   Modal,
//   Alert,
// } from "react-bootstrap";
// import {
//   FaArrowLeft,
//   FaUserGraduate,
//   FaHeartbeat,
//   FaBook,
//   FaRupeeSign,
//   FaPlus,
//   FaHandHoldingHeart,
//   FaEdit,
//   FaSave,
// } from "react-icons/fa";
// import axios from "axios";

// const StudentProfile = () => {
//   const { id } = useParams();
//   const [student, setStudent] = useState(null);
//   const [loading, setLoading] = useState(true);

//   // Edit Mode State
//   const [isEditing, setIsEditing] = useState(false);
//   const [editData, setEditData] = useState({});

//   // Sub-data States
//   const [newEdu, setNewEdu] = useState({
//     year: "",
//     class: "",
//     school: "",
//     percentage: "",
//   });
//   const [newHealth, setNewHealth] = useState({
//     checkupType: "",
//     doctorName: "",
//     observation: "",
//   });
//   const [newExpense, setNewExpense] = useState({ description: "", amount: "" });

//   // Sponsor States
//   const [showSponsorModal, setShowSponsorModal] = useState(false);
//   const [donors, setDonors] = useState([]);
//   const [selectedSponsorId, setSelectedSponsorId] = useState("");

//   useEffect(() => {
//     fetchStudent();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [id]);

//   const fetchStudent = async () => {
//     try {
//       const userInfo = JSON.parse(localStorage.getItem("userInfo"));
//       const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
//       const { data } = await axios.get(
//         `http://localhost:5000/api/students/${id}`,
//         config
//       );
//       setStudent(data);
//       setEditData(data);
//       setLoading(false);
//     } catch (error) {
//       console.error(error);
//       setLoading(false);
//     }
//   };

//   const saveProfileChanges = async () => {
//     try {
//       const userInfo = JSON.parse(localStorage.getItem("userInfo"));
//       const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

//       await axios.put(
//         `http://localhost:5000/api/students/${id}`,
//         {
//           firstName: editData.firstName,
//           lastName: editData.lastName,
//           guardianName: editData.guardianName,
//           contactNumber: editData.contactNumber,
//           address: editData.address,
//           dob: editData.dob,
//         },
//         config
//       );

//       setIsEditing(false);
//       fetchStudent();
//       alert("Profile Updated Successfully!");
//     } catch (error) {
//       alert("Error updating profile");
//     }
//   };

//   const handleUpdate = async (updateData) => {
//     try {
//       const userInfo = JSON.parse(localStorage.getItem("userInfo"));
//       const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
//       await axios.put(
//         `http://localhost:5000/api/students/${id}`,
//         updateData,
//         config
//       );
//       fetchStudent();
//     } catch (error) {
//       alert("Error updating student");
//     }
//   };

//   // --- Helper Functions ---
//   const addEducation = () => {
//     if (!newEdu.year || !newEdu.school) return alert("Please fill details");
//     const updatedHistory = [...student.educationHistory, newEdu];
//     handleUpdate({ educationHistory: updatedHistory });
//     setNewEdu({ year: "", class: "", school: "", percentage: "" });
//   };

//   const addHealth = () => {
//     if (!newHealth.checkupType) return alert("Please fill details");
//     const updatedHealth = [...student.healthRecords, newHealth];
//     handleUpdate({ healthRecords: updatedHealth });
//     setNewHealth({ checkupType: "", doctorName: "", observation: "" });
//   };

//   const addExpense = () => {
//     if (!newExpense.description || !newExpense.amount)
//       return alert("Please enter description and amount");
//     handleUpdate({
//       newExpense: {
//         description: newExpense.description,
//         amount: Number(newExpense.amount),
//         date: new Date(),
//       },
//     });
//     setNewExpense({ description: "", amount: "" });
//   };

//   const openSponsorModal = async () => {
//     setShowSponsorModal(true);
//     try {
//       const userInfo = JSON.parse(localStorage.getItem("userInfo"));
//       const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
//       const { data } = await axios.get(
//         "http://localhost:5000/api/donations",
//         config
//       );
//       setDonors(data);
//     } catch (err) {
//       alert("Failed to load donor list");
//     }
//   };

//   const mapSponsor = async () => {
//     if (!selectedSponsorId) return alert("Select a sponsor");
//     await handleUpdate({ sponsor: selectedSponsorId });
//     setShowSponsorModal(false);
//     alert("Sponsor Mapped Successfully!");
//   };

//   if (loading)
//     return (
//       <div className="text-center py-5">
//         <Spinner animation="border" />
//       </div>
//     );

//   return (
//     <div>
//       {/* Header */}
//       <div className="d-flex align-items-center gap-3 mb-4">
//         <Link
//           to="/dashboard/students"
//           className="btn btn-outline-secondary btn-sm"
//         >
//           <FaArrowLeft />
//         </Link>
//         <div>
//           <h2
//             className="text-maroon m-0"
//             style={{ fontFamily: "Playfair Display" }}
//           >
//             {student.firstName} {student.lastName}
//           </h2>
//           <span className="text-muted">
//             ID: {student._id.slice(-6).toUpperCase()}
//           </span>
//         </div>
//         <div className="ms-auto d-flex gap-2">
//           {/* Edit Toggle Button Only - Print Removed */}
//           {isEditing ? (
//             <Button variant="success" onClick={saveProfileChanges}>
//               <FaSave /> Save Changes
//             </Button>
//           ) : (
//             <Button
//               variant="primary"
//               style={{ backgroundColor: "#581818" }}
//               onClick={() => setIsEditing(true)}
//             >
//               <FaEdit /> Edit Details
//             </Button>
//           )}
//         </div>
//       </div>

//       <Row>
//         {/* Left Sidebar: Basic Info (Editable) */}
//         <Col md={4}>
//           <Card className="shadow-sm border-0 mb-4">
//             <Card.Body>
//               <div className="text-center mb-3">
//                 <div
//                   className="bg-light rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
//                   style={{ width: "100px", height: "100px" }}
//                 >
//                   <FaUserGraduate size={50} className="text-secondary" />
//                 </div>
//               </div>

//               {isEditing ? (
//                 <Form>
//                   <Row className="mb-2">
//                     <Col>
//                       <Form.Control
//                         size="sm"
//                         value={editData.firstName}
//                         onChange={(e) =>
//                           setEditData({
//                             ...editData,
//                             firstName: e.target.value,
//                           })
//                         }
//                         placeholder="First Name"
//                       />
//                     </Col>
//                     <Col>
//                       <Form.Control
//                         size="sm"
//                         value={editData.lastName}
//                         onChange={(e) =>
//                           setEditData({ ...editData, lastName: e.target.value })
//                         }
//                         placeholder="Last Name"
//                       />
//                     </Col>
//                   </Row>
//                   <Form.Control
//                     size="sm"
//                     type="date"
//                     className="mb-2"
//                     value={editData.dob ? editData.dob.split("T")[0] : ""}
//                     onChange={(e) =>
//                       setEditData({ ...editData, dob: e.target.value })
//                     }
//                   />
//                   <Form.Control
//                     size="sm"
//                     className="mb-2"
//                     value={editData.guardianName}
//                     onChange={(e) =>
//                       setEditData({ ...editData, guardianName: e.target.value })
//                     }
//                     placeholder="Guardian"
//                   />
//                   <Form.Control
//                     size="sm"
//                     className="mb-2"
//                     value={editData.contactNumber}
//                     onChange={(e) =>
//                       setEditData({
//                         ...editData,
//                         contactNumber: e.target.value,
//                       })
//                     }
//                     placeholder="Contact"
//                   />
//                   <Form.Control
//                     size="sm"
//                     as="textarea"
//                     value={editData.address}
//                     onChange={(e) =>
//                       setEditData({ ...editData, address: e.target.value })
//                     }
//                     placeholder="Address"
//                   />
//                 </Form>
//               ) : (
//                 <div className="text-center">
//                   <h5>
//                     {student.firstName} {student.lastName}
//                   </h5>
//                   <p className="text-muted small">
//                     {student.gender} |{" "}
//                     {new Date(student.dob).toLocaleDateString()}
//                   </p>
//                   <hr />
//                   <div className="text-start">
//                     <p>
//                       <strong>Guardian:</strong> {student.guardianName}
//                     </p>
//                     <p>
//                       <strong>Contact:</strong> {student.contactNumber}
//                     </p>
//                     <p>
//                       <strong>Address:</strong> {student.address}
//                     </p>
//                   </div>
//                 </div>
//               )}
//             </Card.Body>
//           </Card>

//           {/* Sponsor Card */}
//           <Card className="shadow-sm border-0 bg-light">
//             <Card.Body>
//               <h6 className="text-maroon fw-bold">
//                 <FaHandHoldingHeart /> Sponsor Details
//               </h6>
//               {student.sponsor ? (
//                 <div className="mt-3">
//                   <p className="text-success fw-bold mb-1">Sponsored</p>
//                   <small className="text-muted">
//                     Sponsor ID: {student.sponsor.slice(-6)}
//                   </small>
//                   <div className="mt-2">
//                     <Button
//                       size="sm"
//                       variant="outline-danger"
//                       onClick={() => handleUpdate({ sponsor: null })}
//                     >
//                       Remove Mapping
//                     </Button>
//                   </div>
//                 </div>
//               ) : (
//                 <div className="text-center mt-3">
//                   <small className="text-muted d-block mb-2">
//                     No sponsor mapped yet.
//                   </small>
//                   <Button
//                     size="sm"
//                     variant="outline-primary"
//                     onClick={openSponsorModal}
//                   >
//                     Map Sponsor
//                   </Button>
//                 </div>
//               )}
//             </Card.Body>
//           </Card>
//         </Col>

//         {/* Right Content: Tabs */}
//         <Col md={8}>
//           <Card className="shadow-sm border-0">
//             <Card.Body>
//               <Tabs defaultActiveKey="education" className="mb-3">
//                 <Tab
//                   eventKey="education"
//                   title={
//                     <span>
//                       <FaBook /> Education
//                     </span>
//                   }
//                 >
//                   <Table striped bordered hover size="sm">
//                     <thead>
//                       <tr>
//                         <th>Year</th>
//                         <th>Class</th>
//                         <th>School</th>
//                         <th>%</th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {student.educationHistory.map((edu, idx) => (
//                         <tr key={idx}>
//                           <td>{edu.year}</td>
//                           <td>{edu.class}</td>
//                           <td>{edu.school}</td>
//                           <td>{edu.percentage}</td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </Table>
//                   <div className="p-3 bg-light rounded">
//                     <h6>Add Academic Record</h6>
//                     <Row className="g-2">
//                       <Col md={3}>
//                         <Form.Control
//                           placeholder="Year"
//                           value={newEdu.year}
//                           onChange={(e) =>
//                             setNewEdu({ ...newEdu, year: e.target.value })
//                           }
//                         />
//                       </Col>
//                       <Col md={3}>
//                         <Form.Control
//                           placeholder="Class"
//                           value={newEdu.class}
//                           onChange={(e) =>
//                             setNewEdu({ ...newEdu, class: e.target.value })
//                           }
//                         />
//                       </Col>
//                       <Col md={4}>
//                         <Form.Control
//                           placeholder="School"
//                           value={newEdu.school}
//                           onChange={(e) =>
//                             setNewEdu({ ...newEdu, school: e.target.value })
//                           }
//                         />
//                       </Col>
//                       <Col md={2}>
//                         <Button size="sm" onClick={addEducation}>
//                           <FaPlus />
//                         </Button>
//                       </Col>
//                     </Row>
//                   </div>
//                 </Tab>
//                 <Tab
//                   eventKey="health"
//                   title={
//                     <span>
//                       <FaHeartbeat /> Health
//                     </span>
//                   }
//                 >
//                   <Table striped bordered hover size="sm">
//                     <thead>
//                       <tr>
//                         <th>Date</th>
//                         <th>Type</th>
//                         <th>Doctor</th>
//                         <th>Observation</th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {student.healthRecords.map((h, idx) => (
//                         <tr key={idx}>
//                           <td>{new Date(h.date).toLocaleDateString()}</td>
//                           <td>{h.checkupType}</td>
//                           <td>{h.doctorName}</td>
//                           <td>{h.observation}</td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </Table>
//                   <div className="p-3 bg-light rounded">
//                     <h6>Add Health Checkup</h6>
//                     <Row className="g-2">
//                       <Col md={4}>
//                         <Form.Control
//                           placeholder="Type"
//                           value={newHealth.checkupType}
//                           onChange={(e) =>
//                             setNewHealth({
//                               ...newHealth,
//                               checkupType: e.target.value,
//                             })
//                           }
//                         />
//                       </Col>
//                       <Col md={4}>
//                         <Form.Control
//                           placeholder="Doctor"
//                           value={newHealth.doctorName}
//                           onChange={(e) =>
//                             setNewHealth({
//                               ...newHealth,
//                               doctorName: e.target.value,
//                             })
//                           }
//                         />
//                       </Col>
//                       <Col md={4}>
//                         <Form.Control
//                           placeholder="Observation"
//                           value={newHealth.observation}
//                           onChange={(e) =>
//                             setNewHealth({
//                               ...newHealth,
//                               observation: e.target.value,
//                             })
//                           }
//                         />
//                       </Col>
//                       <Col md={12} className="text-end mt-2">
//                         <Button size="sm" onClick={addHealth}>
//                           Add Record
//                         </Button>
//                       </Col>
//                     </Row>
//                   </div>
//                 </Tab>
//                 <Tab
//                   eventKey="expenses"
//                   title={
//                     <span>
//                       <FaRupeeSign /> Expenses
//                     </span>
//                   }
//                 >
//                   <Table striped bordered hover size="sm">
//                     <thead>
//                       <tr>
//                         <th>Date</th>
//                         <th>Description</th>
//                         <th className="text-end">Amount</th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {student.expenses.map((exp, idx) => (
//                         <tr key={idx}>
//                           <td>{new Date(exp.date).toLocaleDateString()}</td>
//                           <td>{exp.description}</td>
//                           <td className="text-end fw-bold">₹{exp.amount}</td>
//                         </tr>
//                       ))}
//                       {student.expenses.length === 0 && (
//                         <tr>
//                           <td colSpan="3" className="text-center text-muted">
//                             No specific expenses recorded.
//                           </td>
//                         </tr>
//                       )}
//                     </tbody>
//                   </Table>
//                   <div className="p-3 bg-light rounded mt-3">
//                     <h6 className="text-maroon">Record New Expense</h6>
//                     <Row className="g-2">
//                       <Col md={7}>
//                         <Form.Control
//                           placeholder="Description"
//                           value={newExpense.description}
//                           onChange={(e) =>
//                             setNewExpense({
//                               ...newExpense,
//                               description: e.target.value,
//                             })
//                           }
//                         />
//                       </Col>
//                       <Col md={3}>
//                         <Form.Control
//                           type="number"
//                           placeholder="Amount (₹)"
//                           value={newExpense.amount}
//                           onChange={(e) =>
//                             setNewExpense({
//                               ...newExpense,
//                               amount: e.target.value,
//                             })
//                           }
//                         />
//                       </Col>
//                       <Col md={2}>
//                         <Button
//                           variant="danger"
//                           className="w-100"
//                           onClick={addExpense}
//                         >
//                           Add
//                         </Button>
//                       </Col>
//                     </Row>
//                   </div>
//                 </Tab>
//               </Tabs>
//             </Card.Body>
//           </Card>
//         </Col>
//       </Row>

//       {/* Sponsor Modal */}
//       <Modal show={showSponsorModal} onHide={() => setShowSponsorModal(false)}>
//         <Modal.Header closeButton>
//           <Modal.Title>Map a Sponsor</Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           <p className="text-muted">
//             Select a donor from the list below to assign as a sponsor for{" "}
//             <strong>{student.firstName}</strong>.
//           </p>
//           <Form.Group className="mb-3">
//             <Form.Label>Select Donor</Form.Label>
//             <Form.Select onChange={(e) => setSelectedSponsorId(e.target.value)}>
//               <option value="">-- Choose Donor --</option>
//               {donors.map((d) => (
//                 <option key={d._id} value={d._id}>
//                   {d.donorName} - ₹{d.amount} ({d.scheme})
//                 </option>
//               ))}
//             </Form.Select>
//           </Form.Group>
//           <Button variant="primary" className="w-100" onClick={mapSponsor}>
//             Confirm Mapping
//           </Button>
//         </Modal.Body>
//       </Modal>
//     </div>
//   );
// };

// export default StudentProfile;
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Row,
  Col,
  Card,
  Tabs,
  Tab,
  Table,
  Button,
  Form,
  Badge,
  Spinner,
  Modal,
  Alert,
} from "react-bootstrap";
import {
  FaArrowLeft,
  FaUserGraduate,
  FaHeartbeat,
  FaBook,
  FaRupeeSign,
  FaPlus,
  FaHandHoldingHeart,
  FaEdit,
  FaSave,
  FaBriefcase,
  FaMapMarkerAlt,
  FaEnvelope,
  FaTrash,
  FaPhone,
  FaFileAlt,
  FaCloudUploadAlt,
  FaSuitcase,
} from "react-icons/fa";
import axios from "axios";

const StudentProfile = () => {
  const { id } = useParams();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  // Edit Mode State (For Basic Info)
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});

  // Sub-data States
  const [newEdu, setNewEdu] = useState({
    year: "",
    class: "",
    school: "",
    percentage: "",
  });
  const [newHealth, setNewHealth] = useState({
    checkupType: "",
    doctorName: "",
    observation: "",
  });
  const [newExpense, setNewExpense] = useState({ description: "", amount: "" });

  // Sponsor States
  const [showSponsorModal, setShowSponsorModal] = useState(false);
  const [donors, setDonors] = useState([]);
  const [selectedSponsorId, setSelectedSponsorId] = useState("");

  // --- ALUMNI STATES ---
  const [showAlumniModal, setShowAlumniModal] = useState(false);
  const [alumniData, setAlumniData] = useState({
    jobTitle: "",
    company: "",
    currentLocation: "",
    email: "",
    phone: "",
  });

  // --- DOCUMENT STATES ---
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [newLeave, setNewLeave] = useState({
    startDate: "",
    endDate: "",
    reason: "",
  });

  useEffect(() => {
    fetchStudent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchStudent = async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const { data } = await axios.get(
        `http://localhost:5000/api/students/${id}`,
        config
      );
      setStudent(data);
      setEditData(data);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  // --- DOCUMENT HANDLERS ---
  const handleFileChange = (e) => {
    setFiles(e.target.files);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (files.length === 0) return alert("Select files first");

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append("files", files[i]);
    }

    setUploading(true);
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const config = {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${userInfo.token}`,
        },
      };
      await axios.post(
        `http://localhost:5000/api/students/${id}/upload`,
        formData,
        config
      );
      alert("Documents Uploaded!");
      setFiles([]);
      fetchStudent();
    } catch (err) {
      alert("Upload failed");
    }
    setUploading(false);
  };

  // --- LEAVE HANDLERS ---
  const addLeave = async () => {
    if (!newLeave.startDate || !newLeave.reason)
      return alert("Please fill Start Date and Reason");

    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      await axios.post(
        `http://localhost:5000/api/students/${id}/leave`,
        newLeave,
        config
      );

      alert("Leave Recorded");
      setNewLeave({ startDate: "", endDate: "", reason: "" });
      fetchStudent();
    } catch (err) {
      alert("Error recording leave");
    }
  };

  const markReturned = async (leaveId) => {
    if (!window.confirm("Confirm student has returned to Ashram?")) return;
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      await axios.put(
        `http://localhost:5000/api/students/${id}/leave/${leaveId}`,
        {},
        config
      );

      alert("Student Marked as Returned");
      fetchStudent();
    } catch (err) {
      alert("Error updating status");
    }
  };

  const handleDeleteDoc = async (filePath) => {
    if (!window.confirm("Delete this document?")) return;
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const config = {
        headers: { Authorization: `Bearer ${userInfo.token}` },
        data: { filePath },
      };
      await axios.delete(
        `http://localhost:5000/api/students/${id}/documents`,
        config
      );
      fetchStudent();
    } catch (err) {
      alert("Delete failed");
    }
  };

  const saveProfileChanges = async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

      await axios.put(
        `http://localhost:5000/api/students/${id}`,
        {
          firstName: editData.firstName,
          lastName: editData.lastName,
          guardianName: editData.guardianName,
          contactNumber: editData.contactNumber,
          address: editData.address,
          dob: editData.dob,
        },
        config
      );

      setIsEditing(false);
      fetchStudent();
      alert("Profile Updated Successfully!");
    } catch (error) {
      alert("Error updating profile");
    }
  };

  const handleUpdate = async (updateData) => {
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      await axios.put(
        `http://localhost:5000/api/students/${id}`,
        updateData,
        config
      );
      fetchStudent();
    } catch (error) {
      alert("Error updating student");
    }
  };

  // --- ALUMNI HANDLERS ---

  // 1. Convert / Save Alumni
  const handleConvertToAlumni = async () => {
    if (!alumniData.currentLocation || !alumniData.phone)
      return alert("Please fill current location and contact");

    await handleUpdate({
      admissionStatus: "Alumni",
      alumniDetails: alumniData,
    });

    setShowAlumniModal(false);
    alert("Student successfully converted to Alumni!");
  };

  // 2. Edit Alumni (Open Modal with Data)
  const handleEditAlumni = () => {
    setAlumniData(student.alumniDetails);
    setShowAlumniModal(true);
  };

  // 3. Delete Alumni (Revert to Active)
  const handleDeleteAlumni = async () => {
    if (
      !window.confirm(
        "Are you sure? This will revert the student status back to 'Active'."
      )
    )
      return;

    await handleUpdate({
      admissionStatus: "Active",
      alumniDetails: {
        jobTitle: "",
        company: "",
        currentLocation: "",
        email: "",
        phone: "",
      }, // Clear data
    });
    alert("Reverted to Active Student.");
  };

  // --- Helper Functions ---
  const addEducation = () => {
    if (!newEdu.year || !newEdu.school) return alert("Please fill details");
    const updatedHistory = [...student.educationHistory, newEdu];
    handleUpdate({ educationHistory: updatedHistory });
    setNewEdu({ year: "", class: "", school: "", percentage: "" });
  };

  const addHealth = () => {
    if (!newHealth.checkupType) return alert("Please fill details");
    const updatedHealth = [...student.healthRecords, newHealth];
    handleUpdate({ healthRecords: updatedHealth });
    setNewHealth({ checkupType: "", doctorName: "", observation: "" });
  };

  const addExpense = () => {
    if (!newExpense.description || !newExpense.amount)
      return alert("Please enter description and amount");
    handleUpdate({
      newExpense: {
        description: newExpense.description,
        amount: Number(newExpense.amount),
        date: new Date(),
      },
    });
    setNewExpense({ description: "", amount: "" });
  };

  const openSponsorModal = async () => {
    setShowSponsorModal(true);
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const { data } = await axios.get(
        "http://localhost:5000/api/donations",
        config
      );
      setDonors(data);
    } catch (err) {
      alert("Failed to load donor list");
    }
  };

  const mapSponsor = async () => {
    if (!selectedSponsorId) return alert("Select a sponsor");
    await handleUpdate({ sponsor: selectedSponsorId });
    setShowSponsorModal(false);
    alert("Sponsor Mapped Successfully!");
  };

  if (loading)
    return (
      <div className="text-center py-5">
        <Spinner animation="border" />
      </div>
    );
  const currentLeave = student.leaves?.find((l) => l.status === "On Leave");

  return (
    <div>
      {/* Header */}
      <div className="d-flex align-items-center gap-3 mb-4">
        <Link
          to="/dashboard/students"
          className="btn btn-outline-secondary btn-sm"
        >
          <FaArrowLeft />
        </Link>
        <div>
          <h2
            className="text-maroon m-0"
            style={{ fontFamily: "Playfair Display" }}
          >
            {student.firstName} {student.lastName}
          </h2>
          <span className="text-muted">
            ID: {student._id.slice(-6).toUpperCase()}
          </span>
        </div>
        <div className="ms-auto d-flex gap-2">
          {currentLeave && (
            <Badge bg="warning" text="dark" className="align-self-center me-2">
              ON LEAVE
            </Badge>
          )}
          {/* ALUMNI BUTTON: Only show if Active */}
          {student.admissionStatus === "Active" && (
            <Button
              variant="outline-primary"
              onClick={() => {
                setAlumniData({
                  jobTitle: "",
                  company: "",
                  currentLocation: "",
                  email: "",
                  phone: "",
                }); // Clear form
                setShowAlumniModal(true);
              }}
            >
              <FaUserGraduate /> Mark as Alumni
            </Button>
          )}

          {isEditing ? (
            <Button variant="success" onClick={saveProfileChanges}>
              <FaSave /> Save Changes
            </Button>
          ) : (
            <Button
              variant="primary"
              style={{ backgroundColor: "#581818" }}
              onClick={() => setIsEditing(true)}
            >
              <FaEdit /> Edit Details
            </Button>
          )}
        </div>
      </div>

      <Row>
        {/* Left Sidebar */}
        <Col md={4}>
          <Card className="shadow-sm border-0 mb-4">
            <Card.Body>
              <div className="text-center mb-3">
                <div
                  className="bg-light rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                  style={{ width: "100px", height: "100px" }}
                >
                  <FaUserGraduate size={50} className="text-secondary" />
                </div>
                <div className="mb-2">
                  <Badge
                    bg={
                      student.admissionStatus === "Alumni"
                        ? "info"
                        : student.admissionStatus === "Active"
                        ? "success"
                        : "warning"
                    }
                  >
                    {student.admissionStatus}
                  </Badge>
                </div>
              </div>

              {isEditing ? (
                <Form>
                  <Row className="mb-2">
                    <Col>
                      <Form.Control
                        size="sm"
                        value={editData.firstName}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            firstName: e.target.value,
                          })
                        }
                        placeholder="First Name"
                      />
                    </Col>
                    <Col>
                      <Form.Control
                        size="sm"
                        value={editData.lastName}
                        onChange={(e) =>
                          setEditData({ ...editData, lastName: e.target.value })
                        }
                        placeholder="Last Name"
                      />
                    </Col>
                  </Row>
                  <Form.Control
                    size="sm"
                    type="date"
                    className="mb-2"
                    value={editData.dob ? editData.dob.split("T")[0] : ""}
                    onChange={(e) =>
                      setEditData({ ...editData, dob: e.target.value })
                    }
                  />
                  <Form.Control
                    size="sm"
                    className="mb-2"
                    value={editData.guardianName}
                    onChange={(e) =>
                      setEditData({ ...editData, guardianName: e.target.value })
                    }
                    placeholder="Guardian"
                  />
                  <Form.Control
                    size="sm"
                    className="mb-2"
                    value={editData.contactNumber}
                    onChange={(e) =>
                      setEditData({
                        ...editData,
                        contactNumber: e.target.value,
                      })
                    }
                    placeholder="Contact"
                  />
                  <Form.Control
                    size="sm"
                    as="textarea"
                    value={editData.address}
                    onChange={(e) =>
                      setEditData({ ...editData, address: e.target.value })
                    }
                    placeholder="Address"
                  />
                </Form>
              ) : (
                <div className="text-center">
                  <h5>
                    {student.firstName} {student.lastName}
                  </h5>
                  <p className="text-muted small">
                    {student.gender} |{" "}
                    {new Date(student.dob).toLocaleDateString()}
                  </p>
                  <hr />
                  <div className="text-start">
                    <p>
                      <strong>Guardian:</strong> {student.guardianName}
                    </p>
                    <p>
                      <strong>Contact:</strong> {student.contactNumber}
                    </p>
                    <p>
                      <strong>Address:</strong> {student.address}
                    </p>
                  </div>
                </div>
              )}
            </Card.Body>
          </Card>

          {/* --- ALUMNI DETAILS CARD (Visible only if Alumni) --- */}
          {student.admissionStatus === "Alumni" && student.alumniDetails && (
            <Card
              className="shadow-sm border-0 mb-4"
              style={{ borderLeft: "5px solid #0dcaf0" }}
            >
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h6 className="text-info fw-bold m-0">Alumni Information</h6>
                  <div>
                    <Button
                      size="sm"
                      variant="link"
                      className="p-0 me-2"
                      onClick={handleEditAlumni}
                    >
                      <FaEdit />
                    </Button>
                    <Button
                      size="sm"
                      variant="link"
                      className="p-0 text-danger"
                      onClick={handleDeleteAlumni}
                    >
                      <FaTrash />
                    </Button>
                  </div>
                </div>

                <p className="mb-1">
                  <FaBriefcase className="me-2 text-muted" />{" "}
                  {student.alumniDetails.jobTitle || "Not working"}
                </p>
                <p className="mb-1">
                  <strong>@</strong> {student.alumniDetails.company || "N/A"}
                </p>
                <p className="mb-1">
                  <FaMapMarkerAlt className="me-2 text-muted" />{" "}
                  {student.alumniDetails.currentLocation}
                </p>
                <hr />
                <p className="mb-1">
                  <FaEnvelope className="me-2 text-muted" />{" "}
                  {student.alumniDetails.email || "No Email"}
                </p>
                <p className="mb-0">
                  <FaPhone className="me-2 text-muted" />{" "}
                  {student.alumniDetails.phone}
                </p>
              </Card.Body>
            </Card>
          )}

          {/* Sponsor Card */}
          {/* Sponsor Card */}
          <Card className="shadow-sm border-0 bg-light">
            <Card.Body>
              <h6 className="text-maroon fw-bold">
                <FaHandHoldingHeart /> Sponsor Details
              </h6>

              {student.sponsor ? (
                <div className="mt-3">
                  <p className="text-success fw-bold mb-1">Sponsored</p>

                  {/* --- FIX: Handle Object vs String --- */}
                  <div className="text-muted small mb-3">
                    {typeof student.sponsor === "object" ? (
                      <>
                        <strong>Name:</strong> {student.sponsor.donorName}
                        <br />
                        <strong>ID:</strong>{" "}
                        {student.sponsor._id.toString().slice(-6).toUpperCase()}
                      </>
                    ) : (
                      <>
                        <strong>ID:</strong>{" "}
                        {student.sponsor.toString().slice(-6).toUpperCase()}
                      </>
                    )}
                  </div>
                  {/* ----------------------------------- */}

                  {/* Email Report Button */}
                  <Button
                    size="sm"
                    variant="primary"
                    className="w-100 mb-2"
                    onClick={async () => {
                      if (
                        !confirm(
                          "Send Progress Report PDF to Sponsor via Email?"
                        )
                      )
                        return;
                      try {
                        const userInfo = JSON.parse(
                          localStorage.getItem("userInfo")
                        );
                        const config = {
                          headers: {
                            Authorization: `Bearer ${userInfo.token}`,
                          },
                        };
                        await axios.post(
                          `http://localhost:5000/api/students/${id}/email-sponsor`,
                          {},
                          config
                        );
                        alert("Report Sent Successfully!");
                      } catch (err) {
                        alert(
                          err.response?.data?.message || "Error sending report"
                        );
                      }
                    }}
                  >
                    <FaEnvelope className="me-2" /> Email Progress Report
                  </Button>

                  <div className="mt-2">
                    <Button
                      size="sm"
                      variant="outline-danger"
                      onClick={() => handleUpdate({ sponsor: null })}
                    >
                      Remove Mapping
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center mt-3">
                  <small className="text-muted d-block mb-2">
                    No sponsor mapped yet.
                  </small>
                  <Button
                    size="sm"
                    variant="outline-primary"
                    onClick={openSponsorModal}
                  >
                    Map Sponsor
                  </Button>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Right Content: Tabs */}
        <Col md={8}>
          <Card className="shadow-sm border-0">
            <Card.Body>
              <Tabs defaultActiveKey="education" className="mb-3">
                <Tab
                  eventKey="education"
                  title={
                    <span>
                      <FaBook /> Education
                    </span>
                  }
                >
                  <Table striped bordered hover size="sm">
                    <thead>
                      <tr>
                        <th>Year</th>
                        <th>Class</th>
                        <th>School</th>
                        <th>%</th>
                      </tr>
                    </thead>
                    <tbody>
                      {student.educationHistory.map((edu, idx) => (
                        <tr key={idx}>
                          <td>{edu.year}</td>
                          <td>{edu.class}</td>
                          <td>{edu.school}</td>
                          <td>{edu.percentage}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                  <div className="p-3 bg-light rounded">
                    <h6>Add Academic Record</h6>
                    <Row className="g-2">
                      <Col md={3}>
                        <Form.Control
                          placeholder="Year"
                          value={newEdu.year}
                          onChange={(e) =>
                            setNewEdu({ ...newEdu, year: e.target.value })
                          }
                        />
                      </Col>
                      <Col md={3}>
                        <Form.Control
                          placeholder="Class"
                          value={newEdu.class}
                          onChange={(e) =>
                            setNewEdu({ ...newEdu, class: e.target.value })
                          }
                        />
                      </Col>
                      <Col md={4}>
                        <Form.Control
                          placeholder="School"
                          value={newEdu.school}
                          onChange={(e) =>
                            setNewEdu({ ...newEdu, school: e.target.value })
                          }
                        />
                      </Col>
                      <Col md={2}>
                        <Button size="sm" onClick={addEducation}>
                          <FaPlus />
                        </Button>
                      </Col>
                    </Row>
                  </div>
                </Tab>
                <Tab
                  eventKey="health"
                  title={
                    <span>
                      <FaHeartbeat /> Health
                    </span>
                  }
                >
                  <Table striped bordered hover size="sm">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Type</th>
                        <th>Doctor</th>
                        <th>Observation</th>
                      </tr>
                    </thead>
                    <tbody>
                      {student.healthRecords.map((h, idx) => (
                        <tr key={idx}>
                          <td>{new Date(h.date).toLocaleDateString()}</td>
                          <td>{h.checkupType}</td>
                          <td>{h.doctorName}</td>
                          <td>{h.observation}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                  <div className="p-3 bg-light rounded">
                    <h6>Add Health Checkup</h6>
                    <Row className="g-2">
                      <Col md={4}>
                        <Form.Control
                          placeholder="Type"
                          value={newHealth.checkupType}
                          onChange={(e) =>
                            setNewHealth({
                              ...newHealth,
                              checkupType: e.target.value,
                            })
                          }
                        />
                      </Col>
                      <Col md={4}>
                        <Form.Control
                          placeholder="Doctor"
                          value={newHealth.doctorName}
                          onChange={(e) =>
                            setNewHealth({
                              ...newHealth,
                              doctorName: e.target.value,
                            })
                          }
                        />
                      </Col>
                      <Col md={4}>
                        <Form.Control
                          placeholder="Observation"
                          value={newHealth.observation}
                          onChange={(e) =>
                            setNewHealth({
                              ...newHealth,
                              observation: e.target.value,
                            })
                          }
                        />
                      </Col>
                      <Col md={12} className="text-end mt-2">
                        <Button size="sm" onClick={addHealth}>
                          Add Record
                        </Button>
                      </Col>
                    </Row>
                  </div>
                </Tab>
                <Tab
                  eventKey="expenses"
                  title={
                    <span>
                      <FaRupeeSign /> Expenses
                    </span>
                  }
                >
                  <Table striped bordered hover size="sm">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Description</th>
                        <th className="text-end">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {student.expenses.map((exp, idx) => (
                        <tr key={idx}>
                          <td>{new Date(exp.date).toLocaleDateString()}</td>
                          <td>{exp.description}</td>
                          <td className="text-end fw-bold">₹{exp.amount}</td>
                        </tr>
                      ))}
                      {student.expenses.length === 0 && (
                        <tr>
                          <td colSpan="3" className="text-center text-muted">
                            No specific expenses recorded.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                  <div className="p-3 bg-light rounded mt-3">
                    <h6 className="text-maroon">Record New Expense</h6>
                    <Row className="g-2">
                      <Col md={7}>
                        <Form.Control
                          placeholder="Description"
                          value={newExpense.description}
                          onChange={(e) =>
                            setNewExpense({
                              ...newExpense,
                              description: e.target.value,
                            })
                          }
                        />
                      </Col>
                      <Col md={3}>
                        <Form.Control
                          type="number"
                          placeholder="Amount (₹)"
                          value={newExpense.amount}
                          onChange={(e) =>
                            setNewExpense({
                              ...newExpense,
                              amount: e.target.value,
                            })
                          }
                        />
                      </Col>
                      <Col md={2}>
                        <Button
                          variant="danger"
                          className="w-100"
                          onClick={addExpense}
                        >
                          Add
                        </Button>
                      </Col>
                    </Row>
                  </div>
                </Tab>
                {/* --- NEW DOCUMENTS TAB --- */}
                <Tab
                  eventKey="documents"
                  title={
                    <span>
                      <FaFileAlt /> Documents
                    </span>
                  }
                >
                  {/* Upload Section */}
                  <div className="p-3 bg-light rounded mb-4">
                    <h6 className="text-maroon">Upload Documents</h6>
                    <Form onSubmit={handleUpload} className="d-flex gap-2">
                      <Form.Control
                        type="file"
                        multiple
                        onChange={handleFileChange}
                      />
                      <Button
                        type="submit"
                        variant="primary"
                        disabled={uploading}
                      >
                        {uploading ? "Uploading..." : <FaCloudUploadAlt />}
                      </Button>
                    </Form>
                    <small className="text-muted">
                      Supported: Images, PDF, Word Docs
                    </small>
                  </div>

                  {/* Gallery Grid */}
                  <h6 className="mb-3">
                    Attached Files ({student.documents?.length || 0})
                  </h6>
                  <Row>
                    {student.documents &&
                      student.documents.map((path, index) => (
                        <Col md={4} key={index} className="mb-3">
                          <div className="border rounded p-2 position-relative bg-white text-center">
                            <Button
                              variant="danger"
                              size="sm"
                              className="position-absolute top-0 end-0 m-1"
                              style={{ zIndex: 10 }}
                              onClick={() => handleDeleteDoc(path)}
                            >
                              <FaTrash size={10} />
                            </Button>

                            {path.match(/\.(jpeg|jpg|png|gif)$/i) ? (
                              <img
                                src={`http://localhost:5000${path}`}
                                alt="Doc"
                                style={{
                                  width: "100%",
                                  height: "100px",
                                  objectFit: "cover",
                                  cursor: "pointer",
                                }}
                                onClick={() =>
                                  window.open(
                                    `http://localhost:5000${path}`,
                                    "_blank"
                                  )
                                }
                              />
                            ) : (
                              <div className="py-4">
                                <FaFileAlt
                                  size={30}
                                  className="text-secondary mb-2"
                                />
                                <br />
                                <a
                                  href={`http://localhost:5000${path}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="small text-decoration-none"
                                >
                                  View Document
                                </a>
                              </div>
                            )}
                          </div>
                        </Col>
                      ))}
                    {(!student.documents || student.documents.length === 0) && (
                      <p className="text-muted text-center py-3">
                        No documents attached.
                      </p>
                    )}
                  </Row>
                </Tab>
                {/* --- NEW LEAVES TAB --- */}
                <Tab
                  eventKey="leaves"
                  title={
                    <span>
                      <FaSuitcase /> Leaves
                    </span>
                  }
                >
                  {/* Leave Form */}
                  <div className="p-3 bg-light rounded mb-4">
                    <h6 className="text-maroon">Record New Leave</h6>
                    {currentLeave ? (
                      <Alert variant="warning">
                        Student is currently on leave (Since{" "}
                        {new Date(currentLeave.startDate).toLocaleDateString()}
                        ).
                        <br />
                        <strong>Reason:</strong> {currentLeave.reason}
                        <div className="mt-2">
                          <Button
                            variant="success"
                            size="sm"
                            onClick={() => markReturned(currentLeave._id)}
                          >
                            Mark as Returned
                          </Button>
                        </div>
                      </Alert>
                    ) : (
                      <Row className="g-2">
                        <Col md={4}>
                          <Form.Label className="small">Start Date</Form.Label>
                          <Form.Control
                            type="date"
                            value={newLeave.startDate}
                            onChange={(e) =>
                              setNewLeave({
                                ...newLeave,
                                startDate: e.target.value,
                              })
                            }
                          />
                        </Col>
                        <Col md={4}>
                          <Form.Label className="small">
                            Expected Return
                          </Form.Label>
                          <Form.Control
                            type="date"
                            value={newLeave.endDate}
                            onChange={(e) =>
                              setNewLeave({
                                ...newLeave,
                                endDate: e.target.value,
                              })
                            }
                          />
                        </Col>
                        <Col md={4}>
                          <Form.Label className="small">Reason</Form.Label>
                          <Form.Control
                            placeholder="e.g. Going Home"
                            value={newLeave.reason}
                            onChange={(e) =>
                              setNewLeave({
                                ...newLeave,
                                reason: e.target.value,
                              })
                            }
                          />
                        </Col>
                        <Col md={12} className="text-end mt-2">
                          <Button size="sm" variant="danger" onClick={addLeave}>
                            Record Leave
                          </Button>
                        </Col>
                      </Row>
                    )}
                  </div>

                  {/* Leave History Table */}
                  <h6 className="mb-3">Leave History</h6>
                  <Table striped bordered hover size="sm">
                    <thead>
                      <tr>
                        <th>Start Date</th>
                        <th>Return Date</th>
                        <th>Reason</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {student.leaves &&
                        student.leaves.map((l, idx) => (
                          <tr key={idx}>
                            <td>
                              {new Date(l.startDate).toLocaleDateString()}
                            </td>
                            <td>
                              {l.actualReturnDate
                                ? new Date(
                                    l.actualReturnDate
                                  ).toLocaleDateString()
                                : l.endDate
                                ? new Date(l.endDate).toLocaleDateString() +
                                  " (Exp)"
                                : "-"}
                            </td>
                            <td>{l.reason}</td>
                            <td>
                              {l.status === "On Leave" ? (
                                <Badge bg="warning" text="dark">
                                  On Leave
                                </Badge>
                              ) : (
                                <Badge bg="success">Returned</Badge>
                              )}
                            </td>
                          </tr>
                        ))}
                      {(!student.leaves || student.leaves.length === 0) && (
                        <tr>
                          <td colSpan="4" className="text-center text-muted">
                            No leave history.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                </Tab>
              </Tabs>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* --- ALUMNI CONVERSION MODAL --- */}
      <Modal show={showAlumniModal} onHide={() => setShowAlumniModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Alumni Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="text-muted">
            Update current contact and work details for the alumni.
          </p>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Current Location / City</Form.Label>
              <Form.Control
                value={alumniData.currentLocation}
                onChange={(e) =>
                  setAlumniData({
                    ...alumniData,
                    currentLocation: e.target.value,
                  })
                }
                placeholder="e.g. Bangalore"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Current Phone Number</Form.Label>
              <Form.Control
                value={alumniData.phone}
                onChange={(e) =>
                  setAlumniData({ ...alumniData, phone: e.target.value })
                }
                placeholder="Personal Mobile"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Email Address</Form.Label>
              <Form.Control
                value={alumniData.email}
                onChange={(e) =>
                  setAlumniData({ ...alumniData, email: e.target.value })
                }
              />
            </Form.Group>
            <Row>
              <Col>
                <Form.Group className="mb-3">
                  <Form.Label>Job Title</Form.Label>
                  <Form.Control
                    value={alumniData.jobTitle}
                    onChange={(e) =>
                      setAlumniData({ ...alumniData, jobTitle: e.target.value })
                    }
                    placeholder="e.g. Software Engineer"
                  />
                </Form.Group>
              </Col>
              <Col>
                <Form.Group className="mb-3">
                  <Form.Label>Company</Form.Label>
                  <Form.Control
                    value={alumniData.company}
                    onChange={(e) =>
                      setAlumniData({ ...alumniData, company: e.target.value })
                    }
                    placeholder="e.g. Infosys"
                  />
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAlumniModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleConvertToAlumni}>
            Save Details
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Sponsor Modal */}
      <Modal show={showSponsorModal} onHide={() => setShowSponsorModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Map a Sponsor</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="text-muted">
            Select a donor from the list below to assign as a sponsor for{" "}
            <strong>{student.firstName}</strong>.
          </p>
          <Form.Group className="mb-3">
            <Form.Label>Select Donor</Form.Label>
            <Form.Select onChange={(e) => setSelectedSponsorId(e.target.value)}>
              <option value="">-- Choose Donor --</option>
              {donors.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.donorName} - ₹{d.amount} ({d.scheme})
                </option>
              ))}
            </Form.Select>
          </Form.Group>
          <Button variant="primary" className="w-100" onClick={mapSponsor}>
            Confirm Mapping
          </Button>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default StudentProfile;
