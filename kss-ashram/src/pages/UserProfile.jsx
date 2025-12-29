import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Alert,
} from "react-bootstrap";
import { FaUserCircle, FaSave, FaEdit } from "react-icons/fa";
import axios from "axios";

const UserProfile = () => {
  const [user, setUser] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem("userInfo"));
        const config = {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        };
        const { data } = await axios.get(
          "http://localhost:5000/api/users/profile",
          config
        );
        setUser({ ...data, password: "", confirmPassword: "" });
      } catch (error) {
        console.error(error);
      }
    };
    fetchProfile();
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (user.password && user.password !== user.confirmPassword) {
      setMessage({ type: "danger", text: "Passwords do not match" });
      return;
    }

    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

      const { data } = await axios.put(
        "http://localhost:5000/api/users/profile",
        {
          name: user.name,
          phone: user.phone,
          password: user.password,
        },
        config
      );

      // Update Local Storage
      localStorage.setItem(
        "userInfo",
        JSON.stringify({ ...userInfo, name: data.name })
      );

      setMessage({ type: "success", text: "Profile Updated Successfully" });
      setIsEditing(false);
    } catch (error) {
      setMessage({
        type: "danger",
        text: error.response?.data?.message || "Update Failed",
      });
    }
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card className="shadow border-0">
            <Card.Header className="bg-white text-center py-4">
              <FaUserCircle size={60} className="text-secondary mb-2" />
              <h3 className="mb-0">My Profile</h3>
            </Card.Header>
            <Card.Body className="p-4">
              {message && <Alert variant={message.type}>{message.text}</Alert>}

              <Form onSubmit={handleUpdate}>
                <Form.Group className="mb-3">
                  <Form.Label>Full Name</Form.Label>
                  <Form.Control
                    type="text"
                    value={user.name}
                    onChange={(e) => setUser({ ...user, name: e.target.value })}
                    disabled={!isEditing}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Email Address</Form.Label>
                  <Form.Control type="email" value={user.email} disabled />
                  <Form.Text className="text-muted">
                    Email cannot be changed.
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Phone Number</Form.Label>
                  <Form.Control
                    type="text"
                    value={user.phone}
                    onChange={(e) =>
                      setUser({ ...user, phone: e.target.value })
                    }
                    disabled={!isEditing}
                  />
                </Form.Group>

                {isEditing && (
                  <>
                    <hr />
                    <h6 className="mb-3 text-muted">
                      Change Password (Optional)
                    </h6>
                    <Form.Group className="mb-3">
                      <Form.Label>New Password</Form.Label>
                      <Form.Control
                        type="password"
                        value={user.password}
                        onChange={(e) =>
                          setUser({ ...user, password: e.target.value })
                        }
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Confirm Password</Form.Label>
                      <Form.Control
                        type="password"
                        value={user.confirmPassword}
                        onChange={(e) =>
                          setUser({ ...user, confirmPassword: e.target.value })
                        }
                      />
                    </Form.Group>
                  </>
                )}

                <div className="d-grid gap-2 mt-4">
                  {isEditing ? (
                    <Button type="submit" variant="success">
                      <FaSave className="me-2" /> Save Changes
                    </Button>
                  ) : (
                    <Button
                      variant="primary"
                      onClick={() => setIsEditing(true)}
                      style={{ backgroundColor: "#581818", border: "none" }}
                    >
                      <FaEdit className="me-2" /> Edit Profile
                    </Button>
                  )}
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default UserProfile;
