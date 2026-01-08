// import React, { useState } from "react";
// import { Link } from "react-router-dom";
// import { Form, Alert } from "react-bootstrap";
// import "./Login.css"; // Shared CSS

// const Login = () => {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");

//   // This is just for UI testing, real logic comes later
//   const handleLogin = (e) => {
//     e.preventDefault();
//     alert(`Attempting login with: ${email}`);
//   };

//   return (
//     <div className="auth-container">
//       <div className="auth-card">
//         {/* Header */}
//         <div className="auth-header">
//           <h2 className="auth-title">Welcome Back</h2>
//           <p className="auth-subtitle">Sign in to Karunasri Seva Samithi</p>
//         </div>

//         {/* Body */}
//         <div className="auth-body">
//           <Form onSubmit={handleLogin}>
//             {/* Email */}
//             <Form.Group className="mb-3">
//               <Form.Label className="form-label-auth">Email Address</Form.Label>
//               <Form.Control
//                 type="email"
//                 placeholder="name@example.com"
//                 className="form-control-auth"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 required
//               />
//             </Form.Group>

//             {/* Password */}
//             <Form.Group className="mb-3">
//               <div className="d-flex justify-content-between">
//                 <Form.Label className="form-label-auth">Password</Form.Label>
//                 <Link
//                   to="/forgot-password"
//                   style={{
//                     fontSize: "0.8rem",
//                     color: "#666",
//                     textDecoration: "none",
//                   }}
//                 >
//                   Forgot Password?
//                 </Link>
//               </div>
//               <Form.Control
//                 type="password"
//                 placeholder="Enter your password"
//                 className="form-control-auth"
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 required
//               />
//             </Form.Group>

//             {/* Submit Button */}
//             <button type="submit" className="btn-auth">
//               Sign In
//             </button>
//           </Form>

//           {/* Footer / Register Link */}
//           <div className="auth-divider">
//             <span>OR</span>
//           </div>

//           <div className="auth-footer">
//             Don't have an account?{" "}
//             <Link to="/register" className="auth-link">
//               Create Account
//             </Link>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Login;
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Form, Alert, Spinner } from "react-bootstrap";
import axios from "axios";
import "./Login.css";
import BASE_URL from "../apiConfig";

const Login = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // UI States
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // 1. Send Data to Backend
      const config = {
        headers: {
          "Content-Type": "application/json",
        },
      };

      //   const { data } = await axios.post(
      //     `${BASE_URL}/api/users/login`,
      //     { email, password },
      //     config
      //   );

      //   // 2. Save User Info (Token) to Browser Storage
      //   localStorage.setItem("userInfo", JSON.stringify(data));

      //   // 3. Redirect to Home
      //   setLoading(false);
      //   navigate("/");

      //   // Optional: Reload page to update Navbar immediately (simple fix before we add Redux)
      //   window.location.reload();
      // } catch (err) {
      //   setLoading(false);
      //   // Show error message from backend (e.g., "Invalid password")
      //   setError(err.response?.data?.message || "Login Failed");
      // --- 2. USE BASE_URL HERE INSTEAD OF LOCALHOST ---
      const { data } = await axios.post(
        `${BASE_URL}/api/users/login`,
        { email, password },
        config
      );

      localStorage.setItem("userInfo", JSON.stringify(data));
      setLoading(false);
      navigate("/");
      window.location.reload();
    } catch (err) {
      setLoading(false);
      // Detailed error handling
      if (err.response && err.response.status === 404) {
        setError("Server not found (404). Check API URL.");
      } else {
        setError(err.response?.data?.message || "Login Failed");
      }
      console.error("Login Error:", err);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2 className="auth-title">Welcome Back</h2>
          <p className="auth-subtitle">Sign in to Karunasri Seva Samithi</p>
        </div>

        <div className="auth-body">
          {/* Error Alert */}
          {error && <Alert variant="danger">{error}</Alert>}

          <Form onSubmit={handleLogin}>
            <Form.Group className="mb-3">
              <Form.Label className="form-label-auth">Email Address</Form.Label>
              <Form.Control
                type="email"
                placeholder="name@example.com"
                className="form-control-auth"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <div className="d-flex justify-content-between">
                <Form.Label className="form-label-auth">Password</Form.Label>
                {/* We will build Forgot Password logic later */}
                <Link
                  to="#"
                  style={{
                    fontSize: "0.8rem",
                    color: "#666",
                    textDecoration: "none",
                  }}
                >
                  Forgot Password?
                </Link>
              </div>
              <Form.Control
                type="password"
                placeholder="Enter your password"
                className="form-control-auth"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </Form.Group>

            <button type="submit" className="btn-auth" disabled={loading}>
              {loading ? <Spinner animation="border" size="sm" /> : "Sign In"}
            </button>
          </Form>

          <div className="auth-divider">
            <span>OR</span>
          </div>

          <div className="auth-footer">
            Don't have an account?{" "}
            <Link to="/register" className="auth-link">
              Create Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
