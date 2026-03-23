/* eslint-disable react-hooks/set-state-in-effect */
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
  FaBars,
  FaTimes,
} from "react-icons/fa";
import "./DashboardLayout.css";

const DashboardLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [showSidebar, setShowSidebar] = useState(false);

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    const allowedRoles = [
      "admin",
      "employee",
      "president",
      "secretary",
      "treasurer",
      "warden",
      "accountant",
      "clerk",
      "kba_manager",
      "ksa_manager",
    ];

    // 1. Check Auth
    if (!userInfo || !allowedRoles.includes(userInfo.role)) {
      navigate("/login");
      return;
    }

    // 2. RESTRICTION: Redirect Managers away from "Overview"
    // If they land on "/dashboard", send them straight to "Donations"
    if (
      location.pathname === "/dashboard" &&
      ["kba_manager", "ksa_manager"].includes(userInfo.role)
    ) {
      navigate("/dashboard/donations");
    }

    setUser(userInfo);
  }, [navigate, location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem("userInfo");
    navigate("/login");
  };

  if (!user) return null;

  const isActive = (path) => (location.pathname.includes(path) ? "active" : "");

  // Helper to check if user is a Branch Manager
  const isBranchManager = ["kba_manager", "ksa_manager"].includes(user.role);

  return (
    <div className="dashboard-container">
      {/* Mobile Overlay */}
      <div
        className={`sidebar-overlay ${showSidebar ? "show" : ""}`}
        onClick={() => setShowSidebar(false)}
      ></div>

      {/* SIDEBAR */}
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
          <button
            className="btn text-white d-lg-none"
            onClick={() => setShowSidebar(false)}
          >
            <FaTimes size={20} />
          </button>
        </div>

        <ul className="sidebar-menu">
          {/* 1. OVERVIEW - HIDDEN FOR MANAGERS */}
          {!isBranchManager && (
            <li>
              <Link
                to="/dashboard"
                className={`menu-item ${location.pathname === "/dashboard" ? "active" : ""}`}
              >
                <FaTachometerAlt /> Overview
              </Link>
            </li>
          )}

          {/* 2. DONATIONS (Visible to All) */}
          <li>
            <Link
              to="/dashboard/donations"
              className={`menu-item ${isActive("donations")}`}
            >
              <FaHandHoldingHeart /> Donations
            </Link>
          </li>

          {/* 3. STUDENTS (Warden, Clerk, Admin, Committee) */}
          {[
            "admin",
            "president",
            "secretary",
            "treasurer",
            "warden",
            "clerk",
            "employee",
          ].includes(user.role) && (
            <li>
              <Link
                to="/dashboard/students"
                className={`menu-item ${isActive("students")}`}
              >
                <FaUserGraduate /> Students
              </Link>
            </li>
          )}

          {/* 4. INVENTORY (Visible to Managers + HQ Staff) */}
          {[
            "admin",
            "president",
            "secretary",
            "treasurer",
            "warden",
            "clerk",
            "employee",
            "kba_manager",
            "ksa_manager",
          ].includes(user.role) && (
            <li>
              <Link
                to="/dashboard/inventory"
                className={`menu-item ${isActive("inventory")}`}
              >
                <FaBoxOpen /> Inventory
              </Link>
            </li>
          )}

          {/* 5. FINANCE (Accountant, Admin, Committee, Managers) */}
          {[
            "admin",
            "president",
            "secretary",
            "treasurer",
            "accountant",
            "employee",
            "kba_manager",
            "ksa_manager",
          ].includes(user.role) && (
            <li>
              <Link
                to="/dashboard/finance"
                className={`menu-item ${isActive("finance")}`}
              >
                <FaRupeeSign /> Finance
              </Link>
            </li>
          )}

          {/* 6. EVENTS (Visible to All) */}
          <li>
            <Link
              to="/dashboard/events"
              className={`menu-item ${isActive("events")}`}
            >
              <FaCalendarAlt /> Skill Development
            </Link>
          </li>

          {/* 7. DAILY SEVA (Visible to All) */}
          <li>
            <Link
              to="/dashboard/daily-seva"
              className={`menu-item ${isActive("daily-seva")}`}
            >
              <FaCalendarAlt /> Today's Donors
            </Link>
          </li>

          {/* 8. MEMBERS (HQ Only) */}
          {[
            "admin",
            "president",
            "secretary",
            "treasurer",
            "clerk",
            "employee",
          ].includes(user.role) && (
            <li>
              <Link
                to="/dashboard/members"
                className={`menu-item ${isActive("members")}`}
              >
                <FaUsers /> Members
              </Link>
            </li>
          )}

          {/* 9. REPORTS (HQ Only - Managers don't need global reports) */}
          {[
            "admin",
            "president",
            "secretary",
            "treasurer",
            "accountant",
            "employee",
          ].includes(user.role) && (
            <li>
              <Link
                to="/dashboard/reports"
                className={`menu-item ${isActive("reports")}`}
              >
                <FaChartBar /> Reports
              </Link>
            </li>
          )}

          {/* 10. SETTINGS (Committee Only) */}
          {["admin", "president", "secretary", "treasurer"].includes(
            user.role,
          ) && (
            <li>
              <Link
                to="/dashboard/settings"
                className={`menu-item ${isActive("settings")}`}
              >
                <FaCogs /> Settings
              </Link>
            </li>
          )}

          {/* 11. AUDIT (Admin Only) */}
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

      <div className="main-content">
        <header className="top-header">
          <div className="d-flex align-items-center gap-3">
            <button
              className="btn btn-light d-lg-none border"
              onClick={() => setShowSidebar(!showSidebar)}
            >
              <FaBars size={20} />
            </button>
            <h5 className="m-0 text-secondary d-none d-md-block">
              {location.pathname === "/dashboard"
                ? "DASHBOARD"
                : location.pathname.split("/")[2]?.toUpperCase()}
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
