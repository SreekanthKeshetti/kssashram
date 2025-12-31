// // import React, { useState } from "react";
// // import { Link } from "react-router-dom";
// // import { Form, Row, Col } from "react-bootstrap";
// // import "./Login.css"; // Reusing the same CSS

// // const Register = () => {
// //   const [formData, setFormData] = useState({
// //     fullName: "",
// //     email: "",
// //     phone: "",
// //     password: "",
// //     confirmPassword: "",
// //   });

// //   const handleChange = (e) => {
// //     setFormData({ ...formData, [e.target.name]: e.target.value });
// //   };

// //   const handleRegister = (e) => {
// //     e.preventDefault();
// //     if (formData.password !== formData.confirmPassword) {
// //       alert("Passwords do not match!");
// //       return;
// //     }
// //     alert("Registration UI works!");
// //   };

// //   return (
// //     <div className="auth-container">
// //       <div className="auth-card" style={{ maxWidth: "550px" }}>
// //         {" "}
// //         {/* Slightly wider */}
// //         <div className="auth-header">
// //           <h2 className="auth-title">Join Our Community</h2>
// //           <p className="auth-subtitle">
// //             Create an account to track donations & events
// //           </p>
// //         </div>
// //         <div className="auth-body">
// //           <Form onSubmit={handleRegister}>
// //             {/* Full Name */}
// //             <Form.Group className="mb-2">
// //               <Form.Label className="form-label-auth">Full Name</Form.Label>
// //               <Form.Control
// //                 type="text"
// //                 name="fullName"
// //                 placeholder="Enter your name"
// //                 className="form-control-auth"
// //                 onChange={handleChange}
// //                 required
// //               />
// //             </Form.Group>

// //             <Row>
// //               {/* Phone */}
// //               <Col md={6}>
// //                 <Form.Group className="mb-2">
// //                   <Form.Label className="form-label-auth">
// //                     Mobile Number
// //                   </Form.Label>
// //                   <Form.Control
// //                     type="tel"
// //                     name="phone"
// //                     placeholder="+91"
// //                     className="form-control-auth"
// //                     onChange={handleChange}
// //                     required
// //                   />
// //                 </Form.Group>
// //               </Col>

// //               {/* Email */}
// //               <Col md={6}>
// //                 <Form.Group className="mb-2">
// //                   <Form.Label className="form-label-auth">
// //                     Email Address
// //                   </Form.Label>
// //                   <Form.Control
// //                     type="email"
// //                     name="email"
// //                     placeholder="name@example.com"
// //                     className="form-control-auth"
// //                     onChange={handleChange}
// //                     required
// //                   />
// //                 </Form.Group>
// //               </Col>
// //             </Row>

// //             <Row>
// //               {/* Password */}
// //               <Col md={6}>
// //                 <Form.Group className="mb-2">
// //                   <Form.Label className="form-label-auth">Password</Form.Label>
// //                   <Form.Control
// //                     type="password"
// //                     name="password"
// //                     placeholder="Create password"
// //                     className="form-control-auth"
// //                     onChange={handleChange}
// //                     required
// //                   />
// //                 </Form.Group>
// //               </Col>

// //               {/* Confirm Password */}
// //               <Col md={6}>
// //                 <Form.Group className="mb-2">
// //                   <Form.Label className="form-label-auth">
// //                     Confirm Password
// //                   </Form.Label>
// //                   <Form.Control
// //                     type="password"
// //                     name="confirmPassword"
// //                     placeholder="Confirm password"
// //                     className="form-control-auth"
// //                     onChange={handleChange}
// //                     required
// //                   />
// //                 </Form.Group>
// //               </Col>
// //             </Row>

// //             <button type="submit" className="btn-auth mt-3">
// //               Register
// //             </button>
// //           </Form>

// //           <div className="auth-footer mt-4">
// //             Already have an account?{" "}
// //             <Link to="/login" className="auth-link">
// //               Sign In
// //             </Link>
// //           </div>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // };

// // export default Register;
// import React, { useState } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import { Form, Row, Col, Alert } from "react-bootstrap";
// import axios from "axios";
// import "./Login.css";

// const Register = () => {
//   const navigate = useNavigate(); // Hook to redirect after success
//   const [formData, setFormData] = useState({
//     name: "", // changed from fullName to match backend
//     email: "",
//     phone: "",
//     password: "",
//     confirmPassword: "",
//   });
//   const [error, setError] = useState("");

//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   const handleRegister = async (e) => {
//     e.preventDefault();
//     setError("");

//     // Basic Validation
//     if (formData.password !== formData.confirmPassword) {
//       setError("Passwords do not match!");
//       return;
//     }

//     try {
//       // API Call
//       const res = await axios.post("http://localhost:5000/api/users/register", {
//         name: formData.name,
//         email: formData.email,
//         phone: formData.phone,
//         password: formData.password,
//       });

//       // If successful, save user data to LocalStorage (Browser memory)
//       localStorage.setItem("userInfo", JSON.stringify(res.data));

