// import React from "react";
// import { Navbar, Container, Nav, Button } from "react-bootstrap";
// import { Link, NavLink } from "react-router-dom";
// import { FaPhoneAlt, FaEnvelope, FaFacebook, FaYoutube } from "react-icons/fa";

// const Header = () => {
//   return (
//     <>
//       {/* Top Bar */}
//       <div className="py-2 top-bar">
//         <Container className="d-flex justify-content-between align-items-center">
//           <div className="d-flex gap-3">
//             <span>
//               <FaPhoneAlt className="me-2" /> +91 99220 03000
//             </span>
//             <span className="d-none d-md-block">
//               <FaEnvelope className="me-2" /> info@karunasri.org
//             </span>
//           </div>
//           <div className="d-flex gap-3">
//             <span className="d-none d-md-block">Reg No: 123/2024</span>
//             <a href="#">
//               <FaFacebook />
//             </a>
//             <a href="#">
//               <FaYoutube />
//             </a>
//           </div>
//         </Container>
//       </div>

//       {/* Main Navbar */}
//       <Navbar expand="lg" className="sticky-top navbar-custom">
//         <Container>
//           <Navbar.Brand as={Link} to="/" className="d-flex align-items-center">
//             <div className="logo-circle">K</div>
//             <div style={{ lineHeight: "1.2" }}>
//               <h4
//                 className="m-0"
//                 style={{
//                   color: "var(--secondary-color)",
//                   fontWeight: "bold",
//                   letterSpacing: "1px",
//                 }}
//               >
//                 KARUNASRI
//               </h4>
//               <small
//                 className="text-uppercase"
//                 style={{
//                   fontSize: "0.7rem",
//                   color: "#666",
//                   letterSpacing: "2px",
//                 }}
//               >
//                 Seva Samithi
//               </small>
//             </div>
//           </Navbar.Brand>

//           <Navbar.Toggle aria-controls="basic-navbar-nav" />

//           <Navbar.Collapse id="basic-navbar-nav">
//             <Nav className="ms-auto align-items-center gap-2">
//               {["Home", "About Us", "Activities", "Events", "Contact"].map(
//                 (item) => (
//                   <Nav.Link
//                     key={item}
//                     as={NavLink}
//                     to={
//                       item === "Home"
//                         ? "/"
//                         : `/${item.toLowerCase().replace(" ", "-")}`
//                     }
//                     className="nav-link-custom"
//                   >
//                     {item}
//                   </Nav.Link>
//                 )
//               )}

//               <Nav.Link
//                 as={NavLink}
//                 to="/login"
//                 className="nav-link-custom login-link"
//               >
//                 Login
//               </Nav.Link>

//               <Button as={Link} to="/donate" className="btn-donate-nav ms-2">
//                 Donate Now
//               </Button>
//             </Nav>
//           </Navbar.Collapse>
//         </Container>
//       </Navbar>
//       <style>
//         {`
//         /* Top Strip (Maroon) */
// .top-bar {
//   background-color: var(--secondary-color);
//   font-size: 0.9rem;
//   color: white;
// }

// .top-bar a {
//   color: rgba(255, 255, 255, 0.8);
//   transition: color 0.3s;
// }

// .top-bar a:hover {
//   color: var(--gold-accent);
// }

// /* Main Navbar */
// .navbar-custom {
//   background-color: white;
//   border-bottom: 3px solid var(--gold-accent);
//   box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
// }

// /* Logo Circle */
// .logo-circle {
//   width: 50px;
//   height: 50px;
//   background-color: var(--primary-color);
//   border-radius: 50%;
//   color: white;
//   font-weight: bold;
//   font-size: 24px;
//   margin-right: 12px;
//   display: flex;
//   justify-content: center;
//   align-items: center;
//   box-shadow: 0 2px 5px rgba(0,0,0,0.2);
// }

// /* Navigation Links */
// .nav-link-custom {
//   font-weight: 500 !important;
//   color: var(--text-dark) !important;
//   font-family: var(--font-heading);
//   font-size: 1.1rem;
//   padding: 0.5rem 1rem !important;
//   transition: color 0.3s ease;
// }

// .nav-link-custom:hover,
// .nav-link-custom.active {
//   color: var(--primary-color) !important;
// }

// /* Login Link */
// .login-link {
//   color: var(--primary-color) !important;
//   font-weight: bold !important;
// }

// /* Common Button Style (Scoped to Header if needed, or global) */
// .btn-donate-nav {
//   background: linear-gradient(45deg, var(--primary-color), var(--primary-hover));
//   color: white !important;
//   border: none;
//   font-weight: 700;
//   padding: 10px 25px;
//   border-radius: 30px;
//   text-transform: uppercase;
//   letter-spacing: 1px;
//   transition: transform 0.2s, box-shadow 0.2s;
// }

// .btn-donate-nav:hover {
//   transform: translateY(-2px);
//   box-shadow: 0 4px 15px rgba(211, 84, 0, 0.4);
// }

//         `}
//       </style>
//     </>
//   );
// };

// export default Header;
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

const Header = () => {
  const navigate = useNavigate();

  // FIX: Initialize state directly from LocalStorage (Lazy Initialization)
  // This avoids the "useEffect" render error completely.
  const [userInfo, setUserInfo] = useState(() => {
    const savedUser = localStorage.getItem("userInfo");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const handleLogout = () => {
    localStorage.removeItem("userInfo");
    setUserInfo(null); // Clear state immediately
    navigate("/login");
  };

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
            <div className="logo-circle">K</div>
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

                    {/* Admin/Employee Link */}
                    {(userInfo.role === "admin" ||
                      userInfo.role === "employee") && (
                      <>
                        <Dropdown.Divider />
                        <Dropdown.Item
                          as={Link}
                          to="/dashboard"
                          className="text-primary fw-bold"
                        >
                          {userInfo.role === "admin"
                            ? "Admin Dashboard"
                            : "Employee Portal"}
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
