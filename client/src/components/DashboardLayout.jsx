/* eslint-disable react-hooks/set-state-in-effect */
// import React, { useEffect, useState } from "react";
// import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
// import {
//   FaTachometerAlt,
//   FaHandHoldingHeart,
//   FaUserGraduate,
//   FaBoxOpen,
//   FaRupeeSign,
//   FaCalendarAlt,
//   FaUsers,
//   FaChartBar,
//   FaSignOutAlt,
//   FaCogs,
//   FaShieldAlt,
// } from "react-icons/fa";
// import "./DashboardLayout.css";

// const DashboardLayout = () => {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const [user, setUser] = useState(null);

//   // useEffect(() => {
//   //   const userInfo = JSON.parse(localStorage.getItem("userInfo"));
//   //   if (
//   //     !userInfo ||
//   //     (userInfo.role !== "admin" && userInfo.role !== "employee")
//   //   ) {
//   //     navigate("/login");
//   //   } else {
//   //     // eslint-disable-next-line react-hooks/set-state-in-effect
//   //     setUser(userInfo);
//   //   }
//   // }, [navigate]);
//   useEffect(() => {
//     const userInfo = JSON.parse(localStorage.getItem("userInfo"));

//     // Define allowed roles
//     const allowedRoles = [
//       "admin",
//       "employee",
//       "president",
//       "secretary",
//       "treasurer",
//     ];

//     if (!userInfo || !allowedRoles.includes(userInfo.role)) {
//       navigate("/login"); // Redirect if not authorized
//     } else {
//       // eslint-disable-next-line react-hooks/set-state-in-effect
//       setUser(userInfo);
//     }
//   }, [navigate]);

//   const handleLogout = () => {
//     localStorage.removeItem("userInfo");
//     navigate("/login");
//   };

//   if (!user) return null;

//   // Helper to check active link
//   const isActive = (path) => (location.pathname.includes(path) ? "active" : "");

//   return (
//     <div className="dashboard-container">
//       {/* SIDEBAR */}
//       <aside className="sidebar">
//         <div className="sidebar-header">
//           <Link to="/" className="sidebar-brand">
//             Karunasri ERP
//           </Link>
//           <div className="text-muted small mt-1">
//             Branch: {user.branch || "Headquarters"}
//           </div>
//         </div>

//         <ul className="sidebar-menu">
//           <li>
//             <Link
//               to="/dashboard"
//               className={`menu-item ${
//                 location.pathname === "/dashboard" ? "active" : ""
//               }`}
//             >
//               <FaTachometerAlt /> Overview
//             </Link>
//           </li>

//           {/* Module: Donations (KSS_DON) */}
//           <li>
//             <Link
//               to="/dashboard/donations"
//               className={`menu-item ${isActive("donations")}`}
//             >
//               <FaHandHoldingHeart /> Donations
//             </Link>
//           </li>
//           <li>
//             <Link
//               to="/dashboard/daily-seva"
//               className={`menu-item ${isActive("daily-seva")}`}
//             >
//               <FaCalendarAlt /> Today's Donors
//             </Link>
//           </li>

//           {/* Module: Students (KSS_STU) */}
//           <li>
//             <Link
//               to="/dashboard/students"
//               className={`menu-item ${isActive("students")}`}
//             >
//               <FaUserGraduate /> Students
//             </Link>
//           </li>

//           {/* Module: Inventory (KSS_INV) */}
//           <li>
//             <Link
//               to="/dashboard/inventory"
//               className={`menu-item ${isActive("inventory")}`}
//             >
//               <FaBoxOpen /> Inventory
//             </Link>
//           </li>

//           {/* Module: Finance (KSS_FIN) */}
//           <li>
//             <Link
//               to="/dashboard/finance"
//               className={`menu-item ${isActive("finance")}`}
//             >
//               <FaRupeeSign /> Finance
//             </Link>
//           </li>

//           {/* Module: Events (KSS_EVE) */}
//           <li>
//             <Link
//               to="/dashboard/events"
//               className={`menu-item ${isActive("events")}`}
//             >
//               <FaCalendarAlt /> Events
//             </Link>
//           </li>

//           {/* Module: Memberships (KSS_MEM) */}
//           <li>
//             <Link
//               to="/dashboard/members"
//               className={`menu-item ${isActive("members")}`}
//             >
//               <FaUsers /> Members
//             </Link>
//           </li>