//       alert("Registration Successful!");
//       navigate("/"); // Redirect to Home Page
//     } catch (err) {
//       setError(err.response?.data?.message || "Registration Failed");
//     }
//   };

//   return (
//     <div className="auth-container">
//       <div className="auth-card" style={{ maxWidth: "550px" }}>
//         <div className="auth-header">
//           <h2 className="auth-title">Join Our Community</h2>
//           <p className="auth-subtitle">Create an account to track donations</p>
//         </div>

//         <div className="auth-body">
//           {error && <Alert variant="danger">{error}</Alert>}

//           <Form onSubmit={handleRegister}>
//             <Form.Group className="mb-2">
//               <Form.Label className="form-label-auth">Full Name</Form.Label>
//               <Form.Control
//                 type="text"
//                 name="name"
//                 placeholder="Enter full name"
//                 className="form-control-auth"
//                 onChange={handleChange}
//                 required
//               />
//             </Form.Group>

//             {/* ... Keep Phone, Email, Passwords exactly as before ... */}
//             {/* Just make sure input names match state: name="email", name="phone" etc */}
//             <Row>
//               <Col md={6}>
//                 <Form.Group className="mb-2">
//                   <Form.Label className="form-label-auth">
//                     Mobile Number
//                   </Form.Label>
//                   <Form.Control
//                     type="tel"
//                     name="phone"
//                     placeholder="+91"
//                     className="form-control-auth"
//                     onChange={handleChange}
//                     required
//                   />
//                 </Form.Group>
//               </Col>
//               <Col md={6}>
//                 <Form.Group className="mb-2">
//                   <Form.Label className="form-label-auth">
//                     Email Address
//                   </Form.Label>
//                   <Form.Control
//                     type="email"
//                     name="email"
//                     placeholder="name@example.com"
//                     className="form-control-auth"
//                     onChange={handleChange}
//                     required
//                   />
//                 </Form.Group>
//               </Col>
//             </Row>

//             <Row>
//               <Col md={6}>
//                 <Form.Group className="mb-2">
//                   <Form.Label className="form-label-auth">Password</Form.Label>
//                   <Form.Control
//                     type="password"
//                     name="password"
//                     placeholder="Create password"
//                     className="form-control-auth"
//                     onChange={handleChange}
//                     required
//                   />
//                 </Form.Group>
//               </Col>
//               <Col md={6}>
//                 <Form.Group className="mb-2">
//                   <Form.Label className="form-label-auth">
//                     Confirm Password
//                   </Form.Label>
//                   <Form.Control
//                     type="password"
//                     name="confirmPassword"
//                     placeholder="Confirm password"
//                     className="form-control-auth"
//                     onChange={handleChange}
//                     required
//                   />
//                 </Form.Group>
//               </Col>
//             </Row>

//             <button type="submit" className="btn-auth mt-3">
//               Register
//             </button>
//           </Form>

//           <div className="auth-footer mt-4">
//             Already have an account?{" "}
//             <Link to="/login" className="auth-link">
//               Sign In
//             </Link>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Register;
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Form, Row, Col, Alert } from "react-bootstrap"; // Ensure Alert is imported
import axios from "axios";
import "./Login.css";

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  // State for messages
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(""); // New success state

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Basic Validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    try {
      const res = await axios.post("http://localhost:5000/api/users/register", {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
      });

      // Save to LocalStorage
      localStorage.setItem("userInfo", JSON.stringify(res.data));

      // 1. Show Green Success Message
      setSuccess(
        "Registration Successful! Please check your email. Redirecting..."
      );

      // 2. Clear Form (Optional)
      setFormData({
        name: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
      });

      // 3. Wait 3 seconds, then redirect
      setTimeout(() => {
        navigate("/");
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Registration Failed");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card" style={{ maxWidth: "550px" }}>
        <div className="auth-header">
          <h2 className="auth-title">Join Our Community</h2>
          <p className="auth-subtitle">Create an account to track donations</p>
        </div>

        <div className="auth-body">
          {/* Display Messages Here */}
          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}

          <Form onSubmit={handleRegister}>
            <Form.Group className="mb-2">
              <Form.Label className="form-label-auth">Full Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={formData.name}
                placeholder="Enter full name"
                className="form-control-auth"
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-2">
                  <Form.Label className="form-label-auth">
                    Mobile Number
                  </Form.Label>
                  <Form.Control
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    placeholder="+91"
                    className="form-control-auth"
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-2">
                  <Form.Label className="form-label-auth">
                    Email Address
                  </Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    placeholder="name@example.com"
                    className="form-control-auth"
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-2">
                  <Form.Label className="form-label-auth">Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    value={formData.password}
                    placeholder="Create password"
                    className="form-control-auth"
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-2">
                  <Form.Label className="form-label-auth">
                    Confirm Password
                  </Form.Label>
                  <Form.Control
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    placeholder="Confirm password"
                    className="form-control-auth"
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <button type="submit" className="btn-auth mt-3">
              Register
            </button>
          </Form>

          <div className="auth-footer mt-4">
            Already have an account?{" "}
            <Link to="/login" className="auth-link">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
