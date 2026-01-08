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
} from "react-bootstrap";
import { FaTrash, FaPlus } from "react-icons/fa";
import axios from "axios";
import BASE_URL from "../../apiConfig";

const SchemeManager = () => {
  const [schemes, setSchemes] = useState([]);
  const [accountHeads, setAccountHeads] = useState([]); // Store Credit Codes

  // Form State
  const [newSchemeName, setNewSchemeName] = useState("");
  const [selectedAccount, setSelectedAccount] = useState("");

  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("userInfo"));
    setUserInfo(user);
    if (user) {
      fetchSchemes(user);
      fetchAccountHeads(user);
    }
  }, []);

  const fetchSchemes = async (user) => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get(`${BASE_URL}/api/schemes`, config);
      setSchemes(data);
    } catch (error) {
      console.error(error);
    }
  };

  // Fetch Account Codes (Credit Side Only)
  const fetchAccountHeads = async (user) => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get(`${BASE_URL}/api/accounts`, config);
      // Filter only CREDIT (Income) codes
      const creditAccounts = data.filter((acc) => acc.type === "Credit");
      setAccountHeads(creditAccounts);
    } catch (error) {
      console.error(error);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newSchemeName || !selectedAccount)
      return alert("Please enter name and select account code");

    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      await axios.post(
        `${BASE_URL}/api/schemes`,
        {
          name: newSchemeName,
          accountHead: selectedAccount,
        },
        config
      );

      setNewSchemeName("");
      setSelectedAccount("");
      fetchSchemes(userInfo);
    } catch (error) {
      alert("Error adding scheme");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this scheme?")) return;
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      await axios.delete(`${BASE_URL}/api/schemes/${id}`, config);
      fetchSchemes(userInfo);
    } catch (error) {
      alert("Error deleting scheme");
    }
  };

  return (
    <div>
      <h2
        className="text-maroon mb-4"
        style={{ fontFamily: "Playfair Display" }}
      >
        Manage Donation Schemes
      </h2>

      <Row>
        <Col md={5}>
          <Card className="shadow-sm border-0 p-3 mb-4">
            <h5 className="mb-3">Add New Scheme</h5>
            <Form onSubmit={handleAdd}>
              <Form.Group className="mb-2">
                <Form.Label>Scheme Name</Form.Label>
                <Form.Control
                  placeholder="e.g. Nitya Annadhana"
                  value={newSchemeName}
                  onChange={(e) => setNewSchemeName(e.target.value)}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Link to Account Code (Credit)</Form.Label>
                <Form.Select
                  value={selectedAccount}
                  onChange={(e) => setSelectedAccount(e.target.value)}
                >
                  <option value="">-- Select Account --</option>
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
                  <th>Account Code</th>
                  <th className="text-end">Action</th>
                </tr>
              </thead>
              <tbody>
                {schemes.map((s) => (
                  <tr key={s._id}>
                    <td className="fw-bold">{s.name}</td>
                    <td>
                      {s.accountHead ? (
                        <Badge bg="info" text="dark">
                          {s.accountHead.code} - {s.accountHead.name}
                        </Badge>
                      ) : (
                        <Badge bg="danger">Unmapped</Badge>
                      )}
                    </td>
                    <td className="text-end">
                      <Button
                        size="sm"
                        variant="outline-danger"
                        onClick={() => handleDelete(s._id)}
                      >
                        <FaTrash />
                      </Button>
                    </td>
                  </tr>
                ))}
                {schemes.length === 0 && (
                  <tr>
                    <td colSpan="3" className="text-center">
                      No schemes found.
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default SchemeManager;
