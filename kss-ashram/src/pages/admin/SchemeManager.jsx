/* eslint-disable react-hooks/immutability */
/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { Table, Button, Form, Card, Row, Col, Alert } from "react-bootstrap";
import { FaTrash, FaPlus } from "react-icons/fa";
import axios from "axios";

const SchemeManager = () => {
  const [schemes, setSchemes] = useState([]);
  const [newScheme, setNewScheme] = useState("");
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("userInfo"));
    setUserInfo(user);
    fetchSchemes();
  }, []);

  const fetchSchemes = async () => {
    try {
      const { data } = await axios.get("http://localhost:5000/api/schemes");
      setSchemes(data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newScheme) return;
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      await axios.post(
        "http://localhost:5000/api/schemes",
        { name: newScheme },
        config
      );
      setNewScheme("");
      fetchSchemes();
    } catch (error) {
      alert("Error adding scheme");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this scheme?")) return;
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      await axios.delete(`http://localhost:5000/api/schemes/${id}`, config);
      fetchSchemes();
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
        <Col md={6}>
          <Card className="shadow-sm border-0 p-3 mb-4">
            <h5 className="mb-3">Add New Scheme</h5>
            <Form onSubmit={handleAdd} className="d-flex gap-2">
              <Form.Control
                placeholder="Enter Scheme Name (e.g. Nitya Annadhana)"
                value={newScheme}
                onChange={(e) => setNewScheme(e.target.value)}
              />
              <Button type="submit" variant="success">
                <FaPlus /> Add
              </Button>
            </Form>
          </Card>

          <Card className="shadow-sm border-0">
            <Table hover className="mb-0">
              <thead className="bg-light">
                <tr>
                  <th>Scheme Name</th>
                  <th className="text-end">Action</th>
                </tr>
              </thead>
              <tbody>
                {schemes.map((s) => (
                  <tr key={s._id}>
                    <td className="fw-bold">{s.name}</td>
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
                    <td colSpan="2" className="text-center">
                      No schemes found.
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </Card>
        </Col>
        <Col md={6}>
          <Alert variant="info">
            <strong>Note:</strong> These schemes will appear in the dropdown
            menu on the Donation Page and Admin Entry form.
          </Alert>
        </Col>
      </Row>
    </div>
  );
};

export default SchemeManager;
