import React, { useState } from "react";
import { Navbar, Container, Nav, Button, Dropdown } from "react-bootstrap";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  FaPhoneAlt,
  FaEnvelope,
  FaFacebook,
  FaYoutube,
  FaUserCircle,
} from "react-icons/fa";
import "./Header.css";
import logo from "../assets/logo.jpg";

const Header = () => {
  const navigate = useNavigate();

  // Lazy initialization to prevent hydration errors
  const [userInfo, setUserInfo] = useState(() => {
    const savedUser = localStorage.getItem("userInfo");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const handleLogout = () => {
    localStorage.removeItem("userInfo");
    setUserInfo(null);
    navigate("/login");
  };

  // Define who can see the Dashboard
  const allowedRoles = [
    "admin",
    "employee",
    "president",
    "secretary",
    "treasurer",
  ];

  return (
    <>
      {/* Top Bar */}
      <div className="py-2 top-bar">
        <Container className="d-flex justify-content-between align-items-center">
          <div className="d-flex gap-3">
            <span>
              <FaPhoneAlt className="me-2" /> +91 99220 03000
            </span>
            <span className="d-none d-md-block">
              <FaEnvelope className="me-2" /> info@karunasri.org
            </span>
          </div>
          <div className="d-flex gap-3">
            <span className="d-none d-md-block">Reg No: 123/2024</span>
            <a href="#">
              <FaFacebook />
            </a>
            <a href="#">
              <FaYoutube />
            </a>
          </div>
        </Container>
      </div>

      {/* Main Navbar */}
      <Navbar expand="lg" className="sticky-top navbar-custom">
        <Container>
          <Navbar.Brand as={Link} to="/" className="d-flex align-items-center">
            {/* <div className="logo-circle">K</div> */}
            <img
              src={logo}
              alt="Karunasri Logo"
              width="50" // Adjust size as needed
              height="50" // Adjust size as needed
              className="d-inline-block align-top me-2"
              style={{ objectFit: "contain" }} // Ensures logo doesn't stretch
            />

            <div style={{ lineHeight: "1.2" }}>
              <h4
                className="m-0"
                style={{
                  color: "var(--secondary-color)",
                  fontWeight: "bold",
                  letterSpacing: "1px",
                }}
              >
                KARUNASRI
              </h4>
              <small
                className="text-uppercase"
                style={{
                  fontSize: "0.7rem",
                  color: "#666",
                  letterSpacing: "2px",
                }}
              >
                Seva Samithi
              </small>
            </div>
          </Navbar.Brand>

          <Navbar.Toggle aria-controls="basic-navbar-nav" />

          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto align-items-center gap-2">
              {["Home", "About Us", "Activities", "Events", "Contact"].map(
                (item) => (
                  <Nav.Link
                    key={item}
                    as={NavLink}
                    to={
                      item === "Home"
                        ? "/"
                        : `/${item.toLowerCase().replace(" ", "-")}`
                    }
                    className="nav-link-custom"
                  >
                    {item}
                  </Nav.Link>
                )
              )}

              {/* AUTH CHECK */}
              {userInfo ? (
                <Dropdown align="end">
                  <Dropdown.Toggle
                    variant="light"
                    id="dropdown-basic"
                    className="d-flex align-items-center gap-2 border-0 fw-bold"
                    style={{ color: "var(--secondary-color)" }}
                  >
                    <FaUserCircle size={24} /> {userInfo.name.split(" ")[0]}
                  </Dropdown.Toggle>

                  <Dropdown.Menu>
                    <Dropdown.Item as={Link} to="/profile">
                      My Profile
                    </Dropdown.Item>
                    <Dropdown.Item as={Link} to="/history">
                      Donation History
                    </Dropdown.Item>

                    {/* UPDATED LOGIC: Check if role is in the allowed list */}
                    {allowedRoles.includes(userInfo.role) && (
                      <>
                        <Dropdown.Divider />
                        <Dropdown.Item
                          as={Link}
                          to="/dashboard"
                          className="text-primary fw-bold"
                        >
                          {userInfo.role === "admin"
                            ? "Admin Dashboard"
                            : userInfo.role === "employee"
                            ? "Employee Portal"
                            : "Committee Dashboard"}
                        </Dropdown.Item>
                      </>
                    )}

                    <Dropdown.Divider />
                    <Dropdown.Item
                      onClick={handleLogout}
                      className="text-danger"
                    >
                      Logout
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              ) : (
                <Nav.Link
                  as={NavLink}
                  to="/login"
                  className="nav-link-custom login-link"
                >
                  Login
                </Nav.Link>
              )}

              <Button as={Link} to="/donate" className="btn-donate-nav ms-2">
                Donate Now
              </Button>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </>
  );
};

export default Header;
