/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/immutability */
// /* eslint-disable react-hooks/immutability */
// /* eslint-disable no-unused-vars */
// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import BASE_URL from "../../apiConfig";
// import {
//   Table,
//   Button,
//   Form,
//   Card,
//   Row,
//   Col,
//   Alert,
//   Badge,
// } from "react-bootstrap";
// import { FaTrash, FaPlus } from "react-icons/fa";

// const SchemeManager = () => {
//   const [schemes, setSchemes] = useState([]);
//   const [accountHeads, setAccountHeads] = useState([]); // Store Credit Codes

//   // Form State
//   const [newSchemeName, setNewSchemeName] = useState("");
//   const [selectedAccount, setSelectedAccount] = useState("");

//   const [userInfo, setUserInfo] = useState(null);

//   useEffect(() => {
//     const user = JSON.parse(localStorage.getItem("userInfo"));
//     setUserInfo(user);
//     if (user) {
//       fetchSchemes(user);
//       fetchAccountHeads(user);
//     }
//   }, []);

//   const fetchSchemes = async (user) => {
//     try {
//       const config = { headers: { Authorization: `Bearer ${user.token}` } };
//       const { data } = await axios.get(`${BASE_URL}/api/schemes`, config);
//       setSchemes(data);
//     } catch (error) {
//       console.error(error);
//     }
//   };

//   // Fetch Account Codes (Credit Side Only)
//   const fetchAccountHeads = async (user) => {
//     try {
//       const config = { headers: { Authorization: `Bearer ${user.token}` } };
//       const { data } = await axios.get(`${BASE_URL}/api/accounts`, config);
//       // Filter only CREDIT (Income) codes
//       const creditAccounts = data.filter((acc) => acc.type === "Credit");
//       setAccountHeads(creditAccounts);
//     } catch (error) {
//       console.error(error);
//     }
//   };

//   const handleAdd = async (e) => {
//     e.preventDefault();
//     if (!newSchemeName || !selectedAccount)
//       return alert("Please enter name and select account code");

//     try {
//       const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
//       await axios.post(
//         `${BASE_URL}/api/schemes`,
//         {
//           name: newSchemeName,
//           accountHead: selectedAccount,
//         },
//         config
//       );

//       setNewSchemeName("");
//       setSelectedAccount("");
//       fetchSchemes(userInfo);
//     } catch (error) {
//       alert("Error adding scheme");
//     }
//   };

//   const handleDelete = async (id) => {
//     if (!window.confirm("Delete this scheme?")) return;
//     try {
//       const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
//       await axios.delete(`${BASE_URL}/api/schemes/${id}`, config);
//       fetchSchemes(userInfo);
//     } catch (error) {
//       alert("Error deleting scheme");
//     }
//   };

//   return (
//     <div>
//       <h2
//         className="text-maroon mb-4"
//         style={{ fontFamily: "Playfair Display" }}
//       >
//         Manage Donation Schemes
//       </h2>

//       <Row>
//         <Col md={5}>
//           <Card className="shadow-sm border-0 p-3 mb-4">
//             <h5 className="mb-3">Add New Scheme</h5>
//             <Form onSubmit={handleAdd}>
//               <Form.Group className="mb-2">
//                 <Form.Label>Scheme Name</Form.Label>
//                 <Form.Control
//                   placeholder="e.g. Nitya Annadhana"
//                   value={newSchemeName}
//                   onChange={(e) => setNewSchemeName(e.target.value)}
//                 />
//               </Form.Group>

//               <Form.Group className="mb-3">
//                 <Form.Label>Link to Account Code (Credit)</Form.Label>
//                 <Form.Select
//                   value={selectedAccount}
//                   onChange={(e) => setSelectedAccount(e.target.value)}
//                 >
//                   <option value="">-- Select Account --</option>
//                   {accountHeads.map((acc) => (
//                     <option key={acc._id} value={acc._id}>
//                       {acc.code} - {acc.name}
//                     </option>
//                   ))}
//                 </Form.Select>
//               </Form.Group>

//               <Button type="submit" variant="success" className="w-100">
//                 <FaPlus /> Add Scheme
//               </Button>
//             </Form>
//           </Card>
//         </Col>

//         <Col md={7}>
//           <Card className="shadow-sm border-0">
//             <Table hover className="mb-0 align-middle">
//               <thead className="bg-light">
//                 <tr>
//                   <th>Scheme Name</th>
//                   <th>Account Code</th>
//                   <th className="text-end">Action</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {schemes.map((s) => (
//                   <tr key={s._id}>
//                     <td className="fw-bold">{s.name}</td>
//                     <td>
//                       {s.accountHead ? (
//                         <Badge bg="info" text="dark">
//                           {s.accountHead.code} - {s.accountHead.name}
//                         </Badge>
//                       ) : (
//                         <Badge bg="danger">Unmapped</Badge>
//                       )}
//                     </td>
//                     <td className="text-end">
//                       <Button
//                         size="sm"
//                         variant="outline-danger"
//                         onClick={() => handleDelete(s._id)}
//                       >
//                         <FaTrash />
//                       </Button>
//                     </td>
//                   </tr>
//                 ))}
//                 {schemes.length === 0 && (
//                   <tr>
//                     <td colSpan="3" className="text-center">
//                       No schemes found.
//                     </td>
//                   </tr>
//                 )}
//               </tbody>
//             </Table>
//           </Card>
//         </Col>
//       </Row>
//     </div>
//   );
// };