//           {/* Module: Reports (KSS_GEN_6) */}
//           <li>
//             <Link
//               to="/dashboard/reports"
//               className={`menu-item ${isActive("reports")}`}
//             >
//               <FaChartBar /> Reports
//             </Link>
//           </li>

//           {/* Admin Only: Settings (KSS_GEN_4 - Metadata) */}
//           {/* {user.role === "admin" && (
//             <li>
//               <Link
//                 to="/dashboard/settings"
//                 className={`menu-item ${isActive("settings")}`}
//               >
//                 <FaCogs /> Settings
//               </Link>
//             </li>
//           )} */}
//           {/* Module: Settings (KSS_GEN_4 & KSS_DON_3) */}
//           {/* CHANGED: Allow both Admin AND Employee */}
//           {(user.role === "admin" || user.role === "employee") && (
//             <li>
//               <Link
//                 to="/dashboard/settings"
//                 className={`menu-item ${isActive("settings")}`}
//               >
//                 <FaCogs /> Settings
//               </Link>
//             </li>
//           )}
//           {/* Module: Audit Trail (Admin Only) */}
//           {user.role === "admin" && (
//             <li>
//               <Link
//                 to="/dashboard/audit"
//                 className={`menu-item ${isActive("audit")}`}
//               >
//                 <FaShieldAlt /> Audit Trail
//               </Link>
//             </li>
//           )}

//           <li style={{ marginTop: "auto" }}>
//             <button
//               onClick={handleLogout}
//               className="menu-item"
//               style={{
//                 background: "transparent",
//                 border: "none",
//                 width: "100%",
//               }}
//             >
//               <FaSignOutAlt /> Logout
//             </button>
//           </li>
//         </ul>
//       </aside>

//       {/* MAIN CONTENT */}
//       <div className="main-content">
//         <header className="top-header">
//           <h5 className="m-0 text-secondary">
//             {/* Dynamic Header Title based on path */}
//             {location.pathname.split("/")[2]?.toUpperCase() || "DASHBOARD"}
//           </h5>
//           <div className="d-flex align-items-center gap-3">
//             <div className="text-end">
//               <div className="fw-bold text-maroon">{user.name}</div>
//               <div
//                 style={{ fontSize: "0.8rem" }}
//                 className="text-muted text-uppercase"
//               >
//                 {user.role}
//               </div>
//             </div>
//             <div
//               style={{
//                 width: "40px",
//                 height: "40px",
//                 background: "#581818",
//                 color: "white",
//                 borderRadius: "50%",
//                 display: "flex",
//                 alignItems: "center",
//                 justifyContent: "center",
//                 fontWeight: "bold",
//               }}
//             >
//               {user.name.charAt(0)}
//             </div>
//           </div>
//         </header>

//         <main className="page-content">
//           <Outlet />
//         </main>
//       </div>
//     </div>
//   );
// };

// export default DashboardLayout;
import React, { useEffect, useState } from "react";
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import {
  FaTachometerAlt,
  FaHandHoldingHeart,
  FaUserGraduate,
  FaBoxOpen,
  FaRupeeSign,
  FaCalendarAlt,
  FaUsers,
  FaChartBar,
  FaSignOutAlt,
  FaCogs,
  FaShieldAlt,
  FaBars, // <--- Import Menu Icon
  FaTimes, // <--- Import Close Icon
} from "react-icons/fa";
import "./DashboardLayout.css";

const DashboardLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);

  // --- NEW: SIDEBAR STATE ---
  const [showSidebar, setShowSidebar] = useState(false);

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    // Define allowed roles
    const allowedRoles = [
      "admin",
      "employee",
      "president",
      "secretary",
      "treasurer",
    ];

    if (!userInfo || !allowedRoles.includes(userInfo.role)) {
      navigate("/login");
    } else {
      setUser(userInfo);
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("userInfo");
    navigate("/login");
  };

  // Close sidebar automatically when route changes (for mobile)
  useEffect(() => {
    setShowSidebar(false);
  }, [location]);

  if (!user) return null;

  const isActive = (path) => (location.pathname.includes(path) ? "active" : "");

  return (
    <div className="dashboard-container">
      {/* --- MOBILE OVERLAY --- */}
      <div
        className={`sidebar-overlay ${showSidebar ? "show" : ""}`}
        onClick={() => setShowSidebar(false)}
      ></div>

      {/* --- SIDEBAR --- */}
      <aside className={`sidebar ${showSidebar ? "show" : ""}`}>
        <div className="sidebar-header d-flex justify-content-between align-items-center">
          <div>
            <Link to="/" className="sidebar-brand">
              Karunasri ERP
            </Link>
            <div className="text-muted small mt-1">
              Branch: {user.branch || "Headquarters"}
            </div>
          </div>
          {/* Close Button for Mobile */}
          <button
            className="btn text-white d-lg-none"
            onClick={() => setShowSidebar(false)}
          >
            <FaTimes size={20} />
          </button>
        </div>

        <ul className="sidebar-menu">
          <li>
            <Link
              to="/dashboard"
              className={`menu-item ${
                location.pathname === "/dashboard" ? "active" : ""
              }`}
            >
              <FaTachometerAlt /> Overview
            </Link>
          </li>
          <li>
            <Link
              to="/dashboard/donations"
              className={`menu-item ${isActive("donations")}`}
            >
              <FaHandHoldingHeart /> Donations
            </Link>
          </li>
          <li>
            <Link
              to="/dashboard/students"
              className={`menu-item ${isActive("students")}`}
            >
              <FaUserGraduate /> Students
            </Link>
          </li>
          <li>
            <Link
              to="/dashboard/inventory"
              className={`menu-item ${isActive("inventory")}`}
            >
              <FaBoxOpen /> Inventory
            </Link>
          </li>
          <li>
            <Link
              to="/dashboard/finance"
              className={`menu-item ${isActive("finance")}`}
            >
              <FaRupeeSign /> Finance
            </Link>
          </li>
          <li>
            <Link
              to="/dashboard/events"
              className={`menu-item ${isActive("events")}`}
            >
              <FaCalendarAlt /> Events
            </Link>
          </li>
          <li>
            <Link
              to="/dashboard/daily-seva"
              className={`menu-item ${isActive("daily-seva")}`}
            >
              <FaCalendarAlt /> Today's Donors
            </Link>
          </li>
          <li>
            <Link
              to="/dashboard/members"
              className={`menu-item ${isActive("members")}`}
            >
              <FaUsers /> Members
            </Link>
          </li>
          <li>
            <Link
              to="/dashboard/reports"
              className={`menu-item ${isActive("reports")}`}
            >
              <FaChartBar /> Reports
            </Link>
          </li>

          {(user.role === "admin" || user.role === "employee") && (
            <li>
              <Link
                to="/dashboard/settings"
                className={`menu-item ${isActive("settings")}`}
              >
                <FaCogs /> Settings
              </Link>
            </li>
          )}
          {user.role === "admin" && (
            <li>
              <Link
                to="/dashboard/audit"
                className={`menu-item ${isActive("audit")}`}
              >
                <FaShieldAlt /> Audit Trail
              </Link>
            </li>
          )}

          <li style={{ marginTop: "auto" }}>
            <button
              onClick={handleLogout}
              className="menu-item"
              style={{
                background: "transparent",
                border: "none",
                width: "100%",
              }}
            >
              <FaSignOutAlt /> Logout
            </button>
          </li>
        </ul>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <div className="main-content">
        <header className="top-header">
          <div className="d-flex align-items-center gap-3">
            {/* --- HAMBURGER MENU (Visible only on Mobile) --- */}
            <button
              className="btn btn-light d-lg-none border"
              onClick={() => setShowSidebar(!showSidebar)}
            >
              <FaBars size={20} />
            </button>

            <h5 className="m-0 text-secondary d-none d-md-block">
              {location.pathname.split("/")[2]?.toUpperCase() || "DASHBOARD"}
            </h5>
          </div>

          <div className="d-flex align-items-center gap-3">
            <div className="text-end d-none d-sm-block">
              <div className="fw-bold text-maroon">{user.name}</div>
              <div
                style={{ fontSize: "0.8rem" }}
                className="text-muted text-uppercase"
              >
                {user.role}
              </div>
            </div>
            <div
              style={{
                width: "40px",
                height: "40px",
                background: "#581818",
                color: "white",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "bold",
              }}
            >
              {user.name.charAt(0)}
            </div>
          </div>
        </header>

        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
