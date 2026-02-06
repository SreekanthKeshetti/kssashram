/* eslint-disable react-hooks/immutability */
/* eslint-disable no-unused-vars */
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
  FaCalendarDay, // Icon for Occasion
} from "react-icons/fa";
import axios from "axios";
import BASE_URL from "../../apiConfig";

const Settings = () => {
  const [key, setKey] = useState("users");
  const [userInfo, setUserInfo] = useState(null);

  // --- SCHEME STATE ---
  const [schemes, setSchemes] = useState([]);
  const [newSchemeName, setNewSchemeName] = useState("");
  const [accountHeads, setAccountHeads] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState("");

  // --- OCCASION STATE (NEW) ---
  const [occasions, setOccasions] = useState([]);
  const [newOccasionName, setNewOccasionName] = useState("");

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
      fetchOccasions(user); // <--- Fetch Occasions
      fetchUsers(user);
    }
  }, []);

  // 1. SCHEME LOGIC
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
        config,
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

  // 2. OCCASION LOGIC (NEW)
  const fetchOccasions = async (user) => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get(`${BASE_URL}/api/occasions`, config);
      setOccasions(data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleAddOccasion = async (e) => {
    e.preventDefault();
    if (!newOccasionName) return alert("Enter name");
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      await axios.post(
        `${BASE_URL}/api/occasions`,
        { name: newOccasionName },
        config,
      );
      setNewOccasionName("");
      fetchOccasions(userInfo);
    } catch (error) {
      alert("Error adding occasion");
    }
  };

  const handleDeleteOccasion = async (id) => {
    if (!window.confirm("Delete occasion?")) return;
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      await axios.delete(`${BASE_URL}/api/occasions/${id}`, config);
      fetchOccasions(userInfo);
    } catch (error) {
      alert("Error deleting");
    }
  };

  // 3. USER LOGIC
  const fetchUsers = async (user) => {
    if (user.role !== "admin") return;
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
        await axios.put(
          `${BASE_URL}/api/users/${selectedUser._id}`,
          userForm,
          config,
        );
        alert("User Updated");
      } else {
        await axios.post(`${BASE_URL}/api/users`, userForm, config);
        alert("New User Created");
      }
      setShowUserModal(false);
      fetchUsers(userInfo);
    } catch (error) {
      alert(error.response?.data?.message || "Error");
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm("Delete user?")) return;
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      await axios.delete(`${BASE_URL}/api/users/${id}`, config);
      fetchUsers(userInfo);
    } catch (error) {
      alert("Error deleting");
    }
  };

  const openUserModal = (user = null) => {
    if (user) {
      setSelectedUser(user);
      setUserForm({ ...user, password: "" });
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
                      <th>Email</th>
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
                          >
                            <FaKey />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline-danger"
                            onClick={() => handleDeleteUser(u._id)}
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

        {/* TAB 2: SCHEMES */}
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
                    <Form.Label>Account Code</Form.Label>
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

        {/* TAB 3: OCCASIONS (NEW) */}
        <Tab
          eventKey="occasions"
          title={
            <span>
              <FaCalendarDay /> Occasions
            </span>
          }
        >
          <Row>
            <Col md={5}>
              <Card className="shadow-sm border-0 p-3 mb-4">
                <h5 className="mb-3">Add New Occasion</h5>
                <Form onSubmit={handleAddOccasion}>
                  <Form.Group className="mb-3">
                    <Form.Label>Occasion Name</Form.Label>
                    <Form.Control
                      placeholder="e.g. House Warming, Graduation"
                      value={newOccasionName}
                      onChange={(e) => setNewOccasionName(e.target.value)}
                    />
                  </Form.Group>
                  <Button type="submit" variant="success" className="w-100">
                    <FaPlus /> Add Occasion
                  </Button>
                </Form>
              </Card>
            </Col>
            <Col md={7}>
              <Card className="shadow-sm border-0">
                <Table hover className="mb-0 align-middle">
                  <thead className="bg-light">
                    <tr>
                      <th>Occasion Name</th>
                      <th className="text-end">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {occasions.map((o) => (
                      <tr key={o._id}>
                        <td className="fw-bold">{o.name}</td>
                        <td className="text-end">
                          <Button
                            size="sm"
                            variant="outline-danger"
                            onClick={() => handleDeleteOccasion(o._id)}
                          >
                            <FaTrash />
                          </Button>
                        </td>
                      </tr>
                    ))}
                    {occasions.length === 0 && (
                      <tr>
                        <td colSpan="2" className="text-center">
                          No occasions found. Add one!
                        </td>
                      </tr>
                    )}
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
            {selectedUser ? "Update User" : "Add New User"}
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
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
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
                  {/* <Form.Select
                    value={userForm.role}
                    onChange={(e) =>
                      setUserForm({ ...userForm, role: e.target.value })
                    }
                  >
                    <option value="employee">Employee</option>
                    <option value="warden">Warden</option>
                    <option value="accountant">Accountant</option>
                    <option value="clerk">Clerk</option>
                    <option disabled>--- Committee ---</option>
                    <option value="president">President</option>
                    <option value="secretary">Secretary</option>
                    <option value="treasurer">Treasurer</option>
                    <option disabled>--- Admin ---</option>
                    <option value="admin">System Admin</option>
                  </Form.Select> */}
                  <Form.Select
                    value={userForm.role}
                    onChange={(e) =>
                      setUserForm({ ...userForm, role: e.target.value })
                    }
                  >
                    <option value="employee">Standard Employee</option>

                    <option disabled>--- Staff Roles ---</option>
                    <option value="warden">Warden</option>
                    <option value="accountant">Accountant</option>
                    <option value="clerk">Clerk</option>

                    <option disabled>--- Committee ---</option>
                    <option value="president">President</option>
                    <option value="secretary">Secretary</option>
                    <option value="treasurer">Treasurer</option>

                    <option disabled>--- Admin ---</option>
                    <option value="admin">System Admin</option>
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
                    <option value="Karunya Sindhu">Karunya Sindhu</option>
                    <option value="Karunya Bharathi">Karunya Bharathi</option>
                    <option value="KarunaSri Seva Samithi">
                      KarunaSri Seva Samithi
                    </option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                value={userForm.password}
                onChange={(e) =>
                  setUserForm({ ...userForm, password: e.target.value })
                }
                required={!selectedUser}
              />
            </Form.Group>
            <Button type="submit" variant="dark" className="w-100">
              {selectedUser ? "Update" : "Create"}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default Settings;