// export default SchemeManager;
import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Form,
  Card,
  Row,
  Col,
  Alert,
  Badge,
  Tabs,
  Tab,
  Modal,
} from "react-bootstrap";
import {
  FaTrash,
  FaPlus,
  FaUserShield,
  FaKey,
  FaLayerGroup,
} from "react-icons/fa";
import axios from "axios";
import BASE_URL from "../../apiConfig";

const Settings = () => {
  const [key, setKey] = useState("users"); // Default Tab
  const [userInfo, setUserInfo] = useState(null);

  // --- SCHEME STATE ---
  const [schemes, setSchemes] = useState([]);
  const [newSchemeName, setNewSchemeName] = useState("");
  const [accountHeads, setAccountHeads] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState("");

  // --- USER STATE ---
  const [users, setUsers] = useState([]);
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userForm, setUserForm] = useState({
    name: "",
    email: "",
    phone: "",
    role: "employee",
    branch: "Headquarters",
    password: "",
  });

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("userInfo"));
    setUserInfo(user);
    if (user) {
      fetchSchemes(user);
      fetchAccountHeads(user);
      fetchUsers(user);
    }
  }, []);

  // ==========================
  // 1. SCHEME LOGIC
  // ==========================
  const fetchSchemes = async (user) => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get(`${BASE_URL}/api/schemes`, config);
      setSchemes(data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchAccountHeads = async (user) => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get(`${BASE_URL}/api/accounts`, config);
      setAccountHeads(data.filter((acc) => acc.type === "Credit"));
    } catch (error) {
      console.error(error);
    }
  };

  const handleAddScheme = async (e) => {
    e.preventDefault();
    if (!newSchemeName || !selectedAccount) return alert("Enter details");
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      await axios.post(
        `${BASE_URL}/api/schemes`,
        { name: newSchemeName, accountHead: selectedAccount },
        config
      );
      setNewSchemeName("");
      setSelectedAccount("");
      fetchSchemes(userInfo);
    } catch (error) {
      alert("Error adding scheme");
    }
  };

  const handleDeleteScheme = async (id) => {
    if (!window.confirm("Delete scheme?")) return;
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      await axios.delete(`${BASE_URL}/api/schemes/${id}`, config);
      fetchSchemes(userInfo);
    } catch (error) {
      alert("Error deleting");
    }
  };

  // ==========================
  // 2. USER MANAGEMENT LOGIC
  // ==========================
  const fetchUsers = async (user) => {
    if (user.role !== "admin") return; // Only admin can fetch
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get(`${BASE_URL}/api/users`, config);
      setUsers(data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleUserSubmit = async (e) => {
    e.preventDefault();
    const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

    try {
      if (selectedUser) {
        // UPDATE / RESET PASSWORD
        await axios.put(
          `${BASE_URL}/api/users/${selectedUser._id}`,
          userForm,
          config
        );
        alert("User Updated Successfully");
      } else {
        // CREATE NEW USER
        await axios.post(`${BASE_URL}/api/users`, userForm, config);
        alert("New User Created");
      }
      setShowUserModal(false);
      fetchUsers(userInfo);
    } catch (error) {
      alert(error.response?.data?.message || "Error saving user");
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm("Delete this user?")) return;
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      await axios.delete(`${BASE_URL}/api/users/${id}`, config);
      fetchUsers(userInfo);
    } catch (error) {
      alert("Error deleting user");
    }
  };

  const openUserModal = (user = null) => {
    if (user) {
      setSelectedUser(user);
      setUserForm({ ...user, password: "" }); // Clear password for security
    } else {
      setSelectedUser(null);
      setUserForm({
        name: "",
        email: "",
        phone: "",
        role: "employee",
        branch: "Headquarters",
        password: "",
      });
    }
    setShowUserModal(true);
  };

  return (
    <div>
      <h2
        className="text-maroon mb-4"
        style={{ fontFamily: "Playfair Display" }}
      >
        System Settings
      </h2>

      <Tabs activeKey={key} onSelect={(k) => setKey(k)} className="mb-4">
        {/* TAB 1: USERS */}
        <Tab
          eventKey="users"
          title={
            <span>
              <FaUserShield /> User Management
            </span>
          }
        >
          {userInfo?.role === "admin" ? (
            <>
              <div className="text-end mb-3">
                <Button
                  variant="primary"
                  style={{ backgroundColor: "#581818" }}
                  onClick={() => openUserModal(null)}
                >
                  <FaPlus /> Add New Staff
                </Button>
              </div>
              <Card className="shadow-sm border-0">
                <Table hover responsive className="align-middle mb-0">
                  <thead className="bg-light">
                    <tr>
                      <th>Name</th>
                      <th>Email / Login</th>
                      <th>Role</th>
                      <th>Branch</th>
                      <th className="text-end">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u._id}>
                        <td className="fw-bold">{u.name}</td>
                        <td>{u.email}</td>
                        <td>
                          <Badge bg={u.role === "admin" ? "danger" : "info"}>
                            {u.role}
                          </Badge>
                        </td>
                        <td>{u.branch}</td>
                        <td className="text-end">
                          <Button
                            size="sm"
                            variant="outline-dark"
                            className="me-2"
                            onClick={() => openUserModal(u)}
                            title="Edit / Reset Password"
                          >
                            <FaKey />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline-danger"
                            onClick={() => handleDeleteUser(u._id)}
                            title="Delete User"
                          >
                            <FaTrash />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card>
            </>
          ) : (
            <Alert variant="warning">Only Admins can manage users.</Alert>
          )}
        </Tab>

        {/* TAB 2: SCHEMES (Your Old Code) */}
        <Tab
          eventKey="schemes"
          title={
            <span>
              <FaLayerGroup /> Donation Schemes
            </span>
          }
        >
          <Row>
            <Col md={5}>
              <Card className="shadow-sm border-0 p-3 mb-4">
                <h5 className="mb-3">Add New Scheme</h5>
                <Form onSubmit={handleAddScheme}>
                  <Form.Group className="mb-2">
                    <Form.Label>Scheme Name</Form.Label>
                    <Form.Control
                      value={newSchemeName}
                      onChange={(e) => setNewSchemeName(e.target.value)}
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Link to Account Code</Form.Label>
                    <Form.Select
                      value={selectedAccount}
                      onChange={(e) => setSelectedAccount(e.target.value)}
                    >
                      <option value="">-- Select --</option>
                      {accountHeads.map((acc) => (
                        <option key={acc._id} value={acc._id}>
                          {acc.code} - {acc.name}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                  <Button type="submit" variant="success" className="w-100">
                    <FaPlus /> Add Scheme
                  </Button>
                </Form>
              </Card>
            </Col>
            <Col md={7}>
              <Card className="shadow-sm border-0">
                <Table hover className="mb-0 align-middle">
                  <thead className="bg-light">
                    <tr>
                      <th>Scheme Name</th>
                      <th>Code</th>
                      <th className="text-end">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {schemes.map((s) => (
                      <tr key={s._id}>
                        <td className="fw-bold">{s.name}</td>
                        <td>
                          {s.accountHead ? (
                            `${s.accountHead.code} - ${s.accountHead.name}`
                          ) : (
                            <Badge bg="danger">Unmapped</Badge>
                          )}
                        </td>
                        <td className="text-end">
                          <Button
                            size="sm"
                            variant="outline-danger"
                            onClick={() => handleDeleteScheme(s._id)}
                          >
                            <FaTrash />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card>
            </Col>
          </Row>
        </Tab>
      </Tabs>

      {/* USER MODAL */}
      <Modal show={showUserModal} onHide={() => setShowUserModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            {selectedUser ? "Update User & Password" : "Add New User"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleUserSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control
                value={userForm.name}
                onChange={(e) =>
                  setUserForm({ ...userForm, name: e.target.value })
                }
                required
              />
            </Form.Group>

            {/* Don't allow changing email for existing users (it's the ID) */}
            <Form.Group className="mb-3">
              <Form.Label>Email (Login ID)</Form.Label>
              <Form.Control
                value={userForm.email}
                onChange={(e) =>
                  setUserForm({ ...userForm, email: e.target.value })
                }
                disabled={!!selectedUser}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Phone</Form.Label>
              <Form.Control
                value={userForm.phone}
                onChange={(e) =>
                  setUserForm({ ...userForm, phone: e.target.value })
                }
                required
              />
            </Form.Group>

            <Row>
              <Col>
                <Form.Group className="mb-3">
                  <Form.Label>Role</Form.Label>
                  <Form.Select
                    value={userForm.role}
                    onChange={(e) =>
                      setUserForm({ ...userForm, role: e.target.value })
                    }
                  >
                    <option value="employee">Employee</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Admin</option>
                    <option value="president">President</option>
                    <option value="secretary">Secretary</option>
                    <option value="treasurer">Treasurer</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col>
                <Form.Group className="mb-3">
                  <Form.Label>Branch</Form.Label>
                  <Form.Select
                    value={userForm.branch}
                    onChange={(e) =>
                      setUserForm({ ...userForm, branch: e.target.value })
                    }
                  >
                    <option value="Headquarters">Headquarters</option>
                    <option value="Karunya Sindu">Karunya Sindu</option>
                    <option value="Karunya Bharathi">Karunya Bharathi</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <hr />
            <h6 className="text-danger">Reset Password</h6>
            <Form.Group className="mb-3">
              <Form.Label>
                New Password {selectedUser && "(Leave blank to keep current)"}
              </Form.Label>
              <Form.Control
                type="password"
                value={userForm.password}
                onChange={(e) =>
                  setUserForm({ ...userForm, password: e.target.value })
                }
                placeholder="******"
                required={!selectedUser}
              />
            </Form.Group>

            <Button type="submit" variant="dark" className="w-100">
              {selectedUser ? "Update User" : "Create User"}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default Settings;
